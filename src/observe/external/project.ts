/**
 * External read projection.
 * Classifies the snapshot the desk already shows. Does not invent a ledger,
 * a next run, or a worker that the snapshot does not record.
 */
import { leaseActive, type EvidencePresence, type Page, type Snapshot } from "../snapshot.ts";
import type { FactoryPulse, PulseWait } from "../tower/pulse.ts";
import { boundPayload, clip } from "./text.ts";

export type Activity = "running" | "dispatched" | "waiting" | "interrupted" | "blocked" | "idle" | "unknown";

const INTERRUPTED = new Set(["returned_architect", "returned_analyst"]);

export function classifyActivity(page: Page, waits: PulseWait[]): { activity: Activity; basis: string } {
  const running = page.lifecycle.find((step) => step.id === "running");
  const dispatched = page.lifecycle.find((step) => step.id === "dispatched");
  const wait = waits.find((row) => row.id === page.id);
  if (running?.presence === "yes") return { activity: "running", basis: running.basis };
  if (INTERRUPTED.has(page.stage)) return { activity: "interrupted", basis: `stage ${page.stage}` };
  if (page.type === "Packet" && (page.blockerId || page.stage === "blocked")) {
    return { activity: "blocked", basis: page.blockerId ? `blocker ${page.blockerId}` : "stage blocked" };
  }
  if (page.type === "Initiative" && page.blockedReason) {
    return { activity: "blocked", basis: page.blockedReason };
  }
  if (wait?.reason === "unconfirmed" || (dispatched?.presence === "yes" && running?.presence === "unknown")) {
    return {
      activity: "dispatched",
      basis: wait?.reason === "unconfirmed" ? "dispatch recorded; worker not confirmed" : (running?.basis ?? "dispatch recorded; running unknown"),
    };
  }
  if (wait && wait.reason !== "unconfirmed") return { activity: "waiting", basis: wait.reason };
  if (running?.presence === "no") return { activity: "idle", basis: running.basis };
  return { activity: "unknown", basis: running?.basis ?? "no running evidence" };
}

export function timingOf(pulse: FactoryPulse): {
  nextAt: null;
  known: false;
  cadence: FactoryPulse["controllerCadence"];
  schedule: string | null;
  basis: string;
} {
  if (pulse.controllerCadence === "scheduled" && pulse.schedule) {
    return {
      nextAt: null,
      known: false,
      cadence: "scheduled",
      schedule: pulse.schedule,
      basis: `A cron schedule is recorded (${pulse.schedule}). Trigger does not compute the next execution instant from that cron.`,
    };
  }
  return {
    nextAt: null,
    known: false,
    cadence: pulse.controllerCadence,
    schedule: pulse.schedule,
    basis:
      pulse.controllerCadence === "scheduled"
        ? "Controller cadence is scheduled and no cron string is recorded. Trigger does not invent a next instant."
        : "Controller cadence is event. Trigger does not compute a next instant from an event trigger.",
  };
}

function presence(page: Page, id: "running" | "dispatched"): EvidencePresence {
  return page.lifecycle.find((step) => step.id === id)?.presence ?? "unknown";
}

function githubView(page: Page) {
  return {
    available: page.github.available,
    unavailableReason: page.github.unavailableReason,
    workingBranch: page.github.workingBranch,
    pull: page.github.pull,
    latestSha: page.github.latestSha,
    commits: page.github.commits.map((commit) => {
      const message = clip(commit.message, 500);
      return { sha: commit.sha, url: commit.url, message: message.text, messageTruncated: message.truncated };
    }),
    checks: page.github.checks,
    preview: page.github.preview,
    merge: page.github.merge,
  };
}

function summary(page: Page, waits: PulseWait[]) {
  const activity = classifyActivity(page, waits);
  return {
    id: page.id,
    type: page.type,
    name: page.name,
    module: page.module,
    stage: page.stage,
    executionLabel: page.execution,
    evidenceLabel: page.evidence,
    dependsOn: page.dependsOn,
    updatedAt: page.updatedAt,
    activity: activity.activity,
    activityBasis: activity.basis,
    running: presence(page, "running"),
    dispatched: presence(page, "dispatched"),
  };
}

