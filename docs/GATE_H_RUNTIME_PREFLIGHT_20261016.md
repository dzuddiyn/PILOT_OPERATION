# Gate H Runtime Preflight — 2026-10-16 (review only)

Scope: `PILOT_OPERATION`; **NO AUTO ON**, trigger creation, version, deployment, or Script Properties changes authorized. Canonical GitHub `main` at `19c694a0`; Apps Script HEAD previously read back matching 59 canonical JS, manifest, plus 9 unchanged standalone legacy Gate F helpers.

## Read-only source and Sheet reconciliation
- Canonical repo clean before branching; 9 extras preserved, inspected individually by entrypoint/collision and side-effect scan.
- Legacy extras: `GateFAcknowledgeMappedQueue`, `GateFCallbackRuntimeAudit`, `GateFControlledPairIntake`, `GateFInspectPendingCallbacks`, `GateFMappedQueueRepair`, `GateFProcessOwnerBenar`, `GateFReadOnlyIntake`, `GateFReplyPreflight`, `GateFRetrieveOnce`.
- Helpers define 10 standalone functions, zero collisions with canonical function names, zero canonical callers. No helper invokes trigger creation/deletion. **Some helpers can poll updates, set Telegram offset, or write PILOT Sheets when called manually**; do not remove or run without reconciliation.
- `appsscript.json` defines no declarative trigger, but installable triggers live in Apps Script and are **not verified** by manifest or `clasp pull`.
- Latest live PILOT Sheet: Crop Batch 1, Planting 1, Plot Allocations 2, approval UI `REPORTER_CONFIRMED`, queue `REPORTER_CONFIRMED`, approval callback 1 `PROCESSED`, Evidence 1 `CONFIRMED_TEST`, Evidence callback 1 `PROCESSED`. F record retrieval audit 1 `SENT`, G evidence retrieval audit 1 `SENT` / `TELEGRAM_FILE_ID`, no duplicate.
- Evidence ID in Sheet `BSE-EV-22-AQADiBBr`, but retrieval audit normalizes to `BSE-EV-22-AQADIBBR`. Gate H readiness in merged `main` compares them case-sensitively, causing false `GATE_H_G_EVIDENCE_RETRIEVAL_PROOF_MISSING` despite live Gate G PASS.

## Safe remediation in separate feature branch
- Regression test added with mixed-case Evidence ID and uppercase normalized audit: **RED** on merged main.
- Proposed patch compares Evidence IDs case-insensitively and rejects any non-`PROCESSED` Evidence callback (rather than only `PENDING`).
- Tests after patch: Gate H harness 31/31 PASS; full regression 47/47 PASS; no Script HEAD change here.
- Patch is **NOT merged** or `clasp push`ed by this preflight. Current Apps Script HEAD still contains the old readiness defect.

## Runtime preflight gaps / gates
- No authoritative live Script Properties readback for `BSE_TELEGRAM_AUTOMATION`, `BSE_PILOT_GATE_H_TRIGGER_ID`, or present Telegram offset in this checkpoint.
- No authoritative live installable trigger enumeration, webhook status, or Telegram backlog check. An earlier owner diagnostic reported offset 772257149 and 0 pending, **before** the successful Gate G callback/retrieval; not current.
- `ScriptApp.getProjectTriggers()` only enumerates installable triggers visible to the executing Google account; cross-account triggers require separate authority assessment.
- Current readiness verdict: **BLOCKED by known source mismatch + UNVERIFIED runtime trigger/config/backlog**; no Gate H activation approval requested.
- After owner-authorized PR merge and Script HEAD sync, run existing read-only `inspectBsePilotOperationGateH` (and reconcile any failures) before Gate H activation approval. No need to redo F/G live tests.
