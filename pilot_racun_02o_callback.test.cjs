'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const source=fs.readFileSync(__dirname+'/TelegramApprovalUiTest.js','utf8');
const match=source.match(/const BSE_APPROVAL_UI_HEADERS=(\[[^;]+\]);/);
assert(match);
const approvalHeaders=vm.runInNewContext(match[1]);
const make=()=>{
 const reference='BSE-TG-9999999903',token='ABCDEFGHIJKL',hash='HASH';
 const approval=Array(approvalHeaders.length).fill('');
 approval[0]=reference;approval[1]=reference+'|Treatment_Event_Log';approval[2]=hash;
 approval[3]='123';approval[7]='456';approval[9]='111';approval[10]=token;approval[17]='OPEN';
 const tables={
  PILOT_RACUN_TX_JOURNAL:[['reference','fingerprint','status','record_count','updated_at']],
  PILOT_RACUN_TX_ROWS:[['source_key','reference','payload_json','updated_at']],
  TEST_TELEGRAM_APPROVAL_UI:[approvalHeaders.slice(),approval]
 };
 let injectAt=0,appendCount=0,locks=0,releases=0,editFailures=0;
 const sheet=name=>({
  getLastRow:()=>tables[name].length,
  getRange:(r,c,n=1,w=1)=>({
   getValues:()=>Array.from({length:n},(_,i)=>Array.from({length:w},(_,j)=>(tables[name][r-1+i]||[])[c-1+j]??'')),
   setValue:v=>{tables[name][r-1] ||= [];tables[name][r-1][c-1]=v;},
   setValues:vals=>vals.forEach((row,i)=>row.forEach((v,j)=>{tables[name][r-1+i] ||= [];tables[name][r-1+i][c-1+j]=v;}))
  }),
  appendRow:row=>{tables[name].push([...row]);if(name==='PILOT_RACUN_TX_ROWS'&&++appendCount===injectAt)throw Error('TEST_ONLY_INJECTED_APPEND');}
 });
 const book={getSheetByName:n=>tables[n]?sheet(n):null};
 const close=[],ctx={Date,JSON,Map,Set,Number,String,Error,
  BSE_APPROVAL_UI_HEADERS:approvalHeaders,
  SpreadsheetApp:{flush:()=>{}},
  LockService:{getScriptLock:()=>({tryLock:()=>{locks++;return true;},releaseLock:()=>{releases++;}})},
  boundTestBook_:()=>book,bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',
  bseApprovalHash_:()=>hash,
  bseTelegramReporterCardAuthorized_:(row,cb)=>String(row[3])===String(cb.from.id)&&String(row[7])===String(cb.message.chat.id),
  bseTelegramApprovalSheet_:()=>sheet('TEST_TELEGRAM_APPROVAL_UI'),
  bseApprovalRecomputeQueueStatus_:()=> 'REPORTER_CONFIRMED',
  bseTelegramApi_:(method,payload)=>{if(method==='editMessageText'){close.push(payload);if(editFailures-->0)throw Error('TEST_ONLY_TELEGRAM_EDIT_FAIL');return {message_id:payload.message_id};}return {ok:true};}
 };
 vm.createContext(ctx);
 for(const f of ['PilotRacunAtomicPlan.js','PilotRacunSheetAdapter.js','PilotRacunJournal.js',
  'PilotRacunCallbackCoordinator.js','PilotRacunApprovalReconcile.js','PilotRacunApprovalTransition.js',
  'PilotRacunApprovalSheetAdapter.js','PilotRacunTransactionFlow.js','PilotRacunLockScope.js',
  'PilotRacunTelegramAggregateCore.js','PilotRacunApprovalGate.js'])
  vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
 const sourceNote='Racun\n19/10/2026\n1. M1P1\nTEST_ONLY - 1';
 const candidates=Array.from({length:10},(_,i)=>({target:'Treatment_Event_Log',validation:'PASS',missing:[],fields:{
  original_note:sourceNote,event_date:'2026-10-19',plot_ids:['M'+(i+1)+'P1'],
  treatment_description:'TEST_ONLY_MATERIAL - '+(i+1),verification_status:'PROVISIONAL',
  pending_treatment_items:[],crop:''}}));
 const proposal={aggregate_type:'PILOT_RACUN_ATOMIC',production_write:false,validation:'PASS',candidates};
 const callback={from:{id:'123'},message:{chat:{id:'456'},message_id:111},id:'TEST_ONLY_CB'};
 const input={kind:'A',token,callback};const context={actor_name:'TEST_ONLY'};
 const snapshot=()=>({row:[...tables.TEST_TELEGRAM_APPROVAL_UI[1]],proposal,card_row:2});
 return {ctx,tables,book,reference,input,context,snapshot,close,setFailure:n=>injectAt=n,disableFailure:()=>injectAt=0,setEditFailures:n=>editFailures=n,lockCounts:()=>[locks,releases]};
};
test('real callback core commits 10 synthetic Racun records with one outer lock and verified approval',()=>{
 const x=make();
 const output=x.ctx.bsePilotRacunWithLock_(()=>x.ctx.bsePilotRacunTelegramAggregateCore_(x.book,x.context,x.input,x.snapshot()));
 assert.equal(output.status,'REPORTER_CONFIRMED');assert.equal(output.record_count,10);
 assert.equal(x.tables.PILOT_RACUN_TX_ROWS.length,11);
 assert.equal(x.tables.PILOT_RACUN_TX_JOURNAL[1][2],'COMMITTED');
 assert.equal(x.tables.TEST_TELEGRAM_APPROVAL_UI[1][17],'REPORTER_CONFIRMED');
 assert.equal(x.tables.TEST_TELEGRAM_APPROVAL_UI[1][13],'REPORTER_CONFIRMED');
 assert.deepEqual(x.lockCounts(),[1,1]);assert.equal(x.close.length,1);
 assert.equal(JSON.stringify(x.close[0].reply_markup),'{"inline_keyboard":[]}');
 assert.match(output.receipt_text,/Jumlah: 10 rekod/);
 assert.match(output.receipt_text,/Tarikh: 19\/10\/2026/);
 assert.match(output.receipt_text,/1\. M1P1\n   • TEST_ONLY_MATERIAL - 1/);
 assert.match(output.receipt_text,/bukan rekod rasmi BSE/);
 assert(output.receipt_text.length<=3900);
 const replay=x.ctx.bsePilotRacunWithLock_(()=>x.ctx.bsePilotRacunTelegramAggregateCore_(x.book,x.context,x.input,x.snapshot()));
 assert.equal(replay.status,'ALREADY_CONFIRMED');
 assert.equal(x.tables.PILOT_RACUN_TX_ROWS.length,11);assert.equal(x.close.length,1);
});
test('failure on append 5 leaves approval OPEN; retry converges to ten and only then confirms',()=>{
 const x=make();x.setFailure(5);
 assert.throws(()=>x.ctx.bsePilotRacunWithLock_(()=>x.ctx.bsePilotRacunTelegramAggregateCore_(x.book,x.context,x.input,x.snapshot())),/RECOVERY_REQUIRED/);
 assert.equal(x.tables.PILOT_RACUN_TX_ROWS.length,6);
 assert.equal(x.tables.TEST_TELEGRAM_APPROVAL_UI[1][17],'OPEN');
 x.disableFailure();
 const result=x.ctx.bsePilotRacunWithLock_(()=>x.ctx.bsePilotRacunTelegramAggregateCore_(x.book,x.context,x.input,x.snapshot()));
 assert.equal(result.status,'REPORTER_CONFIRMED');
 assert.equal(x.tables.PILOT_RACUN_TX_ROWS.length,11);
 assert.equal(new Set(x.tables.PILOT_RACUN_TX_ROWS.slice(1).map(r=>r[0])).size,10);
 assert.deepEqual(x.lockCounts(),[2,2]);
});
test('Telegram edit failure leaves durable repair marker; idempotent replay repairs card',()=>{
 const x=make();x.setEditFailures(1);
 const result=x.ctx.bsePilotRacunWithLock_(()=>x.ctx.bsePilotRacunTelegramAggregateCore_(x.book,x.context,x.input,x.snapshot()));
 assert.equal(result.card_display_status,'REPAIR_PENDING');
 assert.equal(x.tables.TEST_TELEGRAM_APPROVAL_UI[1][19],'RACUN_CARD_EDIT_PENDING');
 assert.equal(x.tables.PILOT_RACUN_TX_JOURNAL[1][2],'COMMITTED');
 const replay=x.ctx.bsePilotRacunWithLock_(()=>x.ctx.bsePilotRacunTelegramAggregateCore_(x.book,x.context,x.input,x.snapshot()));
 assert.equal(replay.status,'ALREADY_CONFIRMED');assert.equal(replay.card_display_status,'SYNCED');
 assert.equal(x.tables.TEST_TELEGRAM_APPROVAL_UI[1][19],'');
 assert.equal(x.close.length,2);assert.equal(JSON.stringify(x.close[1].reply_markup),'{"inline_keyboard":[]}');assert.equal(x.tables.PILOT_RACUN_TX_ROWS.length,11);
});
test('cancel guard blocks after partial durable writes, accepts only untouched records',()=>{
 const x=make();
 assert.equal(x.ctx.bsePilotRacunCancelEligibility_(x.book,x.reference).allowed,true);
 x.setFailure(5);
 assert.throws(()=>x.ctx.bsePilotRacunWithLock_(()=>x.ctx.bsePilotRacunTelegramAggregateCore_(x.book,x.context,x.input,x.snapshot())),/RECOVERY_REQUIRED/);
 const decision=x.ctx.bsePilotRacunCancelEligibility_(x.book,x.reference);
 assert.equal(decision.allowed,false);assert.equal(decision.reason,'DURABLE_JOURNAL_OR_ROWS_PRESENT');
 assert.equal(x.tables.TEST_TELEGRAM_APPROVAL_UI[1][17],'OPEN');
});
test('forged reporter and missing lock do not create journal rows',()=>{
 const x=make(),cb={...x.input.callback,from:{id:'999'}};
 assert.throws(()=>x.ctx.bsePilotRacunWithLock_(()=>x.ctx.bsePilotRacunTelegramAggregateCore_(x.book,x.context,{...x.input,callback:cb},x.snapshot())),/UNAUTHORIZED/);
 assert.throws(()=>x.ctx.bsePilotRacunTelegramAggregateCore_(x.book,x.context,x.input,x.snapshot()),/LOCK_REQUIRED/);
 assert.equal(x.tables.PILOT_RACUN_TX_JOURNAL.length,1);
});