export function projectFactory(snapshot: Snapshot) {
  const waits = snapshot.pulse.waits;
  const counts = {
    initiatives: 0,
    packets: 0,
    running: 0,
    dispatched: 0,
    waiting: 0,
    interrupted: 0,
    blocked: 0,
    idle: 0,
    unknown: 0,
  };
  const blockers: { id: string; type: string; stage: string; reason: string }[] = [];
  if (snapshot.scope.blockReason) {
    blockers.push({
      id: snapshot.scope.id ?? "scope",
      type: "scope",
      stage: snapshot.scope.status,
      reason: snapshot.scope.blockReason,
    });
  }
  for (const page of snapshot.pages) {
    if (page.type === "Initiative") counts.initiatives += 1;
    else counts.packets += 1;
    const activity = classifyActivity(page, waits);
    counts[activity.activity] += 1;
    if (activity.activity === "blocked") {
      blockers.push({ id: page.id, type: page.type, stage: page.stage, reason: activity.basis });
    }
  }
  return {
    ref: snapshot.ref,
    sha: snapshot.sha,
    readAt: snapshot.readAt,
    stateRevision: snapshot.stateRevision,
    repo: snapshot.repo,
    scope: snapshot.scope,
    activation: snapshot.activation,
    status: {
      authorizationScope: snapshot.scope.status,
      controllerActivation: snapshot.activation,
    },
    dispatchPolicy: snapshot.dispatchPolicy,
    factoryPull: snapshot.factoryPull,
    pulse: {
      reason: snapshot.pulse.reason,
      cadence: snapshot.pulse.controllerCadence,
      schedule: snapshot.pulse.schedule,
      authorizedDispatches: snapshot.pulse.authorizedDispatches,
      usedDispatches: snapshot.pulse.usedDispatches,
      remaining: snapshot.pulse.remaining,
      live: snapshot.pulse.live,
      waits: snapshot.pulse.waits,
      wakes: snapshot.pulse.wakes,
    },
    timing: timingOf(snapshot.pulse),
    counts,
    blockers,
  };
}

export function listInitiatives(snapshot: Snapshot) {
  return snapshot.pages.filter((page) => page.type === "Initiative").map((page) => {
    if (page.type !== "Initiative") return summary(page, snapshot.pulse.waits);
    return {
      ...summary(page, snapshot.pulse.waits),
      queue: page.queue,
      session: page.session,
      priority: page.priority,
      packetIds: page.packetIds,
      dependedOnBy: page.dependedOnBy,
      blockedReason: page.blockedReason,
    };
  });
}

export function getInitiative(snapshot: Snapshot, id: string) {
  const page = snapshot.pages.find((item) => item.id === id && item.type === "Initiative");
  if (!page || page.type !== "Initiative") return null;
  const specification = clip(page.specificationText);
  return {
    ...summary(page, snapshot.pulse.waits),
    queue: page.queue,
    session: page.session,
    priority: page.priority,
    packetIds: page.packetIds,
    dependedOnBy: page.dependedOnBy,
    blockedReason: page.blockedReason,
    obligation: page.obligation,
    outstanding: page.outstanding,
    entry: page.entry,
    coverageComplete: page.coverageComplete,
    inheritedSpecifications: page.inheritedSpecifications,
    founderDecisions: page.founderDecisions,
    specificationPath: page.specificationPath,
    specificationText: specification.text,
    specificationTruncated: specification.truncated,
    journals: page.journals.map((journal) => {
      const text = clip(journal.text);
      return { path: journal.path, text: text.text, truncated: text.truncated };
    }),
    dispatch: page.dispatch,
    lifecycle: page.lifecycle,
    github: githubView(page),
  };
}

export function listPackets(snapshot: Snapshot, initiativeId?: string) {
  const packets = snapshot.pages.filter((page) => page.type === "Packet");
  if (initiativeId && !snapshot.pages.some((page) => page.id === initiativeId && page.type === "Initiative")) {
    return { missingInitiative: true as const, packets: [] };
  }
  return {
    missingInitiative: false as const,
    packets: packets
      .filter((page) => page.type === "Packet" && (!initiativeId || page.initiativeId === initiativeId))
      .map((page) => {
        if (page.type !== "Packet") return summary(page, snapshot.pulse.waits);
        return {
          ...summary(page, snapshot.pulse.waits),
          initiativeId: page.initiativeId,
          wake: page.wake,
          hold: page.hold,
          blockerId: page.blockerId,
          release: page.release,
          releaseEligible: page.releaseEligible,
        };
      }),
  };
}

export function getPacket(snapshot: Snapshot, id: string) {
  const page = snapshot.pages.find((item) => item.id === id && item.type === "Packet");
  if (!page || page.type !== "Packet") return null;
  const intended = clip(page.intendedBehavior);
  const systems = clip(page.systemsChangeText);
  const initiative = snapshot.pages.find((item) => item.id === page.initiativeId && item.type === "Initiative");
  return {
    ...summary(page, snapshot.pulse.waits),
    initiativeId: page.initiativeId,
    wake: page.wake,
    hold: page.hold,
    blockerId: page.blockerId,
    release: page.release,
    releaseEligible: page.releaseEligible,
    lease: page.lease,
    leaseActive: leaseActive(page.lease, snapshot.readAt),
    executionMode: page.executionMode,
    candidateSha: page.candidateSha,
    verifiedSha: page.verifiedSha,
    integratedSha: page.integratedSha,
    reconciliationId: page.reconciliationId,
    checks: page.checks,
    dispatch: page.dispatch,
    dispatchHistory: page.dispatchHistory,
    intendedBehaviorPath: page.intendedBehaviorPath,
    intendedBehavior: intended.text,
    intendedBehaviorTruncated: intended.truncated,
    systemsChangePath: page.systemsChangePath,
    systemsChangeText: systems.text,
    systemsChangeTruncated: systems.truncated,
    specificationPath: initiative && initiative.type === "Initiative" ? initiative.specificationPath : null,
    lifecycle: page.lifecycle,
    github: githubView(page),
    plates: plateBody(page),
  };
}

