# GI-FIELD-UX-DELETE-RECOVERY-13

Status: SYNTHETIC LOCAL PASS. NOT integrated into canonical inventory writer or live Google Sheets.

DeleteRecoveryTest.js uses a dependency-injected store and writes a PREPARED journal before the first synthetic ledger write. It checks exact transaction/source keys, hashes and approval status, then performs write/read-back of ledger, receipt and intermediate journal states. Re-execution can resume when a matching journal already exists and each persisted record still matches the expected identity. It refuses a pre-existing ledger without a journal, and a conflicting journal/ledger/receipt.

Injected crash tests exercise failure immediately after journal, ledger and receipt writes, followed by restart/replay on the same in-memory store. They prove idempotent fixture recovery only, not a durable restart of Apps Script/Sheets. Approval fields are supplied by a fixture, not authenticated from live owner state. There is no independent external verifier, real lock, authenticated receipt, or actual cross-sheet atomic transaction.

The production deletion path remains disabled and unchanged. No data was written to PILOT Sheets, no Telegram calls and no clasp push, merge or deployment.

Before live use, perform an isolated write/readback in a separately authorized TEST_ONLY Sheets fixture, verify physical persistence and recovery after partial operations, bind a verified candidate-to-ledger receipt from the canonical commit path, and add lock and actor/callback checks.
