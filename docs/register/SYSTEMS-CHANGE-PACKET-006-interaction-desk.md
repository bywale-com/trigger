# SYSTEMS-CHANGE-PACKET-006 — Interaction desk

**Signed:** 12:42 UTC 2026-10-30  
**Initiative:** [`PM-PACKET-006-interaction-desk.md`](./PM-PACKET-006-interaction-desk.md) on PR 6, branch `cursor/ixd-plates-7b9a`  
**Glass:** packet 001–005 desk. This packet is how the founder moves through pages already on the snapshot.  
**Walk:** [`PM-PACKET-006-interaction-desk-TEST.md`](./PM-PACKET-006-interaction-desk-TEST.md)  
**Remap:** no migration. Trigger still has no SQL. This number is not a schema version.

Plant on that PR. Do not mint a cousin. Do not reopen PR 4. Do not modify Tower. Do not add a wake workflow.

## Intent

The founder approved all five interaction-design plates, then locked side gutters, an expand icon on the pane (do not regenerate the plate), and spinners around load / process / live. Trigger remains a read-only desk.

## Must

- Keep packets 001–005: snapshot shape, table at ≥992px when the pane is closed, compact shell below 992px, graph layout math, refresh merge, failed-read last rows, GitHub evidence, plate discovery and `/api/tree-file`, factory markdown pass.
- Opening a page must not unmount Table or Graph. Desktop: split (database | pane). Compact: list/graph stays; page is a sheet over it.
- `changeView` must not clear `pageId`.
- Selected row / node is a CSS face of the same `pageId`. No store.
- Hash `#<page id>` is the open page. `history.replaceState`. Refresh keeps it.
- Click-to-filter writes the existing `DeskFilter` `{ field, value }` the Filter form already mints. Fields: Type, Module, Stage, Inside, Depends on. Stage value is `stageLabel`. Shared by table and graph.
- Inside on the page opens that initiative. Lifecycle `basis` is a popover of the string already on the step.
- Crumb, section jumps (not hiding sections), Previous / Next among packets of the same initiative (initiatives among initiatives). `j` / `k`. Escape: collapse expand, then close.
- Expand icon on the pane/sheet. Full content width desktop; compact sheet grows toward the top and stays flush to the sides.
- Gutters: content 24px desktop / 16px compact. Pane and sheet inner padding 16–20px. Compact sheet is flush to the viewport (no outer margin). Copy does not brush the card.
- First load: Spin. Subsequent ticks: small Spin while the fetch is in flight. Running execution: processing tag plus a small spinner. No Stop. Mode remembered in `localStorage` key `trigger-desk-mode`.
- Light and dark remain Ant `defaultAlgorithm` / `darkAlgorithm`, primary `#1677ff`, radius 6, font 14, controlHeight 32.
- 60s refresh must not reset `view`, `filters`, `mode`, `pageId`, or expand.

## Must-not

- Do not mint a Trigger table, filter store, or “open page” table.
- Do not change snapshot JSON for this packet.
- Do not import the Tower controller. Do not modify Tower.
- Do not add Run, Stop, Authorize, Dispatch, Approve.
- Do not import React Flow.
- Do not add search, command palette, pin, or compare-two.
- Do not restyle the ≥992px header into a new product.
- Do not drop module, evidence, lifecycle, GitHub, or plates to fit the pane.
- Do not proxy GitHub bytes. Do not discover `docs/register` blueprints.

## Conflicts locked

| Fact | Before | After | Rule |
|---|---|---|---|
| Open page | `App.tsx` unmounts Table/Graph | Table/Graph stay; pane or sheet | Face only. Same `pageId`. |
| Table / Graph switch | clears `pageId` | keeps `pageId` | Same open page, two views. |
| Filter | form only | form + click-to-filter | Same `DeskFilter`. |
| Back | `← Tower` trap door | crumb path; Tower closes pane | No new IA. |
| Compact open | list replaced | sheet over list | Same snapshot. 1440 is not a sheet. |
| Refresh | silent | spinner while in flight | Same 60s merge. Last rows on fail. |
| Snapshot | pages + evidence | unchanged | No new field. |

## Stores

**Materialized, external.** Unchanged: ledger, packet notes, specification, journals, GitHub REST, plate files on the observed tree.

**Materialized in Trigger.** Nothing. `localStorage` `trigger-desk-mode` is a browser preference, not a Trigger table.

**Map-only.** Hash, `pageId`, `expanded`, filters, selected row class, sheet vs pane as a viewport of the same page.

**Named silence.** A store for open page or selected row. Saved views. Search index. React Flow. A pause that looks like factory Stop.

## Runtime

Same 60s snapshot. Hash and selection live in the client. `/api/snapshot` and `/api/tree-file` unchanged.

## Ports

**Real.** Unchanged: GitHub read, local/fixture tree, Vercel.

**Stand-in.** None.

**Refused.** A Trigger session store. Writing the open page into Tower.

## Verify

Walk the packet 006 test sheet. Keep packet 001 fixture walk at 1440 green (Updated in view **when the pane is closed**), packet 002 lifecycle, packet 003 / 005 plates, packet 004 compact (list still present under the sheet).

Also:

- Open packet: `[data-testid=database]` and `[data-testid=page-pane]` both present at 1440. Hash `#pkt-001-click-attribution`.
- Expand: table not in layout; collapse restores it.
- Click Stage Verified: chip `Stage is Verified`; 1 page on the fixture.
- 360: `[data-testid=work-list]` and `[data-testid=page-sheet]` both present. Sheet `left` / `right` flush to the viewport. Inner padding ≥ 16.
- Content padding desktop 24. No page overflow at 360.
- No Run / Stop / Dispatch.

## Out of scope

A Trigger database. Editing Tower. Regenerating ixd plates. A production fixture switcher.
