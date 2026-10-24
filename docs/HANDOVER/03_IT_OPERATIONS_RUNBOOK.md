# 03 — IT Operations Runbook

## Receiving prerequisites
Read `AGENTS.md`, `docs/PILOT_OPERATION_EXECUTION_PATH.md`, `docs/GATE_I_OPERATIONS_HANDOVER.md`, `ACTION_PLAN.md`, `docs/DEVELOPMENT_STATUS.md`. Confirm actual main, Apps Script HEAD/deployment, trigger scheduler, PILOT Sheet/Drive, Telegram bot connection and `production_write:false` before changes. Never trust a past PASS as current proof.

## Corporate asset custody
Assign BSE IT technical custodian and on-call owner; verify GitHub membership/protection, Google Sheet/Drive/Apps Script permissions, Script Property binding **without exporting secrets**, Telegram BotFather/bot rights, scheduled digest/worker authority, backup. Read back recipient access and departed-access denial separately. Do not put tokens, private chat IDs, .clasp.json or Script Properties values in GitHub.

## Operational SOP
Reports and reporter confirmations in authorized group. /history (month/week/day), /retrieve by BSE-TG reference and authorized /claim via PM. Restricted/private records will remain restricted to ordinary users. Manual BSE system entry is separate; there is no approved automatic synchronization.

## Incident resolution
Correlate Telegram update ID → queue → approval UI → callback ledger → canonical domain source key → outbound receipt. For uncertain send/partial write, inspect state before retry; **do not replay old callbacks**. `EC_LEGACY_HOLD` is legacy quarantine, not confirmation. For mistaken records, use a controlled correction/void ticket; universal DELETE is unfinished, so do not manually erase history.

## Deployment and rollback
Canonical source → isolated feature branch → tests/regression/diff/secret checks → approved PR/merge → controlled Apps Script HEAD push → independent fresh pull and hash → native runtime proof → live acceptance → versioned deployment only when separately authorized. Preserve runtime-only helper scripts and separate TEST from PILOT and production. Test restore in an isolated environment, verify audit, queue idempotency and no duplicate callbacks. Backup/DR production exercise UNVERIFIED.

## Stop conditions
Missing custodian, conflicting OWNER identifiers, unknown partial write, unapproved official BSE connector, inadequate rollback, permissions mismatch or credentials exposed. Record UNVERIFIED/FAILED, not PASS.
