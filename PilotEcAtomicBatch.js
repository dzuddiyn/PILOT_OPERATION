/** @OnlyCurrentDoc */
// Pure EC batch contract. One canonical value, no Sheet / Telegram effects.
function bsePilotEcCanonicalBatch_(reference,raw,eventDate){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')throw Error('EC_WRONG_ENV');
  if(!/^BSE-TG-\d+$/.test(String(reference))||!/^\d{4}-\d{2}-\d{2}$/.test(String(eventDate)))throw Error('EC_INVALID_REFERENCE_DATE');
  const readings=[],seen={};
  for(const line of String(raw||'').split(/\r?\n/)){
    const match=line.trim().match(/^(M[1-9]\d*(?:P[1-9]\d*)?)\s*-\s*(x|\d+(?:\.\d+)?|)$/i);
    if(!match)continue;
    let plot=match[1].toUpperCase();
    // EC_LEACHING-only field shorthand, never a global plot rule.
    if(plot==='M7')plot='M7P3';
    if(!/^M[1-9]\d*P[1-9]\d*$/.test(plot)||seen[plot])throw Error('EC_DUPLICATE_OR_INVALID_PLOT');
    seen[plot]=true;
    const v=match[2].toLowerCase();
    readings.push({plot_id:plot,value:v===''?null:v==='x'?null:Number(v),input_status:v===''?'BLANK':v==='x'?'NOT_MEASURED':'NUMERIC'});
  }
  if(!readings.length)throw Error('EC_NO_READINGS');
  const distinct=readings.filter(x=>x.input_status==='NUMERIC');
  if(distinct.some(x=>!Number.isFinite(x.value)||x.value<0))throw Error('EC_INVALID_VALUE');
  return {schema_version:'EC_BATCH_V1',reference:String(reference),event_date:String(eventDate),source_text:String(raw),readings:readings,source_count:readings.length,production_write:false,official_bse_write:false};
}
function bsePilotEcCanonicalValidate_(batch){
  return !!(batch&&batch.schema_version==='EC_BATCH_V1'&&batch.production_write===false&&batch.official_bse_write===false&&Array.isArray(batch.readings)&&batch.readings.length===batch.source_count&&batch.readings.length>0&&new Set(batch.readings.map(x=>x.plot_id)).size===batch.readings.length);
}

function bsePilotEcCanonicalRows_(book){
  const name='PILOT_EC_CANONICAL_BATCH';
  let sheet=book.getSheetByName(name);
  if(!sheet){sheet=book.insertSheet(name);sheet.getRange(1,1,1,4).setValues([['reference','schema_version','canonical_json','state']]);}
  return sheet;
}
// Under outer ScriptLock. A single appendRow is the sole authoritative domain write.
// Indexes are projections and must not be interpreted as canonical.
function bsePilotEcCanonicalCommit_(book,batch){
  if(!bsePilotEcCanonicalValidate_(batch)||bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')throw Error('EC_BATCH_INVALID');
  const sheet=bsePilotEcCanonicalRows_(book);
  const vals=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,4).getValues():[];
  const matches=vals.filter(x=>String(x[0])===batch.reference);
  const json=JSON.stringify(batch);
  if(matches.length>1)throw Error('EC_CANONICAL_DUPLICATE_CONFLICT');
  if(matches.length===1){
    if(matches[0][1]!==batch.schema_version||matches[0][2]!==json||matches[0][3]!=='COMMITTED')throw Error('EC_CANONICAL_SOURCE_MISMATCH');
    return {state:'ALREADY_APPLIED',count:batch.source_count};
  }
  // A transport exception may occur after the underlying write. Never blindly retry.
  try{sheet.appendRow([batch.reference,batch.schema_version,json,'COMMITTED']);SpreadsheetApp.flush();}
  catch(error){throw Error('EC_CANONICAL_WRITE_OUTCOME_UNKNOWN');}
  const now=sheet.getRange(2,1,sheet.getLastRow()-1,4).getValues().filter(x=>String(x[0])===batch.reference);
  if(now.length!==1||now[0][2]!==json||now[0][3]!=='COMMITTED')throw Error('EC_CANONICAL_READBACK_UNVERIFIED');
  return {state:'COMMITTED',count:batch.source_count};
}
function bsePilotEcDerivedIndex_(batch){
  if(!bsePilotEcCanonicalValidate_(batch))throw Error('EC_BATCH_INVALID');
  return batch.readings.map((r,i)=>({reference:batch.reference,ordinal:i+1,date:batch.event_date,plot_id:r.plot_id,input_status:r.input_status,value:r.value}));
}

