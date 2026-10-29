# Trigger V1 — observability specification

**Date:** October 29, 2026  
**Direction:** [`PRODUCT-DIRECTION-V1.md`](./PRODUCT-DIRECTION-V1.md)  
**Plates:** [`plates/v1/README.md`](./plates/v1/README.md). The visual system is Tower’s Ant seed in `omcoda_tower` `src/app/register/prototype-ant/theme.ts`: `colorPrimary` `#1677ff`, `borderRadius` 6, `fontSize` 14, `controlHeight` 32, `defaultAlgorithm` and `darkAlgorithm`. Light and dark are both the product. The plates are one database of pages, the same pages as a graph, that graph filtered to initiatives, and the initiative, packet, running, and blocked pages. Extra pages on the population plates are representative. They are not ledger revision 1.  
**Wake:** the go is [`PM-PACKET-001-tower-desk.md`](./PM-PACKET-001-tower-desk.md). Do not plant from this file. Do not modify Tower.

Tower was read at `main` `9c45f19fa1ac9d909247d6be83c9263273b1bcbb` (merge of pull request 136, 10:44 AM America/Toronto, 29 October 2026). `projectFactory` is `export function projectFactory` in `.factory/controller/queue.ts`. The committed ledger is `.factory/state/ledger.json`.

---

## 1. What the factory actually is

The controller is inactive. `factory.json` says `activation: inactive` and `dispatch: forbidden`. The ledger’s scope status is `inactive`, `authorizedDispatches` is null, and `usedDispatches` is 0. A control pass does not select an initiative and does not wake anyone.

Two initiatives:

- `exec-identity`, module “Agents and Automations”, capability “Which execution a result belongs to”. Investigation `investigating`. Queue `eligible`. Session `idle`. Dispatch null. `blockedReason` null. `updatedAt` null. One packet.
- `launch-agent`, module “Agents”, capability “Launch Agent”. Investigation `discovered`. Queue `discovered`. Session `idle`. Depends on `exec-identity`. `blockedReason`: “Factory production path is not the Launch Agent build.” No packets.

One packet, `pkt-001-click-attribution`. Stage `verified`. Wake `hold`. Execution mode `manual`. Dispatch null. `candidateSha` and `verifiedSha` are `19c47938d8aa8884b4874999a50667f5677205b3`. `integratedSha` null. `reconciliationId` null. Checks: `factory-check` pass, run `40873984441`; `verify:click-attribution` pass, run `40873984426`. `blockerId` null. Lease null.

`scope.modules` is empty. The module names live on the initiatives. `projectFactory` therefore returns an empty `modules` array while still returning both initiatives.

Pull request 136 is the merge that produced this `main`. The ledger has not recorded an integration SHA. Trigger shows the null. It does not infer integration from the merge commit.

The factory handoff says those two checks passed at 8:32 AM America/Toronto. That clock time is not a field on the read model. The desk does not invent it. It shows the run ids.

## 2. The read model

`projectFactory(ledger)` returns `stateRevision`, `scope`, `modules`, `initiatives`, and `packets`. It does not admit transitions. Trigger does not copy `decide`, `controlStep`, or the label actuator.

Initiative fields it does return: `id`, `module`, `capability`, `entry`, `obligation`, `queue`, `priority`, `dependsOn`, `inheritedSpecifications`, `investigation`, `session`, `coverageComplete`, `outstanding`, `packetIds`, `blockedReason`, `updatedAt`, `dispatch`.

Packet fields it does return: `id`, `initiativeId`, `stage`, `wake`, `executionMode`, `candidateSha`, `verifiedSha`, `integratedSha`, `reconciliationId`, `dispatch`, `checks`.

It does not return packet title, release, `hold`, `blockerId`, or `lease`. Those exist on the ledger work item and on the packet manifest. An engineer lease can be open while this projection stays silent. Titles live on `.factory/manifests/initiatives/*.json` and `.factory/manifests/packets/*.json`.

**Named for the Systems Analyst.** Ascribe the read. The adapter reads the ledger and the manifests. It does not reimplement the state machine. It copies the projected fields, and it reads `hold`, `blockerId`, `lease`, and the manifest `title` because the projection omits them. A later Tower change that adds those fields to `projectFactory` should be consumed, not paralleled. Trigger does not edit Tower to do that.

`deriveInitiative` in the state machine is a summary order. It is not in the read model. The desk does not compute a friendlier status from it.

## 3. Decisions

**Agent alignment. The flag is the direction file.**

