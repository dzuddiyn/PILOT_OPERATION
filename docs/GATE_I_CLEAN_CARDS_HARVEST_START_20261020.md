# Gate I ? Clean Telegram Approval Cards and Harvest-Start Intake

**Date:** 2026-10-20 MYT
**Scope:** BSE OpsMate `PILOT_OPERATION` only
**Status:** LOCAL PASS ? NOT MERGED / NOT SYNCED / NO NEW HARVEST LIVE PROOF

## Owner observations

1. An actual transplant card for `BSE-TG-772257259` included two redundant instruction lines. Owner crossed out:
   - `Tekan Benar hanya jika tarikh, tanaman dan plot ini betul.`
   - `Selepas Benar, rekod pindah tanam disimpan dan status plot berkaitan dikemas kini.`
   Owner requested removal on all approval cards; these literal instruction lines were located only in the PILOT transplant branch of shared `bseApprovalSummary_`.
2. Owner requires ability to report:
   ```text
   Tarikh mula harverst / tuai
   M7P3
   14-Oct-26
   ```
   (The spelling `harverst` is accepted as reported; `harvest` and `tuai` variants are also accepted.)

## Implemented

- Removed the two instruction lines from the approval card formatter. Existing date, crop, variety, exact plot set, reallocation safety information and `Benar / Betulkan / Batal` markup behavior are unchanged. Do not remove specific warnings where an approval actually changes allocation/authority.
- Added a PILOT-only deterministic `bsePilotHarvestStartResult_` before generic Operation/Decision and Gemini fallback. This strictly recognizes a three-line report containing header, one plot and explicit 2026 calendar date (including Malay / English word variants and the observed typo).
- The proposal uses existing `Operation_Log` with `operation_type=HARVEST_START`, `event_date`, `plot_id` and `verification_status=PROVISIONAL`. No new Sheet authority, crop inference, yield/quantity fabrication or allocation/lifecycle change.
- Its approval card and canonical Operation Log receipt display `Jenis operasi: Mula Tuai` rather than raw status code. The existing reporter `Benar` guard and idempotent Operation_Log review core are unchanged.
- Missing dates/plots are not accepted; malformed extra lines and shorthand for multiple plots are rejected; unrecognized reports and non-PILOT environments remain unchanged. No background callback replay or auto-approval.

## Real-state read-only context

Existing PILOT rows already contain an owner-confirmed transplant `BSE-TG-772257259` dated **2026-09-06** for M7P3, crop Peria Besar (936 Hua li), and status transition `PLANNED ? ACTIVE` in the allocation status event. This supports plausibility of the proposed 2026-10-14 start date, **not a claim that harvesting has physically occurred**.

## Tests and truthfulness

- Dedicated deterministic parser and card test **19/19 PASS**.
- Existing transplant card and chronology harnesses updated for the owner's removed wording, **9/9 and 29/29 PASS**.
- Complete Node test regression **56/56 suites PASS**.
- JavaScript syntax and git diff --check PASS.
- **No new PILOT domain write, Telegram send/edit, Script HEAD sync, deployment/version or LIVE acceptance** was carried out for these changes.
- Preserve `production_write:false`, `official_bse_write:false`; formal handover and worker reliability remain OPEN.

## Next approval boundary

Explicit approval to merge this PR, then separate guarded Script HEAD sync with independent read-back and a naturally occurring owner-confirmed start-of-harvest report for full LIVE proof. Do not replay the original screenshot/callback.
