# GI-UX-05 FIELD-03 — one verified sowing confirmation card

Date: 23 October 2026 MYT. Scope: BSE OpsMate PILOT_OPERATION only.

## Owner report and actual PILOT read-back

After Benar for BSE-TG-772257715, owner saw only a generic Makluman rather than a complete saved-record summary. This is a presentation defect, not a missing saved event.

Read-only direct Google Sheets verification on BSE_OpsMate_SB_PILOT_OPERATION:
- PILOT_TELEGRAM_QUEUE: BSE-TG-772257715, REPORTER_CONFIRMED, ack SENT, one processing attempt.
- PILOT_CROP_BATCH: one batch BSE-SB-CB-20261023-001, 2026-10-23, Timun / 7055 CCB.
- PILOT_PLANTING_EVENT: one SEED_SOWING with the same batch and date, seed_quantity 200, seed_unit g.
- PILOT_PLOT_ALLOCATION: two records M3P1 and M3P2, PLANNED.
- PILOT_CROP_BATCH_REVIEW: APPROVED, same source_key and batch.
No write or replay was carried out in this verification. This example is 200 g, NOT the earlier 65 tray parser test.

## Root cause and minimal fix

- The generic owner notice was built from the empty variable recordSummary for Crop_Batch_Log; it ignored the separately computed persisted summary.
- PILOT Crop_Batch_Log now uses the existing one-card approach: edit the original approval card with ledger-verified sowing summary and Pelapor, no duplicate private receipt or generic owner notice.
- Add Kuantiti benih: [quantity] [literal unit], read ONLY from saved TEST_PLANTING_EVENT columns (mapped by runtime to PILOT_PLANTING_EVENT). Never infer from variety or note; fail closed if only one of quantity/unit is present or a stored value is invalid.
- Include actual date, crop/variety and every saved plot ID, with truthful PLANNED/PROVISIONAL status.
- Do not automatically resend/replay old BSE-TG-772257715. Changes apply only to fresh approved sowing callbacks.
- Incomplete reports remain Batal-only. No change to parser, validation, writer, Banci, Baja, /claim, ADMIN, lifecycle, or official BSE.

## Evidence and remaining gates

- gi_ux_05_confirmation_receipt.test.cjs: 7/7 PASS with realistic ledger-shaped source rows and executed reporter-confirmation callback. Checks one original-card edit and no second notice, reporter identity, batch/plot/date/200 g, negative missing unit and duplicate plots, and unchanged non-PILOT behavior.
- Full Node test files: 100/100 PASS. JavaScript source syntax: 79/79 PASS. git diff --check PASS.
- GitHub PR merge, guarded Apps Script push and independent HEAD read-back, native Apps Script regression, and fresh Telegram field test remain separate gates.
