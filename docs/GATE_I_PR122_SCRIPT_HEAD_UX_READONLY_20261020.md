# Gate I ? PR #122 Script HEAD and Read-only UX Preview Evidence

**Date:** 2026-10-20 (MYT)
**Task:** GI-PR122-MERGE-AND-LIVE-UX-VERIFY-01
**Scope:** PILOT_OPERATION shadow pilot only
**Verdict:** MERGED / SCRIPT HEAD VERIFIED / READ-ONLY REAL-DATA PREVIEW PASS / **TELEGRAM LIVE UX NOT YET VERIFIED**

## Code, regression and merge

- GitHub PR #122 merged by explicit owner authorization; canonical main commit `4e61ff13a6d3628e4f26c577f4ce86304a9db972`.
- Previous main `8eeee150d2471698801cd39c4cfc511a1a71b80c`. GitHub merged diff includes only one Apps Script source change: `TelegramApprovalUiTest.js`; the remainder are tracking, evidence and local tests.
- Pre-sync local Node regression: **55/55 suites PASS**, clean working tree; targeted new human receipt harness **13/13 PASS** (at implementation), universal receipt harness **10/10 PASS**.
- Fresh isolated `clasp pull` before write: 74 runtime files. Verified previous Script HEAD against previous main: **64 shared JS files + 1 manifest MATCH**, nine runtime-only Gate F helper JS preserved, two repository-only `PilotRoleContract.js`/`PilotRoleResolver.js` absent from runtime as expected.
- Replaced only the formatter source `TelegramApprovalUiTest.js` in freshly pulled staging with exact merged GitHub main content, preserving all other runtime files. Pre/post normalized formatter SHA-256: `58d60488d427c448fe3c2d7b68fa3aae62a0dbd37bd7c1b5a9b1cf5943c3ebad` -> `8fe442b441a99f84a360e09f52202ecfe598302f1c3f84ff6a661c63564e11bb`.
- `clasp push` returned **Pushed 74 files at 1:16:05 pm** (2026-10-20 MYT). This updates **Script HEAD only**; no Apps Script version or deployment update performed.
- **Independent fresh second `clasp pull`** verified **65/65 shared canonical sources and manifest MATCH**, no mismatch; nine runtime-only Gate F helpers remain, two canonical-only roles remain absent from runtime.

## Existing genuine PILOT sowing records checked READ-ONLY

Source-of-truth live PILOT Sheets read-back was performed after the push.

- `BSE-TG-772257249`: original semai Cucumber 6656 (282 CP), 2026-10-05, M5P3 and M5P4; exactly one Crop Batch, one Planting Event, two Plot Allocations, all status `PLANNED` and review `PROVISIONAL`.
- `BSE-TG-772257253`: original semai Peria Besar 3328 (Hua Li), 2026-09-29, M6P1 and M6P2; read-only snapshot used to verify second independent example.
- Two data snapshots were presented to the **actual formatter extracted from the independent freshly pulled Script HEAD** in a local Node VM with a read-only book interface. No callback replay, Telegram API send/edit, or domain writes occurred.

### Preview 249 (real persisted rows, newly synced formatter)

```text
REKOD SEMAIAN DISIMPAN
Rujukan: BSE-TG-772257249
Tarikh semai: 05/10/2026
Tanaman: Cucumber 6656 (282 CP)
Plot: M5P3, M5P4
Direkodkan: 1 batch, 1 aktiviti semaian, 2 plot
Status plot: Dirancang
Status semakan: Sementara (belum diverifikasi)
```

### Preview 253 (real persisted rows, newly synced formatter)

```text
REKOD SEMAIAN DISIMPAN
Rujukan: BSE-TG-772257253
Tarikh semai: 29/09/2026
Tanaman: Peria Besar 3328 (Hua Li)
Plot: M6P1, M6P2
Direkodkan: 1 batch, 1 aktiviti semaian, 2 plot
Status plot: Dirancang
Status semakan: Sementara (belum diverifikasi)
```

## Limitations and next acceptance gate

- These two approvals occurred **before** the 13:16:05 Script HEAD sync; existing Telegram receipts were deliberately **not updated/replayed**. The preview executes newly synced source outside Apps Script against real read-only Sheet snapshots. This is a strong **SOURCE + PREVIEW PASS**, **not a LIVE Telegram receipt proof**.
- To claim LIVE Telegram UX PASS, observe a **naturally occurring future reporter-approved PILOT sowing or generic-fallback record** after the source sync; verify its live card with UIA, persisted rows and exact source-key linkage. No fabricated farm record or repeated Benar.
- Worker reliability incident at 12:28:18 and official BSE handover remain separately **OPEN**; `production_write:false` and `official_bse_write:false` continue.
- Do not retroactively upgrade previous receipts to pass or confuse Script HEAD sync with version/deployment.
