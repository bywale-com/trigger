# PM-PACKET-001 — Read-only Tower desk

**Wake:** sa

**Direction:** [`PRODUCT-DIRECTION-V1.md`](./PRODUCT-DIRECTION-V1.md)  
**Grain:** [`V1-OBSERVABILITY-SPEC.md`](./V1-OBSERVABILITY-SPEC.md)  
**Plates:** [`plates/v1/a-table-light.png`](./plates/v1/a-table-light.png) · [`plates/v1/a-table-dark.png`](./plates/v1/a-table-dark.png)  
**Test:** [`PM-PACKET-001-tower-desk-TEST.md`](./PM-PACKET-001-tower-desk-TEST.md)

## Founder lock

> Ok im good with this. You e got the green light

The approved picture is the Ant table in light and in dark. Primary `#1677ff`, radius 6, font size 14, control height 32, `defaultAlgorithm` and `darkAlgorithm`, from Tower `src/app/register/prototype-ant/theme.ts`. Both modes are the product. Do not restyle the header, the segmented control, the switch, the table, or the tags.

The graph and the detail pages were not in that picture. They use this same header and Ant components. They do not get a second theme.

## Face

Trigger reads Tower and shows it. It does not run the factory.

The header is the approved one: Trigger, `Tower` and the commit that was read, ledger revision, scope status, Table / Graph, light / dark.

The table groups by the module on the initiative, not by `scope.modules`. A parent row is the initiative, named by its capability, with its id under it. A child row is a packet, named by the manifest title, with its id under it. Stage is an Ant tag: `investigating` processing, `verified` success, `discovered` and any unknown word default. A blocked reason is an error tag and does not rename the stage. Execution is its own column. An idle session with no dispatch says so. A manual execution with no dispatch does not look like a live run. Evidence is counts. Updated is the record’s time, or an em dash when the record has none.

No Run, Stop, Authorize, or Dispatch.

Opening a row opens that entity. Back returns to the view the person was on. Table and Graph open the same detail.

Graph: containment is nesting. A dependency is a dashed edge labeled “depends on,” and only when `dependsOn` says so. A module can collapse. A dependency into a collapsed module ends on the module. No node is added to fill space.

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
| `src/desk/TableView.tsx` | The approved table. |
| `src/desk/GraphView.tsx` | Containment and dependency overlay. |
| `src/desk/Detail.tsx` | One detail. Sections follow the entity. |
| `src/desk/App.tsx` | Which view, which entity, which mode. No factory rules. |

The desk imports the snapshot. It does not import Tower. Counts are derived once, in the snapshot.

The rows on the approved plates are ledger revision 1 at `9c45f19`. They are the check, not strings baked into the components.

## Named for the Systems Analyst

Do not mint a Trigger table for workflow state. Tower’s ledger is the record.

`projectFactory` returns the fields listed in the spec. It omits packet title, release, `hold`, `blockerId`, and `lease`. Those are on the ledger work item and the manifests. Ascribe the read. A later Tower change that adds the omitted fields to `projectFactory` should be consumed, not paralleled. Trigger does not edit Tower.

`scope.modules` is empty on this ledger. Group by `initiative.module`.

`deriveInitiative` is not in the read model. Do not compute a friendlier status from it.

## Out of scope

A second controller. A dispatcher. A percentage. A project switcher. A checkpoint transcript. Choosing React Flow in this packet. Operator navigation, Hub, and the sider.
