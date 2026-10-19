# GI-ADMIN-RBAC-M3 — Candidate implementation evidence

**STATE: IN PROGRESS / LOCAL SMOKE PASS / NOT TRANSACTION ACCEPTED.**

Approved broadly by owner for automated coding. This is an isolated source-only implementation candidate, with no Apps Script binding, no Sheet/Telegram calls, no runtime deployment and no permission change.

- M1/M2 merged PR #105 into `main` at `d87d01a1cabf75f97f7db07c7c8cf5694512819a` and independently read back.
- M3 source candidate: `PilotRoleGrant.js` and `PilotRoleRevocation.js`, used only in Node VM with dependency-injected in-memory FakeSheets and FakeLockService.
- `pilot_role_m3_candidate.test.cjs`: **8/8 LOCAL SMOKE PASS**, including synthetic grant, duplicate, owner denial, missing confirmation, lock contention, stale revision, grant-then-revoke, barrier-helper deny on outage.
- Full root Node test files: **45/45 exit 0**. Not all tests exercise this candidate.
- Real-code fault acceptance F01-F29: **NOT COMPLETE / NOT PASS**; the older 29/29 result is still simulator-only.
- **Known blockers:** in-doubt PREPARED and post-commit barrier-close recovery are not completed; durability of barrier against real crash, concurrency interleaving and read coherence not proved; recipient identity binding and callback freshness need stronger contracts; audit/notification integration and legacy call-site authorizations are not implemented; storage adapter is not bound to Google APIs.
- Security hold: no permission migration, no runtime role changes, no deploy or UI activation. No merge to main until full acceptance or explicit narrowed owner-reviewed scope.
- Test fixture identities synthetic only; no real user data or secrets.

**NEXT technical work:** rework recovery protocol and add F01-F29 direct actual-module tests using fault-injected adapters plus independent raw-state oracle. Run fault mutation and genuine controlled concurrency/crash-restart simulation before implementation acceptance.
