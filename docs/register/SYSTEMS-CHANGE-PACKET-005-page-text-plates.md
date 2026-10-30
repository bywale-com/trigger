# SYSTEMS-CHANGE-PACKET-005 — Page text and visible plates

**Signed:** 12:05 UTC 2026-10-30  
**Initiative:** [`PM-PACKET-005-page-text-plates.md`](./PM-PACKET-005-page-text-plates.md) on a new PR off `main`  
**Glass:** packet 001–004 desk. This packet formats the quoted factory files and paints a plate when the observed tree has one.  
**Walk:** [`PM-PACKET-005-page-text-plates-TEST.md`](./PM-PACKET-005-page-text-plates-TEST.md)  
**Remap:** no migration. Trigger still has no SQL. This number is not a schema version.

Plant on that PR. Do not reopen PR 4. Do not modify Tower. Do not add a wake workflow.

## Intent

The founder reads packet and initiative pages. Those pages currently dump markdown source. When a packet has a plate, the image must actually appear, not a 404 raw URL of a local file.

## Must

- Keep packets 001–004: snapshot, table at ≥992px, compact shell, graph, refresh merge, failed-read, GitHub evidence, plate **discovery** (note + scoped `docs/factory` dirs, five buckets, blob artifact link, omit when empty).
- Render `specificationText`, each `journals[].text`, and `intendedBehavior` as a read-only markdown pass (headings, paragraphs, lists, emphasis, code, links). Do not execute HTML. Do not put markdown images from those passages into a second gallery.
- Do not add a systems-change section. Packet 001 locked that absence.
- Local/fixture trees: plate `imageUrl` is `/api/tree-file?path=` for a `docs/factory/` image the tree already listed. Serve those bytes. Do not put PNG bytes on the snapshot JSON.
- GitHub / Vercel read: plate `imageUrl` stays `raw.githubusercontent.com`. Do not proxy GitHub bytes through Trigger.
- Artifact URL stays the GitHub blob at the observed SHA.
- Fixture `9c45f19` still has no plate. Live packets with `None.` and no image still omit Plates.
- Light and dark remain Ant `defaultAlgorithm` / `darkAlgorithm`, primary `#1677ff`, radius 6, font 14, controlHeight 32.
- Desktop and compact plates use Ant Image preview. Compact full-width stays.

## Must-not

- Do not mint a Trigger table, blob store, or second ledger.
- Do not discover `docs/register` / blueprint screenshots.
- Do not pin `TOWER_REF` to a SHA. Do not point production at the plate fixture.
- Do not add Approve, Reject, Run, Dispatch.
- Do not import the Tower controller.
- Do not modify Tower.
- Do not restyle the 1440 header, table, or graph.

## Conflicts locked

| Fact | Before | After | Rule |
|---|---|---|---|
| Factory prose | `pre-wrap` source | Markdown pass of the same string | Same snapshot field. Face only. |
| Plate `img src` on GitHub mode | raw.githubusercontent.com | unchanged | Production port. |
| Plate `img src` on fixture/local | raw URL of a file that is not on GitHub | `/api/tree-file` of that tree path | Same path. Bytes from the tree already read. |
| Snapshot JSON | no PNG bytes | no PNG bytes | Do not embed. |
| `9c45f19` PKT-001 | no Plates heading | no Plates heading | Unchanged. |

## Stores

**Materialized, external.** Unchanged: ledger, packet notes, specification, journals, GitHub REST, plate files on the observed tree.

**Materialized in Trigger.** Nothing.

**Map-only.** Markdown HTML is not stored. `/api/tree-file` is a read of the current on-disk tree, not a catalog.

**Named silence.** A Trigger image bucket. Inventing plates from blueprints. A markdown editor. Systems-change body on the packet page.

## Runtime

Same 60s snapshot. The markdown pass runs in the client from strings already on the page. `/api/tree-file` is requested only by `<img>` / Ant Image when the snapshot pointed at it.

## Ports

**Real.** GitHub raw (production plates). Local filesystem of the fixture/clone (tree-file).

**Stand-in.** None.

**Refused.** Proxy of GitHub image bytes. `docs/register` image listing.

## Verify

Walk the packet 005 test sheet. Keep packet 001 fixture walk at 1440 green, packet 002 lifecycle, packet 003 discovery (omit on stock `9c45f19`; images + buckets on the plate fixture), packet 004 compact.

Also:

- Stock fixture specification contains a list (`li` or equivalent), not a single pre with `- Claim 2`.
- Stock fixture packet has no `[data-testid=plates]`.
- Plate fixture: two `img` with rendered width > 200. `src` includes `/api/tree-file`. Click opens `.ant-image-preview`.
- Live factory: still no invented plate.

## Out of scope

A Trigger database. Editing Tower. A production fixture switcher. Restyling 1440 chrome.
