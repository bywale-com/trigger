/**
 * Which Tower branch is the factory Trigger reads.
 *
 * TOWER_REF is an explicit view. Otherwise the source is the factory pointer
 * when Tower has published one, or the factory-dispatch run whose commit
 * advanced the ledger furthest. source.json is the fallback when neither
 * signal is present. This does not scan branches and does not write a ledger.
 */

export type FactorySignal = { ref: string; stateRevision: number };

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
  if (!parsed || typeof parsed.ref !== "string" || typeof parsed.stateRevision !== "number") return null;
  if (!Number.isInteger(parsed.stateRevision) || parsed.stateRevision < 0) return null;
  const ref = safeFactoryRef(parsed.ref);
  if (!ref) return null;
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
    if (!best || stateRevision > best.stateRevision) best = { ref, stateRevision };
  }
  return best;
}

export function chooseFactorySource(input: {
  configured: string;
  pointer: FactorySignal | null;
  observed: FactorySignal | null;
}): string {
  const ranked: { ref: string; stateRevision: number; order: number }[] = [];
  const add = (candidate: FactorySignal | null, order: number) => {
    if (!candidate || !Number.isInteger(candidate.stateRevision) || candidate.stateRevision < 0) return;
    const ref = safeFactoryRef(candidate.ref);
    if (!ref) return;
    ranked.push({ ref, stateRevision: candidate.stateRevision, order });
  };
  add(input.pointer, 2);
  add(input.observed, 1);
  ranked.sort((a, b) => b.stateRevision - a.stateRevision || b.order - a.order);
  return ranked[0]?.ref ?? input.configured;
}

export async function resolveFactoryRef(input: {
  configured: string;
  repo: string;
  get: (url: string) => Promise<{ status: number; json: unknown }>;
}): Promise<string> {
  try {
    const [pointerResult, runsResult] = await Promise.all([
      input.get(operatingPointerUrl(input.repo)),
      input.get(dispatchRunsUrl(input.repo)),
    ]);
    const pointer = pointerResult.status === 200 ? pointerFromContents(pointerResult.json) : null;
    const observed = runsResult.status === 200 ? observedFactory(runsResult.json, input.repo) : null;
    return chooseFactorySource({ configured: input.configured, pointer, observed });
  } catch {
    return input.configured;
  }
}
