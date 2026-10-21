# GI-FIELD-UX-NONDELETE 36O — Script HEAD read-only identity probe

Date: 2026-10-21. Authorized explicitly: LULUS 36O SCRIPT HEAD READ-ONLY. Scope excludes any Sheet transaction, approval issuance, deployment update and production writes.

Target TEST_ONLY Apps Script ID: 16y4slvh-7m4CKtz7_tqDB3gmtBw8QZ_tlsZljc7ijnm3pScEUEDjckpO.
Preflight: clasp v3.4.1. Clasp status listed four original source files. Independent remote snapshot clasp pull retrieved four files; appsscript.json, NondeleteRuntimeEntrypoint32.js, NondeleteRuntimeHarness30.js and NondeleteSheetsAdapterTest.js hashes ALL MATCHED local staging before push.

Applied: copied ONLY NondeleteIdentityHead36O.js from canonical PR #156 into isolated clasp staging; local checksum MATCHED source (SHA-256 06CA600C8499773FCD157B02C6E12C630AE2AD5BEADFC6969ED2CE73B2EF9407). clasp push acknowledged five files at 7:26:25pm. Fresh independent clasp pull in separate temp snapshot retrieved five files, and all five SHA-256 hashes MATCHED local staged sources.

LIVE FUNCTION INVOCATION: clasp run bseNondelete36OLiveIdentityReadOnly_ returned 'Unable to run script function. Please make sure you have permission to run the script function.' Therefore function execution and live Session identity proof are NOT VERIFIED; no identity results should be claimed. Do not equate Script HEAD push with invocation or deployment update.

States:
SOURCE UPDATED ✅; SCRIPT HEAD UPDATED ✅; INDEPENDENT HEAD READBACK ✅; SCRIPT VERSION CREATED NO; DEPLOYMENT UPDATED NO; LIVE IDENTITY PROOF BLOCKED / UNVERIFIED; APPROVAL ISSUED NO; SHEETS TRANSACTION NO; TELEGRAM NO; MERGE NO.

NEXT: diagnose Apps Script function execution permission/invocation through a controlled read-only route. No wider OAuth/API activation, webapp deployment or authorized transaction grant is implied.
