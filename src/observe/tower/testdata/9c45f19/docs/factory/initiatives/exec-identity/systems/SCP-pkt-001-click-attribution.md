# SCP-pkt-001 — Click advances the enrollment stamped on the message

**Packet:** PKT-001 `pkt-001-click-attribution`  
**Initiative:** `exec-identity`  
**Source:** PR #135 claim 3 at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`  
**Wake:** hold  

This file is the systems-change packet. It was written in the factory coding session that also planted the change. Cursor Automations did not boot. The controller stays inactive, and this signature is not a label wake.

## Intent

An email click advances the enrollment named on that outbound message. It does not advance the newest open enrollment for the contact.

## Must / must-not

- The click entry loads the outbound message and advances `enrollment_id` on that row.
- A stamped message matches enrollment E only when `enrollment_id` is E and `campaign_objective_id` is E’s current objective.
- A null objective id matches E only when `enrollment_id` is E and `created_at` is at or after E’s `enrolled_at`.
- A null `enrollment_id` matches nobody. The click must not call `onCompletionWrite`.
- A null `campaign_id` on E does not advance E.
- The messaging-events predicate must require `enrollment_id = E` on both arms. Changing only the webhook select would still let a later check of enrollment B succeed when B shares the objective id.
- Do not change the `meeting_booked` SQL or the `fact_writebacks` SQL.
- Do not close the other open enrollment.

## Stores and contracts

No new table and no new column.

- `outbound_messages.enrollment_id`, `campaign_objective_id`, `provider_message_id`, `created_at` — already stamped on send.
- `messaging_events` — the click row. `message_id` is the provider message id.
- `enrollment.campaign_id` — the cursor `advanceEnrollmentCampaign` moves when the predicate matches.
- `campaign_objective` — one objective per campaign. Two enrollments can sit on the same campaign and therefore the same objective id.

## Runtime

`handleResendWebhook` on `email.clicked` reads `enrollment_id`. When it is present, it calls `advanceEnrollmentCampaign` for that id with `completionTable: "messaging_events"`. `advanceEnrollmentCampaign` loads that enrollment and calls `objectiveSatisfiedBy`. The click arm of that function is the predicate above. Form and meeting callers of `onCompletionWrite` stay on their own completion tables.

## Ports

Resend `email.clicked`, already accepted by `handleResendWebhook`. No new port.

## Verify

`scripts/verify-click-attribution.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` after migrate and seed:

1. Message stamped for A, B enrolled later on the same objective. The webhook advances A to the next campaign. B stays. A direct `advanceEnrollmentCampaign` on B also stays.
2. Message with a null enrollment id leaves A and newer B where they are.
3. Null objective id and `created_at` at or after `enrolled_at` advances A.
4. Null objective id and `created_at` before `enrolled_at` does not advance A.
5. Null `campaign_id` does not advance A.

`npm run factory:check` reads the click SQL and the webhook branch and requires the same shape. The pure oracle remains `.factory/experiments/click-attribution.ts`.

## Out of scope

Form completion, meeting booking, parked-run resume, `payload.writes`, audit-row grain, Launch Agent, plates, and `workflowWalk.ts`. Claim 2 (two open enrollments may coexist) is not changed. The four founder questions on the initiative are not gates.

## Impact manifest

- `server/wire-service/webhooks.ts` — click branch selects `enrollment_id` and calls `advanceEnrollmentCampaign`.
- `server/wire-service/campaignHousing.ts` — messaging-events predicate requires the stamped enrollment on both arms.
- `scripts/verify-click-attribution.ts` — the Postgres cases above.
- `.github/workflows/ship.yml` — runs that script.
- Form and meeting call sites of `onCompletionWrite` are not edited.

## Dependency reconciliation

- **Necessary.** Both the webhook entry and the click predicate. Either one alone leaves the other half of claim 3 false.
- **Adjacent, later packet.** `onCompletionWrite` still selects the newest enrollment with a campaign. Form and meeting still use that select. A future click caller must not use it.
- **No return to the Architect.** Claim 3 names this behavior. The stores already exist. No contradictory specification in this packet.
