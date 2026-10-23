# BSE-RACUN-WRITER-02O — Evidence 2026-10-23

## Scope and authority
- Canonical GitHub: `dzuddiyn/PILOT_OPERATION`, feature branch `fix/racun-contract-20261023`, PR #184 DRAFT.
- Production and official BSE writes: strictly **false**.
- No replay of original live Telegram report `BSE-TG-772257756`; it remains untouched.
- Never treat a source-code change, a test fixture or a connector write as deployed Apps Script behavior.

## Real isolated Google Sheets connector proof
- Account: authorized BSE owner (`dzuddiyn01@gmail.com`).
- Separate disposable workbook: [TEST_ONLY_BSE_RACUN_02O_20261023](https://docs.google.com/spreadsheets/d/1v5DAWbkaNffrTZFI-E0gPbdz-CiMmt22KfJO483GaXw/edit).
- Different spreadsheet ID from the operational PILOT workbook.
- Tabs with exact adapter header schemas:
  - `PILOT_RACUN_TX_JOURNAL`
  - `PILOT_RACUN_TX_ROWS`
- All records are synthetic with reference `BSE-TG-9999999902`, materials marked `TEST_ONLY_MATERIAL`.
- Direct Sheets connector write: journal PREPARED, first 5 rows, independent read-back showed 5/10 and 5 unique keys.
- Recovery write: appended remaining five records only. Independent read-back verified all 10 unique source keys, record JSON parity and exact ordered fingerprint equal to journal fingerprint before committing.
- Final write: journal COMMITTED. Final fresh range reads verified journal COMMITTED, 10 rows, 10 unique keys, payload-key parity, fingerprint parity. **CONNECTOR_STORAGE_LIVE_PROOF_PASS**.
- This is a **real Google Sheets connector storage proof only**; it is *not* native Apps Script adapter execution, a Telegram callback or an operational PILOT write.

## Local callback integration
- Parser handles 10 independently numbered sections with optional crop/unit and scoped M7 -> M7P3; no invented batch or allocation IDs.
- `bseTreatmentFinalizeResult_` separates source completeness from storage readiness. Produces actionable PASS only if callback methods and physical ledger/approval tab schemas are present on the bound PILOT book.
- `bseApprovalEnvelopes_` requires durable readiness: never silently creates ten separately actionable cards for one Racun aggregate.
- `bseApprovalDomain_` recognizes atomic Racun envelopes solely as a card target; ordinary direct domain write remains blocked.
- Effective `bseTelegramReporterConfirmationCore_` routes the authenticated aggregate callback to `bsePilotRacunTelegramAggregateCore_` after source/hash verification. Existing non-aggregate handling remains.
- `bseReviewWithLock_` marks internal ownership only after a real ScriptLock acquisition; a journal adapter cannot reacquire a nested lock.
- Confirmation flow: journal PREPARED -> append/read-back all rows -> COMMITTED/read-back -> approval state -> audit/read-back -> card summary. Retry can reconcile a committed ledger with incomplete callback audit without duplicating rows. An explicit PILOT_RACUN_ATOMIC marker prevents ordinary Treatment callbacks entering the retry path.
- Dedicated review card shows group plots, optional crop and each chemical/quantity and warns that records are PILOT unlinked, not official BSE data.
- Local synthetic tests exercised injected after-append-5 failure and recovery, duplicate protection, authorization failure, hash and lock checks, summary formatting and fail-closed oversized Telegram card.
- Full Node suite: **182/182 PASS (LOCAL / SYNTHETIC)**.

## Unverified gates
- Canonical PR #184 remains DRAFT; no merge authorization granted.
- No Apps Script HEAD update, version, deployment, native regression, live Telegram approval or runtime binding change in this task.
- The real operational PILOT workbook was **not** provisioned with new Racun ledger tabs by this task, and no operational Racun rows were written.
- Native `SpreadsheetApp` + `LockService` integration and actual Telegram card/callback remain **UNVERIFIED** until authorized merge/deployment and isolated controlled live proof.
- Review source architecture and physical binding before promoting to LIVE PASS.
