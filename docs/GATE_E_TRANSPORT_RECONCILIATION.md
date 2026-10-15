# Gate E — Telegram Transport Backlog Reconciliation

Date: 2026-10-15. Environment: PILOT_OPERATION.
State: READ_ONLY AUDIT COMPLETE; TRANSPORT ACKNOWLEDGEMENT NOT AUTHORIZED / NOT EXECUTED.

## Evidence

Owner-run Apps Script read-only audit at 18:35 Malaysia time:
- Environment PILOT_OPERATION, automation OFF, webhook inactive.
- BSE_TELEGRAM_OFFSET UNSET; no last processed update property.
- Pending getUpdates(offset=0): exactly 772257138, 772257139, 772257140.
- 772257138: private owner message ID 6, plain 'hi', owner confirmed TEST_ONLY; no operational processing.
- 772257139: permitted pilot group, owner message ID 7, /pilot; repo inspection found no dedicated handler; command only, not a verified operational report.
- 772257140: private owner message ID 8, /ask_ai; prior controlled Telegram proof answered the question at 17:26; prevent duplicate reply.
- Workbook had no transport queue/callback/approval sheets; five crop lifecycle tables were header-only at Gate D independent readback.
- Neither audit nor this document advances Telegram offset, runs receiver, acknowledges remote backlog, or writes operational events.

## Proposed recovery (NOT EXECUTED)

1. Capture a fresh non-acknowledging getUpdates(offset=0) under lock and compare update identities to saved observations; if unexpected older updates or new updates appear, stop and reconcile them individually.
2. Document each old update disposition in an append-only pilot-only audit sheet (TEST_ONLY / NON_OPERATIONAL_COMMAND / ALREADY_ANSWERED) before modifying offset.
3. Introduce controlled one-time offset initialization to 772257141 only after confirming the complete contiguous old sequence up through 772257140 has been individually classified and preserved as audit. Telegram getUpdates(offset=772257141) acknowledges all updates with IDs below this boundary; this is irreversible transport consumption, so it needs owner authorization and a verified recovery procedure. Never use drop_pending_updates.
4. Any new updates with IDs >=772257141 must be left for normal controlled processing, not dropped or marked processed. Avoid running receiver until transport reconciliation and dedup proofs pass.
5. Confirm from fresh read-only Telegram result and Sheet audit: old three no longer pending, newly arrived updates preserved, offset property matches boundary, queue/callback/approval baseline safe; then decide TRANSPORT_CLEAN.

## Status

GATE_E_BACKLOG_CLASSIFIED; TRANSPORT_CLEAN=FALSE; general automation OFF; production_write FALSE; official_bse_write FALSE; Gate F blocked until Gate E passed. No assertion of completed Telegram acknowledgement.
