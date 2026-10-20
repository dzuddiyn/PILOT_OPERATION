# GI-SEMAI-274–276 — Semai date/plot order

**Environment:** PILOT_OPERATION
**Current status:** PR #136 MERGED; Script HEAD 76/76 VERIFIED; real Apps Script full regression 47/47 PASS. New Telegram date-before-plot field UX NOT_VERIFIED.

## Post-merge evidence — 2026-10-20

- Canonical main merge: `1024534fde08b9aff7740df0601939ba9460cdd3`.
- Script HEAD updated using `clasp push --force` with unchanged manifest and nine preserved Gate F runtime helpers. Independent `clasp pull`: 76/76 matching files.
- Real Chrome UI Automation run at 17:02:32 MYT: I-011 47 PASS / 0 FAIL, `production_write:false`. Independent Executions UI status: Selesai, 7.393 seconds.
- Live PILOT read-back: 274 and linked Reply 276 remain WAITING_INFO, no M3P2 sowing records. Separate report 275 was REPORTER_CONFIRMED and has one approved Crop Batch, one SEED_SOWING event and one M3P1 PLANNED allocation, all PROVISIONAL.
- No old messages replayed or approved by the agent; no new deployment or official BSE writes.

## Historical local-only baseline

## Genuine observation

- Telegram 772257274: Semai, Timun (7055 CCB), 8-Aug-26, M3P2. Bot asked for date and plot although both were present.
- Telegram 772257276: Reply 8/8/2026 correctly linked to 274, but bot still asked for plot.
- Independent PILOT queue: 274 WAITING_INFO with blank event_date and plot_id; 276 WAITING_INFO with event_date 2026-08-08 but blank plot_id.
- New plot-first 772257275 was PROCESSING in an initial snapshot; do not conflate that separate worker state with this parser fix.

## Root cause and bounded fix

- Existing compact parser assumed third line plot and fourth line date. Reply parsing incorrectly treated the latest answer as a date regardless of content.
- Recognize the final two lines by strict grammar, allowing plot/date or date/plot.
- Retain linked provenance and validate both explicit date and plot answers independently.
- Reject conflicting plots, invalid corrected dates, extra lines and ambiguous plot suffixes rather than fabricating missing facts.
- The locked pilot schema is Crop_Batch_Log, Planting_Event_Log (SEED_SOWING), Plot_Allocation_Log (PLANNED), always subject to human approval.
- Do not infer seed quantities, actual physical work or official production writes.

## Verification

- Baseline failure reproduced from canonical main.
- Targeted gate_i_semai_order_274_276.test.cjs: 14/14 PASS.
- Isolated actual-source Apps Script sowing boundary harness 11 cases PASS and unified guard PASS, 3 candidates without missing values.
- Full Node regression **62/62 PASS**; JavaScript syntax **66/66 PASS**; CJS test syntax **62/62 PASS**; `git diff --check` **PASS**.

## Gates

Owner-approved merge and Script HEAD sync require independent read-back, real Chrome UI Automation 47-check regression and proof in documentation.
Original records 274, 275 and 276 must not be replayed, approved, discarded, requeued or modified by this development task.
New Telegram field UX remains separately unverified until a genuinely new report.
