# PM-PACKET-009 — Founder inbox

**Wake:** plant

Plates: [`plates/packet-009/`](./plates/packet-009/README.md). The founder ordered the plant after Tower commit `3ff7729` (31 Oct 2026, 11:05 AM America/Toronto) put `explainFactory` on the operating branch.

## Founder lock

The banner is the pulse. It is not a separate compartment. Open releases are the first rows in that drawer, in the order they opened. Each has Review. The review page stays: specification, changes, ledger checks, pull request checks, dependencies, and Merge. Why and Next are added on that page and on every row.

Explainable factory state is this same cut. The desk says why the work has not advanced, and what advances it. Where the ledger or the factory manifest does not record the answer, the desk says Unknown.

GitHub stays the infrastructure. Trigger is where you read it. The merge write is not this cut.

## What was read

31 Oct 2026, 10:44 AM America/Toronto.

Operating branch `cursor/execution-architecture-74f7` at `54fc257`. Ledger revision 192. Scope active. `founderDecision` null. Controller activation inactive. `dispatch` forbidden. Dispatches 43 of 50. Cadence event.

`GET /api/snapshot` on https://trigger-theta-cyan.vercel.app returned ref `cursor/factory-agents-scope-33ee`, revision 122, scope suspended, activation inactive, `readFailed` false. The server selected that snapshot. It is not a stale page. This cut does not change which ref production follows. The plates are revision 192. A desk on revision 122 does not have these releases, and it still shows dispatches that revision 192 has superseded.

## Releases

`releases` is already on the ledger. Every entry below has `mergeSha` null. The drawer is these entries, oldest first. A packet whose stage is `released` and that is absent from `releases` is not one of them.

| Release | Packets | Pull request | Opened (America/Toronto) |
| --- | --- | --- | --- |
| `rel-pkt-002-open-ask-cursor` | `pkt-002-open-ask-cursor` | [141](https://github.com/bywale-com/omcoda_tower/pull/141) | 9:43 AM |
| `rel-pkt-003-resume-same-run` | `pkt-003-resume-same-run` | [142](https://github.com/bywale-com/omcoda_tower/pull/142) | 9:43 AM |
| `rel-pkt-007-fact-writes` | `pkt-007-fact-writes` | [143](https://github.com/bywale-com/omcoda_tower/pull/143) | 10:38 AM |
| `rel-pkt-005-audit-row-grain` | `pkt-005-audit-row-grain` | [144](https://github.com/bywale-com/omcoda_tower/pull/144) | 10:38 AM |
| `rel-pkt-008-meeting-writes` | `pkt-008-meeting-writes` | [145](https://github.com/bywale-com/omcoda_tower/pull/145) | 10:39 AM |
| `rel-pkt-010-campaign-failure-writes` | `pkt-010-campaign-failure-writes` | [146](https://github.com/bywale-com/omcoda_tower/pull/146) | 10:39 AM |
| `rel-pkt-004-firing-handle--pkt-006-id-keyed-loads` | `pkt-004-firing-handle`, `pkt-006-id-keyed-loads` | [147](https://github.com/bywale-com/omcoda_tower/pull/147) | 10:39 AM |
| `rel-pkt-013-firm-provision-writes` | `pkt-013-firm-provision-writes` | [148](https://github.com/bywale-com/omcoda_tower/pull/148) | 10:40 AM |

Those packets are `verified`. Ledger checks for 141 and 142 are the passes already recorded. PR 141, read with the plates: `factory-check` failed, `verify:ship` passed, Vercel passed. The review shows the ledger checks and the pull request’s checks as separate facts.

## Sentences

Trigger does not add a store and does not write these sentences. It runs the same derivation Tower prints from `explainFactory` on the ledger it already fetched. A missing fact stays Unknown. The pass does not write a stage and does not read handoff prose.

Factory dispatch [41213188243](https://github.com/bywale-com/omcoda_tower/actions/runs/41213188243) printed, at ledger revision 193:

**Factory operating · 0 Engineers active · 0 packets awaiting verification · 8 releases awaiting your review**

`pkt-019-first-step-send-denied` is `engineering`. Execution `dsp-172` is `interrupted` with reason `lease_expired`. The sentence is intervention, next Unknown: an engineer wake requires `change_specified`, and a repair wake requires a classified failure.

`pkt-009-eligibility-writes`, `pkt-011-halt-records-writes`, `pkt-012-consent-opt-out-writes`, `pkt-014-empty-firing-audience`, and `pkt-017-tick-send-halt` are `released`. The Analyst dispatch for that revision is recorded as ran. They stay intervention, next Unknown. They are not in the founder inbox.

`pkt-015-halt-enroll-firm` is verified and waiting on `pkt-017-tick-send-halt` and `pkt-019-first-step-send-denied`.

Pull requests 141–148 are the founder inbox. The architect lane is off. Engineer queue depth is 1, so `exec-identity` is held and the next step is to include the architect lane.

Scope and controller activation stay separate facts on the quiet line. Calling the factory operating is the scope sentence. It does not mean the controller manifest is active.

## Face

Closed pulse: Tower’s headline. On revision 193 that is **Factory operating · 0 Engineers active · 0 packets awaiting verification · 8 releases awaiting your review**.

Quiet line under it: `scope active · controller inactive · 43/50 · event · architect lane off · 6 intervention`

The existing lip opens the drawer. Releases first, by `openedAt`. The running execution after them. A release row is the manifest title, the sentence, and Review. The running row has no Review.

Phone: the sentence stays visible with the lip closed. The rows open with that lip. The closed header does not gain a branch line. The board stays one table and scrolls sideways.

Why and Next are columns on that table. Stage stays the lifecycle word.

Review is the packet page. Why and Next are the first properties. Specification is the factory intent. Changes are the pull request files when that read works. Verification is `execution.checks`. Pull request checks are that pull request’s checks. Dependencies are the manifest siblings. The ledger `prNumber` and `prUrl` show when `github.available` is false. Merge is on the page and does not call GitHub.

## Technical cut

| File | Job |
| --- | --- |
| `src/observe/tower/explain.ts` | The same derivation Tower prints. No second sentence table. |
| `src/observe/snapshot.ts` | Carry the explanation, the ledger release, and Why / Next / Who on each page. |
| `src/observe/tower/read.ts` | Run `explainFactory` on the ledger JSON already fetched. No second fetch and no new store. |
| `src/desk/Pulse.tsx` | The sentence, the quiet line, and the drawer. No second band. |
| `src/desk/TableView.tsx` | Why and Next on the existing board. |
| `src/desk/Detail.tsx` | Why and Next. The review block for a packet named by an open release. |
| `src/observe/external/project.ts` | `get_packet` and the release list include `prNumber`, `prUrl`, `mergeSha`, why, and next. |
| `src/observe/external/mcp.ts` | The read tools return that. No write tool. |
| `src/observe/tower/github.ts` | A failed enrichment still leaves the ledger pull request visible. Pull request checks attach only when that read succeeds. |

## Not this cut

The merge write. A server-side token, later, that can merge only a Tower release pull request whose packet is `verified` and whose `mergeSha` is null.

A sentence the desk writes itself. Unknown stays Unknown when `explainFactory` says Unknown.

Pointing production at a different factory ref.

Calling a worker stalled because `runningAt` is old. Treating controller activation and scope status as the same fact.
