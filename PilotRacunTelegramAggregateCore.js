/** PILOT Racun aggregate Telegram entry; invoked only by authenticated B1 callback while ScriptLock is owned. */
function bsePilotRacunTelegramAggregateCore_(book,context,input,snapshot){
  if(!snapshot||!snapshot.row||!snapshot.proposal||input.kind!=='A')
    throw Error('RACUN_CALLBACK_INVALID');
  if(typeof bsePilotRacunLockOwned_!=='function'||!bsePilotRacunLockOwned_())
    throw Error('RACUN_CALLBACK_LOCK_REQUIRED');
  const row=snapshot.row,reference=String(row[0]),sourceKey=reference+'|Treatment_Event_Log';
  if(String(row[1])!==sourceKey||snapshot.proposal.aggregate_type!=='PILOT_RACUN_ATOMIC')
    throw Error('RACUN_CALLBACK_SOURCE_CONFLICT');
  if(!bseTelegramReporterCardAuthorized_(row,input.callback))
    throw Error('RACUN_CALLBACK_UNAUTHORIZED');
  if(bseApprovalHash_(snapshot.proposal)!==String(row[2]))
    throw Error('RACUN_CALLBACK_HASH_CONFLICT');
  const ready=bsePilotRacunAggregateEligibility_(snapshot.proposal,book);
  if(!ready||ready.eligible!==true)
    throw Error('RACUN_CALLBACK_STORAGE_UNREADY: '+String(ready&&ready.reason||'UNKNOWN'));
  const outcome=bsePilotRacunExecuteApproval_({
    action:'A',authorized:true,hash_verified:true,
    reference:reference,source_key:sourceKey,approval_hash:String(row[2]),
    callback_token:String(input.token),proposal:snapshot.proposal
  },book);
  if(!['REPORTER_CONFIRMED','ALREADY_CONFIRMED'].includes(outcome.status))
    throw Error('RACUN_CALLBACK_NOT_COMMITTED');
  return bsePilotRacunTelegramFinalizeState_(book,context,input,snapshot,outcome.status==='REPORTER_CONFIRMED');
}

function bsePilotRacunTelegramFinalizeState_(book,context,input,snapshot,firstConfirmation){
  const row=snapshot.row,reference=String(row[0]),plan=bsePilotRacunAtomicPlan_(snapshot.proposal,reference);
  const verified=bsePilotRacunApprovalReconcile_(plan,bsePilotRacunSheetAdapter_(book),{
    reference:reference,authorized:true,hash_verified:true
  });
  if(verified.status!=='LEDGER_VERIFIED'||verified.record_count!==plan.record_count)
    throw Error('RACUN_FINAL_LEDGER_NOT_VERIFIED');
  const sheet=bseTelegramApprovalSheet_(book),position=Number(snapshot.card_row);
  const existing=sheet.getRange(position,1,1,BSE_APPROVAL_UI_HEADERS.length).getValues()[0];
  if(String(existing[1])!==String(row[1])||String(existing[2])!==String(row[2])||
      String(existing[10])!==String(input.token)||String(existing[17])!=='REPORTER_CONFIRMED')
    throw Error('RACUN_FINAL_APPROVAL_READBACK_CONFLICT');
  const now=new Date().toISOString();
  sheet.getRange(position,12,1,6).setValues([[
    String(input.callback.message.chat.id),String(input.callback.message.message_id),
    'REPORTER_CONFIRMED',String(input.callback.from.id),now,String(row[2])
  ]]);
  SpreadsheetApp.flush();
  bseApprovalRecomputeQueueStatus_(book,reference);
  const final=sheet.getRange(position,1,1,BSE_APPROVAL_UI_HEADERS.length).getValues()[0];
  if(String(final[13])!=='REPORTER_CONFIRMED'||String(final[16])!==String(row[2])||
      String(final[17])!=='REPORTER_CONFIRMED')
    throw Error('RACUN_FINAL_AUDIT_READBACK_FAILED');
  const summary=bsePilotRacunReceiptText_(reference,plan);
  const needsUiRepair=firstConfirmation||String(final[19])==='RACUN_CARD_EDIT_PENDING';
  const card=needsUiRepair?bsePilotRacunCardEdit_(book,row,summary,position):{synced:true};
  if(!card.synced&&input.callback&&input.callback.id){
    try{bseTelegramApi_('answerCallbackQuery',{callback_query_id:input.callback.id,
      text:'Rekod disimpan. Paparan kad sedang dipulihkan.',show_alert:true});}catch(_){/* durable repair marker remains */}
  }
  return {status:firstConfirmation?'REPORTER_CONFIRMED':'ALREADY_CONFIRMED',
    record_count:plan.record_count,storage_mode:'UNLINKED_PILOT',
    approval_readback:true,card_display_status:card.synced?'SYNCED':'REPAIR_PENDING',
    production_write:false,official_bse_write:false,receipt_text:summary};
}

