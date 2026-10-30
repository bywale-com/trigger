# PM-PACKET-002 — test

Walk this on the planted desk of PR 4. Light first, then dark. Packet 001’s fixture walk still has to pass. This sheet is the new pocket.

**I saw** stays blank until a person walks it.

## Setup

1. Open the Trigger desk on the `9c45f19` fixture (`TOWER_REF=main`, `TOWER_FIXTURE` set).
2. Confirm the header still reads Trigger, Tower, `9c45f19`, ledger revision 1, scope inactive.
3. Confirm the mode is light and the view is Table.

## Table and graph unchanged

1. The three fixture pages are still the only rows. Columns are still Type, Module, Stage, Execution, Evidence, Inside, Depends on, Updated.
2. The packet execution string is still `Manual · not live`. There is no `Completed` column.
3. Graph still has three nodes, one contains edge, one depends edge.
4. There is no Run, Stop, Authorize, Dispatch, or branch switcher.

**I saw:**

## Fixture packet page — lifecycle without GitHub

1. Open `pkt-001-click-attribution`.
2. Stage is still Verified. Integrated SHA is still `none`. Checks still name run ids `40873984441` and `40873984426`.
3. Lifecycle: Dispatched no, Running no, Committed yes, Verified yes, Integrated no, Accepted no.
4. GitHub artifacts on a fixture read are `unavailable`. The page does not invent pull request 136, a preview host, or a working branch.
5. Each ledger check is still `{name} · {outcome} · {runId}`. The run id is a GitHub Actions link constructed from that id.

**I saw:**

## Dark

1. Switch to dark on that packet page.
2. The lifecycle tags, property grid, and links are Ant’s dark algorithm. The approved primary, radius, and type remain.

**I saw:**

## Dispatch is not a run

1. Cover with the unit fixture that sets a current `dispatch` and no lease (do not edit the ledger fixture file).
2. Execution may still say a dispatch line. Lifecycle Dispatched is yes. Lifecycle Running is unknown. It is not yes.

**I saw:**

## Live factory branch

Walk the configured factory ref (not the plate fixture).

1. Header still names that ref and the resolved SHA. When GitHub associated that ref with a pull request, the header also shows `PR {n}` linking to it.
2. Open the packet whose ledger `stage` is `accepted` and whose `reconciliationId` starts `pr-`. Lifecycle Accepted is yes. Integrated is yes. The integration pull request is the number in `reconciliationId`, as a link. A green check on that page does not replace Integrated or Accepted.
3. Open a packet that has a current `dispatch` and a `candidateSha`. Dispatched is yes. Committed is yes. Verified is no when `verifiedSha` is null. The working branch and pull request, when shown, come from GitHub’s commit-to-pull response for that SHA (on revision 41 that is pull request 137, the factory branch). The page does not invent a packet-named branch.
4. Preview is a GitHub `environment_url` or `unavailable`.
5. Cause the Tower read to fail. The last rows stay. The header says the read failed. GitHub being unavailable on a good ledger read does not itself fail the desk.

**I saw:**

## Steps I could not do
