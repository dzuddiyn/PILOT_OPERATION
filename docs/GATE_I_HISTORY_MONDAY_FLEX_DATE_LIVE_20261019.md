# Gate I — Monday-First Flexible History Date UX: Live Proof (2026-10-19)

## Owner correction and safety
- Owner changed /history week semantics from first Friday, Friday–Thursday, to first Monday of the month and Monday–Sunday. Historical prior proof Oct 9–15 (4 displayed) remains true for the old contract but is superseded for current user-facing /history.
- Friday Weekly Digest automation remains unchanged on the separately locked Friday–Thursday cycle. No Friday digest changes or production/official BSE writes.
- Flexible formats accepted by parser (20/20 targeted PASS): weekly /history week 2 Oct 2026, /history week 2 - Oct 2026, /history week 2 (Oct 2026), and old ISO; monthly /history Oct 2026, /history 10-2026, /history 10/2026, /history week Oct (current MYT year), plus existing ISO; day /history 14/10, /history 14-10 (MYT current year), full-year variants and existing ISO. Invalid calendar date 31/02 denied. /history week last now previous completed Monday–Sunday calendar week. No operational record creation.
- Architecture contract was updated to explicitly reflect this owner override and retain separate Friday Weekly Digest semantics. Merge PR #91, main 9d8de4de58eb2d76d8e6a92347b77fe04b654583.

## Tests and Script HEAD
- Targeted flexible syntax 20/20; work-date regression 16/16; history domain coverage 9/9; earlier operational history and summary 7/7. All *test.cjs invoked with no FAILED markers, JS syntax PASS, git diff --check PASS.
- PILOT Script HEAD sync via isolated mirror; independent clasp pull: canonical JavaScript 64/64 SHA-256 matches, all 9 runtime-only Gate F helpers preserved. No Apps Script version/deployment promoted.

## Live registered-user UIA proof, 19 Oct 2026 MYT
- Authenticated Telegram Web active account diyn660011, chat Bot OpsMate PoC; no owner permissions used. Tests are read-only bot commands; history audit itself writes its pre-existing audit rows only.
- 20:58–20:59 MYT: sent exact /history 14/10; Telegram shows Sejarah operasi - 2026-10-14, one verified Peria Besar/Hup Nong transplant across M2P1/M2P2. PILOT_TELEGRAM_HISTORY_AUDIT 2026-10-19T12:59:32.147Z: SENT / REGISTERED_ACTIVE, period 2026-10-14, matched 1, displayed 1.
- 21:00 MYT: sent /history Oct 2026; Telegram displays five verified entries: Transplant Oct 7/9/14, Treatment Oct 13/15. Structured separate readable paragraphs, no TEST marker, no private notes. PILOT_TELEGRAM_HISTORY_AUDIT 2026-10-19T13:00:49.610Z: SENT / REGISTERED_ACTIVE, period 2026-10, matched 5, displayed 5. This is the FIRST recorded live monthly history acceptance.
- 21:00–21:02 MYT: sent /history week 2 (Oct 2026); Telegram shows heading Minggu 2 (Oct 2026): 2026-10-12 hingga 2026-10-18; three verified operations dated Oct 13/14/15 with paragraph spacing. PILOT_TELEGRAM_HISTORY_AUDIT 2026-10-19T13:01:56.077Z: SENT / REGISTERED_ACTIVE, period 2026-10-12..2026-10-18, matched 3, displayed 3.
- No repeat of private Evidence negative test; earlier DENIED / VISIBILITY_DENIED preserved. These reads do not assert that unverified sowing PROVISIONAL records are accepted operations.
- Scope: flexible parser and day/month/week operational view LIVE PASS for these genuine examples. Alternate syntaxes, error conditions and privacy rely on synthetic tests and earlier independent denial; full functional parity IN PROGRESS — NOT DELIVERED.
