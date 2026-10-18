# OpsMate BSE site B v1.0 Final Handover

## Definisi status

| Status | Definisi |
|---|---|
| Planned | Reka bentuk atau skop telah dicadangkan/diluluskan, tetapi belum dilaksanakan. |
| Implemented | Perubahan sumber telah dilaksanakan secara setempat. |
| TEST regression PASS | Semakan sintaks dan harness/regression berkaitan lulus. |
| TEST runtime PASS | Tingkah laku telah disahkan pada projek Apps Script TEST dengan bukti runtime. |
| Production-ready | Semua kawalan, ujian, dokumentasi, dan keputusan operasi yang diperlukan telah diluluskan untuk production. |
| Pilot accepted | Pilot kerja sebenar telah diterima oleh BSE mengikut skop dan kriteria penerimaan yang dipersetujui. |
| Final handover | Handover rasmi dibuat selepas production gate dan penerimaan pilot dipenuhi. |

## Bukti checkpoint TEST

| Komponen | Bukti commit | Status bukti |
|---|---|---|
| Fasa 2A — proposal Crop Batch | `bbad077` | Siap TEST dan committed. |
| Fasa 2B — human review Crop Batch | `c57dac8` | Siap TEST dan committed. |
| Fasa 2C-1 — Transplant / Pindah Anak Pokok | `4869e60` | Siap TEST, committed, dan runtime-tested. |
| Plot Allocation Change / Reallocation semasa Transplant | PILOT_TEST Telegram E2E LIVE VERIFIED — Batal + Benar | Baseline `PLOT_ALLOCATION` immutable; append-only Reallocation Event + Transplant Event + Allocation Status ledger. Batal proof: `BSE-TG-746192340` reached `DISCARDED_BY_REPORTER` with zero domain writes and no second reason prompt. Benar proof: `BSE-TG-746192342` / card 267 wrote M1P1→M1P3 as `BSE-SB-RA-20261015-001` + `BSE-SB-TR-20261015-001` and activated PA-001 at M1P3; `BSE-TG-746192344` / card 273 used strict natural shorthand and wrote M1P2→M1P4 as `BSE-SB-RA-20261015-002` + `BSE-SB-TR-20261015-002`, activating PA-002 at M1P4. Independent read-back confirms both status rows `PLANNED→ACTIVE` while original M1P1/M1P2 allocation rows remain unchanged. Live defects/fixes: source_plot finalization `e4fbb7d`; two-button effective markup `15becc6`; clear source options `26cd33c`; labelled source excluded from destination parsing `c64f883`; strict one-line shorthand `0617ce5`. Targeted reallocation 10/10, targeted UI 6/6, full regression 47/47, schema 57/57 CURRENT, source audit 205/0, production false. |
| Reminder Telegram harian (historical Google Tasks path) | `cc20f3d` | Historical TEST evidence sahaja; feature disupersede untuk current MVP/shadow pilot oleh ZASS D-027. |
| Pengesahan penghantar & Delete owner | `f7e97fe`, `87ef697` | Kad group penghantar, notis PM, dan `/delete` dua-pengesahan (`VOIDED_TEST`) siap TEST; runtime-tested bagi Inventory/Claim, termasuk penolakan jelas untuk akaun bukan owner/admin tanpa domain write. |
| File Evidence — registration gate, intake & PM retrieval | Runtime TEST PASS | `/start BSE_TEST` mencipta `REGISTRATION_PENDING`; kad `TERIMA`/`TOLAK` dihantar kepada owner aktif, keputusan pertama menutup kad lain, dan pemohon menerima satu notis. PHOTO/DOCUMENT/VIDEO diuji melalui Telegram: `Benar` menyimpan fail ke Drive TEST sahaja, menutup kad, menghantar resit PM penghantar, ringkasan PM owner/admin, dan makluman group minimum. Ahli aktif boleh menghantar `/retrieve BSE-EV-...` melalui PM; akses visibility disemak dan fail dihantar semula melalui Telegram tanpa pautan Drive. Callback batch, retrieval audit, dan dedup kekal TEST-only (`production_write:false`). |
| PM retrieval — `/status plot M2P1` | Runtime TEST PASS | Owner/admin atau ahli `REGISTERED_ACTIVE` mendapat ringkasan allocation ACTIVE yang diluluskan, banci terakhir, dan rawatan terakhir daripada rekod TEST sahaja. Runtime PM mengesahkan M2P1 dengan Timun, allocation `ACTIVE`, banci 96 pokok, dan rawatan terakhir. Group menerima arahan PM minimum tanpa data plot; setiap permintaan diaudit dan tiada domain/production write. |
| PM retrieval — `/summary plot M2P1,M2P2` | Runtime TEST PASS | Rumusan dua hingga enam plot unik melalui PM, menggunakan sumber TEST dan audit yang sama. Runtime PM mengesahkan M2P1 dipaparkan lengkap serta M2P2 yang tiada allocation ACTIVE dipaparkan secara selamat. Group dan user tidak aktif kekal tanpa data melalui kawalan akses dan regression. |
| PM retrieval — `/retrieve BSE-TG-<update_id>` | Runtime TEST PASS | Retrieval PM default-deny untuk rekod yang sudah `REPORTER_CONFIRMED`, dengan hash integrity, audit berasingan, dan ringkasan field terkawal. Runtime owner/admin membuktikan Claim `BSE-TG-146694289` dipulangkan sebagai `INVENTORY_CLAIM` tanpa domain/production write. Rekod group `FIELD_OPERATION` / `ASSET_EQUIPMENT` tersedia kepada ahli aktif; Claim, private, dan rekod tidak dikelas kekal restricted kepada penghantar asal atau owner/admin. |
| PM history — `/history YYYY-MM-DD`, `/history YYYY-MM`, `/history week last`, `/history week N YYYY-MM`, `/history week <Friday YYYY-MM-DD>` | PILOT_TEST runtime PASS | Owner/admin atau `REGISTERED_ACTIVE` melalui PM. Weekly history menggunakan window Jumaat-Khamis; `week N YYYY-MM` bermaksud Jumaat ke-N dalam bulan pilihan user hingga Khamis berikutnya. Runtime week 2 Oct (`2026-10-09..2026-10-15`) memulangkan 20 authorized events. Owner/admin mendapat rekod authorized penuh; user biasa hanya rekod sendiri atau `GROUP_STANDARD`; restricted/private kekal default-deny. |
| PM report — `/report YYYY-MM-DD` atau `/report YYYY-MM` | TEST runtime PASS | PM owner/admin sahaja. Memulangkan fakta canonical TEST yang terkawal, diikuti komen Gemini yang dilabel bukan fakta dan tidak boleh mengubah rekod. Kegagalan Gemini kekal fail-selamat: fakta dipulangkan, manakala audit menyimpan status tanpa credential. Daily Morning Digest 08:01 MYT menggunakan renderer ini untuk hari sebelumnya. |
| PoC retrieval sejarah / laporan Gemini / EC Leaching | PILOT_TEST runtime PASS | EC Leaching menerima tarikh/sesi/bacaan deterministik, kad `Benar`/`Betulkan`/`Batal`, batch atomik, audit/hash/idempotence. Dedicated `/ec_history` kini membaca `TEST_EC_LEACHATE` secara langsung bagi hari/bulan/minggu; runtime `/ec_history week 3 2026-09` memulangkan 1 batch / 21 bacaan confirmed pada 2026-09-21 dengan `production_write:false`. General `/history` kekal ringkasan silang-domain. |
| Fasa 2C-2A — Banci Pokok | `f9da6a2` | Siap TEST, committed, dan runtime-tested. Regression/harness PASS; runtime membuktikan laporan satu plot, `Batal` audit sahaja, `Betulkan` one-shot, pengaktifan allocation melalui Transplant, serta Banci dua plot. `BSE-TG-146694362` diretrieve sebagai `M2P1: 93 pokok`; `BSE-TG-146694372` diretrieve sebagai `M2P1: 92 pokok, M2P2: 88 pokok`. Semua bukti kekal `production_write:false`. |
| Fasa 2C-2B — Rawatan sebenar | PILOT_TEST Telegram E2E LIVE VERIFIED — lifecycle corrected 2026-10-15 | D-043 kini lifecycle-aware: rawatan polybag sah pada allocation PLANNED selepas semai sebelum transplant, kemudian mengikuti effective ACTIVE allocation as-of tarikh rawatan. Real message `BSE-TG-746192346` / card 284 direkod sebagai satu Treatment `BSE-SB-TX-20261015-001` untuk Peria M3P3+M3P4 pada 15/10/2026, `Chlorine Tablets - 2 botol = 2 tong biru`, dengan dua allocation links. Initial wrong-domain Input Usage M3P3 dikekalkan `VOIDED_TEST`; M3P4 superseded menghasilkan tiada row. Queue final `REPORTER_CONFIRMED`. D-043 18/18, Treatment review 5/5, D-048 10/10, exact corpus 21/21, full regression 47/47, source audit 220/0 CURRENT, schema 57/57 CURRENT, production false. |
| Plant Replacement / Sulam | PILOT_TEST Telegram E2E LIVE VERIFIED | Dedicated `Plant_Replacement_Event_Log` + review audit implemented. Deterministic parser routes replacement wording before Plant Condition/Gemini, requires explicit positive replacement count and valid plot/date, resolves crop only from a unique ACTIVE allocation as-of event date, and never mutates Plant Census. Live `BSE-TG-746192324` produced exactly one `VERIFIED_TEST` event `BSE-SB-PR-f09986463084`; independent Sheet read-back and exact-reference retrieval passed; duplicate replay remained idempotent. |
| PILOT_TEST runtime binding + isolation | `docs/PILOT_TEST_RUNTIME_ISOLATION_EVIDENCE.md` | Environment adapter implemented. TEST runtime full regression 23/23 PASS dan mengekalkan TEST target names; PILOT_TEST runtime full regression 23/23 PASS, mapped `PILOT_TEST_*` targets, fixed Evidence binding, dan cross-environment guard PASS. Apps Script TEST_ONLY write ke workbook PILOT_TEST dibaca semula secara bebas; TEST workbook salah ditolak sebelum fake writer dipanggil. Temporary formula/probe/onOpen artifacts dibuang. Automation OFF. |
| PILOT_TEST controlled replay | `PTR-20261006-001` -> `PTR-20261006-003` | Run pertama menemui dua mismatch parser; fix TEST merged `482779f`, dan `PTR-20261006-002` mencapai **10/10 boundary-correct PASS**. `PTR-20261006-003` kemudian menutup dependency-required Crop/Transplant/Census review paths: exact historical M2P2 Transplant + Banci lulus terhadap isolated prerequisite/allocation lineage, manakala source-derived M1P1 Crop kekal `WAITING_INFO` kerana variety tiada dan tidak direka. Partial TEST_ONLY proof write direconcile sebelum resume idempotent; semua synthetic proof rows/sheets dan temporary Apps Script stepper dibuang selepas read-back. Tiada Telegram API, automation, production write, atau official BSE write. |
| PILOT_TEST dependency/comparator gate | `docs/PILOT_TEST_DEPENDENCY_COMPARATOR_EVIDENCE.md` | Dependency review proof `PTR-20261006-003` PASS + cleanup PASS. Asset registry/maintenance/measurement-observation/qualitative plant-condition comparators are bound; supplemental asset new-in-use source and File Evidence source-record comparator added. Leave exact comparator, exact numeric Plant Condition comparator, dan pre-acquisition Asset proposal chronology were not found and are explicitly `LEGACY_MISSING` under D-050 no-invention rule. Previously `OPEN_CONTROLLED` comparator set is now fully classified. |
| I-011 regression | `3a3770c` | TEST runtime PASS: `runBseI011ImplementationOnly` 17/17 PASS dan `runBseI011FullRegression` 22/22 PASS, 0 FAIL, `production_write:false`. Kedua-dua bukti runtime dibuat melalui custom-function TEST_ONLY dalam workbook `Kerani_AI_BSE_SB_TEST`, dibaca semula secara bebas, kemudian sheet probe dan wrapper sementara dibuang. |
| Real-message field test | PILOT_TEST live extension 2026-10-15 | Existing 13/13 historical field suite remains preserved. New live probes: Site A pond-level message `BSE-TG-746192350` stopped as `OUT_OF_SCOPE_TEST`; Site B pond-level message `BSE-TG-746192351` exposed a boundary gap where Gemini produced invalid `M0P0` Measurement. No domain write occurred. Receiver now treats `Kolam Site B` like numbered pond observations: `ASSET_OBSERVATION_UNSUPPORTED_TEST`, before worker/Gemini. Existing row reclassified audit-safely, stale clarification retained as history. Queue-boundary regression 5/5 and full regression 47/47 PASS; production false. |

