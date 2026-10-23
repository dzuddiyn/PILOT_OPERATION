# CL-H07 Unified Plot Status and Scoped Baja Intake

Date: 2026-10-24. Source of truth: dzuddiyn/PILOT_OPERATION, branch fix/cl-h07-unified-status-baja-patterns.

## Approved changes
- /status is primary read-only PM command for 1-6 distinct plots. /summary remains a backward-compatible alias for multi-plot requests.
- Explicit compact shorthand MxP12 / MxP123 / MxP1234 splits into separate single-digit plot identifiers, e.g. M3P1234 => M3P1,M3P2,M3P3,M3P4. Bounded to six plots overall. Exact canonical forms, separated P tokens, comma pairs, ampersands and mixed modules supported; duplicates, invalid tokens and >6 plots fail closed.
- Retain private-chat registration and operational approved-TEST read-only retrieval with existing audit; no official production data writes.
- Recognize Baja Out source grouped per module/type, e.g. M3 P3 P4 - F and M2 P3 P4 - N. Persist only the four explicitly scoped one-set items; never cross-multiply F/N across unrelated modules.
- Recognize Baja In '1 Set baja - N' as explicit N quantity 1.
- Scoped Baja emits baja_scoped_group=true and uses per-item destination in lineage. Legacy non-scoped proposals use the previous overall destination and hash, preserving existing ledger source-key/idempotency behavior.
- Preserve exact type+plot duplicate rejection, quantity validation, source-text validation and explicit date requirement.

## Local proof
- Grouped Baja parser: F M3P3/M3P4 and N M2P3/M2P4; combined validator PASS and synthetic 4-row ledger write; repeat APPROVED is idempotent.
- Malformed grouped line and duplicate type+plot never PASS; Baja In 1 Set baja - N parses.
- Unified status 21/21 assertions PASS including M3P123 and M3P1234, six-plot bound, legacy /summary alias and invalid/duplicate rejection.
- Full Node tests: 272/272 PASS (local).
- No live Telegram tests or Script HEAD changes at time of this evidence draft. Historical BSE-TG-772258064 remains confirmed; 772258078 / 772258080 remain incomplete and were NOT replayed.

## Required closure
PR review and merge, Apps Script HEAD sync preserving runtime-only GateF helpers, independent hash pull/read-back, native synthetic guard, and fresh Telegram /status and Baja tests.
