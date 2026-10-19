# GI-ADMIN-RBAC-M3-LEGACY-CONTROLLER-WIRING-01 — scoped candidate source evidence

**STATE: SOURCE INTEGRATION PARTIAL / LOCAL PASS / RUNTIME NOT WIRED / NOT ACCEPTED.** Work is only on Draft PR #106. No merge or deployment.

## Inspected authorities

- Canonical code: `dzuddiyn/PILOT_OPERATION` branch `main` at `d87d01a1cabf75f97f7db07c7c8cf5694512819a`.
- Source instructions: `AGENTS.md`, architecture and pilot execution path; RBAC Option B and transaction contract v0.2. Git feature branch includes candidate M1-M3 modules and 19-path mapping.
- Branch inspected clean before changes. No Script HEAD/runtime access or live mutation attempted.

## Source changes

- New `PilotRoleLegacyControllerBridge.js` calls a **not-yet-implemented trusted Apps Script binding** `bseRoleTrustedAdaptersForBook_(book)`. If missing/unverified, capability and elevated-role decisions DENY; **no owner.ok fallback**.
- Source guarded in **eight controller files**:
  - `TelegramApprovalUiTest.js`: server-side approval callback, /delete and **all four definitions** of approval card creation.
  - `TelegramRegistrationTest.js`: registration callback, private-access role projection and registration start. The latter two require explicit OWNER/ADMIN role before using OWNER_ACTIVE; MEMBER stays REGISTERED_ACTIVE.
  - `TelegramHistoryTest.js`: elevated history path; MEMBER retains separate visibility checks.
  - `TelegramReportTest.js`: report requires canonical role; unused legacy owner lookup removed.
  - `TelegramRecordRetrievalTest.js`, `TelegramRetrievalTest.js`, `EvidenceOcrTest.js`: elevated disclosure gated through canonical role, reporter/category visibility checked separately.
  - `PilotOperationGateH.js`: bootstrap-only owner readiness role gate.
- Existing ordinary/member controllers not rewritten indiscriminately, preventing ordinary registration from becoming ADMIN. Earlier inventory continues to cover 19 paths, but **19/19 live wiring is NOT claimed**.
- Existing three synthetic tests updated to load real resolver/bridge with synthetic trusted adapters; checks retain negative/functional assertions. New `pilot_role_m3_legacy_controller_wiring.test.cjs` executes actual controller functions under local VM.

## Targeted findings

- 11/11 local controller tests: all four approval-card definitions gated; forged legacy owner.ok cannot elevate MEMBER; OWNER/ADMIN may access historical/report views; read outage denies; registration callback, approval card and /delete forged member denied before privileged write; ADMIN cannot manage ADMIN or mutate OWNER.
- Existing Gate H tests 31/31, retrieval tests 5/5 and negative access tests 17/17 restored using canonical synthetic adapters; no tests were disabled.
- Final full root Node regression: **58/58 test files exit code 0**; targeted real controller tests **11/11 LOCAL PASS**; source inventory mapping **10/10 LOCAL PASS**. Node syntax checks passed for changed modules. These checks are local only. The inventory test was updated to recognize both legacy lookup calls and new canonical capability/elevated bridge calls while retaining detection of unmapped functions.

## Security blockers

1. **Critical:** `bseRoleTrustedAdaptersForBook_` has **no live Apps Script implementation**. Since the bridge is fail closed, merging/deploying controller changes before actual trusted binding could disrupt existing legitimate OWNER operations. Do not merge this Draft PR.
2. Approval and /delete retain existing owner-record metadata and record-ownership conditions, so a newly ledger-appointed ADMIN without compatible derived owner projection may still be unable to perform every promised operational action. Do not relax row/intent binding without verified provenance design.
3. Callback/approval metadata still pins the original legacy owner record; and ApprovalEnsureCard group-origin behavior may be overly restrictive after canonical role enforcement. Requires dedicated end-to-end controlled fixtures (including legitimate group actions and ADMIN approval) before declaring functional parity. Effective permission must also be rechecked immediately before each side effect. Site gates at entry are necessary but not sufficient for asynchronous transitions/worker actions.
4. Mixed reporter/category authorization has separate rules. A generic role allow must not bypass PRIVATE_SUBMISSION restrictions for a MEMBER.
5. Revocation barrier consistency, outbox exactly-once transport, Apps Script LockService/Sheets durability, live callback authenticity, and independent F01-F29 acceptance remain unproven.

**NO LIVE STATE CHANGES:** no Apps Script push, Google Sheet writes, Telegram message, role mutation, migration, PR merge or deployment. FULL PILOT_TEST FUNCTIONAL PARITY: IN PROGRESS — NOT DELIVERED.
