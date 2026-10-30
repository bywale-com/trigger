# PM-PACKET-007 — Live factory states

**Wake:** hold

**Direction:** [`PRODUCT-DIRECTION-V1.md`](./PRODUCT-DIRECTION-V1.md)  
**Grain:** [`V1-OBSERVABILITY-SPEC.md`](./V1-OBSERVABILITY-SPEC.md) §12  
**Test:** [`PM-PACKET-007-live-factory-states-TEST.md`](./PM-PACKET-007-live-factory-states-TEST.md)  
**Plates:** [`plates/live/README.md`](./plates/live/README.md)  
**Motion:** [`plates/live/motion.html`](./plates/live/motion.html)  
**Initiative:** this PR, branch `cursor/live-factory-states-7b9a`, off `main` after packets 005 and 006. Do not reopen PR 4. Do not mint a cousin.

Awaiting **founder visual approval**. Do not flip Wake to `sa`. Do not plant. Do not wake the Systems Analyst or the Engineer.

## Founder lock

> TRIGGER — INTERACTION DESIGN & LIVE FACTORY STATES
>
> The next design objective is to make the factory's activity immediately understandable through interaction design, motion, visual states, and feedback.
>
> Trigger should feel like an operating system for an active software factory, without becoming visually noisy.
>
> A recorded dispatch must not be mistaken for proof that the worker is running.
>
> Motion should reflect actual execution evidence.
>
> Avoid adding arbitrary progress percentages.
>
> The interface should not flash, reset, or display unnecessary full-screen loading indicators every 60 seconds.
>
> Distinguish the factory working from Trigger fetching information. These are unrelated activities.
>
> Trigger should not make routine factory operations look like emergencies.
>
> The objective is not to make Trigger more animated.
>
> The objective is to make the factory's actual activity visible, legible, and immediately understandable.
>
> Founder approval is mandatory before implementation of this interaction-design packet.

## What hangs

Inspected planted `src/` on `main` (`bfd09cc`, packets 001–006) and live production at ledger revisions 105 then 107.

- `packetLifecycle` / `initiativeLifecycle` already compute Running = yes only on an unexpired lease or a GitHub check `queued` / `in_progress` / `pending`. Dispatch without those is `unknown`.
- Table Execution is the packet-001 string. For an initiative that is `session === "running"` and `dispatch` set, it reads `Architect · running` even when lifecycle Running is `unknown`. `Detail.tsx` line 202: `const running = page.execution.endsWith("· running")`. Packet 006 sits a spinner on that string. That is the hang this packet corrects.
- Graph nodes show Type and Stage. They do not show live. Edges do not move. Good — keep still.
- `stageLabel` capitalizes the first letter only, so `change_specified` renders `Change_specified`.
- Chrome already has a small refresh Spin and `read failed`. It does not show snapshot age. First load is a content Spin (`desk-loading`), not a skeleton. `mergeRead` already keeps the last snapshot.
- Initiatives have no `lease`. Architect live cannot be a lease today. GitHub in_progress is the only Running = yes path for an initiative. At revision 105 GitHub was `unavailable`, so `exec-identity` was Running unknown.
- Snapshot `scope` does not copy ledger `authorizedDispatches` / `usedDispatches` (`read.ts` copies `ledger.scope` only). Exhaustion cannot be shown until those two fields are copied. They already exist on the ledger file. Trigger does not mint a table for them.
- Checkpoints: `factory.json` `checkpointEnforcement` is “worker instruction only. No timer observes or enforces the interval.” Do not display checkpoint age.
- Production chrome at plate capture was pre-006. 006 layout (split pane, hash, sheet) stays. This packet paints onto it; it does not reopen 006.

No new store for “is live.” `isLive` is lifecycle Running === `"yes"`.

## Face

**Live is lifecycle Running = yes.** Pulse (8px, `#1677ff`, 1.4s ease-out infinite) and a 12px spinner appear only then. Execution copy is `{role} · running`. Worker id from `lease.workerId` when present. Issued age from `dispatch.issuedAt` as still text. Lease remaining from `lease.until` as still text. Motion stops when Running is not yes.

