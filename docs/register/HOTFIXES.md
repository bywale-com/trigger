# Engineer hotfixes — index

Ad-hoc engineer cuts (smoke / code / backend grain — not an Architect or SA packet). Trail is git + PRs.

| Rule | Detail |
|------|--------|
| Format | `HOTFIX-NNN-SLUG.md` |
| Next | `max(existing NNN) + 1`. Never reuse. Next: **008**. |
| PR title | `Hotfix NNN — …` |
| Law | One PR per initiative. Hotfixes stay their own cuts and get merged. |

## Hotfixes

| # | File | Cut |
|---|------|-----|
| 001 | [HOTFIX-001-table-board.md](./HOTFIX-001-table-board.md) | Bordered table, even columns, sideways scroll on phone and desktop. |
| 002 | [HOTFIX-002-compact-drawers.md](./HOTFIX-002-compact-drawers.md) | Phone header details and the running strip tuck behind a lip. The page lip drags the preview. |
| 003 | [HOTFIX-003-operating-factory.md](./HOTFIX-003-operating-factory.md) | The desk follows the factory dispatch that advanced the ledger, instead of a pinned development branch. |
| 004 | [HOTFIX-004-scope-and-controller.md](./HOTFIX-004-scope-and-controller.md) | The ledger scope and the controller activation are labeled separately. A published operating ref outranks a higher ledger revision. |
| 005 | [HOTFIX-005-function-runtime.md](./HOTFIX-005-function-runtime.md) | Remove `runtime: nodejs20.x`. That field is a community runtime package, and it fails the Vercel build. |
| 006 | [HOTFIX-006-oauth-invocation.md](./HOTFIX-006-oauth-invocation.md) | OAuth entries import their handlers statically and set `config.runtime` to `nodejs`, so the compiled function can load. |
| 007 | [HOTFIX-007-operating-factory-lock.md](./HOTFIX-007-operating-factory-lock.md) | Production follows the operating factory. A project setting cannot pin it to `source.json`. |
