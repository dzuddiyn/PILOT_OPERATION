# GI-MULTI-UX-KB — audit, trust boundaries and local patch evidence

Date: 2026-10-21 MYT. Authority `dzuddiyn/PILOT_OPERATION`, main baseline `bd6f9ede442514e092d8895b0456044feaea745d` (merged PR #149).
This document is an implementation/evidence note, not authority to modify Script HEAD, bot menu, official BSE data or ownership.

## Source of screenshots / issues
Owner-provided actual Telegram screenshots:
- EC post-confirmation date shown as raw `Wed Oct 14 2026 08:00:00 GMT+0800`, rather than `14/10/2026`.
- Treatment text `Racun\n19/10/2026\nIsnin\nPETANG\n...` treated `PETANG` as a pesticide requiring a dosage clarification.
- Census `REKOD BANCI POKOK\n6/10/26\nModul: M1 P2\nMati: 143\nSakit: 654` prompted for details despite explicit date; user requires seven heading aliases and variable date formats.
- Telegram /start `BSE_PILOT` replaced with `/start OpsMate` and /ask_ai renamed to /ask in PILOT_OPERATION.
- Evidence filenames should be **date-only** (no time), with caption from user message plus system/source reference.
- KB reference and periodic source refresh required.

## Verified Drive state and corrective writes
- Google Sheet ID `1gbuxsuXMWaV7IKv8l5Hnr_VlVBNpWAQ4H4E9Pp4xqDs` moved from My Drive root into folder `BSE_OpsMate_SB_PILOT_OPERATION` ID `1PhQ_BAtqk--z43UmtE7t8Aa7dM5J5NhG`. Parent metadata and Sheet readback PASS. Spreadsheet ID unchanged.
- Owner screenshot proved original `Kerani_AI_BSE_Site_B_v2026/02_PROJECT_CONFIG` contains 11 CSVs. Prior claim of an empty source folder was mistaken: Drive search index yielded zero for some parent listings, while exact source IDs resolved to valid metadata. Treat exact IDs and metadata as stronger evidence here.
- Created reference-only destination `08_KB_REFERENCE/02_PROJECT_CONFIG` ID `1fIKm5zVW4It8MmylMDdBHO5A_2nmDQ8O`, then copied these 11 CSV documents, verified individually by destination-parent, title and size, leaving the original intact:
  `Project_Profile.csv`, `Plot_Registry.csv`, `Location_Registry.csv`, `Crop_Master.csv`, `Infrastructure_Registry.csv`, `Measurement_Definition.csv`, `Asset_Registry.csv`, `Plot_Cycle_Registry.csv`, `Approval_Rules.csv`, `Role_Registry.csv`, `System_Config.csv`.
- **These are snapshots, not live authority or proof of byte-level checksum**, and have NOT been imported into Gemini File Search. In particular, Approval/Role/System remain classified guardrail/config references, never prompt policy or runtime override. The original KB folders IRAC and DOA_SISMARP were found empty through the available Drive query (query may have indexing limitations); do not claim no external live KB exists.

## What /ask currently reads
- `SiteKnowledgeStructured.js` and `SiteKnowledgeFaq.js` read `PILOT_KB_FACTS` (fields `topic, question_key, answer, unit, confidence, source_file, notes`) and other structured KB tabs, plus `PILOT_KB_SOURCE_REGISTRY` as metadata index.
- Gemini File Search KB is instead bound through Apps Script Script Properties `BSE_AI_FILE_SEARCH_STORE` and `BSE_AI_KB_REFRESHED_AT`; current PILOT_OPERATION live binding has **not been independently verified**. No tokens or store IDs inspected.
- Do not equate Drive folder copies with successful AI grounding. Any canonical user editorial layer must have clear provenance and freshness and be tested before routing the model to it.

## Existing PILOT_TEST official web refresh
- SISMARP/DOA: `BSE-dzuddiyn01gmail/BSE-OpsMate-TEST` workflow `.github/workflows/refresh-sismarp-cache.yml` schedules weekly Saturday 19:20 UTC (Sunday 03:20 MYT), needs `self-hosted, Windows, X64, sismarp` runner and writes derived `sismarp-cache/data/sismarp/current.json` only after validation.
- Actual HTTPS read of current public cache succeeded HTTP 200, `refreshed_at=2026-10-14T06:14:39Z`, `freshness_days=14`, `rows=25498`, source `http://www.portal.doa.gov.my/sismarp/`. Cache is currently within freshness window.
- Fresh GitHub Actions API READ: scheduled run ID `39063271096` started `2026-10-17T19:37:33Z` and was **CANCELLED** `2026-10-18T19:37:34Z` after ~24h without assignment (runner_name empty). No successful scheduled refresh in this run; latest confirmed success was manual `workflow_dispatch` 14 Oct. Remote Windows laptop showed zero matching GitHub Actions Runner service and zero Runner.Listener/Runner.Worker processes; this observation alone does not establish whether a runner was expected on a different host. GitHub runner API status inaccessible under current permissions.
- `TelegramAiTest.js` PILOT Q&A reads this cache by HTTPS, explicitly rejects stale (>14 days), missing or invalid data and avoids claiming registrations without matching queries. The derived GitHub cache is NOT independent statutory registration authority.
- IRAC: `TelegramAiTest.js` references official `IRAC_MoA_Classification_v11.5_Feb_2026.pdf` at `https://irac-online.org/documents/moa-classification/`; official IRAC classification is separate from Malaysia product registration authority.
- Old `bootstrapBseAiFileSearchTest` and `rebuildBseAiFileSearchTest` are **PILOT_TEST only**. Danger: `rebuildBseAiFileSearchTest` forcibly DELETES previous Gemini File Search store before fetching/importing replacement. DO NOT run this on PILOT_OPERATION, and do not silently change File Search store authority.
- Safer plan (not executed): inspect PILOT_OPERATION read-only store status; build new versioned store off to the side; validate official IRAC/DOA documents and grounding; atomic reference flip after approval; retain old version and rollback. SISMARP weekly runner repair separately.

## Owner/Admin authority blocker
- `PILOT_OWNER_REGISTRY` currently contains 1 owner row; `PILOT_TELEGRAM_USER_REGISTRY` contains 1 REGISTERED_ACTIVE row in inspected range. Neither Zen Areyf nor S S has an independently verified Telegram user ID/private chat binding from the inspected registries.
- `bseTestOwnerForTelegramUser_` currently treats any active owner-registry row as a valid owner for guarded operations; its `is_admin` flag is NOT an independently scoped registration-approval capability. Adding S S/Zen as simply additional active rows risks giving owner-level permissions. **HARD STOP for privilege writes until IDs and RBAC authority model are verified.**
- User's desire (Zen Owner; current owner plus S S Admin; or two Admins if transfer too difficult) remains a design/identity gate. Do not infer group membership constitutes authorized bot identity, or that a Telegram group admin automatically has OpsMate approval rights.

## Code under isolated feature branch
- Changes in `feat/gi-multi-ux-intake-kb-20261021`: PILOT-only /start OpsMate and /ask, preserving TEST/PILOT_TEST paths; EC confirmation date formatting for JS Date objects; treatment session tokens excluded from chemical name extraction; census aliases and explicit dates; Evidence filenames with MYT date only, caption + message ID, guarded compatibility for old names.
- Targeted tests: `gate_i_pilot_command_treatment_ec_date.test.cjs`, `gate_i_census_alias_dynamic_dates.test.cjs`, `gate_i_evidence_filename_date_only.test.cjs`, plus existing harness.
- Last full Node suite after commands/census: 79/79 PASS (Evidence change requires new full rerun).
- No Apps Script HEAD push, new version, deployment, Telegram menu write, report replay, owner registry write or operational ledger mutation as part of these source edits.

## Required remaining gates
1. Full Node regression, syntax, secret scan, evidence documentation and draft PR on feature branch; explicit owner merge authorization and later separate guarded HEAD/menu activation.
2. KB runtime File Search status and non-destructive refresh architecture, with actual source citations/version and tested retrieval; do not claim grounded PILOT IRAC until live proof.
3. SISMARP runner availability and 18 Oct scheduled cancellation remediation only with separate architecture change approval.
4. Telegram identities + RBAC permission model before any Zen/S S roles; verify admin approval behavior with synthetic tests then controlled read-back.
5. End-to-end acceptance tests for treatment, census, Evidence name and /ask after separately authorized script/menu rollout.
