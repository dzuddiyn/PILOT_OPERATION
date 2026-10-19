# GI-ADMIN-RBAC-M3-ADVERSARIAL-INTEGRATION-01

**PARTIAL LOCAL PASS — NO ACCEPTANCE / NO LIVE ACTIVATION.**

`pilot_role_m3_adversarial.test.cjs` invokes the actual unbound `PilotRoleGrant.js` M3 candidate using injected FakeSheets and FakeLockService: **7/7 LOCAL PASS**.

Validated synthetic cases: nested writer contention while original transaction lock is held; reader observes PREPARED without granting; persisted PREPARED snapshot reconstructed in new adapters and retry refuses duplicate; persisted revoke barrier snapshot denies elevated access after simulated crash; stale projection cannot override final revoke; mutation of actor identity denied; audit and notify functions are demonstrably **absent** from current API.

**Critical limits**: Snapshot reconstruction is not genuine OS process termination/restart or Google Sheets durability proof. Reentrant callback interleaving is not concurrent process execution. F13/F14 cannot be accepted because audit/notification integration does not exist. F26 concurrent execution and actual stale cache invalidation still need authentic coverage. F01–F29 current fixtures LOCAL PASS does not mean full contract acceptance. Revoke barrier consistency across actual storage writers/readers remains UNVERIFIED. Current engine has no binding to Apps Script, Sheets, Telegram or legacy authorization.

**STOP GATE:** Keep Draft PR #106 unmerged until actual audit/notification integration, asynchronous/concurrent execution test and full independent acceptance, under separate safe permissions. No migration or role grants.
