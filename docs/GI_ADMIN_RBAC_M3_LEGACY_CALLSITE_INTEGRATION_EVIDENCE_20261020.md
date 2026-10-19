# GI-ADMIN-RBAC-M3-LEGACY-CALLSITE-INTEGRATION-01 — isolated mapping & acceptance evidence

**STATE: LOCAL PASS (mapping and injected capability adapter); RUNTIME INTEGRATION NOT STARTED; FULL M3 ACCEPTANCE BLOCKED.**

## Source inspection

- Canonical: `dzuddiyn/PILOT_OPERATION` default `main` at `d87d01a1cabf75f97f7db07c7c8cf5694512819a`.
- Candidate: Draft PR #106, `feat/gi-rbac-m3-transaction-20261019`, no runtime binding, no merge.
- Inspected actual `*.js` functions using `bseTestOwnerForTelegramUser_` or `bseTelegramRegistrationPrivateAccess_`; excluded definition and harness-only references.
- **19 distinct authorization functions across 14 source files** mapped in `PilotRoleLegacyCallsiteAdapter.js`. TEST source scan in `pilot_role_m3_legacy_callsites.test.cjs` rejects newly discovered unmapped paths and stale map entries.

## Capability inventory

| Policy group | Source function(s) | Contract |
| --- | --- | --- |
| Restricted retrieval (mixed) | `EvidenceOcrTest.js:bseEvidenceOcrAccess_`, `TelegramRecordRetrievalTest.js:bseTelegramRecordRetrieve_`, `TelegramRetrievalTest.js:bseTelegramEvidenceRetrieve_` | OWNER/ADMIN elevated visibility; MEMBER reporter/category checks remain separate |
| Restricted history (mixed) | `TelegramHistoryTest.js:bseTelegramHistoryAccess_` | OWNER/ADMIN elevated history; member visibility separately enforced |
| Restricted history (elevated) | `TelegramReportTest.js:bseTelegramReportRetrieve_` | OWNER/ADMIN only |
| Approval | `TelegramApprovalUiTest.js:bseTelegramApprovalEnsureCard_`, `TelegramApprovalUiTest.js:bseTelegramApprovalControllerCore_` | OWNER/ADMIN approved operational actions, caller-specific actor/chat identity |
| Delete | `TelegramApprovalUiTest.js:bseTelegramDeleteReceiveCommand_` | OWNER/ADMIN, prior confirmation rules still apply |
| Registration decision | `TelegramRegistrationTest.js:bseTelegramRegistrationCallback_` | OWNER/ADMIN operational registration decisions; **not role appointment** |
| Bootstrap-only runtime readiness | `PilotOperationGateH.js:bsePilotGateHReadiness_` | immutable OWNER only |
| Ordinary/member paths | `ImageActionTest.js:bseImageActionReceive_`, `ImageProcessingTest.js:bseImageProcessingReceive_`, `TelegramAiTest.js:bseTelegramAiAccessAllowed_`, `TelegramEvidenceTest.js:bseTelegramEvidenceReceiveMessage_`, `TelegramEvidenceTest.js:bseTelegramEvidenceReceiveMessageCore_`, `TelegramPlotStatusTest.js:bseTelegramPlotStatusRetrieve_`, `TelegramQueueTest.js:receiveBseTelegramTest`, `TelegramRegistrationTest.js:bseTelegramRegistrationPrivateAccess_`, `TelegramRegistrationTest.js:bseTelegramRegistrationHandleStart_` | ordinary registration/private/chat policies, no elevation via legacy `owner.ok` |

**Do not reinterpret the mapping as deployment authorization.** These are proposed enforcement points, not altered operational controllers.

## Tests

- `pilot_role_m3_legacy_callsites.test.cjs`: **10/10 LOCAL PASS**. Real source-scan inventory match; ADMIN operational privileges for all mapped non-bootstrap sites; OWNER bootstrap privileges; MEMBER ordinary-only; ADMIN cannot manage admins/mutate owner; stale/corrupted ledger, revoke barrier and inactive registration deny; private-chat and caller provenance gates; missing/unknown adapters fail closed.
- Full root `*.test.cjs` regression **57/57 test files exit code zero**.
- `node --check` adapter/test PASS; `git diff --check` PASS. These checks validate local Node execution only.
- Test fixture IDs are synthetic; no personal or real operational records used.

## Outstanding mandatory gates

1. Actual controller authorization call-sites still call legacy owner lookup and `OWNER_ACTIVE`; no Apps Script runtime binding or controller rewiring. A real server-side bypass is still possible until all relevant paths use canonical `bseRoleResolve_` immediately before privileged side effects.
2. Mixed-access sites require record-specific reporter/classification checks; `RECORD_VISIBILITY_REQUIRED` in the adapter intentionally avoids pretending a generic role decision settles MEMBER visibility.
3. Owner identity pin and sourceAuthenticated are injected assumptions, not authentic Telegram provenance proof. Registration statuses and role-capability decisions must not substitute for each other.
4. Durable ledger/barrier coherence, PREPARED reconciliation, stale cache invalidation and actual Sheets/Apps Script behavior remain unverified.
5. F01–F29 full contract acceptance NOT PASS; PR #106 remains DRAFT with no merge, Script HEAD update, role/permission mutation or deployment.

**DECISION:** Adapter + isolated tests LOCAL PASS; overall `GI-ADMIN-RBAC-M3-LEGACY-CALLSITE-INTEGRATION-01` **PARTIAL** (runtime controllers not integrated). Do not mark LIVE PASS, MERGED or DELIVERED.
