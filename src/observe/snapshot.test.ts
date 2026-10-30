import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assemble,
  edges,
  parseReconciliationId,
  readAtNow,
  stageColor,
  stageLabel,
  visiblePages,
  type Gathered,
  type Page,
} from "./snapshot.ts";
import { readFixture } from "./tower/read.ts";

const fixture = join(import.meta.dirname, "tower/testdata/9c45f19");

describe("revision 1 fixture", () => {
  it("builds the three ledger pages and no others", async () => {
    const snapshot = await readFixture(fixture, "main");
    expect(snapshot.sha).toBe("9c45f19fa1ac9d909247d6be83c9263273b1bcbb");
    expect(snapshot.ref).toBe("main");
    expect(snapshot.stateRevision).toBe(1);
    expect(snapshot.scope.status).toBe("inactive");
    expect(snapshot.scope.modules).toEqual([]);
    expect(snapshot.activation).toBe("inactive");
    expect(snapshot.dispatchPolicy).toBe("forbidden");
    expect(snapshot.pages.map((page) => page.id)).toEqual([
      "exec-identity",
      "pkt-001-click-attribution",
      "launch-agent",
    ]);

    const [exec, packet, launch] = snapshot.pages;
    expect(exec.type).toBe("Initiative");
    expect(exec.name).toBe("Which execution a result belongs to");
    expect(exec.module).toBe("Agents and Automations");
    expect(stageLabel(exec.stage)).toBe("Investigating");
    expect(stageColor(exec.stage)).toBe("processing");
    expect(exec.execution).toBe("Idle · no dispatch");
    expect(exec.evidence).toBe("1 verified · not integrated");
    expect(exec.evidenceError).toBe(false);
    expect(exec.inside).toBeNull();
    expect(exec.dependsOn).toEqual([]);
    expect(exec.updatedAt).toBeNull();
    if (exec.type !== "Initiative") throw new Error("exec");
    expect(exec.obligation).toBe(
      "Specify and, where a packet is released, implement the identity rules already locked on PR 135.",
    );
    expect(exec.obligation).not.toContain("Do not complete neighboring modules.");
    expect(exec.outstanding).toEqual(["Claims 4, 6, 7, and 8 have no packets."]);
    expect(exec.specificationText).toContain(
      "Claim 3: a completion belongs to the pursuit that asked for it. The email-click consequence is PKT-001, still on hold.",
    );
    expect(exec.journals[0]?.text).toContain("2026-10-29");
    expect(exec.dependedOnBy).toEqual(["launch-agent"]);
    expect(exec.founderDecisions.length).toBe(4);
    expect(exec.dispatch).toBeNull();

    expect(packet.type).toBe("Packet");
    expect(packet.name).toBe("An email click advances the enrollment stamped on the message");
    expect(stageLabel(packet.stage)).toBe("Verified");
    expect(stageColor(packet.stage)).toBe("success");
    expect(packet.execution).toBe("Manual · not live");
    expect(packet.evidence).toBe("2 checks · no SHA");
    expect(packet.inside).toBe("exec-identity");
    expect(packet.dependsOn).toEqual([]);
    if (packet.type !== "Packet") throw new Error("packet");
    expect(packet.wake).toBe("hold");
    expect(packet.hold).toBe(false);
    expect(packet.release).toBe("draft");
    expect(packet.releaseEligible).toBe(false);
    expect(packet.blockerId).toBeNull();
    expect(packet.lease).toBeNull();
    expect(packet.integratedSha).toBeNull();
    expect(packet.dispatch).toBeNull();
    expect(packet.intendedBehavior).toContain(
      "An email click advances the enrollment named on the outbound message.",
    );
    expect(packet.systemsChangeText).toContain("This file is the systems-change packet.");
    expect(packet.checks.map((check) => check.runId)).toEqual(["40873984441", "40873984426"]);
    expect(packet.lifecycle.map((step) => `${step.id}:${step.presence}`)).toEqual([
      "dispatched:no",
      "running:no",
      "committed:yes",
      "verified:yes",
      "integrated:no",
      "accepted:no",
    ]);
    expect(packet.github.available).toBe(false);
    expect(packet.github.checks.map((check) => check.runId)).toEqual(["40873984441", "40873984426"]);
    expect(packet.github.checks[0]?.url).toContain("/actions/runs/40873984441");
    expect(packet.dispatchHistory).toEqual([]);

    expect(launch.execution).toBe("Idle · no dispatch");
    expect(launch.evidence).toBe("Blocked reason");
    expect(launch.evidenceError).toBe(true);
    expect(stageLabel(launch.stage)).toBe("Discovered");
    expect(stageColor(launch.stage)).toBe("default");
    expect(launch.dependsOn).toEqual(["exec-identity"]);
    if (launch.type !== "Initiative") throw new Error("launch");
    expect(launch.blockedReason).toBe("Factory production path is not the Launch Agent build.");
    expect(launch.blockedReason).not.toContain("not authorized");
    expect(launch.obligation).toBe("Not opened. Launch Agent is not the controller pilot.");
    expect(launch.packetIds).toEqual([]);

    const relation = edges(snapshot.pages);
    expect(relation.contains).toEqual([{ from: "exec-identity", to: "pkt-001-click-attribution" }]);
    expect(relation.depends).toEqual([{ from: "launch-agent", to: "exec-identity" }]);

    const initiatives = visiblePages(snapshot.pages, [{ field: "Type", value: "Initiative" }]);
    expect(initiatives.map((page) => page.id)).toEqual(["exec-identity", "launch-agent"]);
    expect(edges(initiatives).contains).toEqual([]);
    expect(edges(initiatives).depends).toEqual([{ from: "launch-agent", to: "exec-identity" }]);
  });

  it("does not rewrite the ledger fixture for a running dispatch", async () => {
    const before = readFileSync(join(fixture, ".factory/state/ledger.json"), "utf8");
    const snapshot = await readFixture(fixture, "main");
    const gathered = gatheredFrom(snapshot, snapshot.readAt);
    const exec = gathered.initiatives.find((item) => item.raw.id === "exec-identity");
    if (!exec) throw new Error("exec");
    exec.raw.session = "running";
    exec.raw.dispatch = {
      packetId: "exec-identity",
      revision: "rev-0",
      prHead: "fixture",
      effect: "wake_architect",
      label: "factory-wake-architect",
    };
    const running = assemble(gathered);
    expect(running.pages[0].execution).toBe("Architect · running");
    if (running.pages[0].type !== "Initiative") throw new Error("exec");
    expect(running.pages[0].dispatch?.effect).toBe("wake_architect");
    expect(running.pages[0].dispatch?.label).toBe("factory-wake-architect");
    expect(readFileSync(join(fixture, ".factory/state/ledger.json"), "utf8")).toBe(before);
    expect(snapshot.pages[0].execution).toBe("Idle · no dispatch");
  });
});

