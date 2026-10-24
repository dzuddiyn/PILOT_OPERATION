# 04 — Security and Access

## Current roles (24 Oct read-backed)
The outgoing owner is the only active row of `PILOT_OWNER_REGISTRY`. `S S.` is REGISTERED_ACTIVE but nominated OWNER only; `zen areyf` REGISTERED_ACTIVE, operational records liaison only, **no ADMIN**. New recipient identity and actual permissions must be reverified before IT cutover. This package makes no grants.

## Critical OWNER constraint
Script Properties legacy bootstrap is also read by runtime; legacy `bseTestOwnerForTelegramUser_` does not safely partition OWNER/ADMIN authority. Locked model: immutable owner + audited ADMIN grant ledger; one-time rekey to S S. is an exceptional controlled transaction, not editing a name or adding a second active owner. Branch RBAC synthetic tests do not establish native trusted adapter readiness.

## Residual operational risk
Outgoing employee retains privileged access and may receive owner digests. Personal credentials/technical custody may be a single point of failure. BSE must accept risk and complete revocation, transfer GitHub/Google/Apps Script/BotFather separately, preserve on-call and manual fallback. No request to disclose personal tokens.

## IT OWNER acceptance
Authenticated recipient identity matches registered PM; independently approved change window; backup; test synthetic rollback/partial-write/replay; one-to-one owner replacement and bootstrap rekey; exactly one owner after readback; new owner operation succeeds; old owner blocked; digest and restricted retrieval correct. Sign off with actual evidence.

## DELETE authorization requirements
Only capability-authorized business roles may request VOID. Reason, affected records, explicit confirmation, event revision, anti-replay, dependency preview, append-only audit, retention policy, separate high-impact approvals and independent readback. No force-close should imply false reporter confirmation or erase source truth.
