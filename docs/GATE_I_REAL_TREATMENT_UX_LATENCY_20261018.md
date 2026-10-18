# Gate I — Two owner-confirmed treatment reports, Telegram UX and latency

**Reference date:** 2026-10-18 MYT
**Scope:** `PILOT_OPERATION` only. Technical storage is Google Sheets `BSE_OpsMate_SB_PILOT_OPERATION`; the user's phrase "Google Drive write" in this walkthrough meant Google Sheets, not a separate Drive evidence attachment.

## Genuine owner-reported work and independent Google Sheets evidence

The project owner explicitly reported submitting two actual racun reports and supplied Telegram screenshots including the reporter's Benar/confirmation flow. This establishes reporter-supplied operational facts; the software does **not** independently observe physical spraying.

| Reference | Work date | Material as submitted (quantities without inferred units) | Confirmed PILOT domain event | Plot joins |
| --- | --- | --- | --- | --- |
| `BSE-TG-772257161` | 2026-10-15 | Axtraroots 60; envoy 20 | `BSE-SB-TX-20261015-001` | M5P1, M5P2 |
| `BSE-TG-772257163` | 2026-10-13 | Serenade 80; Acerio 30; envoy 15; Gam 10 | `BSE-SB-TX-20261013-001` | M5P1, M5P2 |

Independent Google Sheets read-back on 2026-10-18:
- `PILOT_TELEGRAM_QUEUE`: both rows status `REPORTER_CONFIRMED`, acknowledgment `SENT` and preserved original note/source metadata.
- `PILOT_TELEGRAM_APPROVAL_UI`: both `REPORTER_CONFIRMED`, distinct source keys and payload hashes.
- `PILOT_TELEGRAM_APPROVAL_CALLBACK_PENDING`: callback updates `772257162` and `772257164` status `PROCESSED`, no last_error.
- `PILOT_TREATMENT_REVIEW`: both `APPROVED`, reviewer metadata stored, one unique review/event identity per report.
- `PILOT_TREATMENT_EVENT`: exactly two event rows, both `COMPLETED` and inherited `VERIFIED_TEST` technical status (in PILOT workbook, *not* official production), distinct references and dates.
- `PILOT_TREATMENT_ALLOCATION_LINK`: exactly four rows, unique two-plot joins per report; no duplicate domain treatment event.
- `production_write:false` / `official_bse_write:false` unchanged. No official BSE database write and no third-party Drive file upload asserted.

## Owner-observed Telegram defects and repair

Observed from real screenshot/message flow:
1. User-visible messages included `[PILOT]`, `Mod TEST` or `Mod PILOT`, production disclaimers, and raw `TREATMENT_EVENT` / `PROVISIONAL` statuses.
2. Owner confirmation notice said "oleh penghantar" despite the original queue's `reporter_name=dzuddiyn`.
3. Reply times appeared slow enough to affect ordinary-user usability.

Corrective source changes:
- **PR #24**, merged main `06a70f5693c5092ebd8edeeeef1727cac41c102c`: user-facing PILOT message adaptation removes internal labels/prefix/disclaimers, makes racun review actionable, and owner confirmation notice uses sanitized real reporter name from stored source metadata. Only `PILOT_OPERATION` is altered; `TEST` / `PILOT_TEST` stay unchanged.
- **PR #25**, merged main `9c176d9de0139ffc6791fa6d0931044ec7f850c4`: secondary real /retrieve proof exposed inherited `PRIVATE_SUBMISSION`, `REPORTER_CONFIRMED` and `Treatment_Event_Log` raw labels; display-only mapping hides/translates these on PILOT user output.
- 128/128 local Node checks across 10 suites, JS syntax and diff --check PASS; 47/47 Apps Script full regression after PR #25 at 2026-10-18 14:45:44 MYT, production_write false.
- PR #25 Script HEAD exact independent read-back 70/70 JavaScript files, 0 differences; all nine Gate F-only runtime helpers retained. `clasp push` updates Script HEAD only, not any official BSE deployment.

## Latency — actual observed milestones, not guaranteed SLA

| Stage | 772257161 | 772257163 | Interpretation |
| --- | --- | --- | --- |
| Telegram source message → queue received | 19.9 s | 16.6 s | Polling/intake delay observed |
| Source message → approval card reservation | 33.2 s | 76.5 s | Queue + parser/worker scheduling; second report likely crossed an extra poll cycle, but exact subcause needs stage telemetry |
| Callback received → domain review APPROVED | 15.8 s | 9.4 s | Internal confirmed domain processing |
| Callback received → callback PROCESSED | 29.4 s | 17.3 s | Callback settling and audit |
| Card reserved → user pressed Benar | About 56.5 s | About 42.5 s | Reporter interaction time, **not** system processing delay |

Current `bseTelegramTick` uses one Apps Script CLOCK trigger at approximately one-minute cadence. This design does not guarantee immediate replies, even when queue writes are correct. Historical network/ScriptLock contention was separately diagnosed and bounded by PR #19; no claim that network failures or end-to-end delay were eliminated by a message-label fix.

