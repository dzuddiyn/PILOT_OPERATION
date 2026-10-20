# FINAL OWNER & BSE ACCEPTANCE PACK

**GI-FINAL-OWNER-ACCEPTANCE-PACK-01 · 20 Oktober 2026 · DRAFT FOR HUMAN ACCEPTANCE**

**STATUS: HANDOVER_PREPARED / NOT DELIVERED.** Draf penyerahan; bukan sijil functional parity penuh, keputusan rasmi BSE atau tandatangan bagi pihak manusia.

## 1. Tujuan dan sempadan autoriti

BSE OpsMate ialah *shadow pilot* yang menyimpan rekod hanya dalam PILOT_OPERATION (PILOT_* Sheet/Drive). Pentadbir BSE masih menyemak rekod cara lama dan menentukan kemasukan manual ke sistem rasmi. Tiada integrasi/write terus ke sistem rasmi BSE. `production_write:false`; `official_bse_write:false`. Google Tasks di luar skop.

Sumber kebenaran: `dzuddiyn/PILOT_OPERATION`; source checkpoint `d87d01a`. Akaun owner Google: `dzuddiyn01@gmail.com`. Sejarah PASS tidak membuktikan operasi fizikal telah berlaku selain pengakuan penyampai.

## 2. Ringkasan keputusan teknikal

| Semakan | Keputusan | Bukti/kelayakan |
|---|---|---|
| Script HEAD vs canonical | VERIFIED | 65 shared files SHA-256 match; 2 source-only RBAC; 9 Gate F runtime helpers |
| Schema PILOT | PASS | 61/61 exact header match |
| Source-key | PASS | 91 source entries; 0 isu dalam audit terdahulu |
| Daily scheduler | LIVE INSPECTION PASS | Enabled true; 1 trigger; marker matches true; 08:01 MYT |
| Friday scheduler | LIVE INSPECTION PASS | Enabled true; 1 trigger; marker matches true; 07:59 MYT |
| Daily actual delivery | SENT VERIFIED | 20 Okt 2026; message 183; PILOT_DAILY_DIGEST_AUDIT |
| General Telegram automation/webhook | UNVERIFIED | Fresh read-only runtime inspection masih belum berjaya; jangan andaikan ON/OFF |
| Corporate acceptance | PENDING | Questionnaire, reconciliation dan genuine receiving sign-off belum lengkap |

## 3. Mandatory functional acceptance matrix

| Fungsi / keupayaan | Status tepat | Bukti dan had |
|---|---|---|
| Telegram receive / ACK / queue | SCOPED LIVE PASS | Historical E2E; PILOT queue 18/18 ACK SENT semasa audit |
| Benar / Betulkan / Batal | CORE HISTORICAL LIVE + LOCAL | Tidak semua subtype dan negative-case dibuktikan secara PILOT live |
| Treatment | LIVE PASS | 2 completed/verified TEST-mode domain events; 4 plot links |
| Transplant | LIVE PASS | 3 completed/verified domain events |
| Crop Batch / Planting / Allocation | HISTORICAL LIVE PASS | Gate F, real reporter-confirmed pilot case |
| Evidence store / retrieve | SCOPED LIVE PASS | 1 confirmed Evidence + Telegram retrieval SENT; bukan bukti semua media/OCR |
| /status & /summary | SCOPED LIVE PASS | Registered-user transport/audits; sesetengah human formatting belum accepted |
| /history day/month/week | SCOPED LIVE PASS | 19 Okt work-date & syntax correction; historical contracts superseded |
| Private Evidence denial | LIVE PASS | Registered user retrieval DENIED/VISIBILITY_DENIED |
| Daily / Friday digest | LIVE PASS FOR OBSERVED CASES | Daily delivered 20 Oct; Friday historical SENT; owner trigger inspection PASS |
| /start and user registration | PARTIAL | Positive real user exists; negative variant coverage LOCAL |
| /ec_history | LOCAL PASS / FIELD UNVERIFIED | Parser verified; genuine PILOT data/visibility broader case pending |
| /ocr & image analysis | LOCAL PASS / LIVE UNVERIFIED FOR PARITY | 15/15 media/OCR regression; not a PILOT E2E proof for each path |
| Inventory, Reallocation, Census, Sulam | PARTIAL PARITY | Prior PILOT_TEST evidence; no blanket promotion to PILOT_OPERATION E2E PASS |
| Shared positive non-owner /retrieve | WAITING GENUINE DATA | No confirmed eligible shared item for positive proof |
| /delete | NOT RUN BY DESIGN | Only parser/guard proof; destructive action requires separate authority |

## 4. Known limitations & risk register

| ID | Isu / baki | Keadaan / pemilik |
|---|---|---|
| K-01 | General Telegram flag, worker triggers, webhook — current state not verified | Owner/IT; read-only inspector and evidence required |
| K-02 | One historical callback FAILED_CALLBACK_RETRY_LIMIT retained | 13 PROCESSED, 1 terminal failure; do not replay blindly; owner/IT assessment |
| K-03 | Full PILOT_OPERATION E2E parity for optional domains/media/OCR incomplete | Owner decide IN_SCOPE_PILOT vs DEFERRED, never invent field data |
| K-04 | SLA latency, formatting and UX acceptance not formally signed | Admin/team feedback plus agreed criteria |
| K-05 | Shared positive non-owner retrieval awaiting genuinely shareable record | Operational owner; do not loosen visibility guard |
| K-06 | No BSE questionnaire/reconciliation acceptance/signature | Admin BSE, operations team, BSE receiving authority |
| K-07 | No physical farm action verified independently by software | Actual operational staff/admin reconciliation responsibility |

