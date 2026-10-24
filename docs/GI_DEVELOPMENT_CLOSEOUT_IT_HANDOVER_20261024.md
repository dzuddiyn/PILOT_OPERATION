# GI — Development Closeout / IT Handover (24 October 2026)

**Status:** DEVELOPMENT CLOSEOUT CANDIDATE — READ-ONLY ACCESS BASIS VERIFIED; IT OPERATIONAL HANDOVER NOT ACCEPTED.
**Authorizing business decision:** existing owner keeps temporary OWNER; `S S.` is nominated future OWNER; `zen areyf` is REGISTERED_ACTIVE and designated Deputy Operations without elevation. Technical cutover of OWNER is deferred to BSE IT. This document is NOT evidence of transfer or BSE acceptance.

## Roles and authority — do not conflate nomination with grant
| Role | Designation | Actual access | Handover responsibility |
| --- | --- | --- | --- |
| Existing owner | Temporary operational OWNER | The sole active owner row in PILOT_OWNER_REGISTRY as of 24 Oct | Existing powers and exposure persist until revoked; not a permanent support obligation |
| S S. | Receiving operational OWNER (nominee) | Registered-active user; **not** an active owner | IT must perform one-time bootstrap re-key and independently verify |
| zen areyf | Deputy Operations / manual BSE data-entry liaison | Registered-active user, **no ADMIN role** | Use permitted Telegram PM history/retrieval to enter/reconcile records manually in official BSE process |
| BSE IT | Prospective technical custodian | Acceptance and custodianship **not verified** | Transfer and verify official access to Sheet/Drive, Apps Script, GitHub, BotFather via approved corporate flows |

## Evidence and limits for Deputy Operations
- PILOT_TELEGRAM_USER_REGISTRY inspected live: one `zen areyf` registration with `REGISTERED_ACTIVE`, numeric Telegram/PM identity. Numeric IDs not published.
- TelegramHistoryTest.js permits active users to issue `/history` through PM bot, but enforces visibility: OWNER, event's own reporter, or `GROUP_STANDARD`. Many private submitted reports are not visible to other users.
- TelegramRecordRetrievalTest.js permits registered users to enter `/retrieve BSE-TG-...`; specific record visibility, pending/confirmed status and audit controls must still apply. Evidence retrieval permits only own or `GROUP_STANDARD` or owner.
- This does **not** authorize privileged retrieval of all private data or administrative tasks. Verification by zen of actual required record classes remains PENDING. If a record is inaccessible, require authorized workflow/manual BSE records; do not promote them or bypass controls.
- System remains a shadow PILOT_OPERATION, `production_write:false` and `official_bse_write:false`. Any official BSE entry is performed independently by authorized staff; no implied pilot→official sync.

## Development evidence (existing proven milestones; not a claim of complete handover)
- PR #223 merged: shorthand status and Baja grouped parsing; Telegram `/status M3P1234` field PASS, grouped Baja four rows confirmed through independent PILOT inventory readback.
- PR #224 merged main `de78da1`: canonical EC history, human history rendering, PILOT Telegram menu hides /summary alias. Node regression 274/274 PASS; Script HEAD independently pulled 115/115 hash match; native EC October proof 2 batches/18 readings; native CL07 guard 7/7; Telegram /ec and /history field responses accepted.
- Baja In N `BSE-TG-772258091` independently verified one canonical inventory row, APPROVED_TEST, approval REPORTER_CONFIRMED.
- These are acceptance facts of bounded modules, not proof that every queue record is resolved, that operational ownership moved, or that official BSE integration exists.

## Explicit retained risks while old owner remains active
1. Operational OWNER privileges remain with the departing employee until IT completes and verifies the cutover; their personal account remains an authority dependency.
2. Privileged approvals, registration decisions, private reports and possible scheduled digest routing may continue depending on the old OWNER; do not treat a nominated manager as active.
3. If the old OWNER is unavailable, administrative operation and incident recovery can stall. IT must define temporary on-call/manual fallback, owner of the risk, and deadline.
4. Google Drive/Sheet, Apps Script, GitHub and BotFather custody are distinct and may remain personal; transfer each individually, never pass passwords or tokens.
5. Adding a second owner row or `is_admin=TRUE` is unsafe under legacy code. RBAC adapter and role ledger are incomplete; no admin grant to zen.
6. `/history` and `/retrieve` respect restricted visibility and can be insufficient for back-entering all BSE records. Record missing entries using manual authorized process; no blanket privilege expansion.
7. Backlog includes history UX formatting for private treatment and census categories, old queue anomalies, technical signoff and independent operational role migration.
8. Closeout cannot be called `FULLY DELIVERED` without receiving party acceptance. Existing owner has not yet been deauthorized.

## IT work order / mandatory acceptance criteria
1. Named BSE technical custodian formally accepts outstanding owner/access risk and receives no secrets in documents.
2. Inspect exact runtime SCRIPT PROPERTY legacy bootstrap, current owner registry and user registry with private ID matching.
3. Snapshot and verify safe rollback; test one-time re-key on isolated fixture, inspect every owner-only call path, approval callbacks, scheduler/digests and restricted read/write effects.
4. Execute one-to-one OWNER replacement for S S. only after change authorization; independently verify **exactly one active OWNER**, new owner PM authenticates and performs approved task, old owner denied, no stale fallback, no production/official writes.
5. If zen needs full admin rights, use a separately authorized proven RBAC runtime adapter and grant ledger; do not infer rights from nomination.
6. Transfer and verify each technical authority; agree support contacts, recoverability, backup, bot trigger schedule, pending queue, known issues.
7. Obtain written acceptance by BSE representative, document completion date, ticket/reference, owner and independent evidence. Until then status `IT_HANDOVER_PENDING`.

## Completion semantics
- `DEVELOPMENT_CLOSED`: permitted only after final code/evidence/queue/runbook audit confirms scoped development acceptance with known limitations documented.
- `OPERATIONAL_HANDOVER_PENDING`: retains OWNER/IT acceptance tasks separate from development.
- `DELIVERED`: only after IT and recipient ownership acceptance, verified access and no unowned operational risk.
- **No registry, Telegram, Script Properties, production or official BSE system modifications** are part of this documentation change.
