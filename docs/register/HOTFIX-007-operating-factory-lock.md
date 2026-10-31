# Hotfix 007 — operating factory lock

Founder, 31 Oct 2026, 11:01 AM America/Toronto: the desk is on ledger revision 122 again. Hotfix 003 was supposed to follow the operating factory.

## What happened

Production deployment `78fa391` (the settings redeploy) reads `cursor/factory-agents-scope-33ee`, revision 122, scope suspended. The previous production deployment, `69380f9`, same resolver, reads `cursor/execution-architecture-74f7`, revision 192, scope active. The project env list has no `TOWER_REF` and no `TOWER_SOURCE`. The pin is on that deployment. `refs/factory/operating` is still absent. The public factory-dispatch runs name revision 192 on `cursor/execution-architecture-74f7`.

`source.json` is still the old branch. Production was willing to stop there when a setting said so, and when both factory signals were missing.

## Cut

- Production ignores `TOWER_REF` and `TOWER_SOURCE`. Those still select a branch for local and preview.
- Production follows the published operating ref, or else the factory-dispatch run with the greatest `factory ledger N`.
- When both signals are missing, production fails the read. It does not serve `source.json`. Outside production, `source.json` remains the last fallback.

## Not in this cut

A write to Tower. `refs/factory/operating` is still Tower’s to publish. Architect log. SA log. Packet 009.
