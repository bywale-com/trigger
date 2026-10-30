# SYSTEMS-CHANGE-PACKET-001 — Tower read

**Signed:** 21:23 UTC 2026-10-29  
**Initiative:** [`PM-PACKET-001-tower-desk.md`](./PM-PACKET-001-tower-desk.md) on PR 4, branch `cursor/observability-v1-plates-7b9a`  
**Glass:** the plates the founder approved in this chat. [`plates/v1/README.md`](./plates/v1/README.md)  
**Walk:** [`PM-PACKET-001-tower-desk-TEST.md`](./PM-PACKET-001-tower-desk-TEST.md)  
**Remap:** no migration. Trigger has no SQL. This number is not a schema version.

Plant on that PR. Do not open a second PR. Do not add a wake workflow or a Cursor Automation to build Trigger.

## Intent

Trigger’s desk is a pane over one external contract: the Tower factory tree at `bywale-com/omcoda_tower`. The contract stood up at `main` `9c45f19fa1ac9d909247d6be83c9263273b1bcbb` is `.factory/state/ledger.json` revision 1, plus the manifests and the factory prose files named below. Trigger does not mint a table for that state, does not write it, and does not import the controller.

## Must

- One snapshot. The table, the graph, and the page read it. Counts are derived once, in the snapshot.
- Every initiative and every packet on the ledger is a page. `scope.modules` is `[]` at this revision. That emptiness does not hide a page. Do not use `eligible()` in `.factory/controller/queue.ts`. That function keeps only initiatives whose module is listed on the scope.
- Row order: initiatives by `priority` ascending, then `id`. After each initiative, its packets sorted by `id`. A packet whose initiative is missing sorts last, by `id`.
- Inside is `packet.initiativeId`. An initiative’s Inside is empty. Depends on is `initiative.dependsOn` only. A packet’s Depends on is empty. Do not draw a dependency from a packet to the initiative that contains it.
- The graph’s edges are that same page list after the filter. A hidden page drops the edges that name it.
- A failed read keeps the last snapshot and says the read failed. The first read, if it fails, is the header and no pages.
- Light and dark are both the product, Ant `defaultAlgorithm` and `darkAlgorithm`, primary `#1677ff`, radius 6, font size 14, control height 32.

## Must-not

- Do not mint a Trigger table, file, or database for workflow state. No SQL. The ledger is the record.
- Do not import `.factory/controller/queue.ts`, `machine.ts`, or `dispatch.ts`. Those modules export `decide` and `controlStep`. Copy the fields listed here out of the JSON.
- Do not call `deriveInitiative`. Do not compute a friendlier status.
- Do not treat a dependency as met or unmet on the glass. `depsMet` in `queue.ts` is the controller’s rule (`dependsOn` targets whose queue is `completed`). The desk draws the edge and stops.
- Do not infer `integratedSha` from the merge commit. Revision 1 has `integratedSha: null`.
- Do not put the handoff’s “8:32 AM” on the glass. That clock is not a field.
- Do not hardcode the representative pages from the population plates. Ledger revision 1 is three pages: `exec-identity`, `pkt-001-click-attribution`, `launch-agent`.
- Do not ship the plate sentences “Representative population” or “Fixture · not ledger revision 1”.
- Do not read Tower’s Postgres. `outbound_messages` and `enrollment` belong to the factory’s product. They are not this read.
- Do not add `.github/workflows/wake-packet-seats.yml`, a seat label, or a Cursor Automation whose job is to build Trigger. The founder said the SA pass happens in this chat, and not to use the build automations to build Trigger.
- No Run, Stop, Authorize, Dispatch, or wake control. No percentage. No project switcher. No React Flow dependency in this cut.

## Conflicts locked

These disagree on the tree that was read. The rule is the rule.

