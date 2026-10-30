# SYSTEMS-CHANGE-PACKET-004 — Compact shell

**Signed:** 11:50 UTC 2026-10-30  
**Initiative:** [`PM-PACKET-004-mobile-desk.md`](./PM-PACKET-004-mobile-desk.md) on PR 4, branch `cursor/observability-v1-plates-7b9a`  
**Glass:** packet 001 plates at 1440, unchanged. Compact is the same snapshot below 992px.  
**Walk:** [`PM-PACKET-004-mobile-desk-TEST.md`](./PM-PACKET-004-mobile-desk-TEST.md)  
**Remap:** no migration. Trigger still has no SQL. This number is not a schema version.

Plant on that PR. Do not open a second PR. Do not modify Tower. Do not add a wake workflow.

## Intent

The founder reads Tower from a phone. The approved desktop desk must stay. Below Ant `lg` (991px) the same snapshot is presented so a 360px Android screen does not require pinch-zoom of the whole page or sideways scrolling.

## Must

- Keep packets 001–003: snapshot, table at ≥992px, graph layout math, refresh merge, failed-read, GitHub evidence, plates discovery.
- Compact when `window.matchMedia("(max-width: 991px)")`. 360, 390, 430, 768 are compact. 1440 is not.
- Compact header wraps. Same facts: Trigger, `Tower · {ref} {sha}`, factory PR link, ledger revision · scope, read failed, Table / Graph, light/dark. Header height auto. No hamburger.
- Compact work list is not `Table` columns and not giant cards. One dense row per page, snapshot order, all nine facts (name, type, module, stage, execution, evidence, inside, depends on, updated). Tap opens the page. Filter and page count remain.
- Compact graph: same boxes and edges. Viewport pan + pinch-zoom. Tap opens. Drag is not tap. No React Flow.
- Compact detail: label above value, full width, wrapping SHAs and URLs. Back clears only `pageId`.
- Compact plates: full-width image, tap-to-enlarge preview of the same raw URL. Artifact link stays. Do not proxy bytes.
- Refresh 60s must not reset `view`, `filters`, `mode`, or `pageId`.
- Light and dark remain Ant `defaultAlgorithm` / `darkAlgorithm`, primary `#1677ff`, radius 6, font 14, controlHeight 32.
- Page-level `overflow-x` does not introduce a horizontal scroller. Walk 1440 table still has Updated in view.

## Must-not

- Do not mint a Trigger table or database.
- Do not change `src/observe/*` for this packet.
- Do not restyle the ≥992px chrome, Ant table, or graph overflow-auto.
- Do not introduce a second color system, bottom nav, or card masonry.
- Do not drop module, evidence, lifecycle, GitHub, or plates to fit.
- Do not add Run, Stop, Authorize, Dispatch, Approve.
- Do not import React Flow.
- Do not modify Tower.

## Conflicts locked

| Fact | Desktop (≥992) | Compact (≤991) | Rule |
|---|---|---|---|
| Database of pages | Nine-column Ant table | Dense work list, same pages | Same snapshot. Compact is not a different store. |
| Graph | Overflow auto, 420px columns | Same layout in a pan/zoom viewport | Same boxes. Navigation differs. |
| Header | One flex row, height 56 | Wrapped rows, height auto | Same words. |
| Plates | `<img>` + blob link | Full width + Ant preview | Same URLs. |
| Refresh | Merge, keep nav | Merge, keep nav | Already true; do not regress. |

## Stores

**Materialized, external.** Unchanged: ledger, packet notes, GitHub REST, plate files.

**Materialized in Trigger.** Nothing.

**Map-only.** Compact vs desktop is a viewport of the existing in-memory snapshot.

**Named silence.** A native app. Device detection beyond the media query. A mobile-only API.

## Runtime

Same server read. Same JSON. No extra payload. Media query is client-only.

## Ports

**Real.** None new.

**Stand-in.** None.

**Refused.** Image proxy. Touch analytics. A second snapshot.

## Verify

Walk the packet 004 test sheet. Keep packet 001 fixture walk at 1440 green, packet 002 lifecycle, packet 003 plates.

Also:

- At 360, `document.documentElement.scrollWidth <= window.innerWidth + 1` on table, graph, initiative, packet.
- At 1440, `.ant-table-thead` still has Updated in view.
- Compact list `data-testid="work-list"`. Desktop still `data-testid="database"`.
- Opening a page, waiting 60s, the same page is still open (covered by not resetting state on `setBody`).

## Out of scope

A Trigger database. Editing Tower. Redesigning 1440. React Flow. A PWA install prompt.
