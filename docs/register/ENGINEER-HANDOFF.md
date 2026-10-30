# Engineer seat handoff

**Pickup file.** Update this when you stop so the next Engineer does not start from a transcript.

## Where we stopped

Packet 003 is planted on PR #4, branch `cursor/observability-v1-plates-7b9a`, base `cursor/seed-grain-note-7b9a`. Packets 001 and 002 and the factory-branch correction stay. Do not open a second PR.

The desk still reads one Tower snapshot. Packet pages now also show factory UI plates committed on the observed SHA: the images, the five-bucket read (Copy, Do not build, Implied, Completes, Out of scope), and a GitHub blob link per image. Discovery is the packet note’s `## Plates` plus a scoped directory listing. A committed file wins over the word `None.` Empty plates omit the section. No approval control. No second store. Image bytes are not on the snapshot.

`TOWER_REF` / `src/observe/tower/source.json` remain the factory source. Packet 002 GitHub evidence stays. Fixture mode does not call GitHub. A GitHub 403 does not fail the Tower read.

`src/observe/tower/testdata/9c45f19` is still the plate fixture and still has no packet plate. Walk it with `TOWER_FIXTURE` and `TOWER_REF=main`. Materialize a plates tree with `node scripts/plate-fixture.mjs <dir>` without editing that fixture.

How to run:

- `npm run dev` — Vite. `GET /api/snapshot` reads the configured factory branch and attaches GitHub evidence and plates.
- `TOWER_REF` selects another branch. `TOWER_REPO` selects another clone URL. `TOWER_CLONE` is the sparse checkout (default `/tmp/trigger-tower-read`).
- `TOWER_FIXTURE` reads a tree instead of git and skips GitHub. `TOWER_FAIL_FLAG` is a file; contents `1` fails the read and keeps the last snapshot.
- `TOWER_READ=github` uses GitHub file fetches (Vercel does this), including Contents API listings for plate directories.
- `npm run build`, then `npm start`. `PORT` defaults to 4173. `HOST` defaults to `127.0.0.1`; set `HOST=0.0.0.0` when a platform routes to the process.

Verification at 7:20 AM ET on 30 Oct 2026:

- `npm test` / `npm run test:preflight`: vitest, 22 passed.
- `npm run build`: tsc + vite, ok.
- `scripts/walk-desk.mjs` against the fixture (`TOWER_REF=main`): packet 001 walk plus lifecycle, GitHub unavailable, no Plates heading, no Approve, dark packet page, failed read keeps the rows.
- `scripts/walk-plates.mjs` against a `plate-fixture.mjs` tree: two images, five buckets, blob links, no Approve, dark keeps the buckets.
- `scripts/check-active-branch.mts`: configured branch `cursor/factory-agents-scope-33ee`, sha `ff7cf074063a1bec20f5d12c5ab3fd2e1afb3515`, ledger revision 64, scope active, 11 pages.
- `scripts/walk-active-branch.mjs` at 1440: header `Tower · cursor/factory-agents-scope-33ee ff7cf07` and `PR 137`, accepted packet Integrated yes / Accepted yes, PKT-002 Dispatched yes / Committed yes, no Plates heading (notes still say `None.` and the tree has no `docs/factory` image), no Approve, graph 11 nodes / 9 contains / 1 depends, Type is Initiative leaves 2 nodes, dark header `rgb(20, 20, 20)`.

Deployment: https://trigger-theta-cyan.vercel.app. Vercel project `trigger` (`prj_Uz8tASbR4GNNPVNOQFmxiJ51B0XW`). Production still serves the previous plant until this PR is promoted. On Vercel the reader uses GitHub file fetches, not `git`. Plate directory listing uses GitHub Contents. GitHub evidence uses the same REST port, scoped, and must not exceed the 10s hobby budget.

Genuine limits: live factory packets at this SHA still have no plate PNGs, so the Plates section is omitted until an Architect commits one on that branch. Fixture plate images 404 at raw.githubusercontent.com because they are local test files, not Tower commits; the `img` src and blob links are still the GitHub URLs at the observed SHA. Workers on revision 64 still plant on factory PR 137. Cursor cloud-agent sessions are not a port.

Do not open a second PR. Do not append the Architect or SA logs. Packets 001–003 are planted.

## Founder locks (keep)

- Create / in-the-room / seated stay three moments. Sit hangs a person on `protocols/pm.md`, `protocols/sa.md`, or `protocols/engineer.md`.
- Do not append the Architect or SA logs.
- Do not treat Travis planted packets as work in this repo.
- Do not use the house build automations to build Trigger.
- The Ant chrome in light and dark is locked. Do not reinterpret it.
- The factory branch stays configurable. Do not pin a commit sha in the reader.
- GitHub is evidence. The ledger is the record. Do not mint a second workflow store.
- Trigger remains read-only. Do not add plate approval or a release gate.

## Paste — new Engineer

You are Trigger’s Engineer. Read `docs/README.md` § Engineer and `AGENTS.md`. Read this file first. Then `docs/seats/ENGINEER.md` and `protocols/engineer.md`. Trail is git + PRs. One PR per initiative. Packets 001, 002, and 003 are planted on PR #4. Do not replant them.
