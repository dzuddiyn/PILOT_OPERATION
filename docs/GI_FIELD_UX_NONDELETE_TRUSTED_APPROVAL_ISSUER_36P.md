# GI-FIELD-UX-NONDELETE — 36P Trusted Approval Issuer

Date: 2026-10-21. Gate verdict: **LOCAL CRYPTOGRAPHIC VERIFICATION PASS / REAL ISSUER NOT PROVISIONED / LIVE-WRITE HOLD**.

## Authority reconciliation
- Canonical source: `dzuddiyn/PILOT_OPERATION` feature branch / draft PR #156; GitHub governs code, not human transactional approval.
- Gate 36O confirmed real Apps Script Session effective/active owner identity match (runtime output `IDENTITIES_MATCH_NOT_AUTHORIZED`). This DOES NOT prove an explicit consent for a particular inventory transaction.
- TEST_ONLY workbook: `1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY`; current APPROVAL_AUTH and APPROVAL_AUDIT each contain header only. Historical partial ledger fixture `TEST_ONLY_27_F` is unchanged.
- Protected Google Sheets tabs prevent a non-owner editor in an isolated proof workbook, but cannot provide immutable owner-proof authority or prevent a workbook owner modifying approvals.

## What was implemented
`NondeleteSignedConsent36P.cjs` is an isolated Node.js-side cryptographic verifier and READ-ONLY issuer preview. It does not run in Apps Script, has no Google Sheets credentials, and exposes no writer.
- Requires **separate Ed25519 owner-signed consent** for the exact TEST_ONLY operation (BAJA or CENSUS), workbook, event, actor, approval/ledger source keys and exact SHA-256 hashes. Any payload change invalidates the signature.
- Owner key identity is pinned to a public-key SHA-256 SPKI fingerprint. Configured runtime path obtains ONLY externally provisioned public key, key fingerprint and key ID from server-side environment. A caller cannot pass a trust key through the API. **No private key is created, embedded, persisted or committed.** Tests generate ephemeral fixtures in memory only.
- Nonce shape restricted; issue/expiry UTC epochs, maximum validity one hour. Rejects wrong environment, operation DELETE, wrong workbook, invalid actor, unknown fields, missing trust root, invalid signature, expired/future approval, switched public key and caller-set `owner_authorized`.
- An authenticated signature only yields `SIGNED_CONSENT_VERIFIED` with `approval_issued:false`, `write_allowed:false`. When a verified empty snapshot is supplied, the system can build deterministic PENDING approval/audit **preview records only**. It rejects a nonempty journal until independent external anchoring and full audit verification are implemented; torn parity is denied.
- Neither a valid signature nor a plausible snapshot can promote status to APPROVED or CONSUMED. Actual cryptographic owner consent and trusted write/consume lifecycle are not installed.

## Test evidence
- Real Node Ed25519 signing/verification with synthetic ephemeral key: targeted 17/17 PASS.
- Full repo Node regression 228/228 PASS; syntax PASS.
- Fresh owner-connected Google Sheets read-back: APPROVAL_AUTH 1 row (header only), APPROVAL_AUDIT 1 row (header only), transaction ledger 2 rows including historical `TEST_ONLY_27_F`. No Sheet write, Script HEAD change, OAuth change, Apps Script version, deployment update, Telegram or PR merge during Gate 36P.
- Diff check and secret scan required before commit/push.

## Critical blockers before 36P LIVE PASS
1. **Trust-anchor architecture decision and owner consent channel**: the cryptographic approach is a candidate, not a locked requirement. Secure public-key enrollment with independently verified fingerprint plus a user-friendly authenticated consent/signing action is absent. A regular Google Session identity match cannot substitute for an explicit signed action.
2. **Trusted runtime integration**: Node verifier is not Apps Script-compatible as-is. Need a bound service/bridge, or owner-approved alternative secure consent UI, before relying on it in a real Script consumer. No Script HEAD push is approved for 36P.
3. **Authority persistence and independently anchored audit**: user-editable Sheet is not immutable; need independently verifiable audit anchor, real single lock, idempotent writes, crash reconciliation and READ-BACK before any approval issuance or transaction.
4. **Per-transaction owner approval**: no concrete transaction consent was requested or provided; existing broad execution permission is not specific approval to issue a transaction.

## NEXT gate
**36P-TRUST-ANCHOR-DECISION (owner)**: approve/reject separate signed owner consent as the trusted authority mechanism, or authorize design of an authenticated Google-based consent UI instead. Until the architecture is chosen, keep issuer NOT INSTALLED and 36Q transaction write HOLD. Any live TEST_ONLY write remains a separate explicit approval.
