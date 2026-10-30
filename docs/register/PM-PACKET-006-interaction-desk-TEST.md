# PM-PACKET-006 — test

Walk this on the planted desk of PR 6. Packets 001–005 walks still have to pass. This sheet is how the founder moves through pages that already exist.

**I saw** stays blank until a person walks it.

## Setup

1. Open the Trigger desk on the `9c45f19` fixture (`TOWER_REF=main`, `TOWER_FIXTURE` set).
2. Confirm the header still reads Trigger, Tower, `9c45f19`, ledger revision 1, scope inactive.
3. Confirm the mode is light and the view is Table. 1440.
4. Confirm side gutters: content is not flush to the window. Header and table have visible padding.

## Stay with the work

1. Open `pkt-001-click-attribution` from the table.
2. The table is still on screen (`[data-testid=database]`). The page is a pane (`[data-testid=page-pane]`). The selected row has the primary left edge.
3. The URL hash is `#pkt-001-click-attribution`. Reload: the same page is still open, table still there.
4. Content in the pane is padded. It does not brush the pane border or the window edge.
5. Click the expand icon. The pane fills the content width. The table is hidden, not destroyed. Collapse returns the split.
6. Click `← Tower`. The pane closes. The table is the full width again. Updated is still in view.

**I saw:**

## Graph keeps the map

1. Open the packet again. Switch to Graph. The pane stays. The graph is still on screen. The open node has a primary ring. Contains and depends are still drawn.
2. Close. From Graph with no pane, click the `launch-agent` node. The map remains. The blocked reason is in the pane.

**I saw:**

## Click what you see

1. Table, pane closed. Click the Stage tag **Verified** on the packet row (not the row itself).
2. The chip `Stage is Verified` appears. The graph and table share it. Launch Agent is hidden. Close the chip: three pages return.
3. Open the packet. Inside is a link. Click it: the pane shows `exec-identity`.
4. Lifecycle tags: click **Committed yes**. A popover (or equivalent) shows the basis sentence, not only a native tooltip.

**I saw:**

## The page is a place

1. On the packet, crumb reads `← Tower / exec-identity / pkt-001-click-attribution`.
2. Tabs Page / Intended / Lifecycle / Evidence / GitHub are present. Clicking Intended jumps to intended behavior. The other sections are still in the page (not replaced).
3. Previous / Next: fixture has one packet in `exec-identity`, so Next is disabled (or absent as a walk). On an initiative, Next walks to the other initiative.
4. `j` / `k` match Previous / Next. Escape closes the pane.

**I saw:**

## Compact sheet

1. At 360, the work list is present. Open the packet. The list is still in the DOM, dimmed. The page is a sheet (`[data-testid=page-sheet]`) flush to the sides and bottom. Copy inside the sheet is padded (does not brush the card). Grab or backdrop or `← Tower` dismisses. The list is still scrolled where it was.
2. Expand on the sheet grows it toward the top. Sides stay flush.
3. At 1440 the sheet is not used.

**I saw:**

## Loading and live

1. First paint before the snapshot: a spinner in the content (`[data-testid=desk-loading]`).
2. After load, a 60s refresh does not clear the open page or the view.
3. A running execution (when the live factory has one) still uses a processing tag; a small spinner sits with that process, not a Stop.
4. Toggle Dark, reload: Dark is still on.

**I saw:**

## Screenshots of the revision

Engineer captures after plant (not painted plates): table+pane, graph+pane, expanded pane, click-to-filter chip, compact sheet, gutters visible. Light, then at least one dark.

**I saw:**

## Steps I could not do
