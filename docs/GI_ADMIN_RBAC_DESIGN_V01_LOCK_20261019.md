# GI-ADMIN-RBAC-DESIGN-01 — LOCKED DESIGN v0.1 (Option B)

**Decision:** Owner approved Option B on 2026-10-19. **DESIGN LOCK ONLY — NOT IMPLEMENTED.** No role, permissions, Sheet schema, bot menu, Script HEAD or deployment has been changed.

## 1. Authority and compatibility

- Environment: **PILOT_OPERATION**; GitHub `dzuddiyn/PILOT_OPERATION` is canonical code/design authority. Pilot records belong to isolated PILOT Sheets.
- Preserve 2026-09-29 PoC contract in `docs/ARCHITECTURE.md`: a manually provisioned active OpsMate ADMIN has the existing operational capabilities of an active OWNER (including restricted retrieval, registration decisions, approved record actions and /delete, subject to existing confirmation and visibility rules).
- **Explicit approved exception:** **only immutable/bootstrap OWNER identity can appoint or revoke OpsMate ADMIN.** An ADMIN cannot appoint/revoke itself or others, nor create/modify OWNER identities, even though ADMIN otherwise inherits owner operational capabilities. This overrides the old generic statement that owner/admin may change user roles; no other authority is silently altered.
- Telegram group administrator rights are a separate Telegram concern and MUST NOT be changed by this workflow.
- REGISTERED_ACTIVE has ordinary member operations and may view GROUP_STANDARD or self-reported PRIVATE_SUBMISSION only; no elevated privilege from displaying an admin menu or from Telegram group status.
- OWNER authority anchored to a separately configured, explicitly verified bootstrap allowlist/identity; DO NOT infer OWNER simply from `is_admin=true` or membership of a mutable registry. Existing active-owner lookup currently does **not** enforce `is_admin` as a prerequisite, so implementation requires a complete call-site audit and migration plan before enabling dynamic roles.

## 2. Canonical role projection (design)

- `OWNER`: original explicitly configured owner identity; cannot be changed by Telegram role UI. Do not permit the last/bootstrap owner to be removed.
- `ADMIN`: explicitly appointed by OWNER, must also have valid `REGISTERED_ACTIVE` private-chat identity; operational authorization may resolve via owner/admin registry projection once validated. Never conflate admin with Telegram group admin.
- `REGISTERED_ACTIVE`: approved member only.
- `INACTIVE/REJECTED/PENDING`: deny operational and privileged access as existing contract prescribes.
- Current `PILOT_OWNER_REGISTRY` has `is_active/is_admin`; current `PILOT_TELEGRAM_USER_REGISTRY` has registration `status` only. Do not add an editable second independent role authority. Proposed canonical role grant ledger and derived registry projection require a separate approved data-migration design; historical owner row must be preserved.
- No role change by manual editing of Sheet. Any migration from existing manual ADMIN rows must be explicitly reconciled with owner approval and preserve original role provenance; do not auto-promote.

## 3. Telegram PM UX (design, inert)

- Proposed `/users` visible to owner and operational admins only for relevant read views, but only OWNER receives role-management buttons.
- OWNER sees identity-bound list of `REGISTERED_ACTIVE` users with numeric ID (for confirmation), display name as non-authoritative label, current role, active status, and clear `Lantik ADMIN` or `Batalkan ADMIN` action.
- Step 1 selection creates **short-lived single-use pending intent**, not a permission write.
- Step 2 explicit owner-only confirmation displays target, before/after role, high-privilege warning, and actions `Sahkan` / `Batal`. A distinct callback token bound to requester, target numeric user ID, private chat, intent revision and expiry is required.
- Confirm callback must recheck **immutable OWNER identity**, PM chat/from numeric ID, target still REGISTERED_ACTIVE, current canonical role/revision unchanged, intent unexpired/open, and operation not already applied.
- Only after authoritative WRITE → READ BACK → VALIDATE should bot say successful promotion/revocation; if uncertain, report `WRITE OUTCOME UNKNOWN` and reconcile rather than retry blindly.
- An ADMIN sees its operational role but never receives actionable role-management controls; server-side controller denies forged callbacks regardless of menu visibility.
- User is notified by private message after committed verified state; notification failure is separately recorded and never rolls back verified authority or fabricates success.

## 4. State, transport, audit and error model

- Intent states: `OPEN`, `CANCELLED`, `EXPIRED`, `APPLIED_VERIFIED`, `DENIED`, `WRITE_OUTCOME_UNKNOWN`, `REVISION_CONFLICT`.
- Per-intent unique ID/idempotency key; record initiator, target numeric IDs, role before/after, registry revision/hash, timestamps (MYT display, UTC audit), action type, confirmation callback ID, outcome and read-back evidence.
- Token should be opaque and collision-resistant, expiry-limited, single-use, not loggable as secret. No credentials, file IDs or private Evidence captions in audit.
- Lock plus compare-and-swap revision prevents double-click/race/two-owner intent collision. Fail closed on invalid callback, spoofed actor, foreign chat, target owner, inactive user, mismatched source or missing backing row.
- Important rollback boundary: no deletion of original audit/provenance. A revoke removes elevated OpsMate authorization on subsequent privileged checks; operational history remains immutable.
- State authority must remain distinct: GitHub design/code; controlled PILOT role grant (authority after future approved migration); user registration status; Telegram message transport; immutable audit history. Never use Telegram group membership as OpsMate authority.

## 5. Acceptance matrix and implementation gates

1. OWNER appoints ACTIVE member once; read-back verifies role and numeric ID; repeat callback = NO_CHANGE.
2. OWNER revokes ADMIN; next privileged check rejects role; ordinary active-user access remains.
3. ADMIN and MEMBER attempt forged/copy-pasted appoint/revoke callbacks = DENIED, zero writes.
4. Owner/target inactive, expired callback, changed registry revision, private-chat mismatch, duplicate role IDs and role-source conflict = DENIED or REVISION_CONFLICT.
5. Cannot promote pending/rejected/unregistered users or modify bootstrap OWNER.
6. Evidence PRIVATE_SUBMISSION and restricted access are tested both before/after promotion and after revoke; no private image may be sent to a non-authorized test account.
7. Concurrent updates/partial write/read-back failure = WRITE_OUTCOME_UNKNOWN, no success reply; reconcile actual state before any retry.
8. PM role notification failures handled separately; permission truth wins over transport acknowledgements.
9. Telegram group-admin permissions unchanged, TEST and official BSE systems untouched, `production_write:false`, `official_bse_write:false` preserved.
10. Dedicated isolated synthetic fixture → regression → protected pilot dry run with owner approval → independent Sheet read-back → controlled role grant and revoke proof; keep clean TEST_ONLY artifacts.

## 6. Open implementation design dependencies — NOT AUTHORIZED HERE

- How to persist immutable bootstrap OWNER independently of editable `is_admin`, how to project existing manual owner/admin rows safely, and exactly which existing controllers rely on `bseTestOwnerForTelegramUser_`.
- Whether a role grant ledger becomes canonical or an augmented owner registry is canonical; requires explicit persistence-authority selection before implementation.
- Token signing/nonce delivery and Apps Script concurrency/expiry specifics.
- No implementation, user promotion, role registry schema write, role migration, command publication, Script HEAD sync or live privilege proof performed as part of this DESIGN LOCK.

**Status:** USER DECISION LOCKED / DESIGN DOCUMENT PREPARED / IMPLEMENTATION NOT STARTED / FULL PILOT_TEST FUNCTIONAL PARITY NOT DELIVERED.
