# PILOT_OPERATION Telegram Command Menu Recovery — 2026-10-19

Owner evidence: registered user 8858214393 was accepted, attempted `/retrieve BSE-EV-126-AQADNxNr` and received expected private Evidence denial (non-owner privacy **LIVE PASS**). Screenshot shows no native command list. Existing PILOT_TEST code `TelegramCommandTest.js` implements `configureBseTelegramTestCommands` but it was not invoked for PILOT; its harness expected `ai` when registered command was `ask_ai`.

Fix: command list for PILOT uses existing implemented command names, with descriptions free of `TEST`, while preserving TEST/PILOT_TEST legacy menu descriptions. Harness expectation aligns to `ask_ai`. New targeted 5/5 and full Node 35/35 PASS. Command menu is a Telegram remote setting and requires actual `setMyCommands` followed by `getMyCommands` read-back on correct bot; source sync alone does not publish menu. Never publish unimplemented commands.

Owner-provided private group invite: `https://t.me/+35NQMV4WHXg1NWU1`. Do not hard-code the invite into a public repository or silently associate it with another group without verified Telegram group identity. This owner-supplied invite can be handled separately after group association is checked.

Full PILOT_TEST functional parity: IN PROGRESS — NOT DELIVERED.
