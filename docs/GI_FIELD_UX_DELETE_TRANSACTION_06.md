# GI-FIELD-UX-DELETE-TRANSACTION-06

Status: SYNTHETIC LOCAL PASS for pure transaction plan and journal state machine. NOT LIVE / NOT ATOMIC SHEETS EXECUTION.

Added DeleteTransactionTest.js: pure and NOT WIRED to Telegram, Apps Script worker, callback, or Google Sheets.

Facts: Approval source keys and inventory ledger source keys use different schemas. The exact binding is therefore a separate, authoritative prerequisite; a shared reference prefix does not establish it.

The simulator accepts READY_NO_WRITE only when owner authorized, approval confirmed, unique exact ledger row, matching hash + revision, and independently supplied exact approval-to-ledger binding. Missing or contradictory evidence fails closed. It never voids.

Journal model: PREPARED -> APPLYING -> COMMITTED only after read-back of ledger, approval and queue. Any incomplete outcome becomes NEEDS_RECONCILIATION. Replay of COMMITTED yields ALREADY_APPLIED. This is a pure simulator, not persistence.

IMPORTANT: No cross-sheet atomicity, crash-safe persisted journal, authoritative mapping table, lock-protected recheck, Telegram confirmation binding, or independent live read-back has been implemented. The existing legacy void path still requires follow-up hardening. Do not enable live individual /delete or claim atomic deletion.

Regression cases include stale revision/hash, duplicate ledger, missing binding, rejected candidate, prefix mismatch, partial write and replay. No live records touched.
