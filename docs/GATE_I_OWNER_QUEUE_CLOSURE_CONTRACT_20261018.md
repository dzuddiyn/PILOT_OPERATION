# Gate I — Owner-directed queue closure contract (2026-10-18)

## Scope and authority
PILOT_OPERATION queue status `CLOSED_BY_OWNER` is a **terminal administrative disposition** explicitly ordered by the real project owner. It is not equivalent to `DISCARDED_BY_REPORTER` or `REPORTER_CONFIRMED`. Only original reporter Benar/Batal may use those respective statuses. The owner cannot use this status to certify a farm operation.

## Actual authorized reconciliation
The owner explicitly directed terminal closure of three previously `WAITING_INFO` queue rows:
- Update `772257157`: incomplete treatment dosage and batch match.
- Update `772257174`: old Transplant root, unsolved date/batch inconsistency.
- Update `772257175`: clarification child of `772257174`; parent_update_id remains unchanged.

The status cells were updated once in PILOT Google Sheets, with cell notes recording reason and authority. A read-back verified all three `CLOSED_BY_OWNER`, `WAITING_INFO=0`, 8 `REPORTER_CONFIRMED`, 4 `DISCARDED_BY_REPORTER`, 1 `UNSUPPORTED`. Source notes, candidate JSON, timestamps, lineage, historical approval and domain rows remain intact. Production and official BSE writes remain disabled.

## Runtime behavior contract
- Only `PILOT_OPERATION` recognizes `CLOSED_BY_OWNER` as an owner-directed terminal queue disposition.
- `CLOSED_BY_OWNER` is ineligible for incoming Telegram clarification correlation, edited-message requeue, and active waiting-info lookup. Existing worker requires `QUEUED/RETRY_NEEDED/PROCESSING` for work and `WAITING_INFO` for transplant clarification; closed rows cannot enter either path.
- Fresh unrelated Telegram updates are not blocked by a closed historical source. Parent and child closure do not create approval, evidence, or domain writes.
- `UNSUPPORTED` update `772257172` is unchanged; old failed callback `772257190` is historical evidence for already verified Transplant `772257188`, not replayed.
- Any future owner terminal closure needs an explicit owner request, precise row IDs, preflight reconciliation, recorded reason, and write → read-back validation. Do not transform this into an unrestricted bulk cleanup or automatic lifecycle transition.

## Verification requirements
1. Targeted tests: `gate_i_owner_queue_closure.test.cjs` covering terminal matching, parent-child, active waiting-info, PILOT isolation, and worker eligibility.
2. All Node suites, JavaScript syntax, diff and accidental-secret scan.
3. Independent Script HEAD source comparison preserving Gate F runtime helpers, Apps Script 47/47 regression.
4. Live read-only integrity audit and Google Sheets read-back. Do not mark corporate handover `DELIVERED` without BSE acceptance.

Overall Gate I remains TECHNICAL FREEZE CANDIDATE until runtime verification; BSE HANDOVER remains pending non-owner negative visibility, SLA agreement, questionnaire and sign-off.
