# GI-FIELD-UX-DELETE-DESIGN-LOCK-15A

**Decision state: DESIGN LOCKED (owner authorization in chat 2026-10-21).**
**Implementation state: NOT STARTED for runtime integration; DRAFT PR #155 remains unmerged.**
Scope: PILOT_OPERATION shadow pilot only. Never official BSE production data.

## Locked authority contract
- Operational inventory records: PILOT_INVENTORY_EVENT, not a derived cache.
- Reporter/candidate decisions: PILOT_TELEGRAM_APPROVAL_UI.
- New prospective exact candidate-to-ledger relationship: separately authenticated, immutable commit receipt generated at the *actual commit time* and independently verified.
- Transaction state: separate journal, with durable PREPARED and verified state transitions.
- Telegram callback and queue: transport/operational state only, never the authority for record identity.
- GitHub: canonical source for code/design; no migration of operational history to GitHub.

## Four locked design decisions
D15A-01. Do not automatically modify existing inventory ledger schema or backfill historical evidence. Use sidecar expected fingerprint/revision tracking with an explicit design for external edit/drift detection. If an immutable exact mapping cannot be proved, status is UNVERIFIED and void is forbidden.

D15A-02. Inventory commit and individual delete are distinct journaled transactions. Both require authenticated identity, human confirmation at appropriate stages, independent read-back, exact candidate/ledger key binding and idempotency. A synthetic pass does not authorize a real write.

D15A-03. Google Sheets has no multi-tab atomic rollback. Never perform blind compensating writes. Partial/unknown outcome is NEEDS_RECONCILIATION; block duplicate actions and independently inspect actual data before controlled recovery.

D15A-04. The legacy prefix/reference-based delete path must be disabled before any new individual void is activated. Never allow concurrent legacy and new destructive paths. No real delete is authorized by this lock.

## Minimum acceptance matrix for integration

| Gate | Required evidence | Current status |
| --- | --- | --- |
| A — Identity | one exact approval candidate to one exact ledger record; independent mapping receipt | PENDING |
| B — Commit provenance | authenticated receipt at actual commit with both hashes/event ID; independent readback | PENDING |
| C — Concurrency | LockService, expected fingerprint/revision, status recheck under lock | PENDING |
| D — Journal | persisted PREPARED before operation; verified readback of state changes | PENDING |
| E — Recovery | synthetic crash points plus isolated real durable restart/readback without duplicate | LOCAL SYNTHETIC ONLY |
| F — Void safety | owner + callback/message binding + status/fingerprint guards; legacy route disabled | PENDING |
| G — Proof | isolated TEST_ONLY Google Sheets end-to-end proof, journal fault injection, reconciled state | NOT RUN |
| H — Release | full regression, safety review, explicit owner merge/deploy authorization, independent live verification | NOT RUN |

## Implementation boundaries and gates
- Existing PR #155 tests/models are synthetic fixtures and are not currently wired to runtime.
- Current PILOT ledger has no demonstrated revision column; existing approval hash and inventory ledger hash can differ. Do not equate them.
- Historical reference BSE-TG-772257418 remains UNVERIFIED without original cryptographically/authentically grounded mapping.
- First subsequent implementation must be isolated TEST_ONLY development with no real PILOT operational write, production write or destructive action; plan specific runtime integration and verify authority/schemas first.
- No merge, Apps Script push, deployment, Sheets write, Telegram send, or individual delete activation is authorized by this document.

## Evidence
Inspected repo AGENTS.md, architecture/execution path, inventory writer source and Telegram confirmation/delete source. Prior synthetic tests 163/163 and JS syntax 77/77 passed on PR #155 at f723f4a26be6787e1a99f64055488439382fa8b7 (prior task). This design-only step adds no runtime behavior.
