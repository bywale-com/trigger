# Engineer seat handoff

**Pickup file.** Update this when you stop so the next Engineer does not start from a transcript.

## Where we stopped

Hotfix 008 is PR 17 (`cursor/github-pr-buttons-71ee`). Review on an open release opens that release’s GitHub pull request in a new tab. Merge opens the same pull request: GitHub does not publish a separate merge address, and the merge control is on that page. The desk does not call the merge API. A release with no `prUrl` still opens the packet from Review. A table row still opens the packet page. `npm test` — 66 pass. On ledger revision 199 (`c8d279078e2b`) the eight Review links and Merge opened `https://github.com/bywale-com/omcoda_tower/pull/141` in a new tab and left the desk where it was. An intervention row stayed in the desk. The closed phone header stayed Trigger, Table, Graph, and the theme. During that check the operating tip moved on to revision 209, which had no open release.

Packet 009 is planted on `cursor/founder-inbox-71ee` (PR 15), rebased onto hotfix 007. The desk runs Tower’s `explainFactory` on the ledger it already reads and prints that headline, Why, Next, and Who. The founder inbox is the open releases in the pulse drawer (pull requests 141–148 on ledger 193). Hotfix 008 sends Review and Merge to that pull request. There is no write tool. Operating ledger on `cursor/execution-architecture-74f7` was revision 193 at 11:06 AM America/Toronto: scope active, controller inactive, `dsp-172` interrupted `lease_expired`, `pkt-019` intervention with next Unknown.

Hotfix 007 is on `main` as PR 16 (`3659d61`). Production ignores `TOWER_REF` and `TOWER_SOURCE`. A missing operating signal fails the read instead of serving `source.json`. Local and preview may still pin a branch.

Hotfix 006 is the OAuth invocation cut (`cursor/oauth-node-entry-71ee`). Production `870a576` (hotfix 005, PR 13) is deployed. The 31 Oct 2026 8:19 AM America/Toronto failure was `invalid_function_runtime` from `runtime: nodejs20.x` in `vercel.json`, and removing that key let the build finish. The desk on https://trigger-theta-cyan.vercel.app reads `cursor/execution-architecture-74f7`, ledger revision 162, scope suspended, controller inactive. `GET /api/v1/factory` and `POST /api/mcp` return `401` without a bearer. `/.well-known/oauth-protected-resource` and `/.well-known/oauth-authorization-server` still return `FUNCTION_INVOCATION_FAILED`. The Node builder rewrites static `.ts` imports to `.js` and does not rewrite `import("…oauth.ts")`, so the compiled function cannot load that module. The compiled OAuth module imports `auth.ts`. That file was not in the function, so the route died. `includeFiles` is `src/observe/**`, the same set the other Node routes ship. Production `12e1109` (31 Oct 2026, 9:22 AM America/Toronto) returns `200` for both well-known metadata routes. `GET /api/v1/factory` and `POST /api/mcp` return `401` without a bearer. The desk reads `cursor/execution-architecture-74f7`, ledger revision 162, scope suspended, controller inactive. Do not put `nodejs20.x` in `vercel.json`.

Hotfix 005 is PR 13 (`cursor/function-runtime-71ee`). It removes `runtime: nodejs20.x` from `vercel.json`.

Hotfix 004 is PR 12 (`cursor/factory-status-71ee`), merged as `149824a`. It labels the ledger authorization scope and the factory-manifest controller activation as different facts. The header and the pulse say `scope …` and `controller …`. The control reason `inactive` remains on the snapshot and is not shown as a bare status. `status.authorizationScope` and `status.controllerActivation` are on the factory read. A published `.factory/operating.json` on `refs/factory/operating` is the operating source even when a factory-dispatch run has a higher ledger revision. The dispatch run is the fallback only when that ref is absent. `source.json` is the fallback after that. `TOWER_REF` still selects one branch.

Local read of Tower on 31 Oct 2026, with `TOWER_READ=github` and no `TOWER_REF`: ref `cursor/execution-architecture-74f7`, ledger revision 160, authorization scope active, controller activation inactive, 41 of 50 used. The desk header and the pulse strip show `scope active` and `controller inactive`. `GET /api/v1/factory` returns those two fields. An independent MCP client listed the eight tools, `get_factory_status` matched the desk snapshot sha `b6787c4`, and `nextAt` was null. Unauthenticated `/api/v1/factory` and `/api/mcp` returned 401. GitHub evidence was unavailable on that read, so the PR link was absent. `npm test` — 56 pass.

Hotfix 003 is PR 11 (`cursor/factory-source-71ee`), merged as `7f50507`. Production had not picked it up: Vercel rejected the deploy. The commit to deploy is this branch’s tip, which contains `7f50507`.

