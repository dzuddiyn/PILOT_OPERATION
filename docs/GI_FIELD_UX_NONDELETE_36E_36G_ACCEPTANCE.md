# Gate 36E-36G controlled preparation

2026-10-21 status: LOCAL PLANNING/PREFLIGHT PASS; LIVE PROVISIONING APPROVAL REQUIRED.

36E: provisioning plan, permission assumptions, UTC expiry contract, immutable approval/audit proposal and reversible disable-first rollback documented in GI_FIELD_UX_NONDELETE_AUTHORITY_PROVISION_PLAN_36E.md. NO resources created.
36F: NondeleteAuthorityBlueprint36FG.js returns exact two-table schema proposal only; status PLAN_ONLY, provisioned=false and write_allowed=false.
36G: metadata and owner preflight fails closed for unexpected workbook, owner, missing transaction tables or already-existing approval tab. Correct synthetic fixture still returns PROVISION_APPROVAL_REQUIRED and ready_for_write=false.

Targeted 6/6 PASS, full Node regression 180/180 PASS, JS syntax PASS. All tests local synthetic fixture; no independent trusted identity implementation, actual permission enforcement, append-only remote audit, OAuth authorization or cross-session concurrency tested.

Historical TEST_ONLY_27_F remains unchanged. No Apps Script HEAD push, version, deployment, new Sheet/tab, Sheets write, Telegram, PILOT_OPERATION/official BSE mutation, merge, or deferred individual delete changes.

Stop gate: owner must explicitly approve a narrowly scoped TEST_ONLY provisioning operation before any real approval/audit tabs, protections, issuer binding or Script HEAD change. Provisioning itself is not implicit in 36E-36G.
