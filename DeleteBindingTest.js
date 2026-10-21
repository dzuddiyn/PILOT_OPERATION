/** @OnlyCurrentDoc */
// GI-FIELD-UX-DELETE-BINDING-10 — pure, isolated sidecar validator.
// Never creates mapping authority from a shared reference or matching labels.
function bseDeleteBinding10Validate_(input){
  const p=input||{},a=p.approval||{},l=p.ledger||{},e=p.evidence||{};
  const fail=(reason)=>({status:'UNVERIFIED',reason:reason,production_write:false});
  const approvalKey=String(a.source_key||''),ledgerKey=String(l.source_key||'');
  const match=approvalKey.match(/^(BSE-TG-\d+)\|([A-Za-z_]+)\|(C\d+)$/);
  if(!match||!/^BSE-TG-\d+\|[A-Z_]+$/.test(ledgerKey)||!ledgerKey.startsWith(match[1]+'|'))return fail('SOURCE_KEY_MISMATCH');
  if(String(a.decision_status)!=='REPORTER_CONFIRMED'||String(l.status)!=='APPROVED_TEST')return fail('STATUS_NOT_ELIGIBLE');
  if(!/^[0-9a-f]{64}$/i.test(String(a.payload_hash||''))||!/^[0-9a-f]{64}$/i.test(String(l.payload_hash||'')))return fail('HASH_MISSING');
  if(!e||e.origin!=='APPROVAL_TO_LEDGER_COMMIT_RECEIPT'||String(e.approval_source_key)!==approvalKey||
     String(e.ledger_source_key)!==ledgerKey||String(e.approval_hash)!==String(a.payload_hash)||
     String(e.ledger_hash)!==String(l.payload_hash))return fail('PROVENANCE_MISSING_OR_MISMATCH');
  if(e.proof_verified!==true||!String(e.immutable_receipt_id||'').trim())return fail('PROVENANCE_UNVERIFIED');
  if(p.approval_match_count!==1||p.ledger_match_count!==1||p.receipt_match_count!==1)return fail('AMBIGUOUS_MAPPING');
  if(p.ledger_has_revision!==true)return fail('REVISION_UNAVAILABLE');
  if(!Number.isInteger(l.revision)||l.revision<1)return fail('INVALID_REVISION');
  return {status:'VERIFIED',production_write:false,approval_source_key:approvalKey,ledger_source_key:ledgerKey,
    approval_hash:String(a.payload_hash),ledger_hash:String(l.payload_hash),revision:l.revision,receipt_id:String(e.immutable_receipt_id)};
}