function bsePilotEcReconcileCandidateBatch_(batch,result){
  if(!bsePilotEcCanonicalValidate_(batch)||!result||result.production_write!==false||result.validation!=='PASS')throw Error('EC_BATCH_RECONCILE_INVALID');
  const candidates=Array.isArray(result.candidates)?result.candidates:[];
  if(candidates.some(c=>!c||c.target!=='Measurement_Log'||c.validation!=='PASS'||!c.fields||c.fields.measurement_type!=='EC_LEACHING'))throw Error('EC_BATCH_UNEXPECTED_CANDIDATE');
  const actual=batch.readings.filter(r=>r.input_status==='NUMERIC');
  const matches=[];
  for(const r of actual){
    const hit=candidates.filter(c=>String(c.fields.plot_id||'').toUpperCase()===r.plot_id&&Number(c.fields.value)===r.value);
    // A module-only M7 proposal is not allowed to act as a plot record.
    if(hit.length===1)matches.push(hit[0]);
    else if(r.plot_id==='M7P3'&&hit.length===0&&!candidates.some(c=>String(c.fields.plot_id||'').toUpperCase()==='M7'))matches.push(null);
    else throw Error('EC_BATCH_SOURCE_CANDIDATE_MISMATCH');
  }
  if(candidates.length!==matches.filter(Boolean).length)throw Error('EC_BATCH_UNMATCHED_CANDIDATE');
  return {ok:true,canonical:batch,unrepresented_source_count:batch.readings.length-candidates.length,requires_explicit_atomic_review:true};
}

function bsePilotEcRebuildIndex_(batch,observedRows){
  const wanted=bsePilotEcDerivedIndex_(batch);
  const existing=Array.isArray(observedRows)?observedRows:[];
  const key=r=>String(r.reference)+'|'+String(r.ordinal);
  const ids=new Set();
  for(const r of existing){
    if(String(r.reference)!==batch.reference)continue;
    const id=key(r);
    if(ids.has(id))throw Error('EC_DERIVED_INDEX_DUPLICATE');
    ids.add(id);
    const expected=wanted.find(x=>key(x)===id);
    // Normalize only genuine Google Sheets round-trips; do not relax field integrity.
    const actual=Object.assign({},r);
    if(Object.prototype.toString.call(actual.date)==='[object Date]'){
      if(typeof Utilities==='undefined'||typeof Utilities.formatDate!=='function')throw Error('EC_DERIVED_DATE_ADAPTER_MISSING');
      actual.date=Utilities.formatDate(actual.date,'Asia/Kuala_Lumpur','yyyy-MM-dd');
    }
    if(actual.input_status!=='NUMERIC'&&actual.value==='')actual.value=null;
    if(!expected||JSON.stringify(actual)!==JSON.stringify(expected))throw Error('EC_DERIVED_INDEX_CONFLICT');
  }
  return {canonical_unchanged:true,expected_count:wanted.length,missing:wanted.filter(r=>!ids.has(key(r)))};
}

function bsePilotEcAggregateEnvelope_(reference,originalText,result){
  if(!/^\s*EC\s+LEACH(?:ING|ATE)?\b/i.test(String(originalText||'')))return null;
  const date=String(originalText).match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if(!date)throw Error('EC_BATCH_DATE_MISSING');
  const iso=date[3]+'-'+date[2].padStart(2,'0')+'-'+date[1].padStart(2,'0');
  const batch=bsePilotEcCanonicalBatch_(reference,originalText,iso);
  bsePilotEcReconcileCandidateBatch_(batch,result);
  return {aggregate_type:'PILOT_EC_ATOMIC',validation:'PASS',production_write:false,
    official_bse_write:false,ec_batch:batch,candidates:JSON.parse(JSON.stringify(result.candidates))};
}
function bsePilotEcCardText_(reference,envelope){
  if(!envelope||envelope.aggregate_type!=='PILOT_EC_ATOMIC'||!bsePilotEcCanonicalValidate_(envelope.ec_batch))throw Error('EC_CARD_ENVELOPE_INVALID');
  const lines=['SEMAKAN EC LEACHING','Rujukan: '+reference,'Tarikh: '+envelope.ec_batch.event_date,
    'Satu kelulusan untuk '+envelope.ec_batch.source_count+' lokasi:'];
  envelope.ec_batch.readings.forEach(r=>lines.push(r.plot_id+': '+(r.input_status==='NUMERIC'?String(r.value):r.input_status==='NOT_MEASURED'?'x':'kosong')));
  lines.push('Jika diluluskan, satu batch canonical disimpan. Bacaan x/kosong tidak dianggap bacaan nombor.');
  return lines.join('\n');
}

