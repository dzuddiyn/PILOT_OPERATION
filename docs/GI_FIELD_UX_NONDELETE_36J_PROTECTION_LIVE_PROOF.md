# GI-FIELD-UX-NONDELETE — 36J protected-range live test

Date 2026-10-21. Owner bulk permission for isolated TEST_ONLY test and use of second Google account. Not a production or source workbook transaction.

## Isolated test
New workbook TEST_ONLY_36J_PROTECTED_RANGE_NEGATIVE_ACCESS_20261021, ID 1uHN0qN8zquMtcnOPq18uc0RG4K0pEU5ZIFLmiyb8MfA. Owner connection dzuddiyn01@gmail.com. Editor granted ONLY on this isolated workbook to dzuddiyn@gmail.com.

Protected tab TEST_ONLY_PROTECTED, sheetId 425192648, protectedRangeId 932365695, warningOnly=false, allowed editor user dzuddiyn01@gmail.com. Header/control cells A1 CONTROL and B1 DO_NOT_EDIT.

Actual editor account dzuddiyn@gmail.com READ of A1:B1 returned CONTROL,DO_NOT_EDIT. The same editor attempted Sheets API batchUpdate updateCells B1 to TEST_ONLY_EDIT_ATTEMPT; Google rejected with HTTP 400 INVALID_ARGUMENT and explicit protected-cell edit denial. Independent owner read-back afterwards returned CONTROL,DO_NOT_EDIT unchanged.

Positive control: owner created unprotected TEST_ONLY_EDITOR_CONTROL sheetId 36110 in the same workbook. The editor account successfully wrote A1 TEST_ONLY_EDITOR_POSITIVE_PASS via Sheets batchUpdate. Independent owner read-back confirmed that value. Thus the protected write denial was not merely missing workbook Editor permission.

## Verdict and limits
EFFECTIVE PROTECTED RANGE NON-OWNER EDITOR DENIAL: LIVE PASS on isolated test workbook.
UNPROTECTED EDITOR POSITIVE CONTROL: LIVE PASS.
REAL WORKBOOK 36H protectedRange IDs were acknowledged earlier but not independently tested using editor permissions (it is not shared with non-owner). Owner remains able to edit protected ranges; Google protected sheets are NOT immutable trusted authority against owner/runtime identity. Trusted per-transaction approval issuer, replay-consuming writer and independent append-only audit are not implemented. Therefore live transaction remains HOLD.

No edits to BSE main TEST_ONLY workbook ID 1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY, Apps Script HEAD/deployment, Telegram, production/official BSE sheets or /delete. Isolated workbook retained as TEST_ONLY evidence for auditable results; removal requires separate cleanup decision.

Next: issuer architecture/code under strict TEST_ONLY and explicit authorized Script HEAD gate; do not promote protectedRange result into a production security guarantee.
