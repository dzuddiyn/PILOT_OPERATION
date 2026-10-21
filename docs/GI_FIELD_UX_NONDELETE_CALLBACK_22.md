# GI-FIELD-UX-NONDELETE-CALLBACK-22

State: SYNTHETIC CALLBACK LOCAL PASS; RELEASE HOLD pending independent runtime proof.

Harness executes actual bseTelegramReporterConfirmationCore_ and candidate envelope source from TelegramApprovalUiTest.js, with actual bseInventoryReviewCore_ inventory writer from InventoryReviewTest.js. Node VM uses isolated in-memory sheets, injected stable hashes and safe IO stubs; no real Google Sheets or Telegram API.

Six targeted cases:
1. Two candidate callbacks create two unique in-memory ledger rows and each approval becomes REPORTER_CONFIRMED.
2. Reporter or chat mismatch rejected with no ledger write.
3. Duplicate callbacks do not append rows.
4. After C1, C2 remains OPEN; subsequent C2 completes, C1 replay stays duplicate.
5. Approval hash mismatch fails before ledger write.
6. Injected failure after ledger write and status update, before receipt summary, leaves exactly one ledger row and REPORTER_CONFIRMED; retry treats callback as duplicate. This exposes an unresolved receipt/notification reconciliation boundary.

No real cryptographically authenticated callback, Google Sheets, LockService, genuine Apps Script deployment or live message. Several dependent IO, hashes, summary and context functions were stubbed. Not LIVE PASS. Status for multi-item release remains DRAFT / UNVERIFIED.

Delete remains DEFERRED under PR #155. No merge, clasp push, PILOT data write, Telegram message or official BSE write.
