# GI-FULL-PARITY-P1-SYNTHETIC-COVERAGE-01 — Consolidated Negative & Recovery Matrix

**Scope:** PILOT_OPERATION, canonical `main` baseline `d87d01a1cabf75f97f7db07c7c8cf5694512819a`, isolated worktree / branch `test/gi-full-parity-p1-synthetic-20261020`.
**Overall verdict:** **LOCAL PASS / FULL PARITY PARTIAL / NO LIVE PROOF DURING THIS TASK**.
**RBAC / dynamic ADMIN:** `DEFERRED_BY_LOCKED_SCOPE`; Draft PR #106 explicitly excluded from tests, unchanged.
**Write boundaries:** zero live Telegram sends, Apps Script calls, Google Sheets/Drive mutations, Gemini/OCR API calls, permission activation, merge or deployment.

## Source and execution authority

- Source of truth: `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/PILOT_OPERATION_EXECUTION_PATH.md`, `ACTION_PLAN.md`, `docs/SHADOW_PILOT_MVP_HANDOVER.md`, current GitHub main.
- The original RBAC feature worktree was CLEAN and left untouched; new worktree created directly from remote-tracking canonical main. No existing user work was discarded.
- New runner: `pilot_full_parity_p1_negative_recovery.test.cjs`. Loads **actual inherited domain functions** through sandboxed Node VM, injects in-memory TEST_ONLY scenarios and mock transport. Tests use synthetic identifiers; there are no real farm facts or external endpoints.
- Targeted **29/29 assertions PASS** (FP-01 8; FP-02 8; FP-04 6; FP-05 6; global transport boundary 1).
- Full root Node `*.test.cjs` regression: **45/45 files exit code zero**. `node --check` new test and `git diff --check`: PASS.
- The runner reported `realTransportSends:0`, `providerCalls:0`, `writes:0`. Three allowed simulated SENDs were captured in an in-memory fake sink only (owner/reporter/GROUP_STANDARD test).
- **No fresh Apps Script 47/47** or live Script HEAD checksum check was attempted or claimed. Historical runtime evidence must be evaluated separately.

## Consolidated acceptance matrix

| Gap | Actual-function synthetic tests | Verdict for THIS test task | Remaining full-parity acceptance |
|---|---|---|---|
| **FP-01 operational domains** | 8/8 PASS: EC missing session/duplicate scope denial, AK_ZERO and NOT_MEASURED semantics, Sulam zero count/production-flag rejection, non-Benar blocks review before write, Census missing count/no fabricated quantity, distinct contradictory reported living counts preserved | **LOCAL PASS** | **PARTIAL**: positive PILOT_OPERATION reallocation/census/sulam/EC E2E not demonstrated by these assertions; no new real operational report permitted |
| **FP-02 inventory/claim/legacy domains** | 8/8 PASS: claim identity/amount, valid candidate amount, Asset duplicate/conflicting source reconciliation and NEW classification, review hash conflict; Maintenance missing asset/date and production-flag reject | **LOCAL PASS** | **PARTIAL**: inherited domain record handling and real comparator/provenance not fully accepted; `LEGACY_MISSING` must remain honest |
| **FP-03 Evidence writer** | **REUSE ONLY** prior PR #65 10/10 fault tests and scoped live existing Evidence JPEG/callback/Drive readback from preceding P0 preflight | **REUSED VERIFIED EVIDENCE (no rerun)** | **PARTIAL** for exhaustive failover under live timing; do not run unsafe live duplicate/create fault |
| **FP-04 Media/OCR** | 6/6 PASS: unrelated user / non-private access denial, unconfirmed and non-image denial before OCR, malformed OCR command denial, no sheet/provider/transport calls | **LOCAL PASS** | **BLOCKED FOR LIVE ACCEPTANCE pending explicit separate field authorization** and genuine provider/Telegram UX proof; not a code failure |
| **FP-05 OWNER/MEMBER visibility** | 6/6 PASS: unrelated MEMBER private-deny (audit reason), inactive reporter denied, unconfirmed GROUP_STANDARD denied, registered GROUP_STANDARD positive mocked send, OWNER/reporter private positive mocked send, malformed retrieval denied | **LOCAL PASS** | **PARTIAL** complete access matrix; reuse prior genuine registered-member and private Evidence negative live proof; do not repeat unnecessarily |
| **Safety global** | 1/1 PASS: no real network/Sheets writes; 3 mock sends; no external provider calls | **LOCAL PASS** | No live-system inference |

## Test boundaries and stop gates

1. The scenario runner is a regression check of real functions **with injected dependencies**, not a new authenticated Telegram test session. Never promote these 29 checks to full field acceptance.
2. Metadata vs real identity: mock evidence `BSE-EV-TESTONLY123`, TEST_ONLY strings and synthetic actor IDs have no authority over BSE operational records.
3. EC and Plant Replacement validator acceptance does NOT prove a human approved an operation or a farm action occurred.
4. Mock `bseTelegramApi_` records simulated sends and never contacts Telegram. OCR provider is forbidden; actual OCR correctness is not established.
5. Existing live Proof: real MEMBER `/status`, `/summary`, `/history` and private Evidence denial, prior owner Evidence retrieval, and single private nested Evidence file remain scoped evidence, not re-executed.
6. Dynamic RBAC/ADMIN development is DEFERRED. No new role or permission is enabled.
7. **Human gate**: genuine domain positive write requires an authorized factual PILOT report and human Benar; media/OCR field proof requires separately approved TEST_ONLY Telegram interaction. Do not invent these to turn PARTIAL green.

## Minimal continuation after this LOCAL PASS

First, read-only reconcile remaining actual PILOT_OPERATION data/source proof and isolate missing domain acceptance by requirement; then prepare a **single narrowly scoped human field gate** only for a mandatory case without prior proof. Keep the source work isolated from official BSE; do not open PR #106 for this task.

**Status:** `FULL PILOT_TEST FUNCTIONAL PARITY: IN PROGRESS — NOT DELIVERED`. `RBAC / ADMIN: DEFERRED`.
