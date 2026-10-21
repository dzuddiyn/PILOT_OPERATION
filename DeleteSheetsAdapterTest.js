/** @OnlyCurrentDoc */
// GI-FIELD-UX-DELETE-SHEETS-ADAPTER-08. Dependency-injected Sheets facade.
// No globals, no live wiring, and no real deletion.
const BSE_DELETE_08_BINDING_HEADERS=['approval_source_key','ledger_source_key','payload_hash','revision','status'];
const BSE_DELETE_08_JOURNAL_HEADERS=['transaction_id','status','approval_source_key','ledger_source_key','expected_hash','expected_revision'];
function bseDelete08Table_(sheet,headers){
  if(!sheet||typeof sheet.getDataRange!=='function')throw new Error('SHEET_UNAVAILABLE');
  const values=sheet.getDataRange().getValues();
  if(!values.length||headers.some((h,i)=>values[0][i]!==h))throw new Error('SCHEMA_MISMATCH');
  return values.slice(1).filter(r=>String(r[0]||'').trim());
}
function bseDelete08Find_(sheet,headers,key){
  const found=bseDelete08Table_(sheet,headers).filter(row=>String(row[0])===String(key));
  if(found.length>1)throw new Error('DUPLICATE_KEY');
  return found.length?found[0]:null;
}
function bseDelete08Store_(bindingSheet,journalSheet,ledgerSheet,ledgerHeaders){
  const bindingRow=k=>bseDelete08Find_(bindingSheet,BSE_DELETE_08_BINDING_HEADERS,k);
  const journalRow=k=>bseDelete08Find_(journalSheet,BSE_DELETE_08_JOURNAL_HEADERS,k);
  return {
    readBinding(k){const r=bindingRow(k);return r?{ledger_key:r[1],hash:r[2],revision:Number(r[3]),status:r[4]}:null;},
    readJournal(k){const r=journalRow(k);return r?{transaction_id:r[0],status:r[1],approval_source_key:r[2],source_key:r[3],expected_hash:r[4],expected_revision:Number(r[5])}:null;},
    readLedger(k){const r=bseDelete08Find_(ledgerSheet,ledgerHeaders,k);if(!r)return null;const pos=n=>ledgerHeaders.indexOf(n);if(['source_key','status','payload_hash','revision'].some(n=>pos(n)<0))throw new Error('LEDGER_SCHEMA_MISMATCH');return {source_key:r[pos('source_key')],status:r[pos('status')],payload_hash:r[pos('payload_hash')],revision:Number(r[pos('revision')])};},
    writeJournal(k,j){
      if(String(k)!==String(j.transaction_id))throw new Error('TX_ID_MISMATCH');
      const rows=bseDelete08Table_(journalSheet,BSE_DELETE_08_JOURNAL_HEADERS);
      const index=rows.findIndex(r=>String(r[0])===String(k));
      const next=[j.transaction_id,j.status,j.approval_source_key,j.source_key,j.expected_hash,j.expected_revision];
      if(index>=0)journalSheet.getRange(index+2,1,1,6).setValues([next]);
      else journalSheet.appendRow(next);
    }
  };
}
function bseDelete08LockedPrepare_(lock,store,plan){
  if(!lock||!lock.tryLock(1000))return {status:'LOCK_BUSY'};
  try{
    if(typeof bseDeletePersistCreate_!=='function')throw new Error('PERSIST_PROTOCOL_MISSING');
    const result=bseDeletePersistCreate_(store,plan);
    const after=store.readJournal(String(plan.transaction_id||''));
    if(result.status==='PREPARED'&&(!after||after.status!=='PREPARED'))return {status:'WRITE_OUTCOME_UNKNOWN'};
    return result;
  }finally{lock.releaseLock();}
}
