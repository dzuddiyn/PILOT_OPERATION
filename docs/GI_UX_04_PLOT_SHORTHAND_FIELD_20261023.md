# GI-UX-04 — Baja Keluar plot shorthand follow-up

Date: 23 October 2026 MYT. Scope: PILOT_OPERATION Baja field parser only.

## Owner-observed field behavior

- Baja Masuk field report is PASS, including two fertilizer types in one confirmation card. No changes requested for IN.
- Baja Keluar previously recognized M1P12 as a single literal plot, but owner contract requires M1P1 and M1P2 with a separate one set per plot of each mentioned fertilizer type.
- Flexible plot forms: M1P12, M1P1,2, M1 P1,2, M1P1,P2, M1P1 & P2, M1P1 dan M1P2, several full module references, and any order relative to date/type.
- Old Telegram messages and cards remain unchanged; never auto-replay, delete, or reclassify.

## Minimal rules

- Two-digit compact MxPyz with both plot digits 1..9 expands into two distinct plot IDs. M1P12 yields M1P1 and M1P2; M5P34 yields M5P3 and M5P4. Owner explicitly chose this meaning even if a similar literal plot ID is possible elsewhere.
- Explicit comma / ampersand / "dan" plot lists yield distinct IDs. Repeated plot IDs fail closed rather than deduct twice.
- Single-digit IDs remain literal. P10 remains P10 (not plot P0). Three-or-more-digit unsplit plot numbers fail closed as ambiguous.
- Each fertilizer type is combined with each expanded plot: default one set per fertilizer per plot; one Benar/Batal card for the whole report.
- No inventory write before reporter approval; no stock lifecycle effects outside PILOT.
- Existing Baja out/keluar alias/date/order tolerance preserved; Baja Masuk and other reports untouched.
- Existing source-key per type+plot, group approval idempotency and Gate F helpers retained.

## Earlier Telegram message, read-only check

- Real PILOT spreadsheet PILOT_TELEGRAM_QUEUE row for BSE-TG-772257660 was inspected read-only. The note matches Baja out F 23 Okt 26 M5P3. The stored candidate was Inventory_Event_Log with validation PASS, acknowledgement SENT and two processing attempts. On the most recent direct row read, its status was DISCARDED_BY_REPORTER. No historic message is retried or altered here.
- This confirms recorded queue state but does not independently prove what the Telegram client showed at that time.

## Test evidence

- gi_ux_04_plot_shorthand.test.cjs: 20/20 PASS including compact, separated, multi-module, multi-fertilizer and negative cases.
- Updated gi_ux_04_flexible_field.test.cjs: 27/27 PASS, correcting M5P34 expectations.
- Full Node suite: 98/98 PASS. JS syntax: 76/76 PASS. Diff check: PASS.
- Source merge, guarded clasp push/read-back, native Apps Script regression and fresh Telegram field acceptance remain distinct gates. No independent Codex review claimed.
