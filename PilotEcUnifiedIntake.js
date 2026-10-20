/** @OnlyCurrentDoc */
// PILOT_OPERATION only. Accept both Khairul (leachate : EC_IN) and Sapiq (EC_IN)
// formats. One canonical EC_Leachate_Log review bundle; EC_IN is the primary field.
// In particular, unknown EC leachate and absent session are NEVER fabricated.
function bsePilotEcValue_(v){
  const value=String(v==null?'':v).replace(/\*+/g,'').trim();
  if(!value||/^x$/i.test(value))return {kind:'MISSING',value:''};
  if(/^AK$/i.test(value))return {kind:'AK',value:0};
  if(!/^\d+(?:\.\d+)?$/.test(value))return {kind:'ERROR'};
  const n=Number(value);
  return Number.isFinite(n)&&n>=0?{kind:'NUMERIC',value:n}:{kind:'ERROR'};
}
function bsePilotEcReading_(line){
  const m=String(line||'').trim().match(/^(M[1-9]\d*(?:P[1-9]\d*)?)\s*[-–]\s*(.*?)\s*$/i);
  if(!m)return null;
  const id=m[1].toUpperCase(),isPlot=id.includes('P'),moduleId=id.split('P')[0],
    parts=m[2].split(':');
  if(parts.length>2)return {error:'ec_readings'};
  if(isPlot&&typeof bsePlotSingleLocation_==='function'&&!bsePlotSingleLocation_(id).ok)
    return {error:'ec_plot_ambiguous'};
  let leach={kind:'MISSING',value:''},ec;
  if(parts.length===1)ec=bsePilotEcValue_(parts[0]);
  else {
    leach=bsePilotEcValue_(parts[0]);ec=bsePilotEcValue_(parts[1]);
  }
  if(leach.kind==='ERROR'||ec.kind==='ERROR'||leach.kind==='AK')return {error:'ec_readings'};
  if(ec.kind==='MISSING'&&leach.kind!=='MISSING')return {error:'ec_in_missing'};
  if(!isPlot&&leach.kind!=='MISSING')return {error:'module_scope'};
  const status=ec.kind==='MISSING'?'NOT_MEASURED':
    !isPlot?'MODULE_IN_ONLY':
    leach.kind==='NUMERIC'?(ec.kind==='AK'?'AK_ZERO':'NUMERIC'):'IN_ONLY';
  return {scope_type:isPlot?'PLOT':'MODULE',module_id:moduleId,plot_id:isPlot?id:'',
    ec_leachate_out:leach.value,ec_in_next:ec.value,input_status:status};
}
function bsePilotEcReadingValid_(r){
  const a=r&&r.ec_leachate_out,b=r&&r.ec_in_next,status=String(r&&r.input_status||''),
    validNum=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
  if(!['MODULE','PLOT'].includes(String(r&&r.scope_type||'')))return false;
  if(!/^M[1-9]\d*$/.test(String(r.module_id||'')))return false;
  if(r.scope_type==='PLOT'){
    if(!new RegExp('^'+r.module_id+'P[1-9]\\d*$').test(String(r.plot_id||'')))return false;
  }else if(r.plot_id!=='')return false;
  if(status==='NOT_MEASURED')return a===''&&b==='';
  if(status==='MODULE_IN_ONLY')return r.scope_type==='MODULE'&&a===''&&validNum(b);
  if(r.scope_type==='MODULE')return false;
  if(status==='IN_ONLY')return a===''&&validNum(b);
  if(status==='AK_ZERO')return validNum(a)&&b===0;
  if(status==='NUMERIC')return validNum(a)&&validNum(b);
  return false;
}
// Only standalone report titles activate the EC intake path.
// Preserve the explicit no-title multi-reading fallback separately.
function bsePilotEcHeading_(line){
  return /^(?:REKOD\s+)?EC(?:[\s_-]*(?:LEACHING|LEACHATE|LEECHING|IN))?$/i.test(
    String(line||'').replace(/\*+/g,'').trim());
}
function bsePilotEcSession_(text){
  const m=String(text||'').trim().match(/^(?:(?:Sesi|Session)\s*:\s*)?(pg|pagi|ptg|petang)$/i);
  if(!m)return '';
  return /^(pg|pagi)$/i.test(m[1])?'PAGI':'PETANG';
}
function bsePilotEcUnifiedParseMessage_(text){
  if(typeof bseRuntimeEnvironmentName_!=='function'||bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return null;
  const original=String(text||''),normal=original.replace(/\r/g,''),
    lines=normal.split('\n'),heading=lines.some(bsePilotEcHeading_);
  let date='',dateSeen=false,session='',sessionSeen=false,badDate=false,unknown=[];
  const readings=[],errors=[];
  for(const raw of lines){
    const line=raw.trim().replace(/\*+/g,'');
    if(!line||/^[-=_]{2,}$/.test(line)||/^\d+[.)]\s*M[1-9]\d*$/i.test(line))continue;
    const titled=line.match(/^(?:Date|Tarikh)\s*:\s*(\S.*?)\s*$/i);
    if(titled){
      dateSeen=true;const value=bseEcLeachateDate_(titled[1]);
      if(!value||date&&date!==value)badDate=true;else date=value;continue;
    }
    if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(line)){
      dateSeen=true;const value=bseEcLeachateDate_(line);
      if(!value||date&&date!==value)badDate=true;else date=value;continue;
    }
    const recognizedSession=bsePilotEcSession_(line);
    if(recognizedSession){sessionSeen=true;
      if(session&&session!==recognizedSession)errors.push('session_conflict');
      else session=recognizedSession;
      continue;
    }
    if(/^(?:Sesi|Session)\s*:/i.test(line)){
      sessionSeen=true;errors.push('session');continue;
    }
    if(bsePilotEcHeading_(line))continue;
    const reading=bsePilotEcReading_(line);
    if(reading){if(reading.error)errors.push(reading.error);else readings.push(reading);continue;}
    if(/^(?:\d+[.)]\s*)?M[1-9]\d*\s*$/i.test(line))continue; // section heading
    unknown.push(line);
  }
  // Without EC heading, don't claim unrelated numeric plot observations:
  // require a stand-alone date, 3+ distinct EC-looking scope readings and no other text.
  const implicit=!heading&&dateSeen&&readings.length>=3&&!unknown.length;
  if(!heading&&!implicit)return null;
  if(!dateSeen||!date||badDate)errors.push('event_date');
  if(!readings.length)errors.push('ec_readings');
  if(!heading&&sessionSeen&&!session)errors.push('session');
  if(unknown.length)errors.push('ec_unrecognized_lines');
  const keys=new Set();
  for(const r of readings){const key=r.plot_id||r.module_id;
    if(keys.has(key))errors.push('duplicate_scope');keys.add(key);
    if(!bsePilotEcReadingValid_(r))errors.push('ec_readings');
  }
  const missing=Array.from(new Set(errors)),ordered=readings.slice().sort((a,b)=>{
    const x=a.module_id.localeCompare(b.module_id,undefined,{numeric:true});
    return x||String(a.plot_id).localeCompare(String(b.plot_id),undefined,{numeric:true});
  });
  const fields={project_id:'BSE_SB',system_year:2026,event_date:date,session:session,
    record_type:'EC_LEACHATE',verification_status:'PROVISIONAL',original_note:original,
    readings:ordered,production_write:false};
  return {validation:missing.length?'NEED_INFO':'PASS',production_write:false,
    candidates:[{target:'EC_Leachate_Log',validation:missing.length?'NEED_INFO':'PASS',
      missing,fields}]};
}

