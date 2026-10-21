# GI-FIELD-UX-NONDELETE-E2E-20

Status: SYNTHETIC E2E LOCAL PASS; LIVE PROOF NOT RUN.

Fixture executes original bseInventoryParseMessage_, bseApprovalEnvelopes_ candidate split and bseInventoryReviewCore_ with injected in-memory sheet interface, no live Sheets or Telegram callbacks.

- Two fertilizer candidates -> separate approval envelopes -> original inventory writer -> two distinct ledger rows with product quantities.
- Idempotent retry of both envelopes creates no duplicate ledger rows.
- Hash conflict fails before second append.
- Interrupted sequence after first item leaves one row; retrying second envelope creates second without changing first.

Limits: Script callbacks and actual reporter identity authentication are not executed; each candidate approval is simulated with a synthetic authorized review context. The fixture injects hashing, review context validation and persistence stubs; it is not proof of Google Sheets durability or crash-safe journaled atomicity. Partial multi-item persistence may be observable before all approvals; no automatic rollback is claimed. Never label this as LIVE PASS.

No change to individual /delete (DEFERRED PR #155), no Apps Script push, Telegram transmission, PILOT workbook write, merge or deployment. PR #156 remains Draft.
