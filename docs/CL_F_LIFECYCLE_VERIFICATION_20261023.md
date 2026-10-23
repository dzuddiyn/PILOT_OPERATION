# CL-F1/F2 — Crop Lifecycle Guard Verification (2026-10-23)

Roadmap CL-F1…CL-F5 owner LOCKED. Canonical source: dzuddiyn/PILOT_OPERATION. No pilot operational Sheet records were written; no new schema, transaction engine or queue.

## F1 truth
14 isolated in-memory lifecycle cases (Node VM), initial **12 PASS / 2 FAIL**, found:
1. Reallocation transplant: approved PLANNED source allocation M1P1 → free destination M2P1 incorrectly rejected by occupancy guard because code searched destination for existing PLANNED allocation.
2. Historical HARVEST_START on a closed prior cycle incorrectly blocked a new active cycle on the same physical plot, despite sow date later than old start.

## Minimal corrections
- Permit explicit reallocation only if exactly one matching PLANNED source allocation exists, destination is empty, batch matches and event date is >= source sow date. Regular transplant path unchanged.
- Harvest duplicate check ignores earlier harvest-start rows whose event date predates **current cycle sow date**; undated prior rows remain fail-closed.
- No changes to PILOT_OPERATION data, core review approval, ScriptLock, runtime environment binding or Telegram queue.

## F2 synthetic evidence
- Targeted `cl_f_lifecycle_matrix.test.cjs`: **14/14 PASS** after fix.
- Full Node regression: **245/245 PASS, 0 FAIL**, syntax and git diff --check clean.
- Coverage includes PLANNED/ACTIVE no double sow, wrong-batch or repeated transplant block, backdated transplant block, start harvest unique, inactive resow, multi-plot conflict, reallocation path and historical harvest.
- **Not yet proven:** Telegram pre-card user feedback, native Apps Script execution of changed code, end-to-end field write/read/status, cross-runtime time-of-check concurrency. These remain CL-F3/F4 gates.
- This is not a claim of full transactional atomicity; no new transaction engine is proposed.

## Handover boundary
Operational ledgers remain zero / previous reset not undone. Do not add synthetic records to active handover sheets.
