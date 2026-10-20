# Gate I — GI-SEMAI-267–269 plot-first Semai routing and Reply recovery

**Date:** 2026-10-20 MYT
**Environment:** PILOT_OPERATION shadow pilot
**Status:** LOCAL PASS ONLY; no GitHub merge, no Apps Script HEAD sync, no live Telegram rerun.

## Genuine failure — owner screenshots and independent live read-back

Two new reports were submitted in the group at approximately 16:16 MYT:

- `BSE-TG-772257267`: `M3P1 / Semai / Timun (7055 CCB+Sri Ayu) / 8-Aug-26`
- `BSE-TG-772257268`: `M3P2 / Semai / Timun (7055 CCB) / 8-Aug-26`

The bot incorrectly asked for Semai dosage using a Treatment clarification prompt. The owner replied `100` by Telegram Reply; the bot asked the same question again. As-of the investigation snapshot, the owner PILOT Sheet confirms:

| Queue row | Reference | State | Wrong candidate / linkage |
| --- | --- | --- | --- |
| 40 | 772257267 | WAITING_INFO | Treatment_Event_Log, `missing: crop, treatment_dosage, batch_match`; question message 273 |
| 41 | 772257268 | WAITING_INFO | Treatment_Event_Log; question message 277 |
| 42 | 772257269 | WAITING_INFO | Reply `100`, `reply_to_message_id=273`, `parent_update_id=772257267`; correctly linked but again classified Treatment_Event_Log, question message 276 |

No matching Crop Batch or Planting Event was found for source 772257267 at this checkpoint. The Reply **did link correctly**; the failure was a missing seed-sowing deterministic grammar for plot-first reports. The existing `bsePilotCompactSowingResult_` accepts Semai-first, and `bseTelegramSeedSowingDeterministicResult_` accepts `KERJA SEMAIAN BENIH`; neither recognized `M3P1\nSemai\n...`. The fallback `bseTreatmentListParseMessage_` interpreted `Semai` and the crop name as treatment items and the date as dosage.

## Controlled implementation

- New **PILOT_OPERATION-only** `bsePilotPlotFirstSowingResult_` in `TelegramWorkerTest.js`, before other deterministic sowing parsers and before Treatment/Gemini fallback.
- Strict four-line grammar: one canonical plot; `Semai`; explicit crop plus parenthesized variety; valid 2026 sowing date, including `8-Aug-26`. Produces exactly `Crop_Batch_Log`, `Planting_Event_Log` (`SEED_SOWING`), and `Plot_Allocation_Log`.
- Original Reply `100` is preserved as **uncategorized clarification provenance**. It is **not** silently assigned to a structured seed quantity (not in this three-candidate contract), nor to treatment dosage. No physical planting or stock level is inferred.
- Incomplete or ambiguous plot/crop/variety/date/extra lines remain `NEED_INFO` and **do not fall through into Treatment**.
- Existing classic Semai grammar, Transplant, Treatment, Harvest, TEST and PILOT_TEST boundaries remain unchanged.

## Verification

- Baseline reproduction from canonical `main`: `bsePilotPlotFirstSowingResult_` absent; actual PILOT queue classifies all three as Treatment.
- New targeted synthetic fixture `gate_i_semai_m3p1_reply_regression.test.cjs`: **10/10 PASS** including both M3P1/M3P2, parent question-id match vs mismatch, Reply `100`, invalid date, missing variety, extra lines and other-environment isolation.
- Existing Apps Script sowing boundary harness with new GI-SEMAI cases: **PASS** when invoked within isolated in-memory VM. The original three GI-REG-03 Apps Script harnesses still PASS in VM.
- Independent `bseUnifiedGuard_` fixture on a plot-first report: `PASS`, three atomic candidates, each `missing: []`.
- Full Node regression: **60/60 suites PASS**, JavaScript syntax **66/66 PASS**, Node tests syntax **60/60 PASS**, `git diff --check` **PASS**.
- **No Apps Script runtime proof:** neither `clasp push` nor Chrome UI Automation runtime execution nor new field report has been undertaken for this fix.

## Safety and next gate

Do not requeue, rewrite, approve, discard or replay genuine messages 772257267/268/269 automatically. Those existing WAITING_INFO entries remain under owner control; avoiding duplicate sowing events and review-card replay is critical. No PILOT Sheet, Telegram or official BSE write is within this code implementation. Merge/Apps Script HEAD update requires the repo-authorized gate; then validate via real Apps Script regression and a fresh controlled ordinary-user message.