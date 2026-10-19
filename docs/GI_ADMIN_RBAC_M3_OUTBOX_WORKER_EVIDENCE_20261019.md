# GI-ADMIN-RBAC-M3-OUTBOX-WORKER-01 — LOCAL ONLY

**IN PROGRESS / targeted LOCAL PASS / NOT LIVE ACCEPTED.**

- Added `PilotRoleOutboxWorker.js`, isolated dependency-injected worker; no runtime scheduling, Telegram or Google APIs.
- Worker accepts only valid PENDING entries, requires `verifyCommitted(row) === true` from injected authority adapter, and rereads exact row under injected lock before side effects.
- Calls injected appendAudit/notify with stable idempotency key, transitions PENDING to DONE and read-back verifies. Conflicted/duplicate/invalid row, stale read, unavailable authority or lock contention fail closed.
- `pilot_role_m3_outbox_worker.test.cjs`: **12/12 LOCAL PASS**; retry without callback, repeated worker run, dual outbox channels, outage recovery, snapshot restart, denial on authority uncertainty, duplicate key, contention, stale data, failure after transport but before DONE, invalid key, missing adapter.
- **Limits:** persisted restart is synthetic snapshot reconstruction, not a real database or process-crash durability guarantee. Exactly-once delivery is not proved: a successful external send followed by failed DONE write can replay unless the receiver enforces idempotency. The caller-provided verifyCommitted() contract is not wired to the live resolver. No retry schedule/worker trigger, quarantine/dead-letter, backoff or operational integration.
- Prior F01-F29 assertions alone do NOT satisfy full RBAC safety acceptance. PR #106 remains DRAFT and must not be merged for live role activation.
- No live writes, permission changes, production or official BSE integration, clasp push or deployment.
