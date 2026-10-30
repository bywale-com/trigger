/**
 * Read Tower’s ledger and manifests. Fill the snapshot.
 * Does not import the controller and does not call decide.
 *
 * The reference tree at 9c45f19 is a fixture for the approved plates.
 * The factory branch comes from TOWER_REF, or from source.json when that is unset.
 * The desk records the commit that branch resolved to. It does not pin a sha.
 */

import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { access, mkdir, readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assemble,
  intendedSection,
  readAtNow,
  type Gathered,
  type GatheredInitiative,
  type GatheredPacket,
  type LedgerInitiative,
  type LedgerPacket,
  type Snapshot,
} from "../snapshot.ts";

export type TowerFiles = {
  ref: string;
  sha: string;
  file(path: string): Promise<string | null>;
  list(path: string): Promise<string[] | null>;
};

type LedgerFile = {
  stateRevision: number;
  scope: Snapshot["scope"];
  initiatives: Record<string, LedgerInitiative>;
  packets: Record<string, LedgerPacket>;
};

const repoUrl = () => process.env.TOWER_REPO ?? "https://github.com/bywale-com/omcoda_tower.git";
const cloneDir = () => process.env.TOWER_CLONE ?? join(tmpdir(), "trigger-tower-read");

export function configuredTowerRef(): string {
  const file = fileURLToPath(new URL("./source.json", import.meta.url));
  const parsed = JSON.parse(readFileSync(file, "utf8")) as { ref?: string };
  const ref = parsed.ref?.trim();
  if (!ref) throw new Error("tower source ref missing");
  return ref;
}

export function resolveTowerRef(env: NodeJS.ProcessEnv = process.env): string {
  const fromEnv = env.TOWER_REF?.trim();
  if (fromEnv) return fromEnv;
  return configuredTowerRef();
}

export function githubRepo(url = repoUrl()): string {
  const match = /github\.com[:/]([^/]+)\/([^/.]+)/.exec(url);
  if (!match) throw new Error("tower repo is not GitHub");
  return `${match[1]}/${match[2]}`;
}

export function towerReadMode(env: NodeJS.ProcessEnv = process.env): "fixture" | "github" | "git" {
  if (env.TOWER_FIXTURE) return "fixture";
  if (env.TOWER_READ === "github") return "github";
  if (env.TOWER_READ === "git") return "git";
  if (env.VERCEL === "1") return "github";
  return "git";
}

export function usableGithubToken(value: string | undefined): string | undefined {
  const token = value?.trim();
  if (token && /^(gh[pousr]_|github_pat_)/.test(token)) return token;
  return undefined;
}

function githubToken(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return usableGithubToken(env.TOWER_GITHUB_TOKEN) || usableGithubToken(env.GITHUB_TOKEN);
}

const repoRef = () => resolveTowerRef();

let gate: Promise<unknown> = Promise.resolve();

function exclusive<T>(fn: () => Promise<T>): Promise<T> {
  const run = gate.then(fn, fn);
  gate = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function git(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("git", args, { maxBuffer: 20 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) reject(new Error((stderr || error.message).trim()));
      else resolve(stdout);
    });
  });
}

async function ensureClone(dir: string, repo: string, ref: string): Promise<void> {
  try {
    await access(join(dir, ".git"));
  } catch {
    await mkdir(dir, { recursive: true });
    await git(["clone", "--depth", "1", "--filter=blob:none", "--sparse", "--branch", ref, repo, dir]);
    await git(["-C", dir, "sparse-checkout", "set", ".factory", "docs/factory/initiatives"]);
  }
  await git(["-C", dir, "fetch", "--depth", "1", "origin", ref]);
  await git(["-C", dir, "reset", "--hard", "FETCH_HEAD"]);
}

export function filesFromDirectory(root: string, ref: string, sha: string): TowerFiles {
  return {
    ref,
    sha,
    async file(path) {
      try {
        return await readFile(join(root, path), "utf8");
      } catch {
        return null;
      }
    },
    async list(path) {
      try {
        const names = await readdir(join(root, path));
        return names.filter((name) => !name.startsWith(".")).sort();
      } catch {
        return null;
      }
    },
  };
}

