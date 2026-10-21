# GI-FIELD-UX-NONDELETE-AUTHORITY-SOURCE-DESIGN-36A

State: DESIGN CANDIDATE / READ-ONLY GATE / NO LIVE AUTHORITY BINDING.

## Inspected authority and constraints
- Canonical implementation: GitHub dzuddiyn/PILOT_OPERATION, isolated PR #156. GitHub governs source and review, not individual operational approvals.
- Google owner: dzuddiyn01@gmail.com. The isolated TEST_ONLY workbook ID is 1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY; Script ID 16y4slvh-7m4CKtz7_tqDB3gmtBw8QZ_tlsZljc7ijnm3pScEUEDjckpO.
- Existing Gate 35C approvalStore and 35D actor_verified are caller-injected mocks. No trusted live actor/approval evidence is currently bound.
- Never use TEST_ONLY_27_F PREPARED journal and APPROVED_TEST ledger as an approval source or backfill. Production and official BSE writes remain false; /delete remains deferred.

## Proposed authority architecture (NOT IMPLEMENTED)
1. Create a separate, server-controlled TEST_ONLY approval ledger in the isolated workbook, distinct from transaction INTENT/LEDGER/EVIDENCE/RECEIPT. No approval may be written by a caller-provided payload directly. Approval is a separate authorized human action.
2. Approval creation endpoint must verify trusted Google identity under an owner-controlled Apps Script session, or a separately validated Telegram callback bound to registered actor, chat and message with independent owner confirmation. Never trust request.owner_authorized, client email, actor_verified or mere Google account owner metadata as proof of a specific approval.
3. Approval record schema: approval_id, environment, workbook_id, operation, event_id, approval_source_key, ledger_source_key, approval_hash, ledger_hash, authorized_actor_id, approval_provenance, status, revision, issued_at_utc, expires_at_utc, nonce, consumed_at_utc, transaction_id, last_result. Every field must be validated and immutable where appropriate.
4. Lifecycle: PENDING -> APPROVED -> CONSUMED; alternative REJECTED, REVOKED, EXPIRED. Changes append immutable audit history with monotonic revision. Never overwrite approval provenance.
5. Canonical binding: an independently minted random nonce and approval_id, stable actor identity verified by a trusted authentication API, exact workload identity/hash, explicit expiry (proposed <=60 minutes), and one-time consumption. The same event/hash may be retried ONLY as deterministic reconciliation under one lock; conflicting values fail closed.
6. Execute: acquire one real ScriptLock -> read approval ledger and audit revision -> verify actor, status, expiry, nonce and hash -> inspect existing intent/ledger/evidence -> write deterministic TEST_ONLY transaction -> read back -> mark approval CONSUMED and append audit -> release lock in finally. A failure between writes is WRITE_OUTCOME_UNKNOWN, requiring read-only reconciliation before any retry.
7. Never allow direct access to transaction writer or caller-injected adapter. Separate trusted approval issuer from transaction consumer; server controls both and explicit allowlist only the TEST_ONLY workbook and test event namespace.

## Risks and owner decisions before implementation
- Apps Script editor Run under owner credentials proves script execution identity, NOT independent per-request human approval. It must not issue its own approval automatically.
- An ordinary editable Sheet tab is not independent if transaction callers also have edit permissions. Choose a protected authority store with authenticated write boundary and independently test editability/ownership; protection alone is insufficient against the workbook owner.
- Explicit owner approval is required before creating an approval ledger/tab, changing script permissions or installing a writer.
- Isolate generated proof and cleanup plan; do not promote historical partial data.

## Acceptance for next stage
- Fresh independent READ verifies approval ledger authority, permissions and actor binding.
- Spoofing, stale, duplicate/replay, revocation and torn-write tests fail closed.
- Atomic approval/transaction lock tested under contention.
- Separate authorized Script HEAD push and TEST_ONLY live-write gate.
- No production, official BSE, Telegram, deployment or merge in Gate 36A.
