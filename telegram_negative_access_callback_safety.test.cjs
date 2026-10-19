'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=__dirname;
let writes=0,sends=0,owner='100',active='200',other='300';
const rows=[], callbackSheet={getLastRow:()=>rows.length+1,getRange:()=>({getValues:()=>rows.map(x=>x.slice())}),appendRow:r=>{writes++;rows.push(r)}};
const ctx={console,Date,JSON,String,Number,Math,Set,
 bseTelegramSafeErrorDescription_:e=>String(e),
 bseTestOwnerForTelegramUser_:(_,id)=>({ok:String(id)===owner,private_chat_id:owner}),
 bseTelegramRegistrationRows_:()=>[[active,active,'REGISTERED_ACTIVE']],
 bseTelegramRegistrationSheet_:()=>({}),
 bseTelegramRegistrationPrivateAccess_:(_,message)=>String(message?.from?.id)===active?{status:'REGISTERED_ACTIVE'}:{status:'UNREGISTERED'},
 bseTelegramApi_:()=>{sends++;throw Error('NETWORK_NOT_ALLOWED')},
 bseTelegramApprovalCallbackSheet_:()=>callbackSheet,
 bseTelegramPrivateOptInNudge_:()=>{sends++;throw Error('NUDGE_NOT_ALLOWED')},
 SpreadsheetApp:{flush:()=>{}}
};
vm.createContext(ctx);
for(const file of ['TelegramRegistrationTest.js','TelegramHistoryTest.js','EvidenceOcrTest.js','TelegramApprovalUiTest.js'])vm.runInContext(fs.readFileSync(root+'/'+file,'utf8'),ctx,{filename:file});
// Replace only storage/transport dependencies; retain real access and retry functions under test.
ctx.bseTelegramRegistrationPrivateAccess_=(_,m)=>String(m?.from?.id)===owner?{status:'OWNER_ACTIVE'}:String(m?.from?.id)===active?{status:'REGISTERED_ACTIVE'}:{status:'UNREGISTERED'};
ctx.bseTelegramApprovalCallbackSheet_=()=>callbackSheet;
ctx.bseTelegramPrivateOptInNudge_=()=>{sends++;throw Error('NUDGE_NOT_ALLOWED')};
ctx.bseTelegramSafeErrorDescription_=e=>String(e);
let n=0;function check(label,fn){fn();n++;console.log('PASS '+label)}
const msg=(uid,chat=uid,type='private')=>({from:{id:uid},chat:{id:chat,type}});
check('registration rejects group and impersonated private chat',()=>{assert(!ctx.bseTelegramRegistrationIsPrivateMessage_(msg(active,'-100','group')));assert(!ctx.bseTelegramRegistrationIsPrivateMessage_(msg(active,other)))});
check('registration accepts exact matching private identity',()=>assert(ctx.bseTelegramRegistrationIsPrivateMessage_(msg(active))));
check('history allows owner',()=>assert(ctx.bseTelegramHistoryAccess_({},msg(owner)).ok));
check('history allows active registered user',()=>assert(ctx.bseTelegramHistoryAccess_({},msg(active)).ok));
check('history denies unregistered identity',()=>assert(!ctx.bseTelegramHistoryAccess_({},msg(other)).ok));
check('history denies group and spoofed chat',()=>{assert(!ctx.bseTelegramHistoryAccess_({},msg(active,'-100','group')).ok);assert(!ctx.bseTelegramHistoryAccess_({},msg(active,other)).ok)});
check('history private evidence excluded for unrelated registered user',()=>{assert(!ctx.bseTelegramHistoryEventVisibleTo_({reporter_user_id:other,visibility:'PRIVATE_SUBMISSION'},active,false));assert(ctx.bseTelegramHistoryEventVisibleTo_({reporter_user_id:active,visibility:'PRIVATE_SUBMISSION'},active,false))});
check('history group standard visibility preserved and owner sees all',()=>{assert(ctx.bseTelegramHistoryEventVisibleTo_({reporter_user_id:other,visibility:'GROUP_STANDARD'},active,false));assert(ctx.bseTelegramHistoryEventVisibleTo_({reporter_user_id:other,visibility:'PRIVATE_SUBMISSION'},owner,true))});
check('OCR unauthorized and unrelated active-user access fail closed',()=>{assert(!ctx.bseEvidenceOcrAccess_({},msg(other),{row:[0,0,0,0,active]}).ok);assert(!ctx.bseEvidenceOcrAccess_({},msg(active),{row:[0,0,0,0,other]}).ok)});
check('OCR original reporter and owner have access',()=>{assert(ctx.bseEvidenceOcrAccess_({},msg(active),{row:[0,0,0,0,active]}).ok);assert(ctx.bseEvidenceOcrAccess_({},msg(owner),{row:[0,0,0,0,other]}).ok)});
check('callback terminal expired prevents retry',()=>{const r=ctx.bseTelegramCallbackFailureState_(Error('query is too old'),1,0);assert.equal(r.status,'FAILED_CALLBACK_EXPIRED');assert.equal(r.next_attempt_at,'')});
check('callback retry limit is terminal',()=>{const r=ctx.bseTelegramCallbackFailureState_(Error('temporary outage'),5,0);assert.equal(r.status,'FAILED_CALLBACK_RETRY_LIMIT');assert.equal(r.next_attempt_at,'')});
check('callback transient retry stays PENDING with schedule',()=>{const r=ctx.bseTelegramCallbackFailureState_(Error('temporary outage'),1,0);assert.equal(r.status,'PENDING');assert(r.next_attempt_at)});
check('callback due only after next schedule',()=>{const r=Array(11).fill('');r[5]='PENDING';r[10]='2026-10-19T03:00:00.000Z';assert(!ctx.bseTelegramCallbackPendingDue_(r,Date.parse('2026-10-19T02:00:00Z')));assert(ctx.bseTelegramCallbackPendingDue_(r,Date.parse('2026-10-19T03:00:00Z')));r[5]='FAILED_CALLBACK_EXPIRED';assert(!ctx.bseTelegramCallbackPendingDue_(r,Date.parse('2026-10-20T00:00:00Z')))});
check('callback persists once and rejects duplicate update and callback ids',()=>{
 const payload=(uid,cid)=>({update_id:uid,callback_query:{id:cid,data:'D2:AbCdEf123:V',message:{chat:{type:'private',id:owner}},from:{id:owner}}});
 assert(ctx.bseTelegramApprovalPersistCallback_({},payload('1','C1')).persisted);
 assert(ctx.bseTelegramApprovalPersistCallback_({},payload('1','C2')).duplicate);
 assert(ctx.bseTelegramApprovalPersistCallback_({},payload('2','C1')).duplicate);
 assert.equal(rows.length,1);assert.equal(writes,1);
});
check('callback refuses invalid approval action and avoids writes',()=>{assert.throws(()=>ctx.bseTelegramApprovalPersistCallback_({}, {update_id:'3',callback_query:{data:'D2:AbCdEf123:A'}}),/tidak sah/);assert.equal(writes,1)});
check('synthetic regression emitted no Telegram traffic',()=>assert.equal(sends,0));
console.log('TELEGRAM_NEGATIVE_ACCESS_CALLBACK '+n+'/'+n+' PASS (synthetic only, no live writes)');
