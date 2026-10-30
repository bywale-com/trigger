# PM-PACKET-002 — Cross-branch execution observability

**Wake:** sa

**Direction:** [`PRODUCT-DIRECTION-V1.md`](./PRODUCT-DIRECTION-V1.md)  
**Grain:** [`V1-OBSERVABILITY-SPEC.md`](./V1-OBSERVABILITY-SPEC.md) §7  
**Test:** [`PM-PACKET-002-execution-observability-TEST.md`](./PM-PACKET-002-execution-observability-TEST.md)  
**Initiative:** PR 4, branch `cursor/observability-v1-plates-7b9a`. Do not open a cousin PR.

## Founder lock

> Trigger V1 — Cross-Branch Execution Observability
>
> Trigger should follow the work, not require the founder to manually locate the branch on which an agent is operating.
>
> The factory ledger remains the authoritative source of production state. GitHub supplies additional execution and implementation evidence.
>
> Trigger remains entirely read-only.
>
> Do not assume every agent creates a separate branch.
>
> Do not infer associations from coincidental branch names or commit messages alone.
>
> Do not collapse these into a generic Completed status.
>
> Do not represent a successful dispatch as proof that an agent ran.
>
> Do not represent a successful CI run as proof that the implementation was merged.
>
> The branch is simply one of the places where evidence lives.

The Ant chrome, the table, the graph, and the packet 001 detail properties stay. This packet extends the shared page. It does not restyle the desk.

## What the factory actually does

Read at `bywale-com/omcoda_tower` `cursor/factory-agents-scope-33ee` `f3ec0ca6de2d918bdefe4790455c4f91d48b6276`, ledger revision 41.

Workers sit on the factory pull request. The Engineer prompt says plant on this same pull request and this same branch. `githubLabelActuator` labels `FACTORY_PR`. `DispatchRecord.prHead` is the pull-request head SHA at the moment the label add was confirmed. `workerMayRun` matches packet id, revision, that SHA, and the label. A later commit that changes only `.factory/state/ledger.json` is still that wake.

The architecture page allows one branch per bounded change as a later optimization. Revision 41 does not use that path. Packet `candidateSha` `3246a074efecd8adb98e4ca232d443b90821173f` and dispatch `prHead` `f06148b747f212ef49678b226e3650cc353e598f` both associate, through GitHub’s commit-to-pull API, with pull request 137, head `cursor/factory-agents-scope-33ee`. Trigger must follow that association. It must not invent a packet-named branch.

Factory production state is still the ledger. GitHub is evidence about those SHAs and pull-request numbers the ledger already named.

## Face

The header still reads Trigger, `Tower · {ref} {sha}`, ledger revision, scope. When GitHub has associated the configured factory ref with a pull request through `GET /repos/{owner}/{repo}/pulls?head={owner}:{ref}`, the header also shows `PR {n}` as a link. That is the factory pull request. It is not a project switcher. It is not a branch scanner. `TOWER_REF` / `source.json` remain the factory source. `main` remains a possible value of that configuration. Agent working branches appear on the page of the work they belong to.

The table and the graph keep their columns, filters, edges, and the packet 001 execution strings. They consume the same snapshot. They do not grow six new columns.

The packet page keeps Stage, Wake, Release, Execution, Inside, Integrated SHA, then Intended behavior and the ledger checks. After those properties it shows:

1. **Lifecycle.** Six distinct facts, never collapsed: Dispatched, Running, Committed, Verified, Integrated, Accepted. Each is `yes`, `no`, or `unknown`. `unknown` is the honest state when GitHub could not be read. A yes is not a stage rename.
2. **Responsible execution.** The current dispatch record when one exists: effect, label, `prHead`, `issuedAt`, and `workerExecution` when history has recorded it. History rows stay history. `workerExecution: absent` is a dispatch that did not start a worker. `workerExecution: ran` is a past run, not a live one.
3. **Working branch and pull request**, only from GitHub’s commit-to-pull association for a named SHA, or from an explicit `reconciliationId` of the form `pr-{n}-{sha}`. If GitHub associated the SHA with the factory pull request, the working branch is that factory branch. That is evidence, not a second ledger.
4. **Latest commit** for that associated pull request, or the ledger SHA when no pull request was returned.
5. **Commit history** of that associated pull request, last ten, each a link.
6. **Verification results.** Ledger checks keep their run ids. Each run id is a link to `https://github.com/{repo}/actions/runs/{runId}`. GitHub check-runs for the relevant SHA are additional rows, matched by run id so they are not doubled. A green check is not Integrated and not Accepted.
7. **Preview deployment** when GitHub deployment statuses for that SHA carry an `environment_url`. Missing is `unavailable`, not a guessed Vercel host.
8. **Integration and acceptance.** `integratedSha`, `reconciliationId`, the GitHub merge bit on the associated integration pull request when that id names one. Factory `stage === "accepted"` is Accepted. A merged pull request without that stage is not Accepted.

