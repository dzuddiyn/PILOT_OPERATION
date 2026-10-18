# Gate I — PILOT_OPERATION acceptance matrix (verified checkpoint)

**Date:** 2026-10-18 MYT (latest Telegram and independent Google Sheet /retrieve 14:47; PR #25 Script HEAD/regression 14:45).
**State:** TECHNICAL PARTIAL VERIFIED / HANDOVER PREPARED / NOT DELIVERED.
**Canonical source:** dzuddiyn/PILOT_OPERATION main 9c176d9de0139ffc6791fa6d0931044ec7f850c4 (PR #25).
**Locked:** production_write:false; official_bse_write:false. No official BSE write/deployment.

| ID | Criterion | Outcome | Status |
| --- | --- | --- | --- |
| I-00-A | Daily 08:01 MYT owner PM | Autonomous CLOCK proof Telegram message 34, 2026-10-17; one Sheet SENT/production FALSE | LIVE PASS |
| I-00-B | Friday 07:59 MYT owner PM | Autonomous CLOCK proof Telegram message 35, 2026-10-09..15; one Sheet SENT/production FALSE; Gemini labelled NON_CANONICAL | LIVE PASS |
| I-00-C | Digest rollback and reschedule | Daily OFF/0 then ON/1 at 11:23–11:24; Friday OFF/0 then ON/1 at 11:33–11:36; final 11:37 UID marker and one trigger each | LIVE PASS |
| I-01 | Source and regression | PR #17–#25 merged; 70/70 Script HEAD files matched independent pull, 9 Gate F helpers preserved; 128/128 local checks; Apps Script full regression 47/47 PASS at 14:45 | VERIFIED |
| I-02 | General Telegram recovery | Gate H previously ON, webhook OFF; 11:20 Gate F audit shows offset 772257155, 3 CLOCK handlers, 2 callbacks PROCESSED. PR #19 defers exact ScriptLock busy collision. Historical transport failures remain observed | PARTIAL |
| I-03 | New genuine operational report → auto review → reporter Benar → domain write | Owner supplied/confirmed two genuine racun reports BSE-TG-772257161 and 772257163; PILOT Treatment Review APPROVED, two unique Treatment Event rows and four M5P1/M5P2 plot links; source callbacks PROCESSED. Physical work is reporter-declared, not independently observed by software | LIVE PASS FOR PILOT SHEET WRITE |
| I-04 | Ordinary-user read-only retrieval | After PR #25, owner PM /retrieve BSE-TG-772257161 at 14:47 returned readable record/status/treatment fields, independent retrieval Sheet audit SENT OWNER_ACTIVE at 2026-10-18T06:47:27.896Z; no new domain write | LIVE PASS for /retrieve |
| I-05 | Evidence | Gate G independent historical PILOT Evidence/retrieval proof; no new Gate I photo | HISTORICAL LIVE PASS / NEW PROOF PENDING |
| I-06 | Visibility and authorization | Owner-only digest live delivery; runtime source guards tested. New non-owner negative proof not observed | PARTIAL |
| I-07 | Dedup / retry / callback | Gate H Batal and queue reconciliation previously live; digest one send per period; local wrong-env/lock tests PASS | VERIFIED TESTED SUBSET |
| I-08 | Live schema/source-key integrity | 11:53 owner read-only Apps Script audit: 61 registry, 26 CURRENT, 35 OPTIONAL MISSING, 0 stale/mismatch; 11/11 required CURRENT, 16 source entries, 0 issues; PR #20/#21 | REQUIRED LIVE PASS, OPTIONAL_TABS_ABSENT |
| I-09 | SOP and rollback | GATE_I_OPERATIONS_HANDOVER.md prepared, both digest OFF/readback/ON rehearsed. Gate H rollback tested in separate evidence | PREPARED / ROLLBACK LIVE PASS |
| I-10 | Team questionnaire and official BSE handover sign-off | No genuine ops/admin questionnaire and signed receipt | HUMAN ACCEPTANCE PENDING |

## Independent facts and limitations

- At 13:53 independent PILOT Sheets still had exactly one SENT row for each digest (Telegram 34 and 35) and the latest 12:05 /retrieve was recorded SENT / OWNER_ACTIVE.
- Apps Script runtime trigger count was last directly inspected at 11:37. CONFIG_AUDIT entries confirm restoration history, but are not fresh real-time trigger observation at 13:53.
- Final Apps Script Script HEAD matched all 70 JS files with zero differences; clasp push did not create a version, update a deployment or promote official BSE production.
- The 35 uncreated tabs are optional; no synthetic seed/repair. Initial 6 source-key warnings were auditor false positives due parent_update_id lineage and repeatable retrieval audit; PR #21 fixed logic, not domain data.
- PR #22 PILOT-only fixed TEST labels and was verified in a Telegram auto-reply at 12:05, without changing PILOT_TEST/TEST.
- Sender permissions beyond owner, new Gate I photo and BSE acceptance remain unverified. New positive reporter Benar and treatment PILOT Sheet writes are now LIVE PASS; no independent physical farm-operation observation is implied.
- Runtime evidence (private): PILOT_OPERATION_EVIDENCE/GATE_I_20261018_DIGEST_AUTO_LIVE_VERIFIED_PARTIAL_HANDOVER.md.
- PRs: #17 Digests; #18 Handover; #19 Poll lock and Gemini label; #20 Integrity auditor; #21 Parent lineage; #22 PILOT UI label.

**Next gates:** complete /history and /status plus appropriate non-owner access test, then obtain genuine BSE admin/team questionnaire and receiving sign-off. Positive treatment E2E is already LIVE PASS for PILOT Sheet writes. Never fabricate corporate acceptance or mark DELIVERED prematurely.

- Latest independent real treatment/UX and measured latency: docs/GATE_I_REAL_TREATMENT_UX_LATENCY_20261018.md and private PILOT_OPERATION_EVIDENCE/GATE_I_20261018_REAL_TREATMENT_AND_TELEGRAM_UX_LIVE_PASS.md.

## Gate I additional read-only acceptance — 2026-10-18 14:58 MYT

- `/history 2026-10-18` owner PM: LIVE PASS for existing confirmation-date semantics; two treatment references returned, Sheet HISTORY_AUDIT `SENT / OWNER_ACTIVE / matched 2 / displayed 2`. `/history 2026-10-13` returned 0, correctly under confirmation-date indexing but potentially surprising for users searching by **work date**. Event-date history vs confirmation-date history remains an explicit product semantics decision; do not rewrite canonical event dates or daily/weekly report periods without reconciliation.
- `/status plot M5P1` owner PM: `NOT_FOUND / STATUS_NONE` audited LIVE. Verified legitimate reason: M5P1/M5P2 source allocations are `PLANNED`, Crop Batch is `PROPOSED`, no `ALLOCATION_STATUS_EVENT` exists. ACTIVE-only plot-status resolver must not show those plots as ACTIVE. Treatment data persists independently in PILOT_TREATMENT_EVENT.
- User-facing history and plot-not-active messages contained inherited TEST/technical labels; display-only improvements should be released separately and verified after source and runtime tests.
- New two-treatment positive reporter-confirmed PILOT Sheet persistence (I-03) is LIVE PASS as of 18 October and supersedes historical "HUMAN FACT REQUIRED" notes.
