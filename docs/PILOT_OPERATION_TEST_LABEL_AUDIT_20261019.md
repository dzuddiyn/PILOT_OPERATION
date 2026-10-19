# PILOT_OPERATION — TEST Label Audit & Cleanup (2026-10-19)

## Owner directive
PILOT_OPERATION is a real shadow-operational pilot, not a TEST project. Do not present `TEST`, `PILOT TEST`, `CONFIRMED_TEST` or `UNCLASSIFIED_TEST` as ordinary PILOT user-facing business labels. Full PILOT_TEST functional parity remains **IN PROGRESS — NOT DELIVERED**.

## Audited surfaces and boundaries
- **User-facing Telegram transport, safe to normalize in PILOT only:** `EnvironmentTest.js` `bseRuntimeTelegramPayload_` and `bseRuntimePilotUiLabels_`, applied to outgoing send/edit text and media captions. Existing mappings already cover Evidence cards, plain-language category, confirmation status, histories, allocation, receipt and approval. This change adds anchored handling for `[PILOT TEST]` headings (plain and HTML), OCR TEST/result headings, Evidence TEST headings, and inherited history eligibility notice.
- **Runtime/internal contracts, NOT safe to globally rename:** file/function identifiers such as `TelegramEvidenceTest.js`, `TEST_FILE_EVIDENCE` legacy sheet lookup routed by `bseRuntimeSheetName_`, system test harnesses, callback JSON, existing Script Properties, and historic status constants in non-Evidence modules. Changing these needs their own authority/lineage and regression review. Literal internal string TEST does not inherently indicate synthetic operational data.
- **Historical records, not to mutate:** original Telegram captions, reporter messages, callback payloads, `TEST_ONLY` audit markers, provenance and prior TEST/PILOT_TEST data. No bulk find-replace across Sheet/Drive or GitHub performed.
- **Real Evidence proof:** owner-sent `BSE-EV-126-AQADNxNr` `Pam rosak M2P2` is `FIELD_OPERATION`, `CONFIRMED` (prior PR #69 migration), in correct `01_Source_Evidence/Evidence_Files` with same Drive file. Do not delete/relabel source content. Root folder already renamed to `BSE_OpsMate_SB_PILOT_OPERATION`.

## This change, evidence and limits
`pilot_test_label_audit.test.cjs`: 8/8 PASS (plain/HTML headings, OCR, Evidence, access notice; TEST_ONLY source notes untouched; TEST/PILOT_TEST isolation). Full Node suite 30/30 PASS and syntax/diff check PASS. No Telegram messages, Apps Script business writes, Drive moves, or farm records created.

These are **selective** PILOT outgoing-label corrections. It would be inaccurate to claim every TEST occurrence in all runtime modules is now gone: many serve internal or historical contracts. Remaining user-visible strings require ongoing case-by-case proof, not wholesale replacement. Live outbound rendering and app routing after Script HEAD sync must be checked independently. Full parity **IN PROGRESS — NOT DELIVERED**.
