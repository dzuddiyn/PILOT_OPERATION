# Gate I — Verified Transplant Operation History and Readable Summary: Live Fix (2026-10-19)

## Reported defect
- Registered active Telegram user diyn660011 requested /history 2026-10-14 at 19:59 MYT; bot incorrectly responded "Tiada rekod operasi dalam tempoh ini".
- Independent owner-linked PILOT Sheet read proved PILOT_TRANSPLANT_EVENT includes event BSE-SB-TR-20261014-001, work_date 2026-10-14, Peria Besar (Hup Nong), M2P1/M2P2, COMPLETED, VERIFIED_TEST.
- Root cause: historic /history event reader used approved message/queue and reporter-based visibility; already confirmed operational Transplant ledger was not included as shared operational history for active users. Audit SENT 0/0 was transport success, NOT semantic pass.
- /summary plot M2P1,M2P2 previously showed batch IDs and machine-like pipe-delimited text; user rejected that presentation.

## Controlled fix
- PR #85 to dzuddiyn/PILOT_OPERATION main, merge 55c136f3f0b8b32fdc6853732b82f96b840c2e90.
- PILOT-only history additionally reads verified, completed Transplant events from the operational ledger; event date is work date, not approval timestamp.
- Exposes only crop, variety, plot IDs, work date, status and record reference. Original report/private notes and private Evidence are not disclosed. Legacy TEST history remains unchanged.
- PILOT /summary now uses human-readable sections per plot, e.g. "Plot M2P1", "Tanaman: Peria Besar", "Status: Aktif", "Banci terakhir: Belum direkodkan", "Rawatan terakhir: Belum direkodkan", without machine pipes or TEST labels.
- Focused regression 7/7 PASS; historic work-date regression 16/16 PASS; full local *test.cjs invoked without FAILED marker. Node syntax and diff check PASS.
- Apps Script Script HEAD sync via isolated mirror performed. Independent clasp pull 64/64 canonical JS MATCH; all nine noncanonical Gate F runtime helpers preserved. No version/deployment update or official BSE write.

## Live proof — actual Telegram registered user account via UIA
- 20:10 MYT reran /history 2026-10-14 from registered diyn660011 to Bot OpsMate PoC. Telegram UI returned one Pindah tanam event: Peria Besar, Hup Nong, M2P1 and M2P2, work_date 2026-10-14, Disahkan, record BSE-SB-TR-20261014-001.
- Independent PILOT_TELEGRAM_HISTORY_AUDIT read-back: previous 2026-10-19T11:59:27.813Z SENT / REGISTERED_ACTIVE / 0 matched / 0 displayed; new 2026-10-19T12:10:30.435Z SENT / REGISTERED_ACTIVE / 1 matched / 1 displayed.
- 20:11 MYT reran /summary plot M2P1,M2P2 using same UIA account. Telegram UI returned readable separated sections for both plots and no batch-ID/pipe-format. Independent PILOT_TELEGRAM_PLOT_STATUS_AUDIT read-back: 2026-10-19T12:11:35.650Z user 8858214393 SENT / SUMMARY_UNIQUE_UNIQUE (earlier pre-fix read-back 12:00:32.331Z same outcome, but UI presentation machine-like).
- No original private photo transmitted; existing negative Evidence retrieval protection remains in place.
- Scoped defect LIVE PASS. Full operational-history domain coverage, owner duplicate-event handling, full PILOT_TEST parity and handover remain IN PROGRESS — NOT DELIVERED.
