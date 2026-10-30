# PM-PACKET-007 — test

Walk this only after founder visual approval and a plant. Packets 001–006 walks still have to pass. This sheet is how live factory evidence is shown. It is not a plant order while `**Wake:** hold`.

**I saw** stays blank until a person walks it.

## Setup

1. Open the Trigger desk. Confirm packet 006 still holds: split pane at 1440, compact sheet flush, hash, gutters, mode remembered.
2. Confirm the header still reads Trigger, Tower, ledger revision, scope. Light, Table, 1440.
3. Prefer a fixture or a live snapshot where lifecycle Running can be forced independently of `session === "running"`.

## Live is not dispatch

1. Open an initiative or packet with a current dispatch, no lease, GitHub not in progress (Running = unknown). Execution reads `{role} · dispatched` (or equivalent still copy). A grey still dot is allowed. **No pulse. No spinner.**
2. Lifecycle tag Running is `unknown`, not pulsing.
3. Stage tag does not pulse.
4. Fixture: attach an unexpired lease (or an in-progress GitHub check). Execution becomes `{role} · running` with pulse + spinner. `aria-label` / title is the lifecycle basis.
5. Expire the lease / finish the check. Motion stops on the next snapshot. The row does not unmount.

**I saw:**

## Table and graph

1. A live packet’s Execution cell shows the pulse. The Stage cell does not.
2. Selected row still has the 006 primary left edge. A live unselected row may have a primary inset; it must not look like attention-red.
3. Graph: live node has a pulse inside the box. Depends edges do not animate. A blocked node keeps the error treatment. Camera does not reset when a refresh lands.
4. `Change specified` (not `Change_specified`) on a `change_specified` packet.

**I saw:**

## Fetch is not live

1. First paint before the snapshot: skeleton (or Spin) in the **content**. Header identity is visible. Not a blank window.
2. After load, wait for a 60s refresh (or trigger one). The open page, hash, scroll, and graph viewport stay. A small header Spin appears and then leaves. Rows do not flash white.
3. Stale: if `readAt` is older than 90s, header shows `Snapshot {n}m ago`.
4. Failed read (`TOWER_FAIL_FLAG=1` or equivalent): `read failed · last rows kept` (or existing danger text). Last pages remain. No full-screen empty state if a snapshot exists.

**I saw:**

## Verification

1. An in-progress check shows a spinner on that row only.
2. Pass is a still success tag. Fail is a still error tag with a run link. Fail is not a Stop control.
3. Lifecycle Verified remains `verifiedSha`, not a green GitHub check.

**I saw:**

## Attention

1. Launch Agent (or any `blockedReason`): error Alert on that page. Header attention pill present only if this packet’s attention rule is met.
2. An idle packet with no dispatch is **not** attention.
3. Running unknown is **not** attention.
4. Compact 360: same live dots, sheet flush, no extra chrome. Pulse is 8px.

**I saw:**

## Reduced motion

1. `prefers-reduced-motion: reduce`: live pulse and attention pulse are still. Refresh may be a still icon. Pane still opens.

**I saw:**

## Light and dark

1. Dark: pulse remains `#1677ff`. Unconfirmed remains grey. Error remains the danger token.

**I saw:**

## Screenshots of the revision

Engineer captures after plant (not these painted plates): live table, unconfirmed dispatch, graph live/wait/blocked, initiative unconfirmed vs live, packet SA, packet engineering, verification three states, blocked + header, refresh/stale/fail, compact live list and live sheet. Light, then at least one dark.

**I saw:**

## Steps I could not do
