# GI-FIELD-UX-DELETE-SHEETS-ADAPTER-08

Status: SYNTHETIC SHEETS-SHAPED ADAPTER LOCAL PASS. No actual Google Sheets write, no production or PILOT domain mutation.

DeleteSheetsAdapterTest.js accepts injected sheet-like interfaces and lock, validates strict journal and binding headers, unique exact keys, expected hash/revision, lock acquisition, write-readback and fail-closed errors. The facade is not connected to boundTestBook_, callbacks, or operational delete code.

8 targeted tests include locked prepare, recreated adapter reading the same fixture rows, duplicate binding, missing ledger revision, schema drift, lock contention and simulated failed readback. All use in-memory sheet-shaped fixtures, not persistent Google Sheets.

DeletePersistenceTest.js was hardened to compare journal fields rather than serialization order and to return WRITE_OUTCOME_UNKNOWN on journal read-back exception.

Critical integration gaps:
- PILOT ledger currently may not contain explicit revision; adapter requires it and therefore intentionally rejects schema without revision.
- Binding rows are synthetic: no independently authoritative mapping table has been created or populated.
- Journal table is synthetic: no durable workbook tab has been provisioned.
- No Script LockService binding, actual crash recovery or multi-sheet atomicity proof.
- Existing live /delete remains unchanged and individual void is disabled.

No merge, clasp push or field test is authorized by this task.
