# Gate I — PILOT_OPERATION operations and IT handover runbook

**Status:** PREPARED / OWNER-BSE ACCEPTANCE PENDING
**Date:** 2026-10-18 MYT
**System:** BSE OpsMate shadow pilot, not the official BSE production system.
**Authority:** `dzuddiyn/PILOT_OPERATION` GitHub; Google owner `dzuddiyn01@gmail.com`.
**Write boundary:** PILOT_OPERATION Spreadsheet/Drive only; `production_write:false` and `official_bse_write:false`.

## A. Ordinary user instructions
1. Use the registered authorized Telegram bot in an allowed PM or operation chat. Do not forward private operational details to unrelated groups.
2. State work facts (work type, date, crop, plot, material/dose or quantity where applicable). Only submit work that actually occurred. Example labels must be TEST_ONLY unless true facts are available.
3. Wait for the automatic acknowledgement and reviewer card. Confirm exact date, crop, plot and quantity before selecting **Benar**. Use **Betulkan** if data is wrong, or **Batal** to discard.
4. The sender's Benar is the necessary human authority; software processing alone does not prove an operation took place.
5. Use a private bot message for `/retrieve <reference>`, `/history` or `/status plot <plot>` within your access rights. Users see only allowed facts; owner/admin access is broader.
6. An Evidence photo/document is stored in PILOT Drive only after the appropriate authorized confirmation. Gemini analysis is NON_CANONICAL and cannot create domain records.
7. If acknowledgements/replies stall, do not repeatedly resubmit an identical real report. Contact the owner/admin for audit reconciliation.

## B. Owner/admin responsibilities
- Maintain PILOT_OWNER_REGISTRY and user authorization under approved process; revoke access promptly when staff change.
- Reconcile Telegram update id, queue, review UI, callback, canonical domain row/source key and retrieval audit against actual evidence.
- Compare PILOT results with the existing manual BSE record process daily using MATCHED, MATCHED_WITH_NOTE, PILOT_MISSING, PILOT_DUPLICATE, LEGACY_MISSING, DATA_DIFFERENCE, OUT_OF_SCOPE or VOIDED_TEST.
- No automatic import, synchronization or direct write from PILOT to official BSE. Admin retains manual validation responsibility.
- Capture feedback/questionnaire from BSE admin and operations team using `docs/SHADOW_PILOT_MVP_HANDOVER.md`, then obtain genuine BSE representative sign-off; AI cannot sign for either party.

## C. Scheduled reporting
- Daily Morning Digest: every day 08:01 MYT, report for the previous calendar day, owner-active private chat only for initial PILOT_OPERATION.
- Friday Weekly Digest: Friday 07:59 MYT, previous full Friday–Thursday, owner-active PM only for initial rollout.
- All canonical data must come from PILOT_OPERATION. Gemini comments are labelled NON_CANONICAL; failure returns an unavailable comment rather than an invented fact.
- Both schedulers use date/window+chat dedup. `SENDING` or `OUTCOME_UNKNOWN` prevents blind retry; reconcile Telegram chat and audit before manually addressing a missing message.
- Source: `PilotOperationDigests.js`; inherited PILOT_TEST scheduler functions remain unchanged.
- Verification: Apps Script `inspectBsePilotOperationDigestSchedulers` + PILOT_DAILY_DIGEST_AUDIT, PILOT_FRIDAY_WEEKLY_DIGEST_AUDIT and corresponding CONFIG_AUDIT sheets + received Telegram PM.
- Active trigger marker only proves installation; scheduled LIVE PASS requires actual message ID and independent audit.
- Apps Script time triggers can have delivery jitter; do not promise second-exact execution.

## D. Stop/rollback/recovery
- **Digest only OFF:** `stopBsePilotOperationDailyDigest` and/or `stopBsePilotOperationFridayDigest`. Confirm matching flag OFF and zero trigger.
- **General Telegram automation OFF:** `stopBsePilotOperationGateH`. Verify OFF/zero known polling trigger and backlog/replay state before re-enabling.
- For unknown send outcome: inspect Telegram chat, PILOT digest audit/status and underlying callback; do **not** resend without no-duplicate reconciliation.
- For wrong-target suspicion: fail closed before write; record exact environment, script/account, source/ref and timestamp without credentials. Isolate affected scheduler.
- For corruption, mismatched source keys or access breach: stop affected write path first, preserve forensic evidence, request owner review for irreversible rollback/data correction.
- To restore: check runtime binding, source Script HEAD, owner status, queue/callback state, webhook OFF, trigger marker identity and owner mandate, then reinstall one trigger, verify independent logs and one-message proof.
- Never copy/paste Script Properties, bot tokens, Google credentials or Git tokens into evidence/PR/chat.

## E. Source deployment/reliability
- Canonical GitHub source remains source of truth. Use feature branch, local regression, diff/secret scan, PR verified head SHA, authorized merge, read-back before updating Script HEAD.
- Apps Script current HEAD includes nine Gate F helper scripts in addition to canonical repository JS. **Do not run bare `clasp push` from repository**. Pull an isolated HEAD mirror, compare canonical source, preserve helpers, upload exact selected file set, pull again independently and compare.
- `clasp push` updates Script HEAD, not Apps Script deployment or official production.
- After changes run `runBseI011FullRegression` in PILOT_OPERATION; require 47/47 PASS and separate runtime proof.
- Allow only the active Google owner identity; no legacy credential/account fallback.

## F. Known limitations and evidence state
- Digest sender initially restricts recipients to active owners. Staff broadcast requires reviewed visibility/access and separate scope decision.
- Actual Apps Script scheduling can lag the target second; monitor by period and receipt rather than assuming the time alone guarantees delivery.
- Browser UI and Telegram Desktop remote control need an authorized accessible Windows session; an offline, sleeping or locked machine may block GUI proof.
- Gate F/G/H live evidence is distinct from Gate I and real-operation confirmation. Prior Gate H Batal-only test cannot prove a new actual confirmed operation.
- No production cutover, official BSE write or official BSE final handover authorization has been granted through Gate I.
- A technical handover package is not an accepted corporate handover until admin/team questionnaires and required genuine BSE sign-off have been captured.

## G. Handover inventory / receiving checklist
- Canonical commit and PR refs; Script HEAD digest/9 helpers checksum verification; environment/account/binding evidence.
- User manual, admin manual, data-source mappings and daily reconciliation template.
- Digest scheduler state and recovery instructions.
- Regression, independent PILOT_* audit, Telegram screenshots or message IDs (private evidence directory only).
- Incident classification and backlog; limitations and excluded official BSE integration.
- Actual admin and operations questionnaire results, sign-off roles/date, delivery recipient and acceptance scope.

**Acceptance classification:** `HANDOVER_PREPARED` until external BSE review and signatures are real. No automatic `DELIVERED` classification from source merge or digest messages.
