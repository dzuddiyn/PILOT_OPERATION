# GI-ADMIN-RBAC-M3-DIRECT-CALL-LOCKDOWN-01 — isolated proof

**LOCAL PASS / NOT LIVE ACCEPTED.** Draft PR #106 only; no runtime binding.

- `PilotRoleGrant.js` now directly requires `bseRoleValidateOwnerIntent_()` to return `{ok:true}` BEFORE acquiring a lock or writing a role event. Legacy `isOwnerPrivate()`, `confirmed()` or owner.ok alone can no longer authorize the base transaction.
- Six pre-existing transaction runner files updated to load `PilotRoleIdentityGuard.js` and explicitly inject `TEST_ONLY` owner-intent fixtures via `test_support/rbac/owner_intent_fixture.cjs`; the seventh transaction-related runner is the secured-entrypoint test (it already exercises the guard). Synthetic fixtures MUST NOT be imported by production.
- `pilot_role_m3_direct_call_lockdown.test.cjs` **3/3 LOCAL PASS**: missing identity guard module, legacy owner.ok-only, and invalid callback provenance all produce DENIED and ZERO role event appends.
- Existing targeted 29/29 assertions and worker restart 2/2 passed after adjustments. Full Node root regression **56/56 files exit 0**.
- **Remaining:** identity callback trust and immutable owner anchor are injected test adapters, not Telegram-authenticated live bindings. Intent persistence/expiry/replay and shared lock semantics still need actual Apps Script proof. F01–F29 acceptance NOT PASS; legacy operational call-sites not migrated; barrier durability UNVERIFIED.
- No merge, Apps Script push/deployment, Google Sheets write, Telegram call or permission change.
