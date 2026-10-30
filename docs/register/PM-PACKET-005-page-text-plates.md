# PM-PACKET-005 — Page text and visible plates

**Wake:** sa

**Direction:** [`PRODUCT-DIRECTION-V1.md`](./PRODUCT-DIRECTION-V1.md)  
**Grain:** [`V1-OBSERVABILITY-SPEC.md`](./V1-OBSERVABILITY-SPEC.md) §10  
**Test:** [`PM-PACKET-005-page-text-plates-TEST.md`](./PM-PACKET-005-page-text-plates-TEST.md)  
**Initiative:** new PR off `main`. Packets 001–004 are already merged. Do not reopen PR 4.

## Founder lock

> New packet. I think page text formatting can be substantially improved...also I would like to see one plate where a page contains a plate(s). I want to see how our ui renders that.
>
> for the text formatting....anyway, ill leave it up to you. Let me see the platss

The table, graph, header, compact shell, GitHub evidence, and plate discovery rules stay. This packet is the packet/initiative **page body**: readable factory prose, and a plate that actually paints when the tree has one.

## What hangs

Inspected planted `src/` on `main` `64989bb` after PR 4.

- `src/desk/Detail.tsx` dumps `specificationText`, `journals[].text`, and `intendedBehavior` through Ant `Paragraph` with `whiteSpace: "pre-wrap"`. Factory markdown therefore shows as source: `#` headings, `**When:**`, backtick paths, hyphen lists. The page quotes the factory files (V1 §3.10) but it does not have to quote them as raw markup.
- `systemsChangeText` is on the snapshot. Packet 001 locked the packet plate without a systems-change section. This packet does not add one.
- `Plates` in `Detail.tsx` is an `<img>` (desktop) or Ant `Image` (compact) plus a blob link. Discovery from packet 003 is correct. Live Tower `cursor/factory-agents-scope-33ee` `9a291f2` has **zero** images under `docs/factory`. Blueprint PNGs live under `docs/register` and stay undiscovered.
- `gatherPacketPlates` always sets `imageUrl` to `raw.githubusercontent.com/{repo}/{sha}/{path}`. The plate fixture writes PNGs only onto a local tree, so those URLs 404. Walks measured the wrapper, not a painted picture. The founder has not seen a plate.

## Face

**Page prose.** Specification, journal entries, and intended behavior render as Ant typography from the factory markdown: headings, paragraphs, lists, emphasis, inline code, fenced code, and links. Light and dark both use the locked tokens (`#1677ff`, radius 6, font 14). A leading file `#` title does not repeat the page title as a second H1. HTML in the file is not executed. Markdown images inside those passages are not a second gallery; packet plates stay in the Plates section.

**Not rewritten.** Obligation, outstanding, property rows, lifecycle tags, GitHub facts, verification lines. Those are already sentences and fields.

**Plates, when present.** After Intended behavior, each image is a figure: framed, `max-width: 100%`, readable height (not a 1-pixel stub of a 1×1 file). Desktop and compact both use Ant `Image` so a tap/click enlarges. The repo path under the image remains the blob link at the observed SHA. Five buckets stay as they are. Omit the section when there is no image and no bucket text. No Approve.

**Where the bytes come from.** GitHub / Vercel read of the live factory still uses the raw GitHub URL. Bytes stay off the snapshot. A **local or fixture** tree serves the same path from that tree at `/api/tree-file?path=…` so a committed plate on the tree actually paints. Artifact URL stays the GitHub blob. Do not proxy live GitHub bytes. Do not walk `docs/register`.

**Fixture `9c45f19`.** Still no plate. The plate fixture (copy of that tree plus named PNGs and a filled `## Plates`) is how this packet shows a page that contains plates. Production keeps `TOWER_REF` / `source.json`. Do not pin a SHA. Do not swap production to the fixture.

**1440 chrome.** Header row, nine-column table, graph overflow-auto stay. Compact shell stays. This packet does not restyle those.

## Technical cut

| File | Job |
|---|---|
| `src/desk/markdown.tsx` | Read-only factory markdown → Ant nodes. No snapshot. |
| `src/desk/Detail.tsx` | Passages use that pass. Plate figures + preview on desktop and compact. |
| `src/observe/tower/read.ts` | Local/fixture plate `imageUrl` is `/api/tree-file`. GitHub mode keeps raw URLs. |
| `src/observe/tree-file.ts` | Serve an image path from the current local/fixture tree. `docs/factory/` + image extensions only. |
| `api/tree-file.ts` | Vercel route for that serve. |
| `vite.config.ts`, `src/observe/serve.ts`, `vercel.json` | Wire `/api/tree-file`. |

Do not import the Tower controller. Do not mint a Trigger table. Do not modify Tower. Do not discover blueprint screenshots.

## Named for the Systems Analyst

No new table. Prose formatting is the same strings already on the snapshot. `/api/tree-file` is a byte serve of a file the read already listed, only when that tree is on disk. GitHub Contents / raw remain the production plate port. Named silence: a Trigger image store, a markdown editor, inventing plates from `docs/register`.

## Out of scope

A plate editor. Approval. Systems-change body on the packet page. Restyling the table or graph. Writing plates into Tower. Pinning production to the fixture SHA.
