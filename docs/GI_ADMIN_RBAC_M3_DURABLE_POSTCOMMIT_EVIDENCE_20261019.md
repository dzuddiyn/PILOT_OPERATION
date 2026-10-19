# GI-ADMIN-RBAC-M3-DURABLE-POSTCOMMIT-01 — local synthetic evidence

**PARTIAL LOCAL PASS; not accepted for live production or role grants.** Draft PR #106 stays unmerged.

- `PilotRolePostCommit.js`: injected `readOutbox/appendOutbox/updateOutbox/flush` contract; write PENDING -> flush/read-back -> invoke audit/notify with stable `operationId:type` idempotency key -> write DONE -> flush/read-back. No outbox adapter means do not send untracked side effects.
- `pilot_role_m3_durable_postcommit.test.cjs`: **8/8 LOCAL PASS**, including F13/F14 pending/retry, reconstructed synthetic outbox after restart, append failure, conflicted outbox key, missing adapter, and failure after successful send but before DONE.
- Older audit/notify fixture updated for mandatory outbox adapter; **4/4 LOCAL PASS** again.
- **Full Node regression 50/50 root `.test.cjs` files exit 0**, Node syntax passed.

**Security and reliability limits:**
- The outbox is durable only to the degree its injected storage provides persistence; synthetic in-memory fixture is not a live durable Google Sheet or database.
- A crash after transport delivery but before durable DONE may replay an outbound event; stable idempotency keys are supplied but adapter/receiver dedup is NOT implemented or proven. Exactly-once notifications CANNOT be claimed.
- Postcommit PENDING outcomes are not propagated in `bseRoleTransaction_`'s role result; APPLIED_VERIFIED represents the role state, not delivery status.
- Durable QUEUE worker/poller and operator reconciliation are not wired; replay currently occurs during duplicate transaction callback, so automated retry without callback is not proven.
- Root contract F01–F29 complete security acceptance remains NOT PASS; runtime concurrency/storage consistency, actual legacy authorization and live role change are unverified.
- No Apps Script pushes, pilot Sheet writes, Telegram sends, migration or permission changes.
