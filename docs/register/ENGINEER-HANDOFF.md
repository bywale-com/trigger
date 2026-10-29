# Engineer seat handoff

**Pickup file.** Update this when you stop so the next Engineer does not start from a transcript.

## Where we stopped

Packet 001 is planted on PR #4, branch `cursor/observability-v1-plates-7b9a`, base `cursor/seed-grain-note-7b9a`. The desk is the signed read: one snapshot of Tower, the table, the graph, the shared page, and a refresh kept in the server process. No Trigger database. No controller import. No build automation. This correction is on that same PR. It is not a hotfix.

The factory branch is configuration. `src/observe/tower/source.json` names the branch the desk observes. `TOWER_REF` replaces that file when it is set. The reader does not fall back to `main` and does not pin a commit. The header shows `Tower · {ref}` and the first 7 characters of the commit that was read, plus `Ledger revision {n} · scope {status}`.

At 6:15 PM ET on 29 Oct 2026 the configured branch `cursor/factory-agents-scope-33ee` (Tower PR #137) resolved to `fe5176095d4af9cb41d60243d8e17e8ddd27422c`. Ledger revision 25. Scope `active`. Seven pages: `exec-identity` (investigating, `continuation_due · no dispatch`, `1 verified · 1 integrated`), `pkt-001-click-attribution` (accepted, `Manual · not live`, `2 checks · SHA`, integrated `9c45f19fa1ac9d909247d6be83c9263273b1bcbb`), four released packets with `Idle · no dispatch` and `0 checks · no SHA`, and `launch-agent` (discovered, blocked reason, depends on `exec-identity`).

`src/observe/tower/testdata/9c45f19` is the plate fixture. Walk it with `TOWER_FIXTURE` and `TOWER_REF=main`.

How to run:

- `npm run dev` — Vite. `GET /api/snapshot` reads the configured factory branch.
- `TOWER_REF` selects another branch. `TOWER_REPO` selects another clone URL. `TOWER_CLONE` is the sparse checkout (default `/tmp/trigger-tower-read`).
- `TOWER_FIXTURE` reads a tree instead of git. `TOWER_FAIL_FLAG` is a file; contents `1` fails the read and keeps the last snapshot.
- `npm run build`, then `npm start`. `PORT` defaults to 4173. `HOST` defaults to `127.0.0.1`; set `HOST=0.0.0.0` when a platform routes to the process.

Verification at 6:15 PM ET on 29 Oct 2026:

- `npm test` / `npm run test:preflight`: vitest, 8 passed. Preflight stays the unit suite. This repo has no phone-face walks.
- `scripts/walk-desk.mjs` against the fixture (`TOWER_REF=main`): the revision-1 walk, including dark mode and a failed read that keeps the rows.
- `scripts/check-active-branch.mts`: the configured branch, sha matches `git ls-remote`, scope active, revision 25, the seven pages above.
- `scripts/walk-active-branch.mjs` at 1440: header `Tower · cursor/factory-agents-scope-33ee fe51760`, ledger revision 25, scope active, the seven pages, packet integrated SHA, graph of 7 nodes with 5 contains edges and 1 depends edge, `Type is Initiative` leaves 2 nodes and the depends edge, dark header `rgb(20, 20, 20)`.

Deployment: no public URL. The Vercel token in this environment cannot list or create projects. The API answers that the scope `wale-omotayos-projects` needs re-authentication. `npm start` is the process a host would run. Tower was not modified.

Nothing else in this correction is open. Do not open a second PR. Do not append the Architect or SA logs.

## Founder locks (keep)

- Create / in-the-room / seated stay three moments. Sit hangs a person on `protocols/pm.md`, `protocols/sa.md`, or `protocols/engineer.md`.
- Do not append the Architect or SA logs.
- Do not treat Travis planted packets as work in this repo.
- Do not use the house build automations to build Trigger.
- The Ant chrome in light and dark is locked. Do not reinterpret it.
- The factory branch stays configurable. Do not pin a commit sha in the reader.

## Paste — new Engineer

You are Trigger’s Engineer. Read `docs/README.md` § Engineer and `AGENTS.md`. Read this file first. Then `docs/seats/ENGINEER.md` and `protocols/engineer.md`. Trail is git + PRs. One PR per initiative. Packet 001 and the factory-branch correction are planted on PR #4. Do not replant them.
