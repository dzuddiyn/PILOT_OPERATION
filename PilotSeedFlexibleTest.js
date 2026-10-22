/** @OnlyCurrentDoc */
// GI-UX-05 — bounded PILOT-only flexible sowing date/plot parser.
// No lifecycle transition or write is performed by this parser.
function bsePilotSeedFlexibleDate_(value){
  const raw=String(value||'').trim().replace(/^(?:Tarikh(?: Semai)?|Date)\s*:\s*/i,'');
  if(/^\d{1,2}[./-]\d{1,2}$/.test(raw))
    return bseTransplantFlexibleDate_(raw.replace(/[.-]/g,'/')+'/2026');
  if(/^2026-\d{1,2}-\d{1,2}$/.test(raw)){
    const m=raw.match(/^2026-(\d{1,2})-(\d{1,2})$/),mo=Number(m[1]),day=Number(m[2]),d=new Date(Date.UTC(2026,mo-1,day));
    return d.getUTCFullYear()===2026&&d.getUTCMonth()===mo-1&&d.getUTCDate()===day
      ?'2026-'+String(mo).padStart(2,'0')+'-'+String(day).padStart(2,'0'):'';
  }
  return bseTransplantFlexibleDate_(raw.replace(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/,'$1/$2/$3'));
}
function bsePilotSeedFlexiblePlots_(text){
  const raw=String(text||'').trim().replace(/^(?:Modul|Plot)\s*:\s*/i,'');
  const moduleOnly=raw.match(/^M\s*([1-9]\d*)\s+((?:P\s*[1-9]\d*\s*){2,})$/i);
  if(moduleOnly){
    const parts=moduleOnly[2].match(/P\s*[1-9]\d*/gi)||[],plots=parts.map(x=>'M'+moduleOnly[1]+x.replace(/\s+/g,'').toUpperCase());
    return {ok:plots.length>=1&&new Set(plots).size===plots.length&&plots.length<=12,plots};
  }
  const matcher=/\bM\s*([1-9]\d*)\s*P\s*([1-9]\d*)(?:\s*(?:,|&|\bdan\b)\s*(?:P\s*)?([1-9]\d*))?/gi;
  const plots=[];let cursor=0,m,invalid=false,matched=0;
  while((m=matcher.exec(raw))){
    const between=raw.slice(cursor,m.index).replace(/\bdan\b/gi,'');
    if(/[^\s,&]/.test(between))invalid=true;
    const module='M'+m[1],suffix=m[2],second=m[3];
    if(!second&&suffix.length>2)invalid=true;
    const nums=second?[suffix,second]:suffix.length===2&&!suffix.includes('0')?suffix.split(''):[suffix];
    nums.forEach(n=>{if(/^0/.test(n)||plots.includes(module+'P'+n))invalid=true;plots.push(module+'P'+n);});
    cursor=matcher.lastIndex;matched++;
  }
  if(/[^\s,&]/.test(raw.slice(cursor).replace(/\bdan\b/gi,'')))invalid=true;
  return {ok:matched>0&&!invalid&&plots.length<=12&&new Set(plots).size===plots.length,plots:invalid?[]:plots};
}
function bsePilotSeedFlexibleResult_(input){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return null;
  const src=bseUnifiedSourceContext_(input);
  // Preserve the historical reply/clarification parser rather than rewriting its meaning.
  if((src.clarifications||[]).length)return null;
  const original=String(src.original||'').trim();
  const lines=original.split(/\r?\n/).map(x=>x.trim()).filter(Boolean)
    .filter(x=>!/^(?:Kuantiti\s+Benih|Jumlah\s+Benih|Benih)\s*:/i.test(x));
  if(lines.length<1)return null;
  const compact=/^(?:-?\s*)Semai(?:an)?\s*:?$/i.test(lines[0]);
  const plotFirst=lines.length>1&&/^(?:-?\s*)Semai(?:an)?\s*:?$/i.test(lines[1])&&
    /^M\s*[1-9]\d*\s*P/i.test(lines[0]);
  const formal=/^KERJA\s+SEMAIAN\s+BENIH\b/i.test(lines[0]);
  if(!compact&&!plotFirst&&!formal)return null;
  let crop='',variety='',fields=[];
  if(formal){
    const facts=bseSeedSowingSourceFacts_({original:lines.join('\n'),clarifications:[]});
    crop=facts.crop;variety=facts.variety;
    fields=lines.slice(1).filter(x=>!/^(?:Jenis\s+Tanaman|Varieti)\s*:/i.test(x));
  }else{
    const paired=String(lines[compact?1:2]||'').match(/^([^()]+?)\s*\(([^()]+)\)$/);
    if(paired){crop=paired[1].trim();variety=paired[2].trim();}
    fields=compact?lines.slice(2):[lines[0]].concat(lines.slice(3));
  }
  const plots=[],dates=[];let bad=false,dateSeen=0,plotSeen=0;
  for(const raw of fields){
    const plotish=/^(?:(?:Modul|Plot)\s*:\s*)?M\s*[1-9]\d*\s*P/i.test(raw);
    const dateish=/^(?:Tarikh(?:\s+Semai)?|Date)\s*:/i.test(raw)||
       /^\d{1,2}[./-]\d{1,2}(?:[./-]\d{2,4})?$/.test(raw)||
       /^2026-\d{1,2}-\d{1,2}$/.test(raw)||
       /^\d{1,2}[\s-]+[A-Za-z]{3,12}[\s,-]+\d{2,4}$/i.test(raw);
    if(plotish){
      plotSeen++;const p=bsePilotSeedFlexiblePlots_(raw);
      if(!p.ok)bad=true;
      plots.push(...p.plots);
    }else if(dateish){
      dateSeen++;const date=bsePilotSeedFlexibleDate_(raw);
      if(!date)bad=true;else dates.push(date);
    }else bad=true;
  }
  if(new Set(plots).size!==plots.length||dates.length!==1||dateSeen!==1||plots.length<1||plotSeen<1)bad=true;
  const eventDate=dates.length===1?dates[0]:'';
  const missing=[];
  if(!eventDate||dateSeen!==1)missing.push('event_date');
  if(!plots.length||new Set(plots).size!==plots.length)missing.push('plot_id');
  if(!crop)missing.push('crop');
  if(!variety)missing.push('variety');
  if(bad)missing.push('report_format');
  const pass=missing.length===0;
  const base={project_id:'BSE_SB',system_year:2026,event_date:eventDate,verification_status:'PROVISIONAL',
    original_note:original};
  const candidate=(target,recordType,fields)=>({
    target,validation:pass?'PASS':'NEED_INFO',missing:pass?[]:missing.slice(),
    fields:Object.assign({},base,{record_type:recordType},fields)
  });
  const ordered=plots.slice().sort((a,b)=>{
    const x=a.match(/^M(\d+)P(\d+)$/),y=b.match(/^M(\d+)P(\d+)$/);
    return Number(x[1])-Number(y[1])||Number(x[2])-Number(y[2]);
  });
  return {validation:pass?'PASS':'NEED_INFO',production_write:false,candidates:[
    candidate('Crop_Batch_Log','CROP_BATCH',{batch_action:'BATCH_START',crop,variety,batch_status:'PROPOSED'}),
    candidate('Planting_Event_Log','PLANTING_EVENT',{event_type:'SEED_SOWING',crop,variety,event_status:'PROPOSED'}),
    ...(ordered.length?ordered:['']).map(plot=>
      candidate('Plot_Allocation_Log','PLOT_ALLOCATION',{plot_id:plot,allocation_status:'PLANNED'}))
  ]};
}
