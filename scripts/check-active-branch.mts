/**
 * Read the configured factory branch and compare the snapshot to that commit.
 * TOWER_REF overrides source.json. TOWER_FIXTURE is ignored here.
 */
import { execFile } from "node:child_process";
import { configuredTowerRef, readTower } from "../src/observe/tower/read.ts";

function git(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("git", args, (error, stdout, stderr) => {
      if (error) reject(new Error((stderr || error.message).trim()));
      else resolve(stdout.trim());
    });
  });
}

const ref = process.env.TOWER_REF?.trim() || configuredTowerRef();
const remote = await git(["ls-remote", "https://github.com/bywale-com/omcoda_tower.git", `refs/heads/${ref}`]);
const remoteSha = remote.split(/\s+/)[0];
if (!remoteSha) throw new Error(`no remote head for ${ref}`);

delete process.env.TOWER_FIXTURE;
const snapshot = await readTower();
const failures: string[] = [];
const check = (name: string, ok: boolean, detail = "") => {
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
  console.log(`${ok ? "ok" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

check("ref", snapshot.ref === ref, snapshot.ref);
check("sha", snapshot.sha === remoteSha, snapshot.sha);
check("scope", snapshot.scope.status.length > 0, snapshot.scope.status);
check("revision", Number.isInteger(snapshot.stateRevision), String(snapshot.stateRevision));
const ids = snapshot.pages.map((page) => page.id);
check("pages", ids.length > 0, ids.join(","));
check("initiatives", snapshot.pages.some((page) => page.type === "Initiative"));
check("packets", snapshot.pages.some((page) => page.type === "Packet"));
for (const page of snapshot.pages) {
  console.log(
    [
      page.type,
      page.id,
      page.stage,
      page.execution,
      page.evidence,
      page.inside ?? "—",
      page.dependsOn.join(",") || "—",
    ].join(" | "),
  );
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
