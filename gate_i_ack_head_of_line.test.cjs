'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/TelegramQueueTest.js','utf8');
let n=0;
const check=(label,fn)=>{fn();n++;console.log('PASS '+label)};
const rows=[
 ['772257172','-100','885','71','','','UNSUPPORTED','PENDING','','',0,'','','','','','',''],
 ['772257174','913','913','74','Transplant\n- Timun\n- M5P12\n- 7/9/26','','QUEUED','PENDING','','',0,'','','','','','','']
];
const original=rows.map(x=>x.slice()),sent=[],logs=[];
const sheet={
 getLastRow:()=>3,
 getRange:(row,col,count,width)=>({
  getValues:()=>rows.map(x=>x.slice()),
  setValues:vals=>{assert.equal(col,8);const target=rows[row-2];target[7]=vals[0][0];target[8]=vals[0][1];}
 })
};
const ctx={
 console:{log:x=>logs.push(String(x))},
 LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>k==='BSE_TELEGRAM_OFFSET'?'772257175':''})},
 boundTestBook_:()=>({}),
 bseTelegramQueue_:()=>sheet,
 bseRuntimeLegacyChatId_:()=> '913',
 bseRuntimeLegacyUserId_:()=> '913',
 bseTelegramTestApprovalGroupIds_:()=>['-100'],
 bseRuntimeBotUsername_:()=> 'pilotbot',
 bseTelegramApi_:(m,v)=>{
  if(m==='getMe')return {username:'pilotbot'};
  if(m==='getWebhookInfo')return {url:''};
  if(m==='getUpdates')return [];
  if(m==='sendMessage'){sent.push(v.chat_id);if(v.chat_id==='-100')throw Error('GROUP_SEND_DENIED');return {message_id:345};}
  throw Error('UNEXPECTED_API '+m);
 },
 bseTelegramSafeErrorDescription_:s=>String(s).slice(0,80),
 processBseTelegramApprovalCallbacks:()=>{},
 processBseTelegramRegistrationCallbacks:()=>{},
 processBseImageActionCallbacksTest:()=>{},
 processBseImageProcessingCallbacksTest:()=>{},
 processBseTelegramEvidenceCallbacks:()=>{},
 processBseTelegramInventoryClarificationReplies:()=>{},
};
vm.createContext(ctx);vm.runInContext(source,ctx);ctx.bseTelegramQueue_=()=>sheet;
check('first group ACK can fail while later private ACK is sent',()=>{
 ctx.receiveBseTelegramTest();
 assert.deepEqual(sent,['-100','913']);
 assert.equal(rows[0][7],'PENDING');
 assert.equal(rows[1][7],'SENT');
 assert.equal(rows[1][8],'345');
});
check('source queue text and pending domain statuses stay untouched',()=>{
 assert.equal(rows[1][4],original[1][4]);assert.equal(rows[1][6],'QUEUED');
 assert.equal(rows[0][6],'UNSUPPORTED');
});
check('safe log records failed update for diagnosis without tokens',()=>{
 assert(logs.some(x=>x.includes('ACK_PENDING:')&&x.includes('772257172')&&x.includes('GROUP_SEND_DENIED')));
 assert(logs.every(x=>!x.includes('bot123:')));
});
check('retry of failed group does not resend owner ACK',()=>{
 const before=sent.filter(x=>x==='913').length;
 ctx.receiveBseTelegramTest();
 assert.equal(sent.filter(x=>x==='913').length,before);
 assert.equal(rows[0][7],'PENDING');
});
check('receiver continues without domain or production write',()=>{
 const ack=source.slice(source.indexOf('    // Acknowledgements are retried'),source.indexOf("console.log('TELEGRAM_RECEIVE_DONE"));
 assert(ack.includes('continue;'));assert(!ack.includes('production_write:true'));
});
console.log('GATE_I_ACK_HEAD_OF_LINE '+n+'/'+n+' PASS');
