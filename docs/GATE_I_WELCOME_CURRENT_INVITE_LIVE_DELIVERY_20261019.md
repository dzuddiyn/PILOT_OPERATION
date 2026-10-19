# Gate I — Current Group Invite One-Time Welcome Delivery (2026-10-19)

## Authorization and code
- Owner expressly approved using the current Telegram getChat invite for the exact verified operational group in lieu of the obsolete invite hash.
- PR #83 merged; canonical GitHub main merge SHA 62c52b61e7f72e123e0d470cebacabf6404dae73.
- PILOT-only validator verifies REGISTERED_ACTIVE single target, exact allowed group ID and returned chat identity, group/supergroup type and t.me invite URL shape. Revalidates group before attempt. No TEST/production/official BSE write.
- Targeted checks: welcome-once guards 7/7 PASS; registration group invite 8/8 PASS; public inspector 3/3 PASS.
- PILOT Apps Script Script HEAD updated via isolated mirror preserving nine Gate F runtime-only JS helpers; independent clasp pull canonical 64/64 MATCH plus 9/9 helpers preserved. No Apps Script version or deployment update claimed.

## Live proof
- Existing authorized owner Chrome Apps Script editor controlled through Windows UI Automation.
- 13:58:19 MYT inspectBsePilotGroupLink: GROUP_LINK_MATCH {"valid":true,"type":"group","link_visible":true}.
- 13:59:20 MYT one-time delivery function preflight: GROUP_LINK_MATCH {"valid":true,"type":"group","link_visible":true}.
- 13:59:23 MYT same invocation: WELCOME_DELIVERY_SENT {"sent":true,"recipient_verified":true,"group_verified":true}; execution completed 13:59:24 MYT.
- Code requires a Telegram sendMessage result.message_id and stores Script Properties delivery key as SENT:<message_id> after prior SEND_OUTCOME_UNKNOWN marker; actual numeric message ID not echoed in log. No blind repeat performed.
- Status: Telegram API acknowledged one send; recipient app UI read receipt and joining group are not independently verified by this record. Preserve do-not-repeat delivery marker.
- Registration already REGISTERED_ACTIVE; no registration replay. Full PILOT_TEST Functional Parity remains IN PROGRESS — NOT DELIVERED.
