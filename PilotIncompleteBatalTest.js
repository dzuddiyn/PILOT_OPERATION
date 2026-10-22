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
function bsePilotIncompleteDateExamples_(row,result){
  const original=String(row&&row[4]||'');
  const candidates=result&&result.candidates||[];
  if(candidates.some(c=>c&&c.target==='Plant_Census_Log'))
    return '10/10/2026, 10/10/26, 2026-10-10';
  if(/\bKERJA\s+SEMAIAN\s+BENIH\b/i.test(original))
    return '10/10/2026';
  if(/^\s*(?:-\s*)?Semai(?:an)?\b/i.test(original))
    return '10/10, 10/10/2026, 10/10/26, 10 Ogos 2026, 10-Aug-26';
  if(candidates.some(c=>c&&c.fields&&c.fields.event_type==='SEED_SOWING'))
    return '10/10/2026, 10/10/26, 10 Ogos 2026, 10-Aug-26';
  return '10/10/2026';
}
function bsePilotIncompleteMissingLabel_(field,row,result){
  const key=String(field||'');
  if(key==='batch_match'&&result&&Array.isArray(result.candidates)&&result.candidates.some(c=>c&&c.target==='Plant_Census_Log'))return 'Plot belum dipadankan kepada tanaman aktif dalam sistem (hubungi penyelia)';
  const names={
    plot_id:'Plot (contoh M1P1)',
    crop:'Tanaman (contoh Peria Besar)',
    variety:'Varieti (contoh 936 Hua Li)',
    event_date:'Tarikh (contoh '+bsePilotIncompleteDateExamples_(row,result)+')',
    batch_match:'Padanan batch (nyatakan batch tanaman berkaitan)',
    seed_quantity:'Kuantiti benih (contoh 200 biji)',
    quantity:'Kuantiti (contoh 200)',
    unit:'Unit (contoh kg)',
    item_name:'Bahan (contoh Baja A)',
    jenis_baja:'Jenis baja (contoh F atau N)',
    invalid_baja_line:'Format item baja (contoh F atau F 2)',
    duplicate_baja_type:'Jenis baja berulang',
    plot_not_applicable:'Baja Masuk tidak memerlukan plot',
    too_many_baja_items:'Terlalu banyak item dalam satu laporan',
    session:'Sesi (contoh Pagi)',
    report_format:'Susunan laporan (semak contoh format)'
  };
  return names[key]||bsePilotIncompleteClean_(key.replace(/_/g,' '),70);
}
function bsePilotIncompleteCard_(row,result){
  const fields=(result.candidates||[]).map(c=>c&&c.fields||{});
  const one=result.candidates.length===1?result.candidates[0]:null;
  const census=one&&one.target==='Plant_Census_Log';
  const baja=one&&one.fields&&one.fields.baja_group===true;
  const lines=[census?'REKOD BANCI POKOK':baja?(one.fields.record_type==='INVENTORY_IN'?'BAJA MASUK':'BAJA KELUAR'):'SEMAKAN LAPORAN BELUM LENGKAP',
    'Rujukan : BSE-TG-'+String(row[0])];
  if(census){
    const f=one.fields||{},entry=Array.isArray(f.census_entries)?f.census_entries[0]||{}:{};
    if(entry.plot_id)lines.push('Modul : '+bsePilotIncompleteClean_(entry.plot_id,50));
    if(f.crop)lines.push('Tanaman : '+bsePilotIncompleteClean_(f.crop,100));
    if(one.missing&&one.missing.includes('event_date')){
      lines.push('Tarikh : ❌ Tidak dapat dikenal pasti');
    }else if(f.event_date){
      lines.push('Tarikh : '+bsePilotIncompleteClean_(f.event_date,30));
    }
    if(Number.isInteger(entry.reported_dead_count))lines.push('Mati : '+entry.reported_dead_count);
    if(Number.isInteger(entry.reported_sick_count))lines.push('Sakit : '+entry.reported_sick_count);
  }else if(baja){
    const f=one.fields||{},items=Array.isArray(f.baja_items)?f.baja_items:[];
    lines.push('Tarikh : '+String(f.event_date||'❌ Belum dinyatakan'));
    if(f.record_type==='INVENTORY_OUT')lines.push('Plot : '+String(f.destination||'❌ Belum dinyatakan'));
    items.forEach((item,i)=>lines.push((i+1)+'. Baja '+item.baja_type+' : '+item.quantity+' '+item.unit+(item.destination?' ('+item.destination+')':'')));
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
    .map(x=>bsePilotIncompleteMissingLabel_(x,row,result)).filter(Boolean))].slice(0,10);
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
function bsePilotIncompleteCloseCard_(row,callback,result,updateId){
  // Preserve the entire visible card, with its original facts and hints, as user reference.
  const original=String(callback&&callback.message&&callback.message.text||'');
  if(!original.trim())throw Error('INCOMPLETE_CANCEL_ORIGINAL_CARD_TEXT_UNAVAILABLE');
  const text=/^\u274c Dibatalkan(?:\r?\n|$)/.test(original)?original:'\u274c Dibatalkan\n'+original;
  if(text.length>4096)throw Error('INCOMPLETE_CANCEL_CARD_TOO_LONG');
  try{
    const edited=bseTelegramApi_('editMessageText',{
      chat_id:String(callback.message.chat.id),
      message_id:Number(callback.message.message_id),
      text:text,
      reply_markup:{inline_keyboard:[]}
    });
    if(edited===false||edited===null)return false;
    return true;
  }catch(error){
    if(/message is not modified/i.test(String(error&&error.message||'')))return true;
    throw error;
  }
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
  const item=found[0],row=item.r;
  if(String(row[1])!==chat||String(row[2])!==user||String(row[15])!==messageId)
    return {authorized:false,reason:'WRONG_SOURCE'};
  const prior=String(row[6]||'');
  if(!['INCOMPLETE_CANCEL_ONLY','INCOMPLETE_CANCEL_ACK_PENDING','INCOMPLETE_CANCELLED'].includes(prior))
    return {blocked:true,status:prior,production_write:false};
  let result;try{result=JSON.parse(String(row[9]||''));}
  catch(_){return {blocked:true,reason:'BAD_JSON'};}
  if(!bsePilotIncompleteEligible_(result,'WAITING_INFO'))
    return {blocked:true,reason:'NOT_INCOMPLETE'};
  if(prior==='INCOMPLETE_CANCEL_ONLY'){
    // Technical reservation prevents any re-entry or domain progression.
    queue.getRange(item.i+2,7).setValue('INCOMPLETE_CANCEL_ACK_PENDING');
    SpreadsheetApp.flush();
  }
  // This edit RETAINS the old report card text, and removes only its inline button.
  // For a previously cancelled legacy card, a second tap repairs the visible feedback.
  const edited=bsePilotIncompleteCloseCard_(row,callback,result,match[1]);
  if(!edited)throw Error('INCOMPLETE_CANCEL_CARD_EDIT_PENDING');
  if(prior!=='INCOMPLETE_CANCELLED'){
    queue.getRange(item.i+2,7).setValue('INCOMPLETE_CANCELLED');
    SpreadsheetApp.flush();
  }
  if(callback.id)try{
    bseTelegramApi_('answerCallbackQuery',{
      callback_query_id:String(callback.id),
      text:'Dibatalkan. Hantar semula laporan yang dibetulkan.'
    });
  }catch(_){/* Card is already visibly updated, do not repeat the mutation. */}
  return {cancelled:prior!=='INCOMPLETE_CANCELLED',
    duplicate:prior==='INCOMPLETE_CANCELLED',
    reference:'BSE-TG-'+match[1],
    production_write:false,official_bse_write:false};
}