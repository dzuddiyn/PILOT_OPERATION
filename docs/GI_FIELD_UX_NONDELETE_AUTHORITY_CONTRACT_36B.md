# GI-FIELD-UX-NONDELETE-AUTHORITY-CONTRACT-36B

Status: LOCAL CONTRACT PASS; LIVE TRUSTED AUTHORIZATION HOLD.

Basis: Gate 36A authority design in docs/GI_FIELD_UX_NONDELETE_AUTHORITY_SOURCE_DESIGN_36A.md and repository AGENTS.md. GitHub is source-code authority, not approval issuer. No independent server-controlled approval issuer is currently bound.

Contracts added in AuthorityContract36B.js:
- Scope: exact isolated TEST_ONLY workbook ID and TEST_ONLY_36_ event namespace.
- Actor identity: actor_id and verified_by are required fields, but the injected actor fixture is NOT trusted authentication. Caller-controlled proof remains insufficient.
- Identity: approval_id, nonce and 64-character source hashes must have valid shapes.
- Freshness: issue and expiry times valid, lifetime at most 60 minutes, no past expiry or future issue.
- Lifecycle: PENDING may advance to APPROVED, REJECTED, REVOKED or EXPIRED; APPROVED to CONSUMED, REVOKED or EXPIRED. Monotonic revision and stable approval ID and nonce required. Terminal replay is denied.
- All results are non-write statuses CONTRACT_VALID_HOLD or VALID_TRANSITION_HOLD, never a grant.

Targeted Node tests 6/6 PASS. Full Node regression 169/169 PASS. JS syntax check PASS. These are LOCAL SYNTHETIC results only; they do not prove a server-controlled actor, append-only audit, persistent one-time nonce consumption or concurrency on real Apps Script.

No Apps Script HEAD push, runtime execution, deployment, Google Sheets write, Telegram action, PR merge or /delete changes. Historic Gate 27 partial fixture untouched.

NEXT: Gate 36C — implement and test immutable audit/replay protocol against isolated synthetic storage; do not enable live transaction writes before independent authority and separate approval.
