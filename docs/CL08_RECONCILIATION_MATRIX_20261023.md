# CL-08 — PILOT_OPERATION Reconciliation Matrix (2026-10-23)

## Scope and truth
**READ-ONLY snapshot** from native PILOT_OPERATION Sheet `1gbuxsuXMWaV7IKv8l5Hnr_VlVBNpWAQ4H4E9Pp4xqDs` (account `dzuddiyn01@gmail.com`). 18 Crop Batches, 30 Plot Allocations, 14 Transplant Events, 27 Allocation Status Events, 12 Operation Events, 18 Crop Batch reviews, 14 Transplant reviews. No operations writes, deletions, VOID, or silent authority selection. All statuses below represent recorded ledger, **not physical planting verification**.

## Conflict clusters
| Cluster | Plot(s) | Conflicting batch IDs — all remain in ledger | Report refs | Evidence / uncertainty |
|---|---|---|---|---|
| CL08-C1 | M5P1, M5P2 | `BSE-SB-CB-20261002-001` (Timun Batu CCB) and `BSE-SB-CB-20261002-002` (Cucumber 6656 / 282 CP), each ACTIVE | `BSE-TG-772257141`, `BSE-TG-772257243` | Both recorded sow 2026-10-02 and transplant 2026-10-07; divergent variety |
| CL08-C2 | M5P3, M5P4 | `BSE-SB-CB-20261006-001` (Timun 282) ACTIVE; `BSE-SB-CB-20261005-001` (Cucumber 6656 / 282 CP) ACTIVE; `BSE-SB-CB-20261002-003` (Cucumber 6656 - 282 CP) PLANNED | `BSE-TG-772257186`, `BSE-TG-772257249`, `BSE-TG-772257476` | Sowing dates 2026-10-06, 10-05, 10-02; the first two both report transplant 10-09. Neither should silently win |
| CL08-C3 | M7P3 | `BSE-SB-CB-20260831-001` and `BSE-SB-CB-20260831-002`, both Peria Besar 936 Hua li, both ACTIVE | `BSE-TG-772257257`, `BSE-TG-772257487` | Both sow 2026-08-31 and transplant 2026-09-06. Two HARVEST_START records for 2026-10-14: `BSE-TG-772257265` and `BSE-TG-772257492`. No direct cycle binding for start |
| CL08-C4 | M3P1, M3P2 | `BSE-SB-CB-20261023-001`, `BSE-SB-CB-20261023-002`, `BSE-SB-CB-20261023-003`, all PLANNED | `BSE-TG-772257715`, `BSE-TG-772257729`, `BSE-TG-772257731` | Three same-date same-variety Timun 7055 CCB sow registrations. Older Aug batches `BSE-SB-CB-20260808-001/-002` are INACTIVE and **not part of the current overlap** |

## Handling rule (no automated mutation)
1. Hold conflicting plot registrations via current fail-closed lifecycle guard; do not retroactively choose winner.
2. For each cluster, owner/field reporter identifies authoritative crop cycle from source evidence, actual field history and exact report reference. For C3 additionally identify which harvest-start record represents the same event. For C4 confirm whether three messages were retries or separate physical activities.
3. Only then prepare a separately approved correction/VOID/supersession **append-only** action retaining source linkage and audit; never delete rows or fabricate physical evidence.
4. This is a **reconciliation plan**, not a claim that any record is invalid. Some duplicate-looking rows could be separate staging or source reports; physically verify before disposition.

## Gate states
CL-07 native 7/7 + full native 48/48 PASS (PR #202 evidence). CL-08: READ-ONLY AUDIT PASS / AUTHORITATIVE FIELD DECISION PENDING / DATA CORRECTION NOT AUTHORIZED / HANDOVER NOT DELIVERED.
