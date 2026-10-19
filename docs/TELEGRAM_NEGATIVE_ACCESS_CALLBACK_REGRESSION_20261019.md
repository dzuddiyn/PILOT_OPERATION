# Telegram Negative Access & Callback Safety — Synthetic Regression (2026-10-19)

Scope: PILOT_OPERATION; fixture IDs only. No live Telegram, Google Sheets/Drive, approval, or farm-domain write. Source `a8370bde` on canonical main before this test branch.

## Verified in isolated Node VM
- Exact private sender/chat requirement rejects group or spoofed private context.
- History access owner / registered active allowed, unregistered and spoofed user denied.
- PRIVATE_SUBMISSION visible to original reporter or owner only; GROUP_STANDARD retains intended visibility.
- OCR access restricted to owner or original reporter; unregistered user and unrelated active user denied.
- Callback terminal error (expired) and retry-limit 5 stop without next attempt; transient failure schedules retry.
- Pending callbacks are eligible only when due; terminal callbacks never retried.
- Approval callback deduplicates by `update_id` **or** `callback_query.id`; malformed approval action rejected.
- Synthetic fixture: exactly one mock callback write; zero outbound Telegram sends; no live system writes.

New `telegram_negative_access_callback_safety.test.cjs`: 17/17 PASS. Entire 24/24 Node suites PASS; syntax + diff check PASS.

## Limitations
Mocks isolate storage/transport and owner/registration lookups, while exercising actual history, OCR, callback parsing/dedup, retry and access decision functions. These are **LOCAL PASS**, not Apps Script live permission or real non-owner field acceptance. A successful callback invocation is not evidence of farm data changes. Full parity and BSE handover remain IN PROGRESS/NOT DELIVERED. Preserve `production_write:false` and `official_bse_write:false`.
