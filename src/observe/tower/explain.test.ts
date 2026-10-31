import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { explainFactory, type ExplainLedger } from "./explain.ts";

const ledger = JSON.parse(readFileSync(join(import.meta.dirname, "testdata/ledger-193-explain.json"), "utf8")) as ExplainLedger;
const now = "2026-10-31T15:07:40.000Z";

function packet(id: string) {
  const row = explainFactory(ledger, now).packets.find((item) => item.id === id);
  if (!row) throw new Error(id);
  return row;
}

describe("explainFactory on ledger 193", () => {
  const explained = explainFactory(ledger, now);

  it("prints the dispatch headline", () => {
    expect(explained.summary.headline).toBe(
      "Factory operating · 0 Engineers active · 0 packets awaiting verification · 8 releases awaiting your review",
    );
    expect(explained.summary.engineersRunning).toBe(0);
    expect(explained.summary.awaitingVerification).toBe(0);
    expect(explained.summary.founderInbox.map((release) => release.prNumber)).toEqual([141, 142, 143, 144, 145, 146, 147, 148]);
    expect(explained.summary.withheldLanes).toEqual(["architect"]);
  });

  it("keeps an open release on the founder", () => {
    const row = packet("pkt-002-open-ask-cursor");
    expect(row.why).toBe("The dependency set is verified and the pull request is open.");
    expect(row.next).toBe("Merge release pull request 141.");
    expect(row.who).toBe("founder");
    expect(row.situation).toBe("external");
  });

  it("holds a verified packet on the packets still short of verified", () => {
    const row = packet("pkt-015-halt-enroll-firm");
    expect(row.why).toBe("Waiting on pkt-017-tick-send-halt, pkt-019-first-step-send-denied.");
    expect(row.next).toBe("pkt-017-tick-send-halt and pkt-019-first-step-send-denied reach verified.");
    expect(row.situation).toBe("held");
  });

  it("leaves an analyst dispatch that already ran as intervention", () => {
    const row = packet("pkt-009-eligibility-writes");
    expect(row.happening).toBe("Released. The Analyst dispatch for rev-1 is recorded as ran.");
    expect(row.why).toBe("No sign_change is recorded, and this revision is not dispatched again.");
    expect(row.next).toBe("Unknown");
    expect(row.situation).toBe("intervention");
    expect(explained.summary.intervention).toEqual([
      "pkt-009-eligibility-writes",
      "pkt-011-halt-records-writes",
      "pkt-012-consent-opt-out-writes",
      "pkt-014-empty-firing-audience",
      "pkt-017-tick-send-halt",
      "pkt-019-first-step-send-denied",
    ]);
  });

  it("records the elapsed lease as intervention with next Unknown", () => {
    const row = packet("pkt-019-first-step-send-denied");
    expect(row.happening).toBe("Engineering. No live lease and no classified failure.");
    expect(row.why).toBe("An engineer wake requires change_specified. A repair wake requires a classified failure.");
    expect(row.next).toBe("Unknown");
    expect(row.who).toBe("unknown");
    expect(row.situation).toBe("intervention");
    const execution = explained.executions.find((item) => item.id === "dsp-172-engineer-pkt-018-send-denied-engagement");
    expect(execution?.phase).toBe("interrupted");
    expect(execution?.why).toBe("lease_expired");
    expect(execution?.alert).toBe(false);
    expect(execution?.historical).toBe(false);
  });

  it("holds the architect session because the lane is off", () => {
    const row = explained.initiatives.find((item) => item.id === "exec-identity");
    expect(row?.why).toBe("The architect lane is off. Engineer queue depth is 1, so this is not backpressure.");
    expect(row?.next).toBe("Include the architect lane.");
    expect(row?.who).toBe("founder");
    expect(row?.situation).toBe("held");
  });

  it("does not alert a dispatch whose later outcome is already recorded", () => {
    const alerts = explained.executions.filter((item) => item.alert);
    expect(alerts).toEqual([]);
  });
});
