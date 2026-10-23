/** PILOT Racun source-field readiness, independent of callback/ledger readiness. */
function bsePilotRacunSourceAssessment_(result){
  if(!result||result.production_write!==false||!Array.isArray(result.candidates)||result.candidates.length<2||
    !result.candidates.every(c=>c&&c.target==='Treatment_Event_Log'))return {status:'NOT_RACUN'};
  const missing=[];
  for(let index=0;index<result.candidates.length;index++){
    const f=result.candidates[index].fields||{},row=index+1;
    if(!/^2026-\d\d-\d\d$/.test(String(f.event_date||'')))missing.push('R'+row+':event_date');
    if(!Array.isArray(f.plot_ids)||!f.plot_ids.length)missing.push('R'+row+':plot_ids');
    if(!String(f.treatment_description||'').trim())missing.push('R'+row+':treatment_description');
    if(Array.isArray(f.pending_treatment_items)&&f.pending_treatment_items.length)missing.push('R'+row+':treatment_dosage');
    if((result.candidates[index].missing||[]).some(x=>!['batch_match','allocation_state_unverified','active_allocation_unverified'].includes(x)))
      missing.push('R'+row+':parser_missing');
  }
  return {status:missing.length?'SOURCE_INCOMPLETE':'SOURCE_COMPLETE_STORAGE_BLOCKED',
    missing:Array.from(new Set(missing)),record_count:result.candidates.length,
    actionable:false,production_write:false};
}