describe("display rules", () => {
  it("parses an explicit reconciliation id and ignores a branch-shaped string", () => {
    expect(parseReconciliationId("pr-136-9c45f19fa1ac9d909247d6be83c9263273b1bcbb")).toEqual({
      pr: 136,
      sha: "9c45f19fa1ac9d909247d6be83c9263273b1bcbb",
    });
    expect(parseReconciliationId("cursor/pkt-002-open-ask-cursor")).toBeNull();
    expect(parseReconciliationId(null)).toBeNull();
  });

  it("formats the read clock without fractional seconds", () => {
    expect(readAtNow(new Date("2026-10-29T13:00:00.123Z"))).toBe("2026-10-29T13:00:00Z");
  });

  it("does not treat a dispatch without a lease as running", async () => {
    const snapshot = await readFixture(fixture, "main");
    const gathered = gatheredFrom(snapshot, snapshot.readAt);
    const raw = gathered.packets[0].raw;
    raw.dispatch = {
      packetId: raw.id,
      revision: "rev-1",
      prHead: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      effect: "wake_engineer",
      label: "factory-wake-engineer",
    };
    const next = assemble(gathered);
    const packet = next.pages.find((page) => page.id === "pkt-001-click-attribution");
    if (!packet || packet.type !== "Packet") throw new Error("packet");
    expect(packet.lifecycle.find((step) => step.id === "dispatched")?.presence).toBe("yes");
    expect(packet.lifecycle.find((step) => step.id === "running")?.presence).toBe("unknown");
  });

  it("lets an open lease outrank a manual history line", async () => {
    const snapshot = await readFixture(fixture, "main");
    const packet = snapshot.pages.find((page) => page.id === "pkt-001-click-attribution");
    if (!packet || packet.type !== "Packet") throw new Error("packet");
    const gathered = gatheredFrom(snapshot, "2026-10-29T12:00:00Z");
    const raw = gathered.packets[0].raw;
    raw.lease = { workerId: "bc-e", role: "engineer", until: "2026-10-29T13:00:00Z", revision: "rev-1" };
    const next = assemble(gathered);
    expect(next.pages[1].execution).toBe("Engineer · running");
    if (next.pages[1].type !== "Packet") throw new Error("packet");
    expect(next.pages[1].lifecycle.find((step) => step.id === "running")?.presence).toBe("yes");
  });
});

