/**
 * Read-only GitHub evidence for named ledger SHAs and pull-request numbers.
 * Does not scan repository branches or parse commit messages.
 */
import {
  commitUrl,
  emptyGithub,
  initiativeLifecycle,
  packetLifecycle,
  parseReconciliationId,
  pullUrl,
  type FactoryPull,
  type GithubCheck,
  type GithubCommit,
  type GithubEvidence,
  type GithubPreview,
  type GithubPull,
  type Page,
  type Snapshot,
} from "../snapshot.ts";

export type GithubGet = (url: string) => Promise<{ status: number; json: unknown }>;

const SHA_MAX = 12;
const PR_MAX = 6;
const COMMIT_MAX = 10;

type PullJson = {
  number?: number;
  html_url?: string;
  state?: string;
  merged?: boolean;
  title?: string;
  head?: { ref?: string; sha?: string };
};

type CommitJson = {
  sha?: string;
  html_url?: string;
  commit?: { message?: string };
};

type CheckRunJson = {
  name?: string;
  html_url?: string;
  status?: string;
  conclusion?: string | null;
  details_url?: string;
};

type DeploymentJson = { id?: number; environment?: string; sha?: string };

type DeploymentStatusJson = {
  state?: string;
  environment?: string;
  environment_url?: string;
  description?: string;
};

export function namedShas(pages: Page[]): string[] {
  const found = new Set<string>();
  const add = (value: string | null | undefined) => {
    if (value && /^[0-9a-f]{40}$/i.test(value)) found.add(value.toLowerCase());
  };
  for (const page of pages) {
    if (page.dispatch) add(page.dispatch.prHead);
    if (page.type === "Packet") {
      add(page.candidateSha);
      add(page.verifiedSha);
      add(page.integratedSha);
      for (const record of page.dispatchHistory) add(record.prHead);
      const parsed = parseReconciliationId(page.reconciliationId);
      if (parsed && parsed.sha.length === 40) add(parsed.sha);
    }
  }
  return [...found].slice(0, SHA_MAX);
}

export function namedPullNumbers(pages: Page[]): number[] {
  const found = new Set<number>();
  for (const page of pages) {
    if (page.type !== "Packet") continue;
    const parsed = parseReconciliationId(page.reconciliationId);
    if (parsed) found.add(parsed.pr);
  }
  return [...found].slice(0, PR_MAX);
}

export async function githubGet(url: string, token?: string): Promise<{ status: number; json: unknown }> {
  const headers: Record<string, string> = {
    "user-agent": "trigger-observe",
    accept: "application/vnd.github+json",
  };
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(4_000) });
  let json: unknown = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }
  return { status: response.status, json };
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function pullFrom(json: unknown, repo: string): GithubPull | null {
  if (!json || typeof json !== "object") return null;
  const row = json as PullJson;
  if (!Number.isInteger(row.number) || !row.number) return null;
  return {
    number: row.number,
    url: row.html_url ?? pullUrl(repo, row.number),
    state: row.state ?? "unknown",
    merged: typeof row.merged === "boolean" ? row.merged : row.state === "open" ? false : null,
    branch: row.head?.ref ?? null,
    headSha: row.head?.sha ?? null,
    title: row.title ?? null,
  };
}

export async function enrichSnapshot(
  snapshot: Snapshot,
  get: GithubGet,
  opts: { enabled: boolean; tokenUnavailableReason?: string },
): Promise<Snapshot> {
  if (!opts.enabled) {
    return markUnavailable(snapshot, "fixture");
  }
  try {
    return await attach(snapshot, get);
  } catch {
    return markUnavailable(snapshot, opts.tokenUnavailableReason ?? "github unavailable");
  }
}

function markUnavailable(snapshot: Snapshot, reason: string): Snapshot {
  return {
    ...snapshot,
    factoryPull: snapshot.factoryPull,
    pages: snapshot.pages.map((page) => {
      const github = { ...page.github, available: false, unavailableReason: reason };
      return page.type === "Packet"
        ? { ...page, github, lifecycle: packetLifecycle(page, snapshot.readAt, github) }
        : { ...page, github, lifecycle: initiativeLifecycle(page, github) };
    }),
  };
}

