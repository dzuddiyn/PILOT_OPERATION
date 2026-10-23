/** Pure reconciliation after durable Racun ledger commit; never fakes callback success. */
function bsePilotRacunApprovalReconcile_(plan,adapter,approval){
  if(!plan||plan.storage_mode!=='UNLINKED_PILOT'||!adapter||!approval||
     typeof adapter.getJournal!=='function'||typeof adapter.readRows!=='function')
    throw Error('RACUN_RECONCILE_INVALID_INPUT');
  const j=adapter.getJournal(plan.reference),rows=adapter.readRows(plan.reference);
  if(!j||j.status!=='COMMITTED')return {status:'RECOVERY_REQUIRED',approval_write:false};
  if(j.fingerprint!==JSON.stringify(plan.records)||j.count!==plan.record_count)
    throw Error('RACUN_RECONCILE_REVISION_CONFLICT');
  const byKey=new Map();
  for(const r of rows){
    if(byKey.has(r.source_key))throw Error('RACUN_RECONCILE_DUPLICATE');
    byKey.set(r.source_key,r);
  }
  if(byKey.size!==plan.record_count||plan.records.some(r=>JSON.stringify(byKey.get(r.source_key))!==JSON.stringify(r)))
    return {status:'RECOVERY_REQUIRED',approval_write:false};
  if(approval.hash_verified!==true||approval.authorized!==true||approval.reference!==plan.reference)
    throw Error('RACUN_RECONCILE_NOT_AUTHORIZED');
  // No transition here: caller must bind to persistent approval state and recheck after write.
  return {status:'LEDGER_VERIFIED',approval_write:false,record_count:plan.record_count};
}