export async function readFixture(root: string, ref = repoRef()): Promise<Snapshot> {
  const sha = (await readFile(join(root, "SHA"), "utf8")).trim();
  return snapshotFromFiles(filesFromDirectory(root, ref, sha));
}

async function readGitRemote(): Promise<Snapshot> {
  return exclusive(async () => {
    const dir = cloneDir();
    const ref = repoRef();
    await ensureClone(dir, repoUrl(), ref);
    const sha = (await git(["-C", dir, "rev-parse", "HEAD"])).trim();
    return snapshotFromFiles(filesFromDirectory(dir, ref, sha));
  });
}

function pktLines(body: string): string[] {
  const lines: string[] = [];
  let index = 0;
  while (index + 4 <= body.length) {
    const length = parseInt(body.slice(index, index + 4), 16);
    if (Number.isNaN(length)) break;
    if (length === 0) {
      index += 4;
      continue;
    }
    lines.push(body.slice(index + 4, index + length));
    index += length;
  }
  return lines;
}

export function shaFromUploadPack(body: string, ref: string): string | null {
  const want = `refs/heads/${ref}`;
  for (const line of pktLines(body)) {
    const payload = line.split("\0")[0]?.trim() ?? "";
    const match = /^([0-9a-f]{40}) (.+)$/.exec(payload);
    if (match?.[2] === want) return match[1];
  }
  return null;
}

async function githubFetch(url: string, accept?: string): Promise<Response> {
  const headers: Record<string, string> = { "user-agent": "trigger-observe" };
  if (accept) headers.accept = accept;
  const token = githubToken();
  if (token) headers.authorization = `Bearer ${token}`;
  return fetch(url, { headers, signal: AbortSignal.timeout(4_000) });
}

function shaFromText(text: string): string | null {
  const trimmed = text.trim();
  if (/^[0-9a-f]{40}$/.test(trimmed)) return trimmed;
  try {
    const parsed = JSON.parse(trimmed) as { sha?: string };
    if (parsed.sha && /^[0-9a-f]{40}$/.test(parsed.sha)) return parsed.sha;
  } catch {
    /* html */
  }
  return /commit\/([0-9a-f]{40})/.exec(text)?.[1] ?? null;
}

export async function resolveGithubSha(repo: string, ref: string): Promise<string> {
  const encoded = encodeURIComponent(ref);
  const api = await githubFetch(`https://api.github.com/repos/${repo}/commits/${encoded}`, "application/vnd.github.sha");
  if (api.ok) {
    const sha = shaFromText(await api.text());
    if (sha) return sha;
  }
  const page = await githubFetch(`https://github.com/${repo}/commits/${encoded}`);
  if (page.ok) {
    const sha = shaFromText(await page.text());
    if (sha) return sha;
  }
  const pack = await githubFetch(`https://github.com/${repo}.git/info/refs?service=git-upload-pack`);
  if (!pack.ok) throw new Error(`github refs ${pack.status}`);
  const sha = shaFromUploadPack(await pack.text(), ref);
  if (!sha) throw new Error(`github ref missing ${ref}`);
  return sha;
}

export async function readGitHubRemote(): Promise<Snapshot> {
  return exclusive(async () => {
    const ref = repoRef();
    const repo = githubRepo();
    const sha = await resolveGithubSha(repo, ref);
    const cache = new Map<string, Promise<string | null>>();
    const files: TowerFiles = {
      ref,
      sha,
      async file(path) {
        const pending = cache.get(path);
        if (pending) return pending;
        const request = githubFetch(`https://raw.githubusercontent.com/${repo}/${sha}/${path}`).then(async (response) => {
          if (response.status === 404) return null;
          if (!response.ok) throw new Error(`github file ${response.status} ${path}`);
          return response.text();
        });
        cache.set(path, request);
        return request;
      },
      async list(path) {
        if (!path.endsWith("/journal")) return [];
        const probed = await Promise.all(
          Array.from({ length: 8 }, (_, index) => {
            const name = `${String(index + 1).padStart(3, "0")}.md`;
            return files.file(`${path}/${name}`).then((text) => (text == null ? null : name));
          }),
        );
        const names: string[] = [];
        for (const name of probed) {
          if (!name) break;
          names.push(name);
        }
        return names;
      },
    };
    return snapshotFromFiles(files);
  });
}

