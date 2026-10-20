# GI-REG-03 — Treatment, Transplant and Census regression recovery

**Date:** 2026-10-20 MYT
**Environment:** PILOT_OPERATION (shadow pilot; `production_write:false`, `official_bse_write:false`)
**Status:** LOCAL PASS / PR preparation. **Not merged, not pushed to Apps Script HEAD, no deployment or new live proof.**

## Baseline observed in the actual Apps Script editor

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
| Post-fix Apps Script Editor full regression (47 checks) | **NOT RUN** — blocked until separately authorized merge/HEAD sync |
| Telegram field UX / production write | **NOT RUN / NONE** |

An optional *synthetic* all-47 VM probe cannot establish runtime parity: it lacks full Apps Script Google services and reports unrelated stub errors (digest API, Script Properties, simulated sheet facilities). It is **not** evidence of post-fix live failures or a live PASS. The three originally failing harnesses passed with the targeted in-memory fixture.

## Authority boundary / next gate

Canonical base: `dzuddiyn/PILOT_OPERATION` main `284ef8e313eba42e46c2710d19170022adeca64a`. This is a code/test/documentation PR only. No Apps Script `clasp push`, version, deployment, Telegram send/callback replay, approval-card interaction, or Google Sheet write is included. The existing `BSE-TG-772257263` card remains owner-controlled.

Owner authorization is required to merge the PR; Apps Script HEAD sync and runtime 47/47 proof are separate gates. Until a fresh Apps Script UI Automation run passes, report the last verified runtime state truthfully: **44/47 PASS, 3 FAIL on the pre-fix HEAD**.
