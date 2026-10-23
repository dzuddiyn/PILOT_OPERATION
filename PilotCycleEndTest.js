/** @OnlyCurrentDoc */
// PILOT_OPERATION cycle end: close one approved ACTIVE allocation, never delete history.
function bsePilotCycleEndResult_(input){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return null;
  const source=bseUnifiedSourceContext_(input),note=String(source.original||'').trim();
  const lines=note.split(/\r?\n/).map(x=>String(x).trim()).filter(Boolean);
  const phrase=/^(?:tarikh\s+habis\s+(?:harvest|tuai)|end\s+(?:of\s+)?(?:crop\s+)?cycle|habis\s+(?:tuai|harvest|musim|tanaman)|tamat\s+(?:musim|tuai|harvest|tanaman|kitaran(?:\s+tanaman)?)|plot\s+tamat|tanaman\s+tamat|musim\s+(?:tamat|berakhir)|crop\s+cycle\s+(?:end|completed))$/i;
  if(!lines.length||!phrase.test(lines[0].replace(/[.!]+$/,'')))return null;
  const header=phrase.test(lines[0].replace(/[.!]+$/,''));
  const date2=bseTransplantFlexibleDate_(lines[1]||''),date3=bseTransplantFlexibleDate_(lines[2]||'');
  const parsed=bseCanonicalPlotTokens_(date2?lines[2]||'':lines[1]||'');
  const plots=parsed.ok?parsed.plots:[];
  const valid=plots.length>=1&&plots.length<=2&&new Set(plots).size===plots.length;
  const date=date2||date3;
  const validation=!header||lines.length>3?'REJECTED':valid&&date?'PASS':'NEED_INFO';
  const missing=[];if(!valid)missing.push('plot_id');if(!date)missing.push('event_date');
  return {validation,production_write:false,candidates:(valid?plots:['']).map(plotId=>({
    target:'Operation_Log',validation,missing:missing.slice(),
    fields:{project_id:'BSE_SB',system_year:2026,event_date:date||'',record_type:'OPERATION',
      verification_status:'PROVISIONAL',original_note:String(source.provenance||note),
      event_time:'',plot_id:plotId,operation_type:'CYCLE_END',
      remarks:'Kitaran tanaman tamat; allocation ACTIVE ditutup selepas pengesahan Benar.'}
  }))};
}
function bsePilotCycleEndRows_(book,name,headers){
  const sheet=book.getSheetByName(name);
  return sheet?bseCropBatchRows_(sheet,headers.length):[];
}
function bsePilotCycleEndCurrentMatch_(book,fields){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return {kind:'NONE',reason:'NOT_PILOT'};
  const plot=String(fields.plot_id||''),endDate=String(fields.event_date||'');
  if(!/^M[1-9]\d*P[1-9]\d*$/.test(plot)||!bseCropBatchDate_(endDate))return {kind:'NONE',reason:'INVALID_INPUT'};
  const batches=bsePilotCycleEndRows_(book,'TEST_CROP_BATCH',BSE_CROP_BATCH_HEADERS),
    allocations=bsePilotCycleEndRows_(book,'TEST_PLOT_ALLOCATION',BSE_PLOT_ALLOCATION_HEADERS),
    reviews=bsePilotCycleEndRows_(book,'TEST_CROP_BATCH_REVIEW',BSE_CROP_BATCH_REVIEW_HEADERS),
    statuses=bsePilotCycleEndRows_(book,'TEST_ALLOCATION_STATUS_EVENT',BSE_ALLOCATION_STATUS_EVENT_HEADERS),
    transplants=bsePilotCycleEndRows_(book,'TEST_TRANSPLANT_EVENT',BSE_TRANSPLANT_EVENT_HEADERS);
  const approved=new Set(reviews.filter(r=>String(r[3])==='Crop_Batch_Log'&&String(r[5])==='APPROVED').map(r=>String(r[11]||'')));
  const effective=bseActiveAllocationEffectiveStatuses_(statuses),matches=[],occupied=[];
  allocations.forEach(row=>{
    const allocationId=String(row[3]||''),batchId=String(row[2]||'');
    if(!approved.has(batchId)||String(row[6])!=='PLANNED')return;
    const state=effective[allocationId],currentPlot=state&&state.plot_id||String(row[5]||'');
    if(currentPlot!==plot||state&&state.status==='INACTIVE')return;
    occupied.push({allocation_id:allocationId,status:state&&state.status||'PLANNED'});
    if(!state||state.status!=='ACTIVE')return;
    const transplant=transplants.find(t=>String(t[2])===state.transplant_event_id&&String(t[3])===batchId);
    if(!transplant||!bseCropBatchDate_(transplant[4])||String(transplant[4])>endDate)return;
    matches.push({allocation_id:allocationId,batch_id:batchId,plot_id:plot,
      transplant_event_id:state.transplant_event_id,transplant_date:String(transplant[4]),crop:String((batches.find(b=>String(b[2])===batchId)||[])[4]||'')});
  });
  if(matches.length!==1||occupied.length!==1)return {kind:matches.length>1||occupied.length>1?'MULTIPLE':'NONE',reason:'ACTIVE_OCCUPANCY_NOT_UNIQUE'};
  return Object.assign({kind:'UNIQUE'},matches[0]);
}
function bsePilotCycleEndQueueGuard_(book,result){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION'||!result||!Array.isArray(result.candidates)||
     !result.candidates.some(c=>c&&c.fields&&c.fields.operation_type==='CYCLE_END'))return result;
  if(result.validation!=='PASS')return result;
  const matches=result.candidates.map(c=>bsePilotCycleEndCurrentMatch_(book,c.fields));
  if(matches.every(m=>m.kind==='UNIQUE'))return result;
  result.validation='NEED_INFO';
  result.candidates.forEach((c,i)=>{c.validation='NEED_INFO';c.missing=Array.from(new Set((c.missing||[]).concat(matches[i].kind==='UNIQUE'?[]:['active_allocation_match'])));});
  return result;
}
function bsePilotCycleEndReviewCore_(book,reviewContext){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')throw new Error('Cycle end hanya untuk PILOT_OPERATION.');
  const context=bseReviewContextValidate_(reviewContext);
  if(context.action!=='APPROVED')throw new Error('Cycle end memerlukan Benar penghantar.');
  const picked=bseOperationDecisionCandidate_(context.proposalResult,'Operation_Log'),c=picked.candidate,f=c.fields;
  if(f.operation_type!=='CYCLE_END'||!bseCropBatchDate_(f.event_date)||!/^M[1-9]\d*P[1-9]\d*$/.test(String(f.plot_id||'')))
    throw new Error('Kontrak Cycle End tidak sah.');
  const hash=bseOperationDecisionHash_(c),key=bseOperationDecisionSourceKey_(context.reference,'Operation_Log',hash);
  const logs=bsePilotCycleEndRows_(book,'TEST_OPERATION_LOG',BSE_OPERATION_LOG_HEADERS),
    reviews=bsePilotCycleEndRows_(book,'TEST_OPERATION_REVIEW',BSE_OPERATION_REVIEW_HEADERS),
    statuses=bsePilotCycleEndRows_(book,'TEST_ALLOCATION_STATUS_EVENT',BSE_ALLOCATION_STATUS_EVENT_HEADERS);
  const priorLog=logs.filter(r=>String(r[0])===key),priorReview=reviews.filter(r=>String(r[1])===key),
    priorStatus=statuses.filter(r=>String(r[0])===key);
  if(priorLog.length||priorReview.length||priorStatus.length){
    if(priorLog.length!==1||priorReview.length!==1||priorStatus.length!==1||
       String(priorLog[0][12])!==hash||String(priorReview[0][5])!==hash||
       String(priorStatus[0][11])!==hash||String(priorStatus[0][8])!=='INACTIVE')
      throw new Error('PARTIAL WRITE DETECTED: Cycle End tidak lengkap; perlu rekonsiliasi manual.');
    return {source_key:key,duplicate:true,allocation_status:'INACTIVE',production_write:false};
  }
  const match=bsePilotCycleEndCurrentMatch_(book,f);
  if(match.kind!=='UNIQUE')throw new Error('CURRENT_STATE_CONFLICT: tiada tepat satu allocation ACTIVE untuk ditamatkan.');
  // Preserve write order: record Operation and its review before appending the
  // lifecycle transition. A failed status append does not yield a success result.
  const operation=bseOperationReviewCore_(book,reviewContext);
  if(!operation||operation.source_key!==key||operation.duplicate)throw new Error('Operation Cycle End write tidak disahkan.');
  const out=bseCropBatchSheet_(book,'TEST_ALLOCATION_STATUS_EVENT',BSE_ALLOCATION_STATUS_EVENT_HEADERS);
  bseCropBatchAppend_(out,[key,String(context.reference).replace(/^BSE-TG-/,''),Utilities.getUuid(),
    match.transplant_event_id,match.batch_id,match.allocation_id,match.plot_id,
    'ACTIVE','INACTIVE',new Date().toISOString(),String(context.actor_name||context.actor_id||'TEST_OPERATOR'),hash]);
  SpreadsheetApp.flush();
  const confirmed=bsePilotCycleEndRows_(book,'TEST_ALLOCATION_STATUS_EVENT',BSE_ALLOCATION_STATUS_EVENT_HEADERS).filter(r=>String(r[0])===key);
  if(confirmed.length!==1||String(confirmed[0][5])!==match.allocation_id||String(confirmed[0][7])!=='ACTIVE'||String(confirmed[0][8])!=='INACTIVE'||String(confirmed[0][11])!==hash)throw new Error('PARTIAL WRITE DETECTED: Cycle End read-back tidak sepadan.');
  return {source_key:key,duplicate:false,allocation_status:'INACTIVE',plot_id:match.plot_id,production_write:false};
}

