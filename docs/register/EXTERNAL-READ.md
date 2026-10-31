# External read

Trigger’s desk, `GET /api/v1`, and the MCP tools read one snapshot. This surface does not dispatch, write the ledger, or invent a next run time.

## Deployment state

Production https://trigger-theta-cyan.vercel.app is serving hotfix 005 (`870a576`). `GET /api/snapshot` reads the operating factory. `GET /api/v1/factory` and `POST /api/mcp` return `401` without a bearer. The production read token is set on Vercel and is not in this environment. Do not print it.

`vercel.json` must not set `functions.*.runtime` to `nodejs20.x`: that field is a community runtime package plus a version, and the 31 Oct 2026 8:19 AM America/Toronto build stopped with `invalid_function_runtime`. The OAuth functions set `export const config.runtime` to `nodejs` and include `src/observe/**`. They load `oauth.js`, which imports `auth.ts`. Without those sources in the function the route cannot start. On the hotfix 006 preview both well-known metadata routes return `200`.

ChatGPT and Claude were not signed in from this seat.

## Endpoints

Production host, once that deploy is current: `https://trigger-theta-cyan.vercel.app`

| Surface | URL |
| --- | --- |
| Desk (unchanged) | `https://trigger-theta-cyan.vercel.app` |
| Read API | `https://trigger-theta-cyan.vercel.app/api/v1` |
| MCP | `https://trigger-theta-cyan.vercel.app/api/mcp` |
| Protected resource metadata | `https://trigger-theta-cyan.vercel.app/.well-known/oauth-protected-resource` |
| Authorization server metadata | `https://trigger-theta-cyan.vercel.app/.well-known/oauth-authorization-server` |

Read routes, all `GET`, bearer required:

- `/api/v1/factory`
- `/api/v1/initiatives` and `/api/v1/initiatives/:id`
- `/api/v1/packets` and `/api/v1/packets/:id` (`initiativeId` query optional)
- `/api/v1/executions/:id`
- `/api/v1/next`
- `/api/v1/plates` and `/api/v1/plates/:packetId`

MCP tools: `get_factory_status`, `list_initiatives`, `get_initiative`, `list_packets`, `get_packet`, `get_execution`, `get_next_actions`, `get_plates`.

Activity is one of `running`, `dispatched`, `waiting`, `interrupted`, `blocked`, `idle`, or `unknown`. `idle` means the snapshot records no current dispatch. `nextAt` is always null. A recorded cron is returned as text. Trigger does not turn that cron into an instant. A missing lease is `worker: null`.

A failed read that still has a previous snapshot returns `200` with `stale: true` and `readFailed: true`. No snapshot at all is `503`. An unknown id is `404`. GitHub being down stays inside the body (`github.available: false`) and is not a 500.

## Authentication

Scope issued today: `trigger:read`. Write scopes are not issued and are not accepted.

Set `TRIGGER_READ_TOKEN` on the server. It never goes in the repo or the client bundle. Optional `TRIGGER_OAUTH_SECRET` signs OAuth tokens; when it is unset, the read token is the signing key.

Two ways in:

1. **Static bearer.** `Authorization: Bearer <TRIGGER_READ_TOKEN>`. An independent client can use this directly.
2. **OAuth 2.1**, authorization code + PKCE S256. The browser stops on Trigger’s authorize page. Paste the read token there. Nothing is approved automatically. The server then issues a one-hour access token and a refresh token. Refresh tokens rotate in memory on that instance. This host has no durable token store, so a refresh token remains valid until it expires or the signing secret changes. Changing `TRIGGER_READ_TOKEN` (when it is also the signing secret) invalidates issued tokens.

Discovery advertises Dynamic Client Registration and Client ID Metadata Documents. Metadata documents are fetched only from `chatgpt.com`, `claude.ai`, and `cursor.com`. Loopback redirects ignore the port, which Claude Code needs. The authorize response includes `iss`.

If `TRIGGER_READ_TOKEN` is unset, the read API and MCP return `503` `read_token_unconfigured`. They do not fall open.

Requests are capped (32 KB body, clipped text, about 60 requests a minute per isolate). The per-isolate limit is best-effort on serverless.

## The public desk

`GET /api/snapshot` and `GET /api/tree-file` stay unauthenticated. The page already fetches them, and locking them would blank the desk. The production desk is a public read of the same factory snapshot. The authenticated API is the door for agents, and it is the door a later write scope can sit beside. It is not a second copy of the factory.

## MCP transport

Streamable HTTP, stateless, JSON body on `POST`. `GET` returns `405` so a serverless function does not hold an SSE stream open. The official MCP client treats that `405` as “no server stream” and continues with `POST`. That path was exercised here against the SDK client. Confirm it again on the deployed URL after the token is set.

## Connect an independent client

```bash
TRIGGER_READ_TOKEN=… MCP_URL=https://trigger-theta-cyan.vercel.app/api/mcp \
  SNAPSHOT_URL=https://trigger-theta-cyan.vercel.app/api/snapshot \
  node scripts/walk-mcp.mjs
```

Locally, with the fixture:

```bash
TRIGGER_READ_TOKEN=dev TOWER_FIXTURE=src/observe/tower/testdata/9c45f19 npm start
TRIGGER_READ_TOKEN=dev node scripts/walk-mcp.mjs
```

## ChatGPT

Checked against OpenAI’s connector docs (October 2026). This seat did not complete a ChatGPT login, so ChatGPT is not claimed as connected.

1. Open ChatGPT on the web. Go to **Plugins**.
2. Choose **Add custom MCP server**.
3. Name it `Trigger`. Server URL: `https://trigger-theta-cyan.vercel.app/api/mcp`.
4. Authentication: **OAuth**. Create the plugin and acknowledge the risk warning.
5. ChatGPT opens Trigger’s authorize page. Paste the read token and allow read.
6. In a chat, invoke the Trigger plugin and ask what is happening in Tower.

ChatGPT can use the Client ID Metadata Document at `https://chatgpt.com/oauth/client.json` when the plugin is created that way, or Dynamic Client Registration. Workspace policies can block custom MCP servers. A plan that cannot add a custom MCP server blocks the ChatGPT UI only. The MCP endpoint still serves other clients.

OAuth access tokens last an hour. Refresh uses `offline_access`. There is no durable revocation list; rotate `TRIGGER_READ_TOKEN` to cut issued tokens off when that value is the signing secret.

## Claude

Checked against Claude’s connector docs (October 2026). This seat did not complete a claude.ai login, so Claude is not claimed as connected.

Custom remote connectors are documented for Free (one connector), Pro, Max, Team, and Enterprise. Claude’s cloud, not the laptop, calls the server, so the URL must be public HTTPS.

Pro or Max:

1. **Customize → Connectors → Add custom connector**.
2. Name it `Trigger`. URL: `https://trigger-theta-cyan.vercel.app/api/mcp`.
3. Authentication: **Sign in now**. OAuth client: **Use Claude’s published identity** or **Register automatically**.
4. Claude opens the authorize page. Paste the read token.
5. Ask Claude what is happening in Tower. It should call `get_factory_status`.

Team or Enterprise: an Owner adds it first under **Organization settings → Connectors → Custom → Web**, with the same URL. Members then connect.

Claude’s hosted redirect is `https://claude.ai/api/mcp/auth_callback`. Claude Code uses a loopback redirect on any port. A static request-header credential is a separate beta for some organizations. The path this server implements for Claude is OAuth.

A Free, Pro, or Team policy that refuses custom connectors blocks that account only. It does not turn the MCP server off.
