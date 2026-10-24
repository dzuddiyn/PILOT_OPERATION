# 06 — OpsMate BSE Business-Grade Engineering Blueprint

This is a **future engineering proposal** for receiving BSE IT, not implemented production capability.

## Prioritized roadmap
| Phase | Work | Exit gate |
| --- | --- | --- |
| 0 — Custody | Corporate assets, on-call, S S. one-time OWNER cutover, old-owner denial | Independent role and asset verification |
| 1 — P0 DELETE | Cross-domain record VOID/CANCEL/CORRECT, dependency graph, secure approval and audit; reconcile legacy queues | Every domain-specific operation tested with real PILOT proof |
| 2 — Security/reliability | Trusted ADMIN RBAC, identity/capabilities, idempotency, backup/restore, alerts, CI/CD, release controls | Fault, security, recovery, load tests |
| 3 — BSE integration | Enterprise data contract, staging, migrations, official API after approval | Source/destination reconciliation and privacy review |
| 4 — Go-live | UAT, DR drill, SLO/SLA, support and receiving signoff | Formal production gate |

## P0 DELETE: acceptance contract, not just a Telegram button
Pilot's limited implementation resides in `TelegramApprovalUiTest.js` and `TEST_TELEGRAM_DELETE_PENDING`; /delete accepts specific inventory/claim/asset types, owner PM, reason, D2 callback confirm, status VOIDED_TEST. Not universal and not business-certified; Asset_Event_Log fallback must be reviewed.

Proposed types:
- **CANCEL_UNCONFIRMED:** discard unconfirmed queue/card with audit, never claim approved.
- **VOID_CONFIRMED:** retain original canonical fact, append reversal/void with reason/actor and isolate downstream effects.
- **CORRECT_REPLACE:** preserve old revision and link superseding canonical record.
- **PURGE:** exceptional separately governed retention/legal/security action; never the ordinary /delete path.

Proposed transaction:
1. Resolve exact canonical reference, record type, active revision, physical dependencies and official export status.
2. Authenticate actor and named permission; apply privacy and role checks.
3. Present comprehensive impact preview (plots, batch, inventory, EC, crop, evidence, references), reason code and short-lived anti-replay confirmation.
4. Persist immutable intent, apply revision-checked domain-specific void/correction, reconcile partial effects; no blind hard-delete or official BSE write.
5. Read back independently and verify one effective record state, audit ledger intact, history/retrieve/status consistent, attachments follow retention rules.
6. Tests include owner/admin/reporter denial, wrong chat, stale token, retries, simultaneous approvals, partial write, 0/duplicate matches, rollback, multi-plot, orphan prevention, idempotency, backup recovery and real isolated PILOT UAT. STOP if any source mismatch.

## Reuse vs re-engineer
Reuse user-confirmed conversational UX and learned parser/test fixtures, canonical EC model, reference numbers and audit patterns **as reference designs**. Re-engineer authority/RBAC, cross-domain record lifecycle, transactions, monitoring, corporate service custody and official BSE integration. Evaluate Sheets vs transactional DB only after workload, cost, access and recovery study—not a forced migration.

**Never promote the scoped pilot to production through a simple clasp push.**
