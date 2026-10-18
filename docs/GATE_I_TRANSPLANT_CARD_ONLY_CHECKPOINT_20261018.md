# Gate I — Transplant Card-Only UX & Real PILOT Verification (18 Oct 2026)

Status: **PR #40 MERGED / Script HEAD UPDATED / SOURCE HEAD VERIFIED / FULL APPS SCRIPT REGRESSION PASS**. New card-only behavior is **NOT_YET_FIELD_PROVEN** by a subsequent real Transplant submission. Do not confuse code/runtime test results with new Telegram traffic.

## Owner UX decision (source)

For PILOT_OPERATION, after the initial report-received ACK:
- Transplant with NEED_INFO: send the actual plain-language question with Reply.
- A complete, one-candidate Transplant PASS going to NEEDS_HUMAN_REVIEW: **do NOT send redundant interim** `TRANSPLANT_EVENT / Menunggu pengesahan laporan`; send the normal human confirmation card (`Benar / Betulkan / Batal`) directly.
- Other targets and TEST/PILOT_TEST keep their original behavior.
- Card send uncertainty is handled by the existing durable approval row `CARD_SEND_PENDING` and reconciliation; no false claims or silent domain write.
- Historical intermediate Telegram messages are not deleted: no exact confirmed historic ID/permission-free deletion was required. Future PASS messages are suppressed at source.
- DO NOT add a fake operation report to demonstrate UX; a real future report may serve as field proof.

## Actual reporter-confirmed source of truth (independently read back)

User corrected PILOT Transplant:
- Original Telegram report `BSE-TG-772257174`, follow-ups `772257175: 7/9/2026`, `772257176: 7/10/2026`.
- Human confirmed `772257176` at 18:00 MYT, approval card Telegram message 86, approval state `REPORTER_CONFIRMED`; queue update 772257176 same state, processing attempts 2.
- `PILOT_TRANSPLANT_EVENT`: exactly **one** event `BSE-SB-TR-20261007-001`, source key `BSE-TG-772257174|Transplant_Event_Log`, canonical event date **2026-10-07**, crop `Timun` variety `Batu CCB`, plots `M5P1|M5P2`, status `COMPLETED / VERIFIED_TEST`.
- `PILOT_ALLOCATION_STATUS_EVENT`: exactly **two** traceable status changes, M5P1 and M5P2 `PLANNED -> ACTIVE`, one each, source key and payload hash aligned with the Transplant event. Baseline PLANNED allocation rows are preserved.
- Independent PILOT schema audit before this PR (18:05 MYT): 11/11 required CURRENT; 49 source-key entries, **zero** source-key issues; optional tabs not yet created are not domain failures.
- This is a shadow PILOT operational record, not proof a physical action was independently observed, not an official BSE production write and not a BSE official acceptance.

## Engineering and verification evidence

- Canonical repo `dzuddiyn/PILOT_OPERATION` PR [#40](https://github.com/dzuddiyn/PILOT_OPERATION/pull/40) merged on main commit `e2fab6699ce746e395f9b99ac24746a615b212ff`.
- Files: `TelegramWorkerTest.js`, `TelegramApprovalUiTest.js`, `gate_i_transplant_card_only.test.cjs`.
- Guard `bsePilotTransplantReviewCardOnly_` is PILOT-only and requires one validated Transplant PASS candidate with `production_write:false`; primary ACK, NEED_INFO and other domains unaffected.
- Critical incidental bug fixed: PR #39 had inadvertently inserted a display-only `if(transplant ...)` block into `bseTelegramApprovalControllerCore_` on the `Batal` path. It referred to unbound variables. That fragment was removed; controller rejection/reallocation behavior preserved. Correct display block remains solely in `bseApprovalSummary_`.
- Existing reallocation UI harness asserts PILOT human-readable card contract while legacy TEST/PILOT_TEST expectations are preserved.
- Node local regression **16 suites / 198 checks PASS**. JavaScript syntax, `git diff --check` and changed-file secret-pattern scan PASS.
- Controlled `clasp push` updated PILOT Apps Script Script HEAD, **not** a separately versioned production deployment. Nine historical Gate F helper JS were preserved in the 70 JS-file mirror.
- Separate `clasp pull`: independent **70/70 JS exact source match**, zero mismatches; Telegram worker SHA256 `CCB27C6B53770EEB35749ED2EA138DE3694CF9AB78D551413BC673D9A7A2B6D3`.
- Owner Apps Script UI `runBseI011FullRegression` **47/47 PASS**, at **2026-10-18 18:24:37 MYT**, `production_write:false`.
- Post-PR40 independent Google Sheets read-back: queue 772257176 still REPORTER_CONFIRMED, approval card ID 86 still REPORTER_CONFIRMED, 1 Transplant event, 2 ACTIVE status events, no duplicate.
- `official_bse_write:false` remains locked.

## Open acceptance and next proof

- **No new real Transplant has passed through the revised card-only flow since PR #40**; user-visible absence of interim message on a new report is source/test verified, **live Telegram field proof NOT_RUN**.
- Complete separate Gate I ordinary-user acceptance, non-owner role/visibility, owner/IT questionnaires and BSE receiving sign-off as required. Overall `PILOT_OPERATION` **NOT DELIVERED**.

## Final post-deploy audit, 18:28:15 MYT

Independent owner Apps Script runBsePilotOperationReadOnlyIntegrityAudit result OPTIONAL_TABS_ABSENT: 11/11 required CURRENT, 61 total registered, 33 CURRENT, 28 optional MISSING, 0 STALE, 0 SOURCE_MISMATCH, source-key count 49, source issues 0, read_only:true, production_write:false and official_bse_write:false. Mandatory integrity PASS; optional domains remain unprovisioned.
