/** @NotOnlyCurrentDoc
 * Gate I-00: PILOT_OPERATION-only Daily/Friday digest schedulers.
 * Existing PILOT_TEST digest implementations remain unchanged.
 * Owner-only PM; no general user broadcast and no official BSE writer.
 */
const BSE_PILOT_DIGEST_CONFIG={
  DAILY:{handler:'bsePilotOperationDailyDigestTick',property:'BSE_PILOT_DAILY_DIGEST_ENABLED',
    uid:'BSE_PILOT_DAILY_DIGEST_TRIGGER_UID',audit:'TEST_DAILY_DIGEST_AUDIT',
    config:'TEST_DAILY_DIGEST_CONFIG_AUDIT',time:'08:01'},
  FRIDAY:{handler:'bsePilotOperationFridayDigestTick',property:'BSE_PILOT_FRIDAY_DIGEST_ENABLED',
    uid:'BSE_PILOT_FRIDAY_DIGEST_TRIGGER_UID',audit:'TEST_FRIDAY_WEEKLY_DIGEST_AUDIT',
    config:'TEST_FRIDAY_WEEKLY_DIGEST_CONFIG_AUDIT',time:'07:59'}
};
const BSE_PILOT_DAILY_HEADERS=['digest_date','owner_id','telegram_user_id','private_chat_id',
  'status','message_id','sent_at','last_error','production_write'];
const BSE_PILOT_FRIDAY_HEADERS=['week_start','week_end','telegram_user_id','private_chat_id',
  'access_role','status','matched_count','message_id','gemini_status','sent_at','last_error','production_write'];
const BSE_PILOT_DIGEST_CONFIG_HEADERS=['configured_at','environment','enabled','time_myt',
  'next_run_utc','trigger_uid','production_write'];

