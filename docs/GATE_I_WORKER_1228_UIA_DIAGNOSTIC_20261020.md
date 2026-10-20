# Gate I ? bseTelegramTick 12:28 Reliability Diagnostic

**Date:** 2026-10-20 (Asia/Kuala_Lumpur)
**Status:** READ-ONLY DIAGNOSIS / ROOT CAUSE PARTIAL / RELIABILITY OPEN
**Environment:** BSE PILOT_OPERATION shadow pilot; NOT official production

## Grounded evidence (Apps Script UIA)

Windows UI Automation examined the actual Chrome Apps Script project **BSE OpsMate SB PILOT_OPERATION**, using the Triggers (Pemicu) and Executions (Eksekusi) pages without any function execution or state changes.

- Three project triggers displayed; one time-based trigger for `bseTelegramTick`, with a 2.02% error-rate displayed at inspection.
- Execution `bseTelegramTick` started **12:28:18 MYT**, ended **failed** after **166.042 seconds**; cloud log at **12:31:04 MYT** showed the generic Indonesian server message: `Maaf, ada kesalahan server. Tunggu sebentar dan coba lagi.` **No call-site/stack trace was visible**.
- Each scheduled tick from **12:29 to 12:34 MYT** displayed `GATE_H_RECEIVER_BUSY_DEFERRED {"status":"RETRY_NEXT_TICK","production_write":false,"official_bse_write":false}`; these executions were marked **Selesai** (completed) despite work being deferred, not callback success.
- At **12:35:22 MYT**, `TELEGRAM_RECEIVE_DONE` appeared. At **12:35:29**, `TRANSPLANT_REVIEW_SAVED` recorded `BSE-TG-772257247|Transplant_Event_Log`, `decision: APPROVED`. The 12:35 execution finished successfully with subsequent idle log.
- Current main code `TelegramQueueTest.js` uses `LockService.getScriptLock().tryLock(1000)` and throws `Penerimaan lain sedang berjalan.` when busy; `TelegramAutomationTest.js` catches **that exact error** and returns `RETRY_NEXT_TICK` rather than running callback drains in that tick. This explains the observed deferrals, but **does not identify the lock holder**.
- Targeted local existing Gate H automation preparation tests: **31/31 PASS**. They are local tests, not evidence that lock contention can never recur.

## Independent domain read-back

`PILOT_TELEGRAM_APPROVAL_CALLBACK_PENDING` update `772257248` shows action A, `received_at=2026-10-20T04:28:47.239Z`, **PROCESSED**, **attempts=1**, `processed_at=2026-10-20T04:35:37.650Z`, blank `last_error`. The delay from durable receipt to processed is approximately **6m50s**.

Previously independently verified: original report `BSE-TG-772257247` has one Transplant event `BSE-SB-TR-20261007-002`, two M5P1/M5P2 **PLANNED -> ACTIVE** transitions, and one complete edited Telegram receipt. **No manual replay was needed**.

## Diagnosis and decision

1. **CONFIRMED:** Apps Script execution-level generic server error on 12:28 tick and multi-minute ScriptLock contention/early-defer on subsequent ticks. This directly explains why an already-persisted Benar callback remained pending.
2. **CONFIRMED:** Automatic, deduplicated recovery on the 12:35 tick. No evidence of duplicate writes for this source_key.
3. **UNVERIFIED:** Whether the initial generic error was caused by Google infrastructure, a hung code/API call, or another transient backend; no detailed stack trace or lock-owner identifier is available. Do not classify this definitively as a Google-only outage or a proven application-code defect.
4. **DECISION:** No speculative production-source hotfix warranted from this single incident. Keep **worker reliability OPEN** and **formal BSE handover NOT DELIVERED**. Before final operational reliability sign-off, establish a bounded callback-backlog/lock-contention detection and alerting criterion (including persisted callbacks older than an owner-approved threshold), capture correlated execution/lock-duration diagnostics, and observe further unattended operation. Propose implementation separately if approved; **never replay callbacks merely to test**.
5. Scope remains `production_write:false`, `official_bse_write:false`. No Apps Script trigger, callback, domain, offset or deployment modification in this diagnosis.

## References

- `TelegramAutomationTest.js`: PILOT `bseTelegramTick` and guarded `GATE_H_RECEIVER_BUSY_DEFERRED`.
- `TelegramQueueTest.js`: receiver ScriptLock acquisition, deferred callback processing.
- `TelegramApprovalUiTest.js`: durable callback processor.
- `docs/GATE_I_GLOBAL_PLOT_LIVE_248_20261020.md`: scoped LIVE PASS.
- Evidence observed directly in Apps Script Triggers / Executions by UIA and independently in PILOT Sheets.
