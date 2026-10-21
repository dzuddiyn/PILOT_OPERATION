/** @OnlyCurrentDoc */
// Dependency-injected TEST_ONLY Sheet adapter, no SpreadsheetApp/LockService binding.
function bseNondelete26SheetsAdapter_(deps){
  const d=deps||{},names={intent:'TEST_ONLY_NONDELETE_INTENT',ledger:'TEST_ONLY_NONDELETE_LEDGER',evidence:'TEST_ONLY_NONDELETE_EVIDENCE',receipt:'TEST_ONLY_NONDELETE_RECEIPT'};
  const specs={intent:['approval_source_key','ledger_source_key','approval_hash','ledger_hash','event_id','status'],
    ledger:['source_key','payload_hash','event_id','status'],
    evidence:['approval_source_key','ledger_source_key','approval_hash','ledger_hash','event_id','verified','status'],
    receipt:['receipt_id','approval_source_key','ledger_source_key','approval_hash','ledger_hash','event_id','status']};
  if(d.environment!=='TEST_ONLY'||d.production_write!==false||d.official_bse_write!==false||
     d.enable_runtime===true||!d.book||!d.lock||typeof d.lock.tryLock!=='function'||typeof d.lock.releaseLock!=='function')
    return {status:'ENVIRONMENT_OR_DEPENDENCIES_DENIED',production_write:false};
  const sheets={};
  for(const kind of Object.keys(names)){
    const s=d.book.getSheetByName(names[kind]);
    if(!s)return {status:'SHEET_MISSING',kind,production_write:false};
    const actual=s.getRange(1,1,1,specs[kind].length).getValues()[0];
    if(actual.length!==specs[kind].length||actual.some((v,i)=>v!==specs[kind][i])||
       (typeof s.getLastColumn==='function'&&s.getLastColumn()!==specs[kind].length))
      return {status:'SCHEMA_MISMATCH',kind,production_write:false};
    sheets[kind]=s;
  }
  const read=(kind,key)=>{const sh=sheets[kind],columns=specs[kind],last=sh.getLastRow();
    if(last<2)return null;
    const rows=sh.getRange(2,1,last-1,columns.length).getValues();
    const matches=rows.filter(r=>String(r[0])===String(key));
    if(matches.length>1)throw Error('DUPLICATE_'+kind.toUpperCase());
    if(!matches.length)return null;
    const result={};columns.forEach((k,i)=>result[k]=matches[0][i]);return result;
  };
  const write=(kind,record)=>{const columns=specs[kind],key=record[columns[0]];
    if(!String(key||''))throw Error('KEY_MISSING');
    const existing=read(kind,key);
    if(existing){if(kind!=='intent'||existing.status!=='PREPARED'||record.status!=='COMMITTED'||columns.some(k=>k!=='status'&&String(existing[k])!==String(record[k])))throw Error('EXISTING_ROW_CONFLICT');const sh=sheets[kind],rows=sh.getRange(2,1,sh.getLastRow()-1,columns.length).getValues();const index=rows.findIndex(r=>String(r[0])===String(key));sh.getRange(index+2,1,1,columns.length).setValues([columns.map(k=>record[k]===undefined?'':record[k])]);return;}
    sheets[kind].appendRow(columns.map(k=>record[k]===undefined?'':record[k]));
  };
  const store={readIntent:key=>read('intent',key),readLedger:key=>read('ledger',key),
    readCommitEvidence:key=>read('evidence',key),readReceipt:key=>read('receipt',key),
    writeIntent:r=>write('intent',r),writeLedger:r=>write('ledger',r),
    writeCommitEvidence:r=>write('evidence',r),writeReceipt:r=>write('receipt',r)};
  return {status:'READY_TEST_ONLY',production_write:false,store,lock:d.lock,specs,names};
}
function bseNondelete26WithLock_(adapter,callback){
  if(!adapter||adapter.status!=='READY_TEST_ONLY')return {status:'ADAPTER_NOT_READY',production_write:false};
  if(!adapter.lock.tryLock(1000))return {status:'LOCK_BUSY',production_write:false};
  try{return callback(adapter.store);}finally{adapter.lock.releaseLock();}
}
