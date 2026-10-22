# GI-UX-03 — Banci Pokok date, crop matching and living/healthy distinction

**Date:** 22 October 2026 MYT. **Scope:** PILOT_OPERATION census only.

## Behaviour
- Recognized explicit census date (e.g. "6/10/2026" or "Tarikh Banci: 06/10/2026") must be the reported event_date, not replaced by Telegram timestamp. Both deterministic census parser and AI census guard use the same source-date parser.
- If an explicit date field is malformed or unsupported, fail closed as NEED_INFO and show Batal-only card. Date absent from the message may retain documented received-date default, but never overwrite an invalid explicit date.
- Recognize plot M6P1/M6P2 etc. Use reported crop or only historical UNIQUE ACTIVE crop/batch matching, never invent crop or batch. Historical-as-of guard remains.
- Preserve dead and sick counts as entered. For new operational census: living estimate = capacity - dead; healthy estimate = living estimate - sick. Sick plants are still living and cannot be counted as dead. Nonnegative count checks remain.
- Schema field living_plant_count now stores the actual estimated living quantity, tagged with method ESTIMATED_CAPACITY_MINUS_DEAD. Historical method ESTIMATED_CAPACITY_MINUS_DEAD_MINUS_SICK remains accepted for old records, explicitly displayed as a legacy healthy estimate, not as living. No migration or silent rewrite.
- New PILOT approval card and confirmed receipt show report date, plot, crop, dead/sick, and both distinct estimates. BSE-TG source reference remains. Nonpilot formatting remains compatible.

## Exclusions
- No census write without existing human approval and UNIQUE historical batch/allocation.
- No changes to inventory, sowing, claim, draft, lifecycle, ADMIN, webhook, Telegram Reply, or official BSE production.
- No history backfill and no automatic replay of old Telegram updates.

## Verification
- Focused gi_ux_03_census_date_card.test.cjs tests 14 cases: valid/invalid date, canonical and AI guard, living vs healthy, historical method, confirmed receipt, proposal contract.
- Existing gi_field_ux_census_historical_fix04c.test.cjs protects historical ACTIVE batch matching.
- Full Node regression and JavaScript syntax must pass before merge. Native Apps Script, HEAD readback and Telegram field acceptance are separate gates.
- Independent Codex CLI verdict is not claimed if reviewer quota remains limited; self-audit and executed tests are labelled separately.
