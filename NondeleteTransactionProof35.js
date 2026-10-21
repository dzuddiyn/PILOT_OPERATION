/** @OnlyCurrentDoc */
// Synthetic-only transaction harness. NOT a callable Apps Script production entrypoint.
function bseNondelete35Transaction_(deps,request){
 const deny=status=>({status,production_write:false,official_bse_write:false,telegram_send:false});
 const id='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY';
 if(!request||request.environment!=='TEST_ONLY'||request.workbook_id!==id||
    request.production_write!==false||request.official_bse_write!==false||
    request.synthetic_only!==true||request.owner_authorized!==true||
    request.approval_status!=='REPORTER_CONFIRMED'||
    !/^TEST_ONLY_35_[A-Z0-9_]+$/.test(String(request.event_id||''))||
    !/^BSE-TG-900035\|Inventory_Event_Log\|C[12]$/.test(String(request.approval_source_key||''))||
    !/^BSE-TG-900035\|INVENTORY_IN\|ITEM_[FN]$/.test(String(request.ledger_source_key||'')))return deny('DENIED');
 if(!deps||!deps.book||!deps.lock)return deny('DEPENDENCIES_MISSING');
 if(deps.book.getId()!==id)return deny('BOOK_ID_MISMATCH');
 const adapter=bseNondelete26SheetsAdapter_({
   environment:'TEST_ONLY',production_write:false,official_bse_write:false,
   book:deps.book,lock:deps.lock
 });
 if(adapter.status!=='READY_TEST_ONLY')return deny(adapter.status);
 if(!deps.lock.tryLock(1000))return deny('LOCK_BUSY');
 try{
   const store=adapter.store;
   if(request.fault==='AFTER_LEDGER_APPEND'){
     const original=store.writeLedger;
     store.writeLedger=function(record){original(record);throw Error('TEST_ONLY_35_AFTER_LEDGER_APPEND');};
   }
   const outcome=bseNondelete24Commit_(store,request);
   return {...deny(outcome.status),readback:{
     intent:store.readIntent(request.approval_source_key),
     ledger:store.readLedger(request.ledger_source_key),
     evidence:store.readCommitEvidence(request.approval_source_key)
   }};
 }catch(e){return {...deny('PARTIAL_WRITE_POSSIBLE'),reason:String(e.message).slice(0,110)};}
 finally{deps.lock.releaseLock();}
}
