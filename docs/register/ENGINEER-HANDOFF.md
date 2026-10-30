# Engineer seat handoff

**Pickup file.** Update this when you stop so the next Engineer does not start from a transcript.

## Where we stopped

Packet 002 is planted on PR #4, branch `cursor/observability-v1-plates-7b9a`, base `cursor/seed-grain-note-7b9a`. Packet 001 and the factory-branch correction stay. Do not open a second PR.

The desk still reads one Tower snapshot. Packet pages now also show six lifecycle facts and read-only GitHub evidence for SHAs and pull-request numbers the ledger already named. `src/observe/tower/github.ts` is the GitHub port. Fixture mode does not call GitHub. A GitHub 403 does not fail the Tower read. No Trigger database. No controller import. Tower was not modified.

`TOWER_REF` / `src/observe/tower/source.json` remain the factory source. The header still shows `Tower · {ref} {sha}`. When GitHub associates that configured ref with a pull request via `head={owner}:{ref}`, the header also links `PR {n}`. Working branches live on the packet page, from GitHub’s commit-to-pull API or `reconciliationId` `pr-{n}-{sha}`. The reader does not scan repository branches and does not guess `cursor/pkt-*` names.

Lifecycle Running is not the packet 001 execution string. Dispatch without a live lease or an in-progress GitHub check-run on a named SHA is Running `unknown`. A green check is not Integrated. `stage === "accepted"` is Accepted.

`src/observe/tower/testdata/9c45f19` is still the plate fixture. Walk it with `TOWER_FIXTURE` and `TOWER_REF=main`.

How to run:

- `npm run dev` — Vite. `GET /api/snapshot` reads the configured factory branch and attaches GitHub evidence.
- `TOWER_REF` selects another branch. `TOWER_REPO` selects another clone URL. `TOWER_CLONE` is the sparse checkout (default `/tmp/trigger-tower-read`).
- `TOWER_FIXTURE` reads a tree instead of git and skips GitHub. `TOWER_FAIL_FLAG` is a file; contents `1` fails the read and keeps the last snapshot.
- `TOWER_READ=github` uses GitHub file fetches (Vercel does this).
- `npm run build`, then `npm start`. `PORT` defaults to 4173. `HOST` defaults to `127.0.0.1`; set `HOST=0.0.0.0` when a platform routes to the process.

Verification at 7:00 AM ET on 30 Oct 2026:

- `npm test` / `npm run test:preflight`: vitest, 15 passed.
- `npm run build`: tsc + vite, ok.
- `scripts/walk-desk.mjs` against the fixture (`TOWER_REF=main`): packet 001 walk plus lifecycle Dispatched no / Running no / Committed yes / Verified yes / Integrated no / Accepted no, GitHub unavailable, dark packet page, failed read keeps the rows.
- `scripts/check-active-branch.mts`: configured branch `cursor/factory-agents-scope-33ee`, sha `93c34d72bdc1755b8a9332a2899184b8153350f6`, ledger revision 56, scope active, 11 pages.
- `scripts/walk-active-branch.mjs` at 1440: header `Tower · cursor/factory-agents-scope-33ee 93c34d7` and `PR 137`, accepted packet Integrated yes / Accepted yes, PKT-002 Dispatched yes / Committed yes, working branch `cursor/factory-agents-scope-33ee` and pull 137 from GitHub’s commit-to-pull association (not a packet-named branch), graph 11 nodes / 9 contains / 1 depends, Type is Initiative leaves 2 nodes, dark header `rgb(20, 20, 20)`.

Deployment: https://trigger-theta-cyan.vercel.app. Vercel project `trigger` (`prj_Uz8tASbR4GNNPVNOQFmxiJ51B0XW`). Production still serves the previous plant until this PR is promoted. On Vercel the reader uses GitHub file fetches, not `git`. GitHub evidence uses the same REST port, scoped, and must not exceed the 10s hobby budget.

Genuine limits: workers on revision 56 still plant on factory PR 137, so several packets share that working branch. Preview is GitHub `environment_url` or unavailable — Vercel dashboard `target_url` is not shown as a host. Cursor cloud-agent sessions are not a port. `session === "running"` is still the packet 001 execution string and is not Lifecycle Running.

Do not open a second PR. Do not append the Architect or SA logs. Packet 002 is planted.

## Founder locks (keep)

- Create / in-the-room / seated stay three moments. Sit hangs a person on `protocols/pm.md`, `protocols/sa.md`, or `protocols/engineer.md`.
- Do not append the Architect or SA logs.
- Do not treat Travis planted packets as work in this repo.
- Do not use the house build automations to build Trigger.
- The Ant chrome in light and dark is locked. Do not reinterpret it.
- The factory branch stays configurable. Do not pin a commit sha in the reader.
- GitHub is evidence. The ledger is the record. Do not mint a second workflow store.

## Paste — new Engineer

You are Trigger’s Engineer. Read `docs/README.md` § Engineer and `AGENTS.md`. Read this file first. Then `docs/seats/ENGINEER.md` and `protocols/engineer.md`. Trail is git + PRs. One PR per initiative. Packets 001 and 002 are planted on PR #4. Do not replant them.
