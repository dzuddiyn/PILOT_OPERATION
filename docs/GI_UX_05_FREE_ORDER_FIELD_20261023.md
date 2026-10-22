# GI-UX-05 FIELD — Unlabelled quantity and order-independent sowing

Date: 23 October 2026 (MYT), BSE OpsMate PILOT_OPERATION only.

## Field observations
- The owner's full-field tests for GI-UX-05 pass except real input when date, crop+variety, plot and seed quantity are interleaved:
  - Semai / 23/10/26 / Timun (7055 CCB) M1P1,2 65 tray
  - Semai / Timun (7055 CCB) 23/10/26 / 65 tray M1P1,2
- Prior report BSE-TG-772257701 returned a Batal-only card that incorrectly marked all fields missing despite the fields being present.
- Existing parser expected one isolated crop+variety line and a separately labelled "Benih: 200 biji" line.

## Corrected bounded behavior
- Recognize an explicit Semai or Semaian prefix (PILOT only), exactly one grounded crop+variety pair, one valid explicit date, grounded plot(s), and a positive seed quantity with literal user-provided unit (for example 65 tray). Accept field order permutations and mixed lines.
- Parse original date, plots, crop+variety before interpreting an unlabelled amount. The variety "7055 CCB" cannot be taken as 7055 seeds. A preceding known unit (e.g. 65 tray Timun (7055 CCB)) is separated from the crop only when explicitly preceded by its numeric quantity.
- Preserve old "Benih: 200 biji" labelled input, "M1 P1 P2" plot form, and other sowing styles. M1P1,2 = M1P1 + M1P2 (one sowing event, not duplicated seed count). Crop/variety not invented.
- Missing or invalid date, plot, amount or unit, multiple conflicting dates/plots, unknown residual words or ambiguous plot IDs remain NEED_INFO with a Batal-only card. No domain write without human approval.
- Keep the FINAL source-aware validation gate, exact original message audit trail, atomic PILOT Crop Batch / Planting Event / Plot Allocation review, idempotency and all lifecycle rules untouched.
- No historical Telegram replay, no official BSE write, no changes to GI-UX-03/04, /claim, ADMIN or production environment.

## Verification
- 27/27 focused GI-UX-05 tests PASS, including both exact user examples, several free-order permutations, old labelled syntax, missing required fields, varietal-number noninference, duplicate dates/plots and no bypass of FINAL gate.
- Full Node test files 99/99 PASS; source JavaScript syntax 79/79 PASS; git diff --check PASS.
- GitHub merge, guarded Apps Script HEAD sync/readback, native Apps Script regression and Telegram field acceptance are separately required. Independent Codex verdict not claimed.
