# Gate D — Intentional Empty Baseline Authority Reconciliation
Date: 2026-10-15
Environment: PILOT_OPERATION
State: REVIEWED / AWAITING CANONICAL MERGE (this file), runtime proof already collected

## Decision / source of authority

PILOT_OPERATION starts with an **intentionally empty operational crop lifecycle**. Zero active Crop Batch, Plot Allocation, Transplant Event, Plot Reallocation Event, and Allocation Status Event records are **EXPECTED_EMPTY**, not corrupt, missing data, failed migration, or proof that nothing is currently planted in the field. Do not import historic PILOT_TEST or synthetic rows. New operational facts must arise from separately verified genuine field reports and follow the review/provenance flow. This is not permission to create empty test crop records.

The repo remains implementation authority, original Drive configuration CSVs remain reference-source authority, the PILOT_KB_* sheets are derived read-only reference indexes, and PILOT_* operational sheets are new pilot operational state. A design capacity or crop catalog entry does not imply an active crop batch or a current physical device state. No authority is silently moved.

## Read-back evidence — 2026-10-15

Sheet: PILOT_OPERATION reserved workbook.
- PILOT_CROP_BATCH: header only (0 data rows).
- PILOT_PLOT_ALLOCATION: header only.
- PILOT_TRANSPLANT_EVENT: header only.
- PILOT_PLOT_REALLOCATION_EVENT: header only.
- PILOT_ALLOCATION_STATUS_EVENT: header only.
- PILOT_OWNER_REGISTRY: one owner/admin record.
- PILOT_KB_PLOT_REGISTRY: 31 reference entries.
- PILOT_KB_INFRASTRUCTURE: 9 reference entries.
- PILOT_RUNTIME_BINDING_AUDIT: environment PILOT_OPERATION; spreadsheet/evidence bound; automation OFF; webhook inactive at audit time; production_write FALSE; official_bse_write FALSE.
- Site B structured KB controlled outbound Telegram proof: 4 acknowledged replies (message IDs 10–13); tank M5 runtime check PASS (M5.1 and M5.2); full Apps Script regression 47/47 PASS. These proofs **do not establish** that general Telegram receive/polling transport is safe.
- Script HEAD restored to matching merged main aeb1e5c; independent clasp pull 55/55 matches, temporary proof helper absent (verified before this docs-only change).

## Gate D closure semantics

Acceptance of an empty **new** operational baseline is conditional on:
1. Explicitly acknowledging the expected absence of verified live crop state;
2. Retaining a verified, isolated owner/administrator identity and existing runtime bindings;
3. Keeping reference knowledge separate from live operational facts;
4. Not asserting an actual crop, transplant, or device state;
5. Enforcing Gate E transport controls **before** the first operational message is received.
No active-crop seed is required in order to begin **read-only Gate E reconciliation**, because it would be fabricated.

Gate D baseline authority decision: **RECONCILED — INTENTIONAL_EMPTY**.
Gate E readiness: **READY_FOR_READ_ONLY_TRANSPORT_AUDIT**, **not TRANSPORT_CLEAN**.
Gate F real operational write: **BLOCKED** until Gate E passes and a genuine human-confirmed field report exists.
Gate H automation: **OFF / BLOCKED**.

## Outstanding Gate E verification

Audit live Telegram offset and update backlog without calling receiveBseTelegramTest; inspect webhook, last processed update, queue, callbacks, outstanding prompts/cards and duplicate/stale work. Previous read-only preflight saw offset unconfigured and two pending non-/ask_ai messages, so no blanket offset advance, replay, drop_pending_updates or receiver call without controlled reconciliation and evidence.

## Safety locks

production_write:false; official_bse_write:false; BSE_TELEGRAM_AUTOMATION=OFF; no official BSE integration/write; no Google Tasks; no synthetic or historic field records to satisfy Gate D. This document authorizes **documentation and read-only Gate E audit only**, not transport mutation or enabling automation.