Fasa 2C-2A dan 2C-2B ialah sebahagian 2C-2. Per stable ZASS D-050 dan owner lock 2026-10-11, baki 2C-2 yang tidak pasti serta seluruh Fasa 2C-3 kekal `DEFERRED_BY_LOCKED_SCOPE` dan tidak akan dibina tanpa keperluan operasi baharu yang jelas. Plant Replacement/Sulam diluluskan secara eksplisit sebagai next feature berasingan; OCR minimum PoC turut diluluskan sebagai capability kecil selepas scheduler proof.
Semua checkpoint di atas kekal TEST-only;
ia bukan bukti bahawa production-ready, pilot accepted, atau final handover telah
dicapai.

## Jadual kerja mengikut dependency

| Trek | Urutan kerja bergantung | Status semasa |
|---|---|---|
| A. Domain / pilot entry | 2C-2A -> 2C-2B -> MVP scope freeze -> PILOT_TEST -> PILOT_OPERATION | PILOT_TEST closeout PASS. New canonical workspace `dzuddiyn/PILOT_OPERATION` seeded from locked source baseline. Gate A truth/authority reconciliation COMPLETE. Gate B environment adapter is implemented on feature branch with local isolation 19/19, Apps Script isolation 19/19 and full regression 47/47 PASS; merge/runtime binding still pending. General Telegram receive/worker polling kekal OFF. Production gate kekal berasingan. |
| B. Platform | File Evidence architecture -> registration gate -> File Evidence TEST -> PM retrieval -> owner/admin registry + Telegram human review -> text reporting | Registration gate, intake/Drive Evidence, dan PM retrieval telah diimplementasi serta runtime-tested dalam TEST. Google Tasks/Task List telah dikeluarkan daripada MVP/shadow pilot oleh D-027; tiada replacement reminder tersirat. |

