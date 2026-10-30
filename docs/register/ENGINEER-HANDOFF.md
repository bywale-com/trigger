# Engineer seat handoff

**Pickup file.** Update this when you stop so the next Engineer does not start from a transcript.

## Where we stopped

Packets 001–004 are on `main` (PR 4 merged). Packet 005 is planted on `cursor/page-text-plates-7b9a`: factory markdown as Ant typography, and local/fixture plates paint through `/api/tree-file`. Do not reopen PR 4.

`TOWER_REF` / `src/observe/tower/source.json` remain the factory source. Fixture `9c45f19` still has no plate. Walk plates with `scripts/plate-fixture.mjs` then `scripts/walk-plates.mjs`. Walk prose with `scripts/walk-desk.mjs`.

How to run:

- `npm run dev` — Vite. `GET /api/snapshot` reads the configured factory branch. Fixture/local plate images are `GET /api/tree-file?path=`.
- `TOWER_REF` selects another branch. `TOWER_FIXTURE` reads a tree and skips GitHub. `TOWER_FAIL_FLAG` contents `1` fails the read and keeps the last snapshot.
- `TOWER_READ=github` uses GitHub file fetches (Vercel does this). GitHub plate `img` src stays raw.githubusercontent.com.
- `npm run build`, then `npm start`. `PORT` defaults to 4173.

Verification at 8:00 AM ET on 30 Oct 2026:

- `npm test`: vitest, 30 passed.
- `npm run build`: tsc + vite, ok.
- `scripts/walk-desk.mjs` at 1440 fixture: specification is a list, journal has no `**When:**`, intended behavior is paragraphs with code, no Plates heading, Updated in view.
- `scripts/walk-plates.mjs`: two painted figures 880×551, `/api/tree-file` src, blob links, Ant preview, five buckets.

Deployment: https://trigger-theta-cyan.vercel.app still follows the live factory branch. That tree has no `docs/factory` PNGs, so production pages omit Plates until Tower commits one. The plate render is the fixture walk.

Genuine limits: live factory packets still have `## Plates` / `None.` Compact graph is still 420px columns. Do not discover `docs/register` blueprints.

Do not append the Architect or SA logs. Packets 001–004 are on main. Packet 005 is this PR.

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

You are Trigger’s Engineer. Read `docs/README.md` § Engineer and `AGENTS.md`. Read this file first. Then `docs/seats/ENGINEER.md` and `protocols/engineer.md`. Trail is git + PRs. One PR per initiative. Packets 001–004 are on main. Packet 005 is the open PR. Do not replant 001–004.
