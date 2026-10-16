/** Gate H PILOT_OPERATION preparation. Not installed or activated by source sync. */
function bsePilotGateHReadiness_(){
  const binding=getBsePilotOperationRuntimeBindingStatus();
  if(binding.environment!=='PILOT_OPERATION'||!binding.spreadsheet_bound||
     !binding.evidence_folder_bound||binding.production_write!==false||
     binding.official_bse_write!==false||binding.automation!=='OFF')
    throw Error('GATE_H_RUNTIME_NOT_OFF_AND_BOUND');
  const props=PropertiesService.getScriptProperties();
  const offsetText=String(props.getProperty('BSE_TELEGRAM_OFFSET')||'');
  if(!/^\d+$/.test(offsetText)||Number(offsetText)<772257147)
    throw Error('GATE_H_OFFSET_INVALID');
  const book=bseRuntimeBook_(SpreadsheetApp.openById(BSE_PILOT_OPERATION_BINDING.spreadsheetId));
  const ownerId=bseRuntimeLegacyUserId_(),owner=bseTestOwnerForTelegramUser_(book,ownerId);
  if(!owner.ok||String(owner.private_chat_id)!==String(ownerId))
    throw Error('GATE_H_OWNER_NOT_ACTIVE');
  const cards=bseTelegramRecordReadRows_(book,'TEST_TELEGRAM_APPROVAL_UI',BSE_APPROVAL_UI_HEADERS.length),
        queues=bseTelegramRecordReadRows_(book,'TELEGRAM_TEST_QUEUE',BSE_TG_QUEUE_HEADERS.length),
        callbacks=bseTelegramRecordReadRows_(book,'TEST_TELEGRAM_APPROVAL_CALLBACK_PENDING',BSE_APPROVAL_CALLBACK_HEADERS.length);
  const card=cards.find(x=>String(x[0])==='BSE-TG-772257142'),
        queue=queues.find(x=>String(x[0])==='772257142');
  const unresolved=['QUEUED','RETRY_NEEDED','PROCESSING','RESULT_REPLY_PENDING',
    'WAITING_INFO','D1_CLARIFICATION_PENDING','D1_CLARIFICATION_RETRY'];
  if(cards.some(x=>['OPEN','PENDING_REJECT_REASON','CORRECTION_PROMPT_PENDING',
       'CORRECTION_WAITING_INFO'].includes(String(x[17])))||
     !card||String(card[17])!=='REPORTER_CONFIRMED'||!queue||
     String(queue[6])!=='REPORTER_CONFIRMED'||
     queues.some(x=>unresolved.includes(String(x[6])))||
     callbacks.some(x=>String(x[5])!=='PROCESSED'))
    throw Error('GATE_H_F_CALLBACK_NOT_SETTLED');
  let candidate;
  try{candidate=JSON.parse(String(queue[9]||''));}catch(_){throw Error('GATE_H_F_CANDIDATE_INVALID');}
  if(candidate.production_write!==false||candidate.validation!=='PASS'||
     bseApprovalHash_(candidate)!==String(card[2]||''))
    throw Error('GATE_H_F_APPROVAL_HASH_INVALID');
  const batches=bseTelegramRecordReadRows_(book,'TEST_CROP_BATCH',BSE_CROP_BATCH_HEADERS.length),
        planting=bseTelegramRecordReadRows_(book,'TEST_PLANTING_EVENT',BSE_PLANTING_EVENT_HEADERS.length),
        allocations=bseTelegramRecordReadRows_(book,'TEST_PLOT_ALLOCATION',BSE_PLOT_ALLOCATION_HEADERS.length);
  if(batches.length!==1||planting.length!==1||allocations.length!==2||
     String(batches[0][2])!=='BSE-SB-CB-20261002-001'||
     String(planting[0][2])!==String(batches[0][2])||
     allocations.some(x=>String(x[2])!==String(batches[0][2]))||
     allocations.map(x=>String(x[5])).sort().join('|')!=='M5P1|M5P2')
    throw Error('GATE_H_F_DOMAIN_READBACK_INVALID');
  const recordAudit=bseTelegramRecordReadRows_(book,'TEST_TELEGRAM_RECORD_RETRIEVAL_AUDIT',BSE_TG_RECORD_RETRIEVAL_AUDIT_HEADERS.length);
  const retrievalOk=recordAudit.some(x=>String(x[3])==='BSE-TG-772257142'&&
     String(x[1])===String(ownerId)&&String(x[4])==='SENT');
  if(!retrievalOk)throw Error('GATE_H_F_RETRIEVAL_PROOF_MISSING');
  const evidence=bseTelegramRecordReadRows_(book,'TEST_FILE_EVIDENCE',BSE_TG_EVIDENCE_HEADERS.length),
        evidenceAudit=bseTelegramRecordReadRows_(book,'TEST_TELEGRAM_RETRIEVAL_AUDIT',BSE_TG_RETRIEVAL_AUDIT_HEADERS.length),
        evidenceCallbacks=bseTelegramRecordReadRows_(book,'TEST_FILE_EVIDENCE_CALLBACK_PENDING',BSE_TG_EVIDENCE_CALLBACK_HEADERS.length);
  const verified=evidence.filter(x=>String(x[16])==='CONFIRMED_TEST'&&
     String(x[19]||'').trim()&&
     evidenceAudit.some(a=>String(a[3])===String(x[0])&&
       String(a[4])==='SENT'&&String(a[1])===String(ownerId)));
  if(!verified.length||evidenceCallbacks.some(x=>String(x[3])==='PENDING'))
    throw Error('GATE_H_G_EVIDENCE_RETRIEVAL_PROOF_MISSING');
  const bot=bseTelegramApi_('getMe',{}),webhook=bseTelegramApi_('getWebhookInfo',{});
  if(!bot||bot.username!==bseRuntimeBotUsername_()||!webhook||webhook.url)
    throw Error('GATE_H_BOT_BOUNDARY');
  // Offset zero inspects unacknowledged Telegram updates without advancing them.
  const pending=bseTelegramApi_('getUpdates',{offset:0,limit:100,timeout:0,
    allowed_updates:['message','edited_message','callback_query']});
  if(!Array.isArray(pending)||pending.length)
    throw Error('GATE_H_UNRECONCILED_TELEGRAM_BACKLOG');
  const knownHandlers=['bseTelegramTick','bseTelegramReceiveTick','bseTelegramWorkerTick'];
  const known=ScriptApp.getProjectTriggers().filter(t=>knownHandlers.includes(t.getHandlerFunction()));
  if(known.length)throw Error('GATE_H_STALE_TRIGGER_RECONCILE');
  return {ready:true,offset:offsetText,gate_f:'RETRIEVAL_AUDIT_FOUND',
    gate_g:'EVIDENCE_AND_RETRIEVAL_FOUND',confirmed_evidence:verified.length,
    backlog:0,automation:'OFF',production_write:false,official_bse_write:false};
}
function inspectBsePilotOperationGateH(){
  const result=bsePilotGateHReadiness_();
  console.log('GATE_H_PREFLIGHT '+JSON.stringify(result));
  return result;
}
// Install manually ONLY after separate Gate H owner authorization and F/G acceptance.
// Does not migrate Cloud Project, modify domain records or enable official BSE writes.
function installBsePilotOperationGateH(){
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(1000))throw Error('GATE_H_BUSY');
  const props=PropertiesService.getScriptProperties();
  let createdId='';
  try{
    const ready=bsePilotGateHReadiness_(),handler='bseTelegramTick';
    const created=ScriptApp.newTrigger(handler).timeBased().everyMinutes(1).create();
    createdId=created.getUniqueId();
    const hits=ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()===handler);
    if(hits.length!==1||hits[0].getUniqueId()!==createdId)
      throw Error('GATE_H_TRIGGER_READBACK_FAILED');
    props.setProperty('BSE_TELEGRAM_AUTOMATION','ON');
    if(props.getProperty('BSE_TELEGRAM_AUTOMATION')!=='ON')
      throw Error('GATE_H_AUTOMATION_READBACK_FAILED');
    const result={status:'AUTOMATION_ON',handler:handler,triggers:1,
      previous_offset:ready.offset,production_write:false,official_bse_write:false};
    console.log('GATE_H_INSTALL '+JSON.stringify(result));
    return result;
  }catch(error){
    if(createdId){
      props.setProperty('BSE_TELEGRAM_AUTOMATION','OFF');
      // Roll back only the trigger created by THIS installation attempt.
      ScriptApp.getProjectTriggers().filter(t=>t.getUniqueId()===createdId)
        .forEach(t=>ScriptApp.deleteTrigger(t));
    }
    throw error;
  }finally{lock.releaseLock();}
}
function stopBsePilotOperationGateH(){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')
    throw Error('GATE_H_STOP_WRONG_ENVIRONMENT');
  const p=PropertiesService.getScriptProperties();
  p.setProperty('BSE_TELEGRAM_AUTOMATION','OFF');
  ScriptApp.getProjectTriggers().filter(t=>[
    'bseTelegramTick','bseTelegramReceiveTick','bseTelegramWorkerTick'
  ].includes(t.getHandlerFunction())).forEach(t=>ScriptApp.deleteTrigger(t));
  const remains=ScriptApp.getProjectTriggers().filter(t=>[
    'bseTelegramTick','bseTelegramReceiveTick','bseTelegramWorkerTick'
  ].includes(t.getHandlerFunction()));
  if(p.getProperty('BSE_TELEGRAM_AUTOMATION')!=='OFF'||remains.length)
    throw Error('GATE_H_STOP_READBACK_FAILED');
  const out={status:'OFF',triggers:0,production_write:false};
  console.log('GATE_H_STOP '+JSON.stringify(out));return out;
}
