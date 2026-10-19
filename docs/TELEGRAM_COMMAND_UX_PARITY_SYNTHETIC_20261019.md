# Telegram Command & UX Functional Parity — Synthetic Regression (2026-10-19)

## Contract and scope
Canonical `dzuddiyn/PILOT_OPERATION` (GitHub), inherited functions from PILOT_TEST. This round is **synthetic, zero-transport, zero-domain-write**. No real Telegram message, user Benar/Batal, photo upload, OCR call or deletion performed. It is not a live/field parity certificate.

## Command and UX matrix
| Path | Evidence | State |
| --- | --- | --- |
| `/start` exact bot/private registration | `gate_i_pilot_native_start.test.cjs` plus existing Apps Script regression | LOCAL PASS; negative-user field proof pending |
| Text receiver, ACK and queue | `gate_i_pilot_presentation.test.cjs`, receiver/overlap regressions, actual prior pilot flow | LOCAL PASS, selected historical LIVE PASS |
| `/history` day/month/week input | `telegram_command_ux_parity.test.cjs` plus source history tests | LOCAL PASS; real corrected date/history reconciliation pending |
| `/ec_history` month/day translation | New focused tests; `TelegramEcHistoryTest.js` | LOCAL PASS parser; EC real records/visibility pending |
| `/ocr` extract/confirm/discard | Focused parser tests; `EvidenceOcrTest.js` access guard | LOCAL PASS parser; real OCR + authorization field proof pending |
| `/image_to_text`, `/image_analysis` | Explicit caption routing, optional mention, bounded instruction | LOCAL PASS parser; actual media/Gemini callback pending |
| `/delete BSE-TG-ID reason` | Strict ID/reason parser negative cases | LOCAL PASS parser; destructive handler **NOT RUN** |
| Benar/Betulkan/Batal callbacks | Existing callback/approval regression suites and prior live pilot cases | LOCAL PASS; each domain subtype/non-owner negative proof pending |
| Reminder, photo, file, failure and retry UI | Existing presentation/harness suites only | PARTIAL; exhaustive outbound/callback field matrix pending |
| PILOT legacy TEST text normalization | UX presentation tests, unchanged reporter source notes | LOCAL PASS; full outbound sink audit pending |
| Daily & Friday Telegram digests | Apps Script runtime 47/47 full regression prior, scheduler inspector earlier | PARTIAL; recurring delivery and updated Daily field evidence pending |

## Reproduction / tests
New `telegram_command_ux_parity.test.cjs` exercises 16 isolated assertions against real project JS implementations loaded in Node VM. No mocks of Telegram transport, Sheets writes or physical farm activity are interpreted as live evidence. Full 23/23 Node test suites PASS (including the new suite); Node syntax and `git diff --check` PASS.

## Residual risks and boundaries
- Do not claim end-to-end full parity until real, permissioned, non-owner negative visibility and domain-specific writes/retrieval have been verified with genuine reports.
- Source `TEST` names retained internally where mapping is intentional. Any user-visible fallback/error message still requires broader sink coverage.
- `/delete` handler must not be executed on live PILOT records without explicit deletion authority; only parser tested here.
- Full functional parity remains IN PROGRESS / NOT DELIVERED; `production_write:false`, `official_bse_write:false`.
