# GI-UX-08 — /claim monthly INVENTORY_CLAIM evidence

**Owner correction, 22 October 2026.** Keep `/claim` simple: show only the original message (`caption`) for each confirmed `INVENTORY_CLAIM` received in the requested month, plus the stored image filename and Google Drive file-view link if there is an image. Do not send files/photos, expose raw file IDs or evidence IDs, or add per-record date, amount, status, sender, category, or totals. Standard header for the month and an empty-result message remain.

## Source and boundary

- Query `PILOT_FILE_EVIDENCE` through existing TEST-to-PILOT runtime sheet mapping; no more reliance on the separate `PILOT_CLAIM_LOG` for this view.
- Month filtering uses evidence `received_at` in Malaysia timezone (the month of the submitted message), not claim ledger `event_date`. Only status accepted by existing confirmed-evidence resolver.
- Preserve existing `/claim` PM-only numeric Telegram identity + registered-active own-scope, owner matching guard, audit metadata, and no group reply. Keep only restricted/private inventory evidence records; reject ambiguous confirmed rows.
- Image name from `file_name`; Drive link derived from validated stored `drive_file_id` only. A link does not change Google Drive sharing permissions; access remains subject to original Drive permissions.
- Other Telegram commands, evidence confirmation writer, Drive content, runtime roles, permissions and official BSE data untouched.

## Verification boundary

- New synthetic cases: original text and image link, no extra metadata or image send, own/owner access, no group response, full calendar month aliases, MYT rollover, unconfirmed category denied, malformed/missing evidence blocked, no fallback to general claims ledger.
- Local Node, syntax and diff checks before PR. Independent review and source PR merge are distinct from Apps Script Script HEAD sync and real Telegram proof.
- `production_write:false`, `official_bse_write:false`; no deployment/version and no evidence writer activation.
