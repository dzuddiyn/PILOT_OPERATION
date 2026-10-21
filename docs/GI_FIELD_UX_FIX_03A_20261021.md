# GI-FIELD-UX-FIX-03A — Baja In / Baja Out fail-closed repair

Date: 2026-10-21 MYT
Scope: authorized code fix and synthetic regression tests in the isolated PR #157 branch only.
Result: **LOCAL PASS / LIVE PROOF NOT RUN / NOT MERGED / NOT DEPLOYED**.

## Real state inspected

- Canonical repository: `dzuddiyn/PILOT_OPERATION`, fresh origin/main `404cd784da7fa923283e301d5e0a9dc7fb75194c`.
- Source branch: `fix/gi-field-baja-census-refocus-20261021`, PR #157 at original HEAD `aff809b7cc7bb6f728aee225320b09b83f99689b`, OPEN/DRAFT, no uncommitted changes at start.
- Repo guardrails and A-I execution policy inspected. No approval for merge, Apps Script Script HEAD change, deployment, live Telegram or actual Sheet transaction.

## Confirmed errors (independent local probes)

1. `Baja In\n15/10/2026\n2 set Baja F\n3 set Baja X`, similarly `0 set Baja N` and `3 kg Baja N`, returned `PASS` but silently dropped the second line, creating partial approval-ready candidates.
2. `Baja Out\n20/10/2026\nM4P1 & M4P2\nBaja F\n3 set Baja N` incorrectly returned `PASS` with Fruitka quantity 3 on both plots, rather than rejecting the incompatible product/quantity source.
3. Further negative probes exposed zero-quantity defaulting to a one-set shorthand, unknown product mix and global quantity replication across two plots. Correctly scoped distinct Baja F/N per-plot shorthand must remain supported.

## Implementation

- `InventoryReviewTest.js`: PILOT_OPERATION-scoped Baja In now validates *all* non-empty item lines before generating any PASS candidate. Allows exact supported `n set Baja F/N` lines, event date and responsible label; unknown line, unsupported unit, invalid quantity or duplicate product forces NEED_INFO rather than a partial successful record. Existing per-item deterministic source keys remain unchanged.
- `InventoryReviewTest.js`: PILOT_OPERATION-scoped Baja Out checks named fertilizer consistency, unsupported product names, zero/negative quantities and unscoped global quantity over multiple plots. Fail-closed candidate list preserves plot context but removes ambiguous item/quantity/unit. Separate plot-bound F/N shorthand without an explicit quantity remains valid.
- The change does not affect the `TEST` legacy branch, `CensusReviewTest.js`, `/delete` (separate deferred PR #155), Google approval UI or the 36P–36Q branch.
- `gi_field_ux_fertilizer_fix04.test.cjs` includes additional negative and positive tests and one original-source UI-question integration check.

## Proof and limitations

- RED state: first batch of newly added tests detected prior partial-PASS and cross-product misallocation failures; a second set captured zero quantity, unknown product and preservation of valid distinct scoped products.
- GREEN state: focused Baja suite **20/20 PASS**; combined Banci/Baja/source-key/E2E/callback **41/41 PASS**; entire Node regression **120/120 PASS**, zero failures. Five targeted JS/CJS syntax checks PASS; `git diff --check` PASS. Additional negative regression: `Baja F` + `3 set N` rejects, whereas matching `3 set F` on one plot remains valid.
- This is LOCAL / synthetic evidence only. No Google Apps Script live execution, real Telegram callback or Google Sheets write/receipt is claimed. Those require separately authorized delivery and proof.
- Existing test fixtures and prior PR #156 have not been modified.

## Next permitted gate

PR #157 is a code-review candidate once remote push and independent read-back pass. **MERGE-04 requires explicit owner approval.** Subsequent Script HEAD synchronization and live field validation are separate authorization gates, with `production_write:false` and `official_bse_write:false`.
