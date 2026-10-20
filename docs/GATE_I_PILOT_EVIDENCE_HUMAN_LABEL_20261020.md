# Gate I — PILOT Evidence human labels (2026-10-20)

## Trigger and runtime read-back
Owner screenshot showed `Semakan lampiran ... — CONFIRMED_TEST` after confirming an Evidence image in PILOT_OPERATION. Independent Sheets READ of `PILOT_FILE_EVIDENCE` confirmed the same Evidence row had persisted status `CONFIRMED`, valid Drive file ID, category `UNCLASSIFIED_TEST`, and `RESTRICTED` visibility. This is a presentation mismatch, not proof of a failed Evidence save.

Canonical GitHub main at inspection: `751113188d27d14327a70da94ee9f6010e9e188e`; environment `PILOT_OPERATION`. Owner registry read-back showed only one active owner and Telegram registration registry contains no verified mapping for the two proposed new owner contacts. No owner mutations performed.

## Exact source change
- `TelegramEvidenceTest.js` formats Evidence card, confirmation edit, reporter receipt, owner notice and group notification using human-readable PILOT labels only.
- `CONFIRMED_TEST` is displayed as `DISAHKAN` when environment = `PILOT_OPERATION`.
- `UNCLASSIFIED_TEST` is displayed as `Belum dikelaskan` only in user-facing PILOT Evidence messages; internal category and restricted visibility are unchanged.
- The `TEST` and `PILOT_TEST` original output remains unchanged.
- Persisted `CONFIRMED`, Evidence Drive write-once, category, callback, approval and permission gates remain unchanged.

## Verification
- Local environment-specific messaging test: PILOT_OPERATION, TEST and PILOT_TEST PASS.
- Existing PILOT Evidence status contract: 7/7 PASS.
- Existing Evidence pump category UX regression: 6/6 PASS.
- All local `*.test.cjs`: **71/71 suite files PASS**.
- Node syntax: PASS; `git diff --check`: PASS; changed-source accidental secret scan: 0 matches.
- Status: LOCAL PASS only; no Apps Script HEAD sync, version, deployment or Telegram post-fix live proof.

## Owner onboarding gate
Owner Registry uses numeric Telegram user ID and PM chat ID, not phone numbers. Existing RBAC architecture contains a privileged bootstrap-owner boundary. Adding new active owner rows from unverified phone numbers would risk granting authority to the wrong account. Await both applicants' `/start BSE_PILOT` PM registration/identity read-back and explicit role onboarding review before any owner registry write. Do not store contact phone numbers in code, repo or evidence.
