# Hotfix 005 — function runtime

The 31 Oct 2026 8:19 AM America/Toronto build of `149824a` cloned the repo and started `vercel build`. It stopped with:

`Error: [invalid_function_runtime] Function Runtimes must have a valid version, for example now-php@1.0.0.`

`vercel.json` had `runtime: nodejs20.x` on the OAuth routes. That field is an npm runtime package plus a version. Node.js is the default when it is omitted.

## Cut

- Remove `runtime` from the OAuth function entries. Keep `maxDuration`.
- The OAuth handler imports `node:crypto`, so those routes stay on the Node.js runtime.

## Not in this cut

Architect log. SA log. A Node version pin in `package.json`.
