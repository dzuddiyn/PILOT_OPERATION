# GI-ADMIN-RBAC-TRANSACTION-V02-LOCK-01 — Owner-approved design baseline

**Approved 2026-10-19. DESIGN LOCK ONLY. NOT IMPLEMENTED OR TESTED.** This document supplements `GI_ADMIN_RBAC_DESIGN_V01_LOCK_20261019.md` (Option B) and `GI_ADMIN_RBAC_AUTHORITY_LOCK_20261019.md`. All 29 synthetic fault scenarios MUST pass before any live migration, actual ADMIN grant or revoke. A separate implementation authorization and explicit PR merge authorization remain mandatory.

## Scope and source inspection

Canonical source: `dzuddiyn/PILOT_OPERATION` `main` at `32714c92ff5f1cf367e43785c3138ded504846a5`. Actual `TelegramRegistrationTest.js` uses `LockService.getScriptLock().tryLock(1000)` and multiple `setValues()` before `SpreadsheetApp.flush()`; `TelegramApprovalUiTest.js` persists callbacks and marks worker rows PROCESSED after processing. Existing `OwnerRegistryTest.js` `bseTestOwnerForTelegramUser_` grants `ok:true` to an active matched owner registry row without distinguishing immutable bootstrap OWNER from projected ADMIN. No RBAC ledger implementation exists. Apps Script lock/flush do NOT provide multi-row or multi-sheet ACID guarantees.

**Boundaries:** `production_write:false`, `official_bse_write:false`; no owner/admin/user permission changes; Telegram group admin unrelated. Existing Apps Script runtime and sheets are unchanged.

## Invariants (mandatory)

- I01: Bootstrap OWNER is immutable and independently pinned; only a confirmed owner-only private-message callback may grant/revoke ADMIN. Admin has legacy OWNER operational rights except role management/OWNER mutation.
- I02: REGISTERED_ACTIVE private identity is mandatory for an ADMIN; registration alone grants no elevated role.
- I03: INTENT_OPEN/CONFIRMED/PREPARED/COMMIT_PENDING are not sufficient to grant permission. COMMITTED row is necessary, but not sufficient without a validated contiguous chain and current registration.
- I04: Every transaction uses stable operation/intent/idempotency IDs independent of callback_id/update_id.
- I05: All role writers obey the same ScriptLock, re-read state inside critical section and validate expected revision before a single role transaction. ScriptLock does not stop human edits or unrelated scripts.
- I06: Conflicting same-revision events, duplicate IDs with divergent payload, invalid chain, missing authoritative ledger or invalid row => SOURCE_MISMATCH/REVISION_CONFLICT and deny elevated access.
- I07: WRITE_OUTCOME_UNKNOWN triggers actual-state reconciliation, NEVER blind re-append or fake success.
- I08: A durable validated owner-confirmed revoke barrier blocks elevated rights until final revoke reconciliation. A transient Telegram message alone is not a barrier. Unknown/corrupt barrier state => deny elevated access. Barrier durability/reader coherence remain to prove with tests.
- I09: No stale role cache or legacy `is_admin` can override ledger. Privileged actions must re-authorize immediately before side effects.
- I10: Audit is append-only history; failed notification does not change authorization truth. Never delete original records while reconciling.
- I11: Telegram UI success only after WRITE, READ BACK and independent VALIDATE. Status `APPLIED_VERIFIED` is a read-back outcome, not a raw editable cell value.
- I12: An integrity hash detects corruption but does not prove authenticity, atomicity or protection from manual Sheet editing.

## Proposed PILOT-only schema (not created)

`PILOT_ROLE_CHANGE_INTENT`: intent_id, operation_id, actor_owner_id, target_user_id, action, expected_revision, created_at_utc, expires_at_utc, confirmed_at_utc, confirmation_callback_id, intent_state, last_error, identity_binding_hash.

