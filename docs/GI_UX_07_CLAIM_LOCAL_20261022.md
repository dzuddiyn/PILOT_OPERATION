# GI-UX-07 — PILOT_OPERATION /claim scoped source verification (2026-10-22)

## Scope / source integrity
- Canonical base: `dzuddiyn/PILOT_OPERATION` main `7ff50847767cbf728ce83bc766a8236d202d0605` (merged GI-UX-06).
- Isolated feature branch: `feat/gi-ux-07-claim-20261022`, NOT the owner's RBAC worktree.
- Only PILOT_OPERATION: `/claim` in Telegram menu/receiver, new `PilotClaimRetrieval.js`, local tests.
- `production_write:false`, `official_bse_write:false` kept. No claim/domain ledger mutations.
- Metadata-only access audit is written to the existing PILOT-bound workbook through `TEST_TELEGRAM_CLAIM_RETRIEVAL_AUDIT` (runtime-mapped PILOT sheet). This is not a claim amount or status change.

## Behavior
- /claim uses the current MYT month; MM/YYYY, MM-YYYY, YYYY-MM, twelve Malay/English full-name and common abbreviated months (case-insensitive) supported. Unrecognized/ambiguous tokens fail closed.
- Canonical `event_date` selects calendar month; no fallbacks to ingestion/creation date.
- Registered-active private user sees only matching numeric `claimant_telegram_user_id`. Group messages receive **no reply**. No identity by username.
- All-claim access requires exactly one active owner row with matching private Telegram ID AND exact verified immutable runtime bootstrap owner ID; `is_admin` and nominations never grant elevation. In ambiguous state deny.
- Status display distinguishes submitted, pending, approved, rejected, cancelled, and `APPROVED_TEST` (PILOT record, not payment approval).
- Amount must be positive finite, nonblank and tied to a source key; invalid data and unexpected official-write flags block the result. The sum is **recorded claim amounts**, not disbursed money. No trusted paid amount exists in this ledger; no claim of payment.
- Access audit logs only request identity/period/outcome/reason/scope/count, not claim description/amount, before reply authorization.

## Evidence
- Targeted `pilot_claim_retrieval.test.cjs`: **13/13 PASS** including negative group/private/owner/bootstrap/invalid amount and audit checks.
- Node regression: **87/87 test files PASS**.
- JS syntax and `git diff --check`: PASS.
- First independent Codex security review found P1 bootstrap-owner verification, P2 missing access audit, P2 empty amount accepted as 0. All three findings were repaired and targeted tests rerun. Do not claim a second independent review PASS.
- No live Telegram claim sent, no live private claim data accessed; source implementation only.

## Outstanding gate
- `GI-UX-06` Apps Script Script HEAD has already been read back 80/80 and canonical 70/70, but new native regression is **UNVERIFIED** because `clasp run` lacks script function execution permission.
- This GI-UX-07 source is not in Script HEAD. No `clasp push`, `setMyCommands`, Telegram real command, or live private proof was carried out for GI-UX-07.
- Apps Script native regression via owner-authenticated UI and independent Executions UI remains a genuine human/automation gate before subsequent Script HEAD synchronization.
- OWNER/ADMIN roles/cutover, user authorization grants, deployment and BSE official ledger are out of scope.
