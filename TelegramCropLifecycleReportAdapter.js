/** Canonical ledger adapter: read-only, PILOT_OPERATION only. */
function bseTelegramReportLedgerRows_(book,name){
  const sheet=book.getSheetByName('PILOT_'+name);
  if(!sheet)return [];
  const last=sheet.getLastRow(),width=sheet.getLastColumn();
  if(last<2||width<1)return [];
  if(last>2001)throw new Error('REPORT_LEDGER_LIMIT');
  const all=sheet.getRange(1,1,last,width).getValues();
  const heads=all.shift().map(x=>String(x||'').trim());
  return all.filter(r=>r.some(x=>x!==''&&x!==null)).map(r=>Object.fromEntries(heads.map((h,i)=>[h,r[i]])));
}
function bseTelegramReportLedgerCycles_(book,period){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return {linked:[],unlinked_records:0,forecast_basis:'PILOT_ONLY',reason:'NOT_PILOT'};
  const names=['CROP_BATCH','PLANTING_EVENT','PLOT_ALLOCATION','TRANSPLANT_EVENT','ALLOCATION_STATUS_EVENT','OPERATION_LOG'];
  const rows=Object.fromEntries(names.map(n=>[n,bseTelegramReportLedgerRows_(book,n)]));
  const cycles=new Map(),links=new Map(),unlinked=[];
  for(const r of rows.CROP_BATCH){
    const id=String(r.batch_id||'').trim();
    if(!id||cycles.has(id))continue;
    cycles.set(id,{batch_id:id,crops:[String(r.crop||'')].filter(Boolean),variety:String(r.variety||''),plots:new Set(),stages:[],verification_status:String(r.verification_status||''),first_date:String(r.event_date||''),last_date:String(r.event_date||''),records:0});
  }
  function stage(id,date,type,source,plot){
    const c=cycles.get(String(id||''));if(!c)return false;
    if(!bseTelegramHistoryInPeriod_(String(date||''),period))return true;
    const key=String(source||'')+'|'+type+'|'+String(plot||'')+'|'+String(date||'');
    if(!c._seen)c._seen=new Set();if(c._seen.has(key))return true;c._seen.add(key);
    c.stages.push({date:String(date),type,plot:String(plot||'')});c.records++;
    if(date&&(!c.first_date||date<c.first_date))c.first_date=String(date);
    if(date&&(!c.last_date||date>c.last_date))c.last_date=String(date);
    if(plot)c.plots.add(String(plot));return true;
  }
  for(const r of rows.PLOT_ALLOCATION){const id=String(r.batch_id||'');if(cycles.has(id)){links.set(String(r.allocation_id||''),id);const c=cycles.get(id);if(r.plot_id)c.plots.add(String(r.plot_id));}}
  for(const r of rows.PLANTING_EVENT)stage(r.batch_id,r.event_date,String(r.event_type||'SEED_SOWING'),r.source_key,'');
  for(const r of rows.TRANSPLANT_EVENT){const id=String(r.batch_id||'');for(const plot of String(r.plot_ids||'').split('|').filter(Boolean))stage(id,r.event_date,'TRANSPLANT',r.source_key,plot);}
  // Status events carry explicit batch and allocation provenance; never match on plot alone.
  for(const r of rows.ALLOCATION_STATUS_EVENT){
    const id=String(r.batch_id||''),alloc=String(r.allocation_id||'');
    if(!cycles.has(id)||links.get(alloc)!==id){unlinked.push('STATUS_LINK_MISMATCH');continue;}
    // changed_at records processing time; it is not the agricultural event date.
    const c=cycles.get(id);
    if(!c.status_transitions)c.status_transitions=[];
    c.status_transitions.push({to_status:String(r.to_status||''),plot:String(r.plot_id||''),date_basis:'RECORDED_AT_ONLY'});
  }
  const statusBySource=new Map();
  for(const r of rows.ALLOCATION_STATUS_EVENT){
    const key=String(r.source_key||''),id=String(r.batch_id||'');
    if(!key||!cycles.has(id)||links.get(String(r.allocation_id||''))!==id)continue;
    if(!statusBySource.has(key))statusBySource.set(key,new Set());statusBySource.get(key).add(id);
  }
  for(const r of rows.OPERATION_LOG){
    const ids=statusBySource.get(String(r.source_key||'')),date=String(r.event_date||'');
    if(!ids||ids.size!==1){if(bseTelegramHistoryInPeriod_(date,period))unlinked.push('OPERATION_UNLINKED');continue;}
    stage(Array.from(ids)[0],date,String(r.operation_type||'OPERATION'),r.source_key,r.plot_id);
  }
  return {linked:Array.from(cycles.values()).filter(c=>c.records>0).map(c=>({batch_id:c.batch_id,crops:c.crops,variety:c.variety,plots:Array.from(c.plots),first_date:c.first_date,last_date:c.last_date,records:c.records,verification_status:c.verification_status,stages:c.stages,status_transitions:c.status_transitions||[]})),unlinked_records:unlinked.length,forecast_basis:'CANONICAL_LEDGER_EXPLICIT_BATCH_AND_SOURCE',source_tabs:names};
}