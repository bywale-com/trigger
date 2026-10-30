/**
 * Read-only projection of Tower `controlStep` / `decide` / `decideScope`.
 * Quotes the factory reason strings. Does not apply events. Does not wake anyone.
 * Source: omcoda_tower `.factory/controller/queue.ts` and `machine.ts`.
 */

type DispatchRecord = {
  effect?: string;
  issuedAt?: string;
  packetId?: string;
  revision?: string;
  prHead?: string;
  label?: string;
} | null;
type Lease = { workerId: string; role: string; until: string; revision: string };

export type PulseWake = {
  kind: "initiative" | "packet";
  id: string;
  effect: string;
  reason: string;
};

export type PulseLive = {
  pageId: string;
  role: string;
  until: string | null;
  workerId: string | null;
};

export type PulseWait = {
  kind: "initiative" | "packet";
  id: string;
  stage: string;
  reason: string;
  next: string;
  since: string | null;
};

export type FactoryPulse = {
  reason: string;
  wakes: PulseWake[];
  live: PulseLive[];
  waits: PulseWait[];
  authorizedDispatches: number | null;
  usedDispatches: number;
  remaining: number | null;
  controllerCadence: "event" | "scheduled";
  schedule: string | null;
};

type PulsePacket = {
  id: string;
  stage: string;
  wake?: string;
  hold?: boolean;
  blockerId?: string | null;
  lease?: Lease | null;
  revision?: string;
  attempts?: number;
  lastFailureFingerprint?: string | null;
  dispatchedSaRevision?: string | null;
  dispatchedEngineerRevision?: string | null;
  dispatchedRepairFingerprint?: string | null;
  dispatch?: DispatchRecord | null;
};

type PulseInitiative = {
  id: string;
  queue: string;
  session: string;
  dispatch?: DispatchRecord | null;
  updatedAt?: string | null;
};

export type PulseLedger = {
  authorizedDispatches?: number | null;
  usedDispatches?: number;
  scope: { status: string; founderDecision?: string | null };
  initiatives: Record<string, PulseInitiative>;
  packets: Record<string, PulsePacket>;
};

type World = {
  activation: "inactive" | "active";
  now: string;
  engineeringBusy: boolean;
  authorizedDispatches: number | null;
  usedDispatches: number;
  scopeStatus: string;
};

type Decision = { effect: string; reason: string; label: string | null };

function none(reason: string): Decision {
  return { effect: "none", reason, label: null };
}

function packetLeaseOn(packet: PulsePacket, now: string): boolean {
  return Boolean(packet.lease && packet.lease.until > now);
}

function implementationOccupied(ledger: PulseLedger, now: string): boolean {
  return Object.values(ledger.packets).some((packet) => {
    if (packet.stage === "change_specified" && packet.dispatchedEngineerRevision === packet.revision) return true;
    if (packet.stage === "engineering" && packetLeaseOn(packet, now)) return true;
    if (
      packet.stage === "engineering" &&
      packet.lastFailureFingerprint != null &&
      packet.dispatchedRepairFingerprint === packet.lastFailureFingerprint
    ) {
      return true;
    }
    return false;
  });
}

function analystOpen(ledger: PulseLedger): boolean {
  return Object.values(ledger.packets).some((packet) => packet.dispatch?.effect === "wake_sa");
}

function analystLeaseOpen(ledger: PulseLedger, now: string): boolean {
  return Object.values(ledger.packets).some((packet) => packet.stage === "analysis" && packetLeaseOn(packet, now));
}

