# GI-263 ? Operation approval card without redundant interim reply

**Date:** 2026-10-20 MYT
**Environment:** PILOT_OPERATION shadow pilot
**Current status (2026-10-20, post-field proof):** **SCOPED TELEGRAM CARD-ONLY LIVE PASS** for newly received Telegram message `BSE-TG-772257265`. The real Chrome Apps Script Editor full regression was separately repaired under GI-REG-03 and now **47/47 PASS**, with independent Script HEAD source read-back **76/76 PASS**. This is **not** a full worker-reliability or BSE handover acceptance.

## GI-263-LIVE-01 — Genuine Telegram card-only field proof (20 October 2026)

- Evidence from owner-provided Telegram screenshot: user submitted the text `Tarikh mula tuai / M7P3 / 14-Oct-26` as a fresh Telegram message at approximately **16:12 MYT**; bot gave the short `Memproses Rekod / Laporan` ACK and one correct `Semakan laporan BSE-TG-772257265` approval card by approximately **16:13 MYT**. The visible screenshot segment contains **no separate interim `OPERATION | M7P3 Menunggu pengesahan laporan`**; it shows exactly the intended card with date **14/10/2026**, plot **M7P3**, type **Mula Tuai**, disclaimer that no harvest quantity was specified, and **Benar / Betulkan / Batal** controls. Scope of visual evidence is only the visible chat segment.
- Independently queried owner PILOT_OPERATION Google Sheet. `PILOT_TELEGRAM_QUEUE` row **39**, update **772257265**: `received_at=2026-10-20T08:13:25.641Z`, ACK `SENT`, ACK message **266**, **one** processing attempt, **no last_error**; later queue state `REPORTER_CONFIRMED`.
- `PILOT_TELEGRAM_APPROVAL_UI` row **29**: one approval card message **267**, created `2026-10-20T08:13:39.067Z`. **After screenshot capture**, the row had `REPORTER_CONFIRMED` and `acted_at=2026-10-20T08:14:35.473Z`. This later user-side confirmation was **not initiated by the audit agent**.
- `PILOT_TELEGRAM_APPROVAL_CALLBACK_PENDING` row **32**: callback update **772257266** `PROCESSED`; no callback replay by the audit agent.
- Independent `PILOT_OPERATION_REVIEW` row **2**: exactly one `APPROVED` review linked to `BSE-TG-772257265|Operation_Log`, approved at `2026-10-20T08:14:32.503Z`, proposal validation PASS.
- Independent `PILOT_OPERATION_LOG` row **2**: exactly **one** source `BSE-TG-772257265`, date **2026-10-14**, plot **M7P3**, operation type **HARVEST_START**, no fabricated harvest quantity; `verification_status=PROVISIONAL` (not VERIFIED).
- The earlier identical-content message `BSE-TG-772257263` was handled separately: queue/card status `DISCARDED_BY_REPORTER` at **16:12:45 MYT**, callback update **772257264** `PROCESSED`, and **zero** `PILOT_OPERATION_LOG` rows from that source. One matching M7P3 operation row exists in the inspected PILOT ledger; no duplicate entry was seen.
- Source/run authority: GitHub canonical `main` **`2c57464fba434327f1514a210f8cfd00aa480a42`**; GI-263 PR #129 merged earlier, GI-REG-03 PR #131 and evidence PR #132 merged; genuine Apps Script I-011 regression `47/47 PASS`, `production_write:false`, at **16:00:38 MYT**.
- **Verdict:** GI-263 **card-only Telegram UX: SCOPED LIVE PASS** and **post-confirmation PILOT write/read-back: VERIFIED for this one report**. The screenshot does not prove the physical harvest event occurred. This is not evidence that automated retrieval/history, worker reliability, rollback or formal BSE handover passed. No official BSE write, new deployment, agent-triggered callback or user message was performed by this audit. Prior report `772257263` was not replayed or overwritten.

**Historical status at PR creation:** LOCAL PASS ONLY; PR not merged and Script HEAD not updated at that time.

## Historical pre-GI-REG-03 checkpoint / Script HEAD independent verification — 2026-10-20 (before 16:13 MYT)

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

**Historical checkpoint verdict (superseded above):** SOURCE MERGED / SCRIPT HEAD UPDATED / INDEPENDENT SOURCE READ-BACK PASS. At the earlier checkpoint, runtime full regression was **FAIL (44/47)** and post-fix card-only field proof was **NOT_RUN**. The later GI-REG-03 runtime **47/47 PASS** and GI-263-LIVE-01 **SCOPED LIVE PASS** are independently recorded above.

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
