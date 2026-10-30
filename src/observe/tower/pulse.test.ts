import { describe, expect, it } from "vitest";
import { compactDuration, projectPulse, workflowCadence } from "./pulse.ts";

describe("projectPulse", () => {
  it("quotes inactive when factory.json activation is inactive", () => {
    const pulse = projectPulse(
      {
        authorizedDispatches: 50,
        usedDispatches: 28,
        scope: { status: "active" },
        initiatives: { exec: { id: "exec", queue: "active", session: "continuation_due", dispatch: null } },
        packets: {},
      },
      "2026-10-30T14:00:00Z",
      "inactive",
    );
    expect(pulse.reason).toBe("inactive");
    expect(pulse.wakes).toEqual([]);
    expect(pulse.waits).toEqual([]);
    expect(pulse.remaining).toBe(22);
  });

  it("quotes analyst_open and the live lease when a wake_sa dispatch is current", () => {
    const pulse = projectPulse(
      {
        authorizedDispatches: 50,
        usedDispatches: 28,
        scope: { status: "active" },
        initiatives: { exec: { id: "exec", queue: "active", session: "continuation_due", dispatch: null } },
        packets: {
          "pkt-018": {
            id: "pkt-018",
            stage: "analysis",
            wake: "sa",
            revision: "rev-1",
            dispatch: { packetId: "pkt-018", revision: "rev-1", prHead: "abc", effect: "wake_sa", label: "factory-wake-sa" },
            lease: { workerId: "bc-1", role: "analyst", until: "2026-10-30T17:00:00Z", revision: "rev-1" },
          },
        },
      },
      "2026-10-30T14:00:00Z",
      "active",
    );
    expect(pulse.reason).toBe("analyst_open");
    expect(pulse.wakes).toEqual([]);
    expect(pulse.live).toEqual([{ pageId: "pkt-018", role: "analyst", until: "2026-10-30T17:00:00Z", workerId: "bc-1" }]);
    expect(pulse.waits).toEqual([
      {
        kind: "initiative",
        id: "exec",
        stage: "continuation_due",
        reason: "architect_due",
        next: "wake_architect",
        since: null,
      },
    ]);
  });

  it("quotes concurrency and unconfirmed when a dispatch has no lease", () => {
    const pulse = projectPulse(
      {
        authorizedDispatches: 50,
        usedDispatches: 28,
        scope: { status: "active" },
        initiatives: { exec: { id: "exec", queue: "active", session: "continuation_due", dispatch: null } },
        packets: {
          "pkt-003": {
            id: "pkt-003",
            stage: "change_specified",
            revision: "rev-3",
            dispatchedEngineerRevision: "rev-3",
            dispatch: {
              packetId: "pkt-003",
              revision: "rev-3",
              prHead: "def",
              effect: "wake_engineer",
              label: "factory-wake-engineer",
              issuedAt: "2026-10-30T13:42:00Z",
            },
          },
          "pkt-004": {
            id: "pkt-004",
            stage: "change_specified",
            revision: "rev-4",
          },
        },
      },
      "2026-10-30T14:00:00Z",
      "active",
    );
    expect(pulse.reason).toBe("architect_due");
    expect(pulse.live).toEqual([]);
    expect(pulse.wakes).toEqual([
      { kind: "initiative", id: "exec", effect: "wake_architect", reason: "architect_due" },
    ]);
    expect(pulse.waits).toEqual([
      {
        kind: "packet",
        id: "pkt-003",
        stage: "change_specified",
        reason: "unconfirmed",
        next: "wake_engineer",
        since: "2026-10-30T13:42:00Z",
      },
      {
        kind: "packet",
        id: "pkt-004",
        stage: "change_specified",
        reason: "concurrency",
        next: "wake_engineer",
        since: null,
      },
      {
        kind: "initiative",
        id: "exec",
        stage: "continuation_due",
        reason: "architect_due",
        next: "wake_architect",
        since: null,
      },
    ]);
    expect(compactDuration("2026-10-30T13:42:00Z", "2026-10-30T14:00:00Z")).toBe("18m");
  });
});

describe("workflowCadence", () => {
  it("is event when the workflow has no schedule", () => {
    expect(workflowCadence("on:\n  pull_request:\n  workflow_dispatch:\n")).toEqual({
      controllerCadence: "event",
      schedule: null,
    });
  });

  it("reads a cron when the workflow has one", () => {
    expect(workflowCadence('on:\n  schedule:\n    - cron: "*/15 * * * *"\n')).toEqual({
      controllerCadence: "scheduled",
      schedule: "*/15 * * * *",
    });
  });
});

describe("compactDuration", () => {
  it("formats remaining lease time", () => {
    expect(compactDuration("2026-10-30T14:00:00Z", "2026-10-30T17:44:00Z")).toBe("3h 44m");
  });
});
