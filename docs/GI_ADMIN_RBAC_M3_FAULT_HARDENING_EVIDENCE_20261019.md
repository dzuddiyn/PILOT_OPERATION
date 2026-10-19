# GI-ADMIN-RBAC-M3-FAULT-HARDENING-01 — in-progress evidence

**Source-only candidate; NOT implementation acceptance, NOT deployment-authorized.** PR #106 remains Draft.

- Updated `PilotRoleGrant.js` to reconcile existing operation IDs, refuse accidental promotion of PREPARED rows, verify actor/target/action/expected revision in repeat requests, and recheck revoke barrier when a committed revoke is rediscovered.
- `pilot_role_m3_faults_actual.test.cjs` executes F01–F29 scenarios by calling the actual candidate `bseRoleTransaction_()` and isolated fake storage/locking; **29/29 LOCAL PASS as currently asserted**.
- Full Node root test files **46/46 exit 0**, syntax pass. No live Sheet, Telegram, permission, Script HEAD or deployment changes.

**CRITICAL limitations blocking acceptance:**
- F13 (audit failure) and F14 (notification failure) are currently only proxy checks: candidate has no audit or notification integration.
- F26 is an intermediate PREPARED-state check, **not genuine concurrent reader/writer testing**.
- F18 and F28 check final denial without exercising actual cache/projection injection.
- No crash/restart across processes; PREPARED recovery deliberately returns WRITE_OUTCOME_UNKNOWN/manual reconciliation, not automated resumability.
- FakeSheets lacks authoritative Apps Script/Google Sheets atomicity, and the revoke barrier's durability remains unproven. Current direct-module tests are necessary but insufficient for the locked 29-scenario acceptance gate.
- Further validation needed: independent adversarial mutation, read-coherence and concurrent writers, incomplete writes and callback/intent binding, audit, notification and security call-site integration.

**Truthful state:** M3 fault hardening IN PROGRESS / 29/29 local assertions PASS / mandatory coverage and live safety proof NOT PASS. Do not merge PR #106, migrate, grant/revoke real ADMIN, deploy, or activate permission.
