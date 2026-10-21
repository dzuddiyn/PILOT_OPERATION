# GI-FIELD-UX-NONDELETE-RUNTIME-ENTRYPOINT-32

State: LOCAL SYNTHETIC PASS / PACKAGE UPDATED / SCRIPT HEAD NOT PUSHED.

Added NondeleteRuntimeEntrypoint32.js. The zero-argument bseNondelete32ReadOnlyProof() passes real Apps Script global SpreadsheetApp and LockService to the existing guarded Gate-30 bseNondelete30Runtime_ through a testable dependency injection function. It requests environment TEST_ONLY, production_write=false, official_bse_write=false, confirmed synthetic fixture TEST_ONLY_30_ENTRYPOINT_32 and exact Gate-27 workbook ID. No mutation code, triggers, Telegram or callbacks.

Isolated package path: C:\Users\USER\OneDrive\Documents\GitHub\GI_NONDELETE_HEAD31_TEST_ONLY
- NondeleteRuntimeEntrypoint32.js SHA256 C041148D50809114A8FC0028E69F3795BB2F5292531AF6BE4F00FA0EB208A489
- NondeleteRuntimeHarness30.js SHA256 DBE649E98596F057F85E2507AB426D47300B0AABB12697D5C8347359FE9D20C3
- NondeleteSheetsAdapterTest.js SHA256 5BFB06FDE704252831D646E880B6649A52E9F43926608F7C0DD916EC0482E898
- appsscript.json SHA256 7549872DF77418ACEC22DAD4A13C6A6820D3176D4C0B9CA73564B11B8302A7D2
- .clasp.json SHA256 57C5D0BB27428C5970099D695E5AAB2538FAD4082AF45587C9251E77487503A5

Static local checks: targeted 3/3 PASS, full Node regression 141/141 PASS, JS syntax 75/75 PASS. No live Apps Script function execution, permissions consent or live LockService verification. A runtime read-only test still requires separate Script HEAD authorization and Apps Script access; the Google Sheets OAuth scope has technical write capability despite the code's read-only behavior.

Bound target Script ID 16y4slvh-7m4CKtz7_tqDB3gmtBw8QZ_tlsZljc7ijnm3pScEUEDjckpO; exact Gate-27 parent workbook ID 1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY verified earlier. Before any Script HEAD push, fresh-read metadata and remote content and obtain separate explicit owner approval.

The Script HEAD remains unchanged; no clasp push, deployment, workbook write, Telegram or merge. PR #156 draft; delete PR #155 remains DEFERRED.
