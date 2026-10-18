'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(__dirname+'/TelegramAutomationTest.js','utf8');
const state={env:'PILOT_OPERATION',on:'ON',marker:'uid',binding:true,mode:'busy',
  receive:0,callback:0,worker:0,book:0,offset:'772257155',logs:[]};
const ctx={
  console:{log:t=>state.logs.push(String(t))},
  PropertiesService:{getScriptProperties:()=>({getProperty:k=>k==='BSE_TELEGRAM_AUTOMATION'?state.on:
    k==='BSE_PILOT_GATE_H_TRIGGER_ID'?state.marker:k==='BSE_TELEGRAM_OFFSET'?state.offset:''})},
  bseRuntimeEnvironmentName_:()=>state.env,
  getBsePilotOperationRuntimeBindingStatus:()=>({
    spreadsheet_bound:state.binding,evidence_folder_bound:true,
    production_write:false,official_bse_write:false}),
  ScriptApp:{getProjectTriggers:()=>[{getHandlerFunction:()=> 'bseTelegramTick',getUniqueId:()=> 'uid'}]},
  bseTelegramAutomationBook_:()=>{state.book++;},
  receiveBseTelegramTest:()=>{state.receive++;if(state.mode==='busy')throw Error('Penerimaan lain sedang berjalan.');
    if(state.mode==='network')throw Error('Sambungan Telegram gagal; token tidak dipaparkan.');},
  processBseTelegramApprovalCallbacks:()=>{state.callback++;},
  processBseTelegramTestQueue:()=>{state.worker++;}
};
vm.createContext(ctx);vm.runInContext(src,ctx);
ctx.bseTelegramAutomationBook_=()=>{state.book++;}; // Override dependency defined by loaded source.
let n=0;function test(label,f){f();n++;console.log('PASS '+label)}
function reset(){state.env='PILOT_OPERATION';state.on='ON';state.marker='uid';state.binding=true;
 state.mode='busy';state.receive=0;state.callback=0;state.worker=0;state.book=0;state.offset='772257155';state.logs=[];}
test('PILOT lock contention defers without offset mutation or false PASS',()=>{
 reset();const o=ctx.bseTelegramTick();assert.equal(o.status,'RETRY_NEXT_TICK');
 assert.equal(state.offset,'772257155');assert.equal(state.receive,1);
 assert.equal(state.callback,0);assert.equal(state.worker,0);
 assert(state.logs.some(x=>x.includes('GATE_H_RECEIVER_BUSY_DEFERRED')));
});
test('network failure is NOT swallowed',()=>{
 reset();state.mode='network';assert.throws(()=>ctx.bseTelegramTick(),/Sambungan Telegram gagal/);
 assert.equal(state.worker,0);assert(!state.logs.some(x=>x.includes('GATE_H_RECEIVER_BUSY_DEFERRED')));
});
test('normal PILOT receive continues callbacks and queue',()=>{
 reset();state.mode='ok';ctx.bseTelegramTick();assert.equal(state.receive,1);
 assert.equal(state.callback,1);assert.equal(state.worker,1);
});
test('wrong runtime binding fails closed',()=>{
 reset();state.binding=false;assert.throws(()=>ctx.bseTelegramTick(),/GATE_H_RUNTIME_BOUNDARY_FAILED/);
 assert.equal(state.receive,0);
});
test('stale owner trigger marker fails closed',()=>{
 reset();state.marker='other';assert.throws(()=>ctx.bseTelegramTick(),/GATE_H_TRIGGER_AUTHORITY_MISSING/);
});
test('general automation OFF does not receive',()=>{
 reset();state.on='OFF';ctx.bseTelegramTick();assert.equal(state.receive,0);
});
test('PILOT_TEST legacy path stays unsupported',()=>{
 reset();state.env='PILOT_TEST';ctx.bseTelegramTick();assert.equal(state.receive,0);
});
test('inherited TEST busy error behavior remains unchanged',()=>{
 reset();state.env='TEST';assert.throws(()=>ctx.bseTelegramTick(),/Penerimaan lain sedang berjalan/);
});
console.log('GATE_I_RECEIVER_OVERLAP '+n+'/'+n+' PASS');
