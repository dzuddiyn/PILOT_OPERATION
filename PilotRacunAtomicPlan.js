/** BSE-RACUN-WRITER-02: PILOT-only, pure preflight. No Sheets, Telegram or mutation. */
function bsePilotRacunAtomicPlan_(proposal,sourceReference){
  if(typeof bseRuntimeEnvironmentName_!=='function'||bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')
    throw Error('RACUN_WRONG_ENVIRONMENT');
  if(!proposal||proposal.production_write!==false||!Array.isArray(proposal.candidates)||
      !proposal.candidates.length||proposal.candidates.length>40)throw Error('RACUN_INVALID_CANDIDATES');
  if(!/^BSE-TG-\d+$/.test(String(sourceReference||'')))throw Error('RACUN_INVALID_REFERENCE');
  const normalized=[],seen=new Set(),sourceDates=new Set();
  proposal.candidates.forEach((candidate,index)=>{
    const f=candidate&&candidate.fields||{};
    if(candidate.target!=='Treatment_Event_Log'||!Array.isArray(f.plot_ids)||!f.plot_ids.length||
       !/^2026-\d{2}-\d{2}$/.test(String(f.event_date||''))||
       !String(f.treatment_description||'').trim()||String(f.verification_status)!=='PROVISIONAL'||
       !Array.isArray(f.pending_treatment_items)||f.pending_treatment_items.length)
       throw Error('RACUN_INCOMPLETE_SECTION_'+index);
    const dt=new Date(f.event_date+'T00:00:00Z');
    if(isNaN(dt.getTime())||dt.toISOString().slice(0,10)!==f.event_date)throw Error('RACUN_BAD_DATE');
    const products=f.treatment_description.split(/\r?\n/);
    if(products.some(line=>!/^.+?\s+-\s+\d+(?:\.\d+)?(?:\s+\S.*)?$/.test(line)))throw Error('RACUN_MISSING_QUANTITY');
    const plots=f.plot_ids.map(String);
    if(new Set(plots).size!==plots.length||plots.some(p=>!/^M[1-9]\d*P[1-9]\d*$/.test(p)))
      throw Error('RACUN_BAD_PLOT');
    plots.forEach(p=>{if(seen.has(p))throw Error('RACUN_DUPLICATE_PLOT');seen.add(p);});
    sourceDates.add(f.event_date);
    normalized.push({source_key:sourceReference+'|Treatment_Event_Log|R'+String(index+1).padStart(2,'0'),
      event_date:f.event_date,plot_ids:plots,treatment_description:f.treatment_description,
      crop:String(f.crop||''),verification_status:'PROVISIONAL',batch_id:'',allocation_id:''});
  });
  if(sourceDates.size!==1)throw Error('RACUN_MIXED_DATES');
  return {reference:sourceReference,record_count:normalized.length,records:normalized,
    storage_mode:'UNLINKED_PILOT',requires_atomic_commit:true,production_write:false,official_bse_write:false};
}
