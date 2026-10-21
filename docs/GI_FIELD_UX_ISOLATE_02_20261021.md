# GI-FIELD-UX-ISOLATE-02 — Small Baja/Banci correction package

**Date:** 2026-10-21 (Malaysia)
**Owner approval:** `LULUS GI-FIELD-UX-ISOLATE-02`.
**Status:** ISOLATED SOURCE / LOCAL TEST PASS / RUNTIME LIVE PROOF PENDING / NOT MERGED / NOT DEPLOYED.

## Scope and provenance
- Canonical repository: `dzuddiyn/PILOT_OPERATION`, fresh `origin/main` base `404cd784da7fa923283e301d5e0a9dc7fb75194c`.
- Isolated source branch: `fix/gi-field-baja-census-refocus-20261021`. Original draft PR #156 / `fix/gi-field-baja-census-only-20261021` remains unchanged; do not merge or discard it under this gate.
- Cherry-picked **only the two original source fix commits**: `70e8351a28426e907ea561b8a3540156b3da81a6` (Baja In/Out and clarification tests) and `48ff187e457b1747462b7d871b7099b526c357b5` (stable multi-item item-specific keys).
- Added **only** focused synthetic E2E verification tests from original PR: `gi_field_ux_nondelet_e2e_20.test.cjs` and `gi_field_ux_nondelet_callback_22.test.cjs`. Both are tests with mock/in-memory sheets; they do **not** grant transaction authority.
- Source diff versus main touches only `InventoryReviewTest.js` and `TelegramWorkerTest.js`; current `CensusReviewTest.js` is already on canonical main and is **not** modified.
- No 35–36 authority system implementation, Ed25519 signing, 36P Google Web App, Script HEAD probe, `/delete`, or new OAuth/deployment components included.

## What the changes address
1. **Baja In:** independently recognize bounded `2 set Baja F`, `3 set Baja N` quantities and explicit event date. Two approved candidates must have distinct replay-safe deterministic `|ITEM_F` and `|ITEM_N` keys, never a shared `|INVENTORY_IN` key.
2. **Baja Out:** when explicit product/plots/date are present, apply scoped one-set-per-plot shorthand only to `PILOT_OPERATION`; missing product/quantity or conflicting shorthand must request clarification, never invent inputs.
3. **Banci:** historical allocation as of reported census date is already supported by `main`; regressions show unique matching batch resolves and absent/ambiguous history returns NEED_INFO. Added human-readable follow-up text preserving supplied dead/sick counts.
4. **Legacy and authorization safety:** existing TEST and unrelated product operations remain unchanged; synthetic multi-candidate callback and idempotency tests do not substitute for authenticated live review.

## Verification executed
- Focused Baja/Banci/parser/key/E2E/callback suite: **27/27 PASS**.
- Entire available Node `*.test.cjs` suite on clean refocus branch: **106/106 PASS** (85 test files).
- `node --check` PASS for `InventoryReviewTest.js`, `TelegramWorkerTest.js`, `CensusReviewTest.js` and two synthetic E2E test files.
- `git diff --check origin/main...HEAD` PASS before final evidence commit.
- Existing PR #156 is OPEN/DRAFT; remains separate and unmodified.
- This is **LOCAL + SYNTHETIC** proof only: no genuine Telegram callback, real approval receipt, live two-ledger write, crash/restart durability, or direct evidence of field worker success.

## Follow-up delivery gates (NOT in ISOLATE-02 authorization)
1. Focused independent PR review for only the isolated app diff/test scope. Do not make 36P/36Q a prerequisite for parser and follow-up text fixes.
2. Merge requires explicit authorized merge. Subsequent Apps Script Script HEAD sync must be independently authorized and verified; do not equate source merge with runtime delivery.
3. If verifying real ledger write/callback, use a separately approved controlled isolated TEST_ONLY transaction or existing pilot approval workflow; preserve truthful partial state and read-back. No official BSE or production write and no `/delete`.