export function getExecution(snapshot: Snapshot, id: string) {
  const page = snapshot.pages.find((item) => item.id === id);
  if (!page) return null;
  const activity = classifyActivity(page, snapshot.pulse.waits);
  const packet = page.type === "Packet" ? page : null;
  const live = snapshot.pulse.live.find((row) => row.pageId === page.id) ?? null;
  return {
    id: page.id,
    type: page.type,
    name: page.name,
    stage: page.stage,
    activity: activity.activity,
    activityBasis: activity.basis,
    executionLabel: page.execution,
    evidenceLabel: page.evidence,
    lifecycle: page.lifecycle,
    dispatch: page.type === "Initiative" || page.type === "Packet" ? page.dispatch : null,
    dispatchHistory: packet?.dispatchHistory ?? [],
    lease: packet?.lease ?? null,
    leaseActive: packet ? leaseActive(packet.lease, snapshot.readAt) : false,
    recordedLive: live,
    worker: packet?.lease
      ? {
          workerId: packet.lease.workerId,
          role: packet.lease.role,
          until: packet.lease.until,
          basis: "lease.until is the end of the recorded lease, not the next factory run.",
        }
      : null,
    executionMode: packet?.executionMode ?? null,
    checks: packet?.checks ?? [],
    shas: packet
      ? { candidate: packet.candidateSha, verified: packet.verifiedSha, integrated: packet.integratedSha }
      : null,
    reconciliationId: packet?.reconciliationId ?? null,
    github: githubView(page),
  };
}

export function projectNext(snapshot: Snapshot) {
  const timing = timingOf(snapshot.pulse);
  return {
    reason: snapshot.pulse.reason,
    eligible: snapshot.pulse.wakes,
    waiting: snapshot.pulse.waits,
    live: snapshot.pulse.live,
    authorizedDispatches: snapshot.pulse.authorizedDispatches,
    usedDispatches: snapshot.pulse.usedDispatches,
    remaining: snapshot.pulse.remaining,
    timing,
    basis:
      snapshot.pulse.wakes.length > 0
        ? "Wakes are the controller's eligible effects on this read."
        : `No eligible wake. Authorization scope is ${snapshot.scope.status}. Controller activation is ${snapshot.activation ?? "unset"}.`,
  };
}

function plateBody(page: Extract<Page, { type: "Packet" }>) {
  return {
    bucketsAvailable: page.plates.bucketsAvailable,
    buckets: page.plates.buckets.map((bucket) => {
      const text = clip(bucket.text);
      return { id: bucket.id, label: bucket.label, text: text.text, truncated: text.truncated };
    }),
    images: page.plates.images.map((image) => ({
      path: image.path,
      alt: image.alt,
      imageUrl: image.imageUrl,
      artifactUrl: image.artifactUrl,
    })),
  };
}

export function listPlates(snapshot: Snapshot) {
  const specifications = snapshot.pages
    .filter((page) => page.type === "Initiative")
    .map((page) => {
      if (page.type !== "Initiative") return { id: page.id, specificationPath: "" };
      return { id: page.id, name: page.name, specificationPath: page.specificationPath };
    });
  const packets = snapshot.pages
    .filter((page) => page.type === "Packet")
    .map((page) => {
      if (page.type !== "Packet") return { id: page.id };
      return {
        id: page.id,
        name: page.name,
        initiativeId: page.initiativeId,
        bucketsAvailable: page.plates.bucketsAvailable,
        imageCount: page.plates.images.length,
      };
    });
  return { specifications, packets };
}

export function getPlates(snapshot: Snapshot, packetId: string) {
  const page = snapshot.pages.find((item) => item.id === packetId && item.type === "Packet");
  if (!page || page.type !== "Packet") return null;
  const initiative = snapshot.pages.find((item) => item.id === page.initiativeId && item.type === "Initiative");
  const specification =
    initiative && initiative.type === "Initiative" ? clip(initiative.specificationText) : { text: null, truncated: false };
  return {
    id: page.id,
    name: page.name,
    initiativeId: page.initiativeId,
    specificationPath: initiative && initiative.type === "Initiative" ? initiative.specificationPath : null,
    specificationText: specification.text,
    specificationTruncated: specification.truncated,
    plates: plateBody(page),
  };
}

export function envelope(snapshot: Snapshot, stale: boolean, data: unknown) {
  return boundPayload({
    api: "trigger.read.v1" as const,
    scope: "trigger:read" as const,
    ref: snapshot.ref,
    sha: snapshot.sha,
    readAt: snapshot.readAt,
    stale,
    readFailed: stale,
    data,
  });
}
