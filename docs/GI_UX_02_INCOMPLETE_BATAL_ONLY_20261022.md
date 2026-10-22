# GI-UX-02 — Incomplete Report: Batal Only

**Owner decision:** 22 October 2026. **PILOT_OPERATION only.**

Incomplete, recognized reports produce one Batal-only Telegram card with a reference, fields understood by the parser, missing fields, and a request to correct and resend. No Benar, no Simpan Draf and no automatic concatenation of Telegram Reply messages. Preserve existing "Memproses Rekod / Laporan" acknowledgement. Completely unrecognized messages retain the existing unsupported path.

A Banci card whose parser reports missing event_date displays the date as not understood, and advertises only date formats currently supported by the Banci parser: DD/MM/YYYY, DD/MM/YY and YYYY-MM-DD (current 2026 pilot contract). A new DD/MM inference feature and the separate Banci issue where user-supplied dates may be ignored are NOT implemented by this PR.

## Persistence and control
- Existing PILOT Telegram queue row holds original message and extraction metadata, not a canonical draft.
- Before Telegram send, status is reserved as INCOMPLETE_CARD_SEND_PENDING. Successful delivery sets card message ID and INCOMPLETE_CANCEL_ONLY. Uncertain send blocks automatic replay; manual reconciliation if needed.
- C2:<update_id>:C uses the existing durable callback queue. Under the existing script lock, callback must match exact update ID, original reporter numeric Telegram ID, source chat and recorded card message ID. Batal sets same queue row INCOMPLETE_CANCELLED. Repeated taps are no-op. Only queue status and card message ID can change.
- No user promotion, approval, domain write, crop batch, sowing event, plot allocation, lifecycle, inventory ledger, ADMIN or official BSE workbook write. Incomplete sowing never makes a plot PLANNED.
- TEST and PILOT_TEST prior Reply clarification are untouched. PILOT_OPERATION recognized NEED_INFO requires a corrected new report, not a Reply.
- No modifications to /status, /summary, /history, /retrieve, /claim, dashboard or menu.

## Verification
- New nine targeted tests cover missing census date, Batal-only markup, sender/chat/card-ID binding, idempotence, failed-send fail-closed and absence of draft/domain writers.
- Full local Node 89/89 test files, 72/72 JavaScript source syntax checks and diff checks PASS.
- Independent scoped review, guarded source merge, Script HEAD sync, native Apps Script regression and actual Telegram field proof are distinct gates.
