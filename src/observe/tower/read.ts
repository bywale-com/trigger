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
import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
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
  if (env.TOWER_READ === "github" || env.VERCEL === "1") return "github";
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
  const headers: Record<string, string> = { "user-agent": "git/2.45 trigger-observe" };
  if (accept) headers.accept = accept;
  const token = githubToken();
  if (token) headers.authorization = `Bearer ${token}`;
  return fetch(url, { headers });
}

export async function resolveGithubSha(repo: string, ref: string): Promise<string> {
  const response = await githubFetch(`https://github.com/${repo}.git/info/refs?service=git-upload-pack`);
  if (!response.ok) throw new Error(`github refs ${response.status}`);
  const sha = shaFromUploadPack(await response.text(), ref);
  if (!sha) throw new Error(`github ref missing ${ref}`);
  return sha;
}

async function unpackGithubTree(repo: string, sha: string): Promise<string> {
  const dir = join(tmpdir(), "trigger-tower-github", sha);
  try {
    await access(join(dir, ".factory/state/ledger.json"));
    return dir;
  } catch {
    /* unpack */
  }
  await mkdir(dir, { recursive: true });
  const response = await githubFetch(`https://codeload.github.com/${repo}/tar.gz/${sha}`);
  if (!response.ok) throw new Error(`github archive ${response.status}`);
  const tgz = join(tmpdir(), `trigger-tower-${sha}.tgz`);
  await writeFile(tgz, Buffer.from(await response.arrayBuffer()));
  await new Promise<void>((resolve, reject) => {
    execFile("tar", ["-xzf", tgz, "-C", dir, "--strip-components=1"], (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
  return dir;
}

export async function readGitHubRemote(): Promise<Snapshot> {
  return exclusive(async () => {
    const ref = repoRef();
    const repo = githubRepo();
    const sha = await resolveGithubSha(repo, ref);
    const dir = await unpackGithubTree(repo, sha);
    return snapshotFromFiles(filesFromDirectory(dir, ref, sha));
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
  const initiatives: GatheredInitiative[] = [];
  for (const raw of Object.values(ledger.initiatives)) {
    const manifestText = await tree.file(`.factory/manifests/initiatives/${raw.id}.json`);
    const manifest = manifestText
      ? (JSON.parse(manifestText) as { founderDecisions?: string[] })
      : null;
    const specificationPath = `docs/factory/initiatives/${raw.id}/SPECIFICATION.md`;
    const journalDir = `docs/factory/initiatives/${raw.id}/journal`;
    const journalNames = (await tree.list(journalDir)) ?? [];
    const journals = [];
    for (const name of journalNames) {
      if (!name.toLowerCase().endsWith(".md")) continue;
      const path = `${journalDir}/${name}`;
      journals.push({ path, text: await tree.file(path) });
    }
    initiatives.push({
      raw,
      founderDecisions: manifest?.founderDecisions ?? [],
      specificationPath,
      specificationText: await tree.file(specificationPath),
      journals,
    });
  }
  const packets: GatheredPacket[] = [];
  for (const raw of Object.values(ledger.packets)) {
    const manifestText = await tree.file(`.factory/manifests/packets/${raw.id}.json`);
    const manifest = manifestText
      ? (JSON.parse(manifestText) as { title?: string; release?: string; systemsChange?: string })
      : null;
    const noteDir = `docs/factory/initiatives/${raw.initiativeId}/packets`;
    const noteNames = (await tree.list(noteDir)) ?? [];
    const noteName = noteNames.find((name) => name.replace(/\.md$/i, "").toLowerCase() === raw.id.toLowerCase());
    const intendedBehaviorPath = noteName ? `${noteDir}/${noteName}` : null;
    const note = intendedBehaviorPath ? await tree.file(intendedBehaviorPath) : null;
    const systemsChangePath = manifest?.systemsChange ?? null;
    packets.push({
      raw,
      title: manifest?.title ?? null,
      release: manifest?.release ?? null,
      intendedBehavior: note ? intendedSection(note) : null,
      intendedBehaviorPath,
      systemsChangePath,
      systemsChangeText: systemsChangePath ? await tree.file(systemsChangePath) : null,
    });
  }
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
