# Hotfix 006 — OAuth invocation

Hotfix 005 let the Vercel build finish. Production `870a576` serves the desk, and `GET /api/v1/factory` and `POST /api/mcp` return `401` without a bearer. The OAuth routes still die with `FUNCTION_INVOCATION_FAILED`.

The Node builder compiles `.ts` to `.js` and rewrites static relative imports. It leaves a dynamic `import("…oauth.ts")` pointing at a file that is not in the function. The OAuth entries also never set the in-file Node runtime. `vercel.json` `functions.*.runtime` stays empty: that field is a community runtime package and version, and `nodejs20.x` there is what stopped the 8:19 AM America/Toronto build.

## Cut

- Import the OAuth handlers statically, the same way `/api/v1` and `/api/mcp` do.
- Set `export const config = { runtime: "nodejs" }` on the five OAuth entries. Keep `api.bodyParser: false` on authorize, token, and register.
- Do not put a Node version in `vercel.json`.

## Not in this cut

Architect log. SA log. A Node version pin in `package.json`.
