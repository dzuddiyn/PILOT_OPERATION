# CL-06 Atomic Approval Final Gate — Synthetic Evidence (2026-10-23)

## Boundary
Source `dzuddiyn/PILOT_OPERATION`. NO live Telegram interaction, NO PILOT sheet writes, NO re-creation of pre-handover records. Pure Node VM/mock fixture.

## Results
- `node --test cl06_atomic_failure.test.cjs`: **7/7 PASS**.
- Full regression `node --test *.test.cjs`: **231/231 PASS**, zero failures.
- C1: mocked ScriptLock blocks second concurrent in-process approval.
- C2: lock releases after injected exception; retry may proceed.
- C3: subsequent synthetic attempt to use occupied plot fails closed.
- C4: crop batch source-key/orphan write guards present (source contract inspection only).
- C5: cycle end partial write assertion present (source contract inspection only; dedicated existing `gate_i_cycle_end_writer.test.cjs` executes in-memory partial readback).
- C6: orphan open allocation blocks new crop registration.
- C7: source review confirms Crop Batch uses sequential multi-sheet appends rather than a transactional Sheets operation.

## Limitation / Verdict
**CL-06 still PARTIAL, not ATOMIC PASS.** ScriptLock serializes appropriately wrapped approvals, but does not make 3–4 Sheets appends transactional or guarantee rollback after an interrupted write. C1 is simulated nested contention, not two independently scheduled live Apps Script executions. C4/C5 here inspect source rather than injecting failures into the full crop batch/transplant cores. Prior committed regression verifies one Cycle End partial-write detection. No evidence of successful atomic all-or-nothing rollback or end-to-end concurrent approval.

## Next
Design and test recoverable append-only transaction journal/prepare-commit protocol for Crop Batch, Transplant and Cycle End; only expose committed record sets to live status and reports. Do this with offline synthetic fault injection before seeking owner approval for deployment; preserve already empty handover ledgers. Data-operation smoke with real records is out of scope.
