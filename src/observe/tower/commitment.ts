/**
 * Tower's operational commitment. The founder's Next column.
 * `checkAt` is the next controller visit, never a promised worker start.
 * A countdown is printed only from `checkAt`. A missing countdown stays a wait.
 */

export type Actor = "architect" | "analyst" | "engineer" | "controller" | "github_actions" | "founder" | "unknown";

export type CommitmentCondition =
  | "working"
  | "scheduled"
  | "waiting"
  | "recovering"
  | "needs_you"
  | "needs_repair"
  | "complete";

export type Commitment = {
  condition: CommitmentCondition;
  checkAt: string | null;
  runUntil: string | null;
  event: string | null;
  owner: Actor;
};

/** GitHub cron on the default branch. The job checks out the operating factory. */
export const RECONCILE_CRON = "7,22,37,52 * * * *";

export function nextReconcileAt(nowIso: string): string {
  const now = Date.parse(nowIso);
  if (!Number.isFinite(now)) throw new Error("reconcile_clock_missing");
  const minutes = RECONCILE_CRON.split(" ")[0]
    .split(",")
    .map((part) => Number(part))
    .filter((part) => Number.isInteger(part));
  const start = new Date(now);
  for (let hour = 0; hour < 48; hour += 1) {
    for (const minute of minutes) {
      const candidate = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), start.getUTCHours() + hour, minute, 0, 0);
      if (candidate > now) return new Date(candidate).toISOString();
    }
  }
  throw new Error("reconcile_clock_missing");
}

export function commitmentHolds(commitment: Commitment): boolean {
  if (commitment.checkAt != null && Number.isNaN(Date.parse(commitment.checkAt))) return false;
  if (commitment.runUntil != null && Number.isNaN(Date.parse(commitment.runUntil))) return false;
  switch (commitment.condition) {
    case "scheduled":
    case "recovering":
      return commitment.checkAt != null && commitment.event == null;
    case "waiting":
      return Boolean(commitment.event);
    case "working":
      return commitment.checkAt == null;
    case "needs_you":
      return commitment.checkAt == null && commitment.event == null && commitment.owner === "founder";
    case "needs_repair":
      return commitment.checkAt == null && commitment.event == null && commitment.owner !== "founder";
    case "complete":
      return commitment.checkAt == null && commitment.event == null && commitment.runUntil == null;
    default:
      return false;
  }
}

export function scheduled(now: string, owner: Actor): Commitment {
  return { condition: "scheduled", checkAt: nextReconcileAt(now), runUntil: null, event: null, owner };
}

export function recovering(now: string, owner: Actor): Commitment {
  return { condition: "recovering", checkAt: nextReconcileAt(now), runUntil: null, event: null, owner };
}

export function waiting(event: string, owner: Actor, checkAt: string | null = null): Commitment {
  return { condition: "waiting", checkAt, runUntil: null, event, owner };
}

export function working(owner: Actor, runUntil: string | null): Commitment {
  return { condition: "working", checkAt: null, runUntil, event: null, owner };
}

export function needsYou(): Commitment {
  return { condition: "needs_you", checkAt: null, runUntil: null, event: null, owner: "founder" };
}

export function needsRepair(owner: Exclude<Actor, "founder">): Commitment {
  return { condition: "needs_repair", checkAt: null, runUntil: null, event: null, owner };
}

export function finished(): Commitment {
  return { condition: "complete", checkAt: null, runUntil: null, event: null, owner: "controller" };
}

function packetToken(id: string): string {
  return id.replace(/\bpkt-(\d+)(?:-[a-z0-9]+)*/gi, (_, number: string) => `PKT-${number}`);
}

function eventLine(event: string): string {
  const parts = event
    .split(",")
    .map((part) => packetToken(part.trim()))
    .filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? packetToken(event);
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

/** Relative phrase for `checkAt`. No phrase when the instant is missing or not a time. */
export function checkPhrase(checkAt: string | null, now: string): string | null {
  if (!checkAt) return null;
  const at = Date.parse(checkAt);
  const from = Date.parse(now);
  if (!Number.isFinite(at) || !Number.isFinite(from)) return null;
  const delta = at - from;
  if (delta <= 0) return "next check now";
  const minutes = Math.max(1, Math.round(delta / 60000));
  if (minutes < 60) return `next check in ${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hourWord = `${hours} ${hours === 1 ? "hour" : "hours"}`;
  if (rest === 0) return `next check in ${hourWord}`;
  return `next check in ${hourWord} ${rest} ${rest === 1 ? "minute" : "minutes"}`;
}

/** The Next column. Words come from the condition and the event Tower named. The clock comes from `checkAt`. */
export function commitmentLine(commitment: Commitment, now: string): string {
  const check = checkPhrase(commitment.checkAt, now);
  switch (commitment.condition) {
    case "working":
      return "Working";
    case "scheduled":
      return check ? `Scheduled — ${check}` : "Scheduled";
    case "recovering":
      return check ? `Recovering — ${check}` : "Recovering";
    case "waiting": {
      const on = commitment.event ? ` on ${eventLine(commitment.event)}` : "";
      return check ? `Waiting${on} — ${check}` : `Waiting${on}`;
    }
    case "needs_you":
      return "Needs you";
    case "needs_repair":
      return "Needs repair";
    case "complete":
      return "Complete";
    default:
      return "Unknown";
  }
}
