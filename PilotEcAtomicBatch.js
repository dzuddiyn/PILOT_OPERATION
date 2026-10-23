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
