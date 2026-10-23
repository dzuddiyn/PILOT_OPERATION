# CL-H07 Controlled Recovery — Work in progress

Date: 2026-10-23, PILOT_OPERATION. Feature branch only; do not deploy this state.

## Read-only reconciliation
- BSE-TG-772258015: callback PROCESSED; PILOT_INVENTORY_EVENT contains one INVENTORY_IN Baja F, 4 set. Approval card REPORTER_CONFIRMED, but Telegram receipt not observed by owner.
- BSE-TG-772258024: callback PROCESSED; two INVENTORY_OUT rows Baja F x 1 set (M3P3, M3P4).
- BSE-TG-772258025: callback PROCESSED; two INVENTORY_OUT rows Baja F x 1 set (M1P1, M1P2).
- Do not invoke callbacks, resend writes or press Benar on these references.

## Candidate modifications (not merged, not synced)
1. Make Telegram card edit return explicit ACKNOWLEDGED versus UNVERIFIED; record fail-closed baja receipt uncertainty in approval UI last_error without retry/send.
2. Narrow normalization for /summary and /status, retaining duplicate and ambiguity rejection. New tests cover /summary M8P1,2 & M8P3 and /status M4 P1.
3. EC case BSE-TG-772258028: queue NEEDS_HUMAN_REVIEW contains multiple Measurement_Log candidates. bseApprovalDomain_ only supports a single Measurement_Log target; no approval row, no measurement or EC ledger writes. It is unsafe to route multiple candidates through a single-record review core or autoapprove. Requires explicit batch-level atomic review design / scope.

## Tests
- Targeted Baja receipt acknowledgement: 5/5 PASS.
- Targeted plot commands: 9/9 PASS.
- Complete local node suite: 259/259 PASS, no live writes.
- Apps Script HEAD / Telegram live: NOT ATTEMPTED.
- Merge/deployment: NOT STARTED.

## Outstanding safety gates
- Receipt delivery requires genuine Telegram error evidence and safe edit-only reconciliation, not blind sendMessage.
- EC needs an explicit atomic multi-measurement review contract; no partial field write.
- Targeted native regression then GitHub review before merge / HEAD sync.

## Owner-approved atomic EC decision / new source discrepancy
Owner approved one review card containing every reading and fail-closed atomic write, no partial write. Source record BSE-TG-772258028 has NINE locations: M1P1-x, M1P2-x, M2P3-blank, M2P4-3.0, M3P3-3.5, M3P4-3.5, M4P1-3.0, M4P2-3.0, M7-3.5. Persisted candidate_json contains only FIVE Measurement_Log candidates: M2P4, M3P3, M3P4, M4P1 and M4P2. Thus M7 numeric and three x/blank scopes were omitted. Approved one-card contract forbids silent loss.

Added pure fail-closed preflight (not yet hooked into live worker). Synthetic EC preflight PASS 6 assertions; whole branch Node 260/260 PASS. Existing EC_Leachate_Log batched core writes review marker, then a range setValues, then updates state. Multi-sheet operations are not guaranteed atomic on Apps Script; existing core needs explicit all-or-nothing protocol or verified recovery policy before accepting this new input. No merge or runtime sync authorized by test result alone.

NEXT implementation: design atomic batch staging/commit and read-back verified state, make pending candidates lossless, and test injected write exceptions including partial outcomes. Do not replay 772258028 or auto-approve.
## CL-H07 EC canonical batch implementation WIP (2026-10-24)
Owner-approved: EC-only shorthand M7 -> M7P3; one canonical batch write; individual readings are rebuildable derived index; fail-closed when writing status unknown. Do not apply M7 rule globally.

Added PilotEcAtomicBatch.js with pure source parsing preserving all source locations, status BLANK/NOT_MEASURED/NUMERIC, one-row canonical commit prototype, source mismatch handling and read-back proof; indexes are pure projections only. Synthetic tests:
- Canonical batch extraction 9/9 PASS.
- Write/recovery failure injection 9/9 PASS (timeout after append, then read-back ALREADY_APPLIED).
- Full Node suite 262/262 PASS.
- No Apps Script real write, Telegram send, merged PR, or HEAD sync.

CRITICAL NOT INTEGRATED:
- Controller still sends multi Measurement_Log proposals to single-target bseApprovalDomain_, so original report remains blocked.
- Final proposal reconciliation for all nine locations, including absent M7 and x/blank, needs full-source lossless conversion into canonical batch.
- Single approval card and ScriptLock ownership not yet wired. Integration tests and native regression pending.
- Existing EcLeachateTest.js two-sheet write path must not be used as the new atomic authority; redesign/adapter required.
- Canonical sheet schema/migration authorization and runtime revision validation before any sync.
State: WIP / NOT MERGED / HEAD UNCHANGED / LIVE UNVERIFIED.
## CL-H07 EC integration continuation — 2026-10-24

