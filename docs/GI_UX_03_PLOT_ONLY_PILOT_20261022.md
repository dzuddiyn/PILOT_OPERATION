# GI-UX-03 — PILOT Census plot-first without batch input

Owner correction: For Banci, only explicit date and module/plot are required from the user. Mati, Sakit and Tanaman are optional. Absent counts are zero. Batch is never supplied by the user and is not a precondition for accepting a PILOT census.

## Plot-only record contract
- Banci uses its own TEST_PLANT_CENSUS log. For a verified reporter-approved PILOT census, it may store plot/date/counts with empty batch_id and allocation_id. Those empty identifiers are **not invented** or automatically registered as a batch.
- When a unique ACTIVE crop matching plot and report date exists, infer the canonical crop and retain its internal batch/allocation link. If no ACTIVE crop is known, keep crop blank and display "Tanaman : Tidak direkodkan". If an explicit crop conflicts with a unique ACTIVE crop, mark NEED_INFO, never overwrite the reported crop silently.
- The legacy non-PILOT unique-active association requirement remains unchanged. All other domain writers, sowing, plot allocation, operation lifecycle and official BSE workbook are unchanged.
- Existing human confirmation, source-key/hash idempotency, queue status and feedback remain mandatory before the census log write. No automatic historical replay or backfill.
- Read-back must distinguish zeros from blanks. Fixed audit equality for reported_dead_count and reported_sick_count using nullish handling rather than falsy fallback.

## Verification
- gi_ux_03_plot_only.test.cjs 10/10 PASS: missing crop ACTIVE and no ACTIVE, explicit crop conflict, zero counts, date/plot, no batch fabrication, source proposal, plot-only idempotent read-back and non-PILOT boundary.
- Full Node regression 94/94 PASS; JS syntax 73/73 PASS and diff checks PASS before PR.
- Separate GitHub merge, Script HEAD readback, native Apps Script regression and live Telegram field test required for completion.
- Not a permission to create missing crop batches or change operational lifecycle.
