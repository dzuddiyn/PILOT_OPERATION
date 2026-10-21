/** @OnlyCurrentDoc */
/* TEST_ONLY read-only entrypoint. No installable trigger, Telegram or writes. */
function bseNondelete32ReadOnlyProof(){
  return bseNondelete32Invoke_({
    spreadsheetApp:SpreadsheetApp,
    lockService:LockService
  });
}
function bseNondelete32Invoke_(deps){
  if(!deps||!deps.spreadsheetApp||!deps.lockService)
    return {status:'DEPENDENCIES_MISSING',production_write:false,official_bse_write:false};
  return bseNondelete30Runtime_(deps,{
    environment:'TEST_ONLY',
    production_write:false,
    official_bse_write:false,
    confirmed_fixture:true,
    workbook_id:BSE_ND30_BOOK_ID,
    fixture_id:'TEST_ONLY_30_ENTRYPOINT_32'
  });
}
