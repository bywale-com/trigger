# PM-PACKET-009 — Founder inbox

**Wake:** hold

Plates: [`plates/packet-009/`](./plates/packet-009/README.md). Approve the plates before this wake moves. The plant does not start while this line says hold.

## Founder lock

The banner is the pulse band. Open Trigger and see **Your attention required — 2 releases**. Each release offers the specification, the code changes, the passing checks, the dependencies, and a Review / Merge action. The review experience comes first. An authorized merge comes after. GitHub stays the infrastructure. Trigger is where you operate.

MCP can see the packets and still cannot name the release pull requests. For both, `github.available` is false. Lifecycle says `verified`. There is no first-class awaiting-review record with the pull request, the changes, the verification, and the action.

## What the ledger already has

Tower ledger revision 176 on `cursor/execution-architecture-74f7` (31 Oct 2026). Scope active. 43 of 50 dispatches. An engineer lease is open on `pkt-019-first-step-send-denied`.

`releases` is already on the ledger. Trigger’s snapshot type does not carry it. This packet reads that object. It does not mint a store.

| Release | Packet | Pull request | mergeSha | Packet stage | Ledger checks |
| --- | --- | --- | --- | --- | --- |
| `rel-pkt-002-open-ask-cursor` | `pkt-002-open-ask-cursor` | [141](https://github.com/bywale-com/omcoda_tower/pull/141) | null | verified | `verify-open-ask-cursor` pass, `seat-handler-shape` pass |
| `rel-pkt-003-resume-same-run` | `pkt-003-resume-same-run` | [142](https://github.com/bywale-com/omcoda_tower/pull/142) | null | verified | `verify-resume-same-run` pass, `factory-check` pass |

Titles are the manifest titles. The inbox is every `releases` entry whose `mergeSha` is null. Packets whose stage is `released` and that are absent from `releases` stay out of the count.

The same read of the pull requests, same hour: PR 141 `factory-check` failed and `verify:ship` passed. PR 142 `factory-check` failed and `verify:ship` failed. The review shows the ledger checks and the pull request’s current checks as separate facts.

The desk shows whatever ledger it is pointed at. These two releases are on revision 176. A desk pointed at `source.json` (`cursor/factory-agents-scope-33ee`, revision 122) does not have this `releases` map.

## Face

Desktop: the attention line sits in the pulse band, under the scope and controller tags, above the table. The rows are open. Phone: the count stays visible. The rows open with the pulse lip. The closed phone header does not gain a branch line.

Review is the packet page. Specification is the factory intent, not a new summary. Changes are the pull request files when GitHub evidence is available. Verification is `execution.checks`. Pull request checks are that pull request’s checks when the GitHub read works. Dependencies are the manifest siblings. The ledger `prNumber` and `prUrl` show even when `github.available` is false.

Merge is on the page. This cut does not call GitHub.

## Technical cut

| File | Job |
| --- | --- |
| `src/observe/snapshot.ts` | Carry `releases` from the ledger JSON onto the snapshot. |
| `src/observe/tower/read.ts` | Pass `releases` through. No new store and no second fetch for the ledger. |
| `src/desk/Pulse.tsx` | Attention count in the pulse band. Phone rows follow the existing lip. |
| `src/desk/Detail.tsx` | Review block for a packet named by an open release. |
| `src/observe/external/project.ts` | `get_packet` and a release list include `prNumber`, `prUrl`, `mergeSha`, ledger checks. |
| `src/observe/external/mcp.ts` | The read tools return that release. No write tool. |
| `src/observe/tower/github.ts` | A failed enrichment still leaves the ledger pull request visible. Pull request checks attach only when that read succeeds. |

## Not this cut

The merge write. A server-side token, later, that can merge only a Tower release pull request whose packet is `verified` and whose `mergeSha` is null. Not a general write on `trigger:read`.

Other attention (blocked work, a waiting founder decision) in the same band.

Pointing production at a different factory ref. That is the existing source setting.
