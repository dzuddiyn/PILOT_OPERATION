/** @OnlyCurrentDoc */
// GI-FIELD-UX-NONDELETE-RECEIPT-23: pure injected-store TEST_ONLY receipt reconciliation.
function bseNondeleteReceipt23Reconcile_(store,input){
  const x=input||{};
  const stop=status=>({status,production_write:false,telegram_send:false});
  if(x.environment!=='TEST_ONLY'||x.production_write!==false||x.official_bse_write!==false)return stop('ENVIRONMENT_DENIED');
  if(!/^BSE-TG-\d+\|Inventory_Event_Log\|C\d+$/.test(String(x.approval_source_key||''))||
     !/^BSE-TG-\d+\|INVENTORY_IN\|ITEM_[FN]$/.test(String(x.ledger_source_key||''))||
     x.approval_source_key.split('|')[0]!==x.ledger_source_key.split('|')[0]||
     !/^[a-f0-9]{64}$/i.test(String(x.approval_hash||''))||
     !/^[a-f0-9]{64}$/i.test(String(x.ledger_hash||''))||
     !String(x.event_id||''))return stop('INVALID_IDENTITY');
  if(!store||!['readApproval','readLedger','readReceipt','writeReceipt'].every(k=>typeof store[k]==='function'))return stop('STORE_UNAVAILABLE');
  const approval=store.readApproval(x.approval_source_key),ledger=store.readLedger(x.ledger_source_key);
  if(!approval||approval.status!=='REPORTER_CONFIRMED'||approval.payload_hash!==x.approval_hash)return stop('APPROVAL_UNVERIFIED');
  if(!ledger||ledger.status!=='APPROVED_TEST'||ledger.payload_hash!==x.ledger_hash||ledger.event_id!==x.event_id)return stop('LEDGER_UNVERIFIED');
  // Evidence must predate the reconciliation call: never fabricate candidate->ledger provenance.
  const evidence=store.readCommitEvidence&&store.readCommitEvidence(x.approval_source_key);
  if(!evidence||evidence.approval_source_key!==x.approval_source_key||
     evidence.ledger_source_key!==x.ledger_source_key||
     evidence.approval_hash!==x.approval_hash||
     evidence.ledger_hash!==x.ledger_hash||
     evidence.event_id!==x.event_id||evidence.verified!==true)return stop('COMMIT_PROVENANCE_UNVERIFIED');
  const key='TEST_ONLY_RECEIPT:'+x.approval_source_key;
  const expected={receipt_id:key,approval_source_key:x.approval_source_key,ledger_source_key:x.ledger_source_key,
     approval_hash:x.approval_hash,ledger_hash:x.ledger_hash,event_id:x.event_id,status:'RECONCILED_SYNTHETIC'};
  const before=store.readReceipt(key);
  if(before){
    if(Object.keys(expected).some(k=>before[k]!==expected[k]))return stop('RECEIPT_CONFLICT');
    return stop('ALREADY_RECONCILED');
  }
  store.writeReceipt(expected);
  const after=store.readReceipt(key);
  if(!after||Object.keys(expected).some(k=>after[k]!==expected[k]))return stop('RECEIPT_WRITE_OUTCOME_UNKNOWN');
  return stop('RECONCILED_SYNTHETIC');
}