| Fact | Ledger | Manifest or markdown | Rule |
|---|---|---|---|
| Obligation of `exec-identity` | “Specify and, where a packet is released, implement the identity rules already locked on PR 135.” | Manifest adds “Do not complete neighboring modules.” | Obligation is the ledger string. |
| Obligation of `launch-agent` | “Not opened. Launch Agent is not the controller pilot.” | Manifest: “Not opened. This record exists so the factory does not treat Launch Agent as the controller pilot.” | Obligation is the ledger string. |
| Blocked reason | `blockedReason`: “Factory production path is not the Launch Agent build.” | Manifest `blockedBy` is a different sentence. | The alert is `blockedReason`. |
| Release | Work item has no release string. `releaseEligible` is `false`. | Manifest `release` is `draft`. Manifest `releaseEligible` is `true`. Packet markdown says “Release eligible: yes”. | The Release property is manifest `release`. The snapshot also keeps ledger `releaseEligible` (`false`). The glass does not show `releaseEligible`. |
| Title | Not on the work item. `capability` is the initiative name. | Packet manifest `title` is the packet name. | Initiative name is `capability`. Packet name is manifest `title`. If the manifest file is missing, the name is the id. |
| Specification body | `inheritedSpecifications` is `["docs/specification-pass/SPECIFICATION.md"]`. | The sentence on the plate is in `docs/factory/initiatives/exec-identity/SPECIFICATION.md`. | The Specification section is that factory file, whole. The inherited path stays a path on the snapshot and is not a second body. |
| Journal | Not a ledger field. | Manifest `source.journals` points at `docs/specification-pass/journal/001.md` through `060.md`. The plate quotes `docs/factory/initiatives/exec-identity/journal/001.md`. | The Journal section is every file in `docs/factory/initiatives/<id>/journal/`, filename order, whole. The specification-pass span is not that section. |

## Stores

**Materialized, external.** Not a Trigger store.

- `.factory/state/ledger.json` — `FactoryLedger` in `.factory/controller/dispatch.ts`. Revision 1. `authorizedDispatches` null. `usedDispatches` 0. Scope `status` `inactive`, `modules` `[]`, `founderDecision` null, `blockReason` null.
- `.factory/manifests/factory.json` — `activation` `inactive`, `dispatch` `forbidden`. Header does not gain a new phrase from these. They explain why the snapshot’s sessions are idle.
- `.factory/manifests/initiatives/<id>.json` — `title`, and `founderDecisions` when present.
- `.factory/manifests/packets/<id>.json` — `title`, `release`.
- Prose, whole file, no summary: `docs/factory/initiatives/<id>/SPECIFICATION.md`, `docs/factory/initiatives/<id>/journal/*.md`, the `## Intended behavior` section of the packet note resolved below.

**Materialized in Trigger.** Nothing. No `src/`. No migration. No SQL file in this repo.

**Map-only.** The snapshot below. It lives in the desk process. A restart drops it. Do not write it to disk. A disk copy would be a second ledger.

**Named silence.**

- `hold` is on the work item (`false` at revision 1) and on the snapshot. This cut’s plates have no Hold row. Do not add one. A true `hold` does not rename Wake and does not become a button.
- `releaseEligible` is on the snapshot and not on the glass.
- `entry`, `priority`, `coverageComplete`, `founderDecisions`, and `inheritedSpecifications` are on the snapshot. This cut’s initiative plate does not render them. The factory specification file already points at the inherited path.
- `systemsChange` text is on the snapshot (`docs/factory/initiatives/exec-identity/systems/SCP-pkt-001-click-attribution.md`). The approved packet plate has no systems-change section. Do not add one.
- Checkpoint minutes in `factory.json` are “worker instruction only. No timer observes or enforces the interval.” Trigger does not observe them.
- No Trigger credential store. No factory wake token in this repo.

### Snapshot

`readAt` is UTC `YYYY-MM-DDTHH:mm:ssZ` with no fractional seconds. That is the shape in `.factory/scripts/factory-check.ts` (`until: "2026-10-29T13:00:00Z"`). A lease is active when `lease` is non-null and `lease.until > readAt`, the same comparison as `leaseActive` in `.factory/controller/machine.ts`.

