'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/TelegramWorkerTest.js','utf8');
const start=source.indexOf('function bsePilotInventoryReviewCardOnly_('),end=source.indexOf('function processBseTelegramTestQueue()',start);
assert(start>=0&&end>start);
let env='PILOT_OPERATION',n=0;
const ctx={bseRuntimeEnvironmentName_:()=>env};vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);
const original={validation:'PASS',production_write:false,candidates:[{target:'Inventory_Event_Log',validation:'PASS',missing:[],fields:{
 event_type:'INVENTORY_IN',record_type:'INVENTORY_IN',event_date:'2026-10-20',item_name:'Fruitka',quantity:8,unit:'set'
}}]};
const guard=(value,status='NEEDS_HUMAN_REVIEW')=>ctx.bsePilotInventoryReviewCardOnly_(value,status);
const check=(title,run)=>{run();console.log('PASS '+title);n++;};
check('confirmed LIVE screenshot candidate uses one card only',()=>assert.equal(guard(original),true));
check('other stages still receive existing messages',()=>{for(const st of ['WAITING_INFO','QUEUED','RESULT_REPLY_PENDING'])assert.equal(guard(original,st),false)});
check('TEST and PILOT_TEST remain legacy',()=>{for(const v of ['TEST','PILOT_TEST']){env=v;assert.equal(guard(original),false)}env='PILOT_OPERATION'});
check('not inventory or multiple candidates not suppressed',()=>{
 assert.equal(guard({...original,candidates:[{...original.candidates[0],target:'Claim_Request_Log'}]}),false);
 assert.equal(guard({...original,candidates:[original.candidates[0],original.candidates[0]]}),false);
});
check('unvalidated or production-write reports not suppressed',()=>{
 assert.equal(guard({...original,validation:'NEED_INFO'}),false);
 assert.equal(guard({...original,production_write:true}),false);
 assert.equal(guard({...original,candidates:[{...original.candidates[0],missing:['unit']}]}),false);
});
check('invalid inventory content does not suppress diagnostics',()=>{
 for(const fields of [{quantity:0},{quantity:'NaN'},{item_name:''},{unit:''},{event_date:'20/10/2026'}]){
   assert.equal(guard({...original,candidates:[{...original.candidates[0],fields:{...original.candidates[0].fields,...fields}}]}),false);
 }
});
check('inventory OUT is also supported with complete, valid candidate',()=>{
 assert.equal(guard({...original,candidates:[{...original.candidates[0],fields:{...original.candidates[0].fields,event_type:'INVENTORY_OUT'}}]}),true);
});
check('single card remains on downstream worker path',()=>{
 const flow=source.slice(end);
 const guardIndex=flow.indexOf('!bsePilotInventoryReviewCardOnly_(result,reviewStatus)');
 const preview=flow.indexOf("bseTelegramApi_('sendMessage',payload)",guardIndex);
 const card=flow.indexOf('bseTelegramApprovalEnsureCard_(book,latest)',preview);
 assert(guardIndex>=0&&preview>guardIndex&&card>preview);
 assert(!/sendMessage|deleteMessage|setValue|appendRow/.test(source.slice(start,end)));
});
console.log('GI_INVENTORY_CARD_ONLY '+n+'/'+n+' PASS');
