# SYSTEMS-CHANGE-PACKET-003 — Factory plate discovery

**Signed:** 11:30 UTC 2026-10-30  
**Initiative:** [`PM-PACKET-003-factory-plates.md`](./PM-PACKET-003-factory-plates.md) on PR 4, branch `cursor/observability-v1-plates-7b9a`  
**Glass:** packet 001 plates, unchanged. This packet extends the shared packet page.  
**Walk:** [`PM-PACKET-003-factory-plates-TEST.md`](./PM-PACKET-003-factory-plates-TEST.md)  
**Remap:** no migration. Trigger still has no SQL. This number is not a schema version.

Plant on that PR. Do not open a second PR. Do not modify Tower. Do not add a wake workflow.

## Intent

The desk already reads Tower’s ledger and packet notes. When an Architect commits a UI plate for a packet on the observed factory branch, that same packet page must show the image and the five-bucket read. Trigger does not become an editor, an approver, or a second store.

## Must

- Keep the packet 001 snapshot, table, graph, refresh, failed-read behavior, and packet 002 lifecycle / GitHub evidence.
- Parse `## Plates` from the packet note already fetched for `intendedSection`. Five buckets only: Copy, Do not build, Implied, Completes, Out of scope. Do not invent a sixth. Missing bucket text is `unavailable`.
- Discover image files from (a) markdown / HTML image references in that section whose path resolves inside `docs/factory/`, and (b) a scoped directory listing: `docs/factory/initiatives/<initiativeId>/plates/`, `…/packets/plates/`, `…/packets/<packetId>/` in `pkt-` and `PKT-` forms, plus image files in the packets directory whose names include the packet id. Extensions: `png`, `webp`, `jpg`, `jpeg`, `gif`.
- A committed file on the observed SHA is enough. Do not wait for `release`, `wake`, `stage`, engineering, or merge to `main`. The word `None.` does not hide a committed file.
- Each plate on the snapshot is path + alt + `imageUrl` + `artifactUrl`. `imageUrl` is `https://raw.githubusercontent.com/{repo}/{sha}/{path}`. `artifactUrl` is `https://github.com/{repo}/blob/{sha}/{path}`. Do not read image bytes into the snapshot. Do not proxy bytes through Trigger.
- Packet page: after Intended behavior, before Verification, render those images and buckets when either exists. Omit the section when both are empty. Initiative page unchanged.
- GitHub read mode `list()` must return directory names for those scoped paths (Contents API, cached, failure → `[]`). Journal probe remains the fallback for `…/journal`. A listing failure must not fail `readTower`.
- Fixture `9c45f19` packet 001 has no plate. Do not add plate files to that fixture. Its page omits Plates.
- Light and dark remain Ant `defaultAlgorithm` and `darkAlgorithm`, primary `#1677ff`, radius 6, font 14, control height 32.
- Multiple plates per packet are an array, markdown order then newly discovered files sorted by path.

## Must-not

- Do not mint a Trigger table or database. No SQL. No plates store.
- Do not import `.factory/controller/*`. Do not call `decide`, `controlStep`, `dispatchWake`, or the label actuator.
- Do not scan the whole repository. Do not discover `docs/register`, `*-blueprint`, or Trigger’s own `docs/register/plates/v1/`.
- Do not `file()` PNG bytes (utf8 would corrupt them; they do not belong on the snapshot).
- Do not add Approve, Reject, Release, Run, Stop, Authorize, or Dispatch.
- Do not pin a factory SHA. `TOWER_REF` / `source.json` stay the source.
- Do not wait on GitHub pull-request evidence to show a plate.
- Do not redesign TableView or GraphView.
- Do not fail the 60-second refresh because a plate directory 404’d.

## Conflicts locked

| Fact | Ledger / note | Tree files | Rule |
|---|---|---|---|
| Whether a plate exists | `## Plates` / `None.` on PKT-002–009 at revision 61 | no `docs/factory` images on `0bad2c30` | Files on the observed SHA win. `None.` with no files omits the section. |
| Bucket copy | `## Plates` body | none | The note is the read. Missing buckets are unavailable. Do not invent. |
| Authoritative bytes | none | blob at `{repo}/{sha}/{path}` | The GitHub blob URL at the observed SHA. Raw is the `img` src. |
| Fixture PKT-001 | no `## Plates` section | no image in `9c45f19` | Omit Plates. Do not plant a plate into that fixture. |
| Product screenshots | `docs/register` / blueprints | not packet notes | Named silence. Out of discovery scope. |

## Stores

**Materialized, external.**

- `.factory/state/ledger.json` — same `FactoryLedger` as packets 001–002. Packets name which pages exist. No `plates` field on the manifest at this SHA.
- Packet notes under `docs/factory/initiatives/<initiativeId>/packets/`. `## Plates` is the bucket source and a source of image hrefs.
- Image files in the scoped directories on that same tree.
- GitHub Contents API, read-only, for directory names when `TOWER_READ=github` / Vercel. Repo `bywale-com/omcoda_tower` unless `TOWER_REPO` says otherwise.

**Materialized in Trigger.** Nothing. No new database.

**Map-only.** `plates` on the packet page of the in-memory snapshot. Process memory. A restart drops them. Do not write them to disk.

**Named silence.**

- `docs/register` product / blueprint screenshots.
- Plate approval, release gates, and any write to Tower.
- Cursor cloud-agent image attachments.
- Image bytes inside the snapshot JSON.

### Snapshot additions

On packet pages: `plates: { buckets: { id, label, text }[], bucketsAvailable: boolean, images: { path, alt, imageUrl, artifactUrl }[] }`.

`id` values: `copy`, `doNotBuild`, `implied`, `completes`, `outOfScope`. Labels on the glass: Copy, Do not build, Implied, Completes, Out of scope.

Empty plates: `images: []`, `bucketsAvailable: false`, every `text` null. Detail omits the section.

`readAt` stays UTC without fractional seconds.

## Runtime

Same as packets 001–002: server reads, browser receives JSON, no token in the client. Refresh 60 seconds. Directory listings share one in-process map per path for that read. Parallel. A Contents 404 is an empty list. Do not add serial waits that blow the Vercel 10s hobby budget.

## Ports

**Real.** The existing Tower file read. GitHub Contents `GET /repos/{owner}/{repo}/contents/{path}?ref={sha}` for scoped directories in GitHub mode. Raw and blob URLs as constructed links, not fetches of image bytes.

**Stand-in.** Fixture tree: `readdir`, no GitHub Contents.

**Refused.** Writes. Image proxy. Whole-repo tree walk. Vercel blob store.

## Verify

Walk the packet 003 test sheet. Keep the packet 001 fixture walk and packet 002 lifecycle walk green.

Also, on the snapshot:

- Fixture packet: `plates.images` is `[]`, `plates.bucketsAvailable` is false. Detail omits Plates.
- `platesSection` on a body of `None.` returns no buckets and no markdown images.
- `platesSection` on the five labeled buckets returns those five texts in order.
- A copied fixture plus `docs/factory/initiatives/exec-identity/plates/pkt-001-click-attribution-light.png` yields that path on the packet page even when the note says `None.`
- Live configured-branch packets with `## Plates` / `None.` and no factory images omit the section.

## Out of scope

A Trigger database. A plate editor. Editing Tower. Approvals. Discovering blueprint screenshots. Redesigning the table.
