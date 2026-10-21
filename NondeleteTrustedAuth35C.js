/** @OnlyCurrentDoc */
// Gate 35C synthetic authority fixture. No callable live-write entrypoint.
// Approval rows must originate from an independently controlled store; caller-provided flags are ignored.
function bseNondelete35CAtomic_(deps, request) {
 const status=s=>({status:s,production_write:false,official_bse_write:false,telegram_send:false});
 const id='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY';
 if(!deps||!deps.book||!deps.lock||!deps.approvalStore||typeof deps.approvalStore.read!=='function')
   return status('AUTHORITY_UNAVAILABLE');
 if(!request||request.environment!=='TEST_ONLY'||request.workbook_id!==id||
    request.synthetic_only!==true||request.production_write!==false||request.official_bse_write!==false||
    !/^TEST_ONLY_35_[A-Z0-9_]+$/.test(String(request.event_id||'')))return status('DENIED');
 if(deps.book.getId()!==id)return status('BOOK_MISMATCH');
 if(!deps.lock.tryLock(1000))return status('LOCK_BUSY');
 try {
   const a=deps.approvalStore.read(request.approval_source_key);
   if(!a||a.environment!=='TEST_ONLY'||a.workbook_id!==id||
      a.status!=='APPROVED'||a.owner_identity!=='TEST_ONLY_OWNER_35C'||
      a.revision!==1||a.event_id!==request.event_id||
      a.approval_source_key!==request.approval_source_key||
      a.ledger_source_key!==request.ledger_source_key||
      a.approval_hash!==request.approval_hash||a.ledger_hash!==request.ledger_hash)
     return status('AUTH_NOT_VERIFIED');
   // Approval is read inside the SAME held lock as the journal transaction.
   const adapter=bseNondelete26SheetsAdapter_({environment:'TEST_ONLY',
      production_write:false,official_bse_write:false,book:deps.book,lock:deps.lock});
   if(adapter.status!=='READY_TEST_ONLY')return status(adapter.status);
   const outcome=bseNondelete24Commit_(adapter.store,{
      ...request,environment:'TEST_ONLY',owner_authorized:true,
      approval_status:'REPORTER_CONFIRMED',production_write:false,official_bse_write:false
   });
   return {...status(outcome.status),readback:{
     intent:adapter.store.readIntent(request.approval_source_key),
     ledger:adapter.store.readLedger(request.ledger_source_key),
     evidence:adapter.store.readCommitEvidence(request.approval_source_key)
   }};
 } catch(e){return {...status('WRITE_OUTCOME_UNKNOWN'),reason:String(e.message).slice(0,120)};}
 finally{deps.lock.releaseLock();}
}
