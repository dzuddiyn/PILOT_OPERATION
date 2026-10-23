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
