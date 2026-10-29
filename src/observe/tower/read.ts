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
  const file = join(import.meta.dirname, "source.json");
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
  if (process.env.TOWER_FIXTURE) return readFixture(process.env.TOWER_FIXTURE);
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
