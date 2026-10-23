# CL-H06A — PILOT_OPERATION Runtime Routing Audit (2026-10-23)

**Gate:** CL-H06A runtime routing / scoped correction. **State:** SOURCE UPDATED, SCRIPT HEAD UPDATED and READ-BACK VERIFIED; native lifecycle guard PASS. **Telegram post-fix live acceptance: PENDING**.

## Authority and root cause

- Canonical source: `dzuddiyn/PILOT_OPERATION`, `main`, merge commit `254cf9ce859dcb079d4e62db366ed0552bdbadbd` (PR #210; receipt fix `f9b219a`).
- Earlier PR #60 in `BSE-dzuddiyn01gmail/BSE-OpsMate-TEST` changed the *different* BSE TEST Apps Script project. That project has **zero** Telegram triggers; therefore its successful HEAD sync and native regression did not update the pilot Telegram callback.
- Separate PILOT_TEST Apps Script project has only two disabled digest triggers, not the operational Telegram worker.
- The actual `PILOT_OPERATION` Apps Script project has its own Script ID (locally bound `PILOT_OPERATION/.clasp.json`), one `@HEAD` deployment, and an enabled `bseTelegramTick` time-based trigger (observed in UI on 2026-10-23).
- The pilot callback is polling based: `bseTelegramTick` → `receiveBseTelegramTest` / durable callback processing → final `bseTelegramReporterConfirmationCore_` in `TelegramApprovalUiTest.js`. Connection test via Apps Script UI, at 21:26 MYT: `TELEGRAM_CONNECTION_OK: @OpsMate_BSE_siteB_PoC_bot`; `WEBHOOK_NONE`. No Web App webhook processes these messages.
- **Defect confirmed in pre-sync PILOT_OPERATION HEAD:** the last confirmation core edited the approval card and then unconditionally sent a reporter receipt and owner notice for transplant / Mula Tuai, causing duplicate messages and generic operation wording.

## Field evidence reconciliation (READ-ONLY)

Read the actual `BSE_OpsMate_SB_PILOT_OPERATION` operational spreadsheet. No record was changed.

| Screenshot reference | Queue row / status | Approval row / target | Source / approval message | Result |
|---|---|---|---|---|
| `BSE-TG-772257952` | row 37 / `REPORTER_CONFIRMED` | row 24 / `Transplant_Event_Log` | 1477 / 1479 | Two visible Telegram confirmations before fix |
| `BSE-TG-772257954` | row 38 / `REPORTER_CONFIRMED` | row 25 / `Operation_Log` | 1481 / 1484 | Two visible Telegram confirmations before fix |

Both events are from the same original reporter/private chat. Their historic approval states remain unchanged.

## Controlled correction and proof

1. Pre-sync PILOT_OPERATION Apps Script HEAD independently pulled into a read-only snapshot (112 files).
2. Canonical GitHub `main` already contained PR #210 minimal fix. No duplicate patch introduced.
3. Created a separate sync worktree at canonical `main`; preserved **nine** additional runtime-only Gate F helpers. Push source contained all 112 files.
4. Scoped fixture test `node --test cl_h_receipt.test.cjs`: **4/4 PASS**; confirms one edit for transplant, one edit for Mula Tuai, sanitized reporter name and unchanged non-PILOT behavior.
5. Authorized `clasp push` to PILOT_OPERATION **Script HEAD** only; no Apps Script version creation or deployment update.
6. Independent fresh `clasp pull` into a new folder: **112/112 exact file hash MATCH**.
7. Apps Script editor via RDC Windows UI Automation selected and executed `runBsePilotLifecycleNativeGuardTests` once. Log at **21:21 MYT**: `BSE_CL07_NATIVE`, `total:7`, `pass:7`, `fail:0`, `production_write:false`, execution completed.
8. Another read-only native Apps Script editor invocation selected `testBseTelegramConnection`. Log at **21:26 MYT**: bot username and `WEBHOOK_NONE` verified. No Telegram send, record write or forced callback replay.

## Outstanding gate

CL-H06 live acceptance remains **FAIL for the two old pre-fix messages; post-fix live test PENDING**. Do not reuse or retry the already-confirmed references. A new controlled Telegram fixture/approval is needed to verify the revised card-only confirmation path with no duplicate private owner notice, correct crop/plot/date and reporter. CL-H07 remains BLOCKED until that direct evidence exists.

`MxP123/MxP1234` parser, SISMARP, new features, transaction engine and architectural changes remain out of scope. Repeated Mula Tuai limitation remains accepted.

## Additional source-diff risk and regression (after HEAD sync)

The canonical-to-runtime sync was **not a one-file Apps Script update**: pre-sync snapshot vs post-sync shows 20 changed JavaScript files, namely the callback plus 19 other canonical `main` files (including PilotRacun and native harness modules). All 20 were already in approved GitHub `main`; no separate unreviewed code was authored during CL-H06A. This wider scope must remain explicit in handover. A local full Node regression on the exact synced canonical source ran **256/256 PASS, 0 FAIL**, with exit code 0, synthetic only and no Telegram sends. PILOT_OPERATION native CL-07 guard was separately executed via UI and passed 7/7. There is no blanket live proof for the 19 adjacent runtime modules.

Retain the pre-sync snapshot and the post-sync 112/112 exact hash evidence for recovery. Do not claim full field acceptance until the next controlled Telegram test and any affected operational flows are independently verified.
