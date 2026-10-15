// Gate E controlled backlog recovery. Does NOT run by itself. No scheduled trigger.
// Approval-gated one-shot: never call without separate owner authorization.
// Audit authority: PILOT_GATE_E_OFFSET_AUDIT; transport authority: Telegram getUpdates + BSE_TELEGRAM_OFFSET.
const BSE_GATE_E_IDS=[772257138,772257139,772257140];
const BSE_GATE_E_BOUNDARY=772257141;
const BSE_GATE_E_AUDIT_HEADERS=['update_id','message_id','chat_type','command_class','disposition','verified_at','state'];
function bseGateEExpected_(){
 return [
  {id:772257138,msg:6,type:'private',command:'hi',decision:'TEST_ONLY'},
  {id:772257139,msg:7,type:'group',command:'/pilot',decision:'NON_OPERATIONAL_COMMAND'},
  {id:772257140,msg:8,type:'private',command:'/ask_ai',decision:'ALREADY_ANSWERED'}
 ];
}
function bseGateEClassify_(updates){
 if(!Array.isArray(updates)||updates.length<3)throw Error('GATE_E_BACKLOG_MISSING_OR_ALREADY_ACKNOWLEDGED');
 const expected=bseGateEExpected_();
 for(let i=0;i<3;i++){
  const u=updates[i],e=expected[i],m=u&&u.message;
  if(!m||u.update_id!==e.id||Number(m.message_id)!==e.msg||m.chat.type!==e.type)throw Error('GATE_E_BACKLOG_IDENTITY_MISMATCH_'+i);
  const cmd=String(m.text||'').trim();
  if(e.command==='/ask_ai'?!(cmd==='/ask_ai'||cmd.startsWith('/ask_ai ')):cmd!==e.command)throw Error('GATE_E_BACKLOG_COMMAND_MISMATCH_'+i);
 }
 for(let i=3;i<updates.length;i++)if(!Number.isSafeInteger(updates[i].update_id)||updates[i].update_id<BSE_GATE_E_BOUNDARY)throw Error('GATE_E_UNCLASSIFIED_OLD_UPDATE');
 return expected;
}
function bseGateECheckAudit_(rows, expected){
 if(!Array.isArray(rows))throw Error('GATE_E_AUDIT_MISSING');
 for(const e of expected){
  const hits=rows.filter(r=>String(r[0])===String(e.id));
  if(hits.length!==1||Number(hits[0][1])!==e.msg||String(hits[0][4])!==e.decision)throw Error('GATE_E_AUDIT_READBACK_FAILED_'+e.id);
 }
 if(rows.some(r=>!expected.some(e=>String(e.id)===String(r[0]))))throw Error('GATE_E_AUDIT_UNEXPECTED_ROW');
 return true;
}
function bseGateEInspect_(){
 const binding=getBsePilotOperationRuntimeBindingStatus();
 if(binding.environment!=='PILOT_OPERATION'||binding.automation!=='OFF'||!binding.spreadsheet_bound||!binding.evidence_folder_bound)throw Error('GATE_E_BOUNDARY_FAIL');
 const me=bseTelegramApi_('getMe',{});
 if(!me||me.username!==bseRuntimeBotUsername_())throw Error('GATE_E_BOT_IDENTITY_FAIL');
 if(bseTelegramApi_('getWebhookInfo',{}).url)throw Error('GATE_E_WEBHOOK_ACTIVE');
 const updates=bseTelegramApi_('getUpdates',{offset:0,limit:100,timeout:0,allowed_updates:['message','edited_message','callback_query']});
 const expected=bseGateEClassify_(updates);
 const offset=PropertiesService.getScriptProperties().getProperty('BSE_TELEGRAM_OFFSET')||'';
 if(offset&&offset!==String(BSE_GATE_E_BOUNDARY))throw Error('GATE_E_OFFSET_CONFLICT');
 const book=SpreadsheetApp.openById(BSE_PILOT_OPERATION_BINDING.spreadsheetId);
 const owner=book.getSheetByName('PILOT_OWNER_REGISTRY');
 const ownerRows=owner.getRange(2,1,Math.max(0,owner.getLastRow()-1),8).getValues().filter(r=>String(r[5]).toUpperCase()==='TRUE');
 if(ownerRows.length!==1)throw Error('GATE_E_OWNER_REGISTRY_INVALID');
 const ownerId=String(ownerRows[0][2]), ownerChat=String(ownerRows[0][3]);
 const groupIds=bseTelegramTestApprovalGroupIds_().map(String);
 for(let i=0;i<3;i++){
  const m=updates[i].message;
  if(String(m.from.id)!==ownerId)throw Error('GATE_E_SENDER_MISMATCH');
  if(i===1){if(!groupIds.includes(String(m.chat.id)))throw Error('GATE_E_GROUP_MISMATCH');}
  else if(String(m.chat.id)!==ownerChat)throw Error('GATE_E_PRIVATE_MISMATCH');
 }
 return {book,expected,offset,oldIds:updates.slice(0,3).map(u=>u.update_id),newer:updates.slice(3).map(u=>u.update_id)};
}
// Read-only preparatory command. Does NOT create audit sheet.
function gateEControlledRecoveryPreflight(){
 const lock=LockService.getScriptLock();
 if(!lock.tryLock(1000))throw Error('GATE_E_BUSY');
 try{
  const s=bseGateEInspect_(),sheet=s.book.getSheetByName('PILOT_GATE_E_OFFSET_AUDIT');
  const result={status:'READY_FOR_OWNER_APPROVAL',old_ids:s.oldIds,newer_count:s.newer.length,offset:s.offset||'UNSET',audit_sheet_present:!!sheet,automation:'OFF',remote_ack:false,production_write:false};
  console.log('GATE_E_CONTROLLED_PREFLIGHT '+JSON.stringify(result));return result;
 }finally{lock.releaseLock();}
}
// Mutating function MUST NOT be called without the owner's separate approval to consume the 3 historical Telegram updates.
// Two independent opt-ins prevent an accidental Run click on this function.
function gateEControlledRecoveryExecute(ownerApproval, acknowledgeOldUpdates){
 if(ownerApproval!=='APPROVE_GATE_E_772257138_TO_772257140'||acknowledgeOldUpdates!==true)throw Error('GATE_E_OWNER_APPROVAL_REQUIRED');
 const lock=LockService.getScriptLock();
 if(!lock.tryLock(1000))throw Error('GATE_E_BUSY');
 try{
  const s=bseGateEInspect_(),book=s.book,p=PropertiesService.getScriptProperties();
  let sheet=book.getSheetByName('PILOT_GATE_E_OFFSET_AUDIT');
  if(!sheet){sheet=book.insertSheet('PILOT_GATE_E_OFFSET_AUDIT');sheet.getRange(1,1,1,7).setValues([BSE_GATE_E_AUDIT_HEADERS]);}
  if(sheet.getLastRow()===0)sheet.getRange(1,1,1,7).setValues([BSE_GATE_E_AUDIT_HEADERS]);
  const header=sheet.getRange(1,1,1,7).getValues()[0];
  if(header.join('|')!==BSE_GATE_E_AUDIT_HEADERS.join('|'))throw Error('GATE_E_AUDIT_SCHEMA_MISMATCH');
  let rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,7).getValues():[];
  for(const e of s.expected){
   if(rows.some(r=>String(r[0])===String(e.id)))continue;
   sheet.appendRow([String(e.id),String(e.msg),e.type,e.command,e.decision,new Date().toISOString(),'CLASSIFIED_FOR_ACK']);
  }
  SpreadsheetApp.flush();
  rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,7).getValues():[];
  bseGateECheckAudit_(rows,s.expected);
  // Repeat preflight before irreversible remote acknowledgement.
  bseGateEInspect_();
  if(!s.offset){p.setProperty('BSE_TELEGRAM_OFFSET',String(BSE_GATE_E_BOUNDARY));}
  if(p.getProperty('BSE_TELEGRAM_OFFSET')!==String(BSE_GATE_E_BOUNDARY))throw Error('GATE_E_PROPERTY_READBACK_FAILED');
  const future=bseTelegramApi_('getUpdates',{offset:BSE_GATE_E_BOUNDARY,limit:100,timeout:0,allowed_updates:['message','edited_message','callback_query']});
  if(!Array.isArray(future)||future.some(u=>u.update_id<BSE_GATE_E_BOUNDARY))throw Error('GATE_E_TELEGRAM_ACK_OUTCOME_UNKNOWN');
  const after=bseTelegramApi_('getUpdates',{offset:0,limit:100,timeout:0,allowed_updates:['message','edited_message','callback_query']});
  if(!Array.isArray(after)||after.some(u=>u.update_id<BSE_GATE_E_BOUNDARY))throw Error('GATE_E_TELEGRAM_READBACK_FAILED');
  const result={status:'REMOTE_ACK_VERIFIED',boundary:BSE_GATE_E_BOUNDARY,classified:3,retained_new_updates:after.length,automation:'OFF',production_write:false,official_bse_write:false};
  console.log('GATE_E_CONTROLLED_RECOVERY '+JSON.stringify(result));return result;
 }finally{lock.releaseLock();}
}
