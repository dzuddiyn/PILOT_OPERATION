# GI-FIELD-UX-NONDELETE-AUTHORITY-RUNTIME-READINESS-36D

Date: 2026-10-21. Verdict: READ-ONLY INSPECTION COMPLETE / PROVISIONING NOT READY / LIVE-WRITE HOLD.

## Evidence obtained
- Canonical repo dzuddiyn/PILOT_OPERATION PR #156, GitHub head before this evidence 05937e2adcba7086c1cdb7a0b26bab097f091008; worktree clean before inspection.
- Fresh connected Google Drive file metadata: isolated TEST_ONLY workbook 1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY; only listed permission: user owner dzuddiyn01@gmail.com. The metadata alone does NOT prove protection from edits by owner or individual sheet-level restrictions.
- Fresh connected Sheets metadata: Sheet1 plus TEST_ONLY_NONDELETE_INTENT, TEST_ONLY_NONDELETE_LEDGER, TEST_ONLY_NONDELETE_EVIDENCE and TEST_ONLY_NONDELETE_RECEIPT. No dedicated approval authority/audit tab exists. Workbook timezone Etc/GMT, locale in_ID.
- Local isolated clasp package manifest: Asia/Kuching, V8 and https://www.googleapis.com/auth/spreadsheets scope. This differs from workbook Etc/GMT; do not assume date-only logic is aligned.
- Inspected local NondeleteRuntimeHarness30.js: uses real ScriptLock tryLock(1000), finally release, exact workbook ID and four schema checks; does not bind approval authority or perform transaction writes. Gate 34B previously provided LIVE READ_ONLY_READY proof but did not verify concurrent contention.
- A fresh Apps Script API project/deployments diagnostic was attempted through RDC but the invocation was blocked by tool safety; previous Gate 34A deployment metadata must not be presented as current fresh proof.

## Authority classification
1. Source code and contracts: GitHub canonical main/PR #156.
2. Operational approval authority: NOT PROVISIONED. A caller-injected approvalStore/actor_verified flag in local gates 35C-36C is not trusted server control.
3. Transaction state: existing four TEST_ONLY journal/ledger/evidence/receipt tabs; historic TEST_ONLY_27_F partial records remain untouched.
4. Authentication: Google Drive ownership and Apps Script execution identity do not prove a per-transaction human approval; independent authenticated issuer not available.
5. Transport: no Telegram linkage; deployment remains out of scope.
6. Cache and operational history: local mocks are evidence of synthetic tests only.

## Proposed minimal next design gate
Define a separate server-controlled approval issuer and protected approval/audit persistence with independent actor authentication, grant/revoke history, revision/hash/expiry/nonce, one-time consumption, and transaction under one real lock. Verify protection against unauthorized direct editing, source-drift and replay before any live write. Resolve Apps Script vs Sheet timezone behavior. Explicit owner approval is required before provisioning an approval ledger/tab or changing Apps Script.

No Sheets mutation, Apps Script push, version, deployment, Telegram message, PR merge, production/official BSE write or /delete activation during 36D.
