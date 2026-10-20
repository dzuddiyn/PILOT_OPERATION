# OpsMate BSE PILOT_OPERATION — Gate I Handover Candidate

**Date:** 20 Oct 2026
**Status:** HANDOVER PREPARED — NOT DELIVERED
**Environment:** PILOT_OPERATION shadow pilot only

## What is verified

- GitHub PR #117/#118/#119 merged into canonical main; source matched independently to Apps Script HEAD (65/65 shared files, 74 runtime, nine preserved runtime-only helpers).
- Local Node final regression 54/54 suites PASS.
- A **single genuine** user-confirmed Transplant operation BSE-TG-772257247 verified end-to-end: Telegram source -> both plot candidate IDs -> human-approved card -> callback 772257248 PROCESSED once -> 1 transplant event + 2 allocation transitions -> complete edited Telegram receipt.
- Exact proof: [GATE_I_GLOBAL_PLOT_LIVE_248_20261020.md](GATE_I_GLOBAL_PLOT_LIVE_248_20261020.md).

## Operational boundaries and read-only follow-up

- Canonical source: `dzuddiyn/PILOT_OPERATION`, NOT official farm production.
- Spreadsheet and Apps Script remain isolated PILOT_OPERATION; `production_write:false` and `official_bse_write:false`.
- Existing operator records, prior callbacks and triggers are untouched by this documentation change.
- No claim of physical planting or field activity verified independently beyond user-reported operational record.

## Remaining gates (explicitly NOT PASS)

- Investigate Apps Script execution failure at 12:28:18 MYT, worker timing/alerting; prevent silent callback backlog.
- Complete owner-approved cross-module live acceptance/security/ordinary-user UAT and any Gate I checklists not evidenced.
- Independent owner/site IT/corporate acceptance and formal handover.
- Any production/official BSE integration requires separate authorization and gate.

## Next operation

Request owner review of this closeout PR. After permitted merge, continue only the outstanding reliability and acceptance gates; do not re-run already demonstrated Transplant acceptance without new justification.