function decide(packet: PulsePacket, world: World): Decision {
  if (world.activation !== "active") return none("inactive");
  if (world.scopeStatus === "suspended") return none("suspended");
  if (world.scopeStatus === "inactive") return none("scope_inactive");
  if (world.scopeStatus === "complete") return none("scope_complete");
  if (packet.hold) return none("hold");
  if (packet.blockerId || packet.stage === "blocked") return none("blocked");
  if (packet.stage === "returned_architect" || packet.stage === "returned_analyst") return none(packet.stage);
  if (packetLeaseOn(packet, world.now)) return none("lease_held");
  if (world.authorizedDispatches == null || world.authorizedDispatches <= 0) return none("dispatch_not_authorized");
  if (world.usedDispatches >= world.authorizedDispatches) return none("dispatch_authorization_exhausted");
  if (packet.stage === "released" && packet.wake === "sa" && packet.dispatchedSaRevision !== packet.revision) {
    return { effect: "wake_sa", reason: "released_packet", label: "factory-wake-sa" };
  }
  if (packet.stage === "change_specified" && packet.dispatchedEngineerRevision !== packet.revision) {
    if (world.engineeringBusy) return none("concurrency");
    return { effect: "wake_engineer", reason: "change_specified", label: "factory-wake-engineer" };
  }
  if (
    packet.stage === "engineering" &&
    (packet.attempts ?? 0) > 0 &&
    packet.lastFailureFingerprint &&
    packet.dispatchedRepairFingerprint !== packet.lastFailureFingerprint
  ) {
    if (world.engineeringBusy) return none("concurrency");
    return { effect: "wake_repair", reason: "implementation_failure", label: "factory-repair" };
  }
  return none("no_transition");
}

function decideScope(ledger: PulseLedger, world: World): Decision & { initiativeId: string | null } {
  const empty = (reason: string) => ({ ...none(reason), initiativeId: null });
  if (world.activation !== "active") return empty("inactive");
  if (ledger.scope.status === "suspended" || world.scopeStatus === "suspended") return empty("suspended");
  if (ledger.scope.status === "inactive" || world.scopeStatus === "inactive") return empty("scope_inactive");
  if (ledger.scope.status === "complete" || world.scopeStatus === "complete") return empty("scope_complete");
  if (ledger.scope.founderDecision) return empty("founder_decision");
  if (world.authorizedDispatches == null || world.authorizedDispatches <= 0) return empty("dispatch_not_authorized");
  if (world.usedDispatches >= world.authorizedDispatches) return empty("dispatch_authorization_exhausted");
  const active = Object.values(ledger.initiatives).find((item) => item.queue === "active");
  if (!active) return empty("no_initiative");
  if (active.session === "founder_decision") return empty("founder_decision");
  if (active.dispatch && active.session === "running") return empty("already_dispatched");
  if (active.session === "continuation_due" && !active.dispatch) {
    return { effect: "wake_architect", reason: "architect_due", label: "factory-wake-architect", initiativeId: active.id };
  }
  return empty("no_transition");
}

function controlStep(ledger: PulseLedger, world: World): { reason: string; wakes: PulseWake[] } {
  if (world.activation !== "active") return { reason: "inactive", wakes: [] };
  if (ledger.scope.status !== "active") {
    const reason =
      ledger.scope.status === "suspended" ? "suspended" : ledger.scope.status === "complete" ? "scope_complete" : "scope_inactive";
    return { reason, wakes: [] };
  }
  let engineerSlot = world.engineeringBusy || implementationOccupied(ledger, world.now);
  const saOpen = analystOpen(ledger);
  let saProposed = saOpen;
  const packetWakes: PulseWake[] = [];
  const packets = Object.values(ledger.packets).sort((a, b) => a.id.localeCompare(b.id));
  for (const packet of packets) {
    const decision = decide(packet, { ...world, engineeringBusy: engineerSlot });
    if (decision.effect === "none") continue;
    if (decision.effect === "wake_sa" && saProposed) continue;
    packetWakes.push({ kind: "packet", id: packet.id, effect: decision.effect, reason: decision.reason });
    if (decision.effect === "wake_sa") saProposed = true;
    if (decision.effect === "wake_engineer" || decision.effect === "wake_repair") engineerSlot = true;
  }
  if (packetWakes.length) return { reason: packetWakes[0].reason, wakes: packetWakes };
  if (saOpen) return { reason: "analyst_open", wakes: [] };
  if (analystLeaseOpen(ledger, world.now)) return { reason: "analysis_open", wakes: [] };
  const architect = decideScope(ledger, world);
  if (architect.effect !== "none" && architect.initiativeId) {
    return {
      reason: architect.reason,
      wakes: [{ kind: "initiative", id: architect.initiativeId, effect: architect.effect, reason: architect.reason }],
    };
  }
  return { reason: architect.reason, wakes: [] };
}

