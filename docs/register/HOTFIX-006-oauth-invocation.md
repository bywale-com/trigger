# Hotfix 006 — OAuth invocation

Hotfix 005 let the Vercel build finish. Production `870a576` serves the desk, and `GET /api/v1/factory` and `POST /api/mcp` return `401` without a bearer. The OAuth routes still die with `FUNCTION_INVOCATION_FAILED`.

The Node builder compiles `.ts` to `.js` and rewrites static relative imports. A dynamic `import("…oauth.ts")` still points at `.ts` after that compile. Restoring a static `.ts` import and setting `export const config.runtime` to `nodejs` let the local compile return the metadata, and the Vercel preview of that change still returned `FUNCTION_INVOCATION_FAILED`. `vercel.json` `functions.*.runtime` stays empty. `nodejs20.x` there is what stopped the 8:19 AM America/Toronto build.

The preview then returned JSON: `Cannot find module '/var/task/src/observe/external/auth.ts' imported from /var/task/src/observe/external/oauth.js`. A no-import function in the same folder runs on Node `v22.23.4`. `/api/v1` and `/api/mcp` already ship `src/observe/**` with the function. The OAuth functions did not, so the compiled module could not see `auth.ts`.

## Cut

- Include `src/observe/**` on the OAuth functions, the same way the other Node routes do.
- Load `oauth.js` from inside the handler, so a module error is a JSON body instead of a platform crash.
- Keep `export const config.runtime` at `nodejs`. Keep `api.bodyParser: false` on authorize, token, and register.
- `api/oauth/ping.ts` answers `{ ok, version }` with no other import, so a platform crash can be separated from the OAuth module.

## Not in this cut

Architect log. SA log. A Node version pin in `package.json`. Do not put a Node version in `vercel.json`.
