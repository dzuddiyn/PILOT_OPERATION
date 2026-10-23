# CL-H07 — EC canonical history and readable operational history

Date: 2026-10-24 (MYT). Scope: PILOT_OPERATION Telegram read-only history and menu presentation.

## Root cause and verified state
- Real PILOT_EC_CANONICAL_BATCH contains two COMMITTED EC_BATCH_V1 canonical rows:
  - BSE-TG-772258047: 2026-10-13, nine readings.
  - BSE-TG-772258043: 2026-10-15, nine readings.
- /ec previously looked up historical EC_IN TEST_EC_LEACHATE-derived index, so claimed zero for October.
- New PILOT-only /ec reader uses canonical batch authority, validates schema/reference, filters by requested date/week/month, preserves explicit numeric/zero/x/blank values and indicates truncation without partial batch.
- TEST /ec_history legacy behavior stays unchanged.
- /history PILOT now emits plain Malay multi-line record labels for Baja, operations, EC, and canonical crop reports, capped to safe Telegram message length with period narrowing hint; no changes to underlying record authority or timestamps.
- /summary is hidden from PILOT Telegram setMyCommands menu but retains parser as backward-compatible alias; TEST menu unchanged.

## Local evidence
- Dedicated canonical history two-batch 18-reading acceptance and corruption fail-closed test PASS.
- Dedicated /history human summary and label test PASS.
- Full Node test suite 274/274 PASS, 0 FAIL.
- No live record or production mutation in local test.

## Required remaining gates
- Code diff/secret scan, GitHub PR/merge, controlled HEAD sync with 9 runtime-only helpers retained.
- Independent clasp pull hash read-back, native Apps Script canonical history smoke read-only.
- Bot menu update via getMe/setMyCommands/getMyCommands with exact read-back.
- Telegram live /ec and /history field acceptance.
