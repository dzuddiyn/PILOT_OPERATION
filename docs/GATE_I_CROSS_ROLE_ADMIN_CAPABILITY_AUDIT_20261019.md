# GI-HISTORY-CROSS-ROLE-REGRESSION-01 and OpsMate Admin Capability Audit — 2026-10-19

## Scope and truthful state
- STRICT READ-ONLY for operational records/roles. GitHub main baseline 3eae6f9f870934f236ae0d745bd40345878abd40, clean working tree.
- PILOT_OWNER_REGISTRY verified one owner/admin row 913757987, is_active TRUE, is_admin TRUE. PILOT_TELEGRAM_USER_REGISTRY verified user 8858214393 REGISTERED_ACTIVE with no admin role field.
- Confirmed private Evidence BSE-EV-126-AQADNxNr, caption Pam rosak M2P2, visibility PRIVATE_SUBMISSION, reporter 913757987. Existing real Telegram Desktop owner /history 19/10 and independent Sheet audit 2026-10-19T13:37:44.844Z SENT OWNER_ACTIVE 1/1: caption displayed correctly.
- New-user Telegram Web UI session not present in accessible current Chrome windows; UIA explicitly failed closed CHAT_IDENTITY_OR_COMPOSER_UNVERIFIED. No command sent from alleged new-user account. Do NOT claim live cross-role PASS or invent user results.
- Historical real private Evidence negative retrieval was DENIED/VISIBILITY_DENIED for 8858214393 (separate earlier test); this is corroborative previous live proof, not a new run.
- Current code rule bseTelegramHistoryEventVisibleTo_: owner may see all, reporter may see own, others only GROUP_STANDARD. New-user never receives owner PRIVATE_SUBMISSION caption under this filter.
- Repeated read-only local tests: pilot_history_evidence_caption.test.cjs 5/5 PASS, pilot_history_domain_coverage.test.cjs 9/9 PASS, pilot_operational_history_summary_fix.test.cjs 7/7 PASS, gate_i_work_date_history.test.cjs 16/16 PASS. No user role or farm records changed, no private media sent.

## Admin OpsMate capability (not Telegram group admin)
- OwnerRegistryTest.js defines TEST_OWNER_REGISTRY owner_id, owner_name, telegram_user_id, private_chat_id, google_tasklist_id, is_active, is_admin, updated_at. is_admin is a registry attribute; no promotion workflow is present in the inspected repo paths.
- TelegramRegistrationTest.js registry fields are user ID, private chat, REGISTERED_ACTIVE status, username/display name, operational group, request and owner decision metadata; no admin role column or promotion/demotion UI. Registration owner callback only accepts or rejects applicant.
- Repo-wide code grep for role/privilege promotion found no authenticated appoint-admin command, callback, menu, audited promotion, or revoke mechanism. Current check bseTestOwnerForTelegramUser_ accepts active owner registry entries even if is_admin=false; meaningful OWNER vs ADMIN RBAC and governance require explicit architecture review.
- Capability status: PARTIAL (owner registry is_admin data exists; owner-controlled promotion UI/workflow NOT FOUND). Do not directly toggle registry/is_admin or assign privileges. No new role granted.
- Proposed next owner-authorized implementation boundary: separate OpsMate OWNER/ADMIN/REGISTERED_ACTIVE identities, appointment and revocation with authenticated owner-only confirmation, audit, read-back, fail-closed idempotency, and regression; Telegram group admin unrelated.

## Outstanding gate
- Real registered-user UI session needed to independently re-run /history 19/10 from 8858214393 and verify no caption/ID leaks, read-back PILOT_TELEGRAM_HISTORY_AUDIT DENIED or SENT with 0/0. This remains LIVE UNVERIFIED, not blocked code.
- Admin role implementation intentionally NOT STARTED pending contract design/owner authorization. Full functional parity IN PROGRESS, NOT DELIVERED.