function gatheredFrom(snapshot: { pages: Page[]; ref: string; sha: string; stateRevision: number; scope: Gathered["scope"]; activation: string | null; dispatchPolicy: string | null; repo?: string }, readAt: string): Gathered {
  const initiatives = snapshot.pages.filter((page) => page.type === "Initiative");
  const packets = snapshot.pages.filter((page) => page.type === "Packet");
  return {
    ref: snapshot.ref,
    sha: snapshot.sha,
    readAt,
    stateRevision: snapshot.stateRevision,
    scope: snapshot.scope,
    activation: snapshot.activation,
    dispatchPolicy: snapshot.dispatchPolicy,
    repo: snapshot.repo ?? "bywale-com/omcoda_tower",
    initiatives: initiatives.map((page) => {
      if (page.type !== "Initiative") throw new Error("init");
      return {
        raw: {
          id: page.id,
          module: page.module,
          capability: page.name,
          entry: page.entry,
          obligation: page.obligation,
          queue: page.queue,
          priority: page.priority,
          dependsOn: page.dependsOn,
          inheritedSpecifications: page.inheritedSpecifications,
          investigation: page.stage,
          session: page.session,
          coverageComplete: page.coverageComplete,
          outstanding: page.outstanding,
          packetIds: page.packetIds,
          blockedReason: page.blockedReason,
          updatedAt: page.updatedAt,
          dispatch: page.dispatch,
        },
        founderDecisions: page.founderDecisions,
        specificationPath: page.specificationPath,
        specificationText: page.specificationText,
        journals: page.journals,
      };
    }),
    packets: packets.map((page) => {
      if (page.type !== "Packet") throw new Error("packet");
      return {
        raw: {
          id: page.id,
          initiativeId: page.initiativeId,
          stage: page.stage,
          wake: page.wake,
          hold: page.hold,
          blockerId: page.blockerId,
          lease: page.lease,
          releaseEligible: page.releaseEligible,
          candidateSha: page.candidateSha,
          verifiedSha: page.verifiedSha,
          integratedSha: page.integratedSha,
          reconciliationId: page.reconciliationId,
          dispatch: page.dispatch,
          dispatchHistory: page.dispatchHistory,
          execution: page.executionMode ? { mode: page.executionMode, checks: page.checks } : null,
        },
        title: page.name,
        release: page.release,
        intendedBehavior: page.intendedBehavior,
        intendedBehaviorPath: page.intendedBehaviorPath,
        systemsChangePath: page.systemsChangePath,
        systemsChangeText: page.systemsChangeText,
      };
    }),
  };
}
