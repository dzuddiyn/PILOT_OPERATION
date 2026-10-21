/** @OnlyCurrentDoc */
// GI-FIELD-UX-DELETE-COMMIT-RECEIPT-12: injected-store synthetic transaction.
// NOT connected to live inventory writer or Telegram callback.
function bseDeleteReceipt12Commit_(store,input){
  const x=input||{},a=String(x.approval_source_key||''),l=String(x.ledger_source_key||'');
  const fail=(reason)=>({status:reason,production_write:false});
  if(!/^BSE-TG-\d+\|Inventory_Event_Log\|C\d+$/.test(a)||
     !/^BSE-TG-\d+\|INVENTORY_(?:IN|OUT)$/.test(l)||
     a.split('|')[0]!==l.split('|')[0])return fail('INVALID_SOURCE_KEYS');
  if(x.owner_authorized!==true||x.approval_status!=='REPORTER_CONFIRMED')
    return fail('APPROVAL_REQUIRED');
  if(!/^[a-f0-9]{64}$/i.test(String(x.approval_hash||''))||
     !/^[a-f0-9]{64}$/i.test(String(x.ledger_hash||''))||!String(x.event_id||''))
    return fail('INVALID_HASH_OR_EVENT');
  const receiptId='R12:'+a,previous=store.readReceipt(receiptId),ledger=store.readLedger(l);
  if(previous){
    if(previous.approval_source_key!==a||previous.ledger_source_key!==l||
      previous.approval_hash!==x.approval_hash||previous.ledger_hash!==x.ledger_hash||
      previous.event_id!==x.event_id)return fail('RECEIPT_CONFLICT');
    if(!ledger||ledger.payload_hash!==x.ledger_hash||ledger.event_id!==x.event_id)
      return fail('LEDGER_CONFLICT');
    return fail('ALREADY_APPLIED');
  }
  if(ledger){
    // A ledger append without its receipt cannot be repaired by inventing retroactive provenance.
    return fail('PARTIAL_WRITE_NEEDS_RECONCILIATION');
  }
  const entry={source_key:l,event_id:x.event_id,payload_hash:x.ledger_hash,status:'APPROVED_TEST'};
  store.appendLedger(entry);
  const observed=store.readLedger(l);
  if(!observed||observed.event_id!==entry.event_id||observed.payload_hash!==entry.payload_hash||
    observed.status!==entry.status)return fail('LEDGER_WRITE_OUTCOME_UNKNOWN');
  const receipt={receipt_id:receiptId,approval_source_key:a,ledger_source_key:l,
    approval_hash:x.approval_hash,ledger_hash:x.ledger_hash,event_id:x.event_id,
    status:'COMMITTED_SYNTHETIC'};
  store.appendReceipt(receipt);
  const check=store.readReceipt(receiptId);
  if(!check||Object.keys(receipt).some(k=>check[k]!==receipt[k]))
    return fail('RECEIPT_WRITE_OUTCOME_UNKNOWN');
  return {status:'COMMITTED_SYNTHETIC',receipt_id:receiptId,production_write:false};
}
