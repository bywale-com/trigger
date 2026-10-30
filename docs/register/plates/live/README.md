# Trigger — live factory states

**Date:** 30 October 2026, 9:25 AM America/Toronto  
**Seat:** Technical Architect  
**Status:** Awaiting founder visual approval. Packet [`PM-PACKET-007-live-factory-states.md`](../PM-PACKET-007-live-factory-states.md) is `**Wake:** hold`. Do not plant. Do not wake SA.

Motion prototype (inspectable): [`motion.html`](./motion.html)

Chrome lock: live production https://trigger-theta-cyan.vercel.app, factory branch `cursor/factory-agents-scope-33ee`. Plates 01–06, 01b, 03b, 10 painted at ledger revision 105 (`6df33ce`). Recaptured 07–09 and 08b at revision 107 (`7e3852f`) after the factory moved. Production chrome at capture is pre-packet-006 (a page still replaces the table; back is `← Tower`). Packet 006 is on `main`. These overlays sit on the same records; they do not redesign 006.

Founder ask: make the factory’s actual activity visible, legible, and immediately understandable. Not more animation.

---

## Now (chrome lock)

Captured before paint. Light and dark. Desktop and compact.

- [00-now-table-light.png](./00-now-table-light.png) · [00-now-table-dark.png](./00-now-table-dark.png)
- [00-now-graph-light.png](./00-now-graph-light.png) · [00-now-graph-dark.png](./00-now-graph-dark.png)
- [00-now-initiative-light.png](./00-now-initiative-light.png)
- [00-now-packet-candidate-light.png](./00-now-packet-candidate-light.png) · [00-now-packet-candidate-dark.png](./00-now-packet-candidate-dark.png)
- [00-now-packet-accepted-light.png](./00-now-packet-accepted-light.png)
- [00-now-blocked-light.png](./00-now-blocked-light.png) · [00-now-blocked-dark.png](./00-now-blocked-dark.png)
- [00-now-mobile-table-light.png](./00-now-mobile-table-light.png)
- [00-now-mobile-packet-light.png](./00-now-mobile-packet-light.png)
- [00-now-mobile-initiative-light.png](./00-now-mobile-initiative-light.png)

What hangs on that chrome: Execution `Architect · running` is the packet-001 string (`session === "running"` and a dispatch). Lifecycle Running is `unknown` (no lease, GitHub unavailable). The desk already spins that string (`Detail.tsx` `page.execution.endsWith("· running")`). A recorded dispatch looks live. Stage tags do not pulse. Refresh is a header Spin. Blocked is an error Alert on the subject.

---

## Language (one rule)

Four motions. They must not look interchangeable.

| Kind | Means | Form |
|---|---|---|
| **Active** | Lifecycle Running = yes | 8px primary pulse 1.4s ease-out, plus a 12px spinner. Stops when Running is not yes. |
| **Transitional** | The desk is changing | Pane / sheet 220ms ease, once. |
| **Loading** | Trigger is fetching | Header Spin. First load may skeleton the content. Never a full-screen wipe on the 60s tick. |
| **Attention** | Founder intervention | Error pulse 1.8s on a header count, plus the existing Alert on the subject. Not on Idle · no dispatch. |

Reduced motion: still dots and still tags. No infinite animation.

A stage word never pulses. A percentage is never invented.

---

## 1. Desktop table, active workers

[01-table-active-workers.png](./01-table-active-workers.png) · [01b-table-active-dark.png](./01b-table-active-dark.png)

`exec-identity` at revision 105: Investigating, `Architect · dispatched`, still grey dot. Lifecycle Running unknown. `pkt-002` shows the **illustrative** live treatment (pulse + spinner + `Engineer · running`) — only when a lease or in-progress GitHub run exists. Header Refreshing is Trigger fetch, not factory live.

**Copy.** Same nine columns. Same Filter. Pulse lives in Execution, not Stage.

**Do not build.** A progress bar. Pulsing every Investigating row. Treating `session === "running"` as live.

**Implied.** Selected-row edge from 006 stays. A live unselected row may take a 3px primary inset and `colorPrimaryBg` wash.

**Completes.** Dispatch is not mistaken for a running worker.

**Out of scope.** Run / Stop / Dispatch.

---

## 2. Desktop graph, active and waiting

[02-graph-active-waiting.png](./02-graph-active-waiting.png)

Live ring only on confirmed running nodes (`pkt-002` illustrative). Waiting nodes keep a still grey dot. Launch Agent keeps the error edge. Contains and depends stay still.

**Copy.** Same boxes. Same filter sentence. Module remains a column label, not a node.

**Do not build.** Animated edges. A second ring language that fights the 006 selected ring. Collapsing a module into a fake node.

**Implied.** If a column has a live page, a pulse may sit next to the module label. The pages in that column stay drawn.

**Completes.** The map shows who is actually working without glittering.

**Out of scope.** React Flow. Editing edges.

---

## 3. Initiative — Architect investigating

[03-initiative-architect-unconfirmed.png](./03-initiative-architect-unconfirmed.png) — **real** revision 105. Session running, dispatch `wake_architect` issued 9:15 AM America/Toronto, lifecycle Running unknown, GitHub unavailable. Motion stays off.

[03b-initiative-architect-live.png](./03b-initiative-architect-live.png) — **illustrative** live lease. Pulse ends when the lease expires or GitHub is no longer in progress.

**Copy.** Stage stays Investigating. Queue stays active. Lifecycle tags stay two facts.

