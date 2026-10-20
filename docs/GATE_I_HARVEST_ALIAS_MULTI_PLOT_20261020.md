# Gate I — Harvest start aliases and compact plot pairs

Checkpoint 2026-10-20: LOCAL PASS; runtime/live still pending.

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