- Fresh GitHub main inspected: ef276b3; current feature head cc9f0eb before this continuation; local worktree clean at start.
- Owner-approved EC-only alias M7 -> M7P3, never global plot alias.
- Added source-to-candidate reconciliation: preserve all 9 source locations; match 5 numeric Measurement_Log candidates; recognize missing M7P3 as an unmatched source numeric, not a phantom saved candidate. Reject other missing/duplicate/mismatched candidates. Test 6/6 PASS.
- Added derived index rebuild **pure planner**, deterministic count and missing rows, duplicates/conflicts fail closed. Test 6/6 PASS.
- Previous canonical batch tests 9/9 PASS and timeout-after-write reconciliation 9/9 PASS.
- Full Node suite 264/264 PASS, without live writes.
- Approval controller unresolved: bseTelegramApprovalEnsureCard_ invokes bseApprovalDomain_(result), which rejects multiple Measurement_Log candidates. bseTelegramReporterConfirmationCore_ requires a single approval envelope unless candidate-indexed. Directly routing existing five candidates would violate nine-location source conservation.
- Current one-row canonical Sheet write implementation is only a prototype. Further live integration requires a versioned aggregate envelope, a single batch summary card/approval path, lock ownership and recovery of partial writes/uncertain states, plus independent actual Apps Script native harness.
- No merge, no HEAD sync, no deployment, no Telegram send, no pilot Sheet mutation. Historical BSE-TG-772258028 is NOT retried.

Status: LOCAL PASS only. HIGH-RISK RUNTIME GATE not met; do not promote to LIVE PASS or DELIVERED.
## Integration gate found
The live callback in TelegramApprovalUiTest.js uses bseApprovalEnvelopes_(aggregate) and rejects more than one envelope for a single card. Existing bseApprovalDomain_ rejects multiple Measurement_Log candidates. A true 1-card EC batch therefore still needs a new versioned aggregate approval envelope and a dedicated callback core. Neither existing multi-row EC_LeachateReviewCore_ nor existing MeasurementReviewCore_ can be reused safely as atomic authority. **Do not merge or push this branch** until replacement is complete and independent native regression can be run safely.

Continuation work: full-source candidate reconciliation 6/6 PASS, derived index recovery 6/6 PASS, complete local Node 264/264 PASS. READ-ONLY inspections only; no Sheets/Telegram writes. Historical 772258028 never replayed.
## CL-H07 EC Approval Controller — 2026-10-24 continuation

Implementation on feature branch:
- Versioned `PILOT_EC_ATOMIC` aggregate envelope built from complete original source text, with exact numeric candidate reconciliation, including EC-only M7 => M7P3 and preserved x/blank values.
- One Telegram card for nine locations with bounded batch summary, routed to canonical domain `PILOT_EC_CANONICAL_BATCH`.
- Callback verifies token, original reporter, persisted envelope hash under existing `bseReviewWithLock_` and invokes dedicated batch core.
- Dedicated core creates one idempotent canonical row, independently reads it back, updates approval state/queue and attempts edit of existing card. If Telegram acknowledgment fails, it remains UNVERIFIED; no second domain write.
- Confirmed-card reconciliation reads canonical record and edits same card only; no new send or record creation.
- Derived reading index remains reconstructible, not canonical.
- Synthetic / mocked integration test `cl_h07_ec_callback_integration.test.cjs` passes; full Node suite 266/266 PASS, 0 FAIL, no live writes.

Native TEST_ONLY attempt:
- Created separate standalone Apps Script project BSE-CL-H07-EC-TEST-ONLY-20261024 (unbound from PILOT_OPERATION Sheets/Telegram).
- Pushed only EC code, synthetic native harness and isolated environment stub to the TEST_ONLY project.
- Selected `runClH07EcNativeSyntheticRegression` through RDC editor UI and issued Run once.
- Editor displayed **Dibutuhkan otorisasi** / **Tinjau izin**; executions list showed 0 runs.
- **NATIVE PROOF BLOCKED: Google OAuth user authorization required**. Do not claim native PASS or proceed with merge/production HEAD sync based on local results.
- Human gate: explicitly authorize permissions in the isolated TEST_ONLY Apps Script editor; verify scope before granting. No authorization was accepted by assistant.

Source of truth / state:
- Branch only; no merge, no PILOT_OPERATION Script HEAD sync or official production write.
- Original EC reference BSE-TG-772258028 not replayed.
- Full live acceptance / CL-H07 remains BLOCKED until native synthetic proof and independent acceptance.
