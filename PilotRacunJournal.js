/** PILOT-only durable journal protocol. Adapter owns lock, append and flush, never Telegram. */
function bsePilotRacunJournalCommit_(plan,adapter){
  if(!plan||plan.storage_mode!=='UNLINKED_PILOT'||plan.requires_atomic_commit!==true||
     plan.production_write!==false||!Array.isArray(plan.records)||!plan.records.length)
    throw Error('RACUN_JOURNAL_INVALID_PLAN');
  if(!adapter||typeof adapter.lock!=='function'||typeof adapter.getJournal!=='function'||
     typeof adapter.createJournal!=='function'||typeof adapter.readRows!=='function'||
     typeof adapter.appendRow!=='function'||typeof adapter.setJournal!=='function'||
     typeof adapter.flush!=='function')throw Error('RACUN_JOURNAL_INVALID_ADAPTER');
  return adapter.lock(()=>{
    const expected=plan.records.map(r=>r.source_key);
    if(new Set(expected).size!==expected.length)throw Error('RACUN_DUPLICATE_SOURCE');
    const fingerprint=JSON.stringify(plan.records);
    let journal=adapter.getJournal(plan.reference);
    if(journal&&journal.fingerprint!==fingerprint)throw Error('RACUN_REVISION_CONFLICT');
    if(!journal){
      const rows=adapter.readRows(plan.reference);
      if(rows.length)throw Error('RACUN_ORPHAN_ROWS_RECONCILE');
      adapter.createJournal(plan.reference,{fingerprint: fingerprint,status:'PREPARED',count:expected.length});
      adapter.flush();
      journal=adapter.getJournal(plan.reference);
      if(!journal||journal.fingerprint!==fingerprint)throw Error('RACUN_PREPARE_READBACK_FAILED');
    }
    const valid=()=>{
      const rows=adapter.readRows(plan.reference),byKey=new Map();
      rows.forEach(row=>{
        if(!expected.includes(row.source_key))throw Error('RACUN_UNEXPECTED_ROW');
        if(byKey.has(row.source_key))throw Error('RACUN_DUPLICATE_ROW');
        byKey.set(row.source_key,row);
      });
      for(const record of plan.records){
        const existing=byKey.get(record.source_key);
        if(existing&&JSON.stringify(existing)!==JSON.stringify(record))throw Error('RACUN_ROW_MISMATCH');
      }
      return byKey;
    };
    try{
      let rows=valid();
      for(const record of plan.records){
        if(rows.has(record.source_key))continue;
        adapter.appendRow(record);adapter.flush();
        rows=valid();
        if(!rows.has(record.source_key))throw Error('RACUN_APPEND_NOT_VISIBLE');
      }
      if(rows.size!==expected.length)throw Error('RACUN_PARTIAL_WRITE');
      adapter.setJournal(plan.reference,'COMMITTED');adapter.flush();
      const finalJournal=adapter.getJournal(plan.reference);
      if(!finalJournal||finalJournal.status!=='COMMITTED'||valid().size!==expected.length)
        throw Error('RACUN_COMMIT_READBACK_FAILED');
      return {status:'COMMITTED',count:expected.length,production_write:false};
    }catch(error){
      try{adapter.setJournal(plan.reference,'RECOVERY_REQUIRED');adapter.flush();}catch(_){}
      throw Error('RACUN_RECOVERY_REQUIRED: '+String(error.message||error));
    }
  });
}