function bsePilotEcTelegramAggregateCore_(book,context,input,params){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')throw Error('EC_WRONG_ENV');
  if(!params||!params.proposal||params.proposal.aggregate_type!=='PILOT_EC_ATOMIC')throw Error('EC_AGGREGATE_PROPOSAL_REQUIRED');
  if(String(params.row[17])!=='OPEN'||input.kind!=='A')throw Error('EC_APPROVAL_NOT_OPEN');
  const batch=params.proposal.ec_batch;
  if(!bsePilotEcCanonicalValidate_(batch)||batch.reference!==String(params.row[0]))throw Error('EC_SOURCE_MISMATCH');
  // Caller holds bseReviewWithLock_. The write is idempotent and read back.
  const write=bsePilotEcCanonicalCommit_(book,batch);
  const approval=bseTelegramApprovalSheet_(book);
  try{
    approval.getRange(params.card_row,18).setValue('REPORTER_CONFIRMED');
    approval.getRange(params.card_row,19).setValue('PILOT_EC_ATOMIC');
    SpreadsheetApp.flush();
    bseApprovalRecomputeQueueStatus_(book,batch.reference);
  }catch(error){throw Error('EC_APPROVAL_STATE_UNVERIFIED');}
  const message='EC LEACHING DIREKODKAN\nRujukan: '+batch.reference+'\nTarikh: '+batch.event_date+'\nJumlah lokasi: '+batch.source_count+'\nStatus: Disahkan';
  const delivery=bseTelegramApprovalCloseCard_(params.row,'REPORTER_CONFIRMED',context.actor_name,message);
  return {decision:'CONFIRMED',domain:'PILOT_EC_CANONICAL_BATCH',canonical_state:write.state,receipt_state:delivery&&delivery.state||'UNVERIFIED',production_write:false};
}

function bsePilotEcTelegramReconcileExisting_(book,context,input,params){
  if(String(params.row[17])!=='REPORTER_CONFIRMED'||String(params.row[18])!=='PILOT_EC_ATOMIC'||input.kind!=='A')return {blocked:true,status:'EC_NOT_COMMITTED'};
  const sheet=book.getSheetByName('PILOT_EC_CANONICAL_BATCH');
  if(!sheet||sheet.getLastRow()<2)return {blocked:true,status:'EC_CANONICAL_MISSING'};
  const matches=sheet.getRange(2,1,sheet.getLastRow()-1,4).getValues().filter(x=>String(x[0])===String(params.row[0])&&String(x[3])==='COMMITTED');
  if(matches.length!==1)return {blocked:true,status:'EC_CANONICAL_UNVERIFIED'};
  let batch;try{batch=JSON.parse(String(matches[0][2]));}catch(_){return {blocked:true,status:'EC_CANONICAL_UNREADABLE'};}
  if(!bsePilotEcCanonicalValidate_(batch))return {blocked:true,status:'EC_CANONICAL_INVALID'};
  const message='EC LEACHING DIREKODKAN\nRujukan: '+batch.reference+'\nTarikh: '+batch.event_date+'\nJumlah lokasi: '+batch.source_count+'\nStatus: Disahkan';
  const receipt=bseTelegramApprovalCloseCard_(params.row,'REPORTER_CONFIRMED',context.actor_name,message);
  return {duplicate:true,status:'REPORTER_CONFIRMED',receipt_state:receipt&&receipt.state||'UNVERIFIED',production_write:false};
}
