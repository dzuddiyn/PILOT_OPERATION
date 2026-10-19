# PILOT_OPERATION — Live Evidence /retrieve & Access Verification (2026-10-19)
State: **PARTIAL / READ-ONLY PLUS ISOLATED TRANSPORT TEST; NO LIVE TELEGRAM RETRIEVAL PROOF**

## Current real evidence
- Google Sheets `PILOT_FILE_EVIDENCE`: exactly one existing confirmed Evidence `BSE-EV-126-AQADNxNr`, reporter's original caption `Pam rosak M2P2`, category `FIELD_OPERATION`, visibility `PRIVATE_SUBMISSION`, status `CONFIRMED`.
- Google Drive `1sxjzn4_CU8G93VAZ942RQvwl6a7QIsPV`: JPEG 114947 bytes within `01_Source_Evidence/Evidence_Files`; matches recorded Drive file ID. No new image or report generated.
- `PILOT_TELEGRAM_RETRIEVAL_AUDIT`: historical one-row retrieval for the deleted `BSE-EV-22-AQADiBBr`; **no successful /retrieve audit entry for the current Evidence**. `PILOT_TELEGRAM_USER_REGISTRY` zero rows; owner access uses separate owner identity logic.
- `PILOT_FILE_EVIDENCE_CALLBACK_PENDING`: one processed callback from real photo confirmation.

## Isolated command verification
`pilot_live_record_retrieval_readonly.test.cjs` uses the existing real Evidence ID and confirmed metadata, but stubs both Telegram transport and appendRow: 5/5 PASS for allowed owner, unauthorized/unregistered rejection, registered unrelated private access rejection, invalid command and unconfirmed status. No sendMessage, sendPhoto, Sheets write, Drive write, or newly generated report. Complete Node 31/31 suites PASS.
Identified and fixed direct `TEST_TELEGRAM_RETRIEVAL_AUDIT` lookup: now `bseRuntimeSheetName_` maps retrieval audit to PILOT environment without changing TEST/PILOT_TEST contract.
Existing user-facing `/retrieve` transport payload is PILOT-normalized from historical Evidence TEST heading. Field delivery and client-side Telegram rendering **UNVERIFIED** until explicitly run against bot; no claim of LIVE PASS or retrieved photograph sent.

## Outstanding evidence
- Actual authorized `/retrieve BSE-EV-126-AQADNxNr` and corresponding Telegram `sendPhoto` acknowledgment with audit SENT and correct recipient; cannot infer this from code or historical audit.
- Non-owner negative access proof in actual field account, without exposing private photo to unauthorized user.
- Other command parity, media/OCR, digest, and domain acceptance remain open.
- Full PILOT_TEST functional parity: **IN PROGRESS — NOT DELIVERED**.
