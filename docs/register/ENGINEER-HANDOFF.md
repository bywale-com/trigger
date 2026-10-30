# Engineer seat handoff

**Pickup file.** Update this when you stop so the next Engineer does not start from a transcript.

## Where we stopped

Packet 004 is planted on PR #4, branch `cursor/observability-v1-plates-7b9a`, base `cursor/seed-grain-note-7b9a`. Packets 001–003 stay. Do not open a second PR.

Below 992px the desk uses a compact shell of the same snapshot: wrapped header, dense work list (not giant cards, not a squeezed nine-column table), the same graph inside a pan/pinch viewport, stacked detail, full-width plates with tap-to-enlarge. 1440 keeps the approved Ant table and header row. Refresh still does not reset view, filters, mode, or the open page. Trigger remains read-only.

`TOWER_REF` / `src/observe/tower/source.json` remain the factory source. Fixture `9c45f19` is unchanged. Walk compact with `scripts/walk-mobile.mjs`.

How to run:

- `npm run dev` — Vite. `GET /api/snapshot` reads the configured factory branch.
- `TOWER_REF` selects another branch. `TOWER_FIXTURE` reads a tree and skips GitHub. `TOWER_FAIL_FLAG` contents `1` fails the read and keeps the last snapshot.
- `TOWER_READ=github` uses GitHub file fetches (Vercel does this).
- `npm run build`, then `npm start`. `PORT` defaults to 4173.

Verification at 7:40 AM ET on 30 Oct 2026:

- `npm test`: vitest, 23 passed.
- `npm run build`: tsc + vite, ok.
- `scripts/walk-desk.mjs` at 1440 fixture: nine-column table, Updated in view, packet 001–003 checks, no Plates heading, failed read keeps rows.
- `scripts/walk-plates.mjs` at 1440: two images, five buckets, blob links.
- `scripts/walk-mobile.mjs` at 360 / 390 / 430 / 768: no page overflow, work list not table, dense rows, stacked detail, graph pan/pinch and tap, dark header `rgb(20, 20, 20)`, 1440 still table. Plate fixture: full-width slot, enlarge preview. Live 360: header `PR 137`, 12 pages, accepted packet Integrated / Accepted, no overflow.
- `scripts/walk-active-branch.mjs` at 1440: `cursor/factory-agents-scope-33ee` `1c9c117` ledger 71, PR 137, 12 pages, graph 12 nodes.

Deployment: https://trigger-theta-cyan.vercel.app. Vercel project `trigger` (`prj_Uz8tASbR4GNNPVNOQFmxiJ51B0XW`). Production still serves the previous plant until this commit is promoted.

Genuine limits: live factory packets still have no plate PNGs. Compact graph uses the same 420px columns; large graphs are navigable by pan/pinch, not a different layout. Name ellipsis on the work list is density, not a missing row. Fixture plate bytes 404 at raw.githubusercontent.com.

Do not open a second PR. Do not append the Architect or SA logs. Packets 001–004 are planted.

## Founder locks (keep)

- Create / in-the-room / seated stay three moments.
- Do not append the Architect or SA logs.
- Do not use the house build automations to build Trigger.
- The Ant chrome in light and dark is locked at 1440. Do not reinterpret it.
- The factory branch stays configurable. Do not pin a commit sha.
- GitHub is evidence. The ledger is the record.
- Trigger remains read-only. Compact is a shell, not a second product.

## Paste — new Engineer

You are Trigger’s Engineer. Read `docs/README.md` § Engineer and `AGENTS.md`. Read this file first. Then `docs/seats/ENGINEER.md` and `protocols/engineer.md`. Trail is git + PRs. One PR per initiative. Packets 001–004 are planted on PR #4. Do not replant them.