function liveFrom(ledger: PulseLedger, now: string): PulseLive[] {
  const rows: PulseLive[] = [];
  for (const packet of Object.values(ledger.packets)) {
    if (!packetLeaseOn(packet, now) || !packet.lease) continue;
    rows.push({
      pageId: packet.id,
      role: packet.lease.role,
      until: packet.lease.until,
      workerId: packet.lease.workerId,
    });
  }
  return rows.sort((a, b) => a.pageId.localeCompare(b.pageId));
}

const QUIET_REASONS = new Set([
  "inactive",
  "suspended",
  "scope_inactive",
  "scope_complete",
  "no_transition",
  "no_initiative",
  "lease_held",
  "hold",
]);

function waitsFrom(ledger: PulseLedger, world: World): PulseWait[] {
  const rows: PulseWait[] = [];
  const seen = new Set<string>();
  const push = (wait: PulseWait) => {
    const key = `${wait.kind}:${wait.id}:${wait.reason}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push(wait);
  };
  const engineerSlot = world.engineeringBusy || implementationOccupied(ledger, world.now);
  for (const packet of Object.values(ledger.packets).sort((a, b) => a.id.localeCompare(b.id))) {
    if (packet.dispatch && !packetLeaseOn(packet, world.now)) {
      push({
        kind: "packet",
        id: packet.id,
        stage: packet.stage,
        reason: "unconfirmed",
        next: packet.dispatch.effect ?? "none",
        since: packet.dispatch.issuedAt ?? null,
      });
    }
    const blocked = decide(packet, { ...world, engineeringBusy: engineerSlot });
    const free = decide(packet, { ...world, engineeringBusy: false });
    if (blocked.effect === "none" && !QUIET_REASONS.has(blocked.reason)) {
      push({
        kind: "packet",
        id: packet.id,
        stage: packet.stage,
        reason: blocked.reason,
        next: free.effect !== "none" ? free.effect : "none",
        since: packet.dispatch?.issuedAt ?? null,
      });
    }
  }
  const active = Object.values(ledger.initiatives).find((item) => item.queue === "active");
  if (active) {
    const architect = decideScope(ledger, world);
    if (active.dispatch && active.session === "running") {
      push({
        kind: "initiative",
        id: active.id,
        stage: active.session,
        reason: "unconfirmed",
        next: architect.effect,
        since: active.dispatch.issuedAt ?? active.updatedAt ?? null,
      });
    } else if (active.session === "continuation_due" && !QUIET_REASONS.has(architect.reason)) {
      push({
        kind: "initiative",
        id: active.id,
        stage: active.session,
        reason: architect.reason,
        next: architect.effect,
        since: active.dispatch?.issuedAt ?? active.updatedAt ?? null,
      });
    }
  }
  return rows;
}

export function workflowCadence(yaml: string | null): { controllerCadence: "event" | "scheduled"; schedule: string | null } {
  if (!yaml) return { controllerCadence: "event", schedule: null };
  const match = yaml.match(/^\s*schedule:\s*\n(?:[^\n]*\n)*?\s*-\s*cron:\s*"([^"]+)"/m);
  if (match) return { controllerCadence: "scheduled", schedule: match[1] };
  return { controllerCadence: "event", schedule: null };
}

export function remainingDispatches(authorized: number | null, used: number): number | null {
  if (authorized == null) return null;
  return Math.max(0, authorized - used);
}

export function compactDuration(from: string, to: string): string | null {
  const start = Date.parse(from);
  const end = Date.parse(to);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  const seconds = Math.max(0, Math.floor((end - start) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function projectPulse(
  ledger: PulseLedger,
  now: string,
  activation: "inactive" | "active",
  cadence: { controllerCadence: "event" | "scheduled"; schedule: string | null } = { controllerCadence: "event", schedule: null },
): FactoryPulse {
  const authorized = ledger.authorizedDispatches ?? null;
  const used = ledger.usedDispatches ?? 0;
  const world: World = {
    activation,
    now,
    engineeringBusy: false,
    authorizedDispatches: authorized,
    usedDispatches: used,
    scopeStatus: ledger.scope.status,
  };
  const step = controlStep(ledger, world);
  return {
    reason: step.reason,
    wakes: step.wakes,
    live: liveFrom(ledger, now),
    waits: waitsFrom(ledger, world),
    authorizedDispatches: authorized,
    usedDispatches: used,
    remaining: remainingDispatches(authorized, used),
    controllerCadence: cadence.controllerCadence,
    schedule: cadence.schedule,
  };
}
