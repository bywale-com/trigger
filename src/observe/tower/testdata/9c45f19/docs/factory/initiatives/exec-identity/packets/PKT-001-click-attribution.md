# PKT-001 — An email click advances the enrollment stamped on the message

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 3, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`  
**Wake:** hold  
**Release:** draft  
**Release eligible:** yes  
**Systems change:** [`../systems/SCP-pkt-001-click-attribution.md`](../systems/SCP-pkt-001-click-attribution.md)  
**Production plant:** `server/wire-service` click path, on this branch  
**Ledger stage:** `verified`  
**Execution:** manual  
**Verified SHA:** `19c47938d8aa8884b4874999a50667f5677205b3`

Eligibility is not authorization. The controller is inactive. Wake stays `hold`. The systems-change packet and the plant were written in one coding session because Cursor Automations are not configured. That session is not a label wake. Do not flip this Wake line unless the founder authorizes factory dispatch.

## Intended behavior

An email click advances the enrollment named on the outbound message. It does not advance the newest open enrollment for the contact.

A stamped message matches enrollment E only when `enrollment_id` is E and `campaign_objective_id` is E’s current objective. Packet 022’s fallback stays for a null objective id: `enrollment_id` is E and the message was created at or after E’s `enrolled_at`. If E’s `campaign_id` is null, the stamp does not advance E.

No stamp means no match.

## Existing behavior the investigation recorded

`onCompletionWrite` selects the newest enrollment with a campaign. The click webhook reads `firm_id, contact_id` from `outbound_messages` and does not pass `enrollment_id` or `campaign_objective_id`. The send path can stamp those columns. Claim 3 records that enrollment A therefore does not advance on its own click, and enrollment B can advance when the objective ids match.

This packet does not re-walk the form path or the meeting path. Claim 3 left those for later claims.

## Acceptance

The oracle in `.factory/experiments/click-attribution.ts` is the behavior this packet must satisfy. `npm run factory:check` exercises the oracle and checks that the production click SQL and webhook branch match it. Postgres proof is `scripts/verify-click-attribution.ts`.

The production click path must agree with the oracle on these cases:

1. Message stamped for A, B enrolled later, same objective id. A matches. B does not. The newest-row shortcut would pick B. That shortcut is the defect.
2. Message stamped for A, B’s objective id differs. A matches only while A’s current objective is the stamped one. B does not match.
3. Message with a null enrollment id matches nobody.
4. Message with enrollment A and a null objective id matches A only when its timestamp is at or after A’s `enrolled_at`.
5. Message stamped for A does not match A after A’s `campaign_id` is null.

## Dependencies

Claim 2 stands: a contact may have two open enrollments. This packet must not close the other enrollment to make the click easy.

The four founder questions on the initiative are not gates for this packet.

## Out of scope

Form completion, meeting booking, parked-run resume, `payload.writes`, audit-row grain, Launch Agent, and any visual plate. No plate is required.

## Handoff

The systems-change packet is signed in this tree. The click plant is in `server/wire-service/webhooks.ts` and the messaging-events arm of `objectiveSatisfiedBy`. The ledger records that plant as `verified` manual evidence against `19c47938d8aa8884b4874999a50667f5677205b3`, with factory-check run `40873984441` and ship run `40873984426`. Wake stays `hold`. There is no dispatch record. Acceptance still needs a real merge SHA.
