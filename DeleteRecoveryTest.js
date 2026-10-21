/** @OnlyCurrentDoc */
// GI-FIELD-UX-DELETE-RECOVERY-13: injected store only. No live writer integration.
function bseDeleteRecovery13Run_(store,input){
  const x=input||{},id=String(x.transaction_id||''),key=String(x.ledger_source_key||'');
  const fail=status=>({status,production_write:false});
  if(!/^R13-[A-Z0-9_-]{5,32}$/.test(id)||!/^BSE-TG-\d+\|INVENTORY_(?:IN|OUT)$/.test(key)||
    !/^BSE-TG-\d+\|Inventory_Event_Log\|C\d+$/.test(String(x.approval_source_key||''))||
    x.approval_source_key.split('|')[0]!==key.split('|')[0]||
    !/^[a-f0-9]{64}$/i.test(String(x.ledger_hash||''))||!String(x.event_id||''))
    return fail('INVALID_PRECONDITIONS');
  if(x.authorized!==true||x.approval_status!=='REPORTER_CONFIRMED')return fail('APPROVAL_REQUIRED');
  const expected={transaction_id:id,status:'PREPARED',ledger_source_key:key,approval_source_key:x.approval_source_key,
    ledger_hash:x.ledger_hash,approval_hash:x.approval_hash,event_id:x.event_id};
  let journal=store.readJournal(id);
  if(journal){
    if(Object.keys(expected).filter(k=>k!=='status').some(k=>journal[k]!==expected[k]))
      return fail('JOURNAL_CONFLICT');
    if(journal.status==='COMMITTED')return fail('ALREADY_APPLIED');
    if(!['PREPARED','LEDGER_VERIFIED','RECEIPT_VERIFIED'].includes(journal.status))
      return fail('NEEDS_RECONCILIATION');
  }else{
    // Refuse legacy ledger without a transaction journal; never retroactively mint provenance.
    if(store.readLedger(key)||store.readReceipt(id))return fail('PREEXISTING_DATA_UNVERIFIED');
    store.writeJournal(expected);
    journal=store.readJournal(id);
    if(!journal||journal.status!=='PREPARED')return fail('JOURNAL_WRITE_UNKNOWN');
  }
  const entry={source_key:key,event_id:x.event_id,payload_hash:x.ledger_hash,status:'APPROVED_TEST',transaction_id:id};
  let ledger=store.readLedger(key);
  if(!ledger){store.writeLedger(entry);ledger=store.readLedger(key);}
  if(!ledger||Object.keys(entry).some(k=>entry[k]!==ledger[k]))return fail('LEDGER_CONFLICT_OR_UNKNOWN');
  if(journal.status==='PREPARED'){
    store.writeJournal({...expected,status:'LEDGER_VERIFIED'});
    journal=store.readJournal(id);
    if(!journal||journal.status!=='LEDGER_VERIFIED')return fail('JOURNAL_WRITE_UNKNOWN');
  }
  const receipt={transaction_id:id,approval_source_key:x.approval_source_key,ledger_source_key:key,
    ledger_hash:x.ledger_hash,approval_hash:x.approval_hash,event_id:x.event_id,status:'RECEIPT_SYNTHETIC'};
  let observed=store.readReceipt(id);
  if(!observed){store.writeReceipt(receipt);observed=store.readReceipt(id);}
  if(!observed||Object.keys(receipt).some(k=>receipt[k]!==observed[k]))return fail('RECEIPT_CONFLICT_OR_UNKNOWN');
  if(journal.status==='LEDGER_VERIFIED'){
    store.writeJournal({...expected,status:'RECEIPT_VERIFIED'});
    journal=store.readJournal(id);
    if(!journal||journal.status!=='RECEIPT_VERIFIED')return fail('JOURNAL_WRITE_UNKNOWN');
  }
  store.writeJournal({...expected,status:'COMMITTED'});
  const final=store.readJournal(id);
  if(!final||final.status!=='COMMITTED')return fail('COMMIT_READBACK_UNKNOWN');
  return fail('COMMITTED_SYNTHETIC');
}