Scheduler reporting telah dikunci dan dipasang dalam PILOT_TEST:
- Daily Morning Digest: 08:01 MYT setiap hari, laporan hari sebelumnya, PM owner/admin.
- Friday Weekly Digest: 07:59 MYT setiap Jumaat, window 7 hari lengkap Jumaat-Khamis,
  PM kepada owner/admin/REGISTERED_ACTIVE user mengikut visibility filtering.
Daily Morning Digest achieved autonomous LIVE PASS on 2026-10-12 with independent audit
read-back (8/8 records, Telegram message ID 167, trigger rescheduled). Friday Weekly Digest
achieved AUTONOMOUS LIVE PASS on 2026-10-15 through an accelerated owner-runtime one-shot
proof (Telegram message ID 293, audit `SENT`, one send row only); scheduler configuration was
then restored to Friday 07:59 MYT.

## Syarat selesai dan production gate

Setiap item hanya boleh ditanda selesai apabila mempunyai commit, ujian relevan,
dan bukti runtime apabila item itu melibatkan runtime atau integrasi Apps Script.
Perubahan promotion seterusnya mesti mengikuti `docs/PILOT_OPERATION_EXECUTION_PATH.md`.
`PILOT_OPERATION` boleh menyimpan data operasi sebenar ke Spreadsheet/Drive PILOT yang
terasing sambil mengekalkan `production_write:false` dan `official_bse_write:false`.
Ini bukan production rasmi BSE.

