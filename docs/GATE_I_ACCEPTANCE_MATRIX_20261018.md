# Gate I — Acceptance matrix and independent verification

**Date:** 2026-10-18 MYT
**Authority:** owner-approved Gate I technical execution in PILOT_OPERATION only.
**Status:** IN PROGRESS — delivery not accepted.

| ID | Acceptance | Evidence / status |
| --- | --- | --- |
| I-00-A | Daily scheduler PILOT-only, 08:01 MYT | PR #17 merged, Script HEAD read-back 69/69 files, scheduled owner Telegram LIVE PASS: daily message 34, Friday message 35; owner audit ON/1 trigger after both proofs |
| I-00-B | Friday scheduler PILOT-only, Friday 07:59 MYT | PR #17 merged, Script HEAD read-back, installed ON / 1 trigger; accelerated scheduled proof LIVE PASS, Friday message 35, PILOT Friday audit SENT |
| I-00-C | Source & regression | Node targeted 12/12; Gate E/F/H targeted 80/80; Apps Script full regression 47/47 PASS, production_write:false on 2026-10-18 10:49 MYT |
| I-01 | Canonical source/runtime compare | Main bd3921b; Script HEAD 69/69 content matches selected snapshot incl. nine Gate F helpers; PASS |
| I-02 | General Telegram runtime controls | Gate H final independent audit on 2026-10-16 ON / one CLOCK; 2026-10-18 general tick history includes transient Telegram network and lock-busy failures, reconciliation under repair |
| I-03 | New legitimate report via automatic receive, human Benar, PILOT domain write | PENDING — HUMAN VERIFIED FACT REQUIRED, no fabrication |
| I-04 | Retrieve/history/status matches actual confirmed record | Prior Gate F existing record verified; Gate I new positive flow PENDING |
| I-05 | Evidence/photo identity, Drive and retrieval | Gate G existing live proof; new Gate I review PENDING |
| I-06 | Access checks and sender visibility | Initial owner-only digests enforced in code; live negative proof PENDING |
| I-07 | Dedup, callbacks and wrong-environment | Gate H Batal callback and stable offset; new digest local guards PASS; final live review PENDING |
| I-08 | Fresh schema and source-key audit | Selected 11 PILOT tabs independently checked; no missing header, callbacks processed; legitimate 2 plot allocations share one source key. Full declared-schema audit PENDING |
| I-09 | Rollback and exception SOP | Prepared in GATE_I_OPERATIONS_HANDOVER.md; final field read-back PENDING |
| I-10 | BSE questionnaire, ops/admin receiving sign-off | HUMAN BSE ACCEPTANCE PENDING — cannot fabricate |

## Distinct scopes
- `I-00 LIVE PASS` is supported by Telegram message IDs 34 and 35 and independent PILOT digest audit; it is separate from Gate I acceptance.
- `SCRIPT HEAD UPDATED` and `Apps Script full regression PASS` do not imply production deployment.
- `PILOT_OPERATION VERIFIED` requires live proof and independent audits, not just the test runner.
- `PILOT_OPERATION DELIVERED` requires applicable actual human handover acceptance.
- Official BSE system remains disconnected with `production_write:false`, `official_bse_write:false`.

## Evidence references
- Local external owner evidence: `PILOT_OPERATION_EVIDENCE/GATE_H_20261016_AUTO_ON_LIVE_PASS.md`.
- Source: `PilotOperationDigests.js`, PR #17 merge `bd3921b2fcaa2bdb0b0695e211f93a26bc1d2bce`.
- Apps Script read-back: isolated mirror count 69 JavaScript, 0 mismatch, module SHA256 D57CD6AA62ABB0E787A571495B9B478587925AA77B60DA09B17E5B19659B28CB.
- Google PILOT workbook: owner-scoped, separate from TEST/PILOT_TEST, reports only facts verified through read-back.

**Use this matrix for tracking. Do not mark I-00 or Gate I complete while any required proof is PENDING.**

## I-00 verified live evidence (2026-10-18)
- Daily: 2026-10-17 period; PILOT_DAILY_DIGEST_AUDIT SENT / Telegram message 34; received in authorized owner PM at 10:55 MYT.
- Friday: 2026-10-09 through 2026-10-15; PILOT_FRIDAY_WEEKLY_DIGEST_AUDIT SENT / Telegram message 35; received at 11:02 MYT.
- After trigger proof: inspectBsePilotOperationDigestSchedulers at 11:08 MYT returned DAILY and FRIDAY enabled true, triggers 1 each, marker_matches true, production_write false, official_bse_write false.
- Known issues: transient Gate H receiver lock contention/Telegram transport failure; inherited Gemini commentary mentioned mod TEST in one PILOT weekly message. These are recorded as reliability/UX findings; no claim of clean final Gate I closure.
