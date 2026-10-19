# GI-ADMIN-RBAC-TEST-ADAPTER-FOUNDATION-01 — scoped evidence

Scope APPROVED: test-only FakeSheets, FakeLockService, FakeClock, deterministic FaultScheduler and independent raw-state Oracle. NOT an actual OpsMate RBAC implementation. No Google/Telegram/Apps Script API calls.

Files: `test_support/rbac/{fake_sheets,fake_lock,fake_clock,fault_scheduler,independent_oracle}.cjs`; `pilot_role_adapter_foundation.test.cjs`.

Targeted checks: isolated fixtures; copy-on-read; Apps Script-shaped range access; injected partial write / stale read / flush error; lock ownership; raw ledger chain, grant, revoke, durable barrier, corrupt revision and inactive actor. Test runner executes through Node.js only.

Important evidence limitations:
- Oracle is independent of the previous SyntheticRoleMachine's return values, but uses the same documented event-hash shape as the synthetic contract.
- Fake LockService and FaultScheduler implement deterministic single-process scheduling only; no real parallel writers/process crashes were tested.
- FakeSheets models only exercised subset of SpreadsheetApp API and cannot prove Google Sheets atomicity or authorization integrity.
- F01–F29 remain simulator-only baseline; this foundation does not make their results real-module PASS.
- Future actual candidate modules must be system under test through injected adapters; additional realistic concurrency/crash/restart tests and separate owner authorization required.
- No role migration, PILOT Sheet writes, permission changes, Apps Script push or Telegram operations performed.
