# GI-FIELD-UX-NONDELETE — 36O OAuth email scope fix

Date: 2026-10-21 (MYT).
Approval: owner explicitly stated LULUS 36O-OAUTH-FIX.
Authorized scope: only TEST_ONLY Apps Script HEAD manifest addition of https://www.googleapis.com/auth/userinfo.email and READ-ONLY identity probe. NO transactions, approval issuance, Script version, deployment update or PR merge.

## Preflight
- GitHub PR #156 initially at fc9cbf58db461ba39ac88872c7685b4b73b6e054, OPEN DRAFT, unmerged. Isolated local feature branch clean.
- TEST_ONLY Apps Script ID 16y4slvh-7m4CKtz7_tqDB3gmtBw8QZ_tlsZljc7ijnm3pScEUEDjckpO.
- Existing deployment unchanged: AKfycbwucvdFpuzKAkm_tI2-wWQGa_gXmzL1bSJUsmEifk__ @HEAD.
- Fresh independent clasp pull before writing, all five local/remote files SHA-256 MATCH.
- Original manifest had only https://www.googleapis.com/auth/spreadsheets.
- Changed only manifest to declare exactly the existing spreadsheets scope and new userinfo.email scope. Existing four JavaScript sources checksum-matched remote.
- Full Node regression 211/211 PASS.

## Applied / reconciled
- Initial clasp push returned Skipping push. Fresh remote pull proved remote manifest STALE (only spreadsheets scope), while all four JS sources matched.
- With that evidence, controlled clasp push --force at 21:20:04 MYT returned Pushed 5 files (Script HEAD only). Fresh remote clasp pull in independent directory verified 5/5 SHA-256 MATCH.
- Live remote manifest oauthScopes now EXACTLY [https://www.googleapis.com/auth/spreadsheets, https://www.googleapis.com/auth/userinfo.email]. No script source drift.
- Apps Script Editor confirmed TEST_ONLY project, owner Google account and exact function runBseNondelete36OIdentityReadOnly. Clicking Run prompted Dibutuhkan otorisasi (Authorization required).
- Clicked Tinjau izin (Review permissions) to open legitimate Google Accounts flow. Google then requested OWNER phone-based sign-in challenge. Did NOT approve/complete this phone verification automatically, did NOT choose alternate verification, did NOT consent to new Google access on owner's behalf.

## State at stop
SOURCE UPDATED / SCRIPT HEAD UPDATED / INDEPENDENT READ-BACK PASS.
OAuth owner phone verification PENDING HUMAN ACTION.
LIVE identity proof NOT RUN post-consent; approval issuance NO; Sheets mutation NO; Script version/deployment update NO; production/official BSE write NO; merge NO.

NEXT (one owner action): complete the Google account verification prompt on the owner's phone for this initiated TEST_ONLY Apps Script authorization. After it finishes, continue the remaining Google consent screen and rerun the exact READ-ONLY function, then verify outcome independently. Google userinfo.email scope does not constitute transaction authorization.
