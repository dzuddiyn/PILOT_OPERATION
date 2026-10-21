# GI-FIELD-UX-DELETE-BINDING-10 — Synthetic provenance contract

Status: SYNTHETIC LOCAL PASS for a pure validator; NOT an authoritative or cryptographic verification of existing records.

DeleteBindingTest.js is not wired to Sheets, callbacks or the operational delete path. The synthetic fixture sets proof_verified=true; this is a *trusted input assumption* for exercising guard logic, not a derived proof. An actual attested, independently verifiable receipt source and integrity verification mechanism have NOT been built.

The validator requires an explicit immutable receipt identifier, exact approval source key, ledger source key, both distinct expected payload hashes, eligible statuses, uniqueness of approval/ledger/receipt and a positive ledger revision. Missing/stale/ambiguous inputs fail UNVERIFIED.

The current PILOT inventory ledger has no revision column. A historic approval-to-ledger binding and authoritative immutable receipt have not been proven for BSE-TG-772257418. It must remain UNVERIFIED; no historical data migration or retroactive receipt invention is permitted.

Next integration must derive provenance from an authenticated commit event rather than trusting a caller-supplied proof_verified flag, and must reconcile the ledger revision strategy before any action is enabled.

No live record writes, no delete activation, no Apps Script HEAD push or merge.
