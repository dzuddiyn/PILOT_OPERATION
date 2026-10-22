# GI-UX-04 FIELD-02 — Baja shorthand, flexible date and order

**Owner correction:** 23 October 2026 MYT. Scope: BSE OpsMate PILOT_OPERATION Baja Masuk/Keluar parser only; does not alter the prior owner-locked per-field contract.

## Field observations and defect
Telegram field examples showed that:
- Baja out + Tarikh: 23/10/2026 + Plot: M5P34 + N was incorrectly routed to the old inventory parser, which sometimes produced inaccurate item types and multiple separate approval envelopes.
- Baja Keluar / 23/10/26 / M5P3 F failed to recognize the two-digit year and inline plot/type.
- Baja out 23/10/26 M5P3 F, Baja out M5P3 F 23/10/26 and Baja out F 23/10/26 M5P3 were not parsed reliably.
- Previously sent incorrect cards must remain as history and are NOT replayed, deleted, migrated or reprocessed.

The prior dedicated parser accepted only the exact full-line Baja Masuk/Keluar heading, YYYY-MM-DD or DD/MM/YYYY, and separately labeled plot/date/item lines. Unrecognized shorthand fell through to the legacy inventory/Gemini route.

## Minimal fix
- Rename old strict parser to bsePilotBajaParseCanonical_ and wrap it with bsePilotBajaParse_, which recognizes Baja keluar/out or Baja masuk/in with full multiline, shorthand inline, or mixed order.
- Extract exactly one explicit date and one or more explicit plot identifiers from anywhere after the heading, without assigning them to wrong fields. Normalize to the existing strict canonical parser, then apply its existing 1-set-per-plot outgoing and explicit-quantity incoming rules, multi-type group validation, Batal-only incomplete handling, and same-confirmation callback. No new writer or UI route.
- Accepted date formats: DD/MM/YY, DD/MM/YYYY, DD-MM-YY, DD.MM.YYYY, YYYY-MM-DD, DD Month YYYY and DD Month YY (Malay/English full and common abbreviations, e.g. 23 Okt 26, 23 Oktober 2026, 23 Oct 2026, 10 Ogos 2026). Two-digit years are interpreted as 20YY. An explicit year is required; dates without year, impossible dates, multiple dates and unknown trailing tokens fail closed with incomplete report.
- F/N etc are type codes; no type, no plot for OUT, no explicit quantity for IN, extra nonsensical tokens or duplicate types must prevent Benar. A recognized Baja prefix always returns one proposal (PASS or NEED_INFO); **never** falls through to old multi-candidate inventory/Gemini route.
- The original user message remains the audit original_note; normalization cannot rewrite history or change the prior reporter identity.
- Unrelated reports, /claim, Banci, ADMIN, lifecycle, and official BSE production data remain untouched.

## Test evidence
- gi_ux_04_flexible_field.test.cjs: 27/27 PASS, including six owner field permutations, named/short/ISO dates, multi-type/multi-plot, malformed/ambiguous dates, no fallback, no false hijack, and no pre-confirmation write.
- gi_ux_04_baja_owner_contract.test.cjs: existing 17/17 PASS using the flexible wrapper.
- Entire local Node suite: 97/97 PASS; JS syntax: 76/76 PASS; git diff --check PASS.
- GitHub PR review and merge, controlled Apps Script HEAD synchronization/readback, actual native regression and owner Telegram field test are separate gates. Independent Codex verdict is not claimed.
