# GI-FULL-PARITY-P3-LOCAL-REGRESSION-GAP-CLOSURE-01 — Evidence

**Decision: LOCAL PASS for the bounded synthetic checks; FULL PILOT_TEST FUNCTIONAL PARITY remains IN PROGRESS / NOT DELIVERED.**

## Source, boundaries, run

- Canonical authority: `dzuddiyn/PILOT_OPERATION` `main` at `d87d01a1cabf75f97f7db07c7c8cf5694512819a`. Same baseline as preceding P1 Draft PR #107 (`test/gi-full-parity-p1-synthetic-20261020`).
- Existing original RBAC worktree and Draft PR #106 were not modified. Dynamic RBAC/ADMIN remains **DEFERRED**.
- Actual inherited implementation modules loaded into isolated Node VM: `CropBatchReviewTest.js`, `CensusReviewTest.js`, `TransplantReviewTest.js`, `InventoryReviewTest.js`, `InputUsageReviewTest.js`, `OperationDecisionReviewTest.js`, `LeaveReviewTest.js`, `PlantConditionReviewTest.js` and `ObservationReviewTest.js`.
- New test-only runner: `pilot_full_parity_p3_reallocation_inherited.test.cjs`; synthetic IDs `TEST_ONLY`, in-memory array fixtures, actual canonical domain functions. No live operational data was written or impersonated.
- Initial runner caught one **harness** missing helper `bseCropBatchDate_`; corrected by loading canonical `CropBatchReviewTest.js` before rerun. No application function was modified or guard weakened.
- Targeted **28/28 PASS**: FP-01 11, FP-02 13, comparator/documentary 3, global 1.
- Root regression **46/46 `*.test.cjs` files exit 0**, including P1 29/29; Node syntax `--check` and `git diff --check` PASS.
- `externalCalls=0`. No network, Drive/Sheets calls, Apps Script, Telegram messages, live permission changes, OCR provider, Script HEAD update, version/deployment or official BSE action.

## Test/acceptance matrix

| Group | Concrete checks | Targeted | LOCAL result | What remains unproven |
| --- | --- | ---: | --- | --- |
| **FP-01 Reallocation** | Single approved PLANNED source, unapproved denial, multiple destinations denial, destination occupied, source ambiguity, explicit source disambiguation, ACTIVE source denial, missing crop denial, latest-state ordering, exact single-row recovery/digest/identity validation incl. duplicate/hash mismatch/absent row, exhausted daily ID sequence | 11 | **PASS** | No new genuine PILOT_OPERATION Reallocation source report, reporter Benar, domain writer live execution, or human source reconciliation |
| **FP-02 Inherited Input Usage** | Quantity/unit fail closed, duplicate candidate denial, valid conversion to INVENTORY_OUT with stable usage_source_key and production_write:false | 3 | **PASS** | Live stock balance and legacy comparator authority |
| **FP-02 Decision Approval** | Pending approver/date fabrication denied, invalid status denied, duplicate candidate rejected | 3 | **PASS** | Genuine human manager approval path |
| **FP-02 Leave / Plant Condition / Observation** | Leave missing identity/date and production flag denied; approximate +/-90% not coerced into exact dead count, invalid/no condition count denied; Observation original provenance mismatch and missing facts denied | 7 | **PASS** | Human source authority and full review/writer integration; no invented leave record |
| **FP-COMP documentary source boundaries** | Verify `BIND-LEAVE-001`, `BIND-PCOND-002`, `BIND-ASSET-GAP-001` explicitly `LEGACY_MISSING`; bound Asset evidence cannot establish purchase date/vendor/price; M1P1 missing variety remains `WAITING_INFO` | 3 | **PASS** — *DOCUMENTARY ASSERTIONS ONLY* | No runtime comparator authorization enforcement proven by these assertions |
| **GLOBAL safety** | Zero external adapter calls inside P3 runner | 1 | **PASS** | No live proof implied |

## Reuse and exclusions

- P1 synthetic scope remains 29/29 LOCAL PASS: EC/Sulam/Census, inventory/claim/asset/maintenance, OCR/media negative paths and OWNER/MEMBER visibility.
- FP-03 Evidence writer was deliberately **not retested**: existing PR #65 failover tests, Sheet callback, nested private Drive JPEG and owner retrieval are prior *scoped* proof, not new P3 claims.
- Genuine earlier PILOT_OPERATION Treatment/Transplant, history and private Evidence denial are reusable historical LIVE PASS subsets.
- RBAC Draft PR #106 is out of scope; no ADMIN role or privilege was activated.
- Canonical `docs/PILOT_TEST_DEPENDENCY_COMPARATOR_EVIDENCE.md` explicitly marks LEGACY_MISSING sources. A local source-text test does not establish a live comparator resolver or recovered original facts.
- **No acceptance promotion:** Local PASS does not close positive domain field E2E, OCR provider correctness, full ordinary-user experience or BSE corporate handover.

## Gaps and next gate

- Reallocation/Census/Sulam/EC and inherited domain PILOT_OPERATION positive flow requires **genuine owner-approved operational source** or an explicit allowed scope exception. Do not invent crop variety, deceased counts, employee leave or purchasing facts to fill the workbook.
- Real media/OCR field proof remains separately human-gated if mandatory, with a single TEST_ONLY non-farm asset and real access verification.
- Next minimum decision should be P4 classification of which still-unverified positive field criteria are **mandatory now** versus **WAITING_HUMAN_EVIDENCE / DEFERRED** under the locked PILOT scope, using the existing evidence without repeating accepted live proof.

**Exact state:** LOCAL PASS; proposed test-only Draft PR #107 update; MERGE NOT AUTHORIZED; SCRIPT HEAD UNCHANGED; LIVE PROOF NOT RUN; FULL PARITY NOT VERIFIED.
