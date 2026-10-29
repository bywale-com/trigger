# Engineer seat handoff

**Pickup file.** Update this when you stop so the next Engineer does not start from a transcript.

## Where we stopped

Packet 001 is planted on PR #4, branch `cursor/observability-v1-plates-7b9a`, base `cursor/seed-grain-note-7b9a`. The desk is the signed read: one snapshot of Tower, the table, the graph, the shared page, and a refresh kept in the server process. No Trigger database. No controller import. No build automation.

The production read follows `TOWER_REF` (default `main`) on `https://github.com/bywale-com/omcoda_tower.git`. The header shows `Tower · {ref}` and the first 7 characters of the commit that was read. At 5:53 PM ET on 29 Oct 2026, `main` was `0405ac12c4f2e02b51bee15a3db0e7db0b6ad027` (merge of Tower PR 138). That sha is not pinned in the desk.

`src/observe/tower/testdata/9c45f19` is the reference fixture for the approved plates and the unit tests. `9c45f19fa1ac9d909247d6be83c9263273b1bcbb` is not the production source.

How to run:

- `npm run dev` — Vite. `GET /api/snapshot` reads the current factory branch.
- `TOWER_FIXTURE=src/observe/tower/testdata/9c45f19` walks the approved revision.
- `TOWER_REPO`, `TOWER_REF`, `TOWER_CLONE` (default `/tmp/trigger-tower-read`). `TOWER_FAIL_FLAG` is a file; contents `1` fails the read and keeps the last snapshot.
- `npm run build`, then `npm start`. `PORT` defaults to 4173.

Verification at 5:53 PM ET on 29 Oct 2026:

- `npm test` and `npm run test:preflight`: vitest, 7 passed. `test:preflight` is vitest. This repo has no `src/runtime/walks` and no Vercel phone-face doors. The packet walk is `scripts/walk-desk.mjs` against a fixture desk.
- `npm run build`: `tsc --noEmit` and `vite build` passed.
- Browser walk of the fixture desk, viewport 1440: header `Tower · main 9c45f19`, ledger revision 1, scope inactive, three pages, the evidence and execution lines, no Run / Stop / Authorize / Dispatch, the initiative, packet, and blocked pages, graph of 3 nodes with 1 contains edge and 1 depends edge, `Type is Initiative` leaves 2 nodes and the depends edge, dark header `rgb(20, 20, 20)` against light `rgb(255, 255, 255)`. The Updated column sits inside the viewport. A failed read keeps the three pages and the header says `read failed`.
- Live read with `TOWER_FIXTURE` unset: ref `main`, sha `0405ac12c4f2e02b51bee15a3db0e7db0b6ad027`, the same sha as `git ls-remote` `refs/heads/main`. The header on that desk reads `Tower · main 0405ac1`. Same three pages, ledger revision 1, scope inactive.

Nothing in packet 001 is left open. The next packet number is 002, and that packet does not exist. Do not open a second PR. Do not append the Architect or SA logs.

## Founder locks (keep)

- Create / in-the-room / seated stay three moments. Sit hangs a person on `protocols/pm.md`, `protocols/sa.md`, or `protocols/engineer.md`.
- Do not append the Architect or SA logs.
- Do not treat Travis planted packets as work in this repo.
- Do not use the house build automations to build Trigger.
- The Ant chrome in light and dark is locked. Do not reinterpret it.

## Paste — new Engineer

You are Trigger’s Engineer. Read `docs/README.md` § Engineer and `AGENTS.md`. Read this file first. Then `docs/seats/ENGINEER.md` and `protocols/engineer.md`. Trail is git + PRs. One PR per initiative. Packet 001 is planted on PR #4. Do not replant it.