export async function readTower(): Promise<Snapshot> {
  const flag = process.env.TOWER_FAIL_FLAG;
  if (flag) {
    try {
      const text = await readFile(flag, "utf8");
      if (text.trim() === "1") throw new Error("read failed");
    } catch (error) {
      if (error instanceof Error && error.message === "read failed") throw error;
    }
  }
  const mode = towerReadMode();
  if (mode === "fixture") return readFixture(process.env.TOWER_FIXTURE as string);
  if (mode === "github") return readGitHubRemote();
  return readGitRemote();
}

export async function snapshotFromFiles(tree: TowerFiles): Promise<Snapshot> {
  const ledgerText = await tree.file(".factory/state/ledger.json");
  if (!ledgerText) throw new Error("ledger missing");
  const ledger = JSON.parse(ledgerText) as LedgerFile;
  const factoryText = await tree.file(".factory/manifests/factory.json");
  const factory = factoryText ? (JSON.parse(factoryText) as { activation?: string; dispatch?: string }) : null;
  const initiatives = await Promise.all(
    Object.values(ledger.initiatives).map(async (raw) => {
      const specificationPath = `docs/factory/initiatives/${raw.id}/SPECIFICATION.md`;
      const journalDir = `docs/factory/initiatives/${raw.id}/journal`;
      const [manifestText, specificationText, journalNames] = await Promise.all([
        tree.file(`.factory/manifests/initiatives/${raw.id}.json`),
        tree.file(specificationPath),
        tree.list(journalDir),
      ]);
      const journals = await Promise.all(
        (journalNames ?? [])
          .filter((name) => name.toLowerCase().endsWith(".md"))
          .map(async (name) => {
            const path = `${journalDir}/${name}`;
            return { path, text: await tree.file(path) };
          }),
      );
      const manifest = manifestText ? (JSON.parse(manifestText) as { founderDecisions?: string[] }) : null;
      return {
        raw,
        founderDecisions: manifest?.founderDecisions ?? [],
        specificationPath,
        specificationText,
        journals,
      };
    }),
  );
  const packets = await Promise.all(
    Object.values(ledger.packets).map(async (raw) => {
      const noteDir = `docs/factory/initiatives/${raw.initiativeId}/packets`;
      const intendedBehaviorPath = `${noteDir}/${raw.id.replace(/^pkt-/, "PKT-")}.md`;
      const [manifestText, note, listed] = await Promise.all([
        tree.file(`.factory/manifests/packets/${raw.id}.json`),
        tree.file(intendedBehaviorPath),
        tree.list(noteDir),
      ]);
      const fallbackName = listed?.find((name) => name.replace(/\.md$/i, "").toLowerCase() === raw.id.toLowerCase());
      const resolvedPath = note || !fallbackName ? intendedBehaviorPath : `${noteDir}/${fallbackName}`;
      const resolvedNote = note ?? (fallbackName ? await tree.file(resolvedPath) : null);
      const manifest = manifestText
        ? (JSON.parse(manifestText) as { title?: string; release?: string; systemsChange?: string })
        : null;
      const systemsChangePath = manifest?.systemsChange ?? null;
      return {
        raw,
        title: manifest?.title ?? null,
        release: manifest?.release ?? null,
        intendedBehavior: resolvedNote ? intendedSection(resolvedNote) : null,
        intendedBehaviorPath: resolvedPath,
        systemsChangePath,
        systemsChangeText: systemsChangePath ? await tree.file(systemsChangePath) : null,
      };
    }),
  );
  return assemble({
    ref: tree.ref,
    sha: tree.sha,
    readAt: readAtNow(),
    stateRevision: ledger.stateRevision,
    scope: ledger.scope,
    activation: factory?.activation ?? null,
    dispatchPolicy: factory?.dispatch ?? null,
    initiatives,
    packets,
  });
}
