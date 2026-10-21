# GI-FIELD-UX-NONDELETE-AUTHORITY-PROVISION-PLAN-36E

Status: PLAN COMPLETE / PROVISIONING NOT AUTHORIZED.

Target: isolated TEST_ONLY workbook 1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY, script 16y4slvh-7m4CKtz7_tqDB3gmtBw8QZ_tlsZljc7ijnm3pScEUEDjckpO; owner dzuddiyn01@gmail.com. PR #156 source only. Leave historical TEST_ONLY_27_F untouched.

Authority split: GitHub is code authority; a separately controlled approval issuer is approval authority; approval/audit ledger is operational evidence; INTENT/LEDGER/EVIDENCE/RECEIPT are transaction state only. No client flag, mock actor_verified value or editable Sheets cell is trusted authentication.

Proposed provisioning (requires new explicit owner approval):
1. Freshly verify exact owner, Script binding, workbook ACL, sheet list and baseline hashes; save snapshot without credentials.
2. Create isolated TEST_ONLY_NONDELETE_APPROVAL_AUTH and TEST_ONLY_NONDELETE_APPROVAL_AUDIT tables ONLY after approved change; no changes to the four transaction tabs. Separate issuer access from consumer access; restrict direct spreadsheet editing, and independently test effective permissions. File-owner editability cannot be eliminated by sheet protection alone.
3. Add server-only trusted issuer using a verified session/identity boundary and a separate explicit approval action; issuer generates nonce and approval id with secure randomness, binds actor ID, event, payload hashes, UTC issue/expiry, revision, and appends audit before enabling any consume path.
4. Consumer checks immutable audit chain, expiry, identity and nonce under one ScriptLock; mark consumed only after independent transaction readback. Torn writes become WRITE_OUTCOME_UNKNOWN and reconcile before retry.
5. Align timezone: Apps Script Asia/Kuching; spreadsheet currently Etc/GMT. Use epoch milliseconds/UTC only for authority lifetimes until independent timezone readback is proven.
6. Negative proof: unauthorized caller cannot issue, revoke, consume or directly edit authority records; duplicate, conflicting, stale, malformed, revoked and cross-workbook requests deny.
7. Snapshot and readback every authorized write. Rollback: disable issuer/consumer first; preserve audit evidence, do not delete rows or alter historical partial fixture; revert only source under separately authorized change.
8. STOP until provisioning approval specifies allowed new tabs, issuer implementation, ACL mutations and Script HEAD change. No live transaction or deployment authorized by this plan.

Acceptance: trusted actor evidence, one-time nonce, monotonic revisions, audit/approval parity, concurrent lock behavior, independent permission verification and no write to official/PILOT data.
