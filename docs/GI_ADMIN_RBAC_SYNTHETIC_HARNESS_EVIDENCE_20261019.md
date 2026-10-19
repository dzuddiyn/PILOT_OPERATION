# GI-ADMIN-RBAC-SYNTHETIC-HARNESS-IMPLEMENT-01 — Evidence

**Scope:** Synthetic runner ONLY. No production RBAC controller, Apps Script code, Sheet PILOT, credentials, Telegram or permission touched.

Run from repo root: `node pilot_role_synthetic_faults.test.cjs`.

- 29 numbered F01–F29 synthetic examples use in-memory FakeSheets, FakeLockService and SyntheticRoleMachine. No external network or spreadsheet APIs are used.
- Assertions include separate final-state evaluation through `evaluate()` and `resolve()`; these are independent from the transaction method's returned status but **share the same simulator code**, so not an independent production oracle.
- Crash, partial-row, lock-contention, cache and sequential interleaving are **modelled events**, NOT actual process kill, asynchronous concurrent workers, Apps Script service failures or actual Google Sheets torn writes.
- F11/F12/F26 illustrate sequential conflict and reader/prepared-state modeling; **parallel race correctness remains UNVERIFIED**.
- F27 models a pre-existing durable barrier; its persistence and crash safety remain UNVERIFIED.
- F29 checks owner-only simulated capability; **legacy call-sites are NOT patched or proven safe**.
- Synthetic evidence is sufficient only to test harness wiring and expected model behavior. It does NOT satisfy the v0.2 contract's eventual proof against actual implemented RBAC.
- The current fixture runner reinitializes state for every scenario, uses no customer content, and makes zero PILOT Sheets / Telegram / Apps Script requests.

**Promotion gate:** Implement real RBAC under separate approval; retarget F01-F29 to actual candidate modules with isolated fake infrastructure, independent state oracle, deterministic scheduler and crash/restart process tests. Then run integration and separately approved live validation. Do not label this harness result as RBAC implementation acceptance.
