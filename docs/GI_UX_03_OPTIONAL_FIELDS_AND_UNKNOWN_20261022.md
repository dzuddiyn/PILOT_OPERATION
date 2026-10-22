# GI-UX-03 follow-up: optional counts, no user batch and unknown text

Date: 22 October 2026 MYT. Scope: PILOT_OPERATION only.

Owner-corrected census form:
- REQUIRED: explicit Banci date and module/plot.
- OPTIONAL: Mati (default 0), Sakit (default 0). Both absent defaults to zero as specified.
- OPTIONAL: Tanaman. Where there is a unique ACTIVE plot crop as of the report date, auto-resolve it. Never invent crop.
- NO USER BATCH INPUT: The user should never be told to provide a batch. The existing internal source ledger still enforces a unique ACTIVE plot-to-batch association for verified domain persistence. If this is missing, explain the **system's active plot data** problem, not a missing form field. Do not bypass the internal ledger or write an unlinked census without a separate migration contract.
- Invalid/omitted explicit date fails closed for recognized PILOT Banci. Existing TEST behavior remains where applicable.
- Preserve displayed report values, confirmed-card method labels and Batal-only semantics.

Unrecognized short plain-text input:
- PILOT-only deterministic handler for a single unrecognized alphabetic word (e.g. "merapu"). Known report/command words bypass it.
- Return concise "Mesej tidak dapat dikenal pasti sebagai laporan" with the original BSE-TG reference.
- Persist pending status **before** Telegram send. On uncertainty do NOT resend automatically (prevents duplicate replies), and do not send report for AI classification.
- Mark technical queue UNRECOGNIZED_MESSAGE only on confirmed Telegram response with a numeric message ID.
- No domain write, no new approval or Reply request. Previously received unknown messages are not replayed.

Tests:
- gi_ux_03_census_optional_unknown.test.cjs: nine focused checks for required/optional fields, zero default, date/plot failures and deterministic unknown handler.
- Entire Node suite, JS syntax and diff must PASS before merge.
- A separate review + native Apps Script run and a new Telegram field acceptance remain necessary.
