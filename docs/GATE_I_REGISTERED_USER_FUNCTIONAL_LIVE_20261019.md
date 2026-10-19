# Gate I — Registered Active User Functional Live Proof (2026-10-19 MYT)

## Scope and source
- Canonical dzuddiyn/PILOT_OPERATION main at precheck a77cde0b94b0dd02a44fd08e1db809d508e11822; clean local working tree.
- Operator used Windows UI Automation on already-authorized Telegram Web browser session. Telegram account menu displayed diyn660011; corresponding PILOT_TELEGRAM_USER_REGISTRY entry was REGISTERED_ACTIVE.
- Telegram Bot OpsMate PoC private chat inspected using UIA; this was not the owner account.
- Live 19:56 MYT: user sent /status plot M2P1 by UIA. Telegram UI response at 19:57: Status Plot M2P1; Peria Besar; batch BSE-SB-CB-20261014-001; ACTIVE; no confirmed census/treatment. Independent PILOT_TELEGRAM_PLOT_STATUS_AUDIT: 2026-10-19T11:57:37.583Z, SENT, STATUS_UNIQUE.
- Live 20:00 MYT: user sent /summary plot M2P1,M2P2; Telegram UI returned M2P1/M2P2, Peria Besar, same batch, ACTIVE, no confirmed census/treatment. Independent audit: 2026-10-19T12:00:32.331Z, SENT, SUMMARY_UNIQUE_UNIQUE.
- Live 19:58–19:59 MYT: user sent /history 2026-10-14; Telegram UI response: no operational records in period. Independent PILOT_TELEGRAM_HISTORY_AUDIT: 2026-10-19T11:59:27.813Z, SENT, REGISTERED_ACTIVE, matched_count 0, displayed_count 0.
- One initial /summary plot M2P1 had no response: input INVALID per current contract requiring two to six distinct plot IDs. Corrected input subsequently PASS; do not classify initial syntax mismatch as a runtime regression.
- Existing true negative private Evidence retrieval: Bot UI shows 'Anda tidak mempunyai akses kepada Evidence ini.' for BSE-EV-126-AQADNxNr. Independent PILOT_TELEGRAM_RETRIEVAL_AUDIT at 2026-10-19T03:54:28.338Z: DENIED / VISIBILITY_DENIED for registered new user; previous owner retrieval SENT. Negative access was not rerun, avoiding unnecessary requests for another owner's private photo.
- No new registration, owner approval, farm report, domain write, or private photo send performed by these tests. Test commands were sent only in registered test user's existing private bot conversation.

## Acceptance boundary
- Scoped live functional: /status PASS; /summary transport PASS but human formatting not accepted; /history transport PASS but content FAIL because 2026-10-14 VERIFIED_TEST Transplant was missing from displayed history. Prior empty-response audit cannot be accepted as semantic PASS. Private Evidence denial supported by prior real Telegram UI and Sheet audit. User account identity UI verified by menu label and registry, not independent numeric-ID read from Telegram profile.
- /start for already-active user and positive /retrieve of an Evidence legitimately visible to this user NOT TESTED in this session. Other workflows, independent runtime regression and full functional parity NOT DELIVERED.
- No source-code change needed or Apps Script push for these tests. production_write:false; official_bse_write:false.
