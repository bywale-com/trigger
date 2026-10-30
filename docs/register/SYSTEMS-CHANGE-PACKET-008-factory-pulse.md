# SYSTEMS-CHANGE-PACKET-008 — Factory Pulse

**Signed:** 13:51 UTC 2026-10-30  
**Initiative:** [`PM-PACKET-008-factory-pulse.md`](./PM-PACKET-008-factory-pulse.md) on PR 7  
**Glass:** packets 001–006 desk plus a pulse row.  
**Walk:** [`PM-PACKET-008-factory-pulse-TEST.md`](./PM-PACKET-008-factory-pulse-TEST.md)  
**Remap:** no migration. Trigger still has no SQL.

Plant on PR 7. Do not reopen PR 4. Do not modify Tower from this repo.

## Intent

Show what the factory controller currently decides, with Ant Spin for confirmed live work, factory reason strings as they are, and no invented essays. Compact list must remain visible under the sheet.

## Must

- Snapshot gains `pulse` derived by a read-only projection of Tower `controlStep` / `decide` / `decideScope` from the ledger JSON already read. Copy `authorizedDispatches` and `usedDispatches` from the ledger root (they are not on `projectFactory`’s returned object; they are on the file).
- Cadence: parse `.github/workflows/factory-dispatch.yml` in the same tree. No `schedule:` → `event`. A cron → that string.
- Live rows: unexpired `lease` on a packet. Lifecycle Running remains lease or GitHub in_progress. Spin only then.
- `Detail` running flag is lifecycle Running, not `execution.endsWith("· running")`.
- Compact open page is a bottom split. List stays visible and tappable. No dimming backdrop. Flush sides.
- 006 split, hash, filter, gutters, expand, refresh Spin stay.

## Must-not

- Do not mint a Trigger table.
- Do not apply ledger events. Do not add labels. Do not call `decide` as a write.
- Do not paraphrase factory reasons into product sentences.
- Do not countdown `issuedAt`. Countdown only `lease.until` or a parsed cron.
- Do not add Run / Stop / Dispatch / Authorize.

## Stores

**Materialized, external.** Ledger file, factory.json, factory-dispatch.yml. Unchanged writers.

**Materialized in Trigger.** Nothing.

**Map-only.** `pulse` on the in-memory snapshot.

**Named silence.** Checkpoint times. GitHub Actions `FACTORY_CONTROLLER` env (Trigger cannot read repo vars). A scheduled next run until the workflow file contains `schedule`.

## Runtime

Same `/api/snapshot`. Pulse is computed during the existing read.

## Ports

**Real.** Same GitHub/git/fixture tree.

**Refused.** Writing Tower. Importing the controller as an actuator.

## Verify

Packet 008 sheet. Fixture pulse `inactive`. Compact list visible under the sheet. Packet 006 walks still pass.

## Out of scope

Packet 007 painted callouts. A cron on omcoda_tower (separate factory repo).