function bsePilotRacunCancelEligibility_(book,reference){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION'||!/^BSE-TG-\d+$/.test(String(reference||'')))
    return {allowed:false,reason:'INVALID_SCOPE'};
  try{
    const adapter=bsePilotRacunSheetAdapter_(book);
    const journal=adapter.getJournal(reference),rows=adapter.readRows(reference);
    if(journal||rows.length)return {allowed:false,reason:'DURABLE_JOURNAL_OR_ROWS_PRESENT',status:journal&&journal.status||'ORPHAN_ROWS'};
    return {allowed:true,reason:'NOT_WRITTEN'};
  }catch(_){return {allowed:false,reason:'STORAGE_UNVERIFIED'};}
}
function bsePilotRacunReceiptText_(reference,plan){
  const lines=['REKOD RACUN PILOT DISIMPAN','Rujukan: '+reference,
    'Tarikh: '+plan.records[0].event_date,'Jumlah rekod: '+plan.record_count,
    'Simpanan: PILOT unlinked (bukan rekod rasmi BSE)'];
  plan.records.forEach((r,i)=>lines.push((i+1)+'. '+r.plot_ids.join(', ')+(r.crop?' | '+r.crop:'')+
    ' | '+r.treatment_description.replace(/\n/g,'; ')));
  return lines.join('\n').slice(0,3900);
}
function bsePilotRacunCardEdit_(book,row,summary,position){
  const sheet=bseTelegramApprovalSheet_(book);
  try{
    const ack=bseTelegramApi_('editMessageText',{
      chat_id:String(row[7]),message_id:Number(row[9]),text:summary
    });
    if(!ack)throw Error('RACUN_CARD_EDIT_NO_ACK');
    sheet.getRange(position,20).setValue('');SpreadsheetApp.flush();
    return {synced:true};
  }catch(error){
    if(/message is not modified/i.test(String(error&&error.message||''))){
      sheet.getRange(position,20).setValue('');SpreadsheetApp.flush();
      return {synced:true};
    }
    sheet.getRange(position,20).setValue('RACUN_CARD_EDIT_PENDING');SpreadsheetApp.flush();
    return {synced:false};
  }
}
/** Bounded repair for one committed Racun card with a durable pending-edit marker. */
function bsePilotRacunRepairPendingCard_(book){
  if(!bsePilotRacunLockOwned_())throw Error('RACUN_REPAIR_LOCK_REQUIRED');
  const sheet=bseTelegramApprovalSheet_(book),cards=bseApprovalRows_(sheet);
  const pending=cards.map((row,i)=>({row,index:i+2}))
    .filter(x=>String(x.row[17])==='REPORTER_CONFIRMED'&&
      String(x.row[18])==='PILOT_RACUN_ATOMIC'&&
      String(x.row[19])==='RACUN_CARD_EDIT_PENDING');
  if(!pending.length)return {status:'NO_PENDING'};
  const item=pending[0],row=item.row,reference=String(row[0]);
  const queue=bseTelegramQueue_(book),rows=queue.getLastRow()>1?
    queue.getRange(2,1,queue.getLastRow()-1,BSE_TG_QUEUE_HEADERS.length).getValues():[];
  const matches=rows.filter(q=>'BSE-TG-'+String(q[0])===reference);
  if(matches.length!==1)throw Error('RACUN_REPAIR_QUEUE_CONFLICT');
  const result=JSON.parse(String(matches[0][9]||'{}'));
  const envelope=bsePilotRacunAggregateEnvelope_(result);
  if(!envelope||envelope.aggregate_type!=='PILOT_RACUN_ATOMIC'||
     bseApprovalHash_(envelope)!==String(row[2]))throw Error('RACUN_REPAIR_HASH_CONFLICT');
  const plan=bsePilotRacunAtomicPlan_(envelope,reference),adapter=bsePilotRacunSheetAdapter_(book);
  const confirmed=bsePilotRacunApprovalReconcile_(plan,adapter,
    {reference:reference,authorized:true,hash_verified:true});
  if(confirmed.status!=='LEDGER_VERIFIED'||confirmed.record_count!==plan.record_count)
    throw Error('RACUN_REPAIR_LEDGER_UNVERIFIED');
  const repair=bsePilotRacunCardEdit_(book,row,bsePilotRacunReceiptText_(reference,plan),item.index);
  return {status:repair.synced?'CARD_REPAIRED':'REPAIR_PENDING',
    reference:reference,production_write:false};
}

/** Retry repair after journal+approval committed but callback crashed before audit/status sync. */
function bsePilotRacunTelegramReconcileExisting_(book,context,input,snapshot){
  if(!snapshot||!snapshot.row||String(snapshot.row[17])!=='REPORTER_CONFIRMED')
    throw Error('RACUN_RETRY_NOT_CONFIRMED');
  if(!bsePilotRacunLockOwned_())throw Error('RACUN_RETRY_LOCK_REQUIRED');
  const queue=bseTelegramQueue_(book);
  const rows=queue.getLastRow()>1?queue.getRange(2,1,queue.getLastRow()-1,BSE_TG_QUEUE_HEADERS.length).getValues():[];
  const match=rows.filter(q=>'BSE-TG-'+String(q[0])===String(snapshot.row[0]));
  if(match.length!==1)throw Error('RACUN_RETRY_QUEUE_CONFLICT');
  const aggregate=JSON.parse(String(match[0][9]||'{}'));
  const envelope=bsePilotRacunAggregateEnvelope_(aggregate);
  if(!envelope||envelope.aggregate_type!=='PILOT_RACUN_ATOMIC'||
    bseApprovalHash_(envelope)!==String(snapshot.row[2]))
    throw Error('RACUN_RETRY_HASH_CONFLICT');
  return bsePilotRacunTelegramAggregateCore_(book,context,input,{
    row:snapshot.row,queue_row:match[0],proposal:envelope,card_row:snapshot.card_row
  });
}
