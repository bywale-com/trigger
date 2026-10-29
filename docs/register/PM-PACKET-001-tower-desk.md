# PM-PACKET-001 — Read-only Tower desk

**Wake:** sa

**Direction:** [`PRODUCT-DIRECTION-V1.md`](./PRODUCT-DIRECTION-V1.md)  
**Grain:** [`V1-OBSERVABILITY-SPEC.md`](./V1-OBSERVABILITY-SPEC.md)  
**Plates:** [`plates/v1/README.md`](./plates/v1/README.md)  
**Test:** [`PM-PACKET-001-tower-desk-TEST.md`](./PM-PACKET-001-tower-desk-TEST.md)

## Founder lock

> Ok im good with this. You e got the green light

That approved the Ant chrome: primary `#1677ff`, radius 6, font size 14, control height 32, `defaultAlgorithm` and `darkAlgorithm`, from Tower `src/app/register/prototype-ant/theme.ts`. Both modes are the product. Do not restyle the header, the segmented control, the switch, or the tags.

> You know actually... I actually would prefer an actual table view.. think notion databases...that is perfectly it...becauase now the pages inside rows makes sense...also for the nodegrpahs....i need to what a populates node graph looks like because the node graph should show all initiative and packets / perhaps also with the option filter e.t.c I mean literally it's just a graph view of the table...adn the table itself it practiclaly a table...that being said, giving the ant design system...I really like to see you attempt all the plates again that are implied here

That corrects the face. One database of pages. The graph is those pages. Wake stays `sa`.

## Face

Trigger reads Tower and shows it. It does not run the factory.

The header is the approved one: Trigger, `Tower` and the commit that was read, ledger revision, scope status, Table / Graph, light / dark.

The table is one database. Each row is a page. An initiative is named by its capability, with its id under it. A packet is named by the manifest title, with its id under it. Type is Initiative or Packet. Module is the module on the initiative, not `scope.modules`. Inside is the initiative a packet sits in, or an em dash on an initiative. Depends on is `dependsOn` only. A packet does not depend on its parent. Stage is an Ant tag: `investigating` processing, `verified` success, `discovered` and any unknown word default. A blocked reason is an error tag and does not rename the stage. Execution is its own column. An idle session with no dispatch says so. A manual execution with no dispatch does not look like a live run. Evidence is counts. Updated is the record’s time, or an em dash when the record has none.

The same filter applies to the table and the graph. The plate shows `Type is Initiative`. Hiding packets hides those pages and the brackets that contained them.

No Run, Stop, Authorize, or Dispatch.

Opening a row opens that page. Back returns to the view the person was on. Table and Graph open the same page.

Graph: the same pages. A solid bracket is Inside. A dashed edge is Depends on, and only when `dependsOn` says so. The arrow points at the page depended on. A module name is a label, not a node. No node is added to fill space.

The population plates include pages that are not in ledger revision 1, so the full graph can be judged. Those pages are not product data. The sentence that says so on the plate is plate furniture. The product shows the read. Ledger revision 1 is `exec-identity`, `pkt-001-click-attribution`, and `launch-agent`.

Detail quotes the factory file. It does not write a summary. Initiative, packet, running dispatch, and blocked reason are the sections in the spec. A running architect is `session === "running"` and a dispatch record. A running engineer or analyst is a lease that has not expired. The committed ledger has neither. The running picture is a fixture, not an edit of Tower’s ledger.

A failed refresh keeps the last rows and says the read failed. An empty read is the header and no rows.

## Technical cut

Nothing in this commit is planted. The files, when the change packet exists:

| File | Job |
|---|---|
| `src/observe/snapshot.ts` | The snapshot both views read. No Tower paths. No rendering. |
| `src/observe/tower/read.ts` | Read Tower’s ledger and manifests. Fill the snapshot. Do not import the controller. Do not call `decide`. |
| `src/observe/refresh.ts` | Periodic read. On failure, keep the previous snapshot. |
| `src/desk/chrome.tsx` | The approved header. |
| `src/desk/TableView.tsx` | The database of pages. |
| `src/desk/GraphView.tsx` | The same pages. Containment bracket, dependency edge, shared filter. |
| `src/desk/Detail.tsx` | One detail. Sections follow the entity. |
| `src/desk/App.tsx` | Which view, which entity, which mode. No factory rules. |

The desk imports the snapshot. It does not import Tower. Counts are derived once, in the snapshot.

The three ledger pages at `9c45f19` are the check, not strings baked into the components. The other pages on the population plates are representative. Do not plant them.

## Named for the Systems Analyst

Do not mint a Trigger table for workflow state. Tower’s ledger is the record.

`projectFactory` returns the fields listed in the spec. It omits packet title, release, `hold`, `blockerId`, and `lease`. Those are on the ledger work item and the manifests. Ascribe the read. A later Tower change that adds the omitted fields to `projectFactory` should be consumed, not paralleled. Trigger does not edit Tower.

`scope.modules` is empty on this ledger. Group by `initiative.module`.

`deriveInitiative` is not in the read model. Do not compute a friendlier status from it.

## Out of scope

A second controller. A dispatcher. A percentage. A project switcher. A checkpoint transcript. Choosing React Flow in this packet. Operator navigation, Hub, and the sider.
