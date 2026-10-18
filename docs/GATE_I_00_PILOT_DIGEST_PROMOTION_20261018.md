# Gate I-00 — PILOT_OPERATION Daily and Friday digest promotion

**Date:** 2026-10-18 MYT
**Scope:** PILOT_OPERATION ONLY; no production or official BSE writes.
**Owner authority:** Gate I full autonomous execution authorization in the Pilot AUTO chat.
**Source baseline:** main eaa6e72acb7e322085838a79dbba720f69c4dfb9 (PR #16 merged).
**Initial implementation state:** LOCAL PASS. **Update 2026-10-18:** merged Script HEAD and both scheduled Telegram proofs LIVE PASS; see acceptance matrix for exact evidence.

## Existing state and rationale
- Gate H general Telegram polling LIVE PASS on 2026-10-16; final owner runtime audit ON, one bseTelegramTick CLOCK trigger and no webhook, offset 772257155.
- Inherited DailyMorningDigestTest.js and FridayWeeklyDigestTest.js installers/ticks correctly enforce PILOT_TEST; they are not re-used as installers in PILOT_OPERATION.
- Existing runtime source includes 59 canonical JavaScript files and nine preserved Gate F UI-only helpers in Apps Script HEAD. On 2026-10-18 a clean isolated clasp pull showed 68 JS files; content comparison against canonical code was exact except the proposed new PilotOperationDigests.js. A blind clasp push from source directory would destroy nine preserved helpers.
- Scheduler source inherited from PILOT_TEST previously achieved autonomous proof; this is **not** PILOT_OPERATION acceptance evidence.

## PILOT_OPERATION-specific implementation
- New `PilotOperationDigests.js`; no changes to existing PILOT_TEST digest functions, or to general Telegram automation.
- Daily at 08:01 MYT; Friday at 07:59 MYT covering the preceding Friday–Thursday window.
- Owner-only PM recipients, based on live PILOT_OWNER_REGISTRY, no broadcast to registered users until separate scope decision.
- Runtime workbook ID/Drive binding, environment guard and official/production write false are checked before each scheduler operation.
- Existing TEST-prefixed logical Sheet names map through bseRuntimeBook_ to PILOT_* workbook sheets; never write to TEST/PILOT_TEST.
- PILOT-specific factual labels; Gemini commentary explicitly NON_CANONICAL with unavailable fallback.
- Audit before Telegram send records SENDING; response success records SENT + message ID; uncertain send records OUTCOME_UNKNOWN and suppresses blind retry. Dedup per date/window and chat.
- Independent separate daily/Friday ON flags and trigger UID markers, single trigger per scheduler, stop/readback, protected accelerated two-minute proof mode, and post-tick next schedule.
- No scheduler installs automatically on Script HEAD sync.

## Acceptance / evidence checklist
- [x] Canonical main and local tree clean before feature branch.
- [x] Daily and Friday schedule arithmetic UTC/MYT targeted tests.
- [x] Owner-only, wrong-environment, duplicate and noncanonical fallback tests.
- [x] Node targeted tests 12/12 PASS.
- [x] Existing Gate E/F/H local harness tests 80/80 PASS, no regressions.
- [x] PR #17 merged to canonical main bd3921b after source review.
- [x] Script HEAD 69 JS read-back 0 mismatch, preserving nine Gate F helpers.
- [x] Apps Script full regression 47/47 PASS, runtime guard/owner scope verified.
- [x] Daily and Friday scheduled one-shot proofs SENT Telegram IDs 34/35 with independent PILOT_* audits.
- [ ] Two digest trigger state read-back 11:08 PASS; wrong-env tested locally, digest OFF/ON rollback rehearsal PENDING.
- [ ] Gate I normal-user walkthrough positive confirmation (requires an actual owner-verified operational fact).
- [ ] Final pilot acceptance documentation and human BSE sign-off (not delegated to AI).

## Gate I remaining boundaries
- No fabricated farm operation, no AI clicking Benar on a factual report absent genuine owner confirmation.
- TEST_ONLY proofs do not substitute for a genuine positive PILOT record when acceptance demands one.
- `PILOT_OPERATION VERIFIED` requires fresh independent schema/source-key audit, access checks and live proof.
- `DELIVERED` cannot imply official BSE acceptance without actual questionnaire/signature.
