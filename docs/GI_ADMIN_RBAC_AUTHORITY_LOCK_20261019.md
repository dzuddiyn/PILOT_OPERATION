# GI-ADMIN-RBAC-AUTHORITY-LOCK-01 — Decision LOCK (2026-10-19)

**OWNER APPROVED — ARCHITECTURE ONLY. NOT IMPLEMENTED.**

Decision: **Immutable Bootstrap OWNER + Canonical Role Grant Ledger + Registration-only User Registry** is the authority model for future OpsMate RBAC implementation. Extends `docs/GI_ADMIN_RBAC_DESIGN_V01_LOCK_20261019.md` (Option B); all other decisions in that design remain effective.

## Authority boundaries

1. **Bootstrap OWNER**: distinct, immutable, explicitly validated identity pinned outside any ADMIN-grant projection. OWNER alone can appoint/revoke OpsMate ADMIN. No Telegram UI can edit or revoke this identity. Never infer OWNER from editable `is_admin`, Telegram group admin status, username or an ordinary registration row.
2. **Canonical Role Grant Ledger** (future PILOT-only operational authority): source of truth for ADMIN grants/revocations, including actor numeric ID, target numeric ID, action, previous/current role, revision, UTC timestamp, provenance, confirmation, idempotency key, outcome and independent read-back evidence. Revocation is recorded as a transition, not historical deletion. Exact sheet schema and transactional strategy remain implementation design.
3. **User Registry — registration ONLY**: stores REGISTERED_ACTIVE/PENDING/REJECTED and identity/private-chat registration state. Registration does not independently confer ADMIN privilege; an ADMIN must still be registered and active.
4. **Derived role view and legacy owner/admin registry**: existing `PILOT_OWNER_REGISTRY` must not become a competing source of truth. Treat existing `is_admin` as historical/compatibility projection only after controlled reconciliation; current row preserved unchanged until separately authorized migration. Role conflicts/missing authoritative state fail closed.
5. **GitHub**: canonical authority for code/design and migration specification; not runtime mutable role grant authority. Telegram PM and callbacks are transport, not authority; audit is historical proof and must not implicitly grant role.
6. **Permission semantics (Option B LOCK)**: ADMIN inherits existing PoC OWNER operational powers, including restricted history and authorized /delete, EXCEPT ADMIN cannot appoint/revoke ADMIN or modify OWNER identity. OWNER alone has role-management actions. No Telegram group-admin permission changes.

## Migration safety contract (NOT AUTHORIZED)

- Before any write, snapshot both existing PILOT owner and registration registries, capture counts, identity fingerprints and revision/checksum; independently verify original bootstrap OWNER.
- Shadow-read both legacy resolver and proposed new resolver; enumerate all call sites of `bseTestOwnerForTelegramUser_`, `bseTelegramRegistrationPrivateAccess_` and recipient/approval/queue authorization checks. Record any SOURCE_MISMATCH and do not silently promote existing users.
- Prepare separate controlled source migration with explicit owner approval: bootstrap owner anchoring, ADMIN grant ledger setup, derived projection, audit, atomic CAS/idempotency and reconciliation of any existing manual admin row. No role escalation by schema creation alone.
- Stage synthetic isolated tests, dry-run role resolution, confirm unchanged ordinary access and private Evidence visibility, then separately authorize controlled live test and eventual cutover.
- Preserve `production_write:false` and `official_bse_write:false`. Do not alter Apps Script or Telegram menus until implementation authorization.

## Mandatory acceptance

- Only authenticated bootstrap OWNER through PM with explicit second confirmation can issue role grant or revoke.
- ADMIN/REGISTERED_ACTIVE forged/replayed/expired/foreign-chat callbacks DENIED with zero permission writes.
- Registered-active precondition; targets with conflicted/inactive/duplicated identity DENIED.
- One grant/revoke transaction per revision; concurrent intents conflict safely; WRITE-READBACK-VALIDATE required before SUCCESS.
- ADMIN receives approved operational rights and restricted retrieval; after revoke, elevated access is immediately denied while ordinary active-member permissions remain.
- The original bootstrap OWNER stays permanent and cannot be demoted using Telegram; legacy registry conflicts and partial write produce SOURCE_MISMATCH or WRITE_OUTCOME_UNKNOWN, not PASS.
- No authorization derived from Telegram group admin; privacy negative tests must not send owner PRIVATE_SUBMISSION media to unauthorised user.

**Status:** AUTHORITY MODEL LOCKED BY OWNER / DOCUMENT PREPARED; GITHUB MAIN ADOPTION REQUIRES EXPLICIT MERGE AUTHORIZATION UNDER AGENTS.md. NO ROLE MIGRATION, NO GRANTS, NO PERMISSION/UI/RUNTIME CHANGE. FULL PILOT_TEST PARITY NOT DELIVERED.
