# GI-263 ? Operation approval card without redundant interim reply

**Date:** 2026-10-20 MYT
**Environment:** PILOT_OPERATION shadow pilot
**Current status (2026-10-20):** PR #129 MERGED; Apps Script HEAD UPDATED; independent source read-back 76/76 PASS. Apps Script runtime regression is **VERIFIED FAIL (44/47)** from Chrome UI Automation, while post-fix Telegram field UX remains **NOT_RUN**.

**Historical status at PR creation:** LOCAL PASS ONLY; PR not merged and Script HEAD not updated at that time.

## Post-merge / Script HEAD independent verification — 2026-10-20

| Check | Verified state |
| --- | --- |
| PR #129 | MERGED at GitHub, `main` merge commit `92189791a4e5a296d95ee6d26f1a5a756c83e452` |
| Local targeted GI-263 | 12/12 PASS |
| Existing Transplant regression | 9/9 PASS |
| Full local Node regression before sync | 58/58 suites PASS |
| Apps Script staging syntax | 75/75 JavaScript PASS, `git diff --check` PASS |
| Pre-push runtime drift guard | PASS: no drift from the first independent Script HEAD pull |
| Runtime-preservation policy | All 9 existing Gate F-only helpers retained; 2 canonical `PilotRole*` modules included |
| Script HEAD source sync | `clasp push --force` success (exit 0); NOT a version/deployment update |
| Independent post-push pull | 76/76 files match exactly (75 JS + `appsscript.json`), 0 missing/extra/content differences |
| Script HEAD new predicate | `bsePilotOperationReviewCardOnly_` present exactly once |
| clasp run access | Permission/API execution error; superseded by actual Apps Script UI Automation run (not counted as runtime PASS) |
| Apps Script `runBseI011FullRegression` | VERIFIED RUN / FAIL: owner Chrome Apps Script Editor UI Automation, 2026-10-20 15:19 MYT, 47 total / 44 PASS / 3 FAIL, `production_write:false` |
| Runtime failure 1 | `runBseTreatmentD043AcceptanceHarnessTests`: plots are canonical and complete (parser output for `M3 P1 P2` incomplete) |
| Runtime failure 2 | `runBseTelegramTransplantReallocationDeterministicHarnessTests`: strict one-line transplant shorthand extracts crop destination and date (date is misread as an additional plot) |
| Runtime failure 3 | `runBseCensusConfirmationSummaryHarnessTests`: confirmation uses canonical read-back summary for card and receipt (current receipt call differs from asserted shape) |
| Actual new Telegram Operation card-only UX | NOT_RUN: requires fresh genuine user report; do not manufacture |
| PILOT_OPERATION production boundaries | No official BSE write, no version/deployment update or reporter callback by this task |

Fresh owner Google Sheet read-back after sync for original genuine `BSE-TG-772257263`:
- `PILOT_TELEGRAM_QUEUE` row 38: `NEEDS_HUMAN_REVIEW`, ACK `SENT`, one processing attempt.
- `PILOT_TELEGRAM_APPROVAL_UI` row 28: approval card `OPEN`, Telegram approval message 264, no action/decision timestamp.
- `PILOT_OPERATION_LOG` and `PILOT_OPERATION_REVIEW`: zero matches for this source.
- The pre-existing Telegram interim message cannot be retroactively removed by source sync; card-only behavior applies to eligible newly processed reports only.

**Verdict:** SOURCE MERGED / SCRIPT HEAD UPDATED / INDEPENDENT SOURCE READ-BACK PASS. Runtime full regression is **VERIFIED FAIL (44/47)**; future live user-facing card-only proof is **NOT_RUN**. Neither is elevated to LIVE PASS.

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
