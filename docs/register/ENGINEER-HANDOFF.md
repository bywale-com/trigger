# Engineer seat handoff

**Pickup file.** Update this when you stop so the next Engineer does not start from a transcript.

## Where we stopped

Hotfix 002 is PR 9 (`cursor/compact-drawers-71ee`): on the phone the header shows Trigger until the lip reveals the branch and the ledger. The running strip is one line until its lip reveals the rows. The page lip drags the preview and fills the screen; the enlarge button stays on the desktop only. Plates are in `docs/register/plates/hotfix-002/`. Hotfix 001 is on main as PR 8. The Tower board is one bordered table at every width. Columns keep their designed widths (Name 220 through Updated 84). A header border drags that whole column, clamped to 85–115% of the designed width. The board scrolls sideways inside itself. The compact work list is gone. `data-testid="database"` is the board on the phone and on the desktop.

Packets 001–006 are on `main`. Packet 007 stays hold. Packet 008 (Factory Pulse) plants on PR 7, branch `cursor/live-factory-states-7b9a`. Do not reopen PR 4. Do not bring the work list back.

`TOWER_REF` / `src/observe/tower/source.json` remain the factory source. Fixture `9c45f19` still has no plate. Walk plates with `scripts/plate-fixture.mjs` then `scripts/walk-plates.mjs`. Walk prose with `scripts/walk-desk.mjs`. Walk interaction with `scripts/walk-ixd.mjs`. Compact with `scripts/walk-mobile.mjs`.

How to run:

- `npm run dev` — Vite. `GET /api/snapshot` reads the configured factory branch. Fixture/local plate images are `GET /api/tree-file?path=`.
- `TOWER_REF` selects another branch. `TOWER_FIXTURE` reads a tree and skips GitHub. `TOWER_FAIL_FLAG` contents `1` fails the read and keeps the last snapshot.
- `TOWER_READ=github` uses GitHub file fetches (Vercel does this). GitHub plate `img` src stays raw.githubusercontent.com.
- `npm run build`, then `npm start`. `PORT` defaults to 4173.

Verification on the `9c45f19` fixture, 30 Oct 2026:

- `npm test` — pass, including `columnLimit`.
- `npm run build` — pass.
- `scripts/walk-desk.mjs` at 1440: Pulse `inactive` / `unconfirmed` / `event`, header still shows the branch and the ledger, columns even, table stays with the pane.
- `scripts/walk-ixd.mjs`: desktop enlarge still hides the table. On the phone the sheet has no enlarge button, and the lip fills the screen.
- `scripts/walk-mobile.mjs`: header details open and close, pulse detail stays shut, preview is taller, a short lip drag raises the sheet, a long drag fills the screen, Escape restores the preview, the row stays visible above the sheet.
- Vercel on `main` `557b4aa` — success. Production https://trigger-theta-cyan.vercel.app is serving `index-BV7mBNrp.js`. The Deployment Check that runs the walks on that URL is the remaining signal; this seat did not sit in Vercel logs for it.

Do not append the Architect or SA logs. One PR per initiative. Packet 007 stays hold.

## Founder locks (keep)

- On the phone, the branch and the ledger stay behind the header lip. The running rows stay behind the strip lip. The page lip drags the preview. The enlarge button is desktop only.
- The board is a normal table: header, borders, one width per column, sideways scroll inside the board. A column border moves a little, and the whole column moves with it.
- Create / in-the-room / seated stay three moments.
- Do not append the Architect or SA logs.
- Do not use the house build automations to build Trigger.
- The Ant chrome in light and dark is locked at 1440. Do not reinterpret it.
- The factory branch stays configurable. Do not pin a commit sha.
- GitHub is evidence. The ledger is the record.
- Trigger remains read-only. Compact is a shell, not a second product.
- Do not point production at the plate fixture.
- Do not paraphrase factory reasons into essays. Spin for live. `unconfirmed` when there is no confirmed worker. Countdown only for `lease.until` or a parsed cron.

## Paste — new Engineer

You are Trigger’s Engineer. Read `docs/README.md` § Engineer and `AGENTS.md`. Read this file first. Then `docs/seats/ENGINEER.md` and `protocols/engineer.md`. Trail is git + PRs. One PR per initiative. Packets 001–006 are on main. Packet 007 stays hold. Packet 008 is PR 7. Hotfix 001 is PR 8. Hotfix 002 is PR 9. Do not replant 001–006. Do not bring back the compact work list. Do not put the branch line back on the closed phone header.
