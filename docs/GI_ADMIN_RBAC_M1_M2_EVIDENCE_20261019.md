# GI-ADMIN-RBAC-M1-M2-IMPLEMENT-01 — scoped evidence

**SOURCE ONLY / NOT DEPLOYED.** Owner approved PilotRoleContract.js, PilotRoleResolver.js and isolated real-module tests. No Grant/Revocation module, Telegram UI, Sheet, permission, migration, clasp or deployment changes.

- Baseline `main`: `a84f44399ed57bbdd1f94b06715d0105074862e7`.
- Resolver is dependency-injected, read-only, uses no SpreadsheetApp or Telegram globals. Synthetic adapters provide owner identity, registration, ledger, barriers and SHA256.
- Capabilities: ordinary, restricted_history, restricted_retrieval, approve, delete, registration_decision, manage_admins, mutate_owner. OWNER only for role management and owner mutation.
- Fail closed on invalid bootstrap, registration, corrupt/uncommitted ledger, conflicting revision, revoke barrier, source error, and unknown capabilities. No `is_admin` fallback.
- `node pilot_role_m1_m2_actual.test.cjs`: 17/17 LOCAL PASS against actual resolver through isolated adapters. One initial regex bug was fixed before final pass.
- All 44 root `.test.cjs` files exit 0; Node syntax checks pass.

**Limitations / gates:** F01–F29 full transaction tests are NOT actual-module PASS (no grant/revocation implementation). Fake adapters and independent oracle do not establish Google Sheets consistency or real race/crash safety. Resolver is not connected to legacy authorization call sites or runtime. SHA256 injected to tests; runtime crypto integration and bootstrap identity anchoring require distinct approval and verification. Grant/revoke, deployment, migration and permission changes remain unauthorized.
