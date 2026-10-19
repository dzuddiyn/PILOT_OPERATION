# Evidence Writer Safety Fix — 2026-10-19

## Scope
PILOT_OPERATION only. Owner requested new media files stored under existing `01_Source_Evidence/Evidence_Files` instead of root, with idempotency and reconciliation. Existing root ID remains locked source authority, TEST/PILOT_TEST writer behavior unchanged. No live photos or operational records used during tests.

## Implementation
- `PilotEvidenceSafeStore.js` resolves existing nested folders by exact unique names from locked PILOT Evidence root; no folder creation, no root fallback, ambiguous/missing folder fail-closed.
- `TelegramEvidenceTest.js` routes PILOT writes to common new writer, used by both Evidence and Image Processing. Retains original behavior outside PILOT_OPERATION.
- Writer validates canonical Evidence row, Telegram file identity, state, MIME and size; deterministic Drive filename contains Evidence ID plus Telegram unique ID.
- Explicit state transition `OPEN -> DRIVE_CREATE_PENDING` with Sheets flush + read-back **before** any Drive create.
- If Drive file exists exactly once, reconcile/persist its file ID and read back; if multiple/metadata mismatch, fail closed.
- If marker is pending and no Drive file is found, return `EVIDENCE_WRITE_OUTCOME_UNKNOWN_NO_RETRY`: eventual consistency uncertainty is NOT interpreted as permission to create again.
- Re-entry to Evidence callback with pending marker is limited to action A (reconcile); correction/discard blocked while create outcome uncertain. Confirmed writes retain existing callback finalization/notice contract.
- Two inherited tests updated to respect legacy PILOT_TEST semantics and new PILOT safety gate.

## Tests
- 10/10 new fault-injection checks PASS (nested path, single create, repeat idempotency, create ACK lost recovery, Sheet file-ID persistence lost recovery, unknown pending with no file, duplicate matches, mismatches, invalid state, wrong environment, missing folder).
- Complete Node regression 27/27 suites PASS, JS syntax PASS, git diff check PASS.
- No real Telegram send, Drive create, photo upload, OCR, or PILOT Sheets domain write occurred during tests.

## Acceptance boundaries
Local PASS only until independent source/read-back, Apps Script HEAD sync, runtime regression and read-only folder verification. Cannot claim live media/farm field PASS. Manual reconciliation needed when Drive create uncertain and file not discoverable. Do not re-arm/create blindly; full functional parity and BSE handover remain IN PROGRESS.