function bsePilotDigestAssertEnvironment_(){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')throw Error('PILOT_DIGEST_WRONG_ENVIRONMENT');
  const b=getBsePilotOperationRuntimeBindingStatus();
  if(b.environment!=='PILOT_OPERATION'||!b.spreadsheet_bound||!b.evidence_folder_bound||
     b.production_write!==false||b.official_bse_write!==false)
    throw Error('PILOT_DIGEST_RUNTIME_BOUNDARY_FAILED');
  if(bseRuntimeSpreadsheetId_()!==BSE_PILOT_OPERATION_BINDING.spreadsheetId)
    throw Error('PILOT_DIGEST_SPREADSHEET_MISMATCH');
  return b;
}
function bsePilotDigestBook_(){
  bsePilotDigestAssertEnvironment_();
  const raw=SpreadsheetApp.openById(BSE_PILOT_OPERATION_BINDING.spreadsheetId);
  bseRuntimeAssertWorkbookId_(raw.getId());
  return bseRuntimeBook_(raw);
}
function bsePilotDigestOwnerRecipients_(book){
  const rows=bseTestOwnerRows_(book).map(bseTestOwnerFromRow_)
    .filter(o=>o.is_active&&o.owner_id&&/^\d+$/.test(o.telegram_user_id)&&
      /^\d+$/.test(o.private_chat_id)&&o.telegram_user_id===o.private_chat_id);
  const ids=new Set();
  return rows.filter(o=>{if(ids.has(o.private_chat_id))return false;
    ids.add(o.private_chat_id);return true;});
}
function bsePilotDigestNext_(kind,now){
  const d=now||new Date(), local=new Date(d.getTime()+8*3600000);
  const y=local.getUTCFullYear(),m=local.getUTCMonth(),day=local.getUTCDate();
  if(kind==='DAILY'){
    let t=Date.UTC(y,m,day,0,1,0);
    if(t<=d.getTime())t+=86400000;
    return new Date(t);
  }
  if(kind==='FRIDAY'){
    const delta=(5-local.getUTCDay()+7)%7;
    let t=Date.UTC(y,m,day+delta,7-8,59,0);
    if(t<=d.getTime())t+=7*86400000;
    return new Date(t);
  }
  throw Error('PILOT_DIGEST_INVALID_KIND');
}
function bsePilotDigestAudit_(book,kind){
  const c=BSE_PILOT_DIGEST_CONFIG[kind],heads=kind==='DAILY'?BSE_PILOT_DAILY_HEADERS:BSE_PILOT_FRIDAY_HEADERS;
  let s=book.getSheetByName(c.audit);
  if(!s)s=book.insertSheet(c.audit);
  bseEnsureAdditiveHeaders_(s,heads);
  return s;
}
function bsePilotDigestConfigAudit_(book,kind){
  const c=BSE_PILOT_DIGEST_CONFIG[kind];
  let s=book.getSheetByName(c.config);
  if(!s)s=book.insertSheet(c.config);
  bseEnsureAdditiveHeaders_(s,BSE_PILOT_DIGEST_CONFIG_HEADERS);
  return s;
}
function bsePilotDigestWindow_(kind,now){
  if(kind==='DAILY')return {start:bseDailyDigestYesterdayMyt_(now||new Date()),end:''};
  return bseTelegramHistoryLastCompleteWeek_(now||new Date());
}
function bsePilotDigestExisting_(rows,kind,start,end,chat){
  return rows.some(r=>{
    const valid=kind==='DAILY'?String(r[0])===start&&String(r[3])===chat:
      String(r[0])===start&&String(r[1])===end&&String(r[3])===chat;
    return valid&&['SENDING','SENT','OUTCOME_UNKNOWN'].includes(String(r[kind==='DAILY'?4:5]));
  });
}
// Presentation-only: preserve all canonical fields while separating records for Telegram.
function bsePilotDigestReadableRecord_(event){
  const raw=String(bseTelegramHistorySafeLine_(event)||'').trim();
  if(!raw)return '';
  const parts=raw.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  // Long one-line fallback records are separated into labelled lines, without dropping tokens.
  const items=parts.length===1&&raw.includes(' | ')?raw.split(' | ').map(s=>s.trim()):parts;
  return items.map((item,i)=>(i===0?'• ':'  ')+item).join('\n');
}
function bsePilotDigestAppendRecords_(lines,events){
  events.forEach((e,i)=>{
    const item=bsePilotDigestReadableRecord_(e);
    if(item){if(i)lines.push('');lines.push(item);}
  });
}
function bsePilotDigestRender_(book,kind,owner,window){
  const events=kind==='DAILY'?
    bseTelegramReportCanonicalEvents_(book,window.start):
    bseTelegramHistoryEventsFor_(book,window,owner.telegram_user_id,true);
  const shown=events.slice(0,BSE_TG_HISTORY_MAX_DISPLAY);
  const period=kind==='DAILY'?window.start:window.start+' → '+window.end;
  const today=Utilities.formatDate(new Date(),'Asia/Kuala_Lumpur','yyyy-MM-dd');
  const todayEvents=kind==='DAILY'?bseTelegramReportCanonicalEvents_(book,today):[];
  const gemini=bseTelegramReportGeminiCommentary_(period,shown);
  const lines=[kind==='DAILY'?'DAILY MORNING DIGEST — '+today:'FRIDAY WEEKLY DIGEST — '+period,
    kind==='DAILY'?'RINGKASAN SEMALAM — '+period+':':'Fakta canonical PILOT_OPERATION:'];
  if(!shown.length)lines.push('Tiada rekod PILOT yang disahkan dalam sela masa ini.');
  else {lines.push('');bsePilotDigestAppendRecords_(lines,shown);}
  if(events.length>shown.length)lines.push('Dipaparkan '+shown.length+' daripada '+events.length+' rekod.');
  if(kind==='DAILY'){
    lines.push('','STATUS SEMASA — '+today+':');
    if(!todayEvents.length)lines.push('Belum ada rekod operasi hari ini yang disahkan dalam PILOT.');
    else {lines.push('');bsePilotDigestAppendRecords_(lines,todayEvents.slice(0,BSE_TG_HISTORY_MAX_DISPLAY));}
    lines.push('','PERHATIAN HARI INI:');
    lines.push('Semak laporan belum disahkan, tindakan lapangan dan ketepatan rekod bersama penyelia.');
    lines.push('Jangan anggap tiada rekod bermaksud tiada aktiviti; sahkan dengan laporan sebenar.');
  }
  lines.push('','Komen Gemini — NON_CANONICAL, bukan fakta dan tidak mengubah rekod:',
    gemini.ok?String(gemini.text).replace(/mod TEST/gi,'mod PILOT_OPERATION'):'Komen Gemini tidak tersedia buat masa ini.',
    '','Shadow pilot sahaja — tiada rekod production atau sistem rasmi BSE ditulis.');
  return {text:lines.join('\n'),matched:events.length,gemini:gemini.ok?'SENT':gemini.reason};
}
function bsePilotDigestSend_(kind,now){
  bsePilotDigestAssertEnvironment_();
  const book=bsePilotDigestBook_(),owners=bsePilotDigestOwnerRecipients_(book);
  if(!owners.length)throw Error('PILOT_DIGEST_NO_ACTIVE_OWNER');
  const audit=bsePilotDigestAudit_(book,kind),headers=kind==='DAILY'?BSE_PILOT_DAILY_HEADERS:BSE_PILOT_FRIDAY_HEADERS;
  const data=audit.getLastRow()>1?audit.getRange(2,1,audit.getLastRow()-1,headers.length).getValues():[];
  const window=bsePilotDigestWindow_(kind,now),result=[];
  owners.forEach(owner=>{
    const chat=owner.private_chat_id;
    if(bsePilotDigestExisting_(data,kind,window.start,window.end,chat)){
      result.push({status:'ALREADY_SENT_OR_UNCERTAIN'});return;
    }
    const rendered=bsePilotDigestRender_(book,kind,owner,window);
    const base=kind==='DAILY'?
      [window.start,owner.owner_id,owner.telegram_user_id,chat,'SENDING','',new Date().toISOString(),'',false]:
      [window.start,window.end,owner.telegram_user_id,chat,owner.is_admin?'ADMIN':'OWNER',
        'SENDING',rendered.matched,'',rendered.gemini,new Date().toISOString(),'',false];
    audit.appendRow(base);
    SpreadsheetApp.flush();
    const row=audit.getLastRow(),statusColumn=kind==='DAILY'?5:6,midColumn=kind==='DAILY'?6:8,
      errorColumn=kind==='DAILY'?8:11;
    try{
      const sent=bseTelegramApi_('sendMessage',{chat_id:chat,text:rendered.text});
      if(!sent||!sent.message_id)throw Error('PILOT_DIGEST_SEND_UNCERTAIN');
      audit.getRange(row,statusColumn).setValue('SENT');
      audit.getRange(row,midColumn).setValue(String(sent.message_id));
      result.push({status:'SENT',message_id:String(sent.message_id),matched:rendered.matched});
    }catch(e){
      audit.getRange(row,statusColumn).setValue('OUTCOME_UNKNOWN');
      audit.getRange(row,errorColumn).setValue('SEND_OUTCOME_UNVERIFIED');
      result.push({status:'OUTCOME_UNKNOWN'});
    }
    SpreadsheetApp.flush();
  });
  return {kind:kind,window:window,recipient_count:owners.length,outcomes:result,
    production_write:false,official_bse_write:false};
}
function bsePilotDigestTriggerList_(kind){
  return ScriptApp.getProjectTriggers().filter(t=>
    t.getHandlerFunction()===BSE_PILOT_DIGEST_CONFIG[kind].handler);
}
function bsePilotDigestSchedule_(kind,proof){
  const c=BSE_PILOT_DIGEST_CONFIG[kind],date=bsePilotDigestNext_(kind,new Date());
  const t=proof?
    ScriptApp.newTrigger(c.handler).timeBased().after(120000).create():
    ScriptApp.newTrigger(c.handler).timeBased().at(date).create();
  const uid=String(t.getUniqueId());
  const p=PropertiesService.getScriptProperties();
  p.setProperty(c.uid,uid);
  const hits=bsePilotDigestTriggerList_(kind);
  if(hits.length!==1||String(hits[0].getUniqueId())!==uid||p.getProperty(c.uid)!==uid)
    throw Error('PILOT_DIGEST_TRIGGER_READBACK_FAILED');
  return {uid:uid,next:date.toISOString(),proof:!!proof};
}
function bsePilotDigestInstall_(kind){
  bsePilotDigestAssertEnvironment_();
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(1000))throw Error('PILOT_DIGEST_BUSY');
  const c=BSE_PILOT_DIGEST_CONFIG[kind],p=PropertiesService.getScriptProperties();
  try{
    const book=bsePilotDigestBook_(),owners=bsePilotDigestOwnerRecipients_(book);
    if(!owners.length)throw Error('PILOT_DIGEST_NO_ACTIVE_OWNER');
    const existing=bsePilotDigestTriggerList_(kind),on=p.getProperty(c.property)==='ON';
    if(on&&existing.length===1&&p.getProperty(c.uid)===String(existing[0].getUniqueId()))
      return {status:'ALREADY_ON',kind:kind,triggers:1,production_write:false};
    if(on||existing.length||p.getProperty(c.uid))throw Error('PILOT_DIGEST_STALE_TRIGGER_RECONCILE');
    bsePilotDigestAudit_(book,kind);bsePilotDigestConfigAudit_(book,kind);
    const scheduled=bsePilotDigestSchedule_(kind,false);
    p.setProperty(c.property,'ON');
    if(p.getProperty(c.property)!=='ON')throw Error('PILOT_DIGEST_ENABLED_READBACK_FAILED');
    bsePilotDigestConfigAudit_(book,kind).appendRow([new Date().toISOString(),
      'PILOT_OPERATION','ON',c.time,scheduled.next,scheduled.uid,false]);
    SpreadsheetApp.flush();
    const out={status:'ON',kind:kind,time_myt:c.time,triggers:1,next_run_utc:scheduled.next,
      owner_only:true,production_write:false,official_bse_write:false};
    console.log('PILOT_DIGEST_INSTALL '+JSON.stringify(out));return out;
  }catch(e){
    p.setProperty(c.property,'OFF');p.deleteProperty(c.uid);
    bsePilotDigestTriggerList_(kind).forEach(t=>ScriptApp.deleteTrigger(t));
    throw e;
  }finally{lock.releaseLock();}
}
function bsePilotDigestTick_(kind){
  bsePilotDigestAssertEnvironment_();
  const c=BSE_PILOT_DIGEST_CONFIG[kind],p=PropertiesService.getScriptProperties();
  if(p.getProperty(c.property)!=='ON')return {skipped:'OFF',production_write:false};
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(1000))throw Error('PILOT_DIGEST_BUSY');
  try{
    let result;
    try{result=bsePilotDigestSend_(kind,new Date());}
    finally{
      bsePilotDigestTriggerList_(kind).forEach(t=>ScriptApp.deleteTrigger(t));
      bsePilotDigestSchedule_(kind,false);
    }
    console.log('PILOT_DIGEST_TICK '+JSON.stringify(result));return result;
  }finally{lock.releaseLock();}
}
function bsePilotDigestStop_(kind){
  bsePilotDigestAssertEnvironment_();
  const c=BSE_PILOT_DIGEST_CONFIG[kind],p=PropertiesService.getScriptProperties();
  p.setProperty(c.property,'OFF');
  bsePilotDigestTriggerList_(kind).forEach(t=>ScriptApp.deleteTrigger(t));
  p.deleteProperty(c.uid);
  if(p.getProperty(c.property)!=='OFF'||bsePilotDigestTriggerList_(kind).length)
    throw Error('PILOT_DIGEST_STOP_READBACK_FAILED');
  return {status:'OFF',kind:kind,triggers:0,production_write:false};
}
function bsePilotDigestArmProof_(kind){
  bsePilotDigestAssertEnvironment_();
  const c=BSE_PILOT_DIGEST_CONFIG[kind],p=PropertiesService.getScriptProperties();
  if(p.getProperty(c.property)!=='ON'||bsePilotDigestTriggerList_(kind).length!==1)
    throw Error('PILOT_DIGEST_PROOF_NEEDS_INSTALLED_SCHEDULER');
  const hits=bsePilotDigestTriggerList_(kind);
  if(p.getProperty(c.uid)!==String(hits[0].getUniqueId()))
    throw Error('PILOT_DIGEST_PROOF_TRIGGER_MISMATCH');
  const book=bsePilotDigestBook_(),window=bsePilotDigestWindow_(kind,new Date());
  const audit=bsePilotDigestAudit_(book,kind);
  const rows=audit.getLastRow()>1?audit.getRange(2,1,audit.getLastRow()-1,kind==='DAILY'?9:12).getValues():[];
  if(bsePilotDigestOwnerRecipients_(book).some(o=>bsePilotDigestExisting_(rows,kind,window.start,window.end,o.private_chat_id)))
    throw Error('PILOT_DIGEST_PROOF_WINDOW_ALREADY_SENT_OR_UNCERTAIN');
  const old=hits[0];ScriptApp.deleteTrigger(old);
  try{return bsePilotDigestSchedule_(kind,true);}
  catch(e){bsePilotDigestTriggerList_(kind).forEach(t=>ScriptApp.deleteTrigger(t));
    bsePilotDigestSchedule_(kind,false);throw e;}
}
function installBsePilotOperationDailyDigest(){return bsePilotDigestInstall_('DAILY');}
function installBsePilotOperationFridayDigest(){return bsePilotDigestInstall_('FRIDAY');}
function bsePilotOperationDailyDigestTick(){return bsePilotDigestTick_('DAILY');}
function bsePilotOperationFridayDigestTick(){return bsePilotDigestTick_('FRIDAY');}
function armBsePilotOperationDailyDigestProof(){return bsePilotDigestArmProof_('DAILY');}
function armBsePilotOperationFridayDigestProof(){return bsePilotDigestArmProof_('FRIDAY');}
function stopBsePilotOperationDailyDigest(){return bsePilotDigestStop_('DAILY');}
function stopBsePilotOperationFridayDigest(){return bsePilotDigestStop_('FRIDAY');}
function inspectBsePilotOperationDigestSchedulers(){
  bsePilotDigestAssertEnvironment_();
  const p=PropertiesService.getScriptProperties(),out={environment:'PILOT_OPERATION',
    production_write:false,official_bse_write:false};
  ['DAILY','FRIDAY'].forEach(kind=>{
    const c=BSE_PILOT_DIGEST_CONFIG[kind],hits=bsePilotDigestTriggerList_(kind);
    out[kind]={enabled:p.getProperty(c.property)==='ON',triggers:hits.length,
      marker_matches:hits.length===1&&p.getProperty(c.uid)===String(hits[0].getUniqueId()),
      time_myt:c.time};
  });
  console.log('PILOT_DIGEST_STATUS '+JSON.stringify(out));return out;
}