External read is PR 10 (`cursor/external-read-mcp-71ee`), on `main` through `a9ba798`. `GET /api/v1` and `POST /api/mcp` classify the same snapshot the desk shows. Tools: `get_factory_status`, `list_initiatives`, `get_initiative`, `list_packets`, `get_packet`, `get_execution`, `get_next_actions`, `get_plates`. Auth is `TRIGGER_READ_TOKEN` or OAuth code + PKCE that stops for that token. Write scopes are not issued. `GET /api/snapshot` and `GET /api/tree-file` stay open because the page fetches them. Connection steps: `docs/register/EXTERNAL-READ.md`. MCP `GET` returns 405. Responses are JSON on POST so a Vercel function can finish.

The preview `trigger-git-cursor-external-read-9dd405-wale-omotayos-projects.vercel.app` serves `/api/v1` and `/api/mcp` as `503` until `TRIGGER_READ_TOKEN` is set. OAuth routes on that preview crash. `a9ba798` pins them to `nodejs20.x`. Vercel refused that build (rate limit, retry in 24 hours, 30 Oct 2026 1:44 PM America/Toronto). Production `/api/v1` was still 404. This seat could not write the Vercel team env. ChatGPT and Claude were not logged in.

Hotfix 002 is PR 9 (`cursor/compact-drawers-71ee`): on the phone the header shows Trigger until the lip reveals the branch and the ledger. The running strip is one line until its lip reveals the rows. The page lip drags the preview and fills the screen; the enlarge button stays on the desktop only. Plates are in `docs/register/plates/hotfix-002/`. Hotfix 001 is on main as PR 8. The Tower board is one bordered table at every width. Columns keep their designed widths (Name 220 through Updated 84). A header border drags that whole column, clamped to 85–115% of the designed width. The board scrolls sideways inside itself. The compact work list is gone. `data-testid="database"` is the board on the phone and on the desktop.

Packets 001–006 are on `main`. Packet 007 stays hold. Packet 008 (Factory Pulse) plants on PR 7, branch `cursor/live-factory-states-7b9a`. Do not reopen PR 4. Do not bring the work list back.

Outside production, `TOWER_REF` selects a branch. Unset, the desk follows the operating factory; `source.json` is the fallback. Production ignores that pin. Fixture `9c45f19` still has no plate. Walk plates with `scripts/plate-fixture.mjs` then `scripts/walk-plates.mjs`. Walk prose with `scripts/walk-desk.mjs`. Walk interaction with `scripts/walk-ixd.mjs`. Compact with `scripts/walk-mobile.mjs`.

How to run:

- `npm run dev` — Vite. `GET /api/snapshot` reads the configured factory branch. Fixture/local plate images are `GET /api/tree-file?path=`. `GET /api/v1` and `POST /api/mcp` are the authenticated read. Set `TRIGGER_READ_TOKEN`.
- `node scripts/walk-mcp.mjs` — official MCP client. `MCP_URL` defaults to `http://127.0.0.1:4173/api/mcp`.
- Outside production, `TOWER_REF` selects another branch and skips operating-factory resolution. `TOWER_SOURCE=configured` reads `source.json` only. Production ignores both. `TOWER_FIXTURE` reads a tree and skips GitHub. `TOWER_FAIL_FLAG` contents `1` fails the read and keeps the last snapshot.
- `TOWER_READ=github` uses GitHub file fetches (Vercel does this). GitHub plate `img` src stays raw.githubusercontent.com.
- `npm run build`, then `npm start`. `PORT` defaults to 4173.

External read verification on the `9c45f19` fixture, 30 Oct 2026:

- `npm test` — 52 pass.
- `npm run build` — pass. Desk assets stayed `index-BV7mBNrp.js` and `index-B9FZAZTW.css`.
- `scripts/walk-mcp.mjs` against `npm start`: unauthenticated MCP is 401, the official client lists the eight tools, opens `pkt-001-click-attribution`, and reports `nextAt: null`. `GET /api/snapshot` stays 200.
- ChatGPT and Claude were not signed in from this seat.

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

You are Trigger’s Engineer. Read `docs/README.md` § Engineer and `AGENTS.md`. Read this file first. Then `docs/seats/ENGINEER.md` and `protocols/engineer.md`. Trail is git + PRs. One PR per initiative. Packets 001–006 are on main. Packet 007 stays hold. Packet 008 is PR 7. Packet 009 is on main as PR 15. Hotfix 007 is PR 16. Hotfix 008 is PR 17. Review and Merge open the ledger pull request and do not call the merge API. Hotfix 001 is PR 8. Hotfix 002 is PR 9. Hotfix 003 is PR 11. Hotfix 004 is PR 12. Hotfix 005 is PR 13. Hotfix 006 includes `src/observe` in the OAuth functions so `oauth.js` can import `auth.ts`. Do not put `nodejs20.x` in `vercel.json`. External read is the authenticated `/api/v1` and `/api/mcp` on the same snapshot. Do not replant 001–006. Do not bring back the compact work list. Do not put the branch line back on the closed phone header. Do not add a write tool on the read scope. Do not pin the factory to a development branch or a commit sha.
