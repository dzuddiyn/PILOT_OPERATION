# GI-FIELD-UX-CONTRACT-01 — Unified Card UX and Bounded Operations

**Decision:** OWNER APPROVED, 2026-10-22 MYT. **Design LOCK; NOT IMPLEMENTED by this document.** Owner approved autonomous feature development, targeted/full tests, canonical PR merge and authorized PILOT_OPERATION Script HEAD sync **subject to safety, test and read-back gates**. No official BSE production write/version/deployment or uncontrolled farm action authorized.

**Authority:** `dzuddiyn/PILOT_OPERATION` main, `AGENTS.md`, `docs/PILOT_OPERATION_EXECUTION_PATH.md`, `docs/ARCHITECTURE.md`. `PILOT_OPERATION`, `production_write:false`, `official_bse_write:false`, provenance, source-scoped authorization, human confirmation, idempotency, and independent verification remain mandatory. Do not rewrite historical TEST/PILOT_TEST contracts.

## 1. Ordinary-user primary UX

```
Telegram natural-language report
 -> domain intent recognition and deterministic validation
 -> ONE review card showing understood facts and missing/invalid facts
    - complete and safe: Benar / Batal
    - incomplete: Simpan Draf / Batal
    - ambiguous unsafe/out of scope: no canonical approval, clear short notice
 -> durable callback/read-back
 -> complete + authorized + verified human Benar ONLY: canonical PILOT ledger write
 -> draft: preserve original message and understood fields in PILOT queue only,
           DRAFT_NONCANONICAL; zero domain ledger write
```

- **No Telegram reply-thread UX** for standard reports: no `reply_parameters` quoting messages, `force_reply`, "Gunakan Reply", follow-up question storms, generic "`PLANT_CENSUS` Menunggu pengesahan laporan", "`INVENTORY_IN` Menunggu pengesahan". Ordinary group card may appear as a normal bot message with the stable source reference, not a Telegram reply to the user's message. Preserve security callback acknowledgement and readback/idempotent receipt behavior.
- Do not erase necessary warnings (cross-plot conflicts, unauthorized, unsupported, source mismatch, date impossibility, stale cards, uncertain write).
- Exactly one **logical review** per original report; a genuine multi-item inventory report may have individually actionable cards labelled `Rekod 1/N`, `Rekod 2/N` without duplicate preambles. Never auto-reissue a card if send outcome is unknown.
- User-facing language in Malay, concise and helpful: `🌱 Banci Pokok`, `📦 Baja Masuk`, `📦 Baja Keluar`, `Semakan Laporan`. Display original `BSE-TG-...` reference, date DD/MM/YYYY, plot, crop, fertilizer/item, numeric amount and unit, and status. No internal `PLANT_CENSUS`, `NEEDS_HUMAN_REVIEW`, `NON_CANONICAL`, `PILOT_TEST` in ordinary UI.
- Missing `❌` beside the **specific** unavailable/invalid field; do not mark valid information as invalid. Distinguish missing, malformed, and historical/lifecycle conflict. Format help must reflect real parser support and should be local to failed field, e.g. `Tarikh: ❌ Sila guna DD/MM/YYYY atau DD/MM`. An inferred year must be visible to user before confirmation; preserve MYT date context. Do not replace an explicitly invalid date with received-at.
- Banci sample `6/10/2026 M5P2 Mati:143 Sakit:654`: date **valid**. If no unique active crop/batch as of that date, flag crop/batch not date. M6P2 with valid matched crop must show one friendly card; never send an additional bare `PLANT_CENSUS` message.
- Report that cannot be identified: `Sistem OpsMate tidak dapat mengenali laporan yang mahu direkodkan.` Respond **only** when clearly presented as a report; not every unrelated group chat.
- **Incomplete choice:** `✅ Simpan Draf` preserves original/source identity + validated extracted fields in existing PILOT queue, with a clearly separate noncanonical status and no domain writer. `❌ Batal` closes that candidate. A fresh complete message produces its own source-bound proposal; no stitching across reply threads. The same source/callback cannot create duplicate drafts or records. User may request future new UX separately; do **not** invent an editable form/wizard now.
- Confirmation of a complete candidate still requires domain-specific safety validation and matching source payload hash. `Benar` cannot bypass mandatory fields, eligibility, conflict, ownership or amount checks.

## 2. Date semantics and Banci arithmetic

- Date parse and formatting follow Malaysia timezone. Supported examples: `DD/MM/YYYY` and `DD/MM` when the domain supports short year; clear inferred current year in preview; reject invalid calendar values. Retain existing ISO/alternative date grammar where already supported; never silently narrow TEST semantics.
- The current census computation `capacity - dead - sick` is *healthy estimate*, not the living count, provided sick plants are alive and categories disjoint. `living estimate = capacity - dead` under the same capacity and no-other-loss assumptions. Present estimates clearly; do not blindly rewrite existing persisted historical values or assert physical observation. Update canonical census schema/computation only in a separate tested data-correctness slice with migration/reconciliation rules.

## 3. Seed sowing and crop lifecycle guard

