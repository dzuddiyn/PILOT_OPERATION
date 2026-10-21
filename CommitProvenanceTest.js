/** @OnlyCurrentDoc */
// Synthetic TEST_ONLY commit-time adapter. Does not bind canonical runtime writers.
function bseNondelete24Commit_(store,x){
  const fail=status=>({status,production_write:false,telegram_send:false});
  if(!x||x.environment!=='TEST_ONLY'||x.production_write!==false||x.official_bse_write!==false)return fail('ENVIRONMENT_DENIED');
  const a=String(x.approval_source_key||''),l=String(x.ledger_source_key||'');
  if(!/^BSE-TG-\d+\|Inventory_Event_Log\|C\d+$/.test(a)||!/^BSE-TG-\d+\|INVENTORY_IN\|ITEM_[FN]$/.test(l)||
     a.split('|')[0]!==l.split('|')[0]||!x.event_id||
     !/^[a-f0-9]{64}$/i.test(String(x.approval_hash||''))||!/^[a-f0-9]{64}$/i.test(String(x.ledger_hash||'')))return fail('INVALID_IDENTITY');
  if(!store||!['readIntent','writeIntent','readLedger','writeLedger','readCommitEvidence','writeCommitEvidence'].every(k=>typeof store[k]==='function'))return fail('STORE_UNAVAILABLE');
  const key=a,expected={approval_source_key:a,ledger_source_key:l,approval_hash:x.approval_hash,
    ledger_hash:x.ledger_hash,event_id:x.event_id};
  const equals=(actual,record)=>!!actual&&Object.keys(record).every(k=>actual[k]===record[k]);
  let intent=store.readIntent(key),ledger=store.readLedger(l),proof=store.readCommitEvidence(key);
  if(!intent){
    if(ledger||proof)return fail('PREEXISTING_UNVERIFIED');
    if(x.owner_authorized!==true||x.approval_status!=='REPORTER_CONFIRMED')return fail('APPROVAL_REQUIRED');
    store.writeIntent({...expected,status:'PREPARED'});
    intent=store.readIntent(key);
    if(!equals(intent,{...expected,status:'PREPARED'}))return fail('INTENT_READBACK_UNKNOWN');
  }else if(!equals(intent,expected)||!['PREPARED','COMMITTED'].includes(intent.status))return fail('INTENT_CONFLICT');
  if(ledger&&!equals(ledger,{source_key:l,payload_hash:x.ledger_hash,event_id:x.event_id,status:'APPROVED_TEST'}))return fail('LEDGER_CONFLICT');
  if(!ledger){store.writeLedger({source_key:l,payload_hash:x.ledger_hash,event_id:x.event_id,status:'APPROVED_TEST'});
    ledger=store.readLedger(l);
    if(!equals(ledger,{source_key:l,payload_hash:x.ledger_hash,event_id:x.event_id,status:'APPROVED_TEST'}))return fail('LEDGER_READBACK_UNKNOWN');
  }
  const evidence={...expected,verified:true,status:'COMMITTED_SYNTHETIC'};
  if(proof&&!equals(proof,evidence))return fail('EVIDENCE_CONFLICT');
  if(!proof){store.writeCommitEvidence(evidence);proof=store.readCommitEvidence(key);
    if(!equals(proof,evidence))return fail('EVIDENCE_READBACK_UNKNOWN');
  }
  if(intent.status!=='COMMITTED'){
    store.writeIntent({...expected,status:'COMMITTED'});
    intent=store.readIntent(key);
    if(!equals(intent,{...expected,status:'COMMITTED'}))return fail('COMMIT_READBACK_UNKNOWN');
  }
  return fail('COMMITTED_SYNTHETIC');
}
