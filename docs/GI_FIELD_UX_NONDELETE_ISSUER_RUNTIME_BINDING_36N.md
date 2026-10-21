# GI-FIELD-UX-NONDELETE-ISSUER-RUNTIME-BINDING-36N

2026-10-21. Status: LOCAL RUNTIME-ADAPTER SAFETY PASS / TRUE AUTHORITY NOT BOUND / LIVE WRITE HOLD.

Inspected canonical branch PR #156, local clean tree, Gate 36K-M issuer scaffold and repository guardrails. Added NondeleteIssuerRuntime36N.js as a dependency-injected READ-ONLY probe. The probe requires exact TEST_ONLY workbook ID and matching effective/active actor addresses, but never issues approval, authorizes a transaction, or writes Sheets.

Security principle: Apps Script Session.getEffectiveUser()/getActiveUser() may identify execution and active context, but are not by themselves proof of separate transaction-specific authenticated approval. In some invocation modes active email can be blank. An input property named explicit_user_action_proof is also caller-asserted and must NOT become authorization. All modeled paths return identity_bound=false, approval_issued=false, live_write=false. The trusted approval authority must be separately established before wiring any issuer.

Tests: 6/6 targeted PASS including identity differences, wrong workbook, absent proof, dependency errors and apparently matching identities remaining HOLD. Full Node regression 193/193 PASS; syntax PASS.

No actual Apps Script Session API binding made, so LIVE IDENTITY PROOF remains UNVERIFIED. No Script HEAD push/version/deployment, Sheets mutation, Telegram, official BSE write, merger or /delete.

NEXT: explicit scoped approval for Script HEAD READ-ONLY probe using a separately verified Apps Script identity boundary, followed by owner action-proof design. Real issuance remains blocked until server-controlled independent authentication and one-time audit persistence are proven.
