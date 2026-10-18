# Gate I — PILOT_OPERATION data dictionary and reconciliation

**Date:** 2026-10-18 MYT
**Scope:** Selected active PILOT_OPERATION tables observed in owner workbook; not a complete schema for deferred modules.
**Source authority:** `EnvironmentTest.js` maps the logical `TEST_*` script names into `PILOT_*` workbook tabs via `bseRuntimeBook_`; the canonical source is `dzuddiyn/PILOT_OPERATION`.
**Write boundary:** PILOT spreadsheet and private PILOT Evidence Drive only; no official BSE write.

## Operational table map
| PILOT tab | Primary role | Join/provenance and important fields |
| --- | --- | --- |
| PILOT_OWNER_REGISTRY | Current authorized owner/admin contacts | `owner_id`, `telegram_user_id`, `private_chat_id`, `is_active`, `is_admin`; no Google Tasks dependency |
| PILOT_TELEGRAM_QUEUE | Message transport/processing | `update_id`, `chat_id`, `user_id`, `original_note`, `received_at`, `status`, `candidate_json` |
| PILOT_TELEGRAM_APPROVAL_UI | User review card and decision | `reference`, `source_key`, `reporter_telegram_user_id`, `decision_status`, `decision_hash` |
| PILOT_TELEGRAM_APPROVAL_CALLBACK_PENDING | Callback retry/dedup history | `update_id`, `callback_id`, `callback_token`, `action`, `status`, `processed_at` |
| PILOT_CROP_BATCH | Approved PILOT crop batch domain | `source_key`, `queue_update_id`, `batch_id`, `crop`, `variety`, `event_date`, `verification_status` |
| PILOT_PLANTING_EVENT | Sowing/planting lineage | `source_key`, `queue_update_id`, `batch_id`, `planting_event_id`, `event_type`, `event_date` |
| PILOT_PLOT_ALLOCATION | Crop batch plot links | `source_key`, `queue_update_id`, `batch_id`, `allocation_id`, `plot_id`, `allocation_status` |
| PILOT_FILE_EVIDENCE | Evidence metadata; canonical file is in PILOT Drive | `reference`, `source`, `status`, file identity; inspect exact current headers before mutation |
| PILOT_TELEGRAM_RETRIEVAL_AUDIT | File evidence retrieval | `requested_at`, `reference`, outcome, method |
| PILOT_TELEGRAM_RECORD_RETRIEVAL_AUDIT | Canonical record PM retrieval | Reference, requester, outcome, reason |
| PILOT_DAILY_DIGEST_AUDIT | Owner-only daily send ledger | `digest_date`, `owner_id`, `private_chat_id`, `status`, `message_id`, `last_error`, `production_write` |
| PILOT_FRIDAY_WEEKLY_DIGEST_AUDIT | Owner-only Friday weekly send ledger | `week_start`, `week_end`, `private_chat_id`, `status`, `matched_count`, `message_id`, `gemini_status`, `production_write` |
| PILOT_DAILY_DIGEST_CONFIG_AUDIT and PILOT_FRIDAY_WEEKLY_DIGEST_CONFIG_AUDIT | Scheduler setup history | `configured_at`, `environment`, `enabled`, `time_myt`, `next_run_utc`, `trigger_uid` |

## Source-key audit rules
- For one Telegram message, `update_id` is unique within `PILOT_TELEGRAM_QUEUE` and `PILOT_TELEGRAM_APPROVAL_CALLBACK_PENDING` for its own update identity.
- Verify `source_key` unique **inside single-record domain tables** after excluding documented terminal discarded/voided records.
- `PILOT_PLOT_ALLOCATION` can legitimately contain multiple rows sharing a message source_key when one crop batch links to different plots; distinguish by `allocation_id`/plot. This is not a duplicate domain write without further evidence.
- Never assume identical IDs across different domain tabs indicate duplicate processing; cross-table links can share provenance intentionally.
- Audit closed status for approval UI and pending callback queue. Any `OPEN`, `PENDING`, `FAILED` or `OUTCOME_UNKNOWN` requires explicit reconciliation.
- For digest, de-duplicate daily by `digest_date+private_chat_id`, Friday by `week_start+week_end+private_chat_id`; `SENDING` and `OUTCOME_UNKNOWN` require evidence before retransmission.
- Verify a `SENT` response includes a Telegram `message_id` and matches the actual private chat.
- Compare `production_write`/official boundary independently through runtime bindings and audit, not only hard-coded source literals.

## Sample daily reconciliation record (blank)
| Report period | Telegram reference/update | PILOT source/domain row | Existing manual BSE record | Verdict | Incident/ticket |
| --- | --- | --- | --- | --- | --- |
| [date] | [real reference] | [verified PILOT row] | [manual record or LEGACY_MISSING] | [MATCHED / other permitted verdict] | [if needed] |

**Important:** This data dictionary is a deployment-specific operating aid, not migration authority or a second canonical database/schema.
