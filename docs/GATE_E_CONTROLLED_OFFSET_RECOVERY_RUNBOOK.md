# Gate E — Controlled Offset Recovery Runbook (PREPARED, NOT EXECUTED)

Environment: PILOT_OPERATION. Authority: Gate E contract in docs/GATE_E_TRANSPORT_RECONCILIATION.md.
Current checkpoint: owner read-only audit 2026-10-15 18:35 MYT; offset UNSET; webhook inactive; automation OFF.

## Classified old updates

| Telegram update_id | Source | Decision | Evidence |
| --- | --- | --- | --- |
| 772257138 | owner private message 6 (hi) | TEST_ONLY / NO_DOMAIN_WRITE | owner confirmation |
| 772257139 | owner allowed group message 7 (/pilot) | NON_OPERATIONAL_COMMAND / NO_DOMAIN_WRITE | read-only source audit and no matching command handler |
| 772257140 | owner private message 8 (/ask_ai) | ALREADY_ANSWERED / NO_REPLAY | owner Telegram proof at 17:26 |

These decisions cover only those three update IDs, NOT future updates.

## Required guarded sequence (after explicit owner approval of remote acknowledgement)

1. Confirm canonical main and approved recovery implementation; ensure automation OFF, correct PILOT_OPERATION binding, bot identity, webhook inactive, and single-worker lock. Do not invoke normal receiver.
2. Re-read getUpdates(offset=0, timeout=0) and require the first three IDs still be exactly 772257138..140 with expected type/chat/sender/command, AND no unexpected older unclassified updates. A later update >= 772257141 is not part of the stale set.
3. Write one append-only reconciliation audit record per old update in a PILOT_OPERATION-only sheet, with unique source ID and disposition; READ BACK and validate all three before modifying any offset. On partial write, reconcile; never add duplicate audit rows.
4. Immediately re-read the same three updates (offset=0) and verify identity remains unchanged. Do not infer that newer updates should be discarded.
5. With explicit approval and only after verification, set BSE_TELEGRAM_OFFSET=772257141. READ BACK property equals boundary. This is a *local property write*, not confirmation that Telegram discarded its backlog.
6. Telegram getUpdates(offset=772257141, timeout=0) acknowledges all updates with ID below 772257141. NEVER use drop_pending_updates; never set offset beyond 772257141; retain any results >= 772257141 for ordinary controlled processing.
7. Verify via getUpdates(offset=0) that 138..140 are no longer pending, while any new updates >=141 remain; verify audit rows, property and empty operational queue/callback/approval state. If acknowledgement outcome unclear, inspect before retrying.
8. Mark TRANSPORT_CLEAN only after all invariants pass, independently. General receiver / automation remain OFF until their respective gates.

## Blockers and approval

- Remote Telegram acknowledgement is irreversible for old updates; explicit owner approval required separately.
- The existing unmerged diagnostic GateEReadOnlyAudit.js is temporary in Script HEAD; remove it and independently verify cleanup when finished.
- This runbook is documentation only; no Script Properties, Telegram offset, Telegram updates or operational sheets changed by this commit.
- Gate F, H remain blocked pending required gates.
