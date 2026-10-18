# Gate I — 18 Oct 2026 Transplant receipt, work-date history and registration

**Canonical main after PR #30:** 65a74c74d9badbc6787647c67ed21f92d78d4dec. **Project:** PILOT_OPERATION only. **Safety:** production_write:false; official_bse_write:false.

## Actual Transplant intake

Owner PM source 772257174 (15:52:21 MYT) contains precisely:
- Transplant
- Timun
- M5P12
- 7/9/26

The reported quantity 282 was mentioned separately to ChatGPT; it is **not** in the Telegram queue message. Actual queue receipt: 15:52:32.925 MYT, initially QUEUED/ACK PENDING, later ACK SENT/WAITING_INFO and attempt 1. Parser result: validation NEED_INFO, missing batch_match, event_date 2026-09-07, plot_ids [M5P12]. No Transplant event or ACTIVE status transition exists. Telegram bot sent a real question at 16:11 asking for matching batch/allocation and awaiting the reporter's Reply. Do not fabricate a Benar decision.

Prior confirmed seed-source note BSE-TG-772257142 explicitly defined the M5P12 shorthand as M5P1 and M5P2, and stored sowing on 2026-10-02. The new stated transplant date 2026-09-07 precedes sowing and is chronologically inconsistent if referring to the same crop batch. Canonical data should not be overwritten, and no silent date correction, alias reinterpretation, or ACTIVE promotion is allowed. The reporter must confirm the correct work date, the real plots and quantity if applicable.

## Root cause and technical fix

Earlier queue row 772257172 (unsupported group input) remained ACK PENDING. The receiver ACK send loop had catch-and-break: one failed group ACK prevented any subsequent independent owner PM ACK. Actual group error code is UNKNOWN (the prior handler suppressed errors). PR #30 logs a sanitized failure per update and continues to later ACK rows, leaving failed rows PENDING for retry. Independent real Sheets after Script HEAD sync show owner row 772257174 ACK SENT, processed to WAITING_INFO; group row 772257172 remains ACK PENDING. Mock regression proves group send failure cannot starve owner send and no duplicate second owner ACK.

Runtime read-only audit before patch: automation ON, bseTelegramTick CLOCK, two digest CLOCK triggers, offset 772257175, no webhook, callbacks processed. Separate Gate H preflight function requires automation OFF and must not be used as ON status inspector.

## Operational history date rule — owner decision

PILOT_OPERATION /history uses the canonical approved candidate work event_date, **not** Benar confirmation date, Telegram message date or Google Sheets write date. A source with multiple distinct valid operational dates is grouped by work date. A candidate with no valid work date is not assigned a made-up receipt date. PM private/role visibility remains unchanged. User presentation is Sejarah operasi; daily and Friday digest event-window selection follows the same operational dates. Historic digests are **not** resent automatically for late reports.

Local validated acceptance: /history 2026-10-13 returns treatment 772257163; /history 2026-10-15 returns treatment 772257161; /history 2026-10-18 excludes those earlier works; weekly Fri 9 Oct–Thu 15 Oct includes both. Telegram live history re-proof is PENDING because the owner bot chat currently has an active Transplant clarification Reply composer, which must not be disturbed.

## New member: Start is not authorization

PILOT_OWNER_REGISTRY has one active owner; PILOT_TELEGRAM_USER_REGISTRY still has 0 applicant rows as of latest inspection. Existing bot required tokenized /start, so a native Telegram Start previously received a generic registration-needed reply without creating an application. PR #30 permits plain /start (and exact bot-mention form) for PILOT_OPERATION; after re-sending, a real applicant enters REGISTRATION_PENDING and owner gets an approve/reject card. No unattended role grant; TEST and PILOT_TEST start-token policy unchanged. Requires actual user Start again for live proof. Never impersonate a new member or fabricate an account.

## Verification and open gates

- GitHub PR #30 merged; 13 local Node suites, **152/152 PASS**, changed-file secret scan/diff/syntax checks PASS.
- Apps Script Script HEAD push done; independent pull exact **70/70 JavaScript files matched** and nine Gate F-only helper scripts preserved.
- Owner Apps Script full regression at 16:15:52–16:15:55 MYT **47/47 PASS**, production_write false. Script HEAD updated is not equivalent to a new version or official BSE deployment.
- New Transplant positive domain write: **BLOCKED — HUMAN FACT/REVIEW REQUIRED**. Existing two treatment writes remain LIVE PASS, but they do not prove transplant or plot activation.
- Work-date /history: **LOCAL PASS / SCRIPT HEAD UPDATED / TELEGRAM LIVE PROOF PENDING**.
- Native /start: **LOCAL PASS / SCRIPT HEAD UPDATED / REAL NEW USER LIVE PROOF PENDING**.
- Group ACK 772257172 still pending; do not claim full group ACK recovery.
- Gate I remains PARTIAL VERIFIED, HANDOVER PREPARED, NOT DELIVERED. BSE staff questionnaire and receiving sign-off remain pending.

## Final root cause and closure of earlier group ACK (16:30 MYT)
The actual owner Apps Script bseTelegramTick execution at 16:23:21 logged update 772257172 as ACK_PENDING with precise error "Telegram HTTP 400: Bad Request: message text is empty". Its unsupported-input ACK started with a legacy Mod TEST sentence, which the PILOT presentation filter stripped entirely. This error caused the first ACK to fail; before PR #30, catch-and-break prevented all later owner PM ACKs.

PR #32 merged canonical main 5ba0d709d9f37bb97cb50ba12cf297efc91d650a. It safely translates the exact unsupported-input notice into a nonempty human-readable message before stripping tech labels. All TEST/PILOT_TEST output remains unchanged. 13 Node suites / 154 of 154 checks PASS. Independent Script HEAD pull 70/70 JS exactly matched with 9 Gate F-only helpers preserved; owner Apps Script full regression 47/47 PASS at 16:30:35 MYT, production_write:false. After PR #32 runtime, independent PILOT_TELEGRAM_QUEUE confirms update 772257172 ACK SENT, Telegram message ID 77; owner Transplant 772257174 ACK SENT ID 75, still WAITING_INFO. No Transplant domain row or ACTIVE status event created. Source HEAD update, not official deployment.

Outstanding human facts are unchanged: actual transplant date, correct M5P1/M5P2 plot allocation, and any genuine 282 count must be supplied by reporter. The Telegram original contained no 282. No fake Benar or unauthorized ACTIVE promotion permitted. Live ordinary-user history work-date and new-user native Start proof remain pending.