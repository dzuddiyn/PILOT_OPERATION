# GI-UX-05 — Semaian seed quantity, literal unit, flexible date and plot

Date: 23 October 2026 MYT. Scope: PILOT_OPERATION only. Owner corrections supersede optional defaults.

## Owner contract

ALL FOUR fields are explicitly REQUIRED.

- Date: valid sowing date, accepted DD/MM/YY, DD/MM/YYYY, DD-MM-YY, DD.MM.YYYY, YYYY-MM-DD and Malay/English named months (23 Okt 26, 23 Oktober 2026). Existing PILOT Semai DD/MM without year retains fixed system year 2026. Invalid/impossible/contradictory dates fail closed. No received-at substitution.
- Module/plot: grounded plot or plot list, with compact M1P12 = M1P1 + M1P2, M1P1,2, M1 P1,2, M1P1,P2, M1P1 & P2, M1P1 dan M1P2, lists across modules. Duplicates, ambiguous three-or-more-digit suffixes, and invented IDs fail closed.
- Seed quantity: explicit positive number, NEVER inferred from variety number such as Peria Besar (936 Hua Li).
- Original seed unit: explicit text (biji, tray, paket, Kg, etc). No default unit, unit conversion, multiplication by plot count or invented per-plot allocation. Seed quantity is the reported total for the single sowing event, NOT per plot.

Crop and variety remain subject to prior sowing guards. One Benar/Batal card on completion, Batal only if incomplete; no domain event writes before human confirmation.

## Implementation

- New bounded PILOT-only parser handles Semai/Semaian, plot-first Semai and structured KERJA SEMAIAN BENIH; date and plot order flexible. Historic linked Reply and non-PILOT TEST paths unchanged.
- Deterministic quantity guard reads only explicit seed quantity/unit; original message retained. It adds structured seed_quantity and seed_unit to Planting_Event_Log candidate and canonical hash.
- Generic schema guard can otherwise clear missing arrays; a second post-finalization sowing guard recomputes all four required fields before approving cards or saving proposals. Contradictory date/plot cannot be silently accepted.
- Additive TEST_PLANTING_EVENT ledger appends two trailing columns seed_quantity and seed_unit; first 14 columns and payload_hash position unchanged, old rows retain blank trailing cells. Additive migration only occurs in existing approved Crop Batch review path.
- Human confirmation, atomic TEST Crop Batch + Planting Event + Plot Allocation group, idempotency, source-key, no official BSE write and no historic replay remain. No lifecycle expansion, no Banci, Baja, /claim or ADMIN change.

## Gates / evidence

- gi_ux_05_seed_quantity.test.cjs 20/20 PASS: numbers, units, flexible dates, compact/multi plot, date/plot order, invalid/duplicate forms, variety number isolation, mandatory fields, canonical proposal and final fail-closed gate.
- Full Node suite 99/99 PASS, JavaScript syntax 78/78 PASS, diff check PASS.
- GitHub merge, guarded clasp push with independent HEAD read-back, native Apps Script regression and fresh Telegram acceptance remain separate gates. No independent Codex verdict claimed.
