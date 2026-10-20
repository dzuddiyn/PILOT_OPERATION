# GI-HARVEST-298 — Read-only Live Closeout & Worker Reliability Intake

Date: 2026-10-20 MYT. Environment: PILOT_OPERATION shadow pilot; official_bse_write:false.
Verdict: HARVEST SCOPED LIVE PASS for two cards / human approval / two records / independent Sheets read-back. Record retrieval and history: NOT_RUN. Worker Reliability: OPEN. Final handover: NOT DELIVERED.

## Authority and environment
- Canonical dzuddiyn/PILOT_OPERATION main observed at 2ae14573a7a60a80fd266afcdaf5be1248180343 (PR 138/139 merged).
- Inspected AGENTS.md, docs/ARCHITECTURE.md, locked docs/PILOT_OPERATION_EXECUTION_PATH.md, ACTION_PLAN.md, docs/DEVELOPMENT_STATUS.md, existing handover candidate and live PILOT Sheets.
- This audit sent no Telegram messages/callbacks, replayed no historic report, modified no PILOT rows or Apps Script trigger, and made no official BSE write.

## Independent live proof: source 772257298
- Original Telegram: mula Harverst / M3P1,2 / 13-Sep-26. Owner screenshot: two correct cards Record 1/2 M3P1 and Record 2/2 M3P2, each with individual Benar/Betulkan/Batal, no Treatment dosage prompt.
- PILOT_TELEGRAM_QUEUE row 60: REPORTER_CONFIRMED, ACK SENT, processing_attempts 1.
- PILOT_TELEGRAM_APPROVAL_UI rows 37/38: exactly two distinct card source keys BSE-TG-772257298|Operation_Log|C1 and ...|C2.
- PILOT_TELEGRAM_APPROVAL_CALLBACK_PENDING: updates 772257299 and 772257300; action A, status PROCESSED, attempts 1 each. Received 10:06:23 / 10:06:26 UTC; processed 10:06:41 / 10:07:27 UTC (approx. 19s and 61s).
- PILOT_OPERATION_REVIEW rows 3/4: two APPROVED, one per M3P1/M3P2.
- PILOT_OPERATION_LOG rows 3/4: exactly two source 298 HARVEST_START, event_date 2026-09-13, distinct M3P1/M3P2, verification_status PROVISIONAL. No crop/yield/quantity inference.
- This verifies software persistence and provenance, not actual physical harvesting.

## Retrieval & history — explicit NOT_RUN
- PILOT_TELEGRAM_RECORD_RETRIEVAL_AUDIT: zero rows matching 772257298; prior successful /retrieve rows concern older reports such as 772257161 and 772257163.
- PILOT_TELEGRAM_RETRIEVAL_AUDIT is evidence-file retrieval, not farm-record retrieval: zero rows for 298 is not by itself a defect.
- PILOT_TELEGRAM_HISTORY_AUDIT has no M3P1/M3P2 search match and no demonstrated history query for the 13 September work date; latest visible SENT result covers 5–11 Oct. Do not claim the two new Harvest rows are returned.
- No /retrieve or /history message was issued by this read-only audit. Existing prior scope tests cannot replace genuine fresh Telegram proof.

## Dedup, callback and backlog
- Exactly two distinct Operation_Log rows (M3P1/M3P2); two different source keys and payload hashes, one callback each. No duplicate source 298.
- Retained approval callback table: 40 PROCESSED, one FAILED_CALLBACK_RETRY_LIMIT historical record (772257190), zero PENDING. The old terminal failure is already reconciled; do not replay.
- 15 historic Telegram queue rows WAITING_INFO (including old wrong-domain 772257287), NOT pending approval callbacks. No bulk close or auto cancellation.
- Among 40 processed historical callbacks, receipt-to-process approx p50 19.8s, p95 410.4s, max 8983s. Historical extremes include prior recovery periods and must not be presented as a current SLA.
- Earlier documented incident: bseTelegramTick 12:28 MYT failed after 166s, receiver ScriptLock deferred 12:29–12:34, callback recovered once at 12:35, root initial server failure UNKNOWN.
- Read-only Chrome Executions list around 18:15 also displayed recent bseTelegramTick ~74s and ~49s, with some entries briefly RUNNING. This is a timing observation only; not proof of duplicate processing or failure.

## Remaining gates
- GI-HARVEST-298 scoped LIVE PASS for parse/cards/approval/persistence/dedup. /retrieve and /history for these exact records NOT VERIFIED.
- Worker Reliability OPEN: inspect actual execution correlations, lock owner hints, backlog monitoring and alerted threshold design; fail closed, no retries of old callbacks.
- No trigger or alert was installed, no Apps Script version/deployment changed, and no production writes were executed by this audit.
- Gate I corporate/UAT acceptance and formal handover NOT DELIVERED; separate owner/IT BSE sign-off still required.
