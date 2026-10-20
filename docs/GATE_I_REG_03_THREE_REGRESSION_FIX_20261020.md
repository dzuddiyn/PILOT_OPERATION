# GI-REG-03 — Treatment, Transplant and Census regression recovery

**Date:** 2026-10-20 MYT
**Environment:** PILOT_OPERATION (shadow pilot; `production_write:false`, `official_bse_write:false`)
**Current status:** PR #131 MERGED / Apps Script HEAD UPDATED / independent source read-back **76/76 PASS** / genuine Apps Script Editor runtime regression **47/47 PASS**. No version or deployment update; GI-263 field-message UX still NOT_RUN.

## Actual post-fix runtime evidence — 20 October 2026

- Canonical PR [#131](https://github.com/dzuddiyn/PILOT_OPERATION/pull/131) MERGED; canonical `main` merge SHA `cde9104f4c77652eed0864de5a7e2b8d86964c9b` independently fetched and verified.
- Owner-authorized `clasp push --force` targeted the existing `PILOT_OPERATION` Script HEAD, using fresh cloned canonical `main` plus **nine unchanged runtime-only Gate F helpers**; pre-push drift guard confirmed exactly three JS code changes (`TreatmentReviewTest.js`, `GeminiUnifiedTest.js`, `TelegramApprovalUiTest.js`), with no manifest change.
- New independent Apps Script `clasp pull` after push: **76/76 files (75 JS + manifest), zero file-set/content mismatches** against staged canonical source plus preserved helpers. No new Apps Script version, deployment, official BSE write, or Telegram replay was performed.
- Owner Chrome Apps Script Editor UI Automation reloaded the actual project, selected **only** `runBseI011FullRegression`, invoked it exactly once, and read the Apps Script execution log. Source log: `started_at=2026-10-20T08:00:40.171Z`, `finished_at=2026-10-20T08:00:44.839Z`, `total=47`, **`passed=47`**, **`failed=0`**, **`production_write=false`**, execution completed.
- Independent **Apps Script → Executions** UI confirms the same function executed from Editor on **2026-10-20 at 16:00:38 MYT**, duration **6.182 sec**, status **Selesai**; the prior 15:18:59 pre-fix regression remains **Gagal** and is not overwritten or concealed.
- Independent Google Sheets `PILOT_OPERATION` read-back for original genuine report `BSE-TG-772257263`: queue `NEEDS_HUMAN_REVIEW`, ACK `SENT`, approval card `OPEN` (message 264); zero matching `PILOT_OPERATION_LOG` and `PILOT_OPERATION_REVIEW` rows. **No existing Benar/Betulkan/Batal decision was made**.
- GI-263 post-fix **new Telegram Operation card-only UX remains NOT_RUN**; worker reliability and formal handover are separate open gates. The successful Apps Script regression does not prove a new Telegram UX event occurred.

## Historical baseline observed in the actual Apps Script editor

On 20 October 2026 at approximately 15:19 MYT, Windows UI Automation selected and executed `runBseI011FullRegression` in the bound PILOT_OPERATION Apps Script Editor. The execution log reported **47 total / 44 PASS / 3 FAIL**, `production_write:false`:

1. `runBseTreatmentD043AcceptanceHarnessTests`: `plots are canonical and complete` failed. Baseline standalone parsing of `M3 P1 P2` returned only `M3P1`.
2. `runBseTelegramTransplantReallocationDeterministicHarnessTests`: `strict one-line transplant shorthand extracts crop destination and date` failed. Baseline `Pindah anak pokok Timun ke M1P4, 15/10/2026` incorrectly produced `M1P1|M1P4` by parsing the date's leading `1` as a comma plot.
3. `runBseCensusConfirmationSummaryHarnessTests`: `confirmation uses canonical read-back summary for card and receipt` failed. Harness asserted direct reporter receipt of `recordSummary`, whereas current confirmation flow uses `verifiedSummary` and forwards `receiptText` to both card and receipt.

These regression failures are **separate from GI-263**; they do not imply the pending Mula Tuai card was approved or written.

## Implementation (isolated feature branch)

- `TreatmentReviewTest.js`: normalize the exact same-module two-plot shorthand into the existing canonical parser; reject longer unsupported bare-P lists instead of silently dropping plots. Preserve canonical single plot and `M3P34` behavior.
- `GeminiUnifiedTest.js`: prevent the optional compact-comma plot token from consuming date digits, retaining genuine `M1P1, 2` pairs, explicit source-plot exclusion and strict duplicate guards.
- `TelegramApprovalUiTest.js`: update the deterministic Census source-contract assertion to the actual verified-summary → receiptText → edited card and reporter receipt flow. **No live Census writer, approval or receipt logic changed.**
- `gate_i_reg_03_runtime_regressions.test.cjs`: independent in-memory JavaScript/V8 fixture invoking the three existing Apps Script harnesses and checking parser positive/negative cases and `production_write:false`; no Sheets, Telegram or network I/O.

## Verification

| Evidence | Result |
| --- | --- |
| Baseline local reproduction, before fix | All three harnesses FAIL, independently reproduced |
| Three original Apps Script harnesses in local VM, after fix | 3/3 PASS |
| Targeted new regression suite | 11/11 PASS |
| Full repository Node suites | 59/59 PASS |
| JavaScript syntax and Node test syntax | 66/66 JS; 59/59 CJS PASS |
| `git diff --check` | PASS |
| Post-fix Apps Script Editor full regression (47 checks) | **LIVE RUNTIME PASS: 47/47, 0 FAIL**, 16:00 MYT, real Chrome UI Automation; independently confirmed completed in Apps Script Executions |
| Telegram field UX / production write | **NOT RUN / NONE** |

An optional *synthetic* all-47 VM probe cannot establish runtime parity: it lacks full Apps Script Google services and reports unrelated stub errors (digest API, Script Properties, simulated sheet facilities). It is **not** evidence of post-fix live failures or a live PASS. The three originally failing harnesses passed with the targeted in-memory fixture.

## Authority boundary / next gate

**Completed within owner-approved GI-REG-03 scope:** canonical GitHub PR #131 MERGED at `cde9104f4c77652eed0864de5a7e2b8d86964c9b`; Script HEAD updated; Apps Script fresh read-back exact **76/76**; genuine post-fix Apps Script Editor full regression **47/47 PASS**. Historical baseline 44/47 remains preserved above for audit, not the current regression result.

**Outside scope and not done:** no Apps Script version or deployment update, no Telegram field report or callback replay, no approval-card interaction, no operational PILOT or official BSE Sheet write. Existing `BSE-TG-772257263` remains owner-controlled and OPEN. GI-263 post-fix new-message user-facing card-only proof, worker reliability acceptance and formal BSE handover remain **OPEN / NOT VERIFIED**.
