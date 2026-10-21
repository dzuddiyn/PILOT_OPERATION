# GI-FIELD-UX-NONDELETE-RUNTIME-PREFLIGHT-29

Status: READ-ONLY PREFLIGHT COMPLETE / SCRIPT HEAD PUSH HOLD.

2026-10-21: Authenticated Google Apps Script API projects.get/getContent for:
- Script 16y4slvh-7m4CKtz7_tqDB3gmtBw8QZ_tlsZljc7ijnm3pScEUEDjckpO, title TEST_ONLY_GI_NONDELETE_BOUND_28A
- Exact parent Spreadsheet ID 1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY
- Creator dzuddiyn01@gmail.com
- HEAD contains only appsscript JSON manifest (124 characters), with V8 runtime and default America/New_York timezone. No functions or deployable source files.
- Timezone must be set explicitly to Asia/Kuala_Lumpur in any separately authorized TEST_ONLY Script HEAD update.

Source audit: Gate-26 NondeleteSheetsAdapterTest.js uses injected book and lock; it is not a real SpreadsheetApp/LockService binding. It has strict TEST_ONLY guard and four named TEST_ONLY tab headers. The Gate-24 commit model and Gate-23 receipt model likewise depend on injected stores and self-reported approval/provenance. Their synthetic tests do not establish real callback identity or Apps Script durable recovery.

Minimum safe integration requirements before HEAD push:
1. Clean isolated local clasp working directory, exact Script ID and independent API parentId recheck immediately before push. Never use the operational project clasp binding.
2. Explicit safe manifest scopes/timezone with no Telegram permissions, no webhook, trigger or deployment. Separate controlled authorization for Script HEAD update.
3. Standalone TEST_ONLY runtime wrapper must verify exact Spreadsheet ID at execution, exact tab schema and synthetic fixture identity, and never resolve from active workbook or folder title alone.
4. Apps Script LockService getScriptLock or appropriate documented lock, acquire before journal/ledger/evidence read-write, release in finally, use read-back after uncertain writes, fail closed under lock denial.
5. No fabricated provenance, old partial fixture backfill or auto-delivery of notifications.
6. Targeted script execution test and independent Sheets API read-back must be authorized as a separate gate, with rollback/reconciliation plan.

No Apps Script push/version/deployment, live function call, workbook write, Telegram, or merge in this preflight. PR #156 remains draft and /delete remains deferred PR #155.
