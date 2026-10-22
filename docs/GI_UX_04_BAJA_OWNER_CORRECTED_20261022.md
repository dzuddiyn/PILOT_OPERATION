# GI-UX-04 — Baja Masuk / Baja Keluar (Owner-Corrected)

Date: 22 October 2026 (MYT). Scope: BSE OpsMate PILOT_OPERATION only. Owner correction supersedes initial GI-UX-04 requirements.

## Mandatory / default fields

| Field | Baja Masuk | Baja Keluar |
|---|---|---|
| Tarikh | REQUIRED explicit (DD/MM/YYYY or YYYY-MM-DD) | REQUIRED explicit |
| Jenis | REQUIRED, F, N or other named code | REQUIRED |
| Kuantiti | REQUIRED per fertilizer type | DEFAULT 1 per plot per fertilizer type; explicit override accepted |
| Unit | DEFAULT set; explicit accepted unit such as kg allowed | DEFAULT set; explicit accepted unit allowed |
| Item | DEFAULT Baja | DEFAULT Baja |
| Plot | NOT REQUIRED | REQUIRED |

Several types may appear in one report. All lines must be valid before one Benar/Batal card can be offered. Incomplete reports get Batal only. No inventory event is stored before Benar. Confirmation edits ONE original card with reporter name, not secondary duplicate receipts.

## Examples

Baja Masuk:

    Baja Masuk
    Tarikh: 22/10/2026
    F 2
    N 3

One approval card: Baja F = 2 set, Baja N = 3 set, no plot.

Baja Keluar:

    Baja Keluar
    Tarikh: 22/10/2026
    Plot: M5P3
    F
    N

One approval card: Baja F = 1 set and Baja N = 1 set for M5P3.

Multiple plots may be comma-separated (e.g. Plot: M5P3, M6P1). Default one set applies per type per plot, giving four rows for two types over two plots, all inside one confirmation. The card explicitly lists each type, quantity, unit and plot.

## Implementation boundaries

- PilotBajaTest.js: deterministic parser, group validator and card. Never guess a missing date or input quantity.
- PilotBajaReviewTest.js: after reporter APPROVED only, write TEST_INVENTORY_EVENT plus one TEST_INVENTORY_REVIEW group record. Stable source key is specific to reference, domain, fertilizer type and plot. Preflight all rows, recover safe retries after partial append, reject conflicts.
- item_name is literally Baja. A new additive final TEST_INVENTORY_EVENT column baja_type preserves F/N as structured type. Existing columns are never shifted; older rows have blank type.
- PILOT confirmation returns one edited canonical card with Pelapor. Other inventory/claim modules, GI-UX-03, /claim, ADMIN and lifecycle remain unchanged.
- No historical Telegram replay; no official BSE workbook changes or production dispatch.

## Gates

- Focused executable test: 17/17 PASS, including complete and incomplete cards, fields/defaults, multiple types/plots, negative amounts, duplicate types, partial writer failure recovery, typed ledger readback, and no pre-approval write.
- Full Node tests: 96/96 PASS. JavaScript syntax: 75/75 PASS. git diff --check: PASS.
- GitHub PR merge, guarded clasp push/HEAD readback, Apps Script native regression and live Telegram acceptance are separate.
- No independent Codex verdict claimed while usage limit is in effect.
