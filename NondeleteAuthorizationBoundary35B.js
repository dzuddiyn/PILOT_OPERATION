/** @OnlyCurrentDoc */
// Synthetic boundary only: dependency contract MUST be supplied by a separately audited trusted runtime authority.
// Never accept request.owner_authorized or request.approval_status as authority.
function bseNondelete35BAuthorizedTransaction_(deps, request){
 const deny=status=>({status,production_write:false,official_bse_write:false,telegram_send:false});
 if(!request||!deps||!deps.authSource||typeof deps.authSource.verify!=='function')return deny('AUTH_SOURCE_UNAVAILABLE');
 if(!deps.book||!deps.lock||typeof deps.lock.tryLock!=='function')return deny('DEPENDENCIES_MISSING');
 if(!deps.lock.tryLock(1000))return deny('LOCK_BUSY');
 try {
  const proof=deps.authSource.verify({
   event_id:request.event_id,approval_source_key:request.approval_source_key,
   ledger_source_key:request.ledger_source_key,approval_hash:request.approval_hash,
   ledger_hash:request.ledger_hash,workbook_id:request.workbook_id
  });
  if(!proof||proof.status!=='VERIFIED'||proof.environment!=='TEST_ONLY'||
    proof.workbook_id!=='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY'||
    proof.event_id!==request.event_id||proof.approval_source_key!==request.approval_source_key||
    proof.ledger_source_key!==request.ledger_source_key||
    proof.approval_hash!==request.approval_hash||proof.ledger_hash!==request.ledger_hash||
    proof.owner_approved!==true)return deny('AUTH_NOT_VERIFIED');
  // The transaction harness handles its own lock; release authority lock first.
  // This contract is LOCAL ONLY until atomic authorization+write under a single runtime lock is implemented.
  return deny('AUTH_VERIFIED_TRANSACTION_HOLD');
 }catch(e){return deny('AUTH_READ_FAILED');}
 finally{deps.lock.releaseLock();}
}
