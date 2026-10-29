# PM-PACKET-001 — test

Walk this on the preview of this PR after the desk is planted. Light first, then dark. The read is Tower `main` `9c45f19`, ledger revision 1. Do not type the rows into the component. The extra pages on the population plates are not part of this walk.

**I saw** stays blank until a person walks it.

## Setup

1. Open the Trigger desk.
2. Confirm the header reads Trigger, Tower, `9c45f19`, ledger revision 1, scope inactive.
3. Confirm the mode is light and the view is Table.

## Table

1. One database. There is no nested table and no expandable parent.
2. The initiative row is “Which execution a result belongs to,” id `exec-identity`, type Initiative, module Agents and Automations, stage Investigating, execution “Idle · no dispatch,” evidence a verified count and not integrated, Inside —, Depends on —, updated —.
3. The packet row is “An email click advances the enrollment stamped on the message,” id `pkt-001-click-attribution`, type Packet, stage Verified, execution “Manual · not live,” evidence two checks and no integration SHA, Inside `exec-identity`, Depends on —.
4. The other initiative is Launch Agent, id `launch-agent`, type Initiative, stage Discovered, execution “Idle · no dispatch,” Inside —, Depends on `exec-identity`, and an error tag for the blocked reason. The stage stays Discovered.
5. There is no fourth row.
6. There is no Run, Stop, Authorize, or Dispatch control.

**I saw:**

## Dark

1. Switch to dark.
2. The same three pages are there. The header, table, and tags are Ant’s dark algorithm, not a filter on the light page.

**I saw:**

## Detail

1. Open `exec-identity`.
2. The page shows the obligation, claim 3’s sentence from the specification file, the outstanding line about claims 4, 6, 7, and 8, the journal line dated 2026-10-29, the contained packet, and that Launch Agent depends on this initiative.
3. Open the packet.
4. The page shows the intended-behavior sentence, both check names with run ids `40873984441` and `40873984426`, mode manual, Inside `exec-identity`, and no integration SHA.
5. Open Launch Agent.
6. The blocked reason reads “Factory production path is not the Launch Agent build.” There is no packet.

**I saw:**

## Graph

1. Switch to Graph.
2. The same three pages are on the graph.
3. A solid bracket runs from `exec-identity` to the packet.
4. One dashed edge points from Launch Agent to `exec-identity`.
5. Filter to Type is Initiative. The packet and its bracket are gone. The two initiatives and the dashed edge remain. No extra node appears.

**I saw:**

## Refresh

1. Cause the read to fail.
2. The last rows stay. The header says the read failed.

**I saw:**

## Steps I could not do
