/**
 * The snapshot both views read.
 * Display strings are derived here, once. This file has no Tower paths and no rendering.
 */

export const REFRESH_MS = 60_000;

export type DispatchRecord = {
  packetId: string;
  revision: string;
  prHead: string;
  effect: "wake_sa" | "wake_engineer" | "wake_repair" | "wake_architect";
  label: string;
  issuedAt?: string;
  workerExecution?: "ran" | "absent";
};

export type Lease = {
  workerId: string;
  role: "architect" | "analyst" | "engineer";
  until: string;
  revision: string;
};

export type CheckEvidence = {
  name: string;
  runId: string;
  outcome: string;
};

export type LedgerInitiative = {
  id: string;
  module: string;
  capability: string;
  entry: string;
  obligation: string;
  queue: string;
  priority: number;
  dependsOn: string[];
  inheritedSpecifications: string[];
  investigation: string;
  session: string;
  coverageComplete: boolean | null;
  outstanding: string[];
  packetIds: string[];
  blockedReason: string | null;
  updatedAt: string | null;
  dispatch: DispatchRecord | null;
};

export type LedgerPacket = {
  id: string;
  initiativeId: string;
  stage: string;
  wake: string;
  hold?: boolean;
  blockerId: string | null;
  lease: Lease | null;
  releaseEligible?: boolean;
  candidateSha: string | null;
  verifiedSha: string | null;
  integratedSha: string | null;
  reconciliationId: string | null;
  dispatch: DispatchRecord | null;
  dispatchHistory?: DispatchRecord[];
  execution: { mode: "manual" | "automatic"; checks: CheckEvidence[] } | null;
};

export type EvidencePresence = "yes" | "no" | "unknown";

export type LifecycleId = "dispatched" | "running" | "committed" | "verified" | "integrated" | "accepted";

export type LifecycleStep = {
  id: LifecycleId;
  label: string;
  presence: EvidencePresence;
  basis: string;
};

export type GithubPull = {
  number: number;
  url: string;
  state: string;
  merged: boolean | null;
  branch: string | null;
  headSha: string | null;
  title: string | null;
};

export type GithubCommit = {
  sha: string;
  url: string;
  message: string | null;
};

export type GithubCheck = {
  name: string;
  runId: string | null;
  outcome: string | null;
  url: string | null;
  source: "ledger" | "github";
};

export type GithubPreview = {
  url: string;
  environment: string | null;
  sha: string | null;
};

export type GithubEvidence = {
  available: boolean;
  unavailableReason: string | null;
  workingBranch: string | null;
  pull: GithubPull | null;
  latestSha: string | null;
  commits: GithubCommit[];
  checks: GithubCheck[];
  preview: GithubPreview | null;
  merge: { merged: boolean | null; sha: string | null; url: string | null };
};

export type FactoryPull = {
  number: number;
  url: string;
  state: string;
  branch: string | null;
  headSha: string | null;
};

export type PageBase = {
  id: string;
  type: "Initiative" | "Packet";
  name: string;
  module: string;
  stage: string;
  execution: string;
  evidence: string;
  evidenceError: boolean;
  inside: string | null;
  dependsOn: string[];
  updatedAt: string | null;
};

export type InitiativePage = PageBase & {
  type: "Initiative";
  queue: string;
  session: string;
  priority: number;
  dispatch: DispatchRecord | null;
  blockedReason: string | null;
  obligation: string;
  outstanding: string[];
  entry: string;
  packetIds: string[];
  coverageComplete: boolean | null;
  inheritedSpecifications: string[];
  founderDecisions: string[];
  specificationPath: string;
  specificationText: string | null;
  journals: { path: string; text: string | null }[];
  dependedOnBy: string[];
  lifecycle: LifecycleStep[];
  github: GithubEvidence;
};

