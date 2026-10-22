# GI-UX-02 — Preserve old Batal card + examples

Owner correction, 22 October 2026: After Batal, the old Telegram message MUST remain a usable reference. Prepend "❌ Dibatalkan" to the SAME card, preserve all existing lines and remove only the Batal button. Do not delete the old message or replace its body with a one-line cancellation notice.

## Bounded behavior
- Original report and the "Memproses Rekod / Laporan" acknowledgment remain unchanged.
- Missing fields become human-readable with examples, such as "Plot (contoh M1P1)" instead of raw plot_id.
- Date examples depend on the recognized report parser. Census recognizes numeric D/M/YYYY or D/M/YY and ISO YYYY-MM-DD. Compact PILOT sowing additionally supports D/M without a year and Malay/English month names. Do not claim universal date support.
- C2 callback still matches original numeric user ID, chat ID and card message ID under existing lock. Before Telegram card edit, set technical status INCOMPLETE_CANCEL_ACK_PENDING, never update any domain record. If Telegram edit fails, the same callback is safely retryable; on success set INCOMPLETE_CANCELLED.
- Earlier cards already marked INCOMPLETE_CANCELLED can be repaired by one new tap on their still-visible Batal button; this edits the card but does not rewrite queue status.
- Use the complete actual Telegram callback message text unchanged. If Telegram does not provide it, fail closed without editing; never reconstruct a different card that could lose old details. Do not duplicate the cancellation prefix.
- No changes to DRAFT, /summary, /history, /status, /claim, lifecycle, roles or official BSE records.

## Verification
- Focused feedback tests 10/10 PASS: exact full-text preservation, old-card repair, error/retry and not-modified handling, forged user denial, date/plot help, no domain write.
- Existing callback end-to-end integration and Batal-only unit tests also pass.
- Full local Node files 91/91 PASS, 72/72 source syntax PASS and diff check PASS.
- Review evidence is based on code audit and executable tests. Codex CLI independent review is NOT claimed due quota.
- GitHub merge, Apps Script HEAD readback, native regression and Telegram field acceptance are separately verified gates. No mass replay of older Telegram messages.
