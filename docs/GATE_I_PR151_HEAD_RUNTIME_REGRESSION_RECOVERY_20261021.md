# GI-PR151 — Apps Script HEAD push, native regression mismatch & guarded repair

Date: 2026-10-21 MYT.

## Scope and authority
Owner explicitly approved `LULUS GI-PR151-SCRIPT-HEAD-PUSH` for the eight changed canonical JS files in PR #151. This does NOT separately approve merging a future new PR, a second Apps Script HEAD push, Telegram Bot API `setMyCommands`, Apps Script deployment/version, production system changes or operational record mutations.

Canonical GitHub `dzuddiyn/PILOT_OPERATION` `main` before operation: `40c93cd43aec9654792561d124795037613d3b47`. Repo instructions preserve `production_write:false`, `official_bse_write:false` and nine runtime-only Gate F helpers.

## Real authorized Script HEAD push
- Existing preflight directory: `%LOCALAPPDATA%\OpsMate\GI_UX_151_HEAD_PREFLIGHT_20261021`.
- Original HEAD backup: `BEFORE_PR151_SCRIPT_HEAD_ROLLBACK.zip`, SHA-256 `CA63C15B81BD13F77108EB77677A1C0397F6362209297DC9B86C5A30AAA88A8A`, local ZIP extraction verified 81/81 file hashes.
- Canonical source and last-second independent `clasp pull` compared with original HEAD: 81/81 hash match. Manifest, Script binding and nine runtime-only helpers unchanged.
- Only eight approved JS files changed in staged source. Prepush Node regression 79/79 test suites PASS; staged JS syntax 79/79 PASS.
- Created one-shot marker `GUARDED_PUSH_ATTEMPTED.lock`. Exactly **one** `clasp push --force` invocation returned exit code **0**.
- During the push Remote Desktop connector briefly disconnected. On reconnection the **original process log** showed successful completion. No blind retry was made.
- Independent postpush `clasp pull` in `POST_PUSH_INDEPENDENT_PULL_1`: 81/81 exact files, zero mismatches. All nine runtime-only helpers byte-identical.
- Status: **SCRIPT HEAD UPDATED / SOURCE PARITY VERIFIED**, not Apps Script deployment.

## Native runtime regression — FAIL (evidence, not masked)
- The user-authorized Apps Script PILOT_OPERATION Editor was opened through Edge with the expected project identity. File `RegressionSuiteTest.gs` and function `runBseI011FullRegression` were explicitly selected and Run invoked **once**.
- Native Editor error: `I-011 regression gagal: runBseTelegramAiHarnessTests: FAIL (AI harness gagal: /ask_ai parser accepts free-form question)`.
- Independent Apps Script **Executions** page: `runBseI011FullRegression`, origin Editor, **21 Okt 2026 05:51:34 MYT**, duration **7.047 sec**, status **Gagal**.
- Source root cause: `runBseTelegramAiHarnessTests` in canonical `TelegramAiTest.js` retained hardcoded command `/ask_ai` even though PR #151 intentionally changed PILOT_OPERATION parser to accept `/ask` and reject `/ask_ai`. Other legacy environments retain `/ask_ai`.
- Native full regression therefore **NOT PASS**. This result must not be relabelled as verified runtime or deployment success. No evidence of an operational record write or bot trigger change from this specific regression.

## Isolated synthetic fix (new PR; not live)
- Separate worktree `%TEMP%\GI_PR151_AI_HARNESS_FIX_20261021` branched from approved canonical main, no user work overwritten.
- New `bseTelegramAiHarnessCommandParity_` derives allowed command from `bseRuntimeEnvironmentName_()`, checks prompt extraction and rejects the alternate environment's command.
- Existing native harness `runBseTelegramAiHarnessTests` delegates its command assertion to the new parity function.
- New synthetic test `gate_i_ai_harness_environment_parity.test.cjs`: **6/6 PASS**, including PILOT_OPERATION `/ask`, TEST/PILOT_TEST `/ask_ai`, no command transport or persistence effects, and assertion that native harness uses the parity function.
- Full local Node regression **80/80 suites PASS**; targeted syntax and git diff check PASS.
- Patch is test/harness-only and does NOT change the ordinary user AI parser, KB, Telegram messages, queue or approval state.
- **NOT MERGED; NOT SCRIPT HEAD PUSHED.** A separate owner approval gate is required for the new PR merge and then guarded source HEAD sync, followed by rerunning native `runBseI011FullRegression` and independent source/readback.

## Operational and other gates
- Existing Telegram server menu `/ec` remains unchanged. The new `/ask` menu update remains a separate owner authorization.
- No Apps Script version/deployment update, Telegram replay, inventory void, privileged role transfer, KB import, or Drive duplicate cleanup.
- Current lifecycle: PR #151 MERGED; SCRIPT HEAD UPDATED; source HEAD 81/81 VERIFIED; native regression **FAIL**; targeted fix LOCAL PASS; follow-up PR pending.