export type PacketPage = PageBase & {
  type: "Packet";
  initiativeId: string;
  wake: string;
  hold: boolean;
  release: string | null;
  releaseEligible: boolean;
  blockerId: string | null;
  lease: Lease | null;
  executionMode: "manual" | "automatic" | null;
  candidateSha: string | null;
  verifiedSha: string | null;
  integratedSha: string | null;
  reconciliationId: string | null;
  checks: CheckEvidence[];
  dispatch: DispatchRecord | null;
  dispatchHistory: DispatchRecord[];
  intendedBehavior: string | null;
  intendedBehaviorPath: string | null;
  systemsChangePath: string | null;
  systemsChangeText: string | null;
  plates: PacketPlates;
  lifecycle: LifecycleStep[];
  github: GithubEvidence;
};

export type Page = InitiativePage | PacketPage;

export type Snapshot = {
  ref: string;
  sha: string;
  readAt: string;
  stateRevision: number;
  scope: {
    id: string | null;
    status: string;
    modules: string[];
    founderDecision: string | null;
    blockReason: string | null;
  };
  activation: string | null;
  dispatchPolicy: string | null;
  repo: string;
  factoryPull: FactoryPull | null;
  pages: Page[];
};

export type GatheredInitiative = {
  raw: LedgerInitiative;
  founderDecisions: string[];
  specificationPath: string;
  specificationText: string | null;
  journals: { path: string; text: string | null }[];
};

export type GatheredPacket = {
  raw: LedgerPacket;
  title: string | null;
  release: string | null;
  intendedBehavior: string | null;
  intendedBehaviorPath: string | null;
  systemsChangePath: string | null;
  systemsChangeText: string | null;
  plates?: PacketPlates;
};

export type Gathered = {
  ref: string;
  sha: string;
  readAt: string;
  stateRevision: number;
  scope: Snapshot["scope"];
  activation: string | null;
  dispatchPolicy: string | null;
  repo: string;
  initiatives: GatheredInitiative[];
  packets: GatheredPacket[];
};

export type SnapshotBody = {
  readFailed: boolean;
  snapshot: Snapshot | null;
};

/** Keep the last good snapshot when a later read fails, including a dropped response. */
export function mergeRead(previous: SnapshotBody | null, incoming: SnapshotBody | null, networkFailed: boolean): SnapshotBody {
  if (networkFailed || !incoming) return { readFailed: true, snapshot: previous?.snapshot ?? null };
  if (incoming.readFailed) return { readFailed: true, snapshot: incoming.snapshot ?? previous?.snapshot ?? null };
  return incoming;
}

export type DeskFilter = {
  field: "Type" | "Module" | "Stage" | "Inside" | "Depends on";
  value: string;
};

export type Edge = { from: string; to: string };

const COUNTED_VERIFIED = new Set([
  "verified",
  "integration_authorized",
  "integrated",
  "reconciled",
  "accepted",
]);

const PROCESSING_STAGES = new Set([
  "investigating",
  "specifying",
  "verifying",
  "engineering",
  "analysis",
  "change_specified",
  "candidate",
  "integration_authorized",
]);

const ERROR_STAGES = new Set(["blocked", "returned_architect", "returned_analyst"]);

export function readAtNow(now = new Date()): string {
  return now.toISOString().slice(0, 19) + "Z";
}

export function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

export function stageLabel(stage: string): string {
  if (!stage) return stage;
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}

export function stageColor(stage: string): "success" | "processing" | "error" | "default" {
  if (stage === "verified" || stage === "integrated" || stage === "reconciled" || stage === "accepted") return "success";
  if (PROCESSING_STAGES.has(stage)) return "processing";
  if (ERROR_STAGES.has(stage)) return "error";
  return "default";
}

export function updatedLabel(value: string | null): string {
  if (!value) return "—";
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  return match ? match[1] : value;
}

