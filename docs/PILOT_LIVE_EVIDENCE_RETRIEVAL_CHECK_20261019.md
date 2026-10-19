# PILOT_OPERATION — Live Evidence /retrieve & Access Verification (2026-10-19)
State: **PARTIAL / READ-ONLY PLUS ISOLATED TRANSPORT TEST; NO LIVE TELEGRAM RETRIEVAL PROOF**

## Current real evidence
- Google Sheets `PILOT_FILE_EVIDENCE`: exactly one existing confirmed Evidence `BSE-EV-126-AQADNxNr`, reporter's original caption `Pam rosak M2P2`, category `FIELD_OPERATION`, visibility `PRIVATE_SUBMISSION`, status `CONFIRMED`.
- Google Drive `1sxjzn4_CU8G93VAZ942RQvwl6a7QIsPV`: JPEG 114947 bytes within `01_Source_Evidence/Evidence_Files`; matches recorded Drive file ID. No new image or report generated.
- `PILOT_TELEGRAM_RETRIEVAL_AUDIT`: historical retrieval for deleted `BSE-EV-22-AQADiBBr` AND a later `SENT` retrieval for current Evidence `BSE-EV-126-AQADNXNR` at 11:09 MYT. `PILOT_TELEGRAM_USER_REGISTRY` zero rows; owner access uses separate owner identity logic.
- `PILOT_FILE_EVIDENCE_CALLBACK_PENDING`: one processed callback from real photo confirmation.

## Isolated command verification
`pilot_live_record_retrieval_readonly.test.cjs` uses the existing real Evidence ID and confirmed metadata, but stubs both Telegram transport and appendRow: 5/5 PASS for allowed owner, unauthorized/unregistered rejection, registered unrelated private access rejection, invalid command and unconfirmed status. No sendMessage, sendPhoto, Sheets write, Drive write, or newly generated report. Complete Node 31/31 suites PASS.
Identified and fixed direct `TEST_TELEGRAM_RETRIEVAL_AUDIT` lookup: now `bseRuntimeSheetName_` maps retrieval audit to PILOT environment without changing TEST/PILOT_TEST contract.
Existing user-facing `/retrieve` transport payload is PILOT-normalized from historical Evidence TEST heading. At the original code-only checkpoint the client delivery was UNVERIFIED; **the owner screenshot and server audit documented below supersede that prior limitation**.

## Owner-provided Telegram client acceptance — 2026-10-19 11:13 MYT
- Owner supplied screenshot of existing Bot OpsMate PoC conversation. It visibly shows `/retrieve BSE-EV-126-AQADNxNr` sent around 11:08 MYT and the original pump photo displayed in bot response around 11:09 MYT, with caption `Lampiran BSE-EV-126-AQADNXNR`.
- Independent PILOT retrieval audit already recorded matching owner-to-owner `SENT` via `TELEGRAM_FILE_ID` at 2026-10-19T03:09:35.270Z. This combines server evidence and owner-supplied client screenshot: **owner retrieval client acceptance LIVE PASS**.
- The screenshot also shows an earlier 10:15 message containing `Status: CONFIRMED_TEST`; this is historical output, not proof of current Sheet status. Current canonical Evidence row had been migrated and read back as `CONFIRMED`. Do not rewrite past Telegram history.
- No new media, Telegram command, or PILOT row created for this documentation update. Screenshot is owner-provided visual evidence within the conversation, not copied into repository.
- Unrelated-user negative visibility still **UNVERIFIED**. Full functional parity **IN PROGRESS — NOT DELIVERED**.

## Outstanding evidence
- Owner's `/retrieve BSE-EV-126-AQADNxNr`: **CLOSED — LIVE PASS** with matching server SENT audit and user-provided screenshot of the received photo; Telegram API message payload ID not separately captured.
- Non-owner negative access proof in actual field account, without exposing private photo to unauthorized user.
- Other command parity, media/OCR, digest, and domain acceptance remain open.
- Full PILOT_TEST functional parity: **IN PROGRESS — NOT DELIVERED**.
