import { describe, expect, it } from "vitest";
import { assemble, emptyGithub, type Gathered, type LedgerPacket } from "../snapshot.ts";
import { enrichSnapshot, namedPullNumbers, namedShas, type GithubGet } from "./github.ts";

const packet: LedgerPacket = {
  id: "pkt-002-open-ask-cursor",
  initiativeId: "exec-identity",
  stage: "candidate",
  wake: "sa",
  hold: false,
  blockerId: null,
  lease: null,
  candidateSha: "3246a074efecd8adb98e4ca232d443b90821173f",
  verifiedSha: null,
  integratedSha: null,
  reconciliationId: null,
  dispatch: {
    packetId: "pkt-002-open-ask-cursor",
    revision: "rev-1",
    prHead: "f06148b747f212ef49678b226e3650cc353e598f",
    effect: "wake_engineer",
    label: "factory-wake-engineer",
  },
  dispatchHistory: [],
  execution: null,
};

const gathered: Gathered = {
  ref: "cursor/factory-agents-scope-33ee",
  sha: "f3ec0ca6de2d918bdefe4790455c4f91d48b6276",
  readAt: "2026-10-30T10:00:00Z",
  stateRevision: 41,
  scope: { id: "agents-and-automations", status: "active", modules: [], founderDecision: null, blockReason: null },
  activation: "inactive",
  dispatchPolicy: "forbidden",
  repo: "bywale-com/omcoda_tower",
  initiatives: [
    {
      raw: {
        id: "exec-identity",
        module: "Agents and Automations",
        capability: "Which execution a result belongs to",
        entry: "",
        obligation: "Specify",
        queue: "active",
        priority: 10,
        dependsOn: [],
        inheritedSpecifications: [],
        investigation: "investigating",
        session: "running",
        coverageComplete: null,
        outstanding: [],
        packetIds: ["pkt-002-open-ask-cursor"],
        blockedReason: null,
        updatedAt: null,
        dispatch: {
          packetId: "exec-identity",
          revision: "rev-1",
          prHead: "65531837f45c725736b37155198722d5c510808b",
          effect: "wake_architect",
          label: "factory-wake-architect",
        },
      },
      founderDecisions: [],
      specificationPath: "docs/factory/initiatives/exec-identity/SPECIFICATION.md",
      specificationText: "spec",
      journals: [],
    },
  ],
  packets: [
    {
      raw: packet,
      title: "Opening an ask",
      release: "released",
      intendedBehavior: "Open Ask",
      intendedBehaviorPath: "docs/factory/initiatives/exec-identity/packets/PKT-002-open-ask-cursor.md",
      systemsChangePath: null,
      systemsChangeText: null,
    },
  ],
};

