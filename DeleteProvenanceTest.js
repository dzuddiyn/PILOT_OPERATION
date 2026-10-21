/** @OnlyCurrentDoc */
// GI-FIELD-UX-DELETE-PROVENANCE-11: pure commit-receipt proof verification.
// No runtime wiring; never declares historical receipts or writes Sheets.
function bseDeleteProvenance11Verify_(input){
  const x=input||{},c=x.commit_receipt||{},a=x.approval||{},l=x.ledger||{};
  const fail=reason=>({status:'UNVERIFIED',reason,production_write:false});
  if(x.source_kind!=='INDEPENDENT_COMMIT_AUDIT')return fail('NO_INDEPENDENT_COMMIT_AUDIT');
  if(!/^BSE-TG-\d+\|[A-Za-z_]+\|C\d+$/.test(String(a.source_key||''))||
     !/^BSE-TG-\d+\|[A-Z_]+$/.test(String(l.source_key||'')))return fail('INVALID_KEYS');
  if(a.decision_status!=='REPORTER_CONFIRMED'||l.status!=='APPROVED_TEST')return fail('NOT_APPROVED');
  if(!/^[0-9a-f]{64}$/i.test(String(a.payload_hash||''))||
     !/^[0-9a-f]{64}$/i.test(String(l.payload_hash||'')))return fail('HASH_INVALID');
  if(!c.event_id||!c.receipt_id||c.approval_source_key!==a.source_key||
    c.ledger_source_key!==l.source_key||c.approval_hash!==a.payload_hash||
    c.ledger_hash!==l.payload_hash||c.event_id!==l.event_id)
      return fail('RECEIPT_MISMATCH');
  if(x.approval_matches!==1||x.ledger_matches!==1||x.receipt_matches!==1)
    return fail('NON_UNIQUE_EVIDENCE');
  if(x.audit_readback_verified!==true||x.ledger_readback_verified!==true||
     x.approval_readback_verified!==true)return fail('READBACK_NOT_VERIFIED');
  if(!c.authenticated_origin||!c.commit_time||!c.immutable_commit_id)
    return fail('UNAUTHENTICATED_RECEIPT');
  return {status:'VERIFIED_PROVENANCE_ONLY',production_write:false,
    approval_source_key:a.source_key,ledger_source_key:l.source_key,ledger_hash:l.payload_hash,
    approval_hash:a.payload_hash,receipt_id:c.receipt_id};
}