Status production ialah **belum layak**. Sebelum sebarang production/final corporate
handover, OpsMate memerlukan `PILOT_OPERATION` yang diverifikasi, bukti penerimaan BSE,
dan kelulusan production gate yang berasingan. Google Task completion tidak pernah
menjadi kelulusan automatik atau bukti penerimaan pilot.

## Gate I truth checkpoint — 2026-10-18
- Canonical main at I-00 start: eaa6e72 (PR #16 merged). Gate H PILOT_OPERATION Telegram automation LIVE PASS and final independent audit ON / one bseTelegramTick trigger / no webhook; earlier B/automation OFF statements are historical only.
- Gate I-00 PILOT_OPERATION Daily/Friday scheduler feature: LOCAL PASS only (12/12 targeted, 80/80 Gate E/F/H), unmerged and Script HEAD not updated at this checkpoint. Do not claim digest LIVE PASS until actual Telegram scheduled receipt and independent PILOT_* audit.
- Gate I ordinary-user positive store/retrieve, fresh audits and handover remain PENDING. Real operation confirmation and BSE questionnaire/sign-off cannot be manufactured.
- production_write:false; official_bse_write:false; production gate separately authorized.

- Gate I-00 LIVE proof update (2026-10-18): PR #17 merged main bd3921b; Script HEAD 69/69 readback, Apps Script full regression 47/47 PASS; daily owner PM 34 and Friday owner PM 35 emitted by accelerated CLOCK triggers and PILOT_* audits SENT; schedulers ON / exactly 1 trigger each on independent 11:08 owner runtime audit. Remaining Gate H tick overlap and Gemini PILOT label issues are under repair; Gate I acceptance/handover still PENDING.

## Final 2026-10-18 Gate I technical checkpoint
- Canonical main 53d9587 (PRs #17-#22 merged). PILOT Digest I-00 Daily 08:01 MYT and Friday 07:59 MYT AUTONOMOUS LIVE PASS, Telegram IDs 34/35, one Sheet SENT each, both rollback OFF/0 -> ON/1 live proven; next normal schedules restored.
- Script HEAD 70/70 MATCH, 9 Gate F helpers preserved; local 119/119 PASS and final Apps Script full regression 47/47 PASS. No Apps Script deployment or official BSE write.
- Independent PILOT_OPERATION audit: 61 registered schemas, 26 CURRENT, 35 OPTIONAL_MISSING, 11/11 required CURRENT, 16 source entries / 0 issues after PR #21. Audit is read-only; no fake seed.
- Ordinary owner Telegram /retrieve existing record 12:05 MYT LIVE PASS, corrected PILOT-only labels; Sheet retrieval audit SENT/OWNER_ACTIVE. Fresh NEW true farm report human Benar, non-owner negative visibility, team questionnaire and BSE sign-off remain PENDING. Gate I NOT DELIVERED.
- Locked: production_write:false, official_bse_write:false. Reference latest docs/GATE_I_ACCEPTANCE_MATRIX_20261018.md and private Gate I evidence.

## Gate I real treatment and Telegram UX — 2026-10-18 14:48 MYT
- Actual owner-reported positive PILOT treatment Benar FLOW LIVE PASS: refs 772257161 and 772257163, two distinct PILOT_TREATMENT_EVENT rows, four plot link rows, review APPROVED and callback PROCESSED. No claim of independent physical work observation.
- Merged PRs #24 and #25: PILOT-only user-readable presentation, hide TEST/PILOT/production technical scaffolding, resolve reporter name from stored source metadata, translate record/review fields. Full local 128/128 PASS, owner Apps Script 47/47 PASS, independent Script HEAD 70/70 MATCH. Name notice is not yet live re-proven after code patch.
- Real PM Telegram /retrieve BSE-TG-772257161 at 14:47 MYT displayed 'Status: Disahkan oleh penghantar / Rawatan / Racun', with independently corroborated SENT/OWNER_ACTIVE Sheet audit.
- Gate I delivery still PENDING remaining user walkthrough/access verification, genuine BSE admin/team questionnaires and receiving sign-off; official production write/integration disabled. Latency measured but not claimed solved. Detailed source/evidence: docs/GATE_I_REAL_TREATMENT_UX_LATENCY_20261018.md.
- Additional 2026-10-18 14:58 Gate I PM proof: `/history 2026-10-18` returned exactly two confirmed PILOT treatment refs; HISTORY_AUDIT independently SENT/OWNER_ACTIVE/matched=2/displayed=2. The old history-date filter indexes confirmation 2026-10-18, not work dates 2026-10-13/15; that remains an explicit business-semantic distinction. `/status plot M5P1` correctly reported no ACTIVE allocation, because PILOT_PLOT_ALLOCATION rows are PLANNED and PILOT_ALLOCATION_STATUS_EVENT is empty (no permission to invent activation). User-message legacy labels from those commands are being refined separately.

## Final 2026-10-18 Gate I Telegram UX re-proof
- PR #27 merged main efc4e918; 70/70 Apps Script Script HEAD source files independently matched, 9 preserved Gate F helpers; 131/131 local Node checks PASS, 47/47 Apps Script full regression PASS at 15:06 MYT. No version/deployment/production write.
- 15:07 owner PM /history 2026-10-18 LIVE PASS with refs BSE-TG-772257161 and 772257163 in plain language, independent HISTORY_AUDIT SENT/OWNER_ACTIVE/matched 2/displayed 2 at 2026-10-18T07:07:25.282Z.
- 15:07 /status plot M5P1 LIVE proof returned truthful no-ACTIVE status; independent PLOT_STATUS_AUDIT NOT_FOUND/STATUS_NONE at 2026-10-18T07:07:29.636Z. Source allocations PLANNED; do not infer ACTIVE.
- Real confirmed treatment PILOT Sheet domain events remain 2 unique and allocation links 4, one Daily and one Friday digest audit SENT. Visible TEST/PILOT internal jargon fixed for /retrieve, /history and /status in PILOT_OPERATION. Source work-date vs confirmation-date search remains an explicit unresolved product decision; runtime latency not declared improved. Final BSE signoff still PENDING; Gate I NOT DELIVERED.

## Latest Gate I post-treatment integrity audit - 2026-10-18 15:28 MYT
- Owner PILOT_OPERATION Script read-only auditor LIVE PASS after both actual treatment records: 61 schemas, 31 CURRENT/30 OPTIONAL_ABSENT, 11/11 required CURRENT, 0 schema/header mismatch, 39 source-key entries/0 issues, production_write:false, official_bse_write:false. No domain write.
- The earlier 11:53 26 CURRENT / 35 optional missing / 16 source entries is historical, not current. Prior PR #27 end-user Telegram proof and PR #28 evidence handover remain valid.
- Gate I NOT DELIVERED: non-owner negative access proof requires a real authorized user, history event-vs-confirmation date is an unresolved semantic decision, latency is not yet accepted against an SLA, and BSE questionnaire/sign-off is missing.