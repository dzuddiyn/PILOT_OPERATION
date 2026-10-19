# Gate I — Human-readable Evidence caption in /history (2026-10-19)

## Source and authorization
- Owner requested human-readable photo caption instead of technical `Tarikh kerja: 2026-10-19 | BSE-EV-126-AQADNxNr | FIELD_OPERATION | Evidence PHOTO`.
- Canonical PILOT_FILE_EVIDENCE row BSE-EV-126-AQADNxNr: PHOTO, caption "Pam rosak M2P2", received_at 2026-10-19T02:14:28.332Z, CONFIRMED, PRIVATE_SUBMISSION, reporter 913757987.
- Date is displayed as Tarikh diterima, not falsely asserted as farm work date. Caption surfaced only after existing /history visibility filter; new user 8858214393 has no access to PRIVATE_SUBMISSION.
- PR #96 merged to main 7205400fccb0dabf5296137d5c707d84a6094306: PILOT-only structured Evidence history rendering; TEST behavior unchanged. Existing owner dedup code and pending untracked evidence remain separate.

## Regression and runtime
- Targeted Evidence caption/privacy 5/5 PASS; history domain coverage 9/9 PASS; operational summary 7/7 PASS; full local *test.cjs run without FAILED marker; syntax and git diff --check PASS.
- Script HEAD isolated mirror push; independently pulled read-back canonical JS 64/64 MATCH and 9/9 runtime-only Gate F helpers preserved. No Apps Script version/deployment update.
- Genuine Telegram Desktop owner (user-confirmed) sent /history 19/10 at 21:36 MYT. Bot replied at 21:37 MYT:
  Sejarah operasi - 2026-10-19
  Gambar laporan operasi
  Keterangan: Pam rosak M2P2
  Tarikh diterima: 2026-10-19
  Status: Disahkan
  Rujukan: BSE-EV-126-AQADNxNr
- Independent PILOT_TELEGRAM_HISTORY_AUDIT event 2026-10-19T13:37:44.844Z: owner 913757987, period 2026-10-19, SENT, OWNER_ACTIVE, matched 1, displayed 1.
- No evidence media re-send, no official BSE write, no change to visibility or farm source data. Scoped caption UX LIVE PASS; full PILOT_TEST functional parity NOT DELIVERED.
