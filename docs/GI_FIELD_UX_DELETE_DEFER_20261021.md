# GI-FIELD-UX DELETE — OWNER DEFER DECISION (2026-10-21)

Owner direction: save current delete work, DEFER further work on individual /delete, and continue other independent BSE OpsMate field UX features.

- Delete development steps 05–17 and locked design 15A remain retained as evidence in draft PR #155; do not delete/reset history or mark as delivered.
- Exact-source-key selection and synthetic transaction/recovery tests are LOCAL PASS only; real provenance, durable Sheets recovery, Script binding, live proof and atomic individual void remain UNVERIFIED.
- Do not advance 17A or any subsequent delete gate until owner explicitly resumes that feature.
- Do not merge/deploy delete-related changes, activate the new selector or execute any real void.
- Legacy delete path safety must be reviewed separately before any runtime release. Existing deployed bot behavior is not changed by this defer.
- Continue non-delete Field UX items independently: Baja In/Out parser and clarification guidance, and dated census resolution.
- PR #155 stays Draft / unmerged, containing mixed delete and unrelated UX work. Create a separate clean feature branch/PR from canonical main for independently testable non-delete changes; do not merge either without separate authorization.
- GitHub SoT is source authority; PILOT_OPERATION Sheets remain operational authority; official BSE write is prohibited.

States: DELETE=DEFERRED/NOT DELIVERED; NON_DELETE_UX=READY_FOR_INDEPENDENT_ISOLATION.
