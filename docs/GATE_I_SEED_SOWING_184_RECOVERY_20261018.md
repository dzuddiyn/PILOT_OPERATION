# Gate I — compact semaian M5P34 / canonical M5P3 + M5P4

Date: 2026-10-18 MYT. Runtime environment: **PILOT_OPERATION ONLY**. Outcome: **SOURCE MERGED / SCRIPT HEAD UPDATED / LOCAL PASS / APPS SCRIPT REGRESSION PASS / ORIGINAL CARD CORRECTED LIVE / HUMAN CONFIRMATION PENDING**. No official BSE write.

## Actual ordinary-user source and observed failure

Actual owner Telegram source BSE-TG-772257184, Telegram message ID 101:

```text
- Semai
Timun (282)
- M5P34
- 6/10/26
```

The owner explicitly determined `M5P34` means two physical plots, **M5P3 and M5P4**, not M5P34 as a singleton. `282` is variety; actual work-date is 2026-10-06. PILOT queue originally contained PASS with one `Plot_Allocation_Log` for `M5P34`, and one OPEN confirmation card Telegram message ID **104** showed the wrong plot; intermediate bot result exposed `CROP_BATCH / PLANTING_EVENT / PLOT_ALLOCATION | M5P34 / Menunggu pengesahan laporan`.

Prior seed-sowing deterministic route only covered formal `KERJA SEMAIAN BENIH` and `Modul:` grammar. The compact ordinary-user note escaped that route, allowing model extraction to treat `M5P34` as one plot.

## Implementation and isolation

- PR [#42](https://github.com/dzuddiyn/PILOT_OPERATION/pull/42), merged canonical main `420e42600f0451519e04d5c60113dcafae7d0c75`, introduces PILOT-only deterministic compact semaian grammar, ahead of model fallback: ONE `Crop_Batch_Log`, ONE `Planting_Event_Log`, TWO `Plot_Allocation_Log` candidates for M5P3 and M5P4. Invalid date, duplicate plot pair, extra source lines, or ambiguous three-digit suffix fail closed. TEST/PILOT_TEST untouched.
- For a valid atomic seed PASS, ordinary Telegram receives existing initial report ACK and the human confirmation card directly; the internal intermediate processing message is no longer sent. This **future-message behavior is tested at source/runtime but awaits a subsequent real field report**. Historical intermediary Telegram message for this older report was not deleted.
- The single existing OPEN card ID 104 was repaired **in place** using guarded PILOT-only function, protecting against stale callback during reconciliation, requiring actual source/owner/chat/card/hash and no prior domain writes; after edited Telegram message and read-back, candidate_json and approval hash were synchronized; OPEN restored. No new card or duplicate.
- **Never press Benar in technical tests.** Actual reporter must decide after reading the corrected card.

## Independently confirmed evidence

- Canonical GitHub main and local clean at `420e42600f0451519e04d5c60113dcafae7d0c75` before documentation update.
- Node local **18 suites / 217 checks PASS**; targeted compact seed and safe-repair tests included, JS syntax and diff checks PASS.
- PILOT Apps Script HEAD mirrored in independently pulled copy: **61 canonical JS matching / 70 Script HEAD JS total**, including nine preserved historical Gate F helper files; **zero source diffs**; worker SHA256 `3EBA753F9D0E6519CFDDAF529CFADF7C93F310DE9D3E08E9837C8F15AE1F6FAD`.
- Owner Apps Script UI `runBseI011FullRegression` finished **2026-10-18 19:33:48 MYT**; **47/47 PASS**, `production_write:false`.
- Independent Telegram Desktop UIA: **same confirmation message ID 104** displays `Tarikh semai: 06/10/2026`, `Tanaman: Timun`, `Varieti: 282`, `Plot: M5P3, M5P4`, `Status tanaman: PLANNED`; Telegram indicates edited, no replacement card.
- Independent Google Sheets read-back after regression: `PILOT_TELEGRAM_QUEUE` update `772257184` has validation `PASS`, four candidate rows including plot IDs `M5P3` and `M5P4`, status `NEEDS_HUMAN_REVIEW`; `PILOT_TELEGRAM_APPROVAL_UI` one card `104`, state `OPEN`, source key `BSE-TG-772257184|Crop_Batch_Log`; **zero writes for this reference** in PILOT_CROP_BATCH, PILOT_PLANTING_EVENT or PILOT_PLOT_ALLOCATION.
- `production_write:false` and `official_bse_write:false` enforced by project scope. Actual domain persistence only after a genuine authorized reporter confirmation.

## Pending acceptance

1. Human reporter decision on corrected card ID 104; **not approved yet** at last read-back. If user selects `Benar`, verify independently one canonical crop batch, one planting event, and *two* plot allocations M5P3/M5P4 with original work date 2026-10-06. Do not infer physical sowing happened independently from software.
2. Observe a new real compact semaian entry to prove that redundant intermediate internal message is not emitted after PR #42. Do not fabricate operational data for proof.
3. Other Gate I ordinary-user / access / handover signoff remains outstanding. **PILOT_OPERATION NOT DELIVERED**.
