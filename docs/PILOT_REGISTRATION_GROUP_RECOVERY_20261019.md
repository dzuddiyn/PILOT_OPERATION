# PILOT_OPERATION Group → PM Registration Recovery (2026-10-19)

## Reproduction / live read-only state
Owner reported new member in operational Telegram group received no registration UI, and owner received no approval card.
Current live PILOT sheets: `PILOT_TELEGRAM_USER_REGISTRY` 0 applicants; `PILOT_TELEGRAM_REGISTRATION_CARD` 0 cards; `PILOT_TELEGRAM_REGISTRATION_CALLBACK_PENDING` 0 callbacks. `PILOT_OWNER_REGISTRY` has an active owner. Therefore, no captured pending application exists to approve; do not fabricate one.
PR #30 previously solved **native `/start` in the bot's private chat**, not registration from group membership alone. Old group opt-in nudge still advertised `/start <token>`, which is confusing and not the preferred PILOT native Start. No evidence that joining a group itself triggered a private Telegram Start.

## Locked architecture / scope
New user must initiate a private chat with the existing PILOT bot. `/start` in PM → REGISTRATION_PENDING → owner/admin TERIMA/TOLAK card → first human decision sets REGISTERED_ACTIVE or REJECTED. No automatic group enrollment, user impersonation, or unauthorized private Evidence retrieval. Numeric Telegram IDs are authority; display names are non-authoritative. TEST and PILOT_TEST flow remains unchanged.

## Fix and proof
- PILOT group `/start` in approved group now replies with an actionable `Daftar melalui PM bot` URL button. It does **not** write registration/approve access in group. PM native `/start` remains the only applicant registration entry point.
- PILOT-only outgoing UI normalizes inherited `Pendaftaran ... TEST` wording without rewriting source or historical records.
- Targeted synthetic 8/8 PASS; full Node 32/32 suites PASS; 64/64 JS syntax PASS. No live Telegram message sent, no applicant/owner record created and no private photo revealed by tests.

## Boundaries / acceptance
After Script HEAD sync, verify fresh `/start` in authorized group yields PM button and PM Start yields exactly one REGISTRATION_PENDING and owner approval card. Confirm registry/card readback; only owner can approve; rejected or pending user denied private Evidence retrieval. Because Telegram forbids bot-initiated PM to an uninitiated user, an actual group member must click the PM link / Start. Do not treat a completed code push as successful user registration. Mark live field registration and non-owner negative access UNVERIFIED until real evidence.

Full PILOT_TEST functional parity: IN PROGRESS — NOT DELIVERED.
