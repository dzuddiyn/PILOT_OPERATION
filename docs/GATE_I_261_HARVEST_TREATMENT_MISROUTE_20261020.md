# GI-261 Harvest Report Misrouting

2026-10-20, PILOT_OPERATION. LOCAL PASS ONLY.

## Live observation
Report BSE-TG-772257261: Tarikh mula harverst / tuai; M7P3; 14-Oct-26. Queue routed it to Treatment_Event_Log using received date 2026-10-20 and the date string as treatment_description. The approval card was OPEN, and no callback or domain row for this reference existed at the latest readback.

## Cause and fix
Treatment parser ran before harvest-start parser. Reordered the worker so harvest is evaluated earlier and is excluded from subsequent treatment parsing. Added explicit treatment parser guard against harvest headers. Valid PILOT treatment confirmations now show the reviewer card without a redundant interim notice. Human approval, NEED_INFO clarifications and TEST remain unchanged.

## Verification and scope
Dedicated 12/12 PASS; full Node regression 57/57 suites PASS. No Telegram send/edit, callback replay, Sheets write or Apps Script sync. Incorrect pre-fix card must NOT be confirmed. GitHub merge and LIVE proof outstanding. Worker reliability and formal BSE handover OPEN.
