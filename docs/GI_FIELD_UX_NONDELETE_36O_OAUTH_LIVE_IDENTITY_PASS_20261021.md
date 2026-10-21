# GI-FIELD-UX-NONDELETE — 36O OAuth Live Identity Proof

Date: 2026-10-21 21:59 MYT. Owner reported Google phone and OAuth consent completed. Authorized scope remains TEST_ONLY read-only identity probe; no approval issuance, ledger transaction, Script version or deployment update.

## Real Apps Script UI execution
Using Windows UI Automation on the existing TEST_ONLY Apps Script Editor signed into the expected owner account, selected `runBseNondelete36OIdentityReadOnly` and invoked Run. Genuine live Execution log at 21:59:00 MYT:

`TEST_ONLY_36O_IDENTITY_RESULT {"status":"IDENTITIES_MATCH_NOT_AUTHORIZED","diagnostic_stage":"IDENTITY_CHECK","identity_authorized":false,"approval_issued":false,"transaction_write":false}`

Execution completed. Both Session effective/active user checks and exact TEST_ONLY workbook identity guard succeeded. This is LIVE READ-ONLY RUNTIME IDENTITY MATCH PASS, **not** authenticated per-transaction consent nor trusted issuer.

## Independent readbacks
Fresh remote `clasp pull` into separate snapshot verified all five files SHA-256 MATCH staging. Remote manifest contains exactly two scopes: `https://www.googleapis.com/auth/spreadsheets` and `https://www.googleapis.com/auth/userinfo.email`.
Connected owner Google Sheets read-back confirmed TEST_ONLY_NONDELETE_APPROVAL_AUTH and TEST_ONLY_NONDELETE_APPROVAL_AUDIT are header-only (1 row each). Existing transaction ledger has two rows including historical TEST_ONLY_27_F fixture, not promoted.
No fresh Sheet rows or permission/approval changes were authorized. No Script deployment/version, production/official BSE write, Telegram or merge authorized.

## Gate verdict and next
36O-OAUTH-FIX: SCRIPT HEAD PASS; OAuth/phone consent completed by owner; LIVE identity runtime proof PASS; independent read-back PASS.
36P trusted per-transaction approval issuer still NOT INSTALLED. Matching runtime identities alone do not satisfy consent, immutable audit, one-time approval or transaction write permission.
NEXT: 36P secure issuer implementation/review with transaction-specific explicit human consent and authoritative audit, TEST_ONLY development first; separate owner gate for any live-write.
