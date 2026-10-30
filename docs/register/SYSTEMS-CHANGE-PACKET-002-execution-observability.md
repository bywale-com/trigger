# SYSTEMS-CHANGE-PACKET-002 — GitHub execution evidence

**Signed:** 11:02 UTC 2026-10-30  
**Initiative:** [`PM-PACKET-002-execution-observability.md`](./PM-PACKET-002-execution-observability.md) on PR 4, branch `cursor/observability-v1-plates-7b9a`  
**Glass:** packet 001 plates, unchanged. This packet extends the shared page.  
**Walk:** [`PM-PACKET-002-execution-observability-TEST.md`](./PM-PACKET-002-execution-observability-TEST.md)  
**Remap:** no migration. Trigger still has no SQL. This number is not a schema version.

Plant on that PR. Do not open a second PR. Do not modify Tower. Do not add a wake workflow.

## Intent

The desk already reads Tower’s ledger. The founder needs that same page to follow the implementation those ledger SHAs name on GitHub — branch, pull request, commits, checks, preview, merge — without Trigger becoming a second factory or scanning the repository.

## Must

- Keep the packet 001 snapshot, table, graph, refresh, and failed-read behavior.
- Copy `dispatchHistory` from the work item the same way packet 001 copied `dispatch`. Copy `issuedAt` and `workerExecution` when present.
- Derive six lifecycle facts on the snapshot: Dispatched, Running, Committed, Verified, Integrated, Accepted. Presence is `yes`, `no`, or `unknown`. Rules are the table in the PM packet. Do not collapse them. Do not rename ledger `stage`.
- Running is yes only for an unexpired lease or a GitHub check-run / Actions run in `queued` or `in_progress` on an associated SHA. A current dispatch without that evidence is Running `unknown`, not `yes`.
- Associate GitHub artifacts only from: ledger SHAs (`prHead`, `candidateSha`, `verifiedSha`, `integratedSha`), `reconciliationId` matching `^pr-(\d+)-([0-9a-f]{7,40})$`, GitHub `GET /commits/{sha}/pulls`, and `GET /pulls?head={owner}:{configured-ref}` for the factory pull request. Cap unique SHAs at 12 and unique pull requests at 6.
- Construct Actions links as `https://github.com/{repo}/actions/runs/{runId}` from ledger `runId`. Do not require a second fetch to show the link.
- Preview is `environment_url` on a GitHub deployment status, or unavailable.
- Fixture mode (`TOWER_FIXTURE`) does not call GitHub. GitHub failure or timeout must not fail `readTower`. Mark GitHub `unavailable` and keep the ledger snapshot.
- Packet page: keep the packet 001 properties, then Lifecycle, responsible execution, GitHub artifacts with links. Initiative page: Dispatched and Running only, plus the architect dispatch record. Do not invent candidate/verified/integrated/accepted on the initiative.
- Light and dark remain Ant `defaultAlgorithm` and `darkAlgorithm`, primary `#1677ff`, radius 6, font 14, control height 32.
- Header may show `PR {n}` as a link when the factory pull request lookup returned one. No source switcher. `TOWER_REF` / `source.json` stay the factory source.

## Must-not

- Do not mint a Trigger table or database. No SQL.
- Do not import `.factory/controller/*`. Do not call `decide`, `controlStep`, `dispatchWake`, or the label actuator.
- Do not scan repository branches. Do not match `cursor/{packet}` names. Do not parse commit messages for packet ids.
- Do not hard-code pull request 137, branch `cursor/factory-agents-scope-33ee`, or any agent branch as the association rule. Those values may appear because the configured ref and GitHub returned them.
- Do not treat dispatch, `session === "running"`, or a green check as Integrated or Accepted.
- Do not invent preview URLs from Vercel dashboard `target_url` values.
- Do not fail the 60-second refresh because GitHub 403’d.
- Do not add Run, Stop, Authorize, Dispatch, or a branch picker.
- Do not redesign TableView or GraphView columns.

## Conflicts locked

