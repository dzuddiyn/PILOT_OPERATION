# CL-H07A — Independent Acceptance Evidence
Date: 2026-10-24 MYT. Environment: isolated TEST_ONLY Apps Script, not PILOT_OPERATION.

## Sources and boundaries
Canonical repository: dzuddiyn/PILOT_OPERATION. Feature branch: fix/cl-h07-receipts-commands-ec.
Standalone Script: BSE-CL-H07-EC-TEST-ONLY-20261024.
All writes below are synthetic TEST_ONLY. No production, pilot operational Sheet, official BSE, or Telegram writes.

## Native standalone Google Sheets tests
1. 00:31:03 MYT: CL_H07A_REAL_SHEET_ACCEPTANCE: 10/10 PASS.
   Spreadsheet ID: 1ZmPCgHHZdhvdo3HeKyE48cgs9AQz5EU7m7LO_NJX4qQ.
   First canonical COMMITTED; repeated canonical ALREADY_APPLIED; one row; all 9 readings; M7P3=3.5; source mismatch and derived duplicate blocked.
2. 00:39:46 MYT: CL_H07A_REAL_FAILURE_INJECTION: SUCCESS.
   Spreadsheet ID: 1I_Dr3p_nA0RRQ0GnkS1ImuK0gGfTe2VsVpMBmUCKntQ.
   Real append occurred, simulated timeout thrown AFTER append, callback detected WRITE_OUTCOME_UNKNOWN, retry yielded ALREADY_APPLIED with one canonical row, recovered nine derived readings.
   An initial attempt FAILED due to Sheets Date/ISO and null/blank round-trip mismatch; fixed in test adapter and branch derived-index normalization, not silently ignored.
3. 00:42:42 MYT: CL_H07A_REAL_CALLBACK_TEST: SUCCESS.
   Spreadsheet ID: 1NITmCBXrlQvjwcRdZIXHXPke4aX87n67Fj7LFDamf4k.
   Dedicated callback core wrote one canonical batch with 9 readings, stored approval REPORTER_CONFIRMED and aggregate marker; reconciliation on confirmed card did not create a duplicate. Telegram transport and queue recompute deliberately stubbed, not proof of live bot delivery.

## Independent evidence: connected Google Drive API
Spreadsheet #1: PILOT_EC_CANONICAL_BATCH exactly 1 data row, EC_BATCH_V1, COMMITTED, 9 locations, M7P3.
Spreadsheet #2: same 1 canonical COMMITTED row and TEST_ONLY_DERIVED_INDEX exactly 9 data rows (M1P1, M1P2, M2P3, M2P4, M3P3, M3P4, M4P1, M4P2, M7P3).
Spreadsheet #3: same 1 canonical COMMITTED row; TEST_ONLY_APPROVAL column R=REPORTER_CONFIRMED and S=PILOT_EC_ATOMIC.

## Local regression / safety
- Current branch targeted derived-index Date/null round-trip tests PASS.
- Full node --test: 266/266 PASS, 0 FAIL.
- Evidence-only output; production_write:false and official_bse_write:false preserved.
- Existing Telegram cards and historical EC reference BSE-TG-772258028 NOT replayed.
- No Apps Script PILOT_OPERATION HEAD push or new deployment, no merge.
- Remaining proof: actual pilot Telegram card / reporter authorized callback / delivery ACK / independent post-deployment ledger read-back; third-party Telegram messaging intentionally not exercised in TEST_ONLY.
- Repository requires explicit merge authorization. Gate remains pending; PR may be prepared for review.
