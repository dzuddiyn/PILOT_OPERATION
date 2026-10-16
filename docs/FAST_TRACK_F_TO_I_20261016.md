# PILOT_OPERATION Fast-track F–I — 16 October 2026

**Status:** Gate F Crop Batch write/store/Telegram retrieval **LIVE PASS** (audit `SENT` / `OWNER_ACTIVE`, 16 Oct 2026); Gate G evidence proof **NOT STARTED**; Gate H automation implementation **LOCAL PASS only**; Gate I **NOT STARTED**. Do not mark H enabled or deployed.

## Why not clone PILOT_TEST

Canonical `PILOT_OPERATION` is derived from successful PILOT_TEST source baseline `4809817` and already contains independently verified BSE-TG-772257142 / root 772257141 domain records. Re-cloning risks resetting provenance fixes, Script ID, owner, offsets, trigger authority and access. Core `receiveBseTelegramTest`, `bseTelegramRecordRetrieve_`, and Telegram routing are reused without rewrite.

## Authority and runtime

- GitHub `dzuddiyn/PILOT_OPERATION` is source authority.
- `PILOT_*` Sheet / Drive store PILOT operational records only; never official BSE.
- `BSE_TELEGRAM_OFFSET` and Telegram getUpdates are *transport state*, not records of operational truth.
- Callback sheets, approval UI and Crop Batch sheets are operational history / durable state.
- `production_write:false`, `official_bse_write:false` stay locked.
- General Telegram automation remains **OFF** until Gate H owner approval, Gate F+G PASS and transport reconciliation.

## Gate F minimum controlled closure

1. Keep existing approved Crop Batch `BSE-SB-CB-20261002-001` and no duplicates.
2. Retrieve via existing `/retrieve BSE-TG-772257142` in owner's private bot chat.
3. Manually run the existing `TelegramQueueTest.gs -> receiveBseTelegramTest` **once** only after inspecting transport offset/backlog. Do not start general automation. The receiver already handles durable callbacks and sends retrieval replies.
4. Independently verify Telegram reply and `PILOT_TELEGRAM_RECORD_RETRIEVAL_AUDIT` `SENT`, plus queue, approval, hash, 1 batch, 1 planting, 2 allocation.
5. Reconcile offset with API before any future auto-ON. No blind reruns.

**Gate F independent proof closed:** owner received `[PILOT] Rekod TEST BSE-TG-772257142`, showing Timun Batu CCB, 2026-10-02, M5P1, M5P2; `PILOT_TELEGRAM_RECORD_RETRIEVAL_AUDIT` contains exactly one `SENT` / `OWNER_ACTIVE` row for reference at `2026-10-16T08:34:30.147Z`. Crop Batch, Planting Event, Plot Allocation cardinalities remain 1/1/2. Evidence: `PILOT_OPERATION_EVIDENCE/GATE_F_20261016_RETRIEVAL_LIVE_PASS.md` on owner workstation. Do not replay this test.

## Gate G minimum controlled closure

1. One owner-provided actual photograph/evidence in a permitted private Telegram chat.
2. Existing receiver/manual callback path, owner confirmation, Drive file in PILOT_OPERATION authorized folder, PILOT_FILE_EVIDENCE `CONFIRMED_TEST`.
3. Independent Drive permissions, evidence metadata/source, duplicate audit and `/retrieve BSE-EV-...` Telegram file receipt.
4. Verify `PILOT_TELEGRAM_RETRIEVAL_AUDIT` `SENT` and do not equate parsed evidence with domain write.

## Gate H preparation (no activation)

Source `PilotOperationGateH.js` includes read-only `inspectBsePilotOperationGateH`, owner-run `installBsePilotOperationGateH`, and `stopBsePilotOperationGateH`. The preflight rejects unresolved F/G, open approval, pending callback, wrong binding, webhook, wrong bot, stale trigger or Telegram backlog. Pilot tick reuses existing receive/callback/worker code, OFF is inert; legacy TEST remains unchanged; PILOT_TEST stays disabled. Existing unrelated schedulers are preserved.

**Gate H actual activation requires a separate explicit owner authorization and merge/Script HEAD update.** A safe trigger installation alone is not a LIVE PASS: check fresh update exactly once, callback exactly once, queue settlements, no skipped/replayed updates, rollback OFF.

## Gate I

One owner-style Telegram walk-through without Apps Script Run. Verify source/runtime parity, schema, provenance, user access/privacy, independent domain/evidence retrieval, trigger state, fallback and handover. Report PARTIAL if any gate cannot pass in the handover window.

## Current independent evidence

- 16 Oct domain proof: `PILOT_OPERATION_EVIDENCE/GATE_F_20261016_DOMAIN_READBACK.md`.
- Baseline `main`: `f76a6ce` before preparation.
- Automated Gate H mock isolation: see `gate_h_automation_preparation.test.cjs`.
- No Google Cloud migration, no new Script version/deployment, no production write, no trigger activation in this preparation.
