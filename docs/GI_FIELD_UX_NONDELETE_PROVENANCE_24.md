# GI-FIELD-UX-NONDELETE-PROVENANCE-24

State: SYNTHETIC LOCAL PASS; NOT LIVE INTEGRATED.

CommitProvenanceTest.js provides a TEST_ONLY injected-store commit-time provenance model. It validates explicit approval and candidate/ledger identity, persists and reads back a PREPARED intent before creating a new synthetic ledger record, reads back the ledger, persists and reads back exact commit evidence, then marks intent COMMITTED. Existing legacy ledger without prepared intent is rejected rather than retroactively linked. Matching replay resumes after injected write crashes without duplicating ledger or commit evidence.

Nine targeted tests include end-to-end commit evidence to existing ReceiptReconcileTest.js, idempotent replay, historical backfill rejection, three post-write crash points, ledger conflict, approval guard and environment denial. Pure in-memory store only.

Limitations: No actual Apps Script canonical writer integration, lock, Google Sheets durable transaction, Telegram callback, independent authentication of verified evidence, or outbound receipt dispatch. This is a synthetic protocol model; caller provided authorization/status is not independent security proof. Does not establish a live receipt or production-ready reconciliation. PR #156 remains DRAFT and release HOLD.

Individual delete remains DEFERRED in PR #155. No Google Sheets/Telegram writes, no clasp push, merge or deployment.
