# GI-FIELD-UX-DELETE-ATOMIC-05 — Synthetic guard evidence

Status: LOCAL PASS for exact candidate selection and callback fail-closed guard; ATOMIC VOID NOT IMPLEMENTED.

Canonical base: dzuddiyn/PILOT_OPERATION, PR #155. PILOT_OPERATION only; official BSE write false.

## Verified facts
- PILOT approval identity may be BSE-TG-ID|Inventory_Event_Log|C1.
- Parent BSE-TG-ID can have several candidates with distinct decisions. Do not infer a target from first row.
- Inventory ledger source_key can instead be BSE-TG-ID|INVENTORY_OUT without |C1.
- Approval identity and ledger identity are not interchangeable.

## Implemented guard
- /delete BSE-TG-ID C1 [reason] resolves a unique eligible approval candidate in owner private chat.
- The exact selector is read-only; it does not create a pending confirmation or void records.
- Unconfirmed, ambiguous, unsupported and missing selections fail closed.
- Legacy confirmation callback checks exactly one approval row before legacy void path.

## Gate to real atomic, revision-safe void
1. Derive exact ledger key with verified candidate-to-ledger mapping, never prefix matching.
2. Verify exactly one ledger row with expected approved status/hash and revision.
3. Bind confirmation to exact ledger key, expected revision, owner, callback and message.
4. Acquire Script lock; reread all preconditions before write.
5. Because Google Sheets does not provide cross-sheet atomic transactions, journal PREPARED/APPLYING/COMMITTED/NEEDS_RECONCILIATION, read back each mutation, and reconcile partial writes deterministically.
6. Make repeat callback idempotent; avoid repeated mutation or receipts after uncertain outcome.
7. Demonstrate simulated crash recovery before any authorized real PILOT cancellation.

No live Telegram sends, no Apps Script HEAD push, no production deployment or PILOT domain write.
