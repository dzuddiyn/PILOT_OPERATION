/** @OnlyCurrentDoc */
// GI-FIELD-UX-DELETE-PERSISTENCE-07: injected-store journal protocol.
// NOT WIRED to live Sheets, callback, Telegram or any real record mutation.
function bseDeletePersistCreate_(store,plan){
  if(!plan||plan.status!=='READY_NO_WRITE')return {status:'PLAN_NOT_READY'};
  const id=String(plan.transaction_id||'');
  const existing=store.readJournal(id);
  if(existing){
    if(existing.source_key!==plan.source_key||existing.approval_source_key!==plan.approval_source_key||
       existing.expected_hash!==plan.expected_hash||existing.expected_revision!==plan.expected_revision)
      return {status:'REVISION_CONFLICT'};
    return {status:'ALREADY_PREPARED',journal:existing};
  }
  const binding=store.readBinding(plan.approval_source_key);
  if(!binding||binding.ledger_key!==plan.source_key||binding.hash!==plan.expected_hash||
     binding.revision!==plan.expected_revision)return {status:'BINDING_MISMATCH'};
  const journal={transaction_id:id,status:'PREPARED',source_key:plan.source_key,
    approval_source_key:plan.approval_source_key,expected_hash:plan.expected_hash,
    expected_revision:plan.expected_revision};
  store.writeJournal(id,journal);
  const observed=store.readJournal(id);
  if(!observed||JSON.stringify(observed)!==JSON.stringify(journal))
    return {status:'WRITE_OUTCOME_UNKNOWN'};
  return {status:'PREPARED',journal:observed};
}
function bseDeletePersistObserve_(store,id){
  const j=store.readJournal(id);
  if(!j)return {status:'MISSING_JOURNAL'};
  const binding=store.readBinding(j.approval_source_key);
  if(!binding||binding.ledger_key!==j.source_key||binding.hash!==j.expected_hash||
     binding.revision!==j.expected_revision)return {status:'BINDING_DRIFT'};
  const ledger=store.readLedger(j.source_key);
  if(!ledger||ledger.source_key!==j.source_key)return {status:'LEDGER_MISMATCH'};
  if(ledger.payload_hash!==j.expected_hash||ledger.revision!==j.expected_revision)return {status:'REVISION_CONFLICT'};
  return {status:j.status,ledger_status:ledger.status,transaction_id:id};
}
function bseDeletePersistReconcile_(store,id,observed){
  const j=store.readJournal(id);
  if(!j)return {status:'MISSING_JOURNAL'};
  if(j.status==='COMMITTED')return {status:'ALREADY_APPLIED'};
  if(!['APPLYING','NEEDS_RECONCILIATION'].includes(j.status))return {status:'BLOCKED_STATE'};
  const next=(observed&&observed.ledger_void===true&&observed.approval_void===true&&observed.queue_consistent===true)
    ?'COMMITTED':'NEEDS_RECONCILIATION';
  const updated=Object.assign({},j,{status:next});
  store.writeJournal(id,updated);
  const verify=store.readJournal(id);
  if(!verify||verify.status!==next||verify.source_key!==j.source_key)
    return {status:'WRITE_OUTCOME_UNKNOWN'};
  return {status:next};
}
