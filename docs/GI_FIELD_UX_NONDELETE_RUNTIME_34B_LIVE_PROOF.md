# Gate 34B - TEST_ONLY live read-only proof

Date: 2026-10-21. Status: LIVE READ-ONLY PASS (limited to schema checks/LockService acquisition, not transaction writes or recovery).

Owner accepted Asia/Kuching as an alternative timezone to Asia/Kuala_Lumpur. Apps Script UI Project Settings displayed GMT+08 Malaysia - Kuching; subsequent Google Apps Script API projects.getContent readback returned timeZone Asia/Kuching, parent workbook 1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY.

Read-only zero-argument function bseNondelete32ReadOnlyProof was executed in the Apps Script editor for TEST_ONLY Script 16y4slvh-7m4CKtz7_tqDB3gmtBw8QZ_tlsZljc7ijnm3pScEUEDjckpO. UI Automation read execution log:
TEST_ONLY_34B_RESULT {"status":"READ_ONLY_READY","production_write":false,"official_bse_write":false,"telegram_send":false,"row_counts":{"TEST_ONLY_NONDELETE_INTENT":2,"TEST_ONLY_NONDELETE_LEDGER":2,"TEST_ONLY_NONDELETE_EVIDENCE":1,"TEST_ONLY_NONDELETE_RECEIPT":1}}

The call exercised the real SpreadsheetApp and LockService path, including successful script-lock acquisition/release and four exact header checks. There is no evidence of contention handling under simultaneous live execution. The log showed normal completion, and an independent Google Sheets connector readback before/after showed identical rows: one synthetic PREPARED journal, matching APPROVED_TEST ledger, and no evidence or receipt rows.

Instrumentation was limited to logging the read-only return value. Local full tests: 141/141 PASS. Clasp push after manifest UTF-8 BOM correction returned 4 files pushed, including updated entrypoint source and Asia/Kuching manifest. A prior attempted manifest push failed validation due to encoding and did not update the remote project. No deployment/version/Telegram/operational write/merge.

Scope: read-only LIVE PASS only; journal-to-ledger-to-evidence recovery, receipt reconciliation, concurrency contention and authenticated operational callback remain UNVERIFIED. PR #156 DRAFT; individual /delete deferred PR #155.