- New seed sowing **mandatory**: calendar date, crop species, variety, and seed quantity **positive number plus explicit unit** (e.g. `65 tray`, `1 kg`, `300 g`), plus explicit plot/module context required by current domain contract. Preserve literal user unit and original quantity; no unsupported conversion or default `tray`.
- Core cycle: `SEED_SOWING -> TRANSPLANT -> HARVEST_START -> CYCLE_END`. For a given canonical batch/cycle+plot, each stage at most once, regardless of repeated message/date; enforce in the approval writer under lock with fresh canonical read. Cannot backdate stage before predecessor, skip stages or cross active cycles.
- Explicit **DIRECT_SOWING** exception (direct field sow): bypass TRANSPLANT only when factual sowing method is explicitly supported and verified; never invent a transplant record. Do not allow duplicate active plot allocation or close one cycle as another. Plot can be reused by a new batch after prior cycle is correctly closed.
- Duplicate, history conflict, unknown batch, or missing prerequisite -> safe conflict or DRAFT, not a confirmable canonical card. Stable source IDs, source hashes and read-back continue to enforce idempotency.

## 4. Inventory / claim

- Inventory card must say Baja Masuk vs Baja Keluar, use correct date and each distinct item+unit+quantity, and clear plot context for out. Missing fertilizer **identity** for `Baja Out` is blocking for canonical ledger but allowed in a noncanonical draft. User sees facts system understood before deciding.
- `/claim` read-only retrieval **PM bot only**:
  - `/claim` -> MYT current calendar month, `/claim 10/2026`, `/claim 10-2026`, `/claim 2026-10`, `/claim Okt 2026`, `/claim Oct 2026`, `/claim Oktober`, `/claim October`.
  - Accept unambiguous Malay and English full names and common abbreviations for **all twelve months** (case insensitive); month name without year uses current MYT year. Reject ambiguous, invalid, trailing junk or over-broad input with short usage help, never silently query another month. Match canonical claim event_date, not ingestion month.
  - Registered-active ordinary user sees their **own** claims only via verified numeric Telegram ID; no username/display-name equivalence. A verified immutable bootstrap OWNER sees all allowed claims; ADMIN only when the **approved canonical RBAC ledger is actually implemented and validated**, not from old `is_admin`, Telegram group admin, or registration. Default-deny on uncertain identity/access; no group disclosure.
  - Distinguish submitted, pending, approved, cancelled and totals. Do not count unapproved amounts as paid and do not leak claim data to unregistered users.
- `zen areyf` and `S S.` were observed as `REGISTERED_ACTIVE` in existing registry, **not promoted**. Future OpsMate ADMIN role grants require separate live RBAC writer, numeric-ID binding, authenticated bootstrap OWNER PM confirmation, transactional grant ledger and independent read-back (see locked 2026-10-19 RBAC contracts). User request does **not** authorize fabricated ADMIN status or shortcut through Telegram group admin.

## 5. AI and menu

- Publish `/ask` (not `/ask_ai`) in PILOT_OPERATION Telegram command menu with `setMyCommands` then real `getMyCommands` read-back. Historical TEST behavior may remain independent.
- `/ask` display heading: `🤖 Jawapan AI — Maklumat rujukan sahaja`. Remove unhelpful phrase `dalam mod PILOT_TEST` from PILOT_OPERATION prompts/answers. Internal boundary remains **noncanonical**: no authoritative BSE data write, approval or operations instructions from AI. No Telegram reply-to quoting for `/ask`.
- Other command aliases and menu changes must be supported by actual handlers; never announce unsupported commands.

## 6. Implementation acceptance gates

1. Inspect canonical main, clean isolated worktree and existing 05B recovery evidence; preserve all existing user work.
2. Implement as **atomic, bounded slices**: (A) menu/AI + claim month parser/access; (B) unified card/draft and historical safety regression; (C) seed quantity schema + four-stage lifecycle; (D) admin RBAC **only after existing locked architecture passes mandated fault tests**.
3. For every slice: RED/GREEN targeted synthetic tests; full Node regression; code syntax and diff checks; privacy/secret scan; independent read-back. Hard-stop and report concrete blocker if any guard fails. No fake PASS or permission promotions.
4. Source merge only when change set is bounded, reviewed and all mandatory tests PASS. Owner grants advance authority to merge scoped PRs here, **not** blanket permission to bypass failures. Script HEAD sync only when canonical source and preservation of nine Gate F runtime-only helper files/manifest/binding are verified; backup/prepull, push, 80-file adjusted-count independent pull; actual owner-authenticated Apps Script native regression and independent Executions UI.
5. Distinguish `LOCAL PASS` / `MERGED` / `SCRIPT HEAD UPDATED` / `NATIVE PASS` / `LIVE TELEGRAM FIELD PROOF` / `DEPLOYED` / `DELIVERED`. UI changes do not imply live Telegram callback proof. No automatic replay of real user reports. No official BSE writes, version or deployment update under this contract.
6. Further needs its own live proof plan: two selected user admin role grants under locked RBAC approval procedure, menu reality check, multi-item inventory, incomplete card (draft only), duplicate callback, sowing unit+cycle, private claim retrieval, no group leak, no fake record when unknown.

## 7. Known risks / reject list

- REJECT: forcing Telegram reply threads or resending entire reports through reply.
- REJECT: allowing `Benar` to create invalid/incomplete inventory, census, seed or harvest records.
- REJECT: silently assigning current date to user-supplied invalid date.
- REJECT: treating Telegram group-admin status or display name as OpsMate ADMIN authority.
- REJECT: generic bot replies to all group speech, auto-missing-value invention, converted seed units without declared mapping, or overwriting historical field evidence.
- REJECT: stating an Apps Script push is deployed or an automated message was physically delivered without read-back.

**Status as of approval:** UX CONTRACT LOCKED ONLY. Code implementation, GitHub merge, Apps Script runtime update, native regression and field proof must report their own observed evidence later.
