# Gate I — GI-SEMAI-267–269 plot-first Semai routing and Reply recovery

**Date:** 2026-10-20 MYT
**Environment:** PILOT_OPERATION shadow pilot
**Current status:** PR #134 MERGED / PILOT_OPERATION Script HEAD UPDATED / independent source read-back **76/76 PASS** / real Apps Script Editor regression **47/47 PASS**. Telegram post-fix field behavior **NOT_VERIFIED**; no owner approval or earlier pending records were replayed.

## Post-merge runtime verification — 20 October 2026

- GitHub PR #134 MERGED; main merge SHA `6d5347defe74631cd7f7951c6e97907648053946` independently confirmed.
- Before Apps Script push, independent `clasp pull` matched prior Script HEAD **76/76**. Fresh staging from merged GitHub main preserved exactly nine Gate F-only runtime helpers. Staged-vs-HEAD diff: **only `TelegramWorkerTest.js`**. The `appsscript.json` manifest and script binding did not change.
- Owner bulk-authorized `clasp push --force` exit 0 (Script HEAD update, **not version/deployment**). Fresh independent `clasp pull` afterward **76/76 files identical**, zero missing/extra/content mismatches.
- Chrome Apps Script Editor UI Automation explicitly selected `runBseI011FullRegression`, invoked once for this recorded run, and read real JSON log: `started_at=2026-10-20T08:36:14.567Z`, `finished_at=2026-10-20T08:36:18.852Z`, `total=47`, `passed=47`, `failed=0`, `production_write=false`.
- Independent Chrome **Apps Script → Executions** UI: function `runBseI011FullRegression` at **16:36:12 MYT**, 5.914 seconds, status **Selesai**. An additional completed Editor run at 16:35:51 was visible, but its origin was not established or claimed by this proof.
- Fresh owner PILOT Sheets read-back: original queue rows 40, 41 and 42 remained `WAITING_INFO`; Reply `772257269` still has `reply_to_message_id=273` and `parent_update_id=772257267`. No old report replay, queue reset, actual Telegram send or callback was performed by this change.
- **Verdict:** CODE MERGED / SCRIPT HEAD VERIFIED / APPS SCRIPT RUNTIME 47/47 PASS. **NEW TELEGRAM SOWING FLOW UX / PILOT persistence: NOT_RUN**. Legacy pending queue records remain under human control, and this does not prove a physical sowing event occurred.

## Historical baseline — genuine failure — owner screenshots and independent live read-back

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
- **Historical local-only checkpoint, superseded above:** before GitHub merge and the owner-authorized Script HEAD update, no Apps Script runtime proof had yet been run. The subsequent live Apps Script **47/47 PASS** is recorded in the post-merge section. A new Telegram field report is still **NOT_RUN**.

## Safety and next gate

Do not requeue, rewrite, approve, discard or replay genuine messages 772257267/268/269 automatically. Those existing WAITING_INFO entries remain under owner control; avoiding duplicate sowing events and review-card replay is critical. The code merge and Script HEAD sync are completed and verified above. The only remaining scoped gate is **a genuinely new Telegram sowing message**, then independent confirmation that the new message routes to Crop Batch/Planting Event and reaches the right human-approval card without a Treatment dosage question. No PILOT Sheet, Telegram or official BSE write was performed by the audit agent.