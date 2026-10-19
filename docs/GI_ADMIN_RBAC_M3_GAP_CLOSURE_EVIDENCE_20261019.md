# GI-ADMIN-RBAC-M3-ACCEPTANCE-GAP-CLOSURE-01 — recovery progress

**PARTIAL PASS — BLOCKED FROM ACCEPTANCE.** Work remains source-only in Draft PR #106.

- Fixed committed REVOKE retry: validate the committed ledger separately from an intentionally active deny-only barrier before closing that barrier. Prior version returned UNVERIFIED and could not reconcile a committed revoke after barrier-close failure.
- Added regression test: grant -> revoke commits -> barrier close throws -> WRITE_OUTCOME_UNKNOWN, deny remains active -> restore adapter -> retry same operation returns ALREADY_APPLIED; no second ledger event.
- Targeted M3 candidate tests **9/9 LOCAL PASS**; direct transaction fixture suite **29/29 current assertions LOCAL PASS**.
- F13 and F14 remain proxy tests, without real audit and notification failure injection.
- F26 remains sequential intermediate state, not two concurrent executions.
- F18/F28 remain weak for cache/projection staleness.
- Physical process restart, concurrent readers/writers, true Sheets partial-write semantics and durable revoke barrier remain **UNVERIFIED**.
- No Apps Script runtime binding, Sheet writes, grant/revoke live, role change, Telegram operation or deployment.

**HARD GATE:** 29/29 as currently asserted does NOT equal mandatory F01-F29 acceptance coverage. Do not merge PR #106 or activate RBAC until independent, adversarial and integration verification is complete.
