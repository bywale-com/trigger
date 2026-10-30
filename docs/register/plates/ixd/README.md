# Trigger — interaction design plates

**Date:** 30 October 2026, 8:16 AM America/Toronto  
**Seat:** Technical Architect  
**Status:** Recommendation. Not a packet. Do not plant. Do not wake SA.  
**Chrome lock:** live production https://trigger-theta-cyan.vercel.app at ledger revision 80, painted on 1440 (and 360 for compact). Header, Ant tokens, table, graph, and page body are the locked chrome. Only the pocket is painted.

Founder ask:

> Ok I want you to ideate avenues and areas to implement interaction design in trigger....produce yiur recommednatiom in plates...once approved you can turn them into packets snd move from there

Trigger is still a read-only desk. Interaction here means **how the founder moves through records that already exist**, not how Tower is told to work.

## What hangs today

Inspected planted `src/` and the live desk.

- Opening a page **replaces** the table or the graph (`App.tsx`: `open ? Detail : Table | Graph`). The database disappears.
- Table / Graph also **clears** the open page.
- A row is one hit target. Inside is colored like a link in the table and is plain text on the page. Stage is not a filter.
- The graph is a second room. A node click leaves the map. Desktop graph is overflow-scroll; compact already pans.
- The page is a scroll. Back is `← Tower`. There is no sibling Previous / Next. There is no URL for the open page.
- Filter is a three-step form. Refresh is a silent 60s merge. Mode is not remembered.

No new store is required for any plate below. Selection, split, hash, and click-to-filter are client faces of the snapshot already on the desk.

## Recommendation (order)

Ship **1**, then **2** as the same pattern on the graph, then **4** (cheap), then **3**, then **5** as the compact of 1. Do not packet until the founder marks which of these are the go.

Out of this round: search, a command palette, pinning, compare-two, a pause-refresh control that looks like a factory stop, React Flow.

---

## Now (chrome lock)

- [00-now-table.png](./00-now-table.png) — the database, 1440
- [00-now-graph.png](./00-now-graph.png) — the same pages as a graph
- [00-now-page.png](./00-now-page.png) — a packet page. The table is gone.

---

## 1. Stay with the work

[01-stay-with-the-work.png](./01-stay-with-the-work.png)

The table stays. The open page is a pane. The selected row has the primary edge.

**Copy.** Same header. Same Filter. Same nine facts. A row click does not destroy the database. The page is beside it.

**Do not build.** A second theme. A drawer that covers the table. Nested expandable rows. Run / Stop / Dispatch.

**Implied.** The open page is the URL (`#pkt-001-click-attribution`). Refresh still does not kick you off it. Table / Graph keeps the same page in the pane.

**Completes.** The founder reads a packet without losing the list of its siblings.

**Out of scope.** Writing to Tower. A project switcher.

---

## 2. The graph keeps the map

[02-graph-keeps-the-map.png](./02-graph-keeps-the-map.png)

A node click highlights that node and opens the same pane. The contains bracket and the depends edge stay in view.

**Copy.** Same graph boxes. Same filter sentence. Primary ring on the open node. Same page pane as plate 1.

**Do not build.** React Flow. A minimap product. A different graph layout.

**Implied.** Table and Graph are two views of the same open page. Switching the segmented control does not close the pane.

**Completes.** The map and the page can be read together.

**Out of scope.** Editing edges. A second graph library.

---

## 3. The page is a place

[03-the-page-is-a-place.png](./03-the-page-is-a-place.png)

Back is a path, not a trap door. Sections of a long page are jumps. Previous / Next walks packets inside the same initiative.

**Copy.** `← Tower / exec-identity / this packet`. Ant tabs for Page, Intended, Lifecycle, Evidence, GitHub. Previous · Next. Header unchanged.

**Do not build.** A second information architecture. Hiding facts behind tabs that the table already shows. A tab for systems-change (packet 001 locked that absence).

**Implied.** `exec-identity` in the crumb opens that initiative. The URL names the page. Keyboard `j` / `k` can be the same Previous / Next.

**Completes.** The founder can walk an initiative’s packets without returning to the table each time.

**Out of scope.** Authoring. A table of contents that invents headings the factory file does not have.

---

## 4. Click what you see

[04-click-what-you-see.png](./04-click-what-you-see.png)

A stage tag is a filter. The existing Filter chip appears. The row is selected.

**Copy.** Same Filter control. The chip `Stage is Candidate` is the chip the form already mints. The table and the graph share it, as they do today.

**Do not build.** A new filter language. Filtering from a stage word that is not already a `DeskFilter` field. A hover card that restates the whole packet.

**Implied.** Type, Module, Inside, Depends on work the same way. Inside on the page is a link. A lifecycle tag on the page shows its `basis` (already on `title`) as a popover.

**Completes.** The three-step Filter form is no longer the only way to hide pages.

**Out of scope.** Saved views. A Trigger table of filters.

---

## 5. Compact is the same idea

[05-compact-sheet.png](./05-compact-sheet.png)

On the phone the list does not vanish. The page is a sheet over it. The grab dismisses.

**Copy.** Same compact header. Same work list, dimmed. Same packet page inside the sheet.

**Do not build.** A bottom tab bar. Giant cards. A second compact IA.

**Implied.** Swipe down closes. The list scroll position is still there. 1440 stays plate 1, not this sheet.

**Completes.** Plate 1 at 360 without squeezing the nine-column table.

**Out of scope.** A native app.

---

## Named for the Systems Analyst (when a plate is approved)

No new Trigger table. The snapshot is unchanged. Hash, selection, split, click-to-filter, crumb, and sheet are faces of pages already in memory. Do not ascribe a store for “open page” or “selected row.”
