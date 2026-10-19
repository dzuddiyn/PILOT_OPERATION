# Gate I — Operational History Coverage / event_date / TEST-label Boundary (2026-10-19)

## Canonical source inspection
- Repo dzuddiyn/PILOT_OPERATION main precheck 9e932b85b090f4c1528d6ac678f9efeb9d88c344, clean tree.
- Live PILOT_TRANSPLANT_EVENT: three events with COMPLETED/VERIFIED_TEST on 2026-10-07, 2026-10-09, 2026-10-14.
- Live PILOT_TREATMENT_EVENT: two events with COMPLETED/VERIFIED_TEST on 2026-10-13, 2026-10-15.
- Live PILOT_PLANTING_EVENT/PILOT_CROP_BATCH: three sowing/batch records PROPOSED/PROVISIONAL; not equivalent to a completed, verified operation. One crop batch event_date for Peria Besar is 2026-10-07 while original_note refers to 2026-10-14. Treat as SOURCE_DATE_MISMATCH requiring further review; do not silently rewrite history.
- PILOT_PLANT_CENSUS, MAINTENANCE_EVENT, MEASUREMENT_LOG, OBSERVATION_LOG, OPERATION_LOG, INVENTORY_EVENT are header-only in read-back sample; no verified operational row available for live proof.
- Other domains remain UNVERIFIED; this scoped patch does not invent, change or delete any operational record.
- No raw user submissions, private Evidence, Script Properties or Telegram tokens included here.

## Corrective implementation
- Continue existing PILOT Transplant operational history; add verified completed treatment ledger events keyed by event_date with crop, plot IDs and verified treatment description.
- Deduplicate by operational source update ID and event-date/reference to avoid owner seeing canonical ledger and original approved Telegram report as separate operations.
- Keep existing reporter/private Evidence visibility; verified ledger operations appear as GROUP_STANDARD operations, not as original private reports.
- For PILOT /history, show no TEST label in empty state, private-chat access denial or footer. Preserve TEST-only behavior for the TEST environment and internal tab/status names.
- Sowing PROVISIONAL must not be silently treated as VERIFIED; completing verified sowing/domain coverage remains an open follow-up. Explicit owner decision required before any authority/state changes.

## Tests and acceptance boundary
- New synthetic domain coverage 9/9 PASS: verified treatment, transplant, dedup, event_date, group visibility, private Evidence denial, private original note exclusion, PILOT TEST-label branch.
- Previous scoped fix 7/7 and work-date history 16/16 PASS; all local *test.cjs invoked without FAILED marker; JS syntax and git diff --check PASS.
- Full parity IN PROGRESS — NOT DELIVERED. Script HEAD/live Telegram proof must be recorded after controlled sync, not inferred from local tests.
