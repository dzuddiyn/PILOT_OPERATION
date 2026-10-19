# GI-ADMIN-RBAC-M3-AUDIT-NOTIFY-BOUNDARY-01 — source-only evidence

**PARTIAL LOCAL PASS / NOT ACCEPTED FOR LIVE ROLE MANAGEMENT.** Draft PR #106 remains unmerged.

- New `PilotRolePostCommit.js` defines injected `appendAudit` and `notify` boundaries; no real Google/Telegram adapters.
- `PilotRoleGrant.js` invokes post-commit boundary only on verified commit or ALREADY_APPLIED reconciliation.
- `pilot_role_m3_audit_notify.test.cjs`: **4/4 LOCAL PASS** including injected F13 audit and F14 notification exceptions, no duplicate grant and no early notification prior to commit.
- `pilot_role_m3_workers_restart.test.cjs`: **2/2 LOCAL PASS** with real Node worker_threads, a shared Atomics-based lock and ephemeral disk-backed synthetic fixture. One test races two workers for one revision; the other kills a worker before COMMITTED and recreates a worker reading persisted PREPARED without duplicate append.
- **Caution:** Transaction still returns APPLIED_VERIFIED for verified role even if postcommit audit/notification fails. Pending outcomes are not surfaced in its return value or durably queued. Notification retry, exact-once semantics and durable audit integrity are NOT yet proved.
- Worker tests exercise real Node concurrency and termination but use a synthetic shared lock and ephemeral file, not real Apps Script LockService or Sheets coherence.
- F01–F29 full contract acceptance remains **NOT PASS**: coverage beyond narrow asserted cases, projection invalidation, actual Apps Script binding and live storage atomicity remain unverified.
- Strict offline synthetic environment; zero live Sheets, Telegram, permission grants, Apps Script push or deployment.
