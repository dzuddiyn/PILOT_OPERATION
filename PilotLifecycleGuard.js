// CL-02/04: one open crop cycle per effective physical plot. Read-only, fail closed.
function bsePilotLifecycleOccupancy_(allocations,statuses){
 const states={},open={};
 (allocations||[]).forEach(r=>{const id=String(r[3]||'');if(id)states[id]={id:id,batch:String(r[2]||''),plot:String(r[5]||'').toUpperCase(),state:String(r[6]||'PLANNED'),sown:String(r[4]||'')};});
 (statuses||[]).forEach(r=>{
   const s=states[String(r[5]||'')];if(!s)return;
   const from=String(r[7]||''),to=String(r[8]||''),plot=String(r[6]||'').toUpperCase();
   if(s.state!==from||!['ACTIVE','INACTIVE'].includes(to)){s.invalid=true;return;}
   s.state=to;if(plot)s.plot=plot;
 });
 Object.keys(states).forEach(id=>{const s=states[id];if(s.state==='INACTIVE')return;
   if(!s.plot||s.invalid||!['PLANNED','ACTIVE'].includes(s.state))s.invalid=true;
   (open[s.plot]||(open[s.plot]=[])).push(s);
 });
 return open;
}
function bsePilotLifecycleRequireFreePlots_(allocations,statuses,plots){
 const open=bsePilotLifecycleOccupancy_(allocations,statuses);
 const conflicts=(plots||[]).filter(p=>(open[String(p).toUpperCase()]||[]).length>0);
 if(conflicts.length)throw new Error('CROP_LIFECYCLE_CONFLICT: plot masih mempunyai kitaran terbuka: '+conflicts.join(', '));
 return true;
}
function bsePilotLifecycleRequireUniqueActive_(allocations,statuses,plots,batchId,transplantDate,reallocation){
 const open=bsePilotLifecycleOccupancy_(allocations,statuses);
 if(reallocation&&reallocation.required){
   const src=(open[String(reallocation.from_plot_id||'').toUpperCase()]||[]).filter(x=>x.id===String(reallocation.allocation_id||'')&&x.batch===String(batchId||'')&&x.state==='PLANNED');
   const destination=String(reallocation.to_plot_id||'').toUpperCase();
   if(src.length!==1||destination!==String((plots||[])[0]||'').toUpperCase()||(plots||[]).length!==1||(open[destination]||[]).length)
     throw new Error('CROP_LIFECYCLE_CONFLICT: reallocation source/destination tidak unik atau plot destinasi berisi');
   if(transplantDate&&src[0].sown>transplantDate)throw new Error('CROP_LIFECYCLE_DATE_CONFLICT: transplant mendahului semaian');
   return true;
 }
 (plots||[]).forEach(p=>{
   const entries=open[String(p).toUpperCase()]||[];
   if(entries.length!==1||entries[0].state!=='PLANNED'||entries[0].batch!==String(batchId||''))
     throw new Error('CROP_LIFECYCLE_CONFLICT: transplant memerlukan tepat satu PLANNED tanpa overlap bagi '+p);
   if(transplantDate&&entries[0].sown>transplantDate)
     throw new Error('CROP_LIFECYCLE_DATE_CONFLICT: transplant mendahului semaian '+p);
 });
 return true;
}
function bsePilotLifecycleRequireHarvestStart_(allocations,statuses,logs,plot,date,sourceKey){
 const open=bsePilotLifecycleOccupancy_(allocations,statuses),entries=open[String(plot||'').toUpperCase()]||[];
 if(entries.length!==1||entries[0].state!=='ACTIVE')throw new Error('CROP_LIFECYCLE_CONFLICT: mula tuai memerlukan tepat satu ACTIVE');
 if(date&&entries[0].sown>date)throw new Error('CROP_LIFECYCLE_DATE_CONFLICT: mula tuai mendahului semaian');
 const existing=(logs||[]).filter(r=>String(r[5]).toUpperCase()===String(plot||'').toUpperCase()&&String(r[6])==='HARVEST_START'&&String(r[0])!==String(sourceKey)&&(!String(r[3]||'')||String(r[3])>=entries[0].sown));
 if(existing.length)throw new Error('CROP_LIFECYCLE_CONFLICT: tarikh mula tuai sudah direkodkan bagi plot; perlu reconciliation');
 return true;
}
function bsePilotLifecycleBookRows_(book,name,headers){
 const sheet=book.getSheetByName(name);return sheet?bseCropBatchRows_(sheet,headers.length):[];
}
