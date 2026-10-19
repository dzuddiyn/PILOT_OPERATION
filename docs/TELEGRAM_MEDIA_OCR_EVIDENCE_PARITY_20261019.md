# Telegram Media, OCR & Evidence Parity Regression — 2026-10-19

**State: LOCAL PASS only; LIVE and field proof UNVERIFIED.** User requested synthetic-only regression with no real farm data, media uploads, Telegram sends, callbacks, or Google Sheets/Drive mutations.

## Tests and findings
`telegram_media_ocr_evidence_parity.test.cjs` executes 15 checks using actual PILOT inherited JavaScript functions and static guard assertions. Photo selects highest resolution and stable `file_unique_id`; document and video preserve type/MIME/file identity; unknown content rejected. Caption categorization separates inventory/claim, admin, field and unclassified. Private submission always remains PRIVATE_SUBMISSION; restricted group categories stay RESTRICTED. Explicit `/image_to_text` and `/image_analysis` are recognized and instruction bounded to 2000 characters. `/ocr` parse and confirmation/discard routes recognize evidence ID without doing OCR. Image action and Evidence callback reject unknown actions. Provider failures redact raw/secret errors. Model classification is only a suggested record type, never a confirmed activity.

Source-level fail-closed guards checked: invalid file IDs or negative/over-20MB sizes blocked; ingress dedup key `chat_id|message_id|file_unique_id`; private receive requires active registration/owner; actual Drive create behind authorized original reporter and OPEN review card, and PILOT cannot auto-create unbound Evidence folder.

**Targeted 15/15 PASS; full Node regression 25/25 suites PASS; syntax / diff checks PASS.** No live Sheets rows, Drive objects, Telegram messages, real image processing, OCR execution or domain events touched.

## Remaining acceptance
- Actual media bytes/download and Drive create/read-back with correct lineage and access permissions, only after isolated authorized pilot sample.
- End-to-end callback duplicate handling and partial-write reconciliation for evidence storage.
- Real OCR provider execution, safe prompting, prompt injection/failure handling and reporter approval.
- Ordinary-user negative evidence visibility and photo UX on Telegram client.
- Confirm evidence IDs and retrieval remain valid for existing files; do not move root image until source references are independently reconciled.

PILOT_OPERATION full parity **IN PROGRESS**, corporate BSE **NOT DELIVERED**, `production_write:false`, `official_bse_write:false`.
