# GI-UX-06 — PILOT_OPERATION /ask UX local evidence (2026-10-22)

**Scope:** Only `PILOT_OPERATION` /ask text presentation and reply behavior; no RBAC, ownership, claim access, approval writer, or production change.

## Baseline and recovery
- Fresh origin/main: `49a518ba547c96e3c4433b9de37e567447762350`.
- Dedicated UX worktree clean before safe fast-forward from `206a9032...` to the same canonical main. Main working tree on RBAC branch unchanged.
- No active Codex coding process identified after prior network outage; separate sandbox service was present.

## Implementation
- Successful /ask replies from Gemini or structured/site KB use the heading `🤖 Jawapan AI — Maklumat rujukan sahaja`.
- The legacy `🤖 AI — NON_CANONICAL` heading is not presented in successful PILOT /ask replies.
- PILOT /ask messages are sent without Telegram `reply_parameters`.
- Empty-question usage help, oversized question errors and AI failures do not masquerade as successful AI answers. They are still sent as plain messages without reply-to.
- Internal noncanonical safety prompt remains intact, while user-facing environment and command references are PILOT-aware.
- TEST and PILOT_TEST parser, command menu and reply behavior are preserved.

## Tests and review
- Targeted test `gi_ux_06_ask_pilot.test.cjs`: RED before patch; final **5/5 PASS** after correction.
- Existing `gate_i_pilot_followup_ux.test.cjs`: **14/14 PASS**.
- Existing `pilot_telegram_command_menu.test.cjs`: **5/5 PASS**.
- Full local Node execution: **86/86 test files PASS** on Windows `LAPTOP-DBGSGIEI`.
- `node --check TelegramAiTest.js`, `git diff --check`, added-line secret-pattern scan: PASS, **0 matching secrets**.
- Independent Codex CLI read-only review found **P2**: unconditional heading also mislabeled help/errors. Scoped `noAnswerHeading` exemption implemented and verified with negative-path tests. Initial review finding fixed; no second independent review claimed.

## Boundaries / pending
- This is a **LOCAL PASS** evidence note until GitHub PR read-back establishes merge.
- No `clasp push`, Script HEAD modification, Apps Script native regression, `getMyCommands` live check, Telegram send, live proof, or BSE operational ledger write was performed in this change.
- UX contract C01-C09 and C11 remain separate work. OWNER/ADMIN authority and cutover remain explicitly OUT OF SCOPE.
