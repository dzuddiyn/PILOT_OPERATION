# Isolated Evidence Field Proof — Preparation Contract
Date: 2026-10-19
State: PREPARED ONLY — NOT EXECUTED / FIELD PASS UNVERIFIED

## Authority and constraints
Canonical: dzuddiyn/PILOT_OPERATION main, AGENTS.md, docs/PILOT_OPERATION_EXECUTION_PATH.md and docs/EVIDENCE_WRITER_SAFETY_FIX_20261019.md. Target: shadow PILOT_OPERATION only, production_write:false, official_bse_write:false.
Do not use a real farm photograph, genuine operational report, real owner approval, or production BSE system. No real Telegram sends, Drive file writes/moves/deletes, Sheets rows, Apps Script deployments or triggers in preparation phase.
GitHub is source authority; PILOT Sheet/Drive are operational state. Existing data must never be overwritten.

## Verified baseline (read-only)
Root PILOT Evidence binding: 1PhQ_BAtqk--z43UmtE7t8Aa7dM5J5NhG.
Nested location required: 01_Source_Evidence/Evidence_Files (existing, unique child names), not root.
PILOT_FILE_EVIDENCE currently has zero data rows. Previous owner-ordered evidence removal already independently verified in prior checkpoint.
Code implementation PR #65, evidence docs PR #66: local failover 10/10, Node 27/27, Script HEAD 64/64, Apps Script 47/47 PASS as last observed. No actual media field acceptance yet.

## Isolation design
Use ONE freshly created, non-sensitive, non-farm image with prominent visible TEST_ONLY / SYNTHETIC text and a unique test-run nonce, only in a **future separately authorized field run**. Never reuse farm photographs or any prior real Telegram media.
Prepare test actor access via dedicated allowlisted account; verify private chat ID equals reporter ID and report channel is PILOT_OPERATION. Test-only callback/token and evidence_id must be unique. Do not spoof identities or issue messages as an actual reporter.
Scope any later creation strictly to the existing nested Evidence_Files folder and PILOT_FILE_EVIDENCE row with its callback audit. Never alter canonical root binding. Record pre-run counts and IDs (not secrets).

## Mandatory preflight gate before any future live action
1. Verify canonical main and clean worktree; Script HEAD hash parity, 9 helper scripts unchanged; runtime/full regression PASS.
2. Reconfirm folder parent chain, exact uniqueness and ownership, no root-level evidence file; verify nested folder is empty or enumerate and protect existing records.
3. Check Sheets Evidence, callback, image processing, OCR, domain link and audit for source collisions; snapshot metadata and row counts.
4. Confirm production_write:false and official_bse_write:false; no real farm/Gate H action. Confirm only one intended active callback path.
5. Explicitly authorize isolated end-to-end Telegram/media interaction as a separate field gate. If unavailable: STOP at PREPARED, no sends.

## Future field-proof steps — NOT EXECUTED
A. Submit one clearly TEST_ONLY non-farm image using the permitted pilot test identity. Capture message/update and file_unique_id.
B. Assert ingest generates only one OPEN Evidence record; no Drive file before human confirmation; repeat same update in controlled harness to prove dedup without new row.
C. After separately approved real test action, confirm the synthetic Evidence exactly once; monitor transition OPEN → DRIVE_CREATE_PENDING → CONFIRMED_TEST. Check callback PROCESSED and same drive_file_id in Sheets.
D. Independent Drive API read-back: one file, exact deterministic evidence+unique ID name, expected MIME/size, correct nested parent, owner and private permissions; zero files in root.
E. Replay identical callback/update after confirmation; assert no extra file or row, and stable evidence_id / drive_file_id.
F. Fault injection in isolated harness only: Drive create acknowledgment lost, Sheets save failure, multiple matching files, pending with no visible file. Never deliberately disrupt live Drive/Sheets. Verify fail-closed outcomes.
G. Validate retrieval by drive_file_id and source-to-file lineage. If OCR is included, obtain a separate explicit gated approval; no provider execution in this preparation scope.

## Failure, partial write and recovery
When results are uncertain, record WRITE_OUTCOME_UNKNOWN with exact evidence_id, file_unique_id and timestamp; freeze automatic create retry; enumerate matches in nested folder, check metadata, callback and Sheet row. Exactly one matching file may be reconciled; 0 files under pending remains BLOCKED for human-reviewed investigation; >1 or mismatched file is SOURCE_MISMATCH and must not be auto-deleted.
Rollback applies only to TEST_ONLY artifacts generated in an approved field run and identified by exact IDs. Before cleanup confirm no operational linkage and no unrelated files; remove only the test callback/Sheet row and file with explicit run-scoped cleanup authority, followed by read-back. Never bulk wipe the folder or alter prior real records. Maintain a sanitized proof log, no credentials or raw sensitive images.
If a failure occurs after file creation, prefer recover-and-verify over delete-and-retry. Never fabricate PASS.

## Acceptance criteria
- 1 test submission → 1 canonical Evidence ID → 1 private nested Drive file, verified end-to-end.
- No root evidence file; exact owner/parent, MIME/size and unique ID match.
- Duplicate update/callback does not create new file/record.
- Uncertain operation does not auto-create again and has auditable reconciliation.
- Negative unauthorized actor has no access; no official BSE changes.
- After run-scoped authorized cleanup: no TEST_ONLY file/row remains, baseline counts restored.
If any criterion unproven, label PARTIAL/UNVERIFIED, not LIVE PASS or DELIVERED.

## Current gate and next
PREPARATION COMPLETE only when this plan is reviewed, repo saved, syntax/regression checked and current Drive/Sheet metadata read back. Live field proof is a separate gate and is **not authorized by this preparation task**.