async function attach(snapshot: Snapshot, get: GithubGet): Promise<Snapshot> {
  const repo = snapshot.repo;
  const cache = new Map<string, Promise<{ status: number; json: unknown }>>();
  const load = (url: string) => {
    const pending = cache.get(url);
    if (pending) return pending;
    const request = get(url);
    cache.set(url, request);
    return request;
  };

  const factoryLookup = load(
    `https://api.github.com/repos/${repo}/pulls?head=${repo.split("/")[0]}:${encodeURIComponent(snapshot.ref)}&state=all&per_page=5`,
  );
  const shaList = namedShas(snapshot.pages);
  const shaPulls = await Promise.all(
    shaList.map(async (sha) => {
      const result = await load(`https://api.github.com/repos/${repo}/commits/${sha}/pulls`);
      return { sha, pulls: asArray<PullJson>(result.status === 200 ? result.json : []).map((row) => pullFrom(row, repo)).filter(Boolean) as GithubPull[] };
    }),
  );
  const factoryResult = await factoryLookup;
  if (factoryResult.status === 403 || factoryResult.status === 401) {
    return markUnavailable(snapshot, "github unavailable");
  }
  const factoryPull =
    factoryResult.status === 200 ? pullFrom(asArray<PullJson>(factoryResult.json)[0] ?? null, repo) : null;
  const factory: FactoryPull | null = factoryPull
    ? {
        number: factoryPull.number,
        url: factoryPull.url,
        state: factoryPull.state,
        branch: factoryPull.branch,
        headSha: factoryPull.headSha,
      }
    : null;

  const pullsBySha = new Map(shaPulls.map((row) => [row.sha, row.pulls]));
  const numbers = new Set<number>(namedPullNumbers(snapshot.pages));
  if (factory?.number) numbers.add(factory.number);
  for (const row of shaPulls) for (const pull of row.pulls) numbers.add(pull.number);
  const pullNumbers = [...numbers].slice(0, PR_MAX);

  const pullDetails = new Map<number, GithubPull>();
  await Promise.all(
    pullNumbers.map(async (number) => {
      const result = await load(`https://api.github.com/repos/${repo}/pulls/${number}`);
      const pull = result.status === 200 ? pullFrom(result.json, repo) : null;
      if (pull) pullDetails.set(number, pull);
    }),
  );

  const commitsByPull = new Map<number, GithubCommit[]>();
  await Promise.all(
    pullNumbers.map(async (number) => {
      const result = await load(`https://api.github.com/repos/${repo}/pulls/${number}/commits?per_page=${COMMIT_MAX}`);
      if (result.status !== 200) return;
      const commits = asArray<CommitJson>(result.json).map((row) => ({
        sha: row.sha ?? "",
        url: row.html_url ?? (row.sha ? commitUrl(repo, row.sha) : ""),
        message: row.commit?.message?.split("\n")[0] ?? null,
      })).filter((row) => row.sha);
      commitsByPull.set(number, commits);
    }),
  );

  const checkBySha = new Map<string, GithubCheck[]>();
  await Promise.all(
    shaList.map(async (sha) => {
      const result = await load(`https://api.github.com/repos/${repo}/commits/${sha}/check-runs?per_page=20`);
      if (result.status !== 200 || !result.json || typeof result.json !== "object") return;
      const runs = asArray<CheckRunJson>((result.json as { check_runs?: CheckRunJson[] }).check_runs);
      checkBySha.set(
        sha,
        runs.map((run) => ({
          name: run.name ?? "check",
          runId: runIdFrom(run.html_url ?? run.details_url ?? null),
          outcome: run.conclusion ?? run.status ?? null,
          url: run.html_url ?? run.details_url ?? null,
          source: "github" as const,
        })),
      );
    }),
  );

  const previewBySha = new Map<string, GithubPreview>();
  const previewShas = new Set<string>();
  for (const page of snapshot.pages) {
    if (page.type === "Packet") {
      if (page.candidateSha) previewShas.add(page.candidateSha.toLowerCase());
      if (page.dispatch?.prHead) previewShas.add(page.dispatch.prHead.toLowerCase());
    }
  }
  if (snapshot.sha) previewShas.add(snapshot.sha.toLowerCase());
  await Promise.all(
    [...previewShas].slice(0, SHA_MAX).map(async (sha) => {
      const result = await load(`https://api.github.com/repos/${repo}/deployments?sha=${sha}&per_page=5`);
      if (result.status !== 200) return;
      const deployments = asArray<DeploymentJson>(result.json);
      const preview = deployments.find((row) => (row.environment ?? "").toLowerCase() === "preview") ?? deployments[0];
      if (!preview?.id) return;
      const statuses = await load(`https://api.github.com/repos/${repo}/deployments/${preview.id}/statuses`);
      if (statuses.status !== 200) return;
      const withUrl = asArray<DeploymentStatusJson>(statuses.json).find((row) => row.environment_url);
      if (!withUrl?.environment_url) return;
      previewBySha.set(sha, {
        url: withUrl.environment_url,
        environment: withUrl.environment ?? preview.environment ?? null,
        sha,
      });
    }),
  );

  const pages = snapshot.pages.map((page) => {
    const github = evidenceFor(page, {
      repo,
      pullsBySha,
      pullDetails,
      commitsByPull,
      checkBySha,
      previewBySha,
    });
    if (page.type === "Packet") {
      return { ...page, github, lifecycle: packetLifecycle(page, snapshot.readAt, github) };
    }
    return { ...page, github, lifecycle: initiativeLifecycle(page, github) };
  });
  return { ...snapshot, factoryPull: factory, pages };
}

