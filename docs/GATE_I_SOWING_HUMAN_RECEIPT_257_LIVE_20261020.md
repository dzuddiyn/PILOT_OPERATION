# Gate I ? Human-Friendly Sowing Receipt LIVE Acceptance (BSE-TG-772257257)

**Evidence date:** 2026-10-20, MYT
**Environment:** PILOT_OPERATION shadow pilot, not official BSE production
**Verdict:** **SCOPED LIVE PASS** ? human-readable sowing receipt after PR #122 Script HEAD sync.

## Real report and expected operator UX

The operator sent a real Telegram report:
```text
semai
Peria Besar (936 Hua li)
M7P3
31-Aug-26
```

Actual Telegram Desktop / Windows UI Automation read-back after the 13:16:05 MYT Script HEAD sync returned an edited confirmation message for `BSE-TG-772257257`:

```text
REKOD SEMAIAN DISIMPAN
Rujukan: BSE-TG-772257257
Tarikh semai: 31/08/2026
Tanaman: Peria Besar (936 Hua li)
Plot: M7P3
Direkodkan: 1 batch, 1 aktiviti semaian, 1 plot
Status plot: Dirancang
Status semakan: Sementara (belum diverifikasi)
```

Original operator screenshot independently corroborates the visible edited card. It has no raw column names, allocation IDs, UUIDs or internal batch ID. This **does not** claim crop cultivation was physically observed.

## Independent persisted PILOT Sheets read-back

- `PILOT_TELEGRAM_QUEUE` update `772257257`: `REPORTER_CONFIRMED`; exact original note above; three validated candidates (Crop Batch, Planting Event, Plot Allocation).
- `PILOT_TELEGRAM_APPROVAL_UI`: precisely one card `BSE-TG-772257257`, source key `BSE-TG-772257257|Crop_Batch_Log`, `REPORTER_CONFIRMED` (acted_at `2026-10-20T05:29:34.706Z`).
- `PILOT_TELEGRAM_APPROVAL_CALLBACK_PENDING`: callback update `772257258`, action `A`, `PROCESSED`, `attempts=1`, last_error empty, processed_at `2026-10-20T05:29:42.513Z`.
- `PILOT_CROP_BATCH`: **exactly 1** row with matching source key, `BSE-SB-CB-20260831-001`, date `2026-08-31`, Peria Besar, variety `936 Hua li`, `PROPOSED`, `PROVISIONAL`.
- `PILOT_PLANTING_EVENT`: **exactly 1** matching row linked to the same batch, `SEED_SOWING`, event date `2026-08-31`, `PROPOSED`, `PROVISIONAL`.
- `PILOT_PLOT_ALLOCATION`: **exactly 1** matching row linked to the same batch, plot `M7P3`, `PLANNED`, `PROVISIONAL`.
- No duplicate for this source key in those three domain sheets. The UI's `Dirancang` maps to persisted `PLANNED` and `Sementara (belum diverifikasi)` to `PROVISIONAL`.

## Scope and remaining gates

**CLOSED (scoped):** PR #122 human-friendly sowing receipt **LIVE Telegram UX PASS**; source-to-card-to-callback-to-record-to-edited-receipt verified. Previous read-only preview evidence for reports 249 and 253 remains valid but did not itself prove Telegram LIVE UX.

**OPEN:** Other generic fallback receipt categories have local regression and read-only preview evidence but are **not universally LIVE-verified** by this sowing example. Worker lock contention / reliability criteria and corporate/site IT acceptance remain unresolved; overall Gate I handover **NOT DELIVERED**.

No callbacks were replayed; no messages were sent by ChatGPT; no Apps Script, trigger, offset or pilot domain write performed by this acceptance investigation; `production_write:false` / `official_bse_write:false` remain locked.