export function intendedSection(markdown: string): string | null {
  const heading = "## Intended behavior";
  const start = markdown.indexOf(heading);
  if (start < 0) return null;
  const after = markdown.slice(start + heading.length);
  const next = after.search(/\n## /);
  const body = (next < 0 ? after : after.slice(0, next)).trim();
  return body || null;
}

export const PLATE_BUCKETS = [
  { id: "copy", label: "Copy" },
  { id: "doNotBuild", label: "Do not build" },
  { id: "implied", label: "Implied" },
  { id: "completes", label: "Completes" },
  { id: "outOfScope", label: "Out of scope" },
] as const;

export type PlateBucketId = (typeof PLATE_BUCKETS)[number]["id"];

export type PlateBucket = {
  id: PlateBucketId;
  label: string;
  text: string | null;
};

export type PacketPlateImage = {
  path: string;
  alt: string;
  imageUrl: string;
  artifactUrl: string;
};

export type PacketPlates = {
  buckets: PlateBucket[];
  bucketsAvailable: boolean;
  images: PacketPlateImage[];
};

export type ParsedPlateImage = {
  alt: string;
  href: string;
};

export function emptyPlates(): PacketPlates {
  return {
    buckets: PLATE_BUCKETS.map((bucket) => ({ id: bucket.id, label: bucket.label, text: null })),
    bucketsAvailable: false,
    images: [],
  };
}

export function platesVisible(plates: PacketPlates): boolean {
  return plates.images.length > 0 || plates.bucketsAvailable;
}

export function rawFileUrl(repo: string, sha: string, path: string): string {
  return `https://raw.githubusercontent.com/${repo}/${sha}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export function blobFileUrl(repo: string, sha: string, path: string): string {
  return `https://github.com/${repo}/blob/${sha}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function markdownSection(markdown: string, heading: string): string | null {
  const start = markdown.indexOf(heading);
  if (start < 0) return null;
  const after = markdown.slice(start + heading.length);
  const next = after.search(/\n## /);
  const body = (next < 0 ? after : after.slice(0, next)).trim();
  return body || null;
}

function plateImagesFrom(body: string): ParsedPlateImage[] {
  const images: ParsedPlateImage[] = [];
  const seen = new Set<string>();
  const add = (alt: string, href: string) => {
    const target = href.trim();
    if (!target || target.startsWith("#") || seen.has(target)) return;
    seen.add(target);
    images.push({ alt: alt.trim(), href: target });
  };
  const markdown = /!\[([^\]]*)\]\(([^)]+)\)/g;
  for (const match of body.matchAll(markdown)) add(match[1], match[2]);
  const html = /<img\b[^>]*>/gi;
  for (const match of body.matchAll(html)) {
    const tag = match[0];
    const src = /\bsrc\s*=\s*("([^"]+)"|'([^']+)'|([^\s>]+))/i.exec(tag);
    const alt = /\balt\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(tag);
    const href = src?.[2] ?? src?.[3] ?? src?.[4] ?? "";
    add(alt?.[2] ?? alt?.[3] ?? alt?.[4] ?? "", href);
  }
  return images;
}

function bucketFromHeading(name: string): { id: PlateBucketId; label: string } | null {
  const normalized = name.trim().toLowerCase().replace(/\s+this build$/, "");
  const found = PLATE_BUCKETS.find((bucket) => bucket.label.toLowerCase() === normalized);
  return found ? { id: found.id, label: found.label } : null;
}

function parseBucketLine(line: string): { bucket: { id: PlateBucketId; label: string }; rest: string } | null {
  const match =
    /^(?:#{2,4}\s+|\*{1,2})?(?:(?:\d+)[.)]\s+)?(Copy|Do not build|Implied|Completes|Out of scope(?: this build)?)\b[*:.\s—–-]*(.*)$/i.exec(
      line.trim(),
    );
  if (!match) return null;
  const bucket = bucketFromHeading(match[1]);
  if (!bucket) return null;
  return { bucket, rest: match[2].replace(/^\*+\s*/, "").replace(/\s*\*+$/, "").trim() };
}

function isEmptyPlateBody(text: string): boolean {
  const stripped = text.replace(/!\[.*?\]\([^)]+\)/gs, "").replace(/<img\b[^>]*>/gi, "").trim();
  if (!stripped) return true;
  return /^(none\.?|none,\s*or the five buckets\b.*)$/i.test(stripped);
}

