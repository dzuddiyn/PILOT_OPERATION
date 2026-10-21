# GI-FIELD-UX-NATIVE-REGRESSION-RECOVERY-05A

**Date:** 2026-10-22 MYT
**Result:** LOCAL PASS / LIVE SCRIPT HEAD REGRESSION STILL FAILED (46/48) / NOT MERGED / NOT REDEPLOYED.

## Incident and source authority

- Owner-approved Gate `GI-FIELD-UX-DEPLOY-PROOF-05` updated PILOT_OPERATION Apps Script **Script HEAD only** from canonical merged PR #157 (`main` `ad27a92241f7c46d4140490e4cc253fcdc05f341`).
- Controlled fresh pull before push was 80 Script files (79 JavaScript + manifest). Only `InventoryReviewTest.js` and `TelegramWorkerTest.js` differed from canonical `main`. Nine runtime-only Gate F helper scripts and manifest were retained unchanged; Script binding matched canonical configured PILOT_OPERATION authority.
- At 00:03:28 MYT, authorized `clasp push --force` returned `Pushed 80 files` and exit 0. Independent fresh pull showed **80/80 exact content match** and **70/70 canonical JavaScript match**; this proves Script HEAD sync, **not an Apps Script version or deployed endpoint update**.
- Native `runBseI011FullRegression` was actually invoked in the owner-authenticated PILOT_OPERATION Apps Script Editor. At 00:13 MYT, its real execution log reported **48 total / 46 PASS / 2 FAIL / production_write:false**. Failing: `runBseInventoryD038AcceptanceHarnessTests` (compact Baja In + date-leading Baja Out) and derived `runBseRouterD047HarnessTests`. This is a genuine **LIVE REGRESSION FAIL**, not merely CLI permission failure. A `clasp run` attempt was separately denied by the Apps Script execution API and was not counted as a test pass.
- Independent pre-push source copy is retained locally in `%LOCALAPPDATA%/OpsMate/GI_FIELD_UX_DEPLOY_PROOF_05_20261021/PREPUSH_REMOTE_SNAPSHOT`; no rollback was performed.
- No real PILOT_OPERATION record, Telegram send, approval, production, or official BSE transaction was authorized/performed as part of this gate.

## Diagnosis / minimal recovery

- `InventoryReviewTest.js` PILOT_OPERATION-specific strict Baja In line grammar accepted `5 set Baja F` but rejected the existing native harness format `Baja In 5 Set F`. The rejected input was required by D-038; D-047 routed the same case and consequently failed.
- Baja Out unknown-product guard matched the command word `Out` as if it were a product when a date preceded `Baja Out`: `02/01/2026 Baja Out 3 Set Baja AB`. This turned an existing valid generic product `Baja AB` into `NEED_INFO`.
- **Exactly two source guard changes:** allow optional `Baja` token in the compact F/N Baja In item line; exclude the operation tokens `in/out` from the Baja Out unknown-product detector. No new issuer/36P-36Q/deletion/telegram send/deployment logic.
- Synthetic tests use a local `Utilities.formatDate` stub only to exercise no-explicit-date legacy examples; the production Apps Script code is unmodified by that test stub.

## TDD evidence and safety

- Original targeted RED: 2 existing/native formats returned `NEED_INFO` instead of `PASS`. An initially missing mock `Utilities` was corrected in **test fixture only**, before final reproduction; last RED was **22/24 PASS** with precisely those two failures.
- After source guard repair: Baja targeted **24/24 PASS**, Banci/Baja and callback focused **45/45 PASS**, full available Node regression **124/124 PASS**, JavaScript syntax and `git diff --check` PASS.
- Negative tests remain GREEN: mixed valid/unknown Baja In refuses partial PASS; date-leading conflicting F/N Baja Out refuses product/quantity crossover. Valid date-leading Baja AB and inline `5 Set F` are restored.
- All proof is **LOCAL/SYNTHETIC for this new recovery**, not a live 48/48 Apps Script pass. No source changes to canonical GitHub `main` or Script HEAD are authorized by this recovery branch alone.

## Next gate

Create small GitHub PR for isolated correction, verify it independently; owner must explicitly approve **merge**. Then arrange separately authorized Script HEAD recovery from merged canonical `main` with all nine runtime-only helpers preserved and 80-file fresh readback, followed by native Apps Script 48/48 regression proof. Do not silently rollback/re-push runtime or claim full delivery. Historical PR #156 remains separate/deferred.