**Do not build.** An Architect heartbeat Trigger invents. Checkpoint age (factory.json says no timer observes it).

**Implied.** Execution copy becomes `Architect · dispatched` when Running is unknown, `Architect · running` only when Running is yes.

**Completes.** The disagreement between the packet-001 string and lifecycle Running is the product.

**Out of scope.** Waking the architect from Trigger.

---

## 4. Packet — Systems Analysis

[04-packet-systems-analysis.png](./04-packet-systems-analysis.png)

Real `pkt-009-eligibility-writes`, stage Released. **Illustrative** Analyst lease. Stage stays Released. The stage word does not pulse.

**Copy.** Recorded stage and live execution stay two facts.

**Do not build.** Renaming Released to Systems Analysis as a stage.

**Implied.** Analyst · running is lease role `analyst` or effect `wake_sa` **and** Running = yes.

**Completes.** SA in flight is visible without lying about the packet stage.

**Out of scope.** An Analyst control.

---

## 5. Packet — Engineering

[05-packet-engineering.png](./05-packet-engineering.png)

Real `pkt-003-resume-same-run`, stage `change_specified`, Committed no. **Illustrative** Engineer running. Motion is the worker, not the stage tag.

**Copy.** `stageLabel` should read **Change specified** (underscore to space). Candidate SHA none until `candidateSha` exists.

**Do not build.** A percent-complete for engineering.

**Implied.** Committed stays no until `candidateSha`. Repair uses effect `wake_repair` with the same live language, labeled Repair · running.

**Completes.** Implementation in flight is not a Candidate rename.

**Out of scope.** Merge / dispatch buttons.

---

## 6. Verification — running, passed, failed

[06-verification-running-pass-fail.png](./06-verification-running-pass-fail.png)

Real `pkt-001-click-attribution` is Accepted, checks pass. Overlay is **illustrative** of the three check treatments on one page so they can be compared.

**Copy.** Spinner only while GitHub status is `queued` / `in_progress` / `pending`. Pass is still. Fail is error, run linked. Not Integrated. Not a desk Stop.

**Do not build.** A verification traffic-light that collapses the six lifecycle facts.

**Implied.** Ledger `verifiedSha` remains Verified. A green GitHub check without that SHA is a pass row, not Verified yes.

**Completes.** What has actually been accomplished is readable in one place.

**Out of scope.** Re-run from Trigger.

---

## 7. Blocked and founder attention

[07-blocked-attention.png](./07-blocked-attention.png)

Real Launch Agent blocked reason. Header attention pill is the proposed count, not a second inbox.

**Copy.** Blockers stay on the subject. Header attention is only for: a `blockedReason` / `blockerId`, authorization exhaustion (`usedDispatches` ≥ `authorizedDispatches` once those fields are copied), or a failed read with no remaining snapshot. Not for Idle · no dispatch. Not for Running unknown.

**Do not build.** An attention inbox. Painting every waiting packet red.

**Implied.** Subject Alert stays. The pill is a count, clickable as a filter to those pages.

**Completes.** Routine factory operations do not look like emergencies.

**Out of scope.** Clearing the blocker from Trigger.

---

## 8. Loading, refresh, stale, read failure

[08-refresh-stale-fail.png](./08-refresh-stale-fail.png) · [08b-first-load-skeleton.png](./08b-first-load-skeleton.png)

Trigger fetching is a header pill. The table stays. Failed read keeps the last rows. First snapshot may skeleton the content; the 60s tick never does. Hash, selection, scroll, and graph camera stay.

**Copy.** `Snapshot {n}m ago` from `readAt`. `read failed · last rows kept` is the existing danger text, named.

**Do not build.** A full-screen Spin every 60 seconds. A progress bar for the factory.

**Implied.** GitHub unavailable is a page fact (`unavailableReason`), not a header emergency, unless the Tower ledger read itself failed.

**Completes.** Factory working and Trigger fetching are unrelated activities.

**Out of scope.** A pause-refresh control that looks like Stop.

---

## 9. Mobile table, live indicators

[09-mobile-table-live.png](./09-mobile-table-live.png)

Same live language at 360. Pulse is 8px, not a card. Recapture at revision 107: `exec-identity` is `continuation_due · no dispatch` (real); `pkt-002` shows the illustrative live Engineer.

**Copy.** Compact work list from 004/006. Sheet from 006 stays flush.

**Do not build.** Giant live cards. A bottom tab bar.

**Implied.** Touch target stays the row. The dot is not a second hit target.

**Completes.** Phone reads the same evidence as 1440.

**Out of scope.** A native app.

---

## 10. Mobile packet, active execution

[10-mobile-packet-live.png](./10-mobile-packet-live.png)

**Illustrative** Engineer · running inside the compact page. Sheet stays flush; padding is inside. No factory controls.

**Copy.** Same lifecycle tags. Running unknown stays visible until evidence arrives.

**Do not build.** A conversational sheet. An authorize workflow.

**Implied.** Expand and grab-dismiss from 006 stay.

**Completes.** Compact execution is the same language as desktop.

**Out of scope.** Writing to Tower.

---

## Named for the Systems Analyst (when the founder approves)

No new Trigger table. Pulse, wash, and header pills are faces of lifecycle Running, `readAt`, `readFailed`, `blockedReason` / `blockerId`, and (named) `authorizedDispatches` / `usedDispatches` already on the ledger file. Do not ascribe a store for “is live.” Checkpoints stay unnamed — factory.json says no timer observes them. Do not modify Tower.