function runBsePilotCycleEndHarnessTests(){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return [{id:'PILOT_ONLY_SKIP',pass:true}];
  const aliases=['Tarikh habis harvest','Tarikh habis tuai','end of cycle','habis tuai',
    'plot tamat','tanaman tamat','habis harvest'];
  const tests=[];
  const add=(name,fn)=>{let pass=false;try{pass=!!fn();}catch(_){pass=false;}tests.push({id:name,pass:pass});};
  add('seven aliases and both date formats',()=>aliases.every(a=>['13-09-26','13/09/26'].every(date=>{
    const r=bsePilotCycleEndResult_(a+'\nM3P1\n'+date);
    return r&&r.validation==='PASS'&&r.candidates[0].fields.event_date==='2026-09-13'&&
      r.candidates[0].fields.operation_type==='CYCLE_END';
  })));
  add('paired shorthand creates two independent Operation cards',()=>{
    const r=bsePilotCycleEndResult_('plot tamat\nM3P12\n13/09/26');
    return r&&r.validation==='PASS'&&r.candidates.length===2&&
      r.candidates.map(c=>c.fields.plot_id).join('|')==='M3P1|M3P2'&&
      bseApprovalEnvelopes_(r).length===2&&bsePilotOperationReviewCardOnly_(r,'NEEDS_HUMAN_REVIEW');
  });
  add('no guessing duplicates or dates',()=>{
    const bad=bsePilotCycleEndResult_('end of cycle\nM3P11\n13/09/26'),
      date=bsePilotCycleEndResult_('plot tamat\nM3P1\n31/02/26');
    return bad&&bad.validation!=='PASS'&&date&&date.validation!=='PASS';
  });
  add('reporter Benar gate and lifecycle event append',()=>{
    const core=bsePilotCycleEndReviewCore_.toString();
    return core.includes("context.action!=='APPROVED'")&&
      core.includes("bseOperationReviewCore_")&&core.includes("bseCropBatchAppend_")&&
      core.includes("'ACTIVE','INACTIVE'")&&core.includes('PARTIAL WRITE DETECTED');
  });
  add('as-of dates never backdate INACTIVE to transplant',()=>{
    const trans=[['',1,'TR-1','B-1','2026-08-12']],
      active=['',1,'E-1','TR-1','B-1','A-1','M3P1','PLANNED','ACTIVE','2026-08-12T00:00:00Z'],
      inactive=['closure',2,'E-2','TR-1','B-1','A-1','M3P1','ACTIVE','INACTIVE','2026-10-20T00:00:00Z'],
      operation=[['closure',2,0,'2026-09-20','','M3P1','CYCLE_END']];
    return bsePilotCycleStatusEventsAsOf_('2026-09-19',[active,inactive],trans,operation).length===1&&
      bsePilotCycleStatusEventsAsOf_('2026-09-20',[active,inactive],trans,operation).length===2;
  });
  add('worker uses cycle end before Treatment and AI fallback',()=>{
    const src=processBseTelegramTestQueue.toString();
    return src.indexOf('bsePilotCycleEndResult_(job.input)')>=0&&
      src.indexOf('bsePilotCycleEndResult_(job.input)')<src.indexOf('bseTreatmentListParseMessage_(job.input,job.receivedAt)');
  });
  const failed=tests.filter(t=>!t.pass);
  console.log('PILOT_CYCLE_END_HARNESS: '+JSON.stringify(tests));
  if(failed.length)throw new Error('Cycle End harness gagal: '+failed.map(t=>t.id).join(', '));
  return tests;
}

// Historical as-of semantics: closure is dated by the Operation_Log event date;
// never treat the original transplant date as the date of the CYCLE_END event.
function bsePilotCycleStatusEventsAsOf_(eventDate,statusEvents,transplantEvents,operationLogs){
  const cutoff=String(eventDate||''),startDates={},endDates={};
  (transplantEvents||[]).forEach(r=>{if(bseCropBatchDate_(r[4]))startDates[String(r[2])]=String(r[4]);});
  (operationLogs||[]).forEach(r=>{if(String(r[6])==='CYCLE_END'&&bseCropBatchDate_(r[3]))endDates[String(r[0])]=String(r[3]);});
  return (statusEvents||[]).filter(r=>{
    const date=String(r[8])==='INACTIVE'?endDates[String(r[0])]:startDates[String(r[3])];
    return !!date&&date<=cutoff;
  });
}
