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
import { join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assemble,
  blobFileUrl,
  intendedSection,
  plateSection,
  rawFileUrl,
  readAtNow,
  type GatheredInitiative,
  type GatheredPacket,
  type LedgerInitiative,
  type LedgerPacket,
  type PacketPlateImage,
  type PacketPlates,
  type Snapshot,
} from "../snapshot.ts";
import { enrichSnapshot, githubGet } from "./github.ts";

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

async function probeJournal(files: TowerFiles, path: string): Promise<string[]> {
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
}

async function listGithubDirectory(repo: string, sha: string, path: string, files: TowerFiles): Promise<string[] | null> {
  const encoded = path
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  try {
    const response = await githubFetch(
      `https://api.github.com/repos/${repo}/contents/${encoded}?ref=${encodeURIComponent(sha)}`,
      "application/vnd.github+json",
    );
    if (response.status === 404) return [];
    if (!response.ok) {
      if (path.endsWith("/journal")) return probeJournal(files, path);
      return [];
    }
    const json: unknown = await response.json();
    if (!Array.isArray(json)) {
      if (path.endsWith("/journal")) return probeJournal(files, path);
      return [];
    }
    return json
      .map((row) => {
        if (!row || typeof row !== "object" || !("name" in row)) return "";
        return String((row as { name: string }).name);
      })
      .filter((name) => name && !name.startsWith("."))
      .sort();
  } catch {
    if (path.endsWith("/journal")) return probeJournal(files, path);
    return [];
  }
}

const IMAGE_EXT = /\.(png|webp|jpe?g|gif)$/i;

export function packetIdForms(id: string): string[] {
  const pkt = id.replace(/^PKT-/i, "pkt-");
  const PKT = pkt.replace(/^pkt-/, "PKT-");
  return [...new Set([id, pkt, PKT])];
}

export function plateFilenameMatches(name: string, packetId: string): boolean {
  const lower = name.toLowerCase();
  return packetIdForms(packetId).some((form) => lower.includes(form.toLowerCase()));
}

export function resolvePlateHref(noteDir: string, href: string, repo: string): string | null {
  const trimmed = href.trim().replace(/^<|>$/g, "").split(/[?#]/)[0];
  if (!trimmed || trimmed.startsWith("#")) return null;
  const fromGithub = pathFromGithubUrl(trimmed, repo);
  if (fromGithub) return fromGithub;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null;
  const joined = posix.normalize(posix.join(noteDir, trimmed));
  if (!joined || joined.startsWith("..") || posix.isAbsolute(joined)) return null;
  if (!joined.startsWith("docs/factory/")) return null;
  return joined;
}

function pathFromGithubUrl(href: string, repo: string): string | null {
  const escaped = repo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const raw = new RegExp(`^https://raw\\.githubusercontent\\.com/${escaped}/[^/]+/(.+)$`, "i");
  const blob = new RegExp(`^https://github\\.com/${escaped}/(?:blob|raw)/[^/]+/(.+)$`, "i");
  const match = raw.exec(href) ?? blob.exec(href);
  if (!match) return null;
  let path = match[1];
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep */
  }
  if (!path.startsWith("docs/factory/")) return null;
  return path;
}

export async function gatherPacketPlates(
  tree: TowerFiles,
  packet: LedgerPacket,
  noteDir: string,
  note: string | null,
  packetDirNames: string[] | null,
  repo: string,
): Promise<PacketPlates> {
  const parsed = plateSection(note ?? "");
  const dirs = [
    { path: `docs/factory/initiatives/${packet.initiativeId}/plates`, packetSpecific: false },
    { path: `docs/factory/initiatives/${packet.initiativeId}/packets/plates`, packetSpecific: false },
    ...packetIdForms(packet.id).map((id) => ({ path: `${noteDir}/${id}`, packetSpecific: true })),
  ];
  const listed = await Promise.all(dirs.map(async (dir) => ({ ...dir, names: (await tree.list(dir.path)) ?? [] })));
  const found = new Map<string, string>();
  const add = (path: string, alt: string) => {
    if (!IMAGE_EXT.test(path) || found.has(path)) return;
    found.set(path, alt || posix.basename(path).replace(/\.[^.]+$/, ""));
  };
  for (const image of parsed.images) {
    const path = resolvePlateHref(noteDir, image.href, repo);
    if (path) add(path, image.alt);
  }
  for (const dir of listed) {
    for (const name of dir.names) {
      if (!IMAGE_EXT.test(name)) continue;
      if (!dir.packetSpecific && !plateFilenameMatches(name, packet.id)) continue;
      add(`${dir.path}/${name}`, name.replace(/\.[^.]+$/, ""));
    }
  }
  for (const name of packetDirNames ?? []) {
    if (!IMAGE_EXT.test(name) || !plateFilenameMatches(name, packet.id)) continue;
    add(`${noteDir}/${name}`, name.replace(/\.[^.]+$/, ""));
  }
  const byPath = new Map<string, PacketPlateImage>();
  for (const [path, alt] of found) {
    byPath.set(path, {
      path,
      alt,
      imageUrl: rawFileUrl(repo, tree.sha, path),
      artifactUrl: blobFileUrl(repo, tree.sha, path),
    });
  }
  const ordered: PacketPlateImage[] = [];
  const seen = new Set<string>();
  for (const image of parsed.images) {
    const path = resolvePlateHref(noteDir, image.href, repo);
    const row = path ? byPath.get(path) : undefined;
    if (!row || seen.has(row.path)) continue;
    ordered.push({ ...row, alt: image.alt || row.alt });
    seen.add(row.path);
  }
  for (const row of [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path))) {
    if (seen.has(row.path)) continue;
    ordered.push(row);
  }
  return {
    buckets: parsed.buckets,
    bucketsAvailable: parsed.bucketsAvailable,
    images: ordered,
  };
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
    const listCache = new Map<string, Promise<string[] | null>>();
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
      const pending = listCache.get(path);
      if (pending) return pending;
      const request = listGithubDirectory(repo, sha, path, files);
      listCache.set(path, request);
      return request;
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
  const snapshot =
    mode === "fixture"
      ? await readFixture(process.env.TOWER_FIXTURE as string)
      : mode === "github"
        ? await readGitHubRemote()
        : await readGitRemote();
  return attachGithub(snapshot, mode === "fixture");
}

async function attachGithub(snapshot: Snapshot, fixture: boolean): Promise<Snapshot> {
  if (fixture) return enrichSnapshot(snapshot, githubGet, { enabled: false });
  const token = githubToken();
  return enrichSnapshot(snapshot, (url) => githubGet(url, token), { enabled: true });
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
      const plates = await gatherPacketPlates(tree, raw, noteDir, resolvedNote, listed, githubRepo(repoUrl()));
      return {
        raw,
        title: manifest?.title ?? null,
        release: manifest?.release ?? null,
        intendedBehavior: resolvedNote ? intendedSection(resolvedNote) : null,
        intendedBehaviorPath: resolvedPath,
        systemsChangePath,
        systemsChangeText: systemsChangePath ? await tree.file(systemsChangePath) : null,
        plates,
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
    repo: githubRepo(repoUrl()),
    initiatives,
    packets,
  });
}
