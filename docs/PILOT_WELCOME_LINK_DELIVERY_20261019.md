# Registration Welcome Link Delivery — 2026-10-19

Owner authorized one-time welcome group link for the existing registered user only. Source operational registry shows exactly one REGISTERED_ACTIVE private-chat user mapped to the group. The user-provided private invite URL is checked by SHA-256 against the Telegram getChat invite_link for the exact allowlisted group ID, not stored in repository plaintext. No new invite created. Wrong group, absent invite, ambiguous user or mismatched link fails closed.

One-time guarded send writes Script Property SEND_OUTCOME_UNKNOWN before Telegram sendMessage and SENT:<message ID> only after acknowledgement. Never auto retry uncertain sends or replay registration. Script Property holds no credential. Uses original bot and already-approved private chat. Tests synthetic only, real send requires independent matching Telegram getChat readback.

Do not claim DELIVERED until Telegram getChat hash match, Telegram send acknowledgment, idempotence property readback and safe record of evidence. Full parity IN PROGRESS — NOT DELIVERED.
