# Hotfix 004 — scope and controller

Founder, 31 Oct 2026: the ledger scope is active and the factory manifest activation is inactive. The desk showed both as one status. A higher ledger revision must not outrank a published operating ref.

## Cut

- The header and the pulse name the ledger scope and the controller activation as two facts. `scope active` is the ledger authorization. `controller inactive` is `factory.json` activation. The control reason `inactive` stays in the snapshot and is not drawn as a second unlabeled status.
- `GET /api/v1/factory` and `get_factory_status` return `status.authorizationScope` and `status.controllerActivation`. The next-action basis names both.
- When `refs/factory/operating` has `.factory/operating.json` with a branch ref, Trigger reads that branch. A successful factory-dispatch run with a greater `factory ledger N` does not replace it. That run is the source only when the published ref is absent. `source.json` remains the last fallback. `TOWER_REF` still selects one view.

## Not in this cut

Architect log. SA log. A factory-state branch. A write to Tower’s controller.
