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

## Operational SOP — approved group-first reporting and PM retrieval

This section supersedes any earlier implication that `zen areyf` needs an elevated technical role to collect routine field reports.

| Work | Channel | Boundary |
| --- | --- | --- |
| Field operation reports (semai, pindah tanam, baja, rawatan, banci, EC and others) | Authorized BSE OpsMate Telegram operational group | Staff submits correct factual work note; reporter reviews its Benar card; incorrect reports use Betulkan/Batal |
| Shared operational reporting visibility | Authorized operational group | Group submission gives the normal shared operational workflow; it does **not** automatically make every historical private report public |
| `/history Oct 2026` (or specific day/week) | Bot private message (PM) | Only records within registration and visibility rules |
| `/retrieve BSE-TG-XXXXXXXXX` | Bot PM | Restricted records remain restricted; use the reference from the group report |
| `/claim` | Bot PM | Own claim flow only, according to the existing permission check |
| OWNER/ADMIN transfer, Google and Telegram technical custody | BSE IT authorized process | Never issue a second OWNER or grant ADMIN by editing the legacy owner registry |

- `zen areyf` acts as an **active registered user and operational records liaison**, not a new system role and not an ADMIN. Manual transcription into official BSE records must follow the company procedure; pilot records are **not** automatically synchronized to the official system.
- Staff should report operations through the designated group going forward, to make common operational facts available under existing group visibility rules. This rule is prospective; no attempt to retroactively expose private reports or widen permissions.
- The outgoing OWNER retains live administrative privileges **temporarily**, which is an outstanding **high-risk IT handover item**; this document does not appoint the outgoing employee as indefinite technical support.
- `S S.` is the nominated receiving OWNER but cannot be described as activated until IT verifies the one-time cutover.

## Development closeout acceptance and residuals

**Development result: DEVELOPMENT_CLOSED — SCOPED PILOT.** Scope: tested Telegram capture/approval, Baja In/Out grouping and ledger, EC canonical history, multi-plot status, accessible operational history and bot menu; no assertion of official production deployment, ownership transfer or complete clearance of legacy queue.

- Canonical GitHub PR #223 and #224 merged, latest verified Apps Script HEAD 115/115 hash match; full Node regression 274/274 PASS, native EC read-only 2 batches/18 readings and lifecycle 7/7 PASS. User live acceptance confirmed `/status M3P1234`, `/ec 2026-10`, `/history Oct 2026`, Baja In N and grouped Baja Out F/N. These are scoped acceptance results, not a blanket statement of full operational readiness.
- Known limitations: some `PRIVATE SUBMISSION` treatment and census history text remains raw; monthly history intentionally truncates to 20 of 24 entries with narrower period required; private record visibility limits deputy's retrieval; unresolved older queue/callback anomalies must be handed to IT for reconciliation, not replayed.
- **OPERATIONAL_HANDOVER_PENDING:** IT cutover of S S., removal of old-owner privileges, transfer of distinct technical authorities, recipient acceptance, and IT runbook owner remain unverified. Do not label FULLY_DELIVERED.
- Exit criterion for this scoped development closeout is preservation of evidence, owner risk explicitly assigned to IT as pending, and operation instructions documented. Closing development does not authorize pausing triggers, revoking accounts, or granting new permissions.
