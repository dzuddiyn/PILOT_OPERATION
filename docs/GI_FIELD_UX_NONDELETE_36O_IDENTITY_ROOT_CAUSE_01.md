# 36O-IDENTITY-ROOT-CAUSE-01 — Live evidence

Date: 2026-10-21, Malaysia local time. Scope: TEST_ONLY read-only identity diagnostic and independent runtime readback. No approval issuance, Sheets transaction, new Script version, deployment update, merge or /delete.

## Baseline
PR #156 previously had the public UI runner `runBseNondelete36OIdentityReadOnly` but the actual Apps Script Editor invocation returned `READ_ONLY_PROBE_FAILED` without a stage. Existing Apps Script manifest declared only `https://www.googleapis.com/auth/spreadsheets`.

## Executed
- Implemented redacted diagnostic stages ENVIRONMENT, EFFECTIVE_USER, EFFECTIVE_EMAIL_READ, ACTIVE_USER, OPEN_TEST_ONLY_WORKBOOK, READ_WORKBOOK_ID, SCOPE_CHECK and IDENTITY_CHECK. Caught exceptions are NOT printed: only a safe failure_category based on a recognized public OAuth-scope identifier. No user email, credential or raw exception text is emitted.
- First live UI execution at 20:12:10 returned `READ_ONLY_PROBE_FAILED`, `diagnostic_stage:EFFECTIVE_USER`, all authority/write flags false.
- Refined stage granularity and category classification. Local targeted 11/11 PASS. `clasp push` acknowledged five files at 20:14:05.
- Second live Windows UI Automation selected exactly `runBseNondelete36OIdentityReadOnly` in TEST_ONLY Apps Script Editor and ran once. Actual log 20:14:47: `READ_ONLY_PROBE_FAILED`, `diagnostic_stage:EFFECTIVE_USER`, `failure_category:USERINFO_EMAIL_SCOPE`, `identity_authorized:false`, `approval_issued:false`, `transaction_write:false`. The Apps Script execution completed.
- `diagnostic_stage:EFFECTIVE_USER` isolates failure to `Session.getEffectiveUser()`, before `getEmail()` and before any workbook access.
- Fresh independent `clasp pull` from remote Script HEAD into a separate snapshot verified all five files byte-for-byte SHA256 MATCH. Manifest still has exactly one OAuth scope, `https://www.googleapis.com/auth/spreadsheets`; no `https://www.googleapis.com/auth/userinfo.email`.
- Local full Node regression 211/211 PASS; JS syntax PASS.

## Root cause and safety interpretation
LIVE ROOT CAUSE CONFIRMED: The current Apps Script runtime rejects the `Session.getEffectiveUser()` identity call and reports missing/required `userinfo.email` authorization. This is supported both by the redacted scope classification from the actual runtime exception and the independently read manifest. It is not a UI invocation failure, nor evidence that the workbook/Sheet is unavailable.

LIMIT: Fixing the missing OAuth scope could expose a separate subsequent failure later in the read-only probe (e.g. workbook access). This has not been tested. A matching effective/active Google identity would still NOT constitute per-transaction owner approval.

## Gate and recovery
STOP before OAuth scope addition: proposing `https://www.googleapis.com/auth/userinfo.email` to TEST_ONLY `appsscript.json` requires a separate explicit owner approval for scope expansion and any Google consent. Once approved: validate manifest change; targeted/full tests; exact five-file Script HEAD push; owner OAuth consent as needed; Editor READ-ONLY run; independent readback; never issue approvals or live-write.

State: SCRIPT HEAD UPDATED AND VERIFIED; ACTUAL UI EXECUTION PASS; LIVE IDENTITY READ FAILED DUE TO USERINFO_EMAIL_SCOPE; APPROVAL AUTHORITY NOT GRANTED; LIVE TRANSACTION HOLD.