1. **Index grain.** One database. Each row is a page. An initiative is named by `capability`, with `id` under it. A packet is named by the manifest title, with `id` under it. Type is Initiative or Packet. Module is `initiative.module`, because `scope.modules` is empty. Inside is the containing initiative (`packet.initiativeId`), or an em dash on an initiative. Depends on is `dependsOn` only. A packet is not shown as depending on the initiative that contains it. Specification files are not a row. They are the initiative’s record.
2. **Filter.** The same filter applies to the table and the graph. Hiding a type hides those pages and the edges that used them. The plate shows `Type is Initiative`. There is no parent row to expand. Opening a row opens the page.
3. **No factory controls.** No Run, Stop, Authorize, Dispatch, or wake flip. Wake `hold` is a fact, not a button.
4. **Running is a record.** Architect running means `session === "running"` and `dispatch` is set. Engineer or analyst running means a lease whose role matches and whose `until` is still ahead of the read. A stage word never pulses. `executionMode: "manual"` with `dispatch: null` is history. The committed ledger pulses nothing.
5. **Stage color is an Ant tag, display-only.** `investigating` is `processing`. `verified` is `success`. `discovered` and any unknown word are the default tag. A `blockedReason` or `blockerId` is an `error` tag and does not rename the stage. Queue stays visible because `discovered` is both an investigation word and a queue value, and they are different facts on Launch Agent.
6. **Counts, not a percentage.** For an initiative: packets, how many are `verified`, how many have an `integratedSha`, how many have an open blocker. For a packet: checks passed, whether an integration SHA exists, whether a dispatch exists.
7. **Edges.** Containment is Inside: an initiative contains its packets, drawn as a solid bracket. Dependency is Depends on: `dependsOn`, dashed, arrow toward the page depended on. None are drawn that the record does not have. Launch Agent depends on `exec-identity`. `exec-identity` depends on nothing. The dependency is not treated as met, because `exec-identity`’s queue is not `completed`. A module name is a column and a graph label. It is not a node.
8. **Same detail** from a row or a node.
9. **Blockers stay on the subject.** Launch Agent’s reason is that subject. There is no inbox. There is no invented verification-failure packet.
10. **The page quotes.** Passages are the factory files. The page does not write a summary. If a file is only a path, show the path.
11. **One source.** “Tower” plus the commit the read came from. Not a switcher. Scope status sits in the header because an inactive scope explains why nothing is running.
12. **Refresh** is periodic. Show the ledger revision and the read’s outcome. A failed read keeps the last snapshot. Checkpoint text inside a long session is later, and only if a record carries it. The factory’s own note says checkpoint times are not observed by a scheduler.
13. **Graph library is not chosen.** The graph is the same pages as the table. Containment is a bracket. Dependency is a second edge. The filter is shared. React Flow is a candidate only if it can draw both edges and drop the pages the filter hides.
14. **Density is the filter.** Ledger revision 1 has two initiatives and one packet. The population plates add representative pages so a full graph can be judged. Those pages are not records. The product renders the read. It does not hardcode the extra pages. It does not collapse a module into a fake node.

## 4. Detail

**Initiative.** Capability as the title, id, module, investigation, queue, session, dispatch or “no dispatch”, the four counts, obligation, specification passage, outstanding, journal, contained pages, dependencies, founder decisions from the manifest, the entry string as data. The entry is not Trigger’s navigation.

**Packet.** Manifest title, id, the initiative it sits inside, stage, wake, release, the intended-behavior passage, the systems-change passage, the plant path, the verified SHA, each check’s name, outcome, and run id, execution mode, `integratedSha`, `reconciliationId`, links the manifest already has.

**Running dispatch.** A region, not its own product. Effect and label from the dispatch record. Absent roles are absent records.

**Blocked reason.** The initiative’s string, at the top of that initiative. A packet `blockerId`, when one exists, is the packet’s region. The current ledger has the first and not the second.

## 5. File cut

Nothing planted.

| File | Job |
|---|---|
| `src/observe/snapshot.ts` | The snapshot both views read. No Tower paths. No rendering. |
| `src/observe/tower/read.ts` | Read Tower’s ledger and manifests. Fill the snapshot. Do not import the controller and do not call `decide`. |
| `src/observe/refresh.ts` | Periodic read. On failure, keep the previous snapshot. |
| `src/desk/chrome.tsx` | Wordmark, source and commit, scope, revision, Table / Graph. |
| `src/desk/TableView.tsx` | §3 database. |
| `src/desk/GraphView.tsx` | The same pages. Containment bracket, dependency edge, shared filter. |
| `src/desk/Detail.tsx` | One detail. Sections follow the entity. |
| `src/desk/App.tsx` | Which view, which entity. No factory rules. |

## 6. After the plates

The founder approved the Ant chrome in light and dark on 29 October 2026. Later the same day the face became one database of pages, and the graph became that database. Packet 001 carries `**Wake:** sa`. The plates are the corrected face. The Systems Analyst ascribes the read before the adapter is built.

Order once both are true:

1. Snapshot and the Tower reader, checked against this ledger, with no desk.
2. Chrome and the database, including the empty scope, the idle sessions, the verified packet, and the blocked reason. Three pages. No representative rows.
3. Initiative page and packet page.
4. The running-dispatch region, covered by a fixture that sets `session` and `dispatch`, not by editing the ledger.
5. Graph of those same pages, and the shared filter.
6. Periodic refresh.

No second controller, no second ledger, no dispatcher, no percentage, no project switcher.