describe("github evidence", () => {
  it("collects ledger SHAs and reconciliation pull numbers only", () => {
    const snapshot = assemble(gathered);
    expect(namedShas(snapshot.pages)).toContain("3246a074efecd8adb98e4ca232d443b90821173f");
    expect(namedShas(snapshot.pages)).toContain("f06148b747f212ef49678b226e3650cc353e598f");
    expect(namedPullNumbers(snapshot.pages)).toEqual([]);
    const accepted = assemble({
      ...gathered,
      packets: [
        {
          ...gathered.packets[0],
          raw: {
            ...packet,
            stage: "accepted",
            verifiedSha: packet.candidateSha,
            integratedSha: "9c45f19fa1ac9d909247d6be83c9263273b1bcbb",
            reconciliationId: "pr-136-9c45f19fa1ac9d909247d6be83c9263273b1bcbb",
          },
        },
      ],
    });
    expect(namedPullNumbers(accepted.pages)).toEqual([136]);
  });

  it("attaches the pull GitHub associated with a named SHA", async () => {
    const snapshot = assemble(gathered);
    const get: GithubGet = async (url) => {
      if (url.includes("/pulls?head=")) {
        return {
          status: 200,
          json: [
            {
              number: 137,
              html_url: "https://github.com/bywale-com/omcoda_tower/pull/137",
              state: "open",
              merged: false,
              title: "factory",
              head: { ref: "cursor/factory-agents-scope-33ee", sha: snapshot.sha },
            },
          ],
        };
      }
      if (url.includes("/commits/") && url.endsWith("/pulls")) {
        return {
          status: 200,
          json: [
            {
              number: 137,
              html_url: "https://github.com/bywale-com/omcoda_tower/pull/137",
              state: "open",
              merged: false,
              head: { ref: "cursor/factory-agents-scope-33ee", sha: snapshot.sha },
            },
          ],
        };
      }
      if (url.endsWith("/pulls/137")) {
        return {
          status: 200,
          json: {
            number: 137,
            html_url: "https://github.com/bywale-com/omcoda_tower/pull/137",
            state: "open",
            merged: false,
            title: "factory",
            head: { ref: "cursor/factory-agents-scope-33ee", sha: snapshot.sha },
          },
        };
      }
      if (url.includes("/pulls/137/commits")) {
        return {
          status: 200,
          json: [{ sha: snapshot.sha, html_url: `https://github.com/bywale-com/omcoda_tower/commit/${snapshot.sha}`, commit: { message: "factory ledger 41" } }],
        };
      }
      if (url.includes("/check-runs")) {
        return { status: 200, json: { check_runs: [{ name: "factory-check", html_url: "https://github.com/bywale-com/omcoda_tower/actions/runs/1", status: "completed", conclusion: "success" }] } };
      }
      if (url.includes("/deployments?")) {
        return { status: 200, json: [{ id: 1, environment: "Preview", sha: snapshot.sha }] };
      }
      if (url.includes("/deployments/1/statuses")) {
        return {
          status: 200,
          json: [{ state: "success", environment: "Preview", environment_url: "https://omcoda-tower-preview.vercel.app" }],
        };
      }
      return { status: 404, json: {} };
    };
    const enriched = await enrichSnapshot(snapshot, get, { enabled: true });
    expect(enriched.factoryPull?.number).toBe(137);
    const row = enriched.pages.find((page) => page.id === "pkt-002-open-ask-cursor");
    if (!row || row.type !== "Packet") throw new Error("packet");
    expect(row.github.available).toBe(true);
    expect(row.github.workingBranch).toBe("cursor/factory-agents-scope-33ee");
    expect(row.github.pull?.number).toBe(137);
    expect(row.github.preview?.url).toBe("https://omcoda-tower-preview.vercel.app");
    expect(row.lifecycle.find((step) => step.id === "dispatched")?.presence).toBe("yes");
    expect(row.lifecycle.find((step) => step.id === "running")?.presence).toBe("unknown");
    expect(row.lifecycle.find((step) => step.id === "committed")?.presence).toBe("yes");
    expect(row.lifecycle.find((step) => step.id === "verified")?.presence).toBe("no");
  });

  it("marks GitHub unavailable on 403 and keeps the ledger snapshot", async () => {
    const snapshot = assemble(gathered);
    const get: GithubGet = async () => ({ status: 403, json: { message: "rate limit" } });
    const enriched = await enrichSnapshot(snapshot, get, { enabled: true });
    expect(enriched.pages).toHaveLength(snapshot.pages.length);
    expect(enriched.pages[1]?.github.available).toBe(false);
    expect(enriched.pages[1]?.github.unavailableReason).toBe("github unavailable");
    if (enriched.pages[1]?.type !== "Packet") throw new Error("packet");
    expect(enriched.pages[1].candidateSha).toBe(packet.candidateSha);
  });

  it("skips GitHub in fixture mode", async () => {
    const snapshot = assemble(gathered);
    snapshot.pages[1]!.github = emptyGithub("not requested");
    const enriched = await enrichSnapshot(snapshot, async () => {
      throw new Error("must not fetch");
    }, { enabled: false });
    expect(enriched.pages[1]?.github.available).toBe(false);
    expect(enriched.pages[1]?.github.unavailableReason).toBe("fixture");
  });
});
