# GI-UX-01 — No Reply + Unified Card (bounded pilot slice)

**Date:** 2026-10-22 MYT. **Source:** dzuddiyn/PILOT_OPERATION. Owner asked for one small GI-UX-01 change, explicitly excluding Draft, lifecycle and ADMIN.

## Change
- Complete, supported **single-domain** PILOT reports (Measurement, Plant Census, Plant Replacement, Observation, Operation, Maintenance, Leave, Plant Condition, Decision Approval) now bypass the redundant generic Telegram result preview when an existing authorized approval-card route resolves the candidate. Previously supported card-only guards for sowing, transplant, treatment, operation, EC, and complete inventory remain unchanged.
- The existing Benar/Batal approval card for **PILOT_OPERATION** is a normal bot message instead of a reply to the source message. The card still carries the existing source reference, payload hash, identity gate, callbacks and read-back logic.
- The PILOT card title becomes "Semakan Laporan BSE-TG-..." and the internal production boilerplate becomes a concise request to verify before selecting Benar or Batal. Existing domain-specific facts remain in the card; no user field is invented.
- **NEED_INFO/WAITING_INFO is not redesigned here.** Existing clarification/ForceReply remains so source reconciliation is not broken. "Simpan Draf" will be a separate Fasa 2 implementation.
- Historical TEST and PILOT_TEST continue to send cards as Telegram replies. No changes to owner role, source ledgers, parser, lifecycle, worker lock, callbacks, sheets or production.

## Verification
- 8/8 new targeted source/actual-card-function tests (including source binding, no PILOT reply, TEST parity, missing fields and unsupported domains).
- 9/9 historical Transplant card-only regression after updating its exact-text gate assertion to include the new conjunct, without removing old sequencing assertions.
- 88/88 Node test files and 71/71 JavaScript source syntax checks, git diff --check PASS.
- Independent code review, canonical merge, Script HEAD sync, native Apps Script regression, and fresh Telegram field evidence are **distinct subsequent gates**. No existing Telegram message was replayed.

## Safety boundary
- Only PILOT_OPERATION; production_write:false, official_bse_write:false.
- No Draft, no ADMIN/RBAC grant, no seed or crop lifecycle change, no new Telegram menu, no Script version/deployment.
- This slice does not certify every report grammar, incomplete report UX, or entire master-roadmap Phase 1; those require independent field acceptance.
