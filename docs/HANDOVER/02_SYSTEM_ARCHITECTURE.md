# 02 — System Architecture and Source Boundaries

## Operating flow
Telegram authorized operational group → inbound PILOT queue → deterministic parser / optional Gemini extraction → validation → reporter review card Benar/Betulkan/Batal → approved PILOT writer → canonical Sheets/audit → status/history/retrieval in permitted PM.

Trace actual behavior in `TelegramQueueTest.js`, `TelegramWorkerTest.js`, `TelegramApprovalUiTest.js`, `TelegramHistoryTest.js`, `TelegramRecordRetrievalTest.js`, `TelegramEcHistoryTest.js`, `EnvironmentTest.js`. The conceptual map does not imply all domains have identical implementations.

## Authorities
- Code: canonical GitHub `dzuddiyn/PILOT_OPERATION`, main branch.
- PILOT data: separate PILOT_OPERATION Sheets/Drive, **not** official BSE ledgers.
- EC authority: `PILOT_EC_CANONICAL_BATCH` schema `EC_BATCH_V1`, state `COMMITTED`; preserves zero, x (NOT_MEASURED), M7P3. Legacy EC_IN index is not canonical history.
- Queue / approval / callbacks: transport/decision progress, not proof domain write.
- Access: one live bootstrap OWNER plus registry; PM registered users only get permitted OWN/GROUP_STANDARD views; `PRIVATE_SUBMISSION` is restricted. Unfinished RBAC must not infer ADMIN from `is_admin`.
- Bot and Apps Script: Script HEAD updates differ from versioned deployment; independent pull and native/live proof required.

## Record DELETE implementation assessment
Source `TelegramApprovalUiTest.js`: `bseTelegramDeleteCommand_`, `bseTelegramDeleteReceiveCommand_`, `bseTelegramDeleteConfirmationCore_`, `bseTelegramVoidInventoryRecord_`. Existing TEST route accepts owner PM, reason, D2 double confirmation, audit in `TEST_TELEGRAM_DELETE_PENDING`, and status `VOIDED_TEST`. Current allowlist: Inventory_Event_Log, Claim_Request_Log, Asset_Proposal_Log, Asset_Event_Log. **Important:** helper explicitly maps Claim_Request_Log and Asset_Proposal_Log to dedicated sheets, but other targets use inventory fallback; IT MUST inspect Asset_Event_Log routing before using. No universal operation/crop/sowing/EC delete and no business-grade proof.

## Rules for migration
Keep event identity/provenance, test vs production isolation, single authoritative record, idempotent callbacks, expected revision, restricted visibility, write/read-back validation, fail-closed partial states, and auditable corrections rather than blind hard deletion.
