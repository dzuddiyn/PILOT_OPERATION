# BSE-UX-CLOSEOUT-01 — Independent PILOT_OPERATION Sowing UX Read-back

Date: 2026-10-23 (MYT)
Reference: `BSE-TG-772257731`
Environment: `PILOT_OPERATION` (shadow pilot, not official BSE production)
Evidence source: direct read-only Google Sheets connector search on spreadsheet `BSE_OpsMate_SB_PILOT_OPERATION`, ID `1gbuxsuXMWaV7IKv8l5Hnr_VlVBNpWAQ4H4E9Pp4xqDs`, scan A1:Z1000 of each named sheet.

## Independently observed
- `PILOT_CROP_BATCH` row 19: exactly 1 match for source `BSE-TG-772257731|Crop_Batch_Log`, batch `BSE-SB-CB-20261023-003`, event date 2026-10-23, Timun / 7055 CCB, `BATCH_START`, `PROPOSED`, `PROVISIONAL`.
- `PILOT_PLANTING_EVENT` row 19: exactly 1 match, same source and batch, `SEED_SOWING`, seed quantity `200`, unit `g`, `PROVISIONAL`.
- `PILOT_PLOT_ALLOCATION` rows 30 and 31: exactly 2 matches, same source and batch, distinct `M3P1` and `M3P2`, both `PLANNED` and `PROVISIONAL`.
- All four domain rows share payload hash `71e969e5f77bc382e24657892c2d86f4573db5ff3f94d3b1a244158474e183e7`, approval timestamp `2026-10-22T23:54:29.770Z`, reviewer `dzuddiyn`.
- `PILOT_TELEGRAM_APPROVAL_UI` row 124: exactly 1 match, `REPORTER_CONFIRMED`, acted at `2026-10-22T23:54:35.213Z`; approval payload hash is separate from domain canonical payload hash and must **not** be assumed equal.
- User supplied a directly observed Telegram receipt: `REKOD SEMAIAN DISIMPAN`, date 23/10/2026, Timun (7055 CCB), M3P1 and M3P2, quantity 200 g, 1 batch + 1 planting event + 2 plots, `Status plot: Dirancang`, `Pengesahan: Disahkan pelapor`.
- The older `Status semakan: Sementara (belum diverifikasi)` line is absent from the supplied new receipt; backend `PROVISIONAL` is preserved. No claim of field verification.

## Verdict and boundaries
**PASS — source-scoped independent read-back**: exact 1+1+2 domain rows and one reporter-confirmation approval row, no duplicate for this reference in the scanned sheet bounds; values and common lineage match.
**PASS — user-observed Telegram UX**, reported by owner, corroborating saved ledger facts.
**Previous implementation proof:** PR #180 merged to main at `a913a8f0b8dfd6242b1f04f17a1aa2819b707c78`; 10/10 focused Node tests passed and `TelegramApprovalUiTest.js` was byte-identical between Script HEAD and merged main.
**Limits:** no new production write, no replay of Telegram callback, no field verification, no formal BSE production deployment. The dedup claim covers this reference and the three named domain sheets, not arbitrary other storage.
**Safety:** `production_write:false` and `official_bse_write:false` remain unchanged. Documentation-only closeout.
