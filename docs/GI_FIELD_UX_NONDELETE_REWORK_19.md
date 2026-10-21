# GI-FIELD-UX-NONDELETE-REWORK-19

Status: LOCAL PASS (identity/dedup guards), END-TO-END TWO-LEDGER-WRITES UNVERIFIED. PR #156 must remain DRAFT.

Root cause demonstrated by independent review #18: both candidate items in one Baja In report generated reference|INVENTORY_IN, causing a source key conflict on different payload hashes. The fix scopes a deterministic source key only to the PILOT_OPERATION multi-item fertilizer parser: reference|INVENTORY_IN|ITEM_F and reference|INVENTORY_IN|ITEM_N, derived from an explicit allowlisted product name. Legacy single-item source_key stays reference|domain. Unknown marked product is rejected. No ordinal or input order is used.

The same keyed helper is used by inventory validation proposal selection and inventory writer fallback. Synthetic targeted tests cover two unique keys, stable replay and independent idempotency/conflict check, legacy single-item compatibility, unknown product rejection and order invariance. Other parser/UX/census regressions remain in scope.

CRITICAL: this task does not prove that Telegram approval dispatch invokes the inventory writer for both candidates or that two records are appended. Requires a separate end-to-end multi-candidate approval and isolated writer harness before runtime merge/push; do not claim two ledger rows persisted.

No delete implementation or /delete changes, no live Google Sheet writes, Telegram calls, Apps Script push, merge or deployment. Delete scope remains DEFERRED in PR #155.
