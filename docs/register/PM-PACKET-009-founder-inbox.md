# PM-PACKET-009 — Founder inbox

**Wake:** hold

Plates: [`plates/packet-009/`](./plates/packet-009/README.md). Approve the plates before this wake moves. The plant does not start while this line says hold.

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

Trigger does not add a store. It reads fields Tower already records and says only these sentences.

| Recorded fact | Why | Next |
| --- | --- | --- |
| A `releases` entry with `mergeSha` null | Awaiting your review. | Merge release PR `{prNumber}`. The opened time is `openedAt`. |
| Execution `phase` `running`, `startedAt` set, `endedAt` null, lease `until` after the read | Running, confirmed. Worker started at `startedAt`. Last recorded activity is `runningAt` when that field is set. | `execution.reason`, or Unknown when `reason` is null. |
| `factory.json` `activation` is `inactive`, and the advance is a dispatch | Controller inactive. | Controller activation. |
| Stage `verified`, `releaseEligible`, no `releases` entry | Unknown. | Unknown. |
| Stage `accepted` and `integratedSha` set | Integrated. | This row is not in the drawer. |

`pkt-019-first-step-send-denied` is the running case. Execution `dsp-172` is `running`, started 9:48 AM America/Toronto, last activity 9:51 AM, lease until 10:51 AM, `reason` null. The lease role is engineer. Next is Unknown. The manifest says checkpoint enforcement is an instruction and that no timer observes the interval, so the age of `runningAt` is not a stall.

`pkt-018-send-denied-engagement` is also listed on `dsp-172`. Its stage is `verified` and it has no release. Its sentence is Unknown, not running.

`pkt-009-eligibility-writes` and the other `released` packets with `wake` `sa` and no release use the controller sentence. Activation is inactive, so the controller does not dispatch. The desk does not say the analyst is the thing that advances them while that is true.

`pkt-015-halt-enroll-firm`, `pkt-016-halt-send-firm`, and `pkt-018` are `verified` with no release. Unknown.

`pkt-001-click-attribution` is `accepted` and integrated. It is not an alert.

An unconfirmed dispatch is a current row only while it is still that packet’s `dispatch` and no later execution for that packet has `phase` `completed`. On revision 192, `pkt-002` and `pkt-003` have `dispatch` null and stage `verified`. They are not unconfirmed. `exec-identity` session is `continuation_due` and its `dispatch` is null. It is not unconfirmed. Its sentence is controller inactive.

## Face

Closed pulse: **8 releases awaiting your review · 1 Engineer running**

Quiet line under it: `scope active · controller inactive · 43/50 · event`

The existing lip opens the drawer. Releases first, by `openedAt`. The running execution after them. A release row is the manifest title, the sentence, and Review. The running row has no Review.

Phone: the sentence stays visible with the lip closed. The rows open with that lip. The closed header does not gain a branch line. The board stays one table and scrolls sideways.

Why and Next are columns on that table. Stage stays the lifecycle word.

Review is the packet page. Why and Next are the first properties. Specification is the factory intent. Changes are the pull request files when that read works. Verification is `execution.checks`. Pull request checks are that pull request’s checks. Dependencies are the manifest siblings. The ledger `prNumber` and `prUrl` show when `github.available` is false. Merge is on the page and does not call GitHub.

## Technical cut

| File | Job |
| --- | --- |
| `src/observe/snapshot.ts` | Carry `releases` and the execution fields the sentences use: `phase`, `startedAt`, `runningAt`, `endedAt`, `reason`. |
| `src/observe/tower/read.ts` | Pass those through. No second fetch and no new store. |
| `src/observe/tower/pulse.ts` | The sentences and the drawer order. Unconfirmed only for a dispatch that is still unresolved. |
| `src/desk/Pulse.tsx` | The sentence, the quiet line, and the drawer. No second band. |
| `src/desk/TableView.tsx` | Why and Next on the existing board. |
| `src/desk/Detail.tsx` | Why and Next. The review block for a packet named by an open release. |
| `src/observe/external/project.ts` | `get_packet` and the release list include `prNumber`, `prUrl`, `mergeSha`, why, and next. |
| `src/observe/external/mcp.ts` | The read tools return that. No write tool. |
| `src/observe/tower/github.ts` | A failed enrichment still leaves the ledger pull request visible. Pull request checks attach only when that read succeeds. |

## Not this cut

The merge write. A server-side token, later, that can merge only a Tower release pull request whose packet is `verified` and whose `mergeSha` is null.

A Tower field for a transition reason. Unknown stays Unknown until that field exists.

Any sentence that is not in the table above.

Pointing production at a different factory ref.

Calling a worker stalled because `runningAt` is old. Calling the factory operating while `activation` is inactive.
