# PM-PACKET-004 — First-class mobile desk

**Wake:** sa

**Direction:** [`PRODUCT-DIRECTION-V1.md`](./PRODUCT-DIRECTION-V1.md)  
**Grain:** [`V1-OBSERVABILITY-SPEC.md`](./V1-OBSERVABILITY-SPEC.md) §9  
**Test:** [`PM-PACKET-004-mobile-desk-TEST.md`](./PM-PACKET-004-mobile-desk-TEST.md)  
**Initiative:** PR 4, branch `cursor/observability-v1-plates-7b9a`. Do not open a cousin PR.

## Founder lock

> Trigger needs a proper mobile interface—not just the desktop UI squeezed onto a smaller screen.
>
> Since you'll be checking Tower's factory from your phone, I'd treat mobile as a first-class experience.
>
> But we should preserve the existing Ant Design visual language, not create a separate design.
>
> The goal is simple: you should be able to open Trigger on your phone and understand what Tower's factory is doing without zooming, horizontal scrolling, or fighting the interface.
>
> One thing I'd emphasize: don't mechanically turn the desktop table into a collection of giant cards. Preserve information density while making it usable on mobile.
>
> The current desktop interface is approved and must remain visually and functionally unchanged.

The snapshot, the read, GitHub evidence, and plates stay. This packet is the shell at phone and tablet widths. It does not restyle 1440.

## What hangs

Inspected planted `src/` on PR 4.

- `src/desk/chrome.tsx` is one flex row, header height 56, padding 20, source + PR + ledger + Segmented + Switch. At 360 that row overflows.
- `src/desk/TableView.tsx` is the approved nine-column Ant table, `pagination={false}`, `tableLayout="fixed"`, walked at 1440 so Updated stays in view. At 360 those columns cannot fit without shrinking type or scrolling sideways.
- `src/desk/GraphView.tsx` lays modules in 420px columns inside `overflow: auto`. There is no pinch-zoom and no pan besides native scroll. A node is a 340×72 button.
- `src/desk/Detail.tsx` is a 160px + 1fr property grid, `maxWidth: 880`. Plates are `<img maxWidth: 100%>` with no enlarge.
- `src/desk/App.tsx` already keeps `pageId`, `view`, `filters`, and `mode` across the 60s refresh. Back only clears `pageId`.
- `index.html` already has `width=device-width, initial-scale=1.0`.

## Face

**Breakpoint.** Compact shell when the viewport is `max-width: 991px` (below Ant `lg`). 360 / 390 / 430 / 768 use that shell. 1440 and any width ≥ 992 keep the approved desktop chrome, table, and graph overflow. Do not restyle desktop to match the phone.

**Header (compact).** Two or three wrapped rows, height auto, line-height normal, no horizontal page overflow. Row one: Trigger, then Table / Graph and the light/dark switch. Factory identity (Tower · ref sha, PR n, ledger revision · scope, read failed) sits under that, wrapping. Same words as desktop. Same Segmented. Same Switch. Not a hamburger. Not a bottom tab bar.

**Work list (compact).** Not the nine-column table squeezed. Not giant cards. One dense row per page, vertical scroll, min-height 52. Left: name, id, then module · Inside · Depends on · Updated on a wrapping secondary line. Right: Type and Stage tags, execution, evidence. A packet still sits after its initiative because the snapshot order does not change. Tap opens the same page. Filter stays. Page count stays. All nine facts remain; they stack instead of clipping.

**Graph (compact).** Same layout math (module columns, containment bracket, dashed depends). The canvas sits in a viewport that fills the remaining height. Pinch-to-zoom, one-finger pan, tap a node to open. A drag is not a tap. No React Flow. Desktop graph keeps `overflow: auto` and does not grow new chrome.

**Detail (compact).** Full width. Property label stacks above the value. Titles, intended behavior, specification, lifecycle tags, GitHub links, and SHA strings wrap. Back is `← Tower` and returns to the view that was open. Table / Graph in the header still switch views.

**Plates (compact).** Image is full width of the page. Tap enlarges (Ant Image preview). Artifact link stays under the image. Desktop plates stay the current `<img>` plus link.

**Refresh.** The 60s read must not reset view, filters, mode, or the open page.

**Out of the picture.** A second theme. Bottom navigation. Hamburger. Card masonry. Horizontal page scroll. Factory controls.

## Technical cut

| File | Job |
|---|---|
| `src/desk/compact.ts` | `max-width: 991px` media hook. No snapshot. |
| `src/desk/chrome.tsx` | Compact wrapped header. Desktop flex row unchanged. |
| `src/desk/TableView.tsx` | Compact dense work list. Desktop Ant table unchanged. Filter wraps. |
| `src/desk/GraphView.tsx` | Compact pan / pinch viewport. Desktop overflow-auto unchanged. |
| `src/desk/Detail.tsx` | Compact stacked properties, wrapping links, plate preview. Desktop grid unchanged. |
| `src/desk/desk.css` | Page `overflow-x` clip. Android text-size adjust. |
| `index.html` | Keep device-width viewport; add `viewport-fit=cover`. |

Do not change `src/observe/*`. Do not mint a store. Do not modify Tower.

## Named for the Systems Analyst

No new table. Viewport is not a record. Compact vs desktop is a shell of the same snapshot. Refresh already merges in memory; it must not drop navigation state. Plate enlarge is Ant preview of the same raw URL; still no image proxy.

## Out of scope

A native app. React Flow. Redesigning 1440. Removing module, evidence, GitHub, or plates to “fit.” A mobile-only color system.
