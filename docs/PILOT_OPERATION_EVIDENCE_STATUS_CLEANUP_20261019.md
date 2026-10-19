# PILOT_OPERATION Evidence Naming & Confirmation Status — 2026-10-19

## Owner correction / current truth
- Owner rejects TEST branding for PILOT_OPERATION, including root folder and confirmed operational Evidence status.
- Canonical root renamed in place (same ID) from `BSE_OpsMate_SB_PILOT_OPERATION_Evidence` to `BSE_OpsMate_SB_PILOT_OPERATION`; Drive metadata READ BACK verified.
- Real Evidence `BSE-EV-126-AQADNxNr` was submitted with caption `Pam rosak M2P2`, Telegram original source preserved. Confirmed image Drive file `1sxjzn4_CU8G93VAZ942RQvwl6a7QIsPV` belongs to nested `01_Source_Evidence/Evidence_Files`; name/MIME/file ID read back. Category corrected to `FIELD_OPERATION`, owner-approved no deletion.
- Existing Sheet status observed `CONFIRMED_TEST` before migration. Do not change Sheets status until canonical source and Script HEAD are aligned to recognize new value. Intended PILOT status: `CONFIRMED` with backward-compatible read of previous `CONFIRMED_TEST`.
- TEST and PILOT_TEST keep their historical internal data contracts; do not mechanically strip technical identifiers or erase historical evidence/TEST_ONLY source annotations.
- Human-facing PILOT message uses neutral labels, e.g. `Lampiran`, `Status: Disahkan`. Residual TEST branding outside Evidence workflow requires separate audited follow-up, not silent global replacement.

## Safety contract
- `bseRuntimeEvidenceConfirmedStatus_`: emits `CONFIRMED` only for PILOT_OPERATION, `CONFIRMED_TEST` for legacy TEST/PILOT_TEST.
- `bseRuntimeEvidenceIsConfirmed_`: accepts new or legacy confirmed Evidence in PILOT_OPERATION only; excludes unapproved, pending and discarded; legacy environments remain separate.
- Evidence callback, Image Processing approval, OCR retrieval, Evidence retrieval/history, Gate H and domain linking use compatibility-aware check or environment-aware confirmed writes. PILOT Evidence writer allows both confirmed states for reconciliation.
- These changes are PILOT Evidence-only; they do not imply all business modules have been renamed or that all functional parity is complete.

## Post-merge live verification (2026-10-19)
- GitHub PR #69 MERGED; canonical main `dec3bed839623e2c20be50389fd98d8659b2fbf3`, local main fast-forwarded.
- Fresh independent clasp pull: 64/64 canonical JavaScript files matched Script HEAD exactly; 9 existing runtime helpers retained. Apps Script `runBseI011FullRegression`: 47/47 PASS, zero failed, `production_write:false` at 10:43 MYT.
- Guarded single-cell update: `PILOT_FILE_EVIDENCE!Q2` changed from `CONFIRMED_TEST` to `CONFIRMED` after verifying Evidence ID, caption, category and Drive ID. Independent Sheets read-back confirmed `BSE-EV-126-AQADNxNr`, caption `Pam rosak M2P2`, category `FIELD_OPERATION`, status `CONFIRMED`, visibility `PRIVATE_SUBMISSION`, and original Drive file ID. No image deleted/moved and no duplicate record created.
- Remaining broad TEST-name cleanup is **NOT COMPLETE** across unrelated technical/operational modules; do not rewrite historical raw webhook/callback payloads or past TEST_ONLY annotations.

## Verification and tracking
- One real photo submission and reporter confirmation have happened (the owner's actual report, not synthetic test-only data). File and row lineage confirmed independently. Evidence remains operational: **do not delete**.
- Previous planned 'delete sample image' step is CANCELLED/NOT APPLICABLE because the accepted image is a real operational report.
- Live status mutation must be exact row/cell with precondition and readback; no other records or thumbnails touched.
- Field proof supports media ingest/storage and reported confirmation. It does not automatically prove negative-user access, OCR provider or all Telegram commands.
- Full PILOT_TEST functional parity: **IN PROGRESS — NOT DELIVERED**.
