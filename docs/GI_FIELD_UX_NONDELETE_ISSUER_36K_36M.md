# GI-FIELD-UX-NONDELETE-ISSUER-36K-36M

State: LOCAL SYNTHETIC PASS; TRUSTED ISSUER NOT INSTALLED; SCRIPT HEAD AND LIVE TRANSACTION HOLD.

36K: NondeleteIssuer36KLM.js implements fail-closed local issuer readiness checks: exact isolated workbook, test-only event namespace, actor verifier dependency, claimed explicit approval decision, hashes, and injected lock. Critically, even a synthetically verified actor returns ISSUER_RUNTIME_HOLD, never issues approval or mutates Sheets. This is a local issuer scaffold, not a true trusted issuer implementation. Caller may control injected identity functions; secure server-only binding has not been completed.

36L: Negative tests exercise missing identity, spoofed caller flags, decision absent, wrong workbook, missing dependencies, busy lock; transaction grant remains false.

36M: readiness explicitly states trusted_identity=false, real_issuer_installed=false, script_head_updated=false, live_transaction=false. Next real milestone is independently authenticated approval-issuer implementation and source review; a separate gate is required before any Script HEAD push or real write.

Targeted 7/7 PASS; full regression 187/187 PASS; JS syntax PASS. Previous Gate 36J isolated Google Sheets editor negative/positive protected-range proofs retained unchanged. Neither real TEST_ONLY workbook nor isolated test workbook was modified during 36K-36M.

No Apps Script push/version/deployment, Google Sheets write, Telegram, production/official BSE operation, PR merge or /delete implementation. Distinguish local model tests from live auth proof. 
