# Gate I — EC_IN-first unified report intake (LOCAL PASS, 2026-10-21)

## Owner requirement and source truth
Owner stated EC_IN is BSE's primary reading; leachate is secondary. Both worker formats must be accepted:
- Khairul: `plot - EC leachate : EC_IN`, `REKOD EC LEACHING`, date and session. Blank before colon means unknown leachate, not zero. `x:x` means not measured.
- Sapiq: `plot - EC_IN`, bare day/month/year, sometimes `M7 - 3.0` module-level reading, with NO provided session.

GitHub canonical `dzuddiyn/PILOT_OPERATION` main at start: `751113188d27d14327a70da94ee9f6010e9e188e`. Apps Script HEAD was independently pulled READ-ONLY from owner script in preceding GI-EC352 investigation and source matched the existing PR #145 runtime snapshot.

## Authority and normalization
- Environment isolated: changes apply only when `BSE_RUNTIME_ENV` resolves to `PILOT_OPERATION`; TEST and PILOT_TEST retain original parser/card/history semantics.
- A single `EC_Leachate_Log` candidate is used per source report, regardless of original format, so one guarded Telegram approval card covers all scope readings. This is one transaction/batch, not multiple independent Measurement cards.
- **EC_IN is the primary reading**. Existing technical field `ec_in_next` carries the source's reported EC_IN; historical technical sheet `PILOT_EC_LEACHATE` remains source-of-truth for confirmed EC. `ec_leachate_out` is secondary when explicitly provided. No duplicate `PILOT_MEASUREMENT_LOG` writes.
- New status `IN_ONLY` means numeric EC_IN with unknown leachate. `MODULE_IN_ONLY` preserves module-level numeric EC_IN without inventing a plot. `NOT_MEASURED` stores nonmeasurement as missing, not 0. Paired `NUMERIC` and `AK_ZERO` preserve legacy semantics.
- Session absent -> empty canonical string, user card shows `Tidak dinyatakan`. Mandatory calendar date is never inferred. Invalid/duplicate readings fail closed. Date-only unheaded numeric text needs >=3 recognized EC scope readings and no unrelated prose; ambiguous messages do not auto-classify.
- Human confirmation still required before any data write. Existing `bseEcLeachateReviewCore_` and canonical read-back after approval are used. `production_write:false`, `official_bse_write:false`; no credentials introduced.
- Telegram display: EC_IN first, optional leachate second, original date and session (or not provided). `/ec_history` reads only confirmed EC rows and displays primary EC_IN. A pending report is never silently promoted.
- Historical `Measurement_Log` queue record `BSE-TG-772257352` (EC-IN on 15/10/2026) remains `NEEDS_HUMAN_REVIEW` without a card in the previous live runtime, and is NOT silently migrated/replayed, saved or approved by this change.

## Verification
- User-provided exact Khairul/Sapiq formats: `pilot_ec_two_formats_unified.test.cjs` 17/17 PASS, including blanks, x, AK, M7, optional session, duplicates, invalid dates and one-card envelope.
- `pilot_ec_runtime_harness_parity.test.cjs`: existing EC parser 11/11 and confirmation 3/3, independently run in PILOT_OPERATION and TEST.
- `pilot_ec_history_harness_parity.test.cjs`: existing EC history 6/6 each PILOT_OPERATION and TEST. Pre-existing stale fixture expected Friday-based nth-week, whereas actual `TelegramHistoryTest.js` and real Telegram period are Monday–Sunday. Updated the **test fixture expectation only**, not history date algorithm.
- Full local Node regression: **73/73 test files PASS**. Changed JS syntax: 4/4 PASS. `git diff --check`: PASS.
- This proves a LOCAL synthetic candidate, NOT Apps Script head parity, deployed worker behavior, Telegram card delivery, callback or domain ledger persistence LIVE.

## Controlled rollout / rollback gates
1. Owner reviews draft PR and authorizes specific merge only.
2. After merged main, re-inspect target Apps Script source and historical runtime-only Gate F files. Prepare guarded head sync and backup exact current HEAD; hard-stop on `SOURCE_MISMATCH`.
3. Separate owner approval before any `clasp push`. `clasp push` updates Apps Script HEAD only, not a version/deployment.
4. Fresh `clasp pull` compare exact contents + run full actual Apps Script regression; deployment/version update only if needed and separately authorized.
5. Isolated non-operational Telegram proof (e.g., synthetic group test message) and read-back of queue/card/confirmed ledger, explicit human approval. Never auto-confirm or replay `772257352`.
6. Roll back by restoring exact saved HEAD and double-verifying hash + registry/trigger/settings; never clear offsets, queues or approval history.

## Status
LOCAL PASS; NOT MERGED, NOT DEPLOYED, NO LIVE PROOF.
