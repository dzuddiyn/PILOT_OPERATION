# GI-FIELD-UX-NONDELETE — 36P-AUTHORITY-MODE-LOCK

**Date:** 2026-10-21
**Owner decision:** 36P-AUTHORITY-MODE-LOCK approved.
**Status:** LOCKED DESIGN / DEVELOPMENT AUTHORIZED / REAL ISSUER NOT INSTALLED.

## Decision (LOCKED)
Google authenticated approval UI is the **primary and required** channel for transaction-specific owner consent. The separately built Gate 36P Ed25519 verifier is an **optional defense-in-depth candidate**, not a mandatory signer/key-management dependency or substitute for consent. Do not introduce offline signing or user key-management steps by default.

Implementation candidate: TEST_ONLY **Apps Script HTMLService Web App**, operated under **execute as user accessing the web app**, owner-only access, with explicit `Session.getActiveUser().getEmail()` and effective identity checks that must fail closed if blank, mismatched, or unavailable. Never deploy under execute-as-me as a shortcut to an owner-authenticated consent decision. Script HEAD push, new web-app deployment, account OAuth changes and any live writes remain separately gated.

**Threat boundary:** Google authenticates the browser session; it does **not** independently prove that a person physically clicked the button. A script running as the same owner may be capable of invoking server methods directly. This UX reduces accidental approval but is not a tamper-proof human-presence attestation. Automation MUST NOT manufacture owner approval. Require transaction-specific consent in UI, no general 'approved=true' input shortcut, no raw signed client actor claims.

## UX contract
1. Server loads the canonical TEST_ONLY transaction **from the authoritative record**, not from a client-provided object. Display source key, event, BAJA/CENSUS operation, intended row effect, ledger/approval SHA-256 hashes, time and expiry, and actor. No hidden batch approval, silent write or combined Approve+Execute.
2. User reviews one transaction and chooses `APPROVE` or `REJECT` in the signed-in UI. Pending and disabled state until a fresh server challenge is obtained. Reject and timeout must remain safe.
3. Server mints an unpredictable nonce and stores it server-side against the exact pending request/hash, authenticated actor and expiry. Proposed challenge TTL is 10 minutes; authorization never exceeds one hour. Use UTC epoch milliseconds.
4. On explicit decision, server rechecks fresh Google identity, challenge/nonce, operation, hash, workbook ID, expiry, lock, original state and replay ledger. Ignore all client-supplied `owner_authorized`, `verified_actor`, email, status or trusted-store addresses. No client may write approval/audit sheets directly.
5. Per-request state machine: `PENDING -> APPROVED -> CONSUMED`; `PENDING -> REJECTED/EXPIRED`; `APPROVED -> REVOKED/EXPIRED`. Every transition is serialized with real ScriptLock, hash-linked append-only audit, expected revision and read-back. Duplicate identical requests reconcile to the same outcome; conflicting/replayed, partial or stale states fail closed.
6. **Authority storage limitation:** Owner-editable protected Sheets alone are not immutable approval authority. Independent audit anchoring and restore/reconciliation proof MUST be implemented and reviewed before even TEST_ONLY live approval writes. The external anchor location and permitted gateway permissions require an explicit follow-up design review; do not silently make GitHub canonical for approvals.

## Scope/exclusions
- Exact workbook `1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY` only; owner `dzuddiyn01@gmail.com`.
- `TEST_ONLY` BAJA and CENSUS only; `/delete` DEFERRED. Historical `TEST_ONLY_27_F` fixture must remain unmodified.
- `production_write:false`, `official_bse_write:false`, no Telegram send, no PILOT_OPERATION or BSE write.
- Gate 36O's `IDENTITIES_MATCH_NOT_AUTHORIZED` is **identity match only**, not transaction approval.
- No new Apps Script version, HEAD push, web-app deployment, OAuth expansion, real approval or transaction is granted by this LOCK.

## Build-and-proof sequence (future gates)
**36P-UI-BUILD (local/synthetic):** build HTMLService UI and private server handlers against synthetic fixtures only; challenge/replay/audit security tests. Confirm deployment-as-user compatibility and only expose necessary public endpoints. Fail closed if `Session` identity blank.

**36P-APPROVAL-AUTHORITY-REVIEW:** verify challenge entropy, independent audit anchor, owner/other-account negative tests, permissions, lock/concurrency and failure recovery. Preview owner UX with no real approval writes.

**36P-SCRIPT-HEAD-GATE (separate approval):** push reviewed READ-ONLY UI and diagnostics, independent pull/read-back. Subsequent web-app deployment and OAuth consent also require explicit scoped approval.

**36Q-WRITE-GATE (separate approval):** only after all preceding live authority acceptance and a concrete human-approved TEST_ONLY transaction; verify read-back, audit, nonce consumption and no production/official effects.

## Evidence and reference
Machine-readable lock: `authority_mode_36p.lock.json`. Earlier Node Ed25519 verifier stays unprovisioned. Independent owner Sheets READ confirmed AUTH/AUDIT header-only at lock time. Script HEAD and deployment are **NOT MODIFIED** in this gate.

Google documentation: https://developers.google.com/apps-script/reference/base/session (availability of active user email depends on execution context); https://developers.google.com/apps-script/guides/html/communication (HTMLService `google.script.run` invokes server functions asynchronously, private underscore-suffixed functions are inaccessible).

**Next real task:** `36P-UI-BUILD-SYNTHETIC`; continue automatically within development approval, stop at any separate Script HEAD/deployment/live-write gate.
