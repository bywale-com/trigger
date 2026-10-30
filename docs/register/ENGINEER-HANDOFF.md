# Engineer seat handoff

**Pickup file.** Update this when you stop so the next Engineer does not start from a transcript.

## Where we stopped

Packets 001–006 are on `main`. Packet 007 stays hold. Packet 008 (Factory Pulse) plants on PR 7, branch `cursor/live-factory-states-7b9a`. Compact open page is a bottom split: the work list stays visible and tappable, no dimming backdrop. Production URL may still be pre-006: Vercel Hobby `build-rate-limit` on `main` at 13:17 UTC 30 Oct 2026. Do not reopen PR 4.

`TOWER_REF` / `src/observe/tower/source.json` remain the factory source. Fixture `9c45f19` still has no plate. Walk plates with `scripts/plate-fixture.mjs` then `scripts/walk-plates.mjs`. Walk prose with `scripts/walk-desk.mjs`. Walk interaction with `scripts/walk-ixd.mjs`. Compact with `scripts/walk-mobile.mjs`.

How to run:

- `npm run dev` — Vite. `GET /api/snapshot` reads the configured factory branch. Fixture/local plate images are `GET /api/tree-file?path=`.
- `TOWER_REF` selects another branch. `TOWER_FIXTURE` reads a tree and skips GitHub. `TOWER_FAIL_FLAG` contents `1` fails the read and keeps the last snapshot.
- `TOWER_READ=github` uses GitHub file fetches (Vercel does this). GitHub plate `img` src stays raw.githubusercontent.com.
- `npm run build`, then `npm start`. `PORT` defaults to 4173.

Verification:

- `npm test`
- `npm run build`
- `scripts/walk-desk.mjs` at 1440 fixture: Pulse `inactive` / `unconfirmed` / `event`, table stays with the pane.
- `scripts/walk-ixd.mjs`: split, expand, click-to-filter, crumb, graph ring, compact list visible and tappable above the sheet, mode remembered.
- `scripts/walk-mobile.mjs`: list visible above the sheet, no page overflow at 360–768.

Do not append the Architect or SA logs. One PR per initiative. Packet 007 stays hold.

## Founder locks (keep)

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

You are Trigger’s Engineer. Read `docs/README.md` § Engineer and `AGENTS.md`. Read this file first. Then `docs/seats/ENGINEER.md` and `protocols/engineer.md`. Trail is git + PRs. One PR per initiative. Packets 001–006 are on main. Packet 007 stays hold. Packet 008 is PR 7. Do not replant 001–006.
