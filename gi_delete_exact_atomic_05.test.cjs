'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/TelegramApprovalUiTest.js','utf8');
const a=source.indexOf('function bseTelegramDeleteCommand_('),b=source.indexOf('function bseTelegramVoidInventoryRecord_(',a);
assert(a>=0&&b>a);
let calls=0;const rows=[
 ['BSE-TG-772257418','BSE-TG-772257418|Inventory_Event_Log|C1',...Array(15).fill(''),'REPORTER_CONFIRMED'],
 ['BSE-TG-772257418','BSE-TG-772257418|Inventory_Event_Log|C2',...Array(15).fill(''),'DISCARDED_BY_REPORTER']
];
const ctx={bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',
 bseTestOwnerForTelegramUser_:()=>({ok:true,private_chat_id:'77'}),
 bseTelegramApprovalSheet_:()=>({}),bseApprovalRows_:()=>rows,
 bseTelegramDeleteSheet_:()=>{calls++;throw Error('write forbidden')},
 bseApprovalToken_:()=>{calls++;throw Error('token forbidden')},
 bseTelegramApi_:()=>{calls++;throw Error('telegram forbidden')}
};vm.createContext(ctx);vm.runInContext(source.slice(a,b),ctx);
const run=(command)=>ctx.bseTelegramDeleteReceiveCommand_({}, {from:{id:77},chat:{id:77,type:'private'},text:command});
test('exact C1 candidate selectable with identity and status, never voided',()=>{
 const x=run('/delete BSE-TG-772257418 C1 alasan ujian');
 assert.equal(x.handled,true);assert.match(x.text,/Inventory_Event_Log\|C1/);
 assert.match(x.text,/belum diaktifkan/);assert.equal(calls,0);
});
test('discarded C2 cannot be selected for destructive mutation',()=>{
 const x=run('/delete BSE-TG-772257418 C2');assert.match(x.text,/NOT_CONFIRMED/);assert.equal(calls,0);
});
test('unknown candidate is fail closed',()=>{
 const x=run('/delete BSE-TG-772257418 C9');assert.match(x.text,/SOURCE_KEY_NOT_UNIQUE_OR_MISSING/);assert.equal(calls,0);
});
test('ambiguous reference gives candidate inventory without mutation',()=>{
 const x=run('/delete BSE-TG-772257418');assert.match(x.text,/C1/);assert.match(x.text,/C2/);assert.equal(calls,0);
});
test('selector cannot be confused with freeform reason and old env parsing remains scoped',()=>{
 assert.equal(ctx.bseTelegramDeleteCommand_('/delete BSE-TG-772257418 C1').selector,'C1');
 assert.equal(ctx.bseTelegramDeleteCommand_('/delete BSE-TG-772257418 sebab pembatalan').selector,'');
});
test('legacy callback rechecks ambiguity before any possible void',()=>{
 const text=fs.readFileSync(__dirname+'/TelegramApprovalUiTest.js','utf8');
 const from=text.indexOf('function bseTelegramDeleteConfirmationCore_(');
 const stop=text.indexOf('// Reporter cards stay',from);
 assert(from>=0&&stop>from);
 const core=text.slice(from,stop);
 assert.match(core,/DELETE_REVISION_CONFLICT_MULTIPLE_CANDIDATES/);
 assert(core.indexOf('DELETE_REVISION_CONFLICT_MULTIPLE_CANDIDATES')<core.indexOf('bseTelegramVoidInventoryRecord_'));
});