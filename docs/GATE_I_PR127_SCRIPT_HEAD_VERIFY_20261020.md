# GI-PR127 ? Harvest Routing Script HEAD Verification

**Date:** 20 October 2026 (MYT)
**Authority:** dzuddiyn/PILOT_OPERATION
**Environment:** PILOT_OPERATION shadow pilot only
**Verdict:** MERGED / SCRIPT HEAD UPDATED / INDEPENDENT SCRIPT HEAD MATCH / PULLED-SOURCE PREVIEW PASS.
**Not verified:** New reporter-approved Telegram Mula Tuai LIVE flow, Apps Script version/deployment, formal BSE handover.

## Authorized change

Owner explicitly approved `GI-PR127-MERGE-AND-HEAD-SYNC-01`. PR #127 (head `fa64cf7bda0f9d9a554ce7eb201a8c8e9145877a`) was mergeable and merged to GitHub main at `d4f7ec5c24de91049749575f5b77719f7e5e4104`. Original main was `83b339127b9125041394b3ef321fcc21854028f5`. The only Apps Script files changed were `TelegramWorkerTest.js` and `TreatmentReviewTest.js`.

Tests rerun before merge: root-cause regression 12/12 PASS and full Node suite 57/57 suites PASS, syntax and diff check clean.

## Script HEAD controlled synchronization

1. Fresh isolated `clasp pull` of PILOT_OPERATION before write: 74 script files, compared with previous canonical main. **65/65 canonical shared JS/manifest MATCH, 0 drift**, nine runtime-only Gate F helpers preserved. The two repo-only role files were absent in runtime, as already documented.
2. Replaced only the two named JS files in staging with content from merged GitHub main. Verified previous contents and local write/read-back.
3. `clasp push`: **Pushed 74 files at 2:32:02 PM MYT**. This updates Script HEAD only, not a version or deployment.
4. Independent new `clasp pull` of 74 files: normalized source comparison to newly merged main yielded **65/65 MATCH, 0 drift, nine runtime-only helpers unchanged**.
5. Independently executed `gate_i_261_harvest_treatment_routing.test.cjs` against source from **freshly pulled Script HEAD**, with 12/12 PASS. It confirms that the original three-line report maps to `Operation_Log / HARVEST_START` with date 2026-10-14, plot M7P3; `Treatment_Event_Log` rejects the harvest header, valid Treatment remains allowed, and already-reviewable PILOT Treatment suppresses the redundant interim notice without losing human approval or NEED_INFO questions.

Normalized independent Script HEAD source SHA-256:
- `TelegramWorkerTest.js`: `087dac9b83a1f83a1c67ff09ce5c20104769460873aceb17f1dca883c9a1ac58`
- `TreatmentReviewTest.js`: `7c07258dd93cb8e109b4a19e954a844494773814835733eee568243917e5c343`

## Original mistaken card and safety

Prior independent PILOT Sheets and Telegram UIA read-back verified bad card `BSE-TG-772257261` was **DISCARDED_BY_REPORTER**; Batal callback `772257262` action R **PROCESSED** exactly once, zero Treatment and zero Operation domain rows for source `772257261`. No replay or retroactive update is authorized.

This sync made no Telegram send/edit, callback replay, domain record or official BSE production write. The user remains the only authority to press Benar on a future card.

## Outstanding acceptance gates

- New post-sync real Telegram Harvest card and owner-confirmed Operation Log / edited receipt: **NOT TESTED / no LIVE PASS claimed**.
- Worker reliability and full formal BSE/site IT acceptance: **OPEN**.
- No Apps Script version/deployment update or official BSE production transition.

Scope locks: `production_write:false` and `official_bse_write:false`.