**Dispatched is not live.** Current dispatch, no live lease, GitHub not in progress (including unavailable): still grey 8px dot, no spinner, copy `{role} · dispatched`. Lifecycle Running stays `unknown` (processing tag, not pulsing). Packet-001 string `Architect · running` is no longer used for motion.

**Idle stays still.** `Idle · no dispatch`, `Manual · not live`, `continuation_due · no dispatch` — no dot.

**Stage never pulses.** Investigating, Released, Systems Analysis is not a stage (SA in flight is the Analyst live treatment on a Released / specified packet), Change specified, Engineering, Candidate, Verifying, Verified, Integrating, Integrated, Accepted, Failed, Blocked — Ant tags as today (`stageColor`). Underscore to space in `stageLabel`. Blocked is `error`. A live worker on a Released packet does not recolor Released.

**Initiative activity in table and graph** is those same tags plus the live / dispatched / idle Execution treatment. Counts already on Evidence. No progress percent. Discovered, waiting-on-depends, investigating, producing packets, under implementation, awaiting verification, blocked, complete — read from investigation / queue / session / blockedReason / contained packet stages already on the page. Do not invent a seventh summary field. `deriveInitiative` stays out (V1 §2).

**Graph.** Live node: pulse dot inside the box. At most one primary outline, shared with the 006 selected ring (selected wins the ring; live still has the dot). Waiting dependency: still grey dot. Blocked: existing error tag / outline. Contains and depends edges stay still. Module labels may take a pulse if any page in that column is live; modules are not nodes and do not collapse.

**Trigger fetch ≠ factory live.** First snapshot: skeleton rows in content, header identity stays (`08b`). Later 60s reads: header Spin only, no remount, hash / selection / scroll / graph camera kept (`08`). `readAt` age as `Snapshot {n}m ago` when the last successful read is older than 90s. Failed read: existing danger text, named `read failed · last rows kept`. GitHub unavailable is a page `unavailableReason`, not a header emergency.

**Verification.** Check row spinner only while outcome is `queued` / `in_progress` / `pending`. Pass = success tag, still. Fail = error tag, run linked. Candidate available = `candidateSha` set, Committed yes. Verification pending = stage / checks without `verifiedSha`. Retry / repair = `wake_repair` + Running yes. Merge pending = `integratedSha` null while associated PR `merged` is not yes — show the GitHub merge bit, do not call it Integrated. Integrated / Accepted remain ledger facts.

**Attention.** Header pill with error pulse only when at least one of: page `blockedReason` or `blockerId`, authorization exhaustion (after those two ledger fields are on the snapshot), or a failed read with no snapshot left. Clicking the pill mints a filter to those pages. Subject Alert stays. Running unknown is not attention. Idle is not attention.

**Interaction coherence (006 stays).** Hover / focus Ant. Selected row primary edge. Node selected ring. Pane / sheet 220ms ease. Expand, grab, Escape, `j` / `k`. Lifecycle popover already shows `basis`. Live control `title` / `aria-label` is that basis. Touch: the row is the target; the dot is not a second control. `prefers-reduced-motion`: still dot, still tag, no infinite animation; refresh Spin may remain a still icon.

Light and dark: same tokens. Compact: same language, 8px dot, no extra chrome.

## Interaction contract

Each row: trigger → evidence → treatment → motion → stop → missing evidence → desktop / mobile → a11y.

