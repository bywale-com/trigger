# Hotfix 003 — operating factory

Founder, 30 Oct 2026: Trigger kept refreshing Tower PR 137 (`cursor/factory-agents-scope-33ee`, ledger 122, scope suspended, 31 of 50). The controller that is applying writes PR 139 (`cursor/execution-architecture-74f7`, ledger 160, scope active, 41 of 50). A fresh read of the old branch is still the old factory.

## What Tower does

`factory-dispatch` writes `.factory/state/ledger.json` only on `FACTORY_LEDGER_BRANCH`, which is that run’s pull-request head. The concurrency group is `factory-control-${{ github.ref }}`, so two open factory PRs do not serialize against each other. Repository variables arm the actuator. They do not name a branch. `main` has no pointer. There is no `refs/factory/operating` yet. A new branch convention was not added. A pull request that edits the controller matches the workflow paths and would become another ledger branch, so this cut does not push onto the operating factory branch.

## Cut

- `TOWER_REF` still selects one branch. That is the secondary view (main, a development branch, or a pull request).
- With `TOWER_REF` unset, Trigger reads `.factory/operating.json` on `refs/factory/operating` when that file exists, and the successful `factory-dispatch` runs. It follows whichever of those names the greater `factory ledger N` commit. The same revision prefers the published pointer.
- `src/observe/tower/source.json` remains the fallback when those signals are missing. It is not the operating pin.
- The resolved branch is held for five minutes. Each snapshot still reads that branch’s tip, so ledger commits on the same branch show up on the next refresh.
- The desk, the read API, and MCP all use that snapshot. No write tool. No branch switcher.

## Not in this cut

Architect log. SA log. A factory-state branch. A second ledger. Desk layout.