function bsePilotEcReadingText_(reading){
  const r=reading||{},scope=String(r.scope_type||''),
    id=scope==='MODULE'?String(r.module_id||'')+' (modul)':String(r.plot_id||''),
    status=String(r.input_status||''),ec=r.ec_in_next,
    leach=r.ec_leachate_out;
  if(!id)return 'Scope EC tidak dikenal pasti';
  if(status==='NOT_MEASURED')return id+' — EC_IN: tidak diukur';
  const ecText=typeof ec==='number'&&Number.isFinite(ec)?String(ec):'belum dilaporkan';
  const leachText=typeof leach==='number'&&Number.isFinite(leach)?String(leach):'belum dilaporkan';
  return id+' — EC_IN: '+ecText+(status==='AK_ZERO'?' (AK)':'')+
    (scope==='MODULE'?'':' | EC leachate: '+leachText);
}
function bsePilotEcCardText_(fields){
  const f=fields||{},readings=Array.isArray(f.readings)?f.readings:[],
    formatted=typeof bseApprovalDisplayDate_==='function'?
      bseApprovalDisplayDate_(String(f.event_date||'')):String(f.event_date||'');
  const lines=['REKOD EC — EC_IN UTAMA','Tarikh: '+formatted,
    'Sesi: '+(String(f.session||'').trim()||'Tidak dinyatakan'),
    'Bacaan ('+readings.length+' scope):'];
  readings.forEach(r=>lines.push('• '+bsePilotEcReadingText_(r)));
  lines.push('','EC leachate ialah bacaan tambahan jika dilaporkan.',
    'Sahkan semua bacaan di atas menggunakan Benar / Batal.');
  return lines.join('\n');
}
function bsePilotEcHistoryReadingText_(row){
  return bsePilotEcReadingText_({scope_type:String(row[5]||''),
    module_id:String(row[6]||''),plot_id:String(row[7]||''),
    ec_leachate_out:row[8],ec_in_next:row[9],input_status:String(row[10]||'')});
}
