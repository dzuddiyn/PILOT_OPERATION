# GI-FIELD-UX-NONDELETE — 36P UI BUILD SYNTHETIC

Date: 2026-10-21. Execution scope: **LOCAL SYNTHETIC DEVELOPMENT ONLY**. Locked authority mode `authority_mode_36p.lock.json` remains authoritative. No Script HEAD push, OAuth modifications, Web App deployment, Google Sheets mutation, owner approval issuance or live transaction.

## Real inputs inspected
- Canonical `dzuddiyn/PILOT_OPERATION` main fetched, `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/PILOT_OPERATION_EXECUTION_PATH.md`, `ACTION_PLAN.md` and `docs/DEVELOPMENT_STATUS.md` read. Worktree was clean at entry, draft PR #156 at `8d0c8b4628cc2fb0c1304a1a6afe4a6e0f35453a`.
- Live owner-connected Google Sheet read-back: `TEST_ONLY_NONDELETE_APPROVAL_AUTH` and `TEST_ONLY_NONDELETE_APPROVAL_AUDIT` each contained only the header row. Existing historical partial fixture MUST NOT be backfilled.
- 36O previously showed live Google Session identity MATCH, not per-transaction approval. Ed25519 36P component remains optional, no trust anchor provisioned.

## Deliverables
- `NondeleteApprovalUi36P.html`: standalone HTMLService-style UI template in Malay. Requires explicit `Semak` followed by `Luluskan` or `Tolak`, displays event, operation, canonical source keys and SHA-256 hashes; distinguishes TEST_ONLY SYNTHETIC; safe `textContent` rendering and accessible status/focus, no auto-approve. Approval buttons remain disabled until synthetic challenge load succeeds. If a server bridge is absent, UI fails closed. **Not yet bound to live Apps Script endpoints.**
- `NondeleteApprovalUiSynthetic36P.cjs`: Node synthetic challenge/decision backend only, fixture-injected identity and canonical transaction source (NOT Google authentication). Supports BAJA and CENSUS only, exact isolated workbook, enforced owner fixture, nonce minted via `crypto.randomBytes(24)`, 10-minute challenge expiry, server-owned transaction digest and nonce, decision rechecks actor/expiry/nonce/source, one active challenge per event, conflict/replay/idempotency handling, synthetic-only hash-chain audit and quarantine on possible partial audit append. In-memory `SIM_APPROVED_ONLY` is **not** an actual approval; `approval_issued:false`, `transaction_write:false` in all outcomes. Lock is fixture-only, not Apps Script ScriptLock.
- `approval_ui_synthetic_36p.test.cjs`: targeted security suite, negative cases and synthetic UI-to-backend test via mocked `google.script.run`. No browser site/network or Google Sheets writer is used.

## Verification / acceptance
- Targeted synthetic UI+backend suite: **23/23 PASS** (including id spoof, changed canonical record after preview, double challenge, expired nonce, double/replayed decision, conflicting decision, lock contention, torn write/quarantine, audit hash shape, UI safe rendering and explicit click).
- Full repository Node regression **258/258 PASS**, including all existing suites, zero failures. Targeted **23/23 PASS**, Node syntax checks for service/test PASS.
- Cryptographic nonce/digest are exercised in Node. **These tests do NOT prove** human presence, authenticated Google account identity, cross-instance durable replay protection, real ScriptLock, independent audit anchor, Apps Script HTMLService integration or actual live approval.
- No real approval ledger rows, Script deployment/version or production/official BSE state are changed.

## Architectural blockers before any live issuer
1. Decide and implement server-only Google Session authenticated endpoints, accessible under owner-only execute-as-user Web App; no public approval endpoints or deployment have been authorized.
2. Design durable nonce/approval authority with real lock, permission separation, independent immutable audit anchoring and crash/read-back reconciliation. Local Map and chained hashes are not external audit.
3. Verify true UI action/transaction binding and anti-replay against multiple clients/sessions, then request scoped Script HEAD and Web App deployment separately.
4. Each real TEST_ONLY approval/transaction additionally requires explicit owner transaction-specific decision. `/delete` remains DEFERRED.

**NEXT:** `36P-APPROVAL-AUTHORITY-REVIEW` (read-only architecture and threat review before considering any Apps Script HEAD integration). Keep live-write HOLD.