**Performance next:** Gather stage-by-stage tick/parse/API timing in read-only or sanitized runtime logs, define acceptable ordinary-user time-to-ACK/card/confirmation, and only then assess modest safe optimization. Webhook or sub-minute polling would be an architecture/authority change and should not be silently introduced within a UX copy fix.

## Real acceptance classification

- Gate I **new positive two-report Benar → PILOT treatment row + allocation links**: **LIVE PASS / OWNER-REPORTED PHYSICAL ACTIVITY** (software did not witness work).
- Real PILOT /retrieve post PR #24 at 14:41 MYT produced automatic bot reply and independent Google Sheet `SENT / OWNER_ACTIVE`, proving prefix/disclaimer removal but revealing remaining technical fields.
- Post PR #25 /retrieve BSE-TG-772257161 LIVE PASS at 14:47 MYT: Telegram returned Rekod BSE-TG-772257161 / Status: Disahkan oleh penghantar / Rawatan / Racun; independent Google Sheet retrieval audit SENT / OWNER_ACTIVE at 2026-10-18T06:47:27.896Z, no domain write. Technical category labels absent.
- Full non-owner access/visibility negative proof, /history and /status walkthrough, and genuine BSE admin/team questionnaire and receiving sign-off remain **PENDING**.
- Overall PILOT_OPERATION **NOT DELIVERED**, notwithstanding source merge and positive two-report PILOT storage.

## Gate I read-only history / plot-status live reconciliation (2026-10-18 14:54–14:58 MYT)

- **/history 2026-10-13:** owner PM generated one automatic bot response (Sejarah TEST - 2026-10-13 / no rows); independent `PILOT_TELEGRAM_HISTORY_AUDIT` row at 2026-10-18T06:54:26.905Z recorded SENT, OWNER_ACTIVE, matched 0 and displayed 0.
- **/history 2026-10-18:** owner PM generated one automatic bot response including both refs BSE-TG-772257161 and BSE-TG-772257163; independent history audit 2026-10-18T06:58:29.843Z recorded SENT, OWNER_ACTIVE, **matched 2 / displayed 2**.
- **Important semantics:** `bseTelegramHistoryRecordEvents_` currently indexes date from `approval[15]` (human confirmation timestamp), only falling back to source message timestamp; it does not index `candidate.fields.event_date`. Therefore /history 13 Oct cannot find a treatment whose physical-work date was 13 Oct but whose Benar was 18 Oct. This is a date-semantics/product decision, not missing domain writes. Do not silently change to work-date semantics because it also affects daily/weekly digest windows.
- **/status plot M5P1:** owner PM automatic response said no ACTIVE allocation; independent `PILOT_TELEGRAM_PLOT_STATUS_AUDIT` at 2026-10-18T06:54:33.049Z recorded `NOT_FOUND / STATUS_NONE`. Independent `PILOT_PLOT_ALLOCATION` readback shows M5P1 and M5P2 allocation_status PLANNED, batch status PROPOSED; `PILOT_ALLOCATION_STATUS_EVENT` has **zero rows**. This is correct under the locked current ACTIVE-only status rule. Treatment records and allocation links still exist, and PLANNED must not be promoted to ACTIVE by AI.
- Original live responses still exposed inherited `Sejarah TEST`, `PRIVATE_SUBMISSION`, `Treatment_Event_Log`, and `allocation ACTIVE TEST` user jargon. A bounded PILOT-only display-only patch is appropriate without modifying ledger facts.

## PR #27 final presentation acceptance and access gate

- Canonical main efc4e9188e4e185e41ad70622bbcbdda22fbce03, PR #27 merged. Independent 70/70 Script HEAD JavaScript exact match, nine Gate F helpers preserved; 131/131 local checks; Apps Script 47/47 PASS at 15:06:17 MYT.
- Owner PM /history 2026-10-18 returned two real confirmed treatment records in plain-language presentation; independent Sheet History Audit 2026-10-18T07:07:25.282Z SENT, OWNER_ACTIVE, matched 2, displayed 2.
- Owner PM /status plot M5P1 returned a truthful non-ACTIVE response without exposing raw TEST jargon; independent Plot Status Audit 2026-10-18T07:07:29.636Z NOT_FOUND / STATUS_NONE. Two treatment rows and four allocation link rows remain intact; no status promotion.
- PILOT_OWNER_REGISTRY currently contains exactly one active owner row, zero enrolled non-owner people. Non-owner negative live proof therefore requires an actual additional authorized user; no token simulation, impersonation or synthetic test shall be claimed as a real access acceptance.
- Digest audit remains exactly one SENT row per schedule, and latest CONFIG_AUDIT says ON; these append-only audit records alone do not refresh the direct physical scheduler trigger-count proof after 11:37 MYT.
- Human-facing decision still open: should /history and report windows index confirmation date (as implemented) or operational event_date? Any semantic change impacts daily/weekly digests and needs separate architecture reconciliation and real regression, not an unannounced copy patch.