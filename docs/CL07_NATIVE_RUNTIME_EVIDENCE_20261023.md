# CL-07 — Native Apps Script Runtime Evidence (2026-10-23)

## Scope / identity
Canonical repository `dzuddiyn/PILOT_OPERATION` main, PR #200 (`05143c9`) lifecycle source guards and PR #201 (`18fe399`) read-only native harness. `PILOT_OPERATION` only, `production_write:false`, no real human approvals, no Telegram send or official BSE write.

## Script HEAD reconciliation
- Previous push PR #200: independently pulled 109/109 exact hashes.
- Attempted PR #201 `clasp push --force` initially returned network/API error; **did not blindly retry**.
- Fresh `clasp pull` revealed 110 files (including `PilotLifecycleNativeHarness.gs`); comparison to staged source **110/110 exact hashes**, zero mismatch. Therefore HEAD source state VERIFIED despite misleading push error. No Apps Script version/deployment update.

## Native UI Automation evidence
- Connected device: LAPTOP-DBGSGIEI; native Microsoft Edge Apps Script editor window named `BSE OpsMate SB PILOT_OPERATION - Editor Project - Apps Script`.
- New Editor tab opened with existing authorized script binding; target file/function confirmed in UI Automation accessibility tree.
- Ran `runBsePilotLifecycleNativeGuardTests` via selected UI function and Run invoke exactly once.
- Apps Script Editor execution log 2026-10-23 **17:35:27–17:35:29 MYT**:
  `BSE_CL07_NATIVE {"gate":"CL-07","total":7,"pass":7,"fail":0,"production_write":false}`
  Tests: FREE_NEW_PLOT, DUPLICATE_SOW_BLOCK, CROSS_BATCH_TRANSPLANT_BLOCK, BACKDATED_TRANSPLANT_BLOCK, ACTIVE_HARVEST_ALLOWED, DUPLICATE_HARVEST_BLOCK, CYCLE_END_FREES_PLOT.
- Ran `runBseI011FullRegression` via selected UI function and Run invoke exactly once.
- Native Apps Script Editor execution log 2026-10-23 **17:36:45–17:36:59 MYT**:
  `BSE_I011_FULL_REGRESSION` start 2026-10-23T09:36:47.879Z, finished 09:36:58.953Z; **total 48, passed 48, failed 0, production_write false**; UI execution completed.
- Baseline fresh local Node `node --test *.test.cjs`: **224/224 PASS**. JS syntax and diff check PASS.
- `clasp run` still fails with Execution API permission error; native Editor UI bypasses this unsupported execution path without changing OAuth or deployment.

## Independent post-test operational ledger read-back
Read connected Google Drive spreadsheet (ID `1gbuxsuXMWaV7IKv8l5Hnr_VlVBNpWAQ4H4E9Pp4xqDs`) after native tests, READ-ONLY:
- `PILOT_CROP_BATCH` 18 rows,
- `PILOT_PLANTING_EVENT` 18,
- `PILOT_PLOT_ALLOCATION` 30,
- `PILOT_TRANSPLANT_EVENT` 14,
- `PILOT_ALLOCATION_STATUS_EVENT` 27,
- `PILOT_OPERATION_LOG` 12.
Counts match pre-test audit; **row-count parity does not prove cell-level content identity**. Native harness implementation uses in-memory arrays and no Sheet writes.

## Verdict and remaining gates
- **CL-07 NATIVE RUNTIME PASS (7/7 targeted + 48/48 full regression); Script HEAD VERIFIED (110/110); independent post-test count audit PASS.**
- Does **NOT** prove end-to-end Telegram live denial, true concurrent approvals/atomic multi-sheet write, or reconcile historical conflicts. CL-06 remains PARTIAL, CL-08 HANDOVER PENDING.
- Previously detected overlap still requires controlled human reconciliation with field evidence: M5P1/2, M5P3/4, M7P3, M3P1/2; M7P3 has two `HARVEST_START` rows.
- No alteration/auto-selection of historical records is authorized.
