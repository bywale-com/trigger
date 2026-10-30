# PM-PACKET-006 — Interaction desk

**Wake:** sa

**Direction:** [`PRODUCT-DIRECTION-V1.md`](./PRODUCT-DIRECTION-V1.md)  
**Grain:** [`V1-OBSERVABILITY-SPEC.md`](./V1-OBSERVABILITY-SPEC.md) §11  
**Test:** [`PM-PACKET-006-interaction-desk-TEST.md`](./PM-PACKET-006-interaction-desk-TEST.md)  
**Plates:** [`plates/ixd/README.md`](./plates/ixd/README.md) (approved 01–05)  
**Initiative:** PR 6, branch `cursor/ixd-plates-7b9a`, stacked on packet 005. Do not mint a cousin. Do not reopen PR 4.

## Founder lock

> Yes all of this are good. Do all. Ensure ensure you always maintain proper margins on the sides. Content shouldn't be brushing on the borders. Keep an eye on that for aesthetic reasons.
>
> also for the side pop up, it should also have the option to fully expand. Don't worry don't regenerate the plate. The fix is simple. An icon that can extend the popover.
>
> lastly, where there are opportunities for spinners and other interaction components specifically around process, loading, real time e.t.c implement.
>
> I also won't ask you to generate a plate right now but after implementation is complete, id like to see some screenshots of these revisions.
>
> Go ahead and packet, specify and build

All five recommendation plates. Side gutters. Expand icon on the pane. Loading / process / live affordances. Screenshots after the plant, not a sixth painted plate.

## What hangs

Inspected planted `src/` on `cursor/ixd-plates-7b9a` (`02f18af`, packet 005 code plus the ixd plates).

- `src/desk/App.tsx` replaces Table/Graph with Detail when `pageId` is set. `changeView` clears `pageId`. There is no URL for the open page.
- `src/desk/TableView.tsx`: a row is one hit target. Type / Stage / Module / Inside / Depends on are not filters. No selected-row edge.
- `src/desk/GraphView.tsx`: node click calls `onOpen`, which unmounts the map. No selected ring.
- `src/desk/Detail.tsx`: back is `← Tower`. No crumb path, no section jumps, no Previous / Next. Inside is plain text. Lifecycle `basis` is only a `title` tooltip.
- Compact work-list tap also replaces the list. No sheet.
- `src/desk/chrome.tsx` Content padding is 16 desktop / 12 compact. Refresh is a silent 60s `setInterval`. First load has no spinner. Mode is not remembered.

No new store. Selection, split, hash, click-to-filter, crumb, sheet, expand, and spin are faces of pages already in memory.

## Face

**Stay with the work (1440).** The table stays. The open page is a pane to the right. The selected row has the primary left edge. Filter, nine columns, and page count remain. A row click does not destroy the database.

**Graph keeps the map.** A node click rings that node and opens the same pane. Contains and depends stay in view. Table and Graph are two views of the same open page. Switching the segmented control does not close the pane. Camera / scroll of the map is not reset by opening a page.

**Click what you see.** Type, Stage, Module, Inside, and Depends on in the table (and the matching tags on the work list and graph node) mint the same Filter chip the form already mints. The table and the graph share it. Inside on the **page** is a link to that initiative. A lifecycle tag shows its `basis` in a popover.

**The page is a place.** Crumb: `← Tower / <initiative id> / <this packet id>` (initiative omits the third). Tower closes the pane. The initiative id opens that page. Ant tabs jump to sections already on the page (they do not hide facts). Packet tabs: Page, Intended, Lifecycle, Evidence, GitHub. Initiative tabs: Page, Specification, Journal, GitHub. Previous / Next walks packets inside the same initiative (initiatives walk other initiatives). Keyboard `j` / `k` is the same walk. Escape closes expand, then the pane. The URL is `#<page id>`. Refresh still does not kick you off it.

**Compact is the same idea.** Below 992px the work list (or graph) stays. The page is a sheet over it, dimmed behind a backdrop. Side and bottom insets so the sheet does not brush the viewport. A grab dismisses (drag down). Backdrop click dismisses. 1440 stays the split pane, not the sheet.

**Expand.** An icon on the pane / sheet extends it to the full content width (desktop) or nearly the full viewport (compact, still inset). The same icon collapses. Do not regenerate plate 01; this control was asked after the plate.

**Gutters.** Content padding 24px desktop, 16px compact. Pane inner padding 16–20px. Sheet inset 16px from the viewport edges. Nothing flushes to a window border.

**Process / loading / live.** First snapshot: Ant Spin in the content. Later 60s reads: a small Spin next to the ledger while the fetch is in flight. Running execution already uses a processing tag; keep it and sit a small spinner next to that tag. Failed read stays the existing danger text and last rows. Light / dark is remembered in `localStorage` (`trigger-desk-mode`).

**1440 chrome otherwise.** Header row, Ant tokens (`#1677ff`, radius 6, font 14, controlHeight 32), nine-column table when the pane is closed (Updated still in view). Compact breakpoint unchanged.

## Technical cut

| File | Job |
|---|---|
| `src/desk/place.ts` | Hash parse, sibling Previous / Next, `withFilter`. No snapshot I/O. |
| `src/desk/App.tsx` | Keep Table/Graph mounted. Hash. Expand. Loading / refreshing. Do not clear `pageId` on view change. |
| `src/desk/Pane.tsx` | Desktop pane and compact sheet. Expand / close icons. Grab dismiss. |
| `src/desk/chrome.tsx` | Gutters. Refresh spinner. |
| `src/desk/TableView.tsx` | Selected row. Click-to-filter cells. |
| `src/desk/GraphView.tsx` | Selected ring. Node click does not unmount the map. |
| `src/desk/Detail.tsx` | Crumb, section jumps, Previous / Next, Inside link, lifecycle popover. |
| `src/desk/desk.css` | Split, sheet, selected edge, gutters. |

Do not import the Tower controller. Do not mint a Trigger table. Do not modify Tower. Do not add Run / Stop / Dispatch / Authorize.

## Named for the Systems Analyst

No new table. The snapshot is unchanged. Hash, selection, split, click-to-filter, crumb, sheet, expand, and spin are client faces. Do not ascribe a store for “open page” or “selected row.” Named silence: search, command palette, pin, compare-two, React Flow, a pause control that looks like Stop, a Trigger filter table.

## Out of scope

Writing to Tower. A project switcher. Restyling the 1440 header into a new product. Regenerating the ixd plates. A native app. Packet 005 prose / plate-byte rules stay.
