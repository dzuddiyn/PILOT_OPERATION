# GI-FIELD-UX-NONDELETE-SHEETS-ADAPTER-26

State: SYNTHETIC SHEET-SHAPED LOCAL PASS ONLY. No real Google Sheets binding.

NondeleteSheetsAdapterTest.js provides an isolated dependency-injected TEST_ONLY adapter for existing CommitProvenanceTest.js and ReceiptReconcileTest.js. It uses dedicated four-tab header contracts: TEST_ONLY_NONDELETE_INTENT, TEST_ONLY_NONDELETE_LEDGER, TEST_ONLY_NONDELETE_EVIDENCE and TEST_ONLY_NONDELETE_RECEIPT. Exact headers are required and changed schemas rejected. Its lock boundary is explicitly injected and releases in finally. Normal new writes are append-only; journal has an allowed guarded PREPARED to COMMITTED status update. No direct SpreadsheetApp or LockService calls.

Eight targeted cases validate schema, journal/ledger/evidence through the original synthetic commit model, receipt read-back, lock unavailable, failure lock release, operational environment denial, crash after ledger append followed by exact reconciliation and no duplicate, and historical ledger rejection without an intent. The test uses in-memory sheet-shaped fixtures, not a real Google Sheet.

Safety limits:
- The environment and workbook identity is caller-supplied and not authenticated by any Apps Script runtime. Existing PILOT_OPERATION and PILOT_TEST must not be used.
- Injected lock serializes cooperating callers in the fixture only. It does not protect against external sheet edits or prove concurrency under Apps Script.
- Google Sheets cross-tab atomicity is absent; an uncertain write needs re-read and reconcile. No rollback is promised.
- Commit provenance, owner authorization and receipt dispatch remain synthetic. No actual Telegram callback, email, notification or real durable receipt is proven.
- Never connect this to the active Telegram callback or writer without a separate verified TEST_ONLY Script binding, owner approval and actual isolated workbook proof.
- PR #156 stays DRAFT, RELEASE HOLD. Individual delete remains DEFERRED in PR #155.

No Apps Script push, production/PILOT workbook write, Telegram send, merge or deployment.
