# Gate I — PILOT_OPERATION acceptance matrix (verified checkpoint)

**Date:** 2026-10-18 MYT (latest post-treatment integrity audit 15:28; Telegram user proof 15:07).
**State:** TECHNICAL PARTIAL VERIFIED / HANDOVER PREPARED / NOT DELIVERED.
**Canonical source:** dzuddiyn/PILOT_OPERATION main efc4e9188e4e185e41ad70622bbcbdda22fbce03 (PR #27).
**Locked:** production_write:false; official_bse_write:false. No official BSE write/deployment.

| ID | Criterion | Outcome | Status |
| --- | --- | --- | --- |
| I-00-A | Daily 08:01 MYT owner PM | Autonomous CLOCK proof Telegram message 34, 2026-10-17; one Sheet SENT/production FALSE | LIVE PASS |
| I-00-B | Friday 07:59 MYT owner PM | Autonomous CLOCK proof Telegram message 35, 2026-10-09..15; one Sheet SENT/production FALSE; Gemini labelled NON_CANONICAL | LIVE PASS |
| I-00-C | Digest rollback and reschedule | Daily OFF/0 then ON/1 at 11:23–11:24; Friday OFF/0 then ON/1 at 11:33–11:36; final 11:37 UID marker and one trigger each | LIVE PASS |
| I-01 | Source and regression | PRs #17-#27 merged; 70/70 Script HEAD independently pulled with 9 preserved Gate F helpers; 131/131 local Node checks; Apps Script full regression 47/47 PASS at 15:06 | VERIFIED SOURCE + SCRIPT HEAD; no Apps Script version/deployment |
| I-02 | General Telegram recovery | Gate H previously ON, webhook OFF; 11:20 Gate F audit shows offset 772257155, 3 CLOCK handlers, 2 callbacks PROCESSED. PR #19 defers exact ScriptLock busy collision. Historical transport failures remain observed | PARTIAL |
| I-03 | New genuine operational report → auto review → reporter Benar → domain write | Owner supplied/confirmed two genuine racun reports BSE-TG-772257161 and 772257163; PILOT Treatment Review APPROVED, two unique Treatment Event rows and four M5P1/M5P2 plot links; source callbacks PROCESSED. Physical work is reporter-declared, not independently observed by software | LIVE PASS FOR PILOT SHEET WRITE |
| I-04 | Ordinary-user read-only retrieval | /retrieve 772257161 at 14:47, /history 2026-10-18 at 15:07 (two real treatment refs), /status plot M5P1 at 15:07 (truthful no ACTIVE allocation); independent PILOT retrieval/history/status audit rows match Telegram | LIVE PASS FOR THREE COMMANDS, with ACTIVE and date semantics limits |
| I-05 | Evidence | Gate G independent historical PILOT Evidence/retrieval proof; no new Gate I photo | HISTORICAL LIVE PASS / NEW PROOF PENDING |
| I-06 | Visibility and authorization | Owner-only digest live delivery; runtime source guards tested. New non-owner negative proof not observed | PARTIAL |
| I-07 | Dedup / retry / callback | Gate H Batal and queue reconciliation previously live; digest one send per period; local wrong-env/lock tests PASS | VERIFIED TESTED SUBSET |
| I-08 | Fresh PILOT schema/source-key integrity | Owner Apps Script read-only audit at 15:28 MYT AFTER both real treatment writes: 61 declared, 31 CURRENT, 30 OPTIONAL_ABSENT, 0 stale/schema mismatches, 11/11 required CURRENT, 39 source entries, 0 issues; production/official writes false | LIVE PASS REQUIRED / OPTIONAL_TABS_ABSENT |
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

**Next gates:** obtain real non-owner access/visibility negative proof without impersonation; resolve history confirmation-date vs work-date decision (including digests); address latency against an agreed SLA; obtain genuine BSE admin/team questionnaire and receiving sign-off. New positive PILOT treatment E2E is already LIVE PASS for Sheet persistence. Never promote DELIVERED without human acceptance.

- Latest independent real treatment/UX and measured latency: docs/GATE_I_REAL_TREATMENT_UX_LATENCY_20261018.md and private PILOT_OPERATION_EVIDENCE/GATE_I_20261018_REAL_TREATMENT_AND_TELEGRAM_UX_LIVE_PASS.md.

## Gate I additional read-only acceptance — 2026-10-18 14:58 MYT

- `/history 2026-10-18` owner PM: LIVE PASS for existing confirmation-date semantics; two treatment references returned, Sheet HISTORY_AUDIT `SENT / OWNER_ACTIVE / matched 2 / displayed 2`. `/history 2026-10-13` returned 0, correctly under confirmation-date indexing but potentially surprising for users searching by **work date**. Event-date history vs confirmation-date history remains an explicit product semantics decision; do not rewrite canonical event dates or daily/weekly report periods without reconciliation.
- `/status plot M5P1` owner PM: `NOT_FOUND / STATUS_NONE` audited LIVE. Verified legitimate reason: M5P1/M5P2 source allocations are `PLANNED`, Crop Batch is `PROPOSED`, no `ALLOCATION_STATUS_EVENT` exists. ACTIVE-only plot-status resolver must not show those plots as ACTIVE. Treatment data persists independently in PILOT_TREATMENT_EVENT.
- User-facing history and plot-not-active messages contained inherited TEST/technical labels; display-only improvements should be released separately and verified after source and runtime tests.
- New two-treatment positive reporter-confirmed PILOT Sheet persistence (I-03) is LIVE PASS as of 18 October and supersedes historical "HUMAN FACT REQUIRED" notes.

## Latest verified Gate I closeout: PR #27 (2026-10-18 15:07 MYT)

- PILOT owner /history 2026-10-18 returned two reporter-confirmed treatment entries as "Sejarah pengesahan" and "Rawatan / Racun" with no inherited TEST/raw category UI text. Independent PILOT_TELEGRAM_HISTORY_AUDIT SENT / OWNER_ACTIVE, matched 2/displayed 2 at 2026-10-18T07:07:25.282Z.
- PILOT owner /status plot M5P1 returned "Tiada rekod tanaman berstatus aktif untuk plot ini." Independent PILOT_TELEGRAM_PLOT_STATUS_AUDIT NOT_FOUND / STATUS_NONE at 2026-10-18T07:07:29.636Z. Underlying allocations are PLANNED and no ACTIVE status transition exists; this truthful negative response must not be called an activated-plot PASS.
- Positive two racun reports 772257161/163 are stored in exactly two Treatment Event rows and four Treatment Allocation links. Both original reporters' human confirmations were evidenced; physical operations are self-reported.
- PR #27 merged main efc4e918; isolated Script HEAD source 70/70 MATCH, 9 Gate F helpers preserved; local Node 131/131 PASS; final Apps Script 47/47 PASS at 15:06:17. No version/deployment update or official production write.
- The latest directly observed Daily/Friday scheduler trigger runtime remains the earlier owner inspector evidence, not an inferred new 15:07 trigger inspection. Final independent Sheets still have exactly one SENT Daily and Friday digest each.
- Independent 2026-10-18 15:18+ MYT PILOT_OWNER_REGISTRY read-back found a single active owner and no enrolled non-owner user. Therefore a genuine non-owner negative visibility test is not currently possible without authorized real-user onboarding; local mock checks must not be promoted to LIVE PASS.
- Remaining: genuine non-owner negative visibility proof, date semantics acceptance (confirmation vs work date), latency issue, corporate questionnaire and sign-off. PILOT_OPERATION HANDOVER PREPARED, NOT DELIVERED.
## Final independent post-treatment integrity audit (15:28 MYT)
- Script log PILOT_OP_INTEGRITY_AUDIT: 2026-10-18 15:28:46 MYT, execution completed, read_only:true.
- 61 registry items, 31 CURRENT, 30 OPTIONAL_TABS_ABSENT, 0 STALE, 0 SOURCE_MISMATCH, all 11 required CURRENT, 39 source-key entries, 0 issues. production_write:false / official_bse_write:false.
- This replaces the earlier 11:53 audit counts (26 CURRENT, 35 optional missing, 16 entries) for latest integrity status; the earlier historical audit remains valid at its recorded time.
- Corporate sign-off and genuine non-owner negative access proof are still outstanding; no business status or operational ledger fields changed by the audit. Gate I NOT DELIVERED.