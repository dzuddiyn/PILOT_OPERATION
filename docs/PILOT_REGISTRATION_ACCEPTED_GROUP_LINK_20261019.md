# PILOT_OPERATION Registration Acceptance Group Link (2026-10-19)

Owner correction: after TERIMA, Telegram bot should send accepted notification and the existing operational group join link via PM. Existing user 8858214393 is already REGISTERED_ACTIVE and approved; do not re-approve or replay callback.

Prior locked TEST contract directed approved users to join via owner/admin; owner now approves PILOT-specific link addition. Implementation only for PILOT_OPERATION: `bsePilotRegistrationAcceptanceText_()` verifies approved status, exact allowed group ID from registration row, Telegram `getChat` group ID/type, and a returned valid t.me invite_link or verified public group username. No invite generation or arbitrary URL, no link before approval, no group membership automation. Failure falls back to an honest message to contact owner/admin. TEST and PILOT_TEST callback texts remain unchanged.

Synthetic targeted 8/8 PASS and complete Node 34/34 suites PASS; syntax and diff checks PASS. Existing prior acceptance PM was already delivered without a link; no historical auto-resend or duplicate registration. Field proof of Telegram getChat response/invite link remains UNVERIFIED until live owner-authorized event. Full PILOT_TEST functional parity IN PROGRESS — NOT DELIVERED.
