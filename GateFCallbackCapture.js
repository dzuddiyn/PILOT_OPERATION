// Gate F owner-confirmed live callback capture, manually armed only.
// No general automation, no domain write, no offset change on missing callback.
function bseGateFPollForBenar_(fetchUpdates,card,ownerId,offset,maxPolls){
 if(typeof fetchUpdates!=='function'||!Number.isSafeInteger(offset)||offset<772257143||
    !Number.isSafeInteger(maxPolls)||maxPolls<1||maxPolls>6)throw Error('GATE_F_POLL_ARGS');
 for(let attempt=1;attempt<=maxPolls;attempt++){
  const updates=fetchUpdates(offset,attempt);
  if(!Array.isArray(updates))throw Error('GATE_F_POLL_INVALID');
  if(updates.some(u=>!u||!Number.isSafeInteger(u.update_id)||u.update_id<offset))throw Error('GATE_F_POLL_OFFSET_CONFLICT');
  let chosen;
  try{chosen=bseGateFSelectCallback_(updates,card,ownerId);}
  catch(e){if(String(e&&e.message)!=='GATE_F_CALLBACK_NOT_FOUND')throw e;}
  if(chosen){
   if(updates.some(u=>u.update_id<chosen.update_id))throw Error('GATE_F_OLDER_UPDATES_UNRESOLVED');
   return {callback:chosen,polls:attempt};
  }
  // Pending unrelated updates must remain untouched; do not advance Telegram offset.
  if(updates.length)throw Error('GATE_F_UNRELATED_PENDING_UPDATES');
 }
 return {callback:null,polls:maxPolls};
}
function gateFArmCallbackCapture(){
 const lock=LockService.getScriptLock();
 if(!lock.tryLock(1000))throw Error('GATE_F_CAPTURE_BUSY');
 try{
 const b=getBsePilotOperationRuntimeBindingStatus(),p=PropertiesService.getScriptProperties();
 if(b.environment!=='PILOT_OPERATION'||b.automation!=='OFF')throw Error('GATE_F_CAPTURE_BOUNDARY');
 const book=boundTestBook_(),q=bseTelegramQueue_(book);
 if(q.getLastRow()!==2)throw Error('GATE_F_CAPTURE_QUEUE_COUNT');
 const qr=q.getRange(2,1,1,BSE_TG_QUEUE_HEADERS.length).getValues()[0];
 if(String(qr[0])!=='772257142'||String(qr[6])!=='NEEDS_HUMAN_REVIEW'||String(qr[7])!=='SENT')throw Error('GATE_F_CAPTURE_QUEUE_STATE');
 const cards=bseApprovalRows_(bseTelegramApprovalSheet_(book)).filter(r=>String(r[0])==='BSE-TG-772257142');
 if(cards.length!==1||String(cards[0][17])!=='OPEN')throw Error('GATE_F_CAPTURE_CARD_STATE');
 const ledger=bseTelegramApprovalCallbackSheet_(book);
 const rows=ledger.getLastRow()>1?ledger.getRange(2,1,ledger.getLastRow()-1,BSE_APPROVAL_CALLBACK_HEADERS.length).getValues():[];
 if(rows.length)throw Error('GATE_F_CAPTURE_LEDGER_NONEMPTY_RECONCILE');
 const offset=Number(p.getProperty('BSE_TELEGRAM_OFFSET'));
 if(!Number.isSafeInteger(offset)||offset<772257143)throw Error('GATE_F_CAPTURE_OFFSET');
 const bot=bseTelegramApi_('getMe',{}),webhook=bseTelegramApi_('getWebhookInfo',{});
 if(bot.username!==bseRuntimeBotUsername_()||webhook.url)throw Error('GATE_F_CAPTURE_BOT_BOUNDARY');
 console.log('GATE_F_CAPTURE_ARMED '+JSON.stringify({reference:'BSE-TG-772257142',poll_window_seconds_max:90,domain_write:false}));
 const pulled=bseGateFPollForBenar_((atOffset)=>bseTelegramApi_('getUpdates',{offset:atOffset,limit:100,timeout:15,allowed_updates:['message','edited_message','callback_query']}),cards[0],String(cards[0][3]),offset,6);
 if(!pulled.callback){
  console.log('GATE_F_CAPTURE_TIMEOUT '+JSON.stringify({status:'NO_CALLBACK',polls:pulled.polls,offset:String(offset),domain_write:false}));return;
 }
 const callback=pulled.callback;
 const result=bseTelegramApprovalPersistCallback_(book,callback);
 if(!result.persisted&&!result.duplicate)throw Error('GATE_F_CAPTURE_PERSIST_FAILED');
 const check=ledger.getLastRow()>1?ledger.getRange(2,1,ledger.getLastRow()-1,BSE_APPROVAL_CALLBACK_HEADERS.length).getValues():[];
 if(check.filter(r=>String(r[0])===String(callback.update_id)&&String(r[5])==='PENDING').length!==1)throw Error('GATE_F_CAPTURE_READBACK_FAILED');
 // Reconcile offset before advancing. If another poller changes it, stop.
 if(String(p.getProperty('BSE_TELEGRAM_OFFSET'))!==String(offset))throw Error('GATE_F_CAPTURE_OFFSET_CHANGED');
 p.setProperty('BSE_TELEGRAM_OFFSET',String(callback.update_id+1));
 if(p.getProperty('BSE_TELEGRAM_OFFSET')!==String(callback.update_id+1))throw Error('GATE_F_CAPTURE_OFFSET_READBACK_FAILED');
 console.log('GATE_F_CALLBACK_DURABLE '+JSON.stringify({status:'PERSISTED',update_id:callback.update_id,polls:pulled.polls,ledger:'PENDING',offset:String(callback.update_id+1),approval:'OPEN',domain_write:false,automation:'OFF'}));
 }finally{lock.releaseLock();}
}
