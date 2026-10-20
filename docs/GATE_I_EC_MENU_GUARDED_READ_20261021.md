# GI-EC-MENU-UPDATE — Guarded menu baseline and scoped rename

Date: 21 Oct 2026, MYT

## User authorization and stop gate

Owner authorized `LULUS GI-EC-MENU-UPDATE` to rename the Telegram command menu from `/ec_history` to `/ec`, subject to bot identity verification, original menu backup and `getMyCommands` read-back. Original approval did **not** authorize changing Apps Script HEAD or a new deployment.

A pre-write attempt to obtain the live baseline via `clasp run bseTelegramApi_ --params ["getMyCommands",{}]` was rejected by Apps Script run-function permissions. Telegram Desktop did not provide a reliable complete Bot API menu snapshot. No Telegram `setMyCommands` call was made. Evidence: private laptop file `GI_EC_MENU_UPDATE_PREFLIGHT_BLOCKER_20261021.md`.

## Safe development continuation

- Canonical repo `dzuddiyn/PILOT_OPERATION`, main at `270d872ab0a83bb17bffb14fe8437795c124e7c3` (merged PR #148).
- An isolated clean worktree `feat/gi-ec-menu-guarded-read-20261021` was created, preserving user's unrelated RBAC work.
- New `TelegramEcMenuGuardTest.js` supplies two parameterless Apps Script Editor entrypoints:
  - `inspectBsePilotEcMenu()` — strictly read-only, `getMe` + `getMyCommands`, validates PILOT environment and bot identity, logs current **default-scope** command names/descriptions to execution logs, no tokens and no writes.
  - `updateBsePilotEcMenu()` — in the same PILOT environment, independently reads original menu, requires exactly one `ec_history` and no `ec`, re-reads immediately before write to detect drift, logs full original menu, replaces **only the one command name** while preserving its description and all other commands, invokes `setMyCommands` at most once, then requires exact `getMyCommands` read-back. If renamed already, returns ALREADY_APPLIED without a write. Missing command, both names, malformed data, identity conflict, and revision drift all fail closed. On uncertain write result or post-write mismatch, reports reconciliation required without blind retry or destructive rollback.
- All operations use the **existing** bot API guard and server-side Script Properties. No tokens are displayed, copied or committed.
- TEST and PILOT_TEST cannot invoke either function; no queues/approvals/messages/offsets or operational domain records are accessed.
- No Apps Script version/deployment changes are required for an Apps Script Editor HEAD function, but introducing the new helper to HEAD **still requires separate owner approval**.

## Synthetic acceptance and non-claims

- Targeted `gate_i_ec_menu_guard.test.cjs`: 15/15 PASS, including wrong bot, TEST boundary, invalid menu, name collision, ALREADY_APPLIED, intervening remote drift, one-write-only, readback mismatch and no message/domain side effects.
- Full local Node regression: 77/77 test suites PASS.
- New source and test syntax: PASS.
- Git diff check: PASS.
- New files only: helper source, focused tests, evidence.
- **LIVE TELEGRAM DEFAULT MENU BASELINE NOT YET OBTAINED. MENU NOT WRITTEN. SCRIPT HEAD NOT UPDATED.** Do not claim menu update complete.

## Future owner gate and plan

1. Owner specifically authorizes merge of guarded helper PR and a bounded Apps Script HEAD update with the helper, preserving source parity, nine runtime-only Gate F helpers, manifest, and original rollback ZIP.
2. Only after fresh source read-back, open existing Apps Script Editor and invoke `inspectBsePilotEcMenu()` exactly once; independently capture read-only execution log and current menu snapshot locally. If the bot/menu/scope is unexpected, HARD STOP.
3. If snapshot confirms the exact old `ec_history` command, continue under the already granted menu update scope and invoke `updateBsePilotEcMenu()` exactly once; read back Telegram default menu and compare all unaffected items. If current state is already `ec`, ALREADY_APPLIED. If missing/conflicting, stop.
4. If write outcome uncertain, reconcile through a fresh `inspectBsePilotEcMenu()`, not a blind retry. Any actual restore of previous menu requires revision guard and an explicit controlled recovery decision.
5. Preserve the read-only helper as an approved diagnostic or remove it in a separately authorized follow-up; do not silently edit canonical runtime or expose credentials.

## Status

LOCAL DEVELOPMENT PASS. PR DRAFT PENDING. HEAD CHANGE NOT AUTHORIZED. MENU LIVE READ/WRITE NOT VERIFIED.