`projectFactory` returns initiative `id`, `module`, `capability`, `entry`, `obligation`, `queue`, `priority`, `dependsOn`, `inheritedSpecifications`, `investigation`, `session`, `coverageComplete`, `outstanding`, `packetIds`, `blockedReason`, `updatedAt`, `dispatch`. It returns packet `id`, `initiativeId`, `stage`, `wake`, `executionMode`, `candidateSha`, `verifiedSha`, `integratedSha`, `reconciliationId`, `dispatch`, `checks`. Copy those. Then add, from the work item, `hold`, `blockerId`, `lease`, `releaseEligible`. Then add, from the manifests and prose, `title`, `release`, `founderDecisions`, and the file bodies.

Pages:

- `type` is `Initiative` or `Packet`.
- `name` as in the conflict table.
- `module` is the initiative’s `module`. A packet uses its initiative’s module.
- `stage` is the ledger word. The tag shows that word with the first character uppercased and the rest unchanged. `investigating` → `Investigating`. Queue stays the raw ledger word.
- Stage color: `verified`, `integrated`, `reconciled`, `accepted` are `success`. `investigating`, `specifying`, `verifying`, `engineering`, `analysis`, `change_specified`, `candidate`, `integration_authorized` are `processing`. `blocked`, `returned_architect`, `returned_analyst` are `error`. `discovered`, `draft`, `released`, and any other word are `default`.
- A non-null `blockedReason` or `blockerId` does not change the stage word. On an initiative it sets the evidence cell to an error tag `Blocked reason`. On a packet whose `blockerId` is set or whose stage is `blocked`, the evidence cell is an error tag `Blocked`.
- `inside` is the initiative id or empty. `dependsOn` is the id list or empty.
- `updatedAt` null renders `—`. A string that begins `YYYY-MM-DD` renders that date. Do not shift the clock.

Execution, first match:

- Packet, lease active, role `architect` \| `analyst` \| `engineer`: `Architect · running`, `Analyst · running`, or `Engineer · running`.
- Initiative, `session === "running"` and `dispatch` set: `wake_architect` → `Architect · running`; `wake_sa` → `Analyst · running`; `wake_engineer` → `Engineer · running`; `wake_repair` → `Repair · running`.
- Packet, `executionMode === "manual"` and `dispatch` null: `Manual · not live`.
- Packet, `executionMode === "automatic"` and `dispatch` set: `Automatic · dispatch`.
- Packet, `executionMode === "automatic"` and `dispatch` null: `Automatic · no dispatch`.
- Initiative, `session === "idle"` and `dispatch` null: `Idle · no dispatch`.
- Anything else: `{session} · dispatch` or `{session} · no dispatch`.

Evidence:

- Initiative with `blockedReason`: error tag `Blocked reason`.
- Other initiative: `{n} verified · not integrated` when no packet has an `integratedSha`, otherwise `{n} verified · {m} integrated`. `n` counts packets whose stage is `verified`, `integration_authorized`, `integrated`, `reconciled`, or `accepted`. `m` counts non-null `integratedSha`.
- Packet with `blockerId` or stage `blocked`: error tag `Blocked`.
- Other packet: `{pass} checks · no SHA` when `integratedSha` is null, otherwise `{pass} checks · SHA`. `pass` counts checks whose `outcome` is `pass`.

Edges, after the filter:

- Contains: initiative id → each of its packet ids, when both pages remain.
- Depends on: initiative id → each `dependsOn` id, when both pages remain. Arrow toward the page depended on.

Filter is view state, not a store. Equality, AND, on Type, Module, Stage, Inside, and Depends on. The walk uses Type = Initiative. Hiding a packet hides its contains edge.

