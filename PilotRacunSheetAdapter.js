/** PILOT isolated transaction storage adapter. Pass a dedicated TEST_ONLY spreadsheet in harnesses. */
const BSE_RACUN_JOURNAL_HEADERS=['reference','fingerprint','status','record_count','updated_at'];
const BSE_RACUN_ROW_HEADERS=['source_key','reference','payload_json','updated_at'];
function bsePilotRacunSheetAdapter_(book){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')throw Error('RACUN_WRONG_ENVIRONMENT');
  if(!book||typeof book.getSheetByName!=='function')throw Error('RACUN_INVALID_BOOK');
  const get=(name,headers)=>{
    const sh=book.getSheetByName(name);if(!sh)throw Error('RACUN_STORAGE_UNPROVISIONED_'+name);
    const existing=sh.getRange(1,1,1,headers.length).getValues()[0].map(String);
    if(JSON.stringify(existing)!==JSON.stringify(headers))throw Error('RACUN_SCHEMA_MISMATCH_'+name);
    return sh;
  };
  const journal=()=>get('PILOT_RACUN_TX_JOURNAL',BSE_RACUN_JOURNAL_HEADERS);
  const rows=()=>get('PILOT_RACUN_TX_ROWS',BSE_RACUN_ROW_HEADERS);
  const findJournal=ref=>{
    const sh=journal(),last=sh.getLastRow();if(last<2)return null;
    const all=sh.getRange(2,1,last-1,5).getValues();
    const hits=all.map((r,i)=>({row:r,at:i+2})).filter(x=>String(x.row[0])===ref);
    if(hits.length>1)throw Error('RACUN_DUPLICATE_JOURNAL');
    return hits[0]||null;
  };
  return {
    lock:fn=>{const lock=LockService.getScriptLock();if(!lock.tryLock(1000))throw Error('RACUN_LOCK_BUSY');try{return fn();}finally{lock.releaseLock();}},
    getJournal:ref=>{const hit=findJournal(ref);return hit?{fingerprint:String(hit.row[1]),status:String(hit.row[2]),count:Number(hit.row[3])}:null;},
    createJournal:(ref,data)=>{if(findJournal(ref))throw Error('RACUN_JOURNAL_EXISTS');journal().appendRow([ref,data.fingerprint,data.status,data.count,new Date().toISOString()]);},
    setJournal:(ref,status)=>{const hit=findJournal(ref);if(!hit)throw Error('RACUN_JOURNAL_NOT_FOUND');const sh=journal();sh.getRange(hit.at,3).setValue(status);sh.getRange(hit.at,5).setValue(new Date().toISOString());},
    readRows:ref=>{
      const sh=rows(),last=sh.getLastRow();if(last<2)return [];
      return sh.getRange(2,1,last-1,4).getValues().filter(r=>String(r[1])===ref).map(r=>{
        const value=JSON.parse(String(r[2]));if(value.source_key!==String(r[0]))throw Error('RACUN_ROW_KEY_MISMATCH');return value;
      });
    },
    appendRow:record=>{const ref=String(record.source_key).split('|')[0];rows().appendRow([record.source_key,ref,JSON.stringify(record),new Date().toISOString()]);},
    flush:()=>SpreadsheetApp.flush()
  };
}
