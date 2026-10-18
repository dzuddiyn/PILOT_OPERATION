# Gate I — PILOT_OPERATION acceptance matrix (verified checkpoint)

**Date:** 2026-10-18 MYT (last Telegram live proof 12:05, latest independent Google Sheets read-back 13:53).
**State:** TECHNICAL PARTIAL VERIFIED / HANDOVER PREPARED / NOT DELIVERED.
**Canonical source:** dzuddiyn/PILOT_OPERATION main 53d95873700ebec3b9ead4b192e1fd0c3f06adcf (PR #22).
**Locked:** production_write:false; official_bse_write:false. No official BSE write/deployment.

| ID | Criterion | Outcome | Status |
| --- | --- | --- | --- |
| I-00-A | Daily 08:01 MYT owner PM | Autonomous CLOCK proof Telegram message 34, 2026-10-17; one Sheet SENT/production FALSE | LIVE PASS |
| I-00-B | Friday 07:59 MYT owner PM | Autonomous CLOCK proof Telegram message 35, 2026-10-09..15; one Sheet SENT/production FALSE; Gemini labelled NON_CANONICAL | LIVE PASS |
| I-00-C | Digest rollback and reschedule | Daily OFF/0 then ON/1 at 11:23–11:24; Friday OFF/0 then ON/1 at 11:33–11:36; final 11:37 UID marker and one trigger each | LIVE PASS |
| I-01 | Source and regression | PR #17–#22 merged; 70/70 Script HEAD files matched independent pull, 9 Gate F helpers preserved; 119/119 local checks; Apps Script full regression 47/47 PASS at 12:03 | VERIFIED |
| I-02 | General Telegram recovery | Gate H previously ON, webhook OFF; 11:20 Gate F audit shows offset 772257155, 3 CLOCK handlers, 2 callbacks PROCESSED. PR #19 defers exact ScriptLock busy collision. Historical transport failures remain observed | PARTIAL |
| I-03 | New genuine operational report → auto review → reporter Benar → domain write | No new owner-verifiable farm work fact has been provided. Prior Gate F confirmation / Gate H Batal are historical, not a NEW Gate I approval | BLOCKED: HUMAN FACT |
| I-04 | Ordinary-user read-only retrieval | 12:05 PM /retrieve BSE-TG-772257142 produced real Telegram bot reply with corrected Rekod PILOT / Mod PILOT, Timun Batu CCB, M5P1/M5P2; Sheet retrieval audit 2026-10-18T04:05:31Z SENT OWNER_ACTIVE | LIVE PASS for /retrieve |
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
- Sender permissions beyond owner, NEW factual positive Benar, new Gate I photo and BSE acceptance are unverified; do not promote them to PASS.
- Runtime evidence (private): PILOT_OPERATION_EVIDENCE/GATE_I_20261018_DIGEST_AUTO_LIVE_VERIFIED_PARTIAL_HANDOVER.md.
- PRs: #17 Digests; #18 Handover; #19 Poll lock and Gemini label; #20 Integrity auditor; #21 Parent lineage; #22 PILOT UI label.

**Next genuine human gate:** a real, owner-verified operational fact plus reporter Benar is required for the new positive E2E acceptance; separate BSE representative questionnaire/sign-off follows. Never fabricate physical work, create a fake official acceptance or mark DELIVERED prematurely.
