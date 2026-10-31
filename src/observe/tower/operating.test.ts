import { describe, expect, it } from "vitest";
import {
  assertOperatingChoice,
  chooseFactorySource,
  dispatchRunsUrl,
  ledgerRevisionFromMessage,
  observedFactory,
  operatingPointerUrl,
  pointerFromContents,
  resolveFactoryChoice,
  resolveFactoryRef,
  safeFactoryRef,
} from "./operating.ts";

const repo = "bywale-com/omcoda_tower";
const configured = "cursor/factory-agents-scope-33ee";
const operating = "cursor/execution-architecture-74f7";

function run(ref: string, revision: number, extra: Record<string, unknown> = {}) {
  return {
    conclusion: "success",
    head_branch: ref,
    head_sha: `${revision.toString(16).padStart(40, "a")}`,
    head_repository: { full_name: repo },
    head_commit: { message: `factory ledger ${revision}` },
    ...extra,
  };
}

describe("operating factory source", () => {
  it("accepts a branch name and rejects a traversal or a sha pin", () => {
    expect(safeFactoryRef(operating)).toBe(operating);
    expect(safeFactoryRef(" main ")).toBe("main");
    expect(safeFactoryRef("../main")).toBeNull();
    expect(safeFactoryRef("cursor//factory")).toBeNull();
    expect(safeFactoryRef("refs/heads/main")).toBeNull();
    expect(ledgerRevisionFromMessage("factory ledger 160\n\nbody")).toBe(160);
    expect(ledgerRevisionFromMessage("Record the PKT-013 firm-provision check SHA.")).toBeNull();
  });

  it("follows the dispatch that advanced the ledger furthest", () => {
    const observed = observedFactory(
      {
        workflow_runs: [
          run(configured, 122),
          run(operating, 160),
          run("cursor/other-74f7", 90, { head_commit: { message: "docs only" } }),
          run("cursor/fork-branch", 999, { head_repository: { full_name: "other/omcoda_tower" } }),
        ],
      },
      repo,
    );
    expect(observed).toEqual({ ref: operating, stateRevision: 160 });
    expect(chooseFactorySource({ configured, pointer: null, observed })).toBe(operating);
  });

  it("keeps the published operating ref ahead of a higher ledger revision", () => {
    const pointer = pointerFromContents({
      encoding: "base64",
      content: Buffer.from(JSON.stringify({ ref: "cursor/published-branch", stateRevision: 170 }), "utf8").toString("base64"),
    });
    expect(pointer).toEqual({ ref: "cursor/published-branch", stateRevision: 170 });
    expect(
      chooseFactorySource({
        configured,
        pointer,
        observed: { ref: operating, stateRevision: 160 },
      }),
    ).toBe("cursor/published-branch");
    expect(
      chooseFactorySource({
        configured,
        pointer: { ref: configured, stateRevision: 122 },
        observed: { ref: operating, stateRevision: 160 },
      }),
    ).toBe(configured);
    expect(pointerFromContents({ ref: operating })).toEqual({ ref: operating, stateRevision: null });
    expect(
      chooseFactorySource({
        configured,
        pointer: { ref: operating, stateRevision: null },
        observed: { ref: configured, stateRevision: 999 },
      }),
    ).toBe(operating);
    expect(
      chooseFactorySource({
        configured,
        pointer: { ref: "cursor/published-branch", stateRevision: 160 },
        observed: { ref: operating, stateRevision: 160 },
      }),
    ).toBe("cursor/published-branch");
  });

  it("falls back to the configured branch when GitHub has no factory signal", async () => {
    expect(chooseFactorySource({ configured, pointer: null, observed: null })).toBe(configured);
    expect(pointerFromContents({ encoding: "base64", content: Buffer.from("{", "utf8").toString("base64") })).toBeNull();
    const urls: string[] = [];
    const ref = await resolveFactoryRef({
      configured,
      repo,
      get: async (url) => {
        urls.push(url);
        if (url === operatingPointerUrl(repo)) return { status: 404, json: { message: "Not Found" } };
        return { status: 200, json: { workflow_runs: [run(operating, 160), run(configured, 122)] } };
      },
    });
    expect(ref).toBe(operating);
    expect(urls).toEqual([operatingPointerUrl(repo), dispatchRunsUrl(repo)]);
    const failed = await resolveFactoryRef({
      configured,
      repo,
      get: async () => {
        throw new Error("github unavailable");
      },
    });
    expect(failed).toBe(configured);
    const missing = await resolveFactoryChoice({
      configured,
      repo,
      get: async () => ({ status: 404, json: { message: "Not Found" } }),
    });
    expect(missing).toEqual({ ref: configured, signaled: false });
    expect(() => assertOperatingChoice({ VERCEL_ENV: "production" }, missing)).toThrow(/operating factory unresolved/);
    expect(assertOperatingChoice({}, missing)).toBe(configured);
    expect(assertOperatingChoice({ VERCEL_ENV: "production" }, { ref: operating, signaled: true })).toBe(operating);
  });
});
