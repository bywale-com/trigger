/**
 * Which Tower branch is the factory Trigger reads.
 *
 * A published operating ref is authoritative. The highest factory-ledger
 * dispatch run is the fallback when that ref is absent. source.json is the
 * last fallback, and production does not use it when both signals are missing.
 * A higher revision does not outrank the published ref. This does not scan
 * branches and does not write a ledger.
 */

export type FactorySignal = { ref: string; stateRevision: number | null };

const LEDGER_COMMIT = /^factory ledger (\d+)\b/;

export function dispatchRunsUrl(repo: string): string {
  return `https://api.github.com/repos/${repo}/actions/workflows/factory-dispatch.yml/runs?status=success&per_page=100`;
}

export function operatingPointerUrl(repo: string): string {
  return `https://api.github.com/repos/${repo}/contents/.factory/operating.json?ref=${encodeURIComponent("refs/factory/operating")}`;
}

export function safeFactoryRef(ref: string): string | null {
  const trimmed = ref.trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$/.test(trimmed)) return null;
  if (trimmed.includes("..") || trimmed.includes("//") || trimmed.endsWith("/") || trimmed.endsWith(".")) return null;
  if (trimmed.startsWith("refs/")) return null;
  return trimmed;
}

export function ledgerRevisionFromMessage(message: string): number | null {
  const line = message.split("\n")[0]?.trim() ?? "";
  const match = LEDGER_COMMIT.exec(line);
  if (!match) return null;
  const revision = Number(match[1]);
  if (!Number.isInteger(revision) || revision < 0) return null;
  return revision;
}

export function pointerFromContents(json: unknown): FactorySignal | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  const row = json as { content?: unknown; encoding?: unknown; ref?: unknown; stateRevision?: unknown };
  let parsed: { ref?: unknown; stateRevision?: unknown } | null = null;
  if (row.encoding === "base64" && typeof row.content === "string") {
    try {
      const text = Buffer.from(row.content.replace(/\s/g, ""), "base64").toString("utf8");
      parsed = JSON.parse(text) as { ref?: unknown; stateRevision?: unknown };
    } catch {
      return null;
    }
  } else if (typeof row.ref === "string") {
    parsed = row;
  }
  if (!parsed || typeof parsed.ref !== "string") return null;
  const ref = safeFactoryRef(parsed.ref);
  if (!ref) return null;
  if (parsed.stateRevision == null) return { ref, stateRevision: null };
  if (typeof parsed.stateRevision !== "number" || !Number.isInteger(parsed.stateRevision) || parsed.stateRevision < 0) {
    return null;
  }
  return { ref, stateRevision: parsed.stateRevision };
}

export function observedFactory(json: unknown, repo: string): FactorySignal | null {
  if (!json || typeof json !== "object") return null;
  const runs = (json as { workflow_runs?: unknown }).workflow_runs;
  if (!Array.isArray(runs)) return null;
  let best: FactorySignal | null = null;
  const seen = new Set<string>();
  for (const run of runs) {
    if (!run || typeof run !== "object") continue;
    const row = run as {
      conclusion?: unknown;
      head_branch?: unknown;
      head_sha?: unknown;
      head_repository?: { full_name?: unknown } | null;
      head_commit?: { message?: unknown } | null;
    };
    if (row.conclusion != null && row.conclusion !== "success") continue;
    const repository = row.head_repository?.full_name;
    if (typeof repository === "string" && repository !== repo) continue;
    const sha = typeof row.head_sha === "string" ? row.head_sha.toLowerCase() : "";
    if (sha) {
      if (seen.has(sha)) continue;
      seen.add(sha);
    }
    const message = typeof row.head_commit?.message === "string" ? row.head_commit.message : "";
    const stateRevision = ledgerRevisionFromMessage(message);
    const ref = typeof row.head_branch === "string" ? safeFactoryRef(row.head_branch) : null;
    if (stateRevision == null || !ref) continue;
    if (!best || best.stateRevision == null || stateRevision > best.stateRevision) best = { ref, stateRevision };
  }
  return best;
}

export function chooseFactorySource(input: {
  configured: string;
  pointer: FactorySignal | null;
  observed: FactorySignal | null;
}): string {
  const published = input.pointer ? safeFactoryRef(input.pointer.ref) : null;
  if (published) return published;
  const observed = input.observed ? safeFactoryRef(input.observed.ref) : null;
  if (observed && input.observed && (input.observed.stateRevision == null || input.observed.stateRevision >= 0)) return observed;
  return input.configured;
}

export type FactoryChoice = { ref: string; signaled: boolean };

export async function resolveFactoryChoice(input: {
  configured: string;
  repo: string;
  get: (url: string) => Promise<{ status: number; json: unknown }>;
}): Promise<FactoryChoice> {
  try {
    const [pointerResult, runsResult] = await Promise.all([
      input.get(operatingPointerUrl(input.repo)),
      input.get(dispatchRunsUrl(input.repo)),
    ]);
    const pointer = pointerResult.status === 200 ? pointerFromContents(pointerResult.json) : null;
    const observed = runsResult.status === 200 ? observedFactory(runsResult.json, input.repo) : null;
    return {
      ref: chooseFactorySource({ configured: input.configured, pointer, observed }),
      signaled: pointer != null || observed != null,
    };
  } catch {
    return { ref: input.configured, signaled: false };
  }
}

export async function resolveFactoryRef(input: {
  configured: string;
  repo: string;
  get: (url: string) => Promise<{ status: number; json: unknown }>;
}): Promise<string> {
  const choice = await resolveFactoryChoice(input);
  return choice.ref;
}

/** Production shows the operating factory or a failed read. It does not serve source.json in place of a missing signal. */
export function assertOperatingChoice(env: NodeJS.ProcessEnv, choice: FactoryChoice): string {
  if (env.VERCEL_ENV === "production" && !choice.signaled) {
    throw new Error("operating factory unresolved");
  }
  return choice.ref;
}
