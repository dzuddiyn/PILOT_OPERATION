# 05 — Test Evidence and Open Items

## Proven bounded results
- PR #223 and PR #224 merged; latest operational closeout document PR #225 merged to main `f2ac6e3`.
- Node regression **274/274 PASS** on CL-H07 release; focused canonical EC and history presentation assertions PASS; staged diff and secret scan PASS.
- Native Apps Script EC proof: two October batches, 18/18 readings; lifecycle guards 7/7 PASS; Script HEAD independently pulled **115/115 SHA256 match** with runtime helper retention; **not a versioned production deployment**.
- Actual Telegram user accepted `/ec 2026-10`, `/history Oct 2026`, multi-plot status, Baja In N and grouped Baja Out F/N.
- Prior evidence: `docs/CL_H07_EC_HISTORY_UX_20261024.md`, PR #224 and postmerge runtime evidence. Do not report new live tests from documentation-only work.

## 24 Oct READ-ONLY queue/ledger snapshot
Queue 86: 37 REPORTER_CONFIRMED, 30 INCOMPLETE_CANCELLED, 11 DISCARDED_BY_REPORTER, 1 INCOMPLETE_CANCEL_ONLY, 3 NEEDS_HUMAN_REVIEW, 4 EC_LEGACY_HOLD. Approval UI 55: 40 confirmed, 12 discarded, 3 OPEN. Callback 104: 96 PROCESSED, 3 FAILED_CALLBACK_RETRY_LIMIT, 2 FAILED_LIFECYCLE_NOTICE_UNVERIFIED, 3 FAILED_LIFECYCLE_CONFLICT. Canonical EC: 2 COMMITTED; inventory: 20 APPROVED_TEST. Counts may overlap; not 18 independent failures.

## Seven-reference reconciliation (proposals only, no write)
- `772257964` (13 Sep M3P1 harvest), `772257968` (13 Sep M3P2 harvest): retain hold; approval OPEN, canonical operation match not located.
- `772257988` (15 Oct M4P1 harvest): proposed SUPERSEDED by confirmed `772257985` with Operation_Log and REVIEW APPROVED.
- `772258028`, `772258042` (14 Oct EC): RETAIN_HOLD, no canonical 14 Oct.
- `772258039`, `772258041` (15 Oct EC): proposed SUPERSEDED by COMMITTED canonical `772258043` with identical raw note.
These are recommendations, not applied state transitions. Do not automatically force-close.

## Product defects / limitations
**P0 — Universal DELETE unfinished.** Existing TEST /delete helper supports limited inventory/claim/asset allowlist with VOIDED_TEST state, but no full cross-domain cancellation or correction, referential dependency management, enterprise transaction guarantee, formal security tests and actual business-production acceptance. Inspect Asset_Event_Log fallback carefully.
P0 — OWNER migration and trusted ADMIN/RBAC adapter unresolved; old owner remains active.
Remaining raw PRIVATE_SUBMISSION text in history and monthly 20/24 display cap; private retrieval visibility limits zen; legacy queue/callback failures pending IT reconciliation. End-to-end enterprise backup/restore, formal BSE UAT and official integration unverified.

**Result:** scoped pilot DEVELOPMENT_CLOSED, NOT FULLY DELIVERED.
