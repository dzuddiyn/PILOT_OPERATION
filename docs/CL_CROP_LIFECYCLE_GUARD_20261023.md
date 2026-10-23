# CL-01–CL-08 — Crop Lifecycle Guard (2026-10-23)

## Keputusan
Owner LOCKED roadmap CL-01…CL-08, authorized implementation/tests/push/PR/merge, **STOP BEFORE Apps Script HEAD sync**. No Apps Script push, version, deployment, Telegram or operational Sheet writes under this approval.

## CL-01 — LIVE READ-ONLY truth audit
Authority: BSE_OpsMate_SB_PILOT_OPERATION spreadsheet ID `1gbuxsuXMWaV7IKv8l5Hnr_VlVBNpWAQ4H4E9Pp4xqDs` via connected Google Drive (account dzuddiyn01@gmail.com). Inspected PILOT_CROP_BATCH, PILOT_PLANTING_EVENT, PILOT_PLOT_ALLOCATION, PILOT_TRANSPLANT_EVENT, PILOT_ALLOCATION_STATUS_EVENT and PILOT_OPERATION_LOG; **zero writes**. Snapshot during 2026-10-23 session:
- 18 crop batches, 18 sowing events, 30 allocation records, 14 transplant events, 27 allocation status events, 12 operation events.
- M5P1, M5P2: each has two ACTIVE allocations (different batch IDs ending `20261002-001` and `20261002-002`).
- M5P3, M5P4: each has two ACTIVE allocations (`20261006-001`, `20261005-001`) and one PLANNED (`20261002-003`).
- M7P3: two ACTIVE allocations (`20260831-001` and `20260831-002`).
- M3P1, M3P2: each has three PLANNED allocations (`20261023-001/-002/-003`) plus an older INACTIVE allocation.
- M7P3: two HARVEST_START rows, ambiguous cycle association.
- These are conflict indicators requiring human reconciliation; the script must **not silently elect a winner**, rewrite legacy rows, or infer the physical planting state.

## CL-02–CL-05 — Source guard design
Use effective physical plot occupancy from append-only Plot Allocation + Allocation Status Event. PLANNED and ACTIVE consume plot; INACTIVE releases. A new semaian must find zero open allocations per target plot. Transplant needs exactly one PLANNED allocation with correct batch and date no earlier than sowing. HARVEST_START requires unique ACTIVE occupancy and no pre-existing start for this plot unless same source idempotent retry. The latter is deliberately conservative: old HARVEST_START does not contain a first-class cycle ID; historical start can block a new cycle pending manual association.

## CL-06 — Transaction boundary
Guard called in existing review core immediately before first domain write, preserving existing source-key idempotency and human confirmation; read-only preflight. Existing ScriptLock/partial-write guarantees must be audited independently at deployment gate; Sheets multi-tab writes are not intrinsically ACID transactions.

## CL-07/08 — Not yet verified
Local Node 224/224 PASS including nine lifecycle-specific tests; syntax and git diff --check PASS. No Script HEAD sync, native Apps Script UI tests, Telegram live proof, independent production Sheet post-write readback, reconciliation of current historical conflicts, or handover. **STOP BEFORE HEAD** owner instruction.

## Next real gate
After owner explicitly authorizes Script HEAD sync, stage merged main, verify runtime-only files preserved, push HEAD, fresh pull hash parity, native Apps Script UI regression, then scoped live proof with TEST_ONLY fixture and zero official BSE write. Any data reconciliation requires separate owner approval and physical-field evidence.
