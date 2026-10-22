# GI-UX-02 — Batal-only security review & E2E gate

Date: 22 Oct 2026 MYT
Scope: dzuddiyn/PILOT_OPERATION PR #167, candidate branch fix/gi-ux-02-incomplete-batal-only-20261022.

## Review method and limitation
- Codex CLI independent code review **did not complete**: external reviewer quota exhausted. Do **not** report Codex PASS.
- Bounded, source-level ChatGPT adversarial review and separately executed JS/Node integration harness performed against actual source definitions. This is not a separate AI reviewer.
- No GitHub source merge or Apps Script deployment is implied by writing this evidence.

## Threat review
1. C2 is accepted only in PILOT_OPERATION; only the C action; no Benar or Draft option.
2. Existing webhook persist step binds callback_id and Telegram update_id to durable callback queue and is idempotent.
3. Existing locked dispatcher replays only PENDING callbacks and returns terminal process status.
4. Callback checks exact queue update reference, numeric original reporter ID, source chat ID, card message ID, current INCOMPLETE_CANCEL_ONLY state and NEED_INFO result. OWNER has no special cancellation privilege.
5. Current callback changes **same technical queue row status** to INCOMPLETE_CANCELLED; no domain writer, automatic record approval, plot status or lifecycle transition.
6. Existing incomplete messages are untouched. The new card is only for **new** PILOT recognized incomplete messages; no old-message replay.
7. Before Telegram send, reserve INCOMPLETE_CARD_SEND_PENDING. On uncertain send remain blocked; no duplicate card sent blindly. Manual reconciliation is needed in rare transport failure.
8. Separate DRAFT experiment worktree is not part of this PR or Script HEAD.
9. Banci date-format parsing itself is outside this change. Card advertises existing supported formats; never invent valid dates.

## Executable proof
- gi_ux_02_incomplete_batal_only.test.cjs: 9/9 (candidate scope, understood fields, sole Batal, forged actor/chat/card/action, idempotency, no domain writes, fail-closed).
- gi_ux_02_callback_e2e.test.cjs: 6/6 real function integration: persist callback in actual pending-queue source function, invoke actual processBseTelegramApprovalCallbacks dispatcher, invoke actual bseTelegramApprovalCallback router and PilotIncompleteBatal handler; repeat dedup, other callback ID no second write, forged author no effect, wrong environment rejection. Sheets, lock, Telegram transport are mocked.
- Full Node regression and JS syntax gate to be run immediately before merge. Native Apps Script and actual Telegram remain **separate** acceptance gates.

## Verdict
**Manual adversarial code review + automated unit/integration checks: PASS for source merge** if the full regression and prepush checks remain green.
**Independent Codex verdict: NOT AVAILABLE (usage limit).**
No cross-user cancellation, unrestricted callback action, production/domain write or Draft integration found in the reviewed delta. This does not certify live Telegram delivery until a fresh field test.
