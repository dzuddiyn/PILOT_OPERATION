# BSE OpsMate PILOT_OPERATION Guardrails

## Source of truth

This repository, `dzuddiyn/PILOT_OPERATION`, is the canonical implementation workspace for the BSE OpsMate `PILOT_OPERATION` shadow pilot.

Before analysis, diagnosis, or changes:
1. read `docs/ARCHITECTURE.md`;
2. read `docs/PILOT_OPERATION_EXECUTION_PATH.md`;
3. read `ACTION_PLAN.md` and `docs/DEVELOPMENT_STATUS.md`;
4. inspect canonical `main`, local working tree, and live runtime state where relevant.

The historical/source baseline is inherited from `BSE-dzuddiyn01gmail/BSE-OpsMate-TEST` at merge commit `480981787d00d4d5ef346fb0531b2e3ec161743e`. Do not silently move authority back to that repository.

## Locked environment boundary

- Canonical environment name: **`PILOT_OPERATION`**.
- Technical target sheets: `PILOT_*`.
- PILOT_OPERATION Spreadsheet/Drive must be separate from TEST and PILOT_TEST.
- `production_write:false` remains locked.
- `official_bse_write:false` remains locked.
- PILOT_OPERATION may store real pilot operational data in its own Sheet/Drive.
- No direct write/integration to the official BSE system.
- Google Tasks remains out of scope per D-027.
- Human confirmation, provenance, dedup, audit, access control, and fail-closed behavior remain mandatory.
- General Telegram receive/worker automation remains OFF until Gate H in the locked A-I execution path.
- Do not claim physical or operational action occurred merely because a software command was issued.

## Identity and authority

- GitHub authority for PILOT_OPERATION: `dzuddiyn/PILOT_OPERATION`.
- Google authority/owner: `dzuddiyn01@gmail.com`.
- `rdeeen` must not be an authority, owner, credential dependency, or fallback.
- Product/resource identity: **BSE OpsMate** only. No legacy product alias in active PILOT_OPERATION resources/prompts.

## Change flow

Use:
```text
inspect -> feature branch -> implement -> targeted tests -> full regression
-> git diff --check -> secret scan -> commit -> push -> PR -> verify PR
-> explicit merge authorization -> runtime binding/deploy step if authorized
-> live proof -> independent verification
```

For Apps Script:
```text
canonical source -> local tests -> clasp push to authorized PILOT_OPERATION Script HEAD
-> version/deployment only if explicitly authorized -> live proof -> independent read-back
```

`clasp push` is Script HEAD update only; it is not production deployment.

Never stage or commit `.clasp.json`, tokens, API keys, credentials, `.env`, Script Properties, or browser/Git credentials.

## A-I execution gate

Follow `docs/PILOT_OPERATION_EXECUTION_PATH.md` strictly:
A truth reconciliation -> B environment adapter -> C authority binding -> D minimum baseline seed
-> E transport reconciliation -> F controlled real write/retrieve -> G evidence proof
-> H automation ON proof -> I ordinary-user walkthrough/delivery.

Do not skip a gate silently.
