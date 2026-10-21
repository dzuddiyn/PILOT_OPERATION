# 36O-36Q: runtime probe candidate and real authority gaps

Status: PREPARED ONLY. Script HEAD / live approval / live transaction: NOT STARTED.

## 36O
Prepared NondeleteIdentityHead36O.js for read-only Session identity diagnostic, guarded against wrong workbook, missing active identity and runtime exceptions. It returns no personal email, does not issue approvals or mutate Sheets. It must be reviewed and pushed into the isolated TEST_ONLY bound Apps Script only under explicit SCRIPT HEAD approval. Local VM tests do not prove real Apps Script runtime identity.

## 36P
BLOCKED on authenticated transaction-specific owner approval source. Session.getActiveUser email may be missing, and Script editor Run with effective owner is not an approval event. A real issuer must require distinct and verifiable owner action, exact payload hashes, scope, nonce, expiry and append-only audit, not any injected verifyActor() boolean or protectedRange owner edit. No real issuer implementation may claim PASS until this is bound.

## 36Q
BLOCKED on actual issuer authority and atomic state transitions. Existing four transaction tabs and two approval/audit tabs are in the isolated workbook. Do not backfill the historical partial test fixture. Atomic TEST_ONLY transactions, single ScriptLock, one-time consumption and crash reconciliation still need dedicated tests and explicit approval. No live write was performed.

## Gates
A: Script HEAD READ-ONLY identity probe push/run only (independent approval).
B: Real TEST_ONLY issuer/transaction writes only after A and safety verification (separate approval).
Neither authorizes deployment, Telegram, official BSE data changes, PR merge or individual /delete.

All decisions remain fail-closed. No escalation of source authority from GitHub to Sheets.
