# GI-FIELD-UX-DELETE-PROVENANCE-11

Status: SYNTHETIC LOCAL PASS for pure comparison logic. Real authoritative provenance remains UNVERIFIED.

Source audit: InventoryReviewTest.js computes source_key as reference + domain, proposal payload hash via bseInventoryPayloadHash_, derives event ID from hash prefix and appends approved entries to inventory ledger. TelegramApprovalUiTest.js approval candidate identity additionally carries target and C1/C2 candidate ordinal; ledger does not. No independently immutable approval-candidate-to-ledger commit receipt was demonstrated in the inspected source.

DeleteProvenanceTest.js is a pure read-back predicate checker: it rejects absent, duplicate, mismatched or missing receipt/event/hash/approval evidence. The fixture sets authenticated_origin and readback_verified flags as assumptions. These are NOT authenticated cryptographic checks, and do not establish actual SoT authority. VERIFIED_PROVENANCE_ONLY is a synthetic evaluation outcome, not authorization for delete or mapping legacy data.

Observed legacy record BSE-TG-772257418 has approval C1 hash differing from inventory ledger hash; no proof maps C1 to the inventory ledger entry. Historic records remain UNVERIFIED. No new retroactive receipt generated.

Before real provenance can become VERIFIED: instrument canonical commit path to emit an immutable, authenticated receipt at commit time with exact candidate key, ledger key, both hashes and event_id; independently read it back and validate its origin; build lifecycle/revision guards, and secure journaled multi-sheet recovery. This requires separate scoped implementation/authorization.

No domain write, no Apps Script push, no merge/deploy or live delete.
