# Gate I Global Plot LIVE Acceptance — 2026-10-20

## Scope and evidence classification

**SCOPED LIVE PASS** for one genuine PILOT_OPERATION reporter-confirmed transplant operation. This does **not** constitute formal BSE production deployment, broader module live parity, corporate acceptance, or full project DELIVERED.

- Canonical GitHub main at review: `3cde85b911572ffe9d560a6f2ba44024ff6d05cb` (PR #119 merged).
- Apps Script HEAD previously independently pulled: 74 runtime files, 65/65 shared canonical normalized-source SHA match; nine runtime-only Gate F helpers preserved.
- Current final local Node regression: **54/54 suites PASS**, no domain write by this documentation activity.
- Owner's original message: `Tarikh Pindah anak pokok\nM5P1,2\n7-Oct-26`.
- Queue `772257247`, reference `BSE-TG-772257247`, candidate `PASS` with `plot_ids: ["M5P1","M5P2"]`, crop Cucumber 6656, variety 282 CP, event date 2026-10-07.
- UIA actual Telegram approval card #231 showed M5P1 **and** M5P2 before human confirmation; user confirmed.
- Approval callback `772257248` action A: **PROCESSED**, attempts **1**, last_error blank; approval UI `REPORTER_CONFIRMED`.
- Independent PILOT spreadsheet read-back using exact source_key `BSE-TG-772257247|Transplant_Event_Log`: precisely one `PILOT_TRANSPLANT_EVENT`, ID `BSE-SB-TR-20261007-002`, batch `BSE-SB-CB-20261002-002`, event_date 2026-10-07, plot_ids `M5P1|M5P2`, `COMPLETED`, `VERIFIED_TEST`.
- Exactly two `PILOT_ALLOCATION_STATUS_EVENT` rows for the same source_key: M5P1 and M5P2 both **PLANNED -> ACTIVE**, referencing the same transplant and batch. No duplicate row for this reference in those sheets.
- Independent UIA Telegram original approval card **edited** to `REKOD PINDAH ANAK POKOK DISAHKAN`, including reference, transplant event ID, batch, crop, variety, date, both plots, both ACTIVE transitions, reviewer and `COMPLETED / VERIFIED_TEST`.
- Apps Script UIA Triggers: three project triggers, including time-based `bseTelegramTick`; Executions: one failed run at 12:28:18 MYT (166.042 s, generic server error), later completed runs 12:29–12:36. The eventual callback processing was observed **without manual replay**. The server failure root cause is **UNRESOLVED**.

## Safety and scope

`production_write:false`; `official_bse_write:false`. This document records observation of a prior real approved PILOT_OPERATION transaction only. It authorizes no new Telegram sends, callback replays, Apps Script changes, domain writes, trigger changes or official farm writes.

## Open issues and owner gates

1. **Runtime reliability:** isolate cause of 12:28:18 Apps Script failure and track worker latency/alerting; one completed callback does not prove failure-free unattended operation.
2. **Broader validation:** full multi-module live parity and non-owner authorization / permission evidence, user-facing UI quality, and any remaining acceptance checklist requirements remain unverified unless supported by separate evidence.
3. **Deployment boundary:** Apps Script `clasp push` updates HEAD; no Apps Script version/deployment update or official BSE production go-live is claimed.
4. **Handover:** site IT/corporate owner sign-off remains outstanding. Keep status **HANDOVER PREPARED / NOT DELIVERED** until accepted.

## Audit trail

GitHub PR #117 universal receipt; #118 shared plot parser; #119 operational plot closure. Evidence sources: authorized PILOT_OPERATION Sheet read-back; Apps Script Chrome UIA Triggers/Executions; Telegram desktop UIA approval-card text; repository test results. No secret/token values included.

