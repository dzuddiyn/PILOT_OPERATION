# GI-HISTORY-OWNER-DEDUP-01 — Owner live audit and repair (2026-10-19)

## Baseline owner live proof
- User confirmed native Telegram Desktop Bot OpsMate PoC window is authenticated owner. Tested /history Oct 2026 in that window by Windows UI Automation.
- Independent PILOT_TELEGRAM_HISTORY_AUDIT 2026-10-19T13:22:31.235Z: owner 913757987, period 2026-10, SENT, OWNER_ACTIVE, 10 matched / 10 displayed.
- Exact confirmed duplicate in owner Telegram response: 2026-10-07 Timun Batu CCB, M5P1/M5P2, transplanted once but rendered twice: canonical BSE-SB-TR-20261007-001 and approved report BSE-TG-772257176. Canonical source queue_update_id is 772257174, so exact-source-ID comparison misses separate approval 176.
- Owner history also legitimately shows reporter-scoped approved sowing messages; they must not be stripped merely to match active-user counts. Registered active user Oct view previously 5 verified canonical events; private Evidence not transmitted by these tests.

## Fix and verification
- PR #95 merged, GitHub main c36907509db7044634f4cf1de27422d9eb650aa7. PILOT-only transplant canonical semantic identity uses work date, crop, variety and normalized plot set to suppress matching Telegram approval when confirmed canonical transplant exists. Unrelated plots and private Evidence stay preserved.
- Targeted coverage includes different-source semantic dedup plus distinct-plot non-dedup; local domain coverage 9/9, work-date 16/16, week parser 25/25, operational summary 7/7 and complete local test.cjs invoked with no failures. Existing test fixture initially failed due missing new helper but was corrected before merge.
- Script HEAD updated via isolated mirror. Independent clasp pull verifies 64/64 canonical JS MATCH and 9/9 runtime-only Gate F helpers preserved; no Apps Script version/deployment update.

## Post-fix live status
- Owner UIA sent /history Oct 2026 once again at approximately 21:29 MYT after Script HEAD update. Message visible as Sent in native Telegram Desktop.
- Runtime subsequently processed the same owner command. Independent PILOT_TELEGRAM_HISTORY_AUDIT at 2026-10-19T13:30:31.260Z records **SENT / OWNER_ACTIVE / 9 matched / 9 displayed**, compared with pre-fix 10/10. This is a genuine post-fix audit event, not a local test.
- Telegram Desktop UIA read of the bot's new response confirms the 2026-10-07 Timun Batu CCB M5P1/M5P2 transplant now appears once as BSE-SB-TR-20261007-001; duplicate BSE-TG-772257176 is absent. Semaian owner-scoped records and other verified operations remain represented. Existing visibility constraints remain and no private Evidence media was re-sent.
- No production/official BSE write occurred. No duplicate command retry was performed.
- Status: IMPLEMENTATION MERGED, SCRIPT HEAD UPDATED, LOCAL PASS, **OWNER DEDUP SCOPED LIVE PASS / INDEPENDENT AUDIT PASS**. Full operational-history functional parity NOT DELIVERED.