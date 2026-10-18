# Gate I — genuine Transplant 188 callback recovery (2026-10-18 MYT)

Status: **RECOVERY LIVE VERIFIED** (PILOT_OPERATION only); Gate I remains **PARTIAL VERIFIED / NOT DELIVERED**.

## Source and pre-recovery observation

- Real owner report `BSE-TG-772257188`: Transplant / Timun / `M5P34` (canonical plots `M5P3` and `M5P4`) / work date `2026-10-09`. Crop batch `BSE-SB-CB-20261006-001`, Timun variety 282.
- Original reporter genuinely tapped Benar on Telegram card **111**; durable callback updates `772257189` and `772257190` were captured. No assistant-generated approval, replayed Telegram request, or new farm report.
- Initial error `Hash pengesahan bercanggah.`: PR #44 fixed per-card candidate envelope hash.
- Follow-on error `Hasil Transplant TEST tidak sah.`: PR #45 strictly normalized known PILOT worker-side metadata before domain proposal validation. No queue provenance discarded or rewritten.
- Before recovery, both existing callbacks were `FAILED_CALLBACK_RETRY_LIMIT` (5 attempts); card 111 OPEN, source queue NEEDS_HUMAN_REVIEW; no Transplant, Transplant Review, or Allocation Status Event domain writes for this reference.
- PR #46 introduced a **one-time, narrowly bound recovery function**, requiring exact original callback, actor, card, source, date, crop, variety, plots, batch, allocation identity, hash, two terminal callback records, and absence of partial domain writes. Calls the existing human-confirmed domain callback under its standard review lock, then independently reads back domain/UI/queue before marking only the chosen callback PROCESSED. Fail-closed on any mismatch.

## Code, tests and Script HEAD

- Canonical GitHub main after PR #46: `6ed8b8a17c38546695457256468e04fd007c46a6`.
- PRs #44, #45, #46: MERGED after approved scoped technical work.
- Local Node regression: **20/20 suites PASS**, including one-time recovery mock tests **5/5 PASS**; JS syntax, git diff --check and diff secret-pattern scan passed.
- Independent Apps Script Script HEAD pull: **62/62 canonical JS exact match**, **71 runtime JS** total; nine Gate F runtime helpers preserved.
- Apps Script `runBseI011FullRegression`: **47/47 PASS**, 20:49 MYT, `production_write:false`.
- `clasp push` and Script HEAD read-back are NOT evidence of a new Apps Script version or deployment. No version/deployment promotion claimed.

## Controlled live recovery and independent verification

- At approximately 20:52 MYT the Apps Script editor executed **`recoverBsePilotGateITransplant188Once` once**. Log: `TRANSPLANT_REVIEW_SAVED`, followed by `GATE_I_188_RECOVERED_VERIFIED`.
- PILOT Sheets independent read-back:
  - `PILOT_TELEGRAM_QUEUE` source `772257188`: **REPORTER_CONFIRMED**.
  - `PILOT_TELEGRAM_APPROVAL_UI` original card 111: **REPORTER_CONFIRMED**, no replacement card.
  - `PILOT_TELEGRAM_APPROVAL_CALLBACK_PENDING`: original callback `772257189` **PROCESSED**; redundant `772257190` remains `FAILED_CALLBACK_RETRY_LIMIT` as historical evidence; no second domain write.
  - `PILOT_TRANSPLANT_REVIEW`: exactly one **APPROVED** review for this source.
  - `PILOT_TRANSPLANT_EVENT`: exactly one event `BSE-SB-TR-20261009-001`, date `2026-10-09`, Timun 282, batch `BSE-SB-CB-20261006-001`, plots `M5P3|M5P4`.
  - `PILOT_ALLOCATION_STATUS_EVENT`: exactly two source-linked events, `M5P3` and `M5P4` **PLANNED → ACTIVE**.
- Independent Telegram Desktop UI Automation: original Telegram card for `BSE-TG-772257188` displays **Disahkan** by original reporter at 20:52 MYT; a separate owner notification shows the source reference recorded at 20:52 MYT.
- Production boundary: `production_write:false`; `official_bse_write:false`; no official BSE write. Recorded farm work remains reporter-declared, not physically independently witnessed by software.

## Outstanding Gate I acceptance

- Real non-owner registration/access/negative-visibility proof requires genuine user onboarding and owner authorization.
- Confirm user-accepted `/history` work-date semantics live (rather than relying solely on prior source/harness evidence).
- Runtime UX of historical `(Mod TEST)` ACK remains visible in the genuine 772257188 Telegram transcript; avoid claiming the user-facing copy is fully clean until a post-fix genuine field report proves it.
- Latency/SLA and genuinely signed BSE receiving acceptance remain human/business gates. PILOT_OPERATION **NOT DELIVERED**.