function runIdFrom(url: string | null): string | null {
  if (!url) return null;
  return /\/actions\/runs\/(\d+)/.exec(url)?.[1] ?? null;
}

function evidenceFor(
  page: Page,
  ctx: {
    repo: string;
    pullsBySha: Map<string, GithubPull[]>;
    pullDetails: Map<number, GithubPull>;
    commitsByPull: Map<number, GithubCommit[]>;
    checkBySha: Map<string, GithubCheck[]>;
    previewBySha: Map<string, GithubPreview>;
  },
): GithubEvidence {
  const ledgerRows = page.github.checks.filter((check) => check.source === "ledger");
  const shas: string[] = [];
  const add = (value: string | null | undefined) => {
    if (value && /^[0-9a-f]{40}$/i.test(value)) shas.push(value.toLowerCase());
  };
  if (page.type === "Packet") {
    add(page.candidateSha);
    add(page.verifiedSha);
    add(page.dispatch?.prHead);
    add(page.integratedSha);
    for (const record of page.dispatchHistory) add(record.prHead);
  } else {
    add(page.dispatch?.prHead);
  }
  let associated: GithubPull | null = null;
  for (const sha of shas) {
    const found = ctx.pullsBySha.get(sha)?.[0];
    if (found) {
      associated = ctx.pullDetails.get(found.number) ?? found;
      break;
    }
  }
  const parsed = page.type === "Packet" ? parseReconciliationId(page.reconciliationId) : null;
  const integration = parsed ? ctx.pullDetails.get(parsed.pr) ?? null : null;
  const working = associated;
  const latestSha = working?.headSha ?? shas[0] ?? null;
  const githubChecks: GithubCheck[] = [];
  for (const sha of shas) {
    for (const check of ctx.checkBySha.get(sha) ?? []) githubChecks.push(check);
  }
  const checks = mergeChecks(ledgerRows, githubChecks);
  const preview =
    (latestSha && ctx.previewBySha.get(latestSha.toLowerCase())) ||
    shas.map((sha) => ctx.previewBySha.get(sha)).find(Boolean) ||
    null;
  const mergeSha = page.type === "Packet" ? page.integratedSha : null;
  return {
    available: true,
    unavailableReason: null,
    workingBranch: working?.branch ?? null,
    pull: working,
    latestSha,
    commits: working ? ctx.commitsByPull.get(working.number) ?? [] : [],
    checks,
    preview,
    merge: {
      merged: integration?.merged ?? working?.merged ?? null,
      sha: mergeSha,
      url: integration?.url ?? (parsed ? pullUrl(ctx.repo, parsed.pr) : working?.url ?? null),
    },
  };
}

function mergeChecks(ledger: GithubCheck[], github: GithubCheck[]): GithubCheck[] {
  const rows = [...ledger];
  const seen = new Set(ledger.map((check) => check.runId ?? check.name));
  for (const check of github) {
    const key = check.runId ?? check.name;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(check);
  }
  return rows;
}

export function emptyEnrich(snapshot: Snapshot, reason: string): Snapshot {
  return markUnavailable(snapshot, reason);
}
