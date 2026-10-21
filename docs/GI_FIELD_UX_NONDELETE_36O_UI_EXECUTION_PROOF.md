# Gate 36O — Windows UI Automation Apps Script real execution

Date 2026-10-21 Asia/Kuching. Scope: READ-ONLY execution and minimal repair; no deployment, approvals, Sheets mutation or transactions.

Windows UI Automation inspected the genuine existing Edge Apps Script Editor window titled TEST_ONLY_GI_NONDELETE_BOUND_28A. Owner account button was dzuddiyn01@gmail.com. Refresh confirmed remote five-file Script HEAD included NondeleteIdentityHead36O.gs. An initial function named bseNondelete36OLiveIdentityReadOnly_ was not present in the Editor Run dropdown (private trailing underscore). Added a public read-only delegating wrapper runBseNondelete36OIdentityReadOnly, tested locally 6/6 and pushed Script HEAD only.

UI Automation selected that exact function and invoked Run. Actual Apps Script execution log at 19:41:54 local: execution started; TEST_ONLY_36O_IDENTITY_RESULT {"status":"READ_ONLY_PROBE_FAILED","identity_authorized":false,"approval_issued":false,"transaction_write":false}; execution completed.

Minimal follow-up: standalone script active spreadsheet may be null; changed guard to SpreadsheetApp.openById(exact TEST_ONLY workbook) for ID-only read. Local tests 6/6 PASS and Script HEAD push acknowledged five files at 19:43:08. Refreshed Editor and invoked exact wrapper again. Actual log at 19:43:38: execution started; returned same READ_ONLY_PROBE_FAILED with all authorization/write flags false; execution completed.

VERDICTS: UI FUNCTION INVOCATION LIVE PASS; BUSINESS IDENTITY PROOF FAILED (reason caught but not classified); SCRIPT HEAD UPDATED; NO deployment/version update; NO approval issuance; NO Sheets transactions; no production or official BSE writes.

NEXT: instrument a strictly redacted, phase-coded read-only probe diagnostic before further changes; do not assume Session identity is the failing stage. Preserve explicit separation of owner approval from runtime executor identity.
