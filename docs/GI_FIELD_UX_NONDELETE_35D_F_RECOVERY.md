# GI-FIELD-UX-NONDELETE-35D-F-RECOVERY

Status: LOCAL SYNTHETIC PASS; LIVE AUTH SOURCE UNVERIFIED; LIVE WRITE HOLD.

Gate 35D: Local read-only source inspection verifies exact TEST_ONLY workbook, identity fields, single record, approval revision, actor_verified boolean, timestamp validity and freshness. It always returns INSPECTED_HOLD, never a write grant. The actor_verified field and data source remain caller-injected synthetic values; there is no real server-controlled approval evidence.

Gate 35E: Bridge returns TRUSTED_ACTOR_BINDING_MISSING, write_allowed=false for a matching synthetic approval. Gate 35F: readiness returns OWNER_APPROVAL_GATE, script_head_push=false and live_write=false. These gates are deny-only and are not equivalent to trusted authentication or deployment readiness.

Recovery on 2026-10-21: RDC Node execution available again; targeted 35D-F tests 6/6 PASS, full Node suite 163/163 PASS. No Apps Script HEAD update, execution or deployment; no Sheets writes, Telegram, merge or /delete changes. The existing historical Gate-27 partial fixture remains protected.

NEXT: independent source authority and actor identity implementation, then authorized controlled proof; no live transaction writes in this gate.
