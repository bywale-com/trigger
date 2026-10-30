# Engineer seat handoff

**Pickup file.** Update this when you stop so the next Engineer does not start from a transcript.

## Where we stopped

Packets 001–004 are on `main` (PR 4 merged). Packet 005 is planted on `cursor/page-text-plates-7b9a`. Packet 006 is planted on `cursor/ixd-plates-7b9a` (PR 6, stacked on 005): split pane, graph keeps the map, click-to-filter, crumb + hash, compact sheet, expand icon, gutters, load/live spin. Do not reopen PR 4. Do not mint a cousin.

`TOWER_REF` / `src/observe/tower/source.json` remain the factory source. Fixture `9c45f19` still has no plate. Walk plates with `scripts/plate-fixture.mjs` then `scripts/walk-plates.mjs`. Walk prose with `scripts/walk-desk.mjs`. Walk interaction with `scripts/walk-ixd.mjs`. Compact with `scripts/walk-mobile.mjs`.

How to run:

- `npm run dev` — Vite. `GET /api/snapshot` reads the configured factory branch. Fixture/local plate images are `GET /api/tree-file?path=`.
- `TOWER_REF` selects another branch. `TOWER_FIXTURE` reads a tree and skips GitHub. `TOWER_FAIL_FLAG` contents `1` fails the read and keeps the last snapshot.
- `TOWER_READ=github` uses GitHub file fetches (Vercel does this). GitHub plate `img` src stays raw.githubusercontent.com.
- `npm run build`, then `npm start`. `PORT` defaults to 4173.

Verification at 8:55 AM ET on 30 Oct 2026:

- `npm test`: vitest, 33 passed.
- `npm run build`: tsc + vite, ok.
- `scripts/walk-desk.mjs` at 1440 fixture: table stays with the pane, hash `#exec-identity`, Updated in view when the pane is closed.
- `scripts/walk-ixd.mjs`: split, expand, click-to-filter, crumb, graph ring, compact sheet flush with inner padding, mode remembered.
- `scripts/walk-mobile.mjs`: list stays under the sheet, no page overflow at 360–768.
- `scripts/walk-plates.mjs`: two painted figures in the pane, `/api/tree-file` src, blob links, Ant preview.

Screenshots of the plant: `docs/register/plates/ixd/built-*.png`.

Genuine limits: live factory packets still have `## Plates` / `None.` Compact graph is still 420px columns. Do not discover `docs/register` blueprints.

Do not append the Architect or SA logs. Packets 001–004 are on main. Packets 005 and 006 are the open stacked PRs.

## Founder locks (keep)

- Create / in-the-room / seated stay three moments.
- Do not append the Architect or SA logs.
- Do not use the house build automations to build Trigger.
- The Ant chrome in light and dark is locked at 1440. Do not reinterpret it.
- The factory branch stays configurable. Do not pin a commit sha.
- GitHub is evidence. The ledger is the record.
- Trigger remains read-only. Compact is a shell, not a second product.
- Do not point production at the plate fixture.

## Paste — new Engineer

You are Trigger’s Engineer. Read `docs/README.md` § Engineer and `AGENTS.md`. Read this file first. Then `docs/seats/ENGINEER.md` and `protocols/engineer.md`. Trail is git + PRs. One PR per initiative. Packets 001–004 are on main. Packet 005 is PR 5. Packet 006 is PR 6. Do not replant 001–004.
