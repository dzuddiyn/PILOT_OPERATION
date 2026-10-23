# CL-F3/F4 — Native Crop Lifecycle Proof, 2026-10-23

**Authority:** dzuddiyn/PILOT_OPERATION; PR #207 pre-card sowing occupancy guard merged as 66bc418; PR #208 in-memory native harness merged as 7a22d76.

**Local:** 6/6 pre-card tests and full 251/251 Node regression PASS. Two-stage guard: Telegram candidate pre-card blocks overlapping Plot Allocation with NEED_INFO and Malay explanation; approval core also checks fresh allocation occupancy under ScriptLock.

**Script HEAD:** `clasp push --force` succeeded 2026-10-23 18:42:50 MYT, 112 files. Fresh independent `clasp pull` 112 files, staged/pulled hashes 112/112, MISMATCH 0. No version or deployment update.

**Native Apps Script Editor (actual PILOT_OPERATION Script HEAD):** Ran `runBseClF34NativeLifecycleProof` once by Windows UI Automation at 18:44:39–18:44:41 MYT. Execution log `BSE_CL_F34_NATIVE`: 8/8 PASS, 0 FAIL, `production_write:false`.
- PLANNED_PRECARD_BLOCK
- PLANNED_NO_CARD
- TRANSPLANT_VALID
- ACTIVE_PRECARD_BLOCK
- ACTIVE_TRANSPLANT_BLOCK
- ACTIVE_HARVEST_FIRST
- ACTIVE_HARVEST_REPEAT_BLOCK
- INACTIVE_RESOW_PASS

**Independent Google Sheets post-test read:** Active PILOT_OPERATION Crop Batch 0, Planting Event 0, Plot Allocation 0, Transplant Event 0, Allocation Status Event 0, Operation Log 0. No operational records or Telegram messages written during CL-F3/F4 test.

**Honest verdict:** CL-F3 native in-memory lifecycle PASS; CL-F4 pre-card guard and its Malay user-facing response contract LOCAL PASS, but **a real Telegram bot response on occupied plot is NOT VERIFIED**, because creating an occupied plot would alter the clean handover workbook. Do not mark CL-F4 live Telegram PASS, CL-F5 Handover DELIVERED or e2e write PASS without an isolated test environment and controlled evidence. No transaction engine/schema added.
