/** @OnlyCurrentDoc */
/* TEST_ONLY isolated Apps Script runtime harness; no callback, trigger or network output. */
const BSE_ND30_BOOK_ID='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY';
function bseNondelete30Runtime_(deps,request){
 const result=status=>({status,production_write:false,official_bse_write:false,telegram_send:false});
 if(!request||request.environment!=='TEST_ONLY'||request.production_write!==false||
    request.official_bse_write!==false||request.confirmed_fixture!==true||
    request.workbook_id!==BSE_ND30_BOOK_ID||!/^TEST_ONLY_30_[A-Z0-9_]+$/.test(String(request.fixture_id||'')))
   return result('DENIED');
 if(!deps||!deps.spreadsheetApp||!deps.lockService)return result('DEPENDENCIES_MISSING');
 const lock=deps.lockService.getScriptLock();
 if(!lock||!lock.tryLock(1000))return result('LOCK_BUSY');
 try{
   const book=deps.spreadsheetApp.openById(BSE_ND30_BOOK_ID);
   if(!book||book.getId()!==BSE_ND30_BOOK_ID)return result('BOOK_ID_MISMATCH');
   const adapter=bseNondelete26SheetsAdapter_({
     book,lock,environment:'TEST_ONLY',production_write:false,official_bse_write:false
   });
   if(adapter.status!=='READY_TEST_ONLY')return result(adapter.status);
   // No actual mutation in Gate 30: validation/read-back-only preflight.
   const last={};
   for(const name of Object.values(adapter.names)){
     const sh=book.getSheetByName(name);
     last[name]=sh.getLastRow();
     if(last[name]<1)return result('INVALID_SHEET_ROWS');
   }
   if(request.fault==='AFTER_SCHEMA_CHECK')throw Error('TEST_ONLY_30_INJECTED_FAILURE');
   return {...result('READ_ONLY_READY'),row_counts:last};
 }catch(e){
   return {...result('FAIL_CLOSED'),reason:String(e&&e.message||'UNKNOWN').slice(0,120)};
 }finally{lock.releaseLock();}
}
