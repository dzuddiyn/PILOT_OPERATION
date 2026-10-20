# Gate I — Harvest start aliases and compact plot pairs

Current checkpoint 2026-10-20: **SOURCE MERGED / SCRIPT HEAD 76/76 VERIFIED / REAL APPS SCRIPT RUNTIME 47/47 PASS**. New post-fix Telegram field UX **NOT_RUN**.

## Post-merge proof — independently verified
- PR #138 MERGED to `main` `eb9381d9e8515d9f5c3407cfdc80c5ffa5d23ca1`.
- Existing PILOT_OPERATION Script binding and manifest remained unchanged. Runtime preserved nine Gate F-only helper files. Staged code diff vs last Script HEAD was limited to `TelegramWorkerTest.js` and `OperationDecisionReviewTest.js`.
- Authorized `clasp push --force` completed at 17:53:45 MYT, exit 0. Fresh `clasp pull` independently verified **76/76 source files exact**, without filename/content mismatch.
- Refreshed Chrome PILOT_OPERATION Apps Script Editor; UI Automation invoked `runBseI011FullRegression` exactly once. Real log `started_at=2026-10-20T10:03:20.501Z`, `finished_at=2026-10-20T10:03:25.933Z`, `total=47`, `passed=47`, `failed=0`, `production_write=false`; execution completed.
- Independent Apps Script **Executions** UI displays the same function at **18:03:16 MYT**, duration **9.672 seconds**, status **Selesai**.
- Existing genuine report `772257287` remains owner-controlled; this fix never replays, approves, discards or rewrites the old Telegram report. New card-only field UX and physical harvest are **NOT VERIFIED**.
- No deployment/version update, Telegram send/callback, or official BSE write.

## Historical pre-merge checkpoint

Actual Telegram BSE-TG-772257287 text: "mula Harverst / M3P1,2 / 13-Sep-26".
PILOT queue row 56: WAITING_INFO, wrongly Treatment_Event_Log requesting dosage. Operation ledger/review/approval rows for this update: zero.

Fix accepts these aliases: tarikh mula harvest, tarikh mula tuai, mula harvest, mula tuai, and observed typo mula Harverst.
PILOT_OPERATION-only deterministic parser routes them to HARVEST_START Operation_Log.
MxPyz expands into two canonical plots MxPy and MxPz, e.g. M3P12 -> M3P1 + M3P2.
Comma form M3P1,2 works too. M12P34 -> M12P3 + M12P4.
One atomic Operation candidate per plot; two separate human confirmation cards, no automatic approval.
Single-plot M7P3 remains supported. Duplicate M3P11 or M3P1,1 and ambiguous M3P123 fail closed.
No crop, yield, harvest quantity, physical action or production write is inferred.

Targeted fixture: 21/21 PASS. Node full regression: 63/63 PASS.
The 47-check Apps Script operation harness has new compact plot/alias acceptance checks.
No replay of old update 772257287; no Telegram send, callback, or official BSE write.
Source merge, Script HEAD read-back, real runtime and fresh Telegram UX remain separate gates.