| Id | Trigger | Evidence | Treatment | Motion | Stops | Missing | Desk / compact | A11y |
|---|---|---|---|---|---|---|---|---|
| L1 | Worker genuinely running | Lifecycle Running = yes (unexpired lease or GitHub queued/in_progress/pending) | Pulse + spinner + `{role} · running`; optional `workerId`, issued age, lease remaining | Pulse 1.4s ease-out infinite; spinner 0.8s linear | Running ≠ yes | No pulse. If dispatch set: L2. Else idle. | Execution cell / work-list meta / page Execution | `aria-label` = basis. Live region polite on the open page only, not the whole table |
| L2 | Dispatch recorded, not confirmed live | Current dispatch, Running = unknown | Still grey dot + `{role} · dispatched` | None | — | Same | Same | `title` = basis (`dispatch recorded; GitHub unavailable` etc.) |
| L3 | Idle / history | No current dispatch, Running = no | Plain Execution string | None | — | — | Same | — |
| S1 | Packet / initiative stage | Ledger `stage` / `investigation` | Ant tag, `stageColor`, `stageLabel` with spaces | None | — | Default tag | Table, graph, page, list | Tag text |
| G1 | Live node | L1 on that page | Pulse inside node | Pulse only | L1 stop | No ring from this packet | Graph 1440 and compact pan | Name + “running” in accessible name |
| G2 | Waiting on a dependency | Depends-on page not complete / blocked | Still grey dot on the waiter; edge still dashed | None | — | No invented “waiting” stage | Graph | — |
| G3 | Blocked node | `blockedReason` / `blockerId` / stage blocked | Error outline + existing Blocked tag | None on the node. Attention is A1 | Reason cleared | No outline | Graph | — |
| R1 | First snapshot | `body` null | Skeleton rows in content | None (static bars) | Snapshot arrives | Existing Spin is acceptable fallback | Content; header stays | `aria-busy` on main |
| R2 | Periodic refresh | `refreshing` | Header Spin | Spinner while fetch | Fetch settles | Keep last rows | Header | `aria-busy` on header identity, not the table |
| R3 | Stale snapshot | `now - readAt` > 90s | `Snapshot {n}m ago` | None | Fresh read | Hide the age | Header | Text |
| R4 | Failed read | `readFailed` | Danger text, last rows | None | Next success | If no snapshot: `No pages.` | Header | Role status |
| V1 | Check in progress | GitHub/ledger check outcome queued/in_progress/pending | Processing tag + spinner | Spinner | Outcome terminal | Unknown, no spinner | Page Evidence | Basis |
| V2 | Check pass | outcome pass / success | Success tag | None | — | — | Page | — |
| V3 | Check fail | outcome failure / action_required | Error tag, run link | None | — | — | Page | Not a button |
| A1 | Founder attention | Blocker, auth exhaustion, or empty failed read | Header pill + subject Alert | Error pulse 1.8s on the pill | No matching pages | No pill | Header + subject | `role="status"` on the pill |
| T1 | Pane / sheet | Open / close / expand | 006 layout | 220ms ease once | Transition end | Instant if reduced motion | 1440 pane / compact sheet | Focus moves with the page |

## Technical cut

| File | Job |
|---|---|
| `src/observe/snapshot.ts` | `stageLabel` underscore → space. Helpers `pageIsLive` (Running === yes) and `pageAttention` from existing fields. Copy types for `authorizedDispatches` / `usedDispatches` when SA ascribes them. Do not invent checkpoints. |
| `src/observe/tower/read.ts` | After SA ascribes: copy ledger `authorizedDispatches` and `usedDispatches` onto the snapshot. Do not call `decide`. |
| `src/desk/Detail.tsx` | `running` from lifecycle Running, not `execution.endsWith("· running")`. Check-row spinner only on in-progress outcomes. |
| `src/desk/TableView.tsx` | Live / dispatched / idle in Execution (and the work list). Live row class. |
| `src/desk/GraphView.tsx` | Live / wait dots. No animated edges. Module-label pulse if a column has a live page. |
| `src/desk/chrome.tsx` | Snapshot age. Attention pill. Keep refresh Spin and read-failed. Do not reuse the live pulse for refresh. |
| `src/desk/App.tsx` | First-load skeleton optional (content only). Do not remount table/graph on refresh. Pass `readAt`. |
| `src/desk/desk.css` | Pulse / reduced-motion. Live row inset. Do not restyle 006 gutters, sheet flush, or selected edge. |

Do not import the Tower controller. Do not mint a Trigger table. Do not modify Tower. Do not add Run / Stop / Dispatch / Authorize. Do not add a conversational interface.

## Named for the Systems Analyst

No new table. `isLive` is not a store. Named copy, when this packet is approved: ledger root `authorizedDispatches` and `usedDispatches` onto the snapshot (they are already on `.factory/state/ledger.json`; `read.ts` does not copy them today). Named silence: checkpoint times, architect lease on the initiative, estimated completion, a Trigger attention inbox.

## Out of scope

Writing to Tower. Factory controls. An approval workflow inside Tower. Reopening packet 006. Regenerating the ixd plates. React Flow. Progress percentages. Artificial activity on idle graphs.
