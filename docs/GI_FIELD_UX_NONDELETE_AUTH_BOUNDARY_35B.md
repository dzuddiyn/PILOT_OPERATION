# GI-FIELD-UX-NONDELETE-AUTH-BOUNDARY-35B

Status: LOCAL SAFETY PASS / REAL AUTHORITY UNBOUND / LIVE TRANSACTION HOLD.

Implemented NondeleteAuthorizationBoundary35B.js as a synthetic fail-closed boundary: request.owner_authorized and request.approval_status are NOT accepted as authority. A separate authSource.verify contract must return VERIFIED, owner_approved=true, exact TEST_ONLY environment and workbook and exact five request identity attributes. Missing source, failed read, pending/mismatched proof or lock contention denies; even valid injected proof returns AUTH_VERIFIED_TRANSACTION_HOLD with no writes.

A mock authSource is NOT a trusted runtime authorization service. A caller controlling dependencies could forge proof. No Apps Script callable transaction entrypoint exists. Before live write, the verifier must bind to independent server-controlled approval records, verify immutable source/actor, revision/hash, expiry and replay controls and perform verification plus transaction atomically under one real LockService lock. Then review explicitly before adding write capability; never use this synthetic verifier as production authority.

Five targeted tests PASS: forged request, apparently verified proof still HOLD, mismatched proof, source error and busy lock. Full Node regression 151/151 PASS. JS boundary syntax PASS. No Apps Script push, deployment, Sheets write, Telegram or /delete changes. Gate 27 PREPARED fixture untouched. PR #156 remains DRAFT. 
