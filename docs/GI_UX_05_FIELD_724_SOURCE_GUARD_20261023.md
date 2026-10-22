# GI-UX-05 FIELD-724 — Semaian source/approval consistency

Date: 23 October 2026 MYT. PILOT_OPERATION only.

## Owner field evidence and live read-only verification
- Telegram BSE-TG-772257724: "Semai 23 Okt 26 / Timun (7055 CCB) / 200 g M3P12".
- The displayed one-card proposal omitted quantity and retained one literal plot M3P12.
- Fresh direct Google Sheets PILOT_TELEGRAM_QUEUE read: NEEDS_HUMAN_REVIEW, acknowledgement SENT. Saved candidate_json was PASS but had no seed_quantity/seed_unit and only one Plot_Allocation_Log M3P12.
- Therefore this is NOT merely a display-format defect: the unconfirmed proposal was wrong. No human approval or Crop Batch write is evidenced for this reference. Do NOT replay, overwrite or backfill this existing queue record.

## Minimal source correction
- Direct PILOT Semai/Semaian proposals must be reconciled against the deterministic, explicit-source seed parser again at worker finalization BEFORE candidate_json is persisted or a card is built. This defeats fallback to legacy one-plot/no-seed proposals. Missing/unrecognized facts fail closed as NEED_INFO.
- A second check on the reporter Benar callback rejects any existing PILOT direct Semaian envelope whose stored canonical proposal differs from direct source facts. It answers the callback with a short instruction to press Batal and send a new report, without domain write.
- Defense in depth at the actual Crop Batch APPROVED writer: before new domain rows are appended, compare the existing persisted candidate canonical structure against a fresh parse of the original message. Mismatches fail closed. Old already-APPROVED idempotent receipts do not receive extra writes.
- Reporter-originated quantities/units, the plot expansion M3P12 -> M3P1+M3P2 and crop/variety/date remain fixed by owner contract. Do not infer from Telegram date or use variety numbers as quantity.
- No changes to cancellation, incomplete Batal-only cards, historical evidence, lifecycle, Banci, Baja, /claim, ADMIN or official BSE.

## Tests / deployment gates
- gi_ux_05_seed_quantity.test.cjs: 31/31 PASS, including exact live 724 message, synthetic reproduction of a stored legacy one-plot/no-seed candidate, deterministic worker correction and precommit rejection.
- gi_ux_05_confirmation_receipt.test.cjs: 8/8 PASS, including execution of Benar callback against stale source, verified blocked response/Telegram alert with zero write.
- All Node test files 100/100 PASS, all JS syntax 79/79 PASS, git diff --check PASS.
- Independent GitHub PR merge, guarded Apps Script HEAD sync/read-back, native regression, and fresh Telegram field acceptance are separately required.
