# GI-FIELD-UX-DELETE-PERSISTENCE-07 — Synthetic-only evidence

Status: LOCAL PASS for an injected-store protocol; REAL DURABLE SHEETS PERSISTENCE NOT IMPLEMENTED.

The module DeletePersistenceTest.js exposes create/observe/reconcile against an injected storage adapter with readJournal, writeJournal, readBinding and readLedger. This allows isolated tests without Apps Script, Telegram or Google Sheets. No live wiring or real persistence was changed.

The in-memory test adapter simulates a shared store between recreated VM runners. This proves protocol restart behavior when journal state survives, **not** actual file/disk/Sheets durability or restart after a lost machine.

Guards: require READY_NO_WRITE plan; exact approval-to-ledger binding; expected hash and revision; conflict on reused transaction ID with changed identity; write-then-readback verification; crash/partial state remains NEEDS_RECONCILIATION unless all three observations are affirmative; COMMITTED replay returns ALREADY_APPLIED.

Outstanding before any PILOT void: authoritative binding persistence and provenance, Apps Script Sheet adapter with crash-durable journal, script lock, exact ledger identity mapping, callback authorization bound to immutable snapshot, independent readback, recovery after real Sheets partial-write, and owner approval. Legacy void path is not modified or enabled by this task.

No PILOT Sheet writes, no Telegram messages, no clasp push, no merge or deployment.