Header, when the snapshot is good: Trigger, `Tower · main` and the first 7 characters of the sha that was read, `Ledger revision {stateRevision} · scope {status}`. Table and Graph are the two views. The switch is the two Ant algorithms. Under the table, `{n} pages`.

Page, initiative, in this order: Stage, Queue, Execution, Depends on, Depended on by, Updated. Then Obligation (ledger string), Specification (the factory file and its path), Outstanding (the ledger strings), Journal (the factory journal files and their paths), Contained pages (the packet ids). Back is `← Tower` and returns to the view that opened the page.

Page, packet, in this order: Stage, Wake (raw `wake`), Release (manifest `release`, or `—`), Execution, Inside, Integrated SHA (`none` when null). Then the Intended behavior section, then each check as `{name} · {outcome} · {runId}`, then `Verified SHA {verifiedSha}` when that sha is non-null.

When `blockedReason` is set, the initiative page also shows an error alert titled `Blocked reason` whose description is that string, and the obligation under it.

When execution is a running line, the page also shows Effect and Label from the dispatch record. A role with no active lease is the line `No open lease`. Revision 1 shows none of this. Cover it with a fixture that sets `session` and `dispatch` on a copy of the snapshot. Do not edit the ledger fixture.

Packet note path: the file under `docs/factory/initiatives/<initiativeId>/packets/` whose filename equals the packet id, case-insensitive. This revision’s file is `docs/factory/initiatives/exec-identity/packets/PKT-001-click-attribution.md`. The Intended behavior section is from `## Intended behavior` to the next `##`.

## Runtime

The server reads the Tower tree. The browser receives the snapshot and nothing else. No token in the client.

Refresh every 60 seconds. On failure, keep the previous snapshot, set the header to say the read failed, and do not change the interval. On success, replace the snapshot and clear the failure.

The desk does not write the ledger, the manifests, GitHub labels, or a wake.

## Ports

**Real.** Read-only fetch of the paths in Stores from `bywale-com/omcoda_tower` at the ref that was read. Record the full sha on the snapshot. This revision’s sha is `9c45f19fa1ac9d909247d6be83c9263273b1bcbb`.

**Stand-in.** None. A missing file is a failed read of that body: the page shows the path and no invented sentence. It is not a license to skip the ledger.

**Refused.** `githubLabelActuator`, `dispatchInitiative`, `controlStep`, `decide`, `commitLedgerEvent`. `factory.json` says the label command can spawn `gh pr edit` and stays disarmed. Trigger does not arm it.

## Verify

Walk [`PM-PACKET-001-tower-desk-TEST.md`](./PM-PACKET-001-tower-desk-TEST.md) on the planted desk. The read input is this revision’s ledger, not strings in the component.

Also, on the snapshot from that ledger:

- Three pages, in order `exec-identity`, `pkt-001-click-attribution`, `launch-agent`.
- Evidence `1 verified · not integrated`, `2 checks · no SHA`, and the error tag `Blocked reason`.
- Execution `Idle · no dispatch`, `Manual · not live`, `Idle · no dispatch`.
- One contains edge, `exec-identity` → `pkt-001-click-attribution`. One depends edge, `launch-agent` → `exec-identity`.
- `hold` false, `blockerId` null, `lease` null, `releaseEligible` false, `integratedSha` null, `dispatch` null on all three. Release on the packet page is `draft`.
- Obligation and blocked reason are the ledger strings, not the manifest strings.
- A Type = Initiative filter leaves two pages and the one depends edge.
- A fixture with `session` `running` and `dispatch.effect` `wake_architect` renders `Architect · running`, effect `wake_architect`, label `factory-wake-architect`. The ledger fixture is unchanged.
- A second read that throws keeps the three pages and reports the failure.

## Out of scope

A second controller. A dispatcher. Postgres. A percentage. A project switcher. A checkpoint transcript. React Flow. Operator navigation, Hub, and the sider. Rendering `hold`, `releaseEligible`, `entry`, founder decisions, or the systems-change body. Any workflow or automation that builds Trigger.
