# GI-EMERGENCY-OWNER-ADMIN-HANDOVER-20261022

**Effective planning date:** 22 October 2026 (MYT)  
**Target business handover:** 23 October 2026  
**Decision source:** Existing OpsMate owner instructed: `S S.` = next operational OWNER; `zen areyf` = next operational ADMIN.  
**Status:** **NOMINATED / NOT GRANTED / NOT CUT OVER / BSE RECEIVING SIGN-OFF PENDING**. This document is an assignment and controlled-cutover plan, not an authorization ledger or proof of access. It must not be used as a live role projection.

## Verified facts and boundaries

- Canonical source: `dzuddiyn/PILOT_OPERATION`, main `131edda8b3ea896dcd6682661da6cfe4b6af6379` when this handover decision was inspected.
- Actual `PILOT_OWNER_REGISTRY`: exactly one populated active owner row, `PILOT_OPERATION_OWNER` with `is_active=TRUE`, `is_admin=TRUE`; this original owner remains active at decision time.
- Actual `PILOT_TELEGRAM_USER_REGISTRY`: eight `REGISTERED_ACTIVE` entries; exactly one row each for display names `S S.` and `zen areyf`, with numeric Telegram ID and private-chat ID present in each. A display name is **not** proof of corporate authority; verify the numeric IDs privately immediately before any role change. Do **not** put IDs, Telegram tokens, private-chat IDs or OAuth secrets in GitHub.
- No `PILOT_ROLE_GRANT_LEDGER` or `PILOT_ROLE_CHANGE_INTENT` sheet exists. No canonical ADMIN grant has been observed.
- Current legacy `OwnerRegistryTest.js:bseTestOwnerForTelegramUser_` accepts any active matched owner-registry row, without requiring `is_admin` and without distinguishing OWNER from ADMIN. **Do not add either recipient as a new owner row** or set `is_admin=TRUE` to simulate a safe ADMIN grant.
- Existing feature branch `feat/gi-rbac-m3-transaction-20261019` (`9e9a80d829db1bb5b8c8d5cc97aef99e27185374`) has local RBAC safety work and tests, but its own evidence calls out an **unimplemented trusted Apps Script binding** `bseRoleTrustedAdaptersForBook_`, gaps in legitimacy/permissions and incomplete runtime proof. It is not merged or deployed. Do not treat local 29/29 synthetic fault checks as live role acceptance.
- `docs/GI_ADMIN_RBAC_AUTHORITY_LOCK_20261019.md` requires an immutable independently verified bootstrap OWNER and a separate validated grant ledger. Changing that anchor is an **architecture exception / one-time controlled re-anchoring** needing specific approval and owner+recipient identity checks; the existing Telegram role UI cannot do it.
- Operational owner, Google Apps Script/Drive/Sheet owner, GitHub maintainer and Telegram BotFather custodian are **different authorities**. Re-anchoring OpsMate does not transfer account ownership or credentials.
- Shadow pilot only; `production_write:false`, `official_bse_write:false`.

## Proposed target after controlled acceptance

| Role | Telegram display | Planned powers | Current effective state |
| --- | --- | --- | --- |
| BSE operational OWNER | `S S.` | owner-controlled operational management, including recipient responsibility and owner-only approval/role governance after verified cutover | `REGISTERED_ACTIVE`, NOT OWNER |
| BSE operational ADMIN | `zen areyf` | delegated daily operations and approved admin actions; **cannot appoint ADMIN or change OWNER** | `REGISTERED_ACTIVE`, NOT ADMIN |
| Departing owner | existing bootstrap owner | **no active operational privileges after verified handover**; any technical custodianship must have separately documented BSE agreement | CURRENT active OWNER until an authorized verified cutover |

Do not infer current operational power from this table. Any ACTIVE status is established by runtime authority read-back, not by wording in docs.

## Mandatory cutover gates

### Gate H0 — Today: non-destructive readiness

1. Require BSE receiving representative's approval/acknowledgement for `S S.` and `zen areyf` and identify corporate technical custodian. Identity can be established using the two existing `REGISTERED_ACTIVE` numeric IDs, but must be independently confirmed by private authenticated recipient action.
2. Snapshot owner registry, user registry, operational callback/queue state and source authority fingerprints; keep owner ID and chat ID OUT of GitHub evidence.
3. Inventory existing owner-only call sites, digest recipient resolution, pending approval cards, worker/retrieval privileges, role fallback and BotFather/Google ownership dependencies.
4. Retain one active owner until a **verified** recipient can perform approved actions; never allow two active bootstrap owners or silently promote a member.

### Gate H1 — Safe implementation and role cutover (high-impact; separate owner confirmation)

1. Implement a **one-time off-band OWNER anchor re-key** with explicit signed human acceptance; the operator-facing admin UI cannot mutate bootstrap owner. This is a documented exception to the immutability assumption, not a generic ability for future users to change owner.
2. Implement and bind the authoritative runtime role resolver with read-only adapters before enabling dynamic ADMIN, with separate owner/admin capability checks at every privileged side effect; no legacy `owner.ok` or `is_admin` fallback.
3. Authenticate `S S.` and `zen areyf` to the existing verified registration numeric IDs and PM sessions; test unauthorized/replayed/stale/foreign-chat callbacks; verify 29 actual-path synthetic faults and full regression.
4. Execute one controlled bootstrap OWNER handover and independently read back active owner / old-owner denial. Only then issue a separately audited `GRANT_ADMIN` to `zen areyf` and verify its role **cannot** manage admins, alter owner or access unauthorized private data.
5. Check read-back of digest recipients, approval callbacks, restricted retrieval, owner deletion/registrations, no stale fallback; never report PASS from Script HEAD push alone.
6. No source merge/Script HEAD sync while a trusted adapter is unimplemented or native regression fails.

### Gate H2 — BSE acceptance and technical custody

- BSE receiver confirms who actually operates bot, accepts risks and sign-off. Unverified acceptance remains PENDING.
- Inventory and transfer Google spreadsheet/Drive, Apps Script, GitHub and BotFather authority **only through supported authorized corporate access workflows**. Never share personal account passwords, OAuth tokens or secret exports.
- Update and independently verify the owner/admin runbook, runtime trigger/scheduler, private access, fallback contacts and incident response owner.
- Mark `DELIVERED` only after the receiving officer's acceptance and the required verified operational capability; formal production integration requires its own separate gate.

## Deadline fallback if H1 cannot PASS before 23 October

**Do not represent this as a fully handed-over autonomous operational platform.** Provide read-only/limited pilot materials and runbook with explicit blockers, and use the BSE's existing manual approval/reporting procedure. Prevent sensitive/owner-only operations without a verified authorized BSE owner using an approved fail-closed operational isolation plan, and document any outstanding old-owner permissions; do not silently leave the departed employee responsible for approvals. Any disablement of existing worker/trigger or owner credential requires a separate controlled and verified operational change.

## Checkpoint evidence / not performed

- User's nominations recorded; GitHub document itself cannot activate privileges.
- Read-only inspection verified registrations and owner row; local M3 tests had 17/17 Node test-file successes and synthetic F01–F29 passing in fixture, but **no actual Apps Script RBAC runtime test**.
- **No registry/role/Google asset/Telegram/Apps Script changes and no credentials handled by this document.**
- Status: `BUSINESS DECISION RECORDED`, `LIVE OWNER TRANSFER BLOCKED`, `ADMIN GRANT BLOCKED`, `BSE RECEIVER ACCEPTANCE UNVERIFIED`.
