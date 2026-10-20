# Gate I ? Human-Friendly Telegram Receipts and Reliability Gate

## Problem witnessed (2026-10-20)

Real PILOT_OPERATION `BSE-TG-772257249` sowing report had correctly persisted Crop Batch 1, Planting Event 1 and Plot Allocation 2 (M5P3, M5P4) but displayed raw English schema names, internal batch/event/allocation identifiers, status codes and long key/value dumps on the edited Telegram confirmation card. This is **UX failure**, not data loss.

## Fix boundary

- `bseTelegramConfirmedPersistedSummary_` reads *persisted rows*, not LLM proposals, from PILOT scoped sheets.
- PILOT sowing receipts become concise BM: date, crop/variety, every exact plot, number of stored entities, plot status and provisional verification status.
- Other fallback-domain receipts get BM domain titles and BM field names, removing internal IDs from the ordinary Telegram view; previously human-readable dedicated module receipts (Transplant, census, EC, etc.) remain unchanged.
- Technical IDs, hashes, provenance, original input and status remain in Sheets for audit. Never substitute UI presentation for a write verification.
- Safety: sowing requires exactly 1 batch, 1 planting event and >=1 distinct valid plot, with consistent plot allocation statuses and matching activity/date/batch references where present; missing/mixed/duplicated data returns no generic "saved" receipt. `PROVISIONAL` is rendered as *Sementara (belum diverifikasi)*, not verified.
- No automatic historical receipt re-send, callback replay, approval bypass, record rewrite, Google API change, or official BSE write.

## Worker reliability acceptance proposal (not activated)

**Evidence:** [12:28 UIA incident](GATE_I_WORKER_1228_UIA_DIAGNOSTIC_20261020.md); one `bseTelegramTick` failure (166.042 sec), six next ticks deferred due `ScriptLock`, 772257248 callback eventually processed after ~6m50s with one domain write and no duplicate.

Proposed **minimum observability/acceptance thresholds**, subject to owner sign-off before activation:

1. Observe every due callback from PILOT durable callback queue, count `PENDING`, `FAILED_*`, age since `received_at`, last attempt, backlog size and `GATE_H_RECEIVER_BUSY_DEFERRED` runs; preserve source_key and redacted diagnostics only.
2. Warning when any `PENDING` callback age exceeds **2 minutes** or three successive minute ticks defer on lock contention. Escalate to owner when callback age exceeds **5 minutes**, any `FAILED_*`, or sustained lock contention. Escalation must not auto-approve or replay.
3. Controlled pilot reliability gate: no duplicates, no lost approvals, no unexplained `FAILED_*`, all pending callbacks eventually reconcile; **target <=2 minutes for 95% and <=5 minutes for 100%** in an owner-agreed observation window. Existing 6m50s incident means **reliability NOT PASS**.
4. If runtime execution errors recur, capture handler step/time/duration and origin of ScriptLock if supportable without secret exposure; compare error vs successful recovery. A generic server error alone is **not evidence** of root cause.
5. Fail safely: no duplicate send, no synthetic user approvals, no changes to official BSE, no "success" claims for pending callbacks.

**Status:** Criteria proposed and documented; monitoring and notifications not implemented or authorized. Reliability gate OPEN. Formal corporate/site IT handover NOT DELIVERED.
