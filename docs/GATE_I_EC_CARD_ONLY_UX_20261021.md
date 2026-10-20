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
