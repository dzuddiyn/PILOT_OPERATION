# Gate 36J — actual non-owner read-only access negative proof

Date: 2026-10-21. Owner explicitly allowed testing dzuddiyn@gmail.com as non-owner TEST identity, read-only only.

Workbook: 1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY. Google Drive connector for dzuddiyn@gmail.com returned HTTP 404 NOT_FOUND on file metadata. Google Sheets connector for the same account returned HTTP 403 PERMISSION_DENIED on spreadsheet metadata. No share change or write request was made. This proves the tested non-owner account could not read the workbook under the current ACL.

LIMIT: This does not prove that protected ranges prevent an editor from writing, nor issuer identity, append-only immutability, Sheets direct-write protection under owner credentials, or transactional approval. Do not assert effective editor-denial based on the 403. Gate 36I direct Sheets API inspection with clasp OAuth was blocked by disabled Sheets API on that OAuth project.

Gate 36J issuer readiness remains design/test-only and write HOLD. A trusted issuer must rely on a server-controlled authenticated approval action with exact actor, payload hash, revision, expiry and one-time nonce, not client-provided booleans. A separately approved permission mutation/test would be needed for an editor-level effective-denial proof. Do not share the actual TEST_ONLY workbook just to manufacture that proof without approval.

No Apps Script HEAD push, deployment, Sheet mutation, Telegram, PR merge or individual delete changes.
