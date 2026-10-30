import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readFixture } from "../tower/read.ts";
import type { Page } from "../snapshot.ts";
import type { PulseWait } from "../tower/pulse.ts";
import { classifyActivity, getExecution, listInitiatives, projectFactory, projectNext, timingOf } from "./project.ts";

const fixture = join(import.meta.dirname, "../tower/testdata/9c45f19");

function wait(page: Page, reason: string): PulseWait {
  return { kind: page.type === "Packet" ? "packet" : "initiative", id: page.id, stage: page.stage, reason, next: "none", since: null };
}

describe("external read projection", () => {
  it("classifies the fixture without inventing a next run", async () => {
    const snapshot = await readFixture(fixture, "main");
    const factory = projectFactory(snapshot);
    expect(factory.sha).toBe(snapshot.sha);
    expect(factory.pulse.reason).toBe("inactive");
    expect(factory.timing.nextAt).toBeNull();
    expect(factory.timing.known).toBe(false);
    expect(factory.timing.basis).toContain("event");
    const initiatives = listInitiatives(snapshot);
    expect(initiatives.map((item) => item.id)).toEqual(["exec-identity", "launch-agent"]);
    expect(initiatives[0]?.activity).toBe("idle");
    expect(initiatives[1]?.activity).toBe("blocked");
    expect(initiatives[1]?.activityBasis).toBe("Factory production path is not the Launch Agent build.");
    const execution = getExecution(snapshot, "pkt-001-click-attribution");
    expect(execution?.activity).toBe("idle");
    expect(execution?.worker).toBeNull();
    expect(execution?.github.available).toBe(false);
    expect(execution?.github.unavailableReason).toBeTruthy();
    expect(execution?.lifecycle.map((step) => `${step.id}:${step.presence}`)).toContain("verified:yes");
    const next = projectNext(snapshot);
    expect(next.timing.nextAt).toBeNull();
    expect(next.eligible).toEqual([]);
    expect(next.basis).toContain("inactive");
    const scheduled = timingOf({ ...snapshot.pulse, controllerCadence: "scheduled", schedule: "*/5 * * * *" });
    expect(scheduled.nextAt).toBeNull();
    expect(scheduled.known).toBe(false);
    expect(scheduled.basis).toContain("*/5 * * * *");
  });

  it("distinguishes running, dispatched, waiting, interrupted, and unknown", async () => {
    const snapshot = await readFixture(fixture, "main");
    const packet = structuredClone(snapshot.pages.find((page) => page.type === "Packet"));
    if (!packet || packet.type !== "Packet") throw new Error("packet");
    const running = structuredClone(packet);
    running.lifecycle = running.lifecycle.map((step) =>
      step.id === "running" ? { ...step, presence: "yes", basis: "lease engineer until 2099-01-01T00:00:00.000Z" } : step,
    );
    expect(classifyActivity(running, []).activity).toBe("running");

    const dispatched = structuredClone(packet);
    dispatched.lifecycle = dispatched.lifecycle.map((step) => {
      if (step.id === "dispatched") return { ...step, presence: "yes", basis: "dispatch record" };
      if (step.id === "running") return { ...step, presence: "unknown", basis: "dispatch recorded; GitHub unavailable" };
      return step;
    });
    expect(classifyActivity(dispatched, [wait(dispatched, "unconfirmed")]).activity).toBe("dispatched");

    expect(classifyActivity(packet, [wait(packet, "engineering_busy")]).activity).toBe("waiting");

    const interrupted = structuredClone(packet);
    interrupted.stage = "returned_architect";
    expect(classifyActivity(interrupted, []).activity).toBe("interrupted");

    const unknown = structuredClone(packet);
    unknown.lifecycle = unknown.lifecycle.map((step) => {
      if (step.id === "running") return { ...step, presence: "unknown", basis: "no evidence" };
      if (step.id === "dispatched") return { ...step, presence: "no", basis: "no dispatch record" };
      return step;
    });
    expect(classifyActivity(unknown, [])).toEqual({ activity: "unknown", basis: "no evidence" });
  });
});