| Fact | Ledger | GitHub | Rule |
|---|---|---|---|
| Production stage | `stage`, `candidateSha`, `verifiedSha`, `integratedSha`, `reconciliationId` | Pull merged, checks passed | Ledger wins. GitHub is additional evidence on the page. |
| Factory source | `TOWER_REF` / `source.json` | Pull whose `head.ref` equals that ref | The configured ref is the factory source. The pull is a link for that ref. |
| Working branch | none | `head.ref` of the pull GitHub associated with a named SHA | That `head.ref`. If GitHub associated the SHA with the factory pull, the working branch is the factory branch. |
| Worker actually ran | `lease.until > readAt`, history `workerExecution` | Check-run `in_progress` / `queued` | Live Running uses lease or in-progress GitHub. History `ran` / `absent` is labeled history. Dispatch alone is not Running. |
| PKT-001 integration | Live `reconciliationId` `pr-136-…` | Pull 136 `merged: true` | Show both. Fixture revision 1 has `reconciliationId` null; show none. |

## Stores

**Materialized, external.**

- `.factory/state/ledger.json` — same `FactoryLedger` as packet 001, including `dispatchHistory` on the work item (`WorkItem` in `.factory/controller/machine.ts`).
- GitHub REST, read-only, scoped: commit-to-pull, pull by number, pull commits, check-runs, deployments and their statuses, pulls-by-head for the configured ref. Repo `bywale-com/omcoda_tower` unless `TOWER_REPO` says otherwise.

**Materialized in Trigger.** Nothing. No new database.

**Map-only.** Lifecycle facts and `github` on the snapshot. Process memory. A restart drops them. Do not write them to disk.

**Named silence.**

- Cursor cloud-agent ids, session transcripts, and spend.
- Repository branch lists.
- Vercel API. Preview comes from GitHub deployment statuses or not at all.
- `session === "running"` as proof of a live worker. Packet 001 execution strings stay; lifecycle Running does not use that session word.

### Snapshot additions

On every page: `lifecycle: { id, label, presence, basis }[]`.

On packet pages, and on initiatives when a dispatch exists: `github: { available, unavailableReason, workingBranch, pull, latestSha, commits, checks, preview, merge }`. Fixture and failed GitHub set `available: false`.

On the snapshot: `factoryPull: { number, url, state, branch, headSha } | null`.

`readAt` stays UTC without fractional seconds. Lease comparison stays `lease.until > readAt`.

## Runtime

Same as packet 001: server reads, browser receives JSON, no token in the client. Refresh 60 seconds. GitHub lookups share one in-process map per SHA / pull number for that read. Parallel, 4-second per-request abort, overall GitHub budget must leave the Vercel function able to finish (do not wait serially on twelve SHAs).

## Ports

**Real.** Read-only GitHub REST as listed. Token from `TOWER_GITHUB_TOKEN` or `GITHUB_TOKEN` when it is a real `ghp_` / `github_pat_` value. Unauthenticated is allowed; 403/404 become unavailable.

**Stand-in.** Fixture tree: no GitHub.

**Refused.** Writes. Label actuator. Branch list. Contents API writes. Vercel deployment create.

## Verify

Walk the packet 002 test sheet. Keep the packet 001 fixture walk green.

Also, on the snapshot:

- Fixture packet: Dispatched no, Running no, Committed yes, Verified yes, Integrated no, Accepted no. `github.available` false.
- A copied snapshot with `dispatch` set and `lease` null: Dispatched yes, Running unknown.
- A copied snapshot with `lease.until` after `readAt`: Running yes.
- `parseReconciliationId("pr-136-9c45f19fa1ac9d909247d6be83c9263273b1bcbb")` returns `{ pr: 136, sha: "9c45f19fa1ac9d909247d6be83c9263273b1bcbb" }`. `"cursor/pkt-002-open-ask-cursor"` is not an association key.
- Live configured-branch read still returns pages when GitHub 403s.

## Out of scope

A Trigger database. A second controller. Editing Tower. A branch switcher. Redesigning the table. Percentages. Cursor agent APIs.