`PILOT_ROLE_GRANT_LEDGER`: event_id, operation_id, intent_id, actor_owner_id, target_user_id, action (GRANT_ADMIN/REVOKE_ADMIN), previous_role, next_role, revision, previous_event_hash, event_hash, event_state (PREPARED/COMMITTED), recorded_at_utc, committed_at_utc, idempotency_key, source_registration_fingerprint. Single event row and state transition minimize cross-sheet dependencies but are not atomic. Reader rejects incomplete/torn rows.

`PILOT_ROLE_CHANGE_AUDIT`: audit_id, operation_id, actor_id, target_id, action, stage, observed_revision, observed_event_hash, outcome, error_code, observed_at_utc, independent_readback_evidence. Audit is not authorization authority.

`PILOT_ROLE_REVOKE_BARRIER` (proposed durable deny-only mechanism): target_id, operation_id, confirmed_owner_id, observed_revision, barrier_state, identity_binding_hash, recorded_at_utc. Conservative resolver rejects elevated access if a credible unresolved barrier exists, if its integrity cannot be established, or if the barrier source is unavailable. Barrier is not a source of ADMIN grants. Precise atomic creation/reader-observation semantics are an OPEN implementation proof obligation.

## Transaction state machine

INTENT_OPEN -> CONFIRMED -> PREPARED -> COMMITTED -> APPLIED_VERIFIED (grant); revoke uses REVOKED_VERIFIED following read-back. Terminal/hold states: CANCELLED, EXPIRED, DENIED, REVISION_CONFLICT, SOURCE_MISMATCH, WRITE_OUTCOME_UNKNOWN. Confirmation, PREPARED and COMMITTED do not independently imply visible SUCCESS; the resolver validates the full chain and barriers.

Grant: check bootstrap owner/private chat and target active; lock; re-read canonical registration/ledger/intents, detect prior operation; CAS expected revision; append PREPARED; flush + read back fields; transition same row COMMITTED; flush + read back chain; independently resolve role; only then notify. On timeout reconcile actual state under lock before any retry. Release lock in finally.

Revoke: first establish/read-back durable deny-only barrier after authenticated confirmation; if outcome unclear, elevated access must not be considered reliably authorized. Under shared lock reconcile chain; append/commit revoke using same protocol; read back; ensure ADMIN access denied; close barrier only when safely verified. Do not claim instantaneous revoke if a reader can bypass or cache the barrier.

Reader: resolve immutable bootstrap OWNER separately; otherwise validate registration, ledger complete contiguous revision/event hashes, no conflict, valid committed latest role, and deny-only revoke barriers. Any unavailable/conflicted required authority yields DENIED/UNVERIFIED; no fallback to legacy owner registry or cached admin role.

Recovery: exact same operation+verified committed event => ALREADY_APPLIED/ALREADY_REVOKED; PREPARED => explicit consistency checks before resuming; partial/corrupt row => freeze and manual review; lost callback response => re-read not reapply; notification failure => retry transport only; audit failure => truthfully report partial audit without inventing PASS. Never overwrite historical lineage.

## 29 required synthetic fault scenarios (SPECIFIED, NOT EXECUTED)

