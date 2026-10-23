/** Existing approval sheet adapter, for PILOT Racun aggregate transitions only. */
function bsePilotRacunApprovalSheetAdapter_(book,sourceKey,expectedToken){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')throw Error('RACUN_APPROVAL_WRONG_ENV');
  if(!/^BSE-TG-\d+\|Treatment_Event_Log$/.test(String(sourceKey||'')))throw Error('RACUN_APPROVAL_BAD_KEY');
  if(!/^[a-zA-Z0-9]{8,16}$/.test(String(expectedToken||'')))throw Error('RACUN_APPROVAL_BAD_TOKEN');
  const sheet=book.getSheetByName('TEST_TELEGRAM_APPROVAL_UI');
  if(!sheet)throw Error('RACUN_APPROVAL_SHEET_MISSING');
  const header=sheet.getRange(1,1,1,BSE_APPROVAL_UI_HEADERS.length).getValues()[0].map(String);
  if(JSON.stringify(header)!==JSON.stringify(BSE_APPROVAL_UI_HEADERS))throw Error('RACUN_APPROVAL_SCHEMA_MISMATCH');
  const locate=()=>{
    const n=sheet.getLastRow();if(n<2)throw Error('RACUN_APPROVAL_NOT_FOUND');
    const rows=sheet.getRange(2,1,n-1,BSE_APPROVAL_UI_HEADERS.length).getValues();
    const hits=rows.map((row,i)=>({row,position:i+2})).filter(x=>String(x.row[1])===sourceKey);
    if(hits.length!==1)throw Error('RACUN_APPROVAL_CARD_COUNT_CONFLICT');
    if(String(hits[0].row[10])!==String(expectedToken))throw Error('RACUN_APPROVAL_TOKEN_CONFLICT');
    return hits[0];
  };
  return {
    get:ref=>{
      if(sourceKey.split('|')[0]!==ref)throw Error('RACUN_APPROVAL_REFERENCE_CONFLICT');
      const found=locate();
      return {hash:String(found.row[2]),status:String(found.row[17]),token:String(found.row[10])};
    },
    set:(ref,status)=>{
      if(status!=='REPORTER_CONFIRMED')throw Error('RACUN_APPROVAL_INVALID_TRANSITION');
      if(sourceKey.split('|')[0]!==ref)throw Error('RACUN_APPROVAL_REFERENCE_CONFLICT');
      const found=locate(),current=String(found.row[17]);
      if(current!=='OPEN'&&current!=='COMMIT_PENDING'&&current!=='REPORTER_CONFIRMED')
        throw Error('RACUN_APPROVAL_STATE_CONFLICT');
      if(current==='REPORTER_CONFIRMED')return;
      sheet.getRange(found.position,18).setValue(status);SpreadsheetApp.flush();
    }
  };
}