export function plateSection(markdown: string): { buckets: PlateBucket[]; bucketsAvailable: boolean; images: ParsedPlateImage[] } {
  const empty = emptyPlates();
  const body = markdownSection(markdown, "## Plates");
  if (body == null) return { buckets: empty.buckets, bucketsAvailable: false, images: [] };
  const images = plateImagesFrom(body);
  if (isEmptyPlateBody(body)) return { buckets: empty.buckets, bucketsAvailable: false, images };
  const texts = new Map<PlateBucketId, string[]>();
  let current: PlateBucketId | null = null;
  let sawHeading = false;
  for (const line of body.split("\n")) {
    const parsed = parseBucketLine(line);
    if (parsed) {
      sawHeading = true;
      current = parsed.bucket.id;
      if (parsed.rest) {
        const list = texts.get(current) ?? [];
        list.push(parsed.rest);
        texts.set(current, list);
      }
      continue;
    }
    if (!current) continue;
    if (/!\[/.test(line) || /<img\b/i.test(line)) continue;
    const trimmed = line.trim();
    if (!trimmed) continue;
    const list = texts.get(current) ?? [];
    list.push(trimmed);
    texts.set(current, list);
  }
  if (!sawHeading) return { buckets: empty.buckets, bucketsAvailable: false, images };
  return {
    buckets: PLATE_BUCKETS.map((bucket) => ({
      id: bucket.id,
      label: bucket.label,
      text: texts.has(bucket.id) ? (texts.get(bucket.id) ?? []).join("\n") : null,
    })),
    bucketsAvailable: true,
    images,
  };
}

export function leaseActive(lease: Lease | null, readAt: string): boolean {
  return Boolean(lease && lease.until > readAt);
}

export const DEFAULT_TOWER_REPO = "bywale-com/omcoda_tower";

export function parseReconciliationId(id: string | null): { pr: number; sha: string } | null {
  if (!id) return null;
  const match = /^pr-(\d+)-([0-9a-f]{7,40})$/i.exec(id.trim());
  if (!match) return null;
  return { pr: Number(match[1]), sha: match[2].toLowerCase() };
}

export function actionsRunUrl(repo: string, runId: string): string {
  return `https://github.com/${repo}/actions/runs/${runId}`;
}

export function commitUrl(repo: string, sha: string): string {
  return `https://github.com/${repo}/commit/${sha}`;
}

export function pullUrl(repo: string, number: number): string {
  return `https://github.com/${repo}/pull/${number}`;
}

export function emptyGithub(reason: string, checks: GithubCheck[] = []): GithubEvidence {
  return {
    available: false,
    unavailableReason: reason,
    workingBranch: null,
    pull: null,
    latestSha: null,
    commits: [],
    checks,
    preview: null,
    merge: { merged: null, sha: null, url: null },
  };
}

export function ledgerChecks(packet: LedgerPacket, repo: string): GithubCheck[] {
  return (packet.execution?.checks ?? []).map((check) => ({
    name: check.name,
    runId: check.runId,
    outcome: check.outcome,
    url: check.runId ? actionsRunUrl(repo, check.runId) : null,
    source: "ledger" as const,
  }));
}

function githubInProgress(github: GithubEvidence | null | undefined): boolean {
  if (!github?.available) return false;
  return github.checks.some((check) => {
    const outcome = (check.outcome ?? "").toLowerCase();
    return outcome === "in_progress" || outcome === "queued" || outcome === "pending";
  });
}

function step(id: LifecycleId, label: string, presence: EvidencePresence, basis: string): LifecycleStep {
  return { id, label, presence, basis };
}

export function packetLifecycle(
  packet: Pick<
    LedgerPacket,
    "dispatch" | "dispatchHistory" | "lease" | "candidateSha" | "verifiedSha" | "integratedSha" | "stage"
  >,
  readAt: string,
  github?: GithubEvidence | null,
): LifecycleStep[] {
  const history = packet.dispatchHistory ?? [];
  const dispatched = packet.dispatch != null || history.length > 0;
  const leaseOn = leaseActive(packet.lease, readAt);
  const inProgress = githubInProgress(github);
  let running: EvidencePresence;
  let runningBasis: string;
  if (leaseOn && packet.lease) {
    running = "yes";
    runningBasis = `lease ${packet.lease.role} until ${packet.lease.until}`;
  } else if (inProgress) {
    running = "yes";
    runningBasis = "GitHub run in progress";
  } else if (!packet.dispatch) {
    running = "no";
    runningBasis = "no current dispatch";
  } else {
    running = "unknown";
    runningBasis = github?.available
      ? "dispatch recorded; no live lease or in-progress run"
      : "dispatch recorded; GitHub unavailable";
  }
  return [
    step("dispatched", "Dispatched", dispatched ? "yes" : "no", dispatched ? "dispatch record" : "no dispatch record"),
    step("running", "Running", running, runningBasis),
    step(
      "committed",
      "Committed",
      packet.candidateSha ? "yes" : "no",
      packet.candidateSha ? `candidateSha ${packet.candidateSha}` : "no candidateSha",
    ),
    step(
      "verified",
      "Verified",
      packet.verifiedSha ? "yes" : "no",
      packet.verifiedSha ? `verifiedSha ${packet.verifiedSha}` : "no verifiedSha",
    ),
    step(
      "integrated",
      "Integrated",
      packet.integratedSha ? "yes" : "no",
      packet.integratedSha ? `integratedSha ${packet.integratedSha}` : "no integratedSha",
    ),
    step(
      "accepted",
      "Accepted",
      packet.stage === "accepted" ? "yes" : "no",
      packet.stage === "accepted" ? "stage accepted" : `stage ${packet.stage}`,
    ),
  ];
}

export function initiativeLifecycle(
  item: Pick<LedgerInitiative, "dispatch" | "session">,
  github?: GithubEvidence | null,
): LifecycleStep[] {
  const dispatched = item.dispatch != null;
  const inProgress = githubInProgress(github);
  let running: EvidencePresence;
  let runningBasis: string;
  if (inProgress) {
    running = "yes";
    runningBasis = "GitHub run in progress";
  } else if (!item.dispatch) {
    running = "no";
    runningBasis = "no current dispatch";
  } else {
    running = "unknown";
    runningBasis = github?.available
      ? "dispatch recorded; no in-progress run"
      : "dispatch recorded; GitHub unavailable";
  }
  return [
    step("dispatched", "Dispatched", dispatched ? "yes" : "no", dispatched ? "dispatch record" : "no dispatch record"),
    step("running", "Running", running, runningBasis),
  ];
}

function roleLabel(role: string): string {
  if (role === "architect") return "Architect";
  if (role === "analyst") return "Analyst";
  if (role === "engineer") return "Engineer";
  return role;
}

function runningFromEffect(effect: DispatchRecord["effect"]): string {
  if (effect === "wake_architect") return "Architect · running";
  if (effect === "wake_sa") return "Analyst · running";
  if (effect === "wake_engineer") return "Engineer · running";
  return "Repair · running";
}

function packetExecution(packet: LedgerPacket, readAt: string): string {
  if (leaseActive(packet.lease, readAt) && packet.lease) {
    const role = packet.lease.role;
    if (role === "architect" || role === "analyst" || role === "engineer") {
      return `${roleLabel(role)} · running`;
    }
  }
  const mode = packet.execution?.mode ?? null;
  if (mode === "manual" && packet.dispatch == null) return "Manual · not live";
  if (mode === "automatic" && packet.dispatch != null) return "Automatic · dispatch";
  if (mode === "automatic" && packet.dispatch == null) return "Automatic · no dispatch";
  return "Idle · no dispatch";
}

function initiativeExecution(item: LedgerInitiative): string {
  if (item.session === "running" && item.dispatch) return runningFromEffect(item.dispatch.effect);
  if (item.session === "idle" && item.dispatch == null) return "Idle · no dispatch";
  return `${item.session} · ${item.dispatch ? "dispatch" : "no dispatch"}`;
}

function initiativeEvidence(item: LedgerInitiative, packets: LedgerPacket[]): { evidence: string; evidenceError: boolean } {
  if (item.blockedReason) return { evidence: "Blocked reason", evidenceError: true };
  const mine = packets.filter((packet) => packet.initiativeId === item.id);
  const verified = mine.filter((packet) => COUNTED_VERIFIED.has(packet.stage)).length;
  const integrated = mine.filter((packet) => packet.integratedSha != null).length;
  const tail = integrated === 0 ? "not integrated" : `${integrated} integrated`;
  return { evidence: `${verified} verified · ${tail}`, evidenceError: false };
}

function packetEvidence(packet: LedgerPacket): { evidence: string; evidenceError: boolean } {
  if (packet.blockerId || packet.stage === "blocked") return { evidence: "Blocked", evidenceError: true };
  const pass = (packet.execution?.checks ?? []).filter((check) => check.outcome === "pass").length;
  const sha = packet.integratedSha == null ? "no SHA" : "SHA";
  return { evidence: `${pass} checks · ${sha}`, evidenceError: false };
}

export function assemble(gathered: Gathered): Snapshot {
  const repo = gathered.repo || DEFAULT_TOWER_REPO;
  const packets = gathered.packets.map((packet) => packet.raw);
  const initiatives = [...gathered.initiatives].sort(
    (a, b) => a.raw.priority - b.raw.priority || a.raw.id.localeCompare(b.raw.id),
  );
  const dependedOnBy = new Map<string, string[]>();
  for (const item of initiatives) {
    for (const id of item.raw.dependsOn) {
      const list = dependedOnBy.get(id) ?? [];
      list.push(item.raw.id);
      dependedOnBy.set(id, list);
    }
  }
  const byInitiative = new Map<string, GatheredPacket[]>();
  const orphans: GatheredPacket[] = [];
  for (const packet of gathered.packets) {
    const list = byInitiative.get(packet.raw.initiativeId);
    if (list) list.push(packet);
    else if (initiatives.some((item) => item.raw.id === packet.raw.initiativeId)) {
      byInitiative.set(packet.raw.initiativeId, [packet]);
    } else orphans.push(packet);
  }
  for (const item of initiatives) {
    if (!byInitiative.has(item.raw.id)) byInitiative.set(item.raw.id, []);
  }
  for (const list of byInitiative.values()) list.sort((a, b) => a.raw.id.localeCompare(b.raw.id));
  orphans.sort((a, b) => a.raw.id.localeCompare(b.raw.id));

  const pages: Page[] = [];
  for (const item of initiatives) {
    const evidence = initiativeEvidence(item.raw, packets);
    const page: InitiativePage = {
      id: item.raw.id,
      type: "Initiative",
      name: item.raw.capability,
      module: item.raw.module,
      stage: item.raw.investigation,
      execution: initiativeExecution(item.raw),
      evidence: evidence.evidence,
      evidenceError: evidence.evidenceError,
      inside: null,
      dependsOn: [...item.raw.dependsOn],
      updatedAt: item.raw.updatedAt,
      queue: item.raw.queue,
      session: item.raw.session,
      priority: item.raw.priority,
      dispatch: item.raw.dispatch,
      blockedReason: item.raw.blockedReason,
      obligation: item.raw.obligation,
      outstanding: [...item.raw.outstanding],
      entry: item.raw.entry,
      packetIds: [...item.raw.packetIds],
      coverageComplete: item.raw.coverageComplete,
      inheritedSpecifications: [...item.raw.inheritedSpecifications],
      founderDecisions: [...item.founderDecisions],
      specificationPath: item.specificationPath,
      specificationText: item.specificationText,
      journals: item.journals,
      dependedOnBy: dependedOnBy.get(item.raw.id) ?? [],
      lifecycle: initiativeLifecycle(item.raw),
      github: emptyGithub("not requested"),
    };
    pages.push(page);
    for (const packet of byInitiative.get(item.raw.id) ?? []) {
      pages.push(toPacket(packet, item.raw.module, gathered.readAt, repo));
    }
  }
  for (const packet of orphans) pages.push(toPacket(packet, "", gathered.readAt, repo));

  return {
    ref: gathered.ref,
    sha: gathered.sha,
    readAt: gathered.readAt,
    stateRevision: gathered.stateRevision,
    scope: gathered.scope,
    activation: gathered.activation,
    dispatchPolicy: gathered.dispatchPolicy,
    repo,
    factoryPull: null,
    pages,
  };
}

function toPacket(packet: GatheredPacket, module: string, readAt: string, repo: string): PacketPage {
  const raw = packet.raw;
  const evidence = packetEvidence(raw);
  const github = emptyGithub("not requested", ledgerChecks(raw, repo));
  return {
    id: raw.id,
    type: "Packet",
    name: packet.title ?? raw.id,
    module,
    stage: raw.stage,
    execution: packetExecution(raw, readAt),
    evidence: evidence.evidence,
    evidenceError: evidence.evidenceError,
    inside: raw.initiativeId,
    dependsOn: [],
    updatedAt: null,
    initiativeId: raw.initiativeId,
    wake: raw.wake,
    hold: raw.hold === true,
    release: packet.release,
    releaseEligible: raw.releaseEligible === true,
    blockerId: raw.blockerId,
    lease: raw.lease,
    executionMode: raw.execution?.mode ?? null,
    candidateSha: raw.candidateSha,
    verifiedSha: raw.verifiedSha,
    integratedSha: raw.integratedSha,
    reconciliationId: raw.reconciliationId,
    checks: raw.execution?.checks.map((check) => ({ ...check })) ?? [],
    dispatch: raw.dispatch,
    dispatchHistory: (raw.dispatchHistory ?? []).map((record) => ({ ...record })),
    intendedBehavior: packet.intendedBehavior,
    intendedBehaviorPath: packet.intendedBehaviorPath,
    systemsChangePath: packet.systemsChangePath,
    systemsChangeText: packet.systemsChangeText,
    plates: packet.plates ?? emptyPlates(),
    lifecycle: packetLifecycle(raw, readAt, github),
    github,
  };
}

export function matches(page: Page, filter: DeskFilter): boolean {
  if (filter.field === "Type") return page.type === filter.value;
  if (filter.field === "Module") return page.module === filter.value;
  if (filter.field === "Stage") return stageLabel(page.stage) === filter.value || page.stage === filter.value;
  if (filter.field === "Inside") return page.inside === filter.value;
  return page.dependsOn.includes(filter.value);
}

export function visiblePages(pages: Page[], filters: DeskFilter[]): Page[] {
  return pages.filter((page) => filters.every((filter) => matches(page, filter)));
}

export function edges(pages: Page[]): { contains: Edge[]; depends: Edge[] } {
  const ids = new Set(pages.map((page) => page.id));
  const contains: Edge[] = [];
  const seen = new Set<string>();
  const pushContains = (from: string, to: string) => {
    if (!ids.has(from) || !ids.has(to)) return;
    const key = `${from}>${to}`;
    if (seen.has(key)) return;
    seen.add(key);
    contains.push({ from, to });
  };
  for (const page of pages) {
    if (page.type === "Initiative") {
      for (const id of page.packetIds) pushContains(page.id, id);
    }
    if (page.type === "Packet" && page.inside) pushContains(page.inside, page.id);
  }
  const depends: Edge[] = [];
  for (const page of pages) {
    for (const id of page.dependsOn) {
      if (ids.has(id)) depends.push({ from: page.id, to: id });
    }
  }
  return { contains, depends };
}