| ID | Injected condition | Required expected evidence |
|---|---|---|
| F01 | Duplicate callback | One grant, second NO_CHANGE |
| F02 | ADMIN attempts grant | DENIED, zero privilege write |
| F03 | MEMBER attempts grant | DENIED, zero privilege write |
| F04 | Expired confirmation | DENIED before commit |
| F05 | ScriptLock unavailable | No role write, bounded retry only after inspection |
| F06 | Append fails before persistence | No new privilege; verify actual rows |
| F07 | Append persists but timeout | WRITE_OUTCOME_UNKNOWN then reconciliation, no duplicate |
| F08 | Read-back unavailable | UNVERIFIED, no new privilege |
| F09 | PREPARED lacks committed transition | Not authorized |
| F10 | Commit persisted but response lost | Independent read-back => ALREADY_APPLIED |
| F11 | Two simultaneous grants | One valid revision, conflict for other |
| F12 | Concurrent grant and revoke | Serialized revision and safe final effective role |
| F13 | Audit append fails | No fabricated audit PASS, reported as incomplete |
| F14 | Telegram notification fails | No extra role write, notification separate |
| F15 | Legacy registry differs from canonical ledger | SOURCE_MISMATCH / fail closed |
| F16 | Reader encounters PREPARED event | DENIED for uncommitted grant |
| F17 | Same event ID diverging payload | Integrity failure and freeze |
| F18 | Stale cached ADMIN after revoke | Fresh resolver denies |
| F19 | Target becomes inactive | No new grant / elevated access denied |
| F20 | OWNER identity mismatch | DENIED, zero role write |
| F21 | Sheet authority unavailable | Deny privileged ledger-dependent operation |
| F22 | Crash between PREPARED and COMMITTED | Deterministic reconcile, no phantom grant |
| F23 | Two distinct events same revision | REVISION_CONFLICT, freeze |
| F24 | Crash after valid grant before Telegram success | Already-applied proof, no duplicate |
| F25 | Partial/torn ledger row | Reject corrupted event, no privilege |
| F26 | Reader overlaps writer critical section | No torn role state accepted |
| F27 | Owner-confirmed revoke stuck mid-commit | Durable barrier blocks elevated access |
| F28 | Derived projection stale after revoke | Canonical ledger wins, deny |
| F29 | Old controller trusts owner.ok without role check | Forged ADMIN cannot manage role/OWNER |

For EACH scenario: capture fixture before, injected fault point, operation ID, write attempts, raw after-state of intent/ledger/barrier/audit, resolved role at privilege boundary, expected/actual, independent evaluator verdict and no TEST/official BSE writes. Mock-only PASS may be marked LOCAL PASS, never LIVE PASS.

## Precise code diff proposal (not applied)

- ADD `PilotRoleGrant.js`: validated ledger schema, shared writer lock, revision/operation ID reconciliation, PREPARED/COMMITTED transition.
- ADD `PilotRoleResolver.js`: immutable bootstrap OWNER, strict effective role, fail-closed validation.
- ADD `PilotRoleRevocation.js`: durable deny-only barrier and crash recovery.
- ADD `TelegramRoleAdmin.js`: /users, owner-only two-step confirmation, replay-safe callbacks.
- MODIFY `OwnerRegistryTest.js`: adapter for legacy owner calls without confusing owner.ok and can_manage_admins.
- MODIFY `TelegramRegistrationTest.js`: registration-only authority; separate role resolution.
- MODIFY `TelegramApprovalUiTest.js`, `TelegramHistoryTest.js`, `TelegramRetrievalTest.js`, Evidence/Queue/Report/Digest call sites: explicit capabilities and fresh rechecks.
- ADD `tests/pilot_role_transaction_faults.test.cjs`: isolated F01-F29, independent state evaluator, concurrent fake Sheet and partial-write fixtures.
- ADD migration plan separately before schema deployment; no direct mutation of existing OWNER rows or historical approvals.

## Gates and truthful status

- **LOCKED BY USER:** transaction design baseline v0.2 and requirement for all 29 synthetic tests before ANY role migration or live grants.
- **NOT LOCKED AS PROVEN:** true partial-write safety, revoke-barrier durability, cross-execution coherence, protection from external manual edits. Must be demonstrated before implementation/cutover.
- **NOT AUTHORIZED:** implementation, schema writes, changes to role/permissions, clasp push, deployment, live fault injection, production or official BSE write.
- **GIT:** design documentation may enter feature branch/PR; merging PR requires separate owner instruction under AGENTS.md.
- **OVERALL:** PILOT functional parity IN PROGRESS — NOT DELIVERED.
