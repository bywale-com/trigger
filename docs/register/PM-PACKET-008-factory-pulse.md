# PM-PACKET-008 — Factory Pulse

**Wake:** sa

**Direction:** [`PRODUCT-DIRECTION-V1.md`](./PRODUCT-DIRECTION-V1.md)  
**Grain:** [`V1-OBSERVABILITY-SPEC.md`](./V1-OBSERVABILITY-SPEC.md) §13  
**Test:** [`PM-PACKET-008-factory-pulse-TEST.md`](./PM-PACKET-008-factory-pulse-TEST.md)  
**Initiative:** PR 7, branch `cursor/live-factory-states-7b9a`. Packet 007 stays `**Wake:** hold`. Do not mint a cousin.

## Founder lock

> I like the ideas im not a fan of the implementstkon.
>
> stop adlibing.
> look inside omcoda_tower to see what we mean by adlibing.
>
> use spinners and loading animations not more text, to convey processes and states
>
> also I noticed that the last implantation in 6, specifically with the mobile page open view that doesnt block the tsble isnt really implemented.
>
> I'd make this the next Trigger priority, ahead of the interaction-design packet.
>
> Call it Factory Pulse & Next-Action Observability.
>
> A countdown should appear only when a real deadline or scheduled event exists.
> elapsed waiting time is not a countdown.
> Where Tower lacks execution telemetry, Trigger should explicitly say unconfirmed, rather than silently displaying idle.
> get all of these done

## What hangs

Production https://trigger-theta-cyan.vercel.app is still the pre-006 bundle (`last-modified` 12:03 UTC). Main merged 006 at 13:16 UTC. GitHub `Vercel` status on `main` is **failure**: Hobby **build-rate-limit**. That is why the compact sheet is not on the URL the founder opened. The plant on `main` is 006. This packet does not reopen 006. Compact sheet `top` moves from 28% to 42% so the list is actually visible when the sheet is open.

Tower `controlStep` on ledger revision 112 with activation `active` returns reason `analyst_open` (pkt-018 `wake_sa` plus a live analyst lease). With `factory.json` `activation: inactive` the same pass returns `inactive`. GitHub workflow `factory-dispatch.yml` line 9: `There is no schedule.` `lease.until` is a real deadline. Dispatch remaining is `authorizedDispatches - usedDispatches` on the ledger root.

Packet 007 painted yellow callouts. That is ad-lib. Tower plate chrome: paint only the hole; do not invent copy. This packet shows factory reason strings and Ant Spin. It does not paraphrase `analyst_open` into an essay.

## Face

A compact **Factory Pulse** row above table and graph: Spin when a lease is live; factory `reason` tag; next `effect` tag when `controlStep` proposed a wake; `remaining/authorized`; cadence `event` or the cron string if the factory workflow file has a schedule. No extra sentences.

Execution column / work list / graph node: Ant Spin only when lifecycle Running = yes. The packet-001 execution string stays. It does not pulse on `session === "running"` alone.

Lease remaining (`until` vs `readAt`) may count down. `issuedAt` age is not shown as a countdown. No percent. No invented next-run clock.

Compact open page is a bottom split: the work list stays visible and tappable above the sheet. No dimming backdrop. Expand still grows the sheet to the viewport. Sides stay flush.

## Technical cut

| File | Job |
|---|---|
| `src/observe/tower/pulse.ts` | Read-only `controlStep` / `decide` / `decideScope`. `workflowCadence` from `.github/workflows/factory-dispatch.yml`. |
| `src/observe/tower/read.ts` | Copy ledger `authorizedDispatches` / `usedDispatches`. Attach `pulse`. |
| `src/observe/snapshot.ts` | `pulse` on the snapshot. `pageIsLive`. `stageLabel` underscore → space. |
| `src/desk/Pulse.tsx` | The row. Tags and Spin only. |
| `src/desk/App.tsx` | Pulse above the split. |
| `src/desk/TableView.tsx` | Spin in Execution when live. |
| `src/desk/GraphView.tsx` | Spin on a live node. |
| `src/desk/Detail.tsx` | `running` from lifecycle Running, not the 001 string. |
| `src/desk/desk.css` | Compact open page is a column split. List stays visible. No backdrop. |

Do not import the Tower controller as a write. Do not modify Tower in this repo. Do not add Run / Stop / Dispatch.

## Named for the Systems Analyst

No new table. Pulse is a map of the ledger plus the factory workflow file. `isLive` is lifecycle Running. Named silence: paraphrased “what happens next” essays, a countdown without `lease.until` or a cron, checkpoints.

## Out of scope

Packet 007 motion plates. A Trigger inbox. Writing GitHub labels. Changing Tower’s workflow from this repo.
