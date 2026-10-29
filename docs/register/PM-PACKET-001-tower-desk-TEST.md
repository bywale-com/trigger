# PM-PACKET-001 — test

Walk this on the preview of this PR after the desk is planted. Light first, then dark. The read is Tower `main` `9c45f19`, ledger revision 1. Do not type the rows into the component.

**I saw** stays blank until a person walks it.

## Setup

1. Open the Trigger desk.
2. Confirm the header reads Trigger, Tower, `9c45f19`, ledger revision 1, scope inactive.
3. Confirm the mode is light and the view is Table.

## Table

1. Under Agents and Automations, the parent row is “Which execution a result belongs to,” id `exec-identity`, stage Investigating, execution “Idle · no dispatch,” evidence “1 packet verified · not integrated,” updated —.
2. Its child is “An email click advances the enrollment stamped on the message,” id `pkt-001-click-attribution`, stage Verified, execution “Manual · not live,” evidence “2 checks passed · no SHA.”
3. Under Agents, the row is Launch Agent, id `launch-agent`, stage Discovered, execution “Idle · no dispatch,” and an error tag for the blocked reason.
4. There is no Run, Stop, Authorize, or Dispatch control.

**I saw:**

## Dark

1. Switch to dark.
2. The same rows are there. The header, table, and tags are Ant’s dark algorithm, not a filter on the light page.

**I saw:**

## Detail

1. Open `exec-identity`.
2. The page shows the obligation, claim 3’s sentence from the specification file, the outstanding line about claims 4, 6, 7, and 8, the journal line dated 2026-10-29, the packet, and that Launch Agent depends on this initiative.
3. Open the packet.
4. The page shows the intended-behavior sentence, both check names with run ids `40873984441` and `40873984426`, mode manual, and no integration SHA.
5. Open Launch Agent.
6. The blocked reason reads “Factory production path is not the Launch Agent build.” There is no packet.

**I saw:**

## Graph

1. Switch to Graph.
2. Agents and Automations contains `exec-identity`, which contains the packet.
3. Agents contains Launch Agent.
4. One dashed edge says “depends on” and points from Launch Agent to `exec-identity`.
5. Collapse Agents. The edge ends on the collapsed module. No extra node appears.

**I saw:**

## Refresh

1. Cause the read to fail.
2. The last rows stay. The header says the read failed.

**I saw:**

## Steps I could not do