## 5. Operating reconciliation & stop/rollback

Reconciliation setiap hari: Telegram message → PILOT record → legacy/manual BSE record → admin decision. Classification: MATCHED, MATCHED_WITH_NOTE, PILOT_MISSING, PILOT_DUPLICATE, LEGACY_MISSING, DATA_DIFFERENCE, OUT_OF_SCOPE, VOIDED_TEST.

Trigger stop: salah environment, duplicate/missing, unauthorized access, unsafe parsing, broken audit/hash/dedup, evidence visibility fault, or irreconcilable differences. Halt affected writer/trigger only with authorized decision; preserve audit and evidence. Do not delete/retry unknown-outcome callbacks blindly.

## 6. Questionnaire ringkas untuk penerima

Diadaptasi daripada `docs/SHADOW_PILOT_MVP_HANDOVER.md` §10; isikan borang penuh di sumber asal untuk pengesahan.

- ☐ Ya ☐ Tidak ☐ N/A — Admin BSE: mesej ↔ PILOT ↔ rekod cara lama sepadan, dengan rujukan/time/identity yang jelas?  
  **Bukti/catatan:** ________________________________________________
- ☐ Ya ☐ Tidak ☐ N/A — Admin BSE: tiada duplicate/missing dan access/visibility mengikut peranan?  
  **Bukti/catatan:** ________________________________________________
- ☐ Ya ☐ Tidak ☐ N/A — Team operasi: mesej, Benar/Betulkan/Batal, feedback dan pembetulan cukup jelas?  
  **Bukti/catatan:** ________________________________________________
- ☐ Ya ☐ Tidak ☐ N/A — Team operasi: adakah aliran memudahkan kerja harian atau menambah risiko/beban?  
  **Bukti/catatan:** ________________________________________________
- ☐ Ya ☐ Tidak ☐ N/A — BSE IT: adakah limitation, SOP recovery, credential ownership dan backlog diterima?  
  **Bukti/catatan:** ________________________________________________

**Insiden/semakan:** __________  **Tarikh:** __________  **Penilai/peranan:** ___________________

Pilihan keputusan template: TERUSKAN / TERUSKAN_DENGAN_CATATAN / NYAHAKTIF_KATEGORI / HENTIKAN_PILOT. Severity: Critical / High / Medium / Low.

## 7. Dokumen dan bahan penyerahan wajib

- [ ] Architecture dan kategori IN_SCOPE_PILOT / DEFERRED / OUT_OF_SCOPE_PILOT
- [ ] Manual team operasi, admin dan IT; SOP stop/rollback
- [ ] Data dictionary, Telegram-to-Sheet mapping dan access register
- [ ] Daily reconciliation sample dan keputusan admin sebenar
- [ ] Release evidence: source commit, regression, Script HEAD dan runtime logs tanpa secrets
- [ ] BSE questionnaire lengkap, known limitations dan IT backlog
- [ ] Disclaimer shadow pilot (bukan sistem rasmi) dan slide MVP PoC

## 8. Human acceptance & signature — BELUM DIISI

**Status keputusan:** ☐ TERIMA ☐ TERIMA DENGAN CATATAN ☐ TANGGUH ☐ TOLAK

**Skop diterima:** __________________________________________________________

**Penangguhan dan severity diterima:** _________________________________________

**Pautan evidence / reconciliation / questionnaire:** _____________________________

**Penyerah OpsMate — nama/peranan:** ____________________ **Tarikh:** __________ **Tandatangan:** __________

**Penerima BSE — nama/peranan:** _______________________ **Tarikh:** __________ **Tandatangan:** __________

Handover COMPLETE / DELIVERED hanya selepas semua dokumen relevan diserah, questionnaire/reconciliation benar siap, isu kritikal diurus atau ditangguh secara rasmi, dan tandatangan genuine direkod. Penerimaan shadow pilot tidak membenarkan official BSE integration.

## 9. Rujukan source

- `AGENTS.md`
- `docs/SHADOW_PILOT_MVP_HANDOVER.md`
- `docs/GATE_I_OPERATIONS_HANDOVER.md`
- `docs/GATE_I_ACCEPTANCE_MATRIX_20261018.md`
- `docs/PILOT_OPERATION_FULL_PARITY_CHECKPOINT_20261019.md`
- `docs/TELEGRAM_COMMAND_UX_PARITY_SYNTHETIC_20261019.md`
- `docs/TELEGRAM_MEDIA_OCR_EVIDENCE_PARITY_20261019.md`

*Canonical GitHub record: Markdown transcription of the prepared five-page DOCX acceptance pack. Human signatures and completed questionnaires must be supplied by actual BSE representatives; this commit does not certify delivery.*
