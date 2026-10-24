# GI — Friendly Retrieve and Analytical Report (2026-10-24)

## Purpose
Improve PILOT_OPERATION Telegram `/retrieve` readability and change `/report` from history-like listing to summarized canonical operational insights, with a conditional Gemini interpretation.

## User-visible behavior
- `/retrieve BSE-TG-NNN` keeps existing authorization, hash verification and audit, but presents crop/date/plots/status in plain Malay. Multiple plots are combined. Internal `*_Log` names no longer appear in the return card.
- `/report` defaults to current month in Malaysia local time.
- Supported month/date examples: `/report Okt 2026`, `/report Oct 2026`, `/report Oktober 2026`, `/report 2026-10`, `/report 10/2026`, `/report 24/10/2026`, `/report 2026-10-24`, `/report 24 Okt 2026`.
- Aggregates confirmed canonical event count, active dates, categories, crop, plot and activity types, deduplicated by reference/date/category. No raw history list is emitted.
- Gemini receives controlled aggregates and capped samples of **non-private** events. Private submissions contribute structured crop/plot/activity counts but not private textual summaries. Its forecast is explicitly conditional/indicative, and there is a truthful fallback when AI is unavailable or canonical data is absent.
- OWNER PM-only report boundary, existing /retrieve visibility, and `production_write:false` remain unchanged.

## Tests and evidence
- `node gi_retrieve_report_ux.test.cjs`: 6/6 PASS.
- `node --check`: edited JavaScript PASS.
- Targeted menu, access and claims tests PASS.
- Whole tracked `*.test.cjs` regression: **156/156 test files PASS**.
- `git diff --check`: PASS.
- No Apps Script update, version, deployment, Telegram SEND or real-sheet data write performed.

## Unverified before operational acceptance
- Native Apps Script head/module loading and actual Gemini API response formatting.
- Pilot Telegram PM UX for authorized retrieve, monthly report, daily report and Gemini unavailable response.
- Business-grade forecasts require historical cycle data, adequate crop-stage measurements and model validation; no specific harvest-date/yield guarantee is inferred.
- Full universal DELETE and OWNER transfer are explicitly **out of scope**.

## Gate
Feature-branch PR only. No merge/deployment without canonical repo approval gates. Stop on source mismatch, missing privacy controls, or unsupported AI assumptions.
