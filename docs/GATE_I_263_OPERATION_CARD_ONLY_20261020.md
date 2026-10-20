# GI-263 ? Operation approval card without redundant interim reply

**Date:** 2026-10-20 MYT
**Environment:** PILOT_OPERATION shadow pilot
**Status:** LOCAL PASS ONLY; not merged, no Apps Script HEAD sync or live proof of amended behavior.

## Original genuine observation

Telegram report `BSE-TG-772257263` contains:
```text
Tarikh mula tuai
M7P3
14-Oct-26
```
User screenshot showed a correct Mula Tuai approval card with date 14/10/2026 and plot M7P3, but also a redundant separate interim message:
```text
Rujukan BSE-TG-772257263:
OPERATION | M7P3
Menunggu pengesahan laporan.
```
PILOT Sheets read-back at investigation: one queue candidate `Operation_Log / HARVEST_START`, date `2026-10-14`, plot `M7P3`, validation PASS, `NEEDS_HUMAN_REVIEW`; one approval card `OPEN`, no durable callback and zero Operation_Log rows for this report at that moment.

## Root cause and limited fix

In `TelegramWorkerTest.js`, the guarded single-card-only path already covered valid PILOT Semai, Pindah Tanam and Rawatan, but did not cover `Operation_Log`. The result-message send therefore occurred before the approval card.

Added `bsePilotOperationReviewCardOnly_`: suppress the interim result text **only** when an exclusively PILOT_OPERATION result has `NEEDS_HUMAN_REVIEW`, a single `Operation_Log` candidate validated PASS, `production_write:false`, no missing fields, and valid event_date/plot_id/operation_type. Keep all existing human Benar/Betulkan/Batal card handling, hashes, durable callbacks, NEED_INFO and error/clarification messages, TEST/PILOT_TEST behavior and all domain persistence unchanged.

No existing Telegram message is edited or resent by this code change. The earlier processing ACK message ("Memproses Rekod / Laporan") is not part of this fix.

## Verification and gates

- Dedicated synthetic behavior harness `gate_i_263_operation_card_only.test.cjs`: **12/12 PASS**.
- Existing PILOT transplant card regression: **9/9 PASS**, with the guard assertion aligned to updated routing.
- Full local Node regression: **58/58 suites PASS**.
- Syntax and `git diff --check`: PASS.
- No Telegram send, callback replay, Script HEAD update, PILOT Sheets write or physical farm action during diagnosis.
- **Approval gate:** repo AGENTS.md requires explicit owner authorization before PR merge and Script HEAD update. LIVE Telegram suppression is NOT YET VERIFIED.
- Formal BSE handover and worker reliability remain OPEN.
