/** @OnlyCurrentDoc */
// GI-UX-02: Batal-only information card for incomplete PILOT reports.
// Queue metadata only; never creates/updates approved operational events.
function bsePilotIncompleteEligible_(result,status){
  return bseRuntimeEnvironmentName_()==='PILOT_OPERATION'&&status==='WAITING_INFO'&&
    result&&result.validation==='NEED_INFO'&&result.production_write===false&&
    Array.isArray(result.candidates)&&result.candidates.length>0;
}
function bsePilotIncompleteClean_(value,max){
  return String(value==null?'':value).replace(/[\x00-\x1f\x7f]+/g,' ').trim().slice(0,max||140);
}
function bsePilotIncompleteCard_(row,result){
  const fields=(result.candidates||[]).map(c=>c&&c.fields||{});
  const one=result.candidates.length===1?result.candidates[0]:null;
  const census=one&&one.target==='Plant_Census_Log';
  const lines=[census?'REKOD BANCI POKOK':'SEMAKAN LAPORAN BELUM LENGKAP',
    'Rujukan : BSE-TG-'+String(row[0])];
  if(census){
    const f=one.fields||{},entry=Array.isArray(f.census_entries)?f.census_entries[0]||{}:{};
    if(entry.plot_id)lines.push('Modul : '+bsePilotIncompleteClean_(entry.plot_id,50));
    if(f.crop)lines.push('Tanaman : '+bsePilotIncompleteClean_(f.crop,100));
    if(one.missing&&one.missing.includes('event_date')){
      lines.push('Tarikh : ❌ Tidak dapat dikenal pasti',
        'Format: DD/MM/YYYY, DD/MM/YY atau YYYY-MM-DD');
    }else if(f.event_date){
      lines.push('Tarikh : '+bsePilotIncompleteClean_(f.event_date,30));
    }
    if(Number.isInteger(entry.reported_dead_count))lines.push('Mati : '+entry.reported_dead_count);
    if(Number.isInteger(entry.reported_sick_count))lines.push('Sakit : '+entry.reported_sick_count);
  }else{
    if(one)lines.push('Jenis : '+bsePilotIncompleteClean_(String(one.target||'Laporan').replace(/_/g,' '),65));
    const allowed={crop:'Tanaman',variety:'Varieti',plot_id:'Plot',event_date:'Tarikh',
      session:'Sesi',item_name:'Bahan',quantity:'Kuantiti',unit:'Unit',operation_type:'Operasi'};
    const seen=new Set();
    fields.forEach(f=>Object.keys(allowed).forEach(k=>{
      const value=f[k];if(seen.has(k)||value==null||value===''||typeof value==='object')return;
      seen.add(k);lines.push(allowed[k]+' : '+bsePilotIncompleteClean_(value,100));
    }));
  }
  const missing=[...new Set((result.candidates||[]).flatMap(c=>Array.isArray(c.missing)?c.missing:[])
    .map(x=>bsePilotIncompleteClean_(x,45)).filter(Boolean))].slice(0,10);
  lines.push('','❌ Belum lengkap: '+(missing.length?missing.join(', '):'Maklumat perlu disemak'),
    'Tiada rekod operasi disimpan. Betulkan dan hantar laporan baharu.');
  return lines.join('\n').slice(0,2700);
}
function bsePilotIncompleteOffer_(sheet,row,result,index){
  const updateId=String(row[0]||''),chat=String(row[1]||''),user=String(row[2]||'');
  if(!bsePilotIncompleteEligible_(result,'WAITING_INFO')||!/^\d{8,16}$/.test(updateId)||
    !/^-?\d+$/.test(chat)||!/^\d+$/.test(user))return {offered:false};
  // Reserve before sending: no unguarded duplicate on uncertain API delivery.
  sheet.getRange(index,7).setValue('INCOMPLETE_CARD_SEND_PENDING');SpreadsheetApp.flush();
  const sent=bseTelegramApi_('sendMessage',{chat_id:chat,text:bsePilotIncompleteCard_(row,result),
    reply_markup:{inline_keyboard:[[{text:'❌ Batal',callback_data:'C2:'+updateId+':C'}]]}});
  if(!sent||!Number.isSafeInteger(Number(sent.message_id))||Number(sent.message_id)<=0)
    return {offered:false,pending:true};
  sheet.getRange(index,16).setNumberFormat('@').setValue(String(sent.message_id));
  sheet.getRange(index,7).setValue('INCOMPLETE_CANCEL_ONLY');SpreadsheetApp.flush();
  return {offered:true,production_write:false,official_bse_write:false};
}
function bsePilotIncompleteCallback_(book,callback){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')throw Error('NOT_PILOT');
  const match=String(callback&&callback.data||'').match(/^C2:(\d{8,16}):C$/);
  if(!match)return {authorized:false};
  const user=String(callback&&callback.from&&callback.from.id||'');
  const chat=String(callback&&callback.message&&callback.message.chat&&callback.message.chat.id||'');
  const messageId=String(callback&&callback.message&&callback.message.message_id||'');
  if(!/^\d+$/.test(user)||!/^-?\d+$/.test(chat)||!/^\d+$/.test(messageId))
    return {authorized:false};
  const queue=bseTelegramQueue_(book);
  const rows=queue.getLastRow()>1?queue.getRange(2,1,queue.getLastRow()-1,BSE_TG_QUEUE_HEADERS.length).getValues():[];
  const found=rows.map((r,i)=>({r,i})).filter(x=>String(x.r[0])===match[1]);
  if(found.length!==1)return {authorized:false,reason:'AMBIGUOUS'};
  const item=found[0],r=item.r;
  if(String(r[1])!==chat||String(r[2])!==user||String(r[15])!==messageId)
    return {authorized:false,reason:'WRONG_SOURCE'};
  if(String(r[6])==='INCOMPLETE_CANCELLED')
    return {duplicate:true,status:'INCOMPLETE_CANCELLED',production_write:false};
  if(String(r[6])!=='INCOMPLETE_CANCEL_ONLY')
    return {blocked:true,status:String(r[6]),production_write:false};
  let result;try{result=JSON.parse(String(r[9]||''));}catch(_){return {blocked:true,reason:'BAD_JSON'};}
  if(!bsePilotIncompleteEligible_(result,'WAITING_INFO'))return {blocked:true,reason:'NOT_INCOMPLETE'};
  queue.getRange(item.i+2,7).setValue('INCOMPLETE_CANCELLED');SpreadsheetApp.flush();
  if(callback.id)try{bseTelegramApi_('answerCallbackQuery',{
    callback_query_id:String(callback.id),text:'Laporan dibatalkan. Hantar semula setelah dibetulkan.'
  });}catch(_){/* Status already terminal; never repeat action to repair Telegram ack. */}
  return {cancelled:true,reference:'BSE-TG-'+match[1],production_write:false,
    official_bse_write:false};
}
