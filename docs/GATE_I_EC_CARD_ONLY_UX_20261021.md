# Gate I — EC card-only Telegram UX (2026-10-21)

## User-observed issue
User's real screenshot of PILOT_OPERATION EC report `BSE-TG-772257370` showed two bot messages replying to the same user input:
1. Redundant generic preview: `Rujukan BSE-TG-772257370: EC_LEACHATE | EC Leaching 2026-10-15 9 bacaan; Menunggu pengesahan laporan.`
2. Correct, more useful single approval card `REKOD EC — EC_IN UTAMA`, date 15/10/2026, 9 scope readings, and Benar/Batal.

Owner requests **no generic preview**. The correct full review card remains.

## Inspected authority and fix
- Canonical repository: `dzuddiyn/PILOT_OPERATION` main baseline commit `d6e29da2f1a854826677fb26a172cddfbd9fbad7` (merged PR #147).
- Repo guardrails AGENTS.md read. Local user worktree was clean on unrelated RBAC branch; isolated worktree used.
- Worker source: `TelegramWorkerTest.js` sends generic preview in `processBseTelegramTestQueue()` before calling `bseTelegramApprovalEnsureCard_`. Existing card-only guards cover Transplant, Sowing, Treatment, Operation but not EC.
- Added `bsePilotEcReviewCardOnly_(result,status)` and appended only that predicate to existing guard. It returns true ONLY in PILOT_OPERATION with `NEEDS_HUMAN_REVIEW`, a single validated `EC_Leachate_Log` candidate, `production_write:false`, no missing fields, valid date and nonempty readings. Invalid/incomplete reports continue clarification. Never writes to queue or calls Telegram itself.
- EC parser, approval callback, ledger, access control, receipt and TEST/PILOT_TEST paths unchanged. No generic message deletion or replay for historical `772257370`.

## Evidence
- New synthetic behavioral test `gate_i_ec_card_only.test.cjs`: **8/8 PASS**, including nine-scope example, NEED_INFO, other domains, fail-closed cases, environment isolation and preservation of downstream approval card.
- Existing `gate_i_transplant_card_only.test.cjs` updated string assertion for newly extended guard; **9/9 PASS**.
- All Node `*.test.cjs` suites **74/74 PASS** from clean feature branch.
- `node --check` for worker and test PASS; `git diff --check` PASS.
- Status: LOCAL PASS only, not merged, Apps Script HEAD not updated, no new Telegram field proof.

## Rollout / rollback gates
1. Independent GitHub PR verification, explicit owner merge authorization.
2. After authorized merge: baseline Apps Script HEAD fresh pull, source guard including nine runtime-only Gate F helpers, unchanged binding/manifest; independent rollback snapshot.
3. Explicit owner Apps Script HEAD authorization before `clasp push`; fresh source parity, actual native Apps Script regression and stability pull.
4. Demonstrate **new** EC report: one clear approval card, no separate generic summary, Benar/Batal correct; verify via Telegram observation and corresponding Sheets read-back. Do not replay or approve old reports.
5. If runtime issue, fail closed, reconcile current HEAD and rollback only as authorized. No version/deployment, official BSE writes or Telegram queue resets without distinct approval.

## Follow-up — Flexible EC titles and optional session (2026-10-21)
- New screenshot and Google Sheets READ of `BSE-TG-772257372` demonstrate the root cause: user supplied `EC` plus `14/10/2026`, nine scope lines including `x` and blank values, but the old EC-specific parser rejected the lone heading and the fallback produced five `Measurement_Log` candidates. No approval card was created for that report.
- `PilotEcUnifiedIntake.js` now accepts standalone headers `EC`, `Rekod EC`, `EC leeching`, `EC leaching` and existing EC headings, case-insensitively. Standalone header recognition does not treat arbitrary prose containing EC as a confirmed EC report.
- Date comes exclusively from explicitly supplied message text (DD/MM/YYYY; not inferred from receive date). `pg`, `pagi`, `ptg`, `petang` and `Sesi: ...` are optional, normalize to PAGI/PETANG and can appear before or after the date. Contradictory or invalid details fail closed.
- Nine scope lines are retained in one canonical `EC_Leachate_Log` candidate; `x` and blank readings remain NOT_MEASURED, and `M7` remains module scope. Both TEST and PILOT_TEST retain their original parsing behavior.
- New `gate_i_ec_flexible_headers_sessions.test.cjs` **31/31 PASS** using the screenshot's actual layout and permutations; existing EC card-only **8/8 PASS**. Complete local Node regression **75/75 PASS**. Source syntax and diff check PASS.
- This change updates the existing **draft PR #148** only. No merge, Apps Script HEAD push, Telegram replay, approval, or domain record write was performed. Historical `BSE-TG-772257372` remains in its previous state pending separate authenticated reporter review; never silently migrate/approve it.

## Follow-up — EC history command renamed to /ec (2026-10-21)
- Owner requested renaming user-facing dedicated EC history command from `/ec_history` to **`/ec`** before PR #148 merge.
- In `PILOT_OPERATION` only, `bseTelegramEcHistoryCommand_` accepts `/ec` (without args -> existing invalid/usage path), `/ec YYYY-MM-DD`, `/ec YYYY-MM`, `/ec week last`, `/ec week N YYYY-MM`, etc. It reuses the existing `/history` period parser, permissions and confirmed-only readback, with no ledger write.
- PILOT `bsePilotEcHistoryHelp_` now shows `/ec` examples. Bot command menu source `bsePilotTelegramCommandMenu_` dynamically advertises `ec` and human-readable EC_IN description in PILOT only; TEST and PILOT_TEST retain `ec_history`.
- PILOT `/ec_history` is no longer a recognized command; similarly no routing of lookalikes such as `/ec2` and `/ecology`. No silent compatibility aliases or inferred date.
- Existing EC history diagnosis and runtime harness calls now use the environment-specific prefix. New `gate_i_ec_command_rename.test.cjs` 10/10 PASS tests period parsing, no-argument help, collision avoidance, command-menu declaration/read-back using a synthetic Telegram API and TEST/PILOT_TEST compatibility.
- **Important future activation gate:** A `clasp push` alone does not update Telegram's server-side registered command menu. Once owner authorizes deployment and a separate controlled menu update, `configureBseTelegramTestCommands()` must be invoked with the existing bot-identity guard and followed by `getMyCommands` read-back. This PR performs no Telegram API `setMyCommands` write, no Script HEAD sync and no operational data change.
- All test evidence remains LOCAL until independent live checks. Historical documentation mentioning `/ec_history` is preserved as historical evidence.
