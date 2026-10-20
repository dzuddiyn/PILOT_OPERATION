# GI-PR125 ? Merge, Apps Script HEAD Sync, Independent Verification

**Date:** 2026-10-20 (MYT)
**Environment:** PILOT_OPERATION only
**Result:** SOURCE MERGED / SCRIPT HEAD VERIFIED / READ-ONLY CARD PREVIEW PASS
**Not claimed:** NEW VERSION, DEPLOYMENT UPDATED, LIVE TELEGRAM UX PASS, OFFICIAL BSE DELIVERED

## GitHub authority

- PR #125 merged with explicit owner approval into canonical `dzuddiyn/PILOT_OPERATION` main.
- Merged main commit `83b339127b9125041394b3ef321fcc21854028f5`; head of approved PR `34322b475ceb80c20fe70d025d360d9077cfec5c`.
- Changes: approved suppression of two redundant transplant approval instructions; PILOT-only deterministic `Tarikh mula harvest/harverst/tuai` intake to `Operation_Log` `HARVEST_START`; humanized operation card and receipt. No operational data migration.
- Verified the branch had a clean worktree, dedicated harness **19/19 PASS**, full Node regression **56/56 test suites PASS**, JS syntax and diff checks PASS before merge.

## Safe Script HEAD update

- Pre-write fresh isolated `clasp pull` from authorized PILOT_OPERATION: 74 Script files plus local .clasp config, 65/65 shared canonical JavaScript/manifest files matched previous main `e551034`. Two repo-only JS files `PilotRoleContract.js` / `PilotRoleResolver.js` were absent from runtime as previously expected; nine runtime-only helper JS files retained.
- Replaced **only** three changed JS source files with content from merged GitHub main: `TelegramWorkerTest.js`, `TelegramApprovalUiTest.js`, `OperationDecisionReviewTest.js`. Pre-write identity for each old source verified, write/read-back validated.
- `clasp push`: **Pushed 74 files at 1:59:56 pm MYT**. This is **SCRIPT HEAD UPDATED**, **not** an Apps Script version or deployment update.

## Independent post-write proof

- Second new isolated `clasp pull`: 74 Script files fetched.
- Compared with canonical merged main: **65/65 shared files and manifest MATCH, 0 drift**. All nine runtime-only helpers preserved; two repo-only roles remain absent from runtime.
- Changed-file normalized SHA-256:
  - `OperationDecisionReviewTest.js`: `bd42b10c655ac7fe1e6e5a0db6fcab79794e3c1c25d00be461d4812a40063bf3`
  - `TelegramApprovalUiTest.js`: `01ceb8d16f023424856987f0c543e21877a997a43836f3e9e5519e77de2ae0ed`
  - `TelegramWorkerTest.js`: `3d390c932c5013630bd72662796d51dc6bcda0adb827967e4abd7b8d836b3411`

## Read-only formatter preview using ACTUAL newly pulled Script HEAD code

Input (user-requested example, not sent to Telegram during this run):

```text
Tarikh mula harverst / tuai
M7P3
14-Oct-26
```

Pure script execution with read-only mocked runtime produced `validation=PASS`, single `Operation_Log` candidate, operation type `HARVEST_START`, event_date `2026-10-14`, plot `M7P3`, `production_write:false`.

```text
Semakan TEST BSE-TG-NEW
Rekod Operasi
Tarikh: 14/10/2026
Plot: M7P3
Jenis operasi: Mula Tuai
Catatan: Tarikh mula tuai dilaporkan; tiada kuantiti hasil dinyatakan.
Tiada rekod production akan ditulis.
```

Independent Pindah Tanam card preview retained date/crop/variety/plot and contained neither crossed-out instruction line. Persisted Operation Log receipt formatter mapped `HARVEST_START` to `Mula Tuai`. Approval markup and human Benar approval were not changed.

## Live boundary / open gates

At verification, `PILOT_TELEGRAM_QUEUE` had **no harvest-start report** and the most recent captured pilot update was `772257259` (previously approved transplant). **No new Telegram card or farm-domain write occurred in this task.** No synthetic report, callback replay, bot send/edit, or manual Benar.
The observed formatter behavior is **read-only preview from the deployed Script HEAD**, not a true post-sync Telegram LIVE acceptance. This remains OPEN until an organic operator-submitted report is read and approved by its human reporter. Overall worker reliability and formal BSE handover remain OPEN / NOT DELIVERED.

Environment lock remains `production_write:false`, `official_bse_write:false`.