The initiative page shows Dispatched and Running for the architect session the same way. It does not invent candidate, verified, integrated, or accepted on the initiative. Contained packets stay the way in.

Every GitHub artifact is a link. A missing artifact is the word `unavailable` or `unknown`. The desk does not invent certainty.

## Lifecycle rules

Copy these. Do not soften them.

| Fact | Yes | No | Unknown |
|---|---|---|---|
| Dispatched | Current `dispatch` is set, or `dispatchHistory` has a row | Both empty | Never, once the ledger was read |
| Running | An unexpired lease, or a GitHub check-run / Actions run on an associated SHA whose status is `queued` or `in_progress` | No current dispatch, no live lease, and no in-progress GitHub run | Current dispatch is set, lease is absent, and GitHub did not confirm an in-progress run (including when GitHub was unreachable) |
| Committed | `candidateSha` is set | `candidateSha` is null | Never, once the ledger was read |
| Verified | `verifiedSha` is set | `verifiedSha` is null | Never, once the ledger was read |
| Integrated | `integratedSha` is set | `integratedSha` is null | Never, once the ledger was read |
| Accepted | Ledger `stage` is `accepted` | Any other stage | Never, once the ledger was read |

Dispatch acknowledgement is not Running. `session === "running"` is still the packet 001 execution string. Lifecycle Running is stricter. The two may disagree, and that disagreement is the product.

Passing GitHub checks are not Verified unless the ledger has `verifiedSha`. A merged GitHub pull request is not Integrated unless the ledger has `integratedSha`, and not Accepted unless the stage is `accepted`.

## Technical cut

| File | Job |
|---|---|
| `src/observe/snapshot.ts` | Keep the snapshot. Add `dispatchHistory`, `issuedAt`, `workerExecution`. Add lifecycle and GitHub evidence types. Derive the six facts. Table and graph keep reading the existing page fields. |
| `src/observe/tower/github.ts` | Read-only, scoped GitHub lookups from named SHAs, named run ids, the configured factory ref, and `reconciliationId` PR numbers. No branch-name scan. Soft-fail. |
| `src/observe/tower/read.ts` | After the ledger snapshot, attach GitHub evidence. Fixture mode skips GitHub. A GitHub failure must not fail the Tower read. |
| `src/desk/Detail.tsx` | The new sections on the existing page. Ant tags, both algorithms. Links. |
| `src/desk/chrome.tsx` | Optional factory `PR {n}` after the source line when the snapshot has it. No switcher. |

Do not import the Tower controller. Do not mint a Trigger table. Do not pin a factory SHA. Do not hard-code pull request 137 or an agent branch. Do not add factory controls.

## Named for the Systems Analyst

GitHub is a port, not a store. The ledger remains the record. `projectFactory` already returns `candidateSha`, `verifiedSha`, `integratedSha`, `reconciliationId`, `dispatch`, `dispatchHistory`, and `checks`. Copy `dispatchHistory` the same way packet 001 copied `dispatch`. The commit-to-pull API is GitHub’s association, not a Trigger inference. `reconciliationId` `pr-{n}-{sha}` is an explicit factory encoding.

`TOWER_REF` stays the factory source. Identifying the factory pull request by `head={owner}:{configured-ref}` is a lookup of that configured ref. It is not a scan of the repository.

## Out of scope

A second workflow ledger. A factory controller. Writing GitHub. A branch picker. Redesigning the table or graph. Collapsing the six facts. Treating Vercel dashboard URLs as preview hosts when `environment_url` is absent.
