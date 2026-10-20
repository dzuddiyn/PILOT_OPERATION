# Gate I — PILOT UX and intake follow-up (21 Oct 2026)

## Owner-reported actual issues
- Inventory report `BSE-TG-772257398` had duplicate generic interim preview, and a confirmed receipt displayed raw `APPROVED_TEST` and a JavaScript Date string. Independent queue READ shows `REPORTER_CONFIRMED`.
- Evidence `BSE-EV-528-...` displayed `CONFIRMED TEST` after user confirmation.
- New PILOT Evidence filename should have **date only**, source user caption and system reference; no time. Existing saved files must remain retrievable without renaming.
- PILOT onboarding command `/start OpsMate`; AI help command `/ask` instead of `/ask_ai`.
- Treatment input `PETANG`, `PTG`, `PAGI`, `PG` must be treated as optional session control lines, not chemical products/doses.
- Plant Census titles: `REKOD BANCI POKOK`, `pokok sakit`, `pokok mati`, `banci pokok`, `banci tanaman`, `kira pokok`, `kiraan pokok`. Date variants in DD/MM/YYYY, DD/MM/YY, DD-MM-YYYY and ISO supported.
- Optional role changes: Zen Areyf Owner, current user + S S Admin. No IDs for Zen / S S proven from membership alone; role WRITE not authorized as a guessed identity.

## Implemented only in isolated feature branch
- `EnvironmentTest.js`: PILOT start token switched to `OpsMate`, outgoing evidence/stock confirmation status text uses human-readable PILOT wording, TEST/PILOT_TEST not changed.
- `TelegramCommandTest.js` and `TelegramAiTest.js`: `/ask` PILOT command/menu; TEST/PILOT_TEST keep `/ask_ai`. No menu Bot API WRITE in this work.
- `TelegramApprovalUiTest.js`: value typed as Date or legacy long string displays MYT date as DD/MM/YYYY; receipt PILOT shows confirmed rather than internal status `APPROVED_TEST`. No change to persisted record state.
- `PilotEvidenceSafeStore.js`: new files named with reporting date (explicit caption date if valid, else MYT receive date), readable caption, and unique `BSE-EV` identifier. No time. Preserve pre-existing legacy filename discovery; fail closed if old/new name duplicates unexpectedly.
- `TreatmentReviewTest.js`: daypart tokens rejected as chemicals.
- `CensusReviewTest.js`: broaden strictly anchored census heading and explicitly supplied date formats, plus dead/sick aliases. Retain existing crop/plot/allocation guard; no invented counts.
- New `gate_i_pilot_followup_ux.test.cjs`: 13/13 PASS for above; full Node regression 78/78 PASS, JS syntax and git diff check PASS.

## High-impact gates — NOT executed
1. User-incorrect confirmation /delete: actual `BSE-TG-772257398` is reporter-confirmed inventory; implementation supports `/delete BSE-TG-772257398 <reason>` from an authorized Owner/Admin **private** conversation, with independent Benar/Batal action and `VOIDED_TEST` audit. No deletion performed; user has not explicitly identified target reference or supplied reason.
2. Dedup Drive: six same-name pairs previously text-equal in `08_KB_REFERENCE/02_PROJECT_CONFIG`, source original IDs still in `PILOT_KB_SOURCE_REGISTRY`. No permanent delete or trash operation. Require fresh byte/hash + dependency scan, choose retained ID deterministically, then separate reversible trash authorization. Duplicate names alone are insufficient.
3. Zen Areyf/S S privilege: Owner registry has one existing active Owner; private Telegram numeric IDs for Zen/S S not independently established. Group membership is not role proof. No access control change.
4. IRAC KB binding and grounding in PILOT_OPERATION: not yet LIVE VERIFIED. SISMARP cache last refreshed 14 Oct, scheduled runner recovery DEFERRED BY OWNER. No KB data import or refresh.
5. PR #146 Evidence public label is a distinct pre-existing draft; reconcile overlapping changes before any merge. Do not merge by implication.
6. `/ask` will not have server-side menu until separately owner-authorized `setMyCommands`; source HEAD update is also separately gated.
7. Redundant generic preview for inventory: issue recorded; does not by itself establish the pending-card state of every inventory message. A future card-only control requires its own regression and independent Telegram proof.

## Status
- LOCAL implementation + tests: PASS.
- GitHub merge: NOT DONE.
- Apps Script HEAD: NOT UPDATED.
- Telegram menu: NOT UPDATED.
- Live acceptance of changes: NOT RUN.
- Owner/admin transfer and deletion: NOT DONE.
