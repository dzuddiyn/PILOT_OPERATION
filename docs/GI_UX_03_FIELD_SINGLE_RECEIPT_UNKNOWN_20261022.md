# GI-UX-03 FIELD — single census receipt and unknown short text

Date: 22 October 2026 MYT. Scope: PILOT_OPERATION only.

## Actual observations
- BSE-TG-772257625 was confirmed with a valid M5P3 census, but the owner saw multiple complete copies of the result. The callback path edits the original approval card, then sends a separate reporter receipt and a separate owner notice.
- Merapu received a concise "not recognized" message, while short garbage containing commas and spaces such as jshdgjsdgk,sdg isk did not. The old classifier recognized only one letters-only word and routed punctuation to the external AI fallback.

## Minimal correction
- Upon PILOT Plant_Census_Log confirmation, edit the original approval card with its canonical persisted summary AND "Pelapor : [display name]". The display name comes from existing bseTelegramReporterDisplayName_ helper or callback actor and is sanitized.
- Suppress only the **additional** reporter and owner notification sends for PILOT Census. No other domain or TEST notification behavior changes.
- Unknown short plain-text classifier supports short multiword strings with commas, spaces and light punctuation, while excluding known report words, commands, dates and plot IDs. The existing durable pending queue and fail-closed no-replay behavior is unchanged.
- Do not replay old BSE-TG-772257625, 772257626, or 772257627 messages. Field-test only with NEW messages after push.
- No changes to existing Banci figures, plot linkage rules, /claim, Draft, ADMIN, lifecycle, or official BSE writes.

## Evidence and gates
- gi_ux_03_field_single_receipt_unknown.test.cjs: 8/8 PASS by executing the actual reporter-confirmation function with controlled mock ledger and Telegram calls, checking one card update and reporter name, plus isolation of other modules.
- Full Node test suite: 95/95 PASS. JavaScript syntax: 73/73 PASS. Diff check: PASS.
- This is bounded code audit and mocked execution, not an independent Codex review. Merge, clasp HEAD readback, native Apps Script regression, and Telegram field proof are separate.
