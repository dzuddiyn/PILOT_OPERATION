# GI-FIELD-UX-NONDELETE-RUNTIME-BIND-28 — RECHECK

Status: PARTIAL CREATION / TARGET BINDING UNVERIFIED; NO RUNTIME EXECUTION.

2026-10-21 owner confirms intended clasp account dzuddiyn01@gmail.com. Actual clasp 3.4.1 show-authorized-user independently returned exactly dzuddiyn01@gmail.com. Credential files not opened.

Command run in a fresh isolated directory (NOT the canonical repo or existing operational Script):
clasp create --type sheets --title TEST_ONLY_GI_NONDELETE_RUNTIME_BIND_28 --parentId 1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY

Observed tool output created BOTH a new spreadsheet ID 1BFKCcxQ5-7oD0AsXop00ZSrw_5-NTjnvoxU7k9et8hc and new Script ID 1NiDSVd0RkiIuHukOHHpUM71DrRwVPhnpiBAxqcPCpXVNGtKEgT-_3H0m. Local .clasp.json read-back corroborated Script ID. Independent Google Drive metadata confirmed:
- Unexpected NEW spreadsheet: TEST_ONLY_GI_NONDELETE_RUNTIME_BIND_28, ID 1BFKCcxQ5-7oD0AsXop00ZSrw_5-NTjnvoxU7k9et8hc.
- Intended EXISTING TEST_ONLY workbook: TEST_ONLY_GI_NONDELETE_SHEETS_PROOF_27_20261021, ID 1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY.

The new Script's actual parent binding has not yet been independently read from Apps Script API; the creation output suggests an unintended separate document. Never assert correct binding from the --parentId CLI argument alone. No code was pushed, no Script function executed, no LockService tests, no sheets writes in this stage. New TEST_ONLY artifacts left untouched for reconciliation; do not silently delete.

Next gate: use Apps Script project metadata or Apps Script editor bound to intended workbook to prove exact scriptId and parentId; if needed create the correct bound Script with a verified API/UI method after reconciling extra TEST_ONLY artifacts. Do not test on the unverified new Script.

PR #156 stays OPEN/DRAFT/RELEASE HOLD; deferred /delete remains out of scope. No PILOT_OPERATION, PILOT_TEST, official BSE or Telegram writes.
