'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=n=>fs.readFileSync(__dirname+'/'+n,'utf8');
let env='PILOT_OPERATION',passes=0;
const ctx={
 console,
 PropertiesService:{getScriptProperties:()=>({getProperty:()=>''})},
 Utilities:{formatDate:(d,zone,format)=>{assert.equal(zone,'Asia/Kuala_Lumpur');assert.equal(format,'dd/MM/yyyy');const iso=new Date(d).toISOString().slice(0,10);return iso.slice(8,10)+'/'+iso.slice(5,7)+'/'+iso.slice(0,4)}},
 bseRuntimeEnvironmentName_:()=>env,
 bseApprovalDisplayDate_:v=>String(v).replace(/^(\d{4})-(\d{2})-(\d{2})$/,'$3/$2/$1'),
 bsePilotEcHistoryReadingText_:()=> 'M7 — EC_IN: 3.5'
};vm.createContext(ctx);
for(const f of ['EnvironmentTest.js','TelegramCommandTest.js','TelegramAiTest.js','TreatmentReviewTest.js','EcLeachateTest.js'])vm.runInContext(read(f),ctx,{filename:f});
ctx.bseRuntimeEnvironmentName_=()=>env;
const test=(label,f)=>{f();passes++;console.log('PASS '+label)};
test('PILOT /start OpsMate token in contract',()=>assert.equal(vm.runInContext('BSE_RUNTIME_ENV_CONFIG.PILOT_OPERATION.startToken',ctx),'OpsMate'));
test('PILOT native /start and /start OpsMate accepted without old token',()=>{
 ctx.bseRuntimeBotUsername_=()=> 'opsmate_bot';
 assert.equal(ctx.bseRuntimeStartCommandMatches_('/start'),true);
 assert.equal(ctx.bseRuntimeStartCommandMatches_('/start OpsMate'),true);
 assert.equal(ctx.bseRuntimeStartCommandMatches_('/start BSE_PILOT'),false);
});
test('PILOT /ask parser exact /ask and bot mention',()=>{
 assert.equal(ctx.bseTelegramAiCommand_('/ask dimethoate'),true);
 assert.equal(ctx.bseTelegramAiQuestion_('/ask dimethoate'),'dimethoate');
 assert.equal(ctx.bseTelegramAiQuestion_('/ask@opsmate_bot kumpulan IRAC?'),'kumpulan IRAC?');
 for(const s of ['/ask_ai foo','/asking foo','hi /ask foo'])assert.equal(ctx.bseTelegramAiCommand_(s),false,s);
});
test('PILOT menu advertises /ask, /ec not aliases',()=>{
 const m=ctx.bsePilotTelegramCommandMenu_();
 assert(m.some(x=>x.command==='ask'&&x.description.includes('/ask')));
 assert(!m.some(x=>x.command==='ask_ai'||x.command==='ec_history'));
 assert(m.some(x=>x.command==='ec'));
});
test('PILOT prompt is not mislabeled PILOT_TEST',()=>{
 const p=ctx.bseTelegramAiSystemPrompt_(true);
 assert(p.includes('PILOT_OPERATION'));
 assert(p.includes('/ask tidak mempunyai akses'));
});
test('TEST retains /ask_ai and /start BSE_TEST',()=>{
 env='TEST';assert.equal(ctx.bseTelegramAiCommand_('/ask_ai dimethoate'),true);
 assert.equal(ctx.bseTelegramAiCommand_('/ask dimethoate'),false);
 assert(ctx.bsePilotTelegramCommandMenu_().some(x=>x.command==='ask_ai'));
 assert.equal(vm.runInContext('BSE_RUNTIME_ENV_CONFIG.TEST.startToken',ctx),'BSE_TEST');
 env='PILOT_OPERATION';
});
test('PETANG/PAGI session tokens never treatment products',()=>{
 for(const x of ['PG','PAGI','PTG','PETANG','Sesi: PETANG','Masa: pg'])
  assert.equal(ctx.bseTreatmentListControlLine_(x),true,x);
});
test('racun sample reads four chemicals, ignores PETANG pending',()=>{
 const note='Racun\n19/10/2026\nIsnin\nPETANG\n\n1. M3 - P34 TIMUN (51 hst)\nDynamec-180\nMancozeb - 500\nTop plus -140\ncalcium-300';
 const products=ctx.bseTreatmentListItems_(note);
 const pending=ctx.bseTreatmentPendingItems_(note);
 assert.equal(products.length,4);
 assert.equal(pending.some(x=>/petang|pagi|pg|ptg/i.test(x)),false);
 assert.equal(pending.length,0);
});
test('EC confirmed Date object displays 14/10/2026 not JS Date.toString()',()=>{
 const d=new Date('2026-10-14T00:00:00Z');
 assert.equal(ctx.bsePilotEcConfirmedDateText_(d),'14/10/2026');
 assert.equal(ctx.bsePilotEcConfirmedDateText_('2026-10-14'),'14/10/2026');
 assert.equal(ctx.bsePilotEcConfirmedDateText_('Wed Oct 14 2026 08:00:00 GMT+0800 (Malaysia Time)'),'14/10/2026');
});
test('EC actual confirmation summary has the friendly date',()=>{
 const row=['k','b','1',new Date('2026-10-14T00:00:00Z'),'','MODULE','M7','',null,3.5,'MODULE_IN_ONLY','REPORTER_CONFIRMED_TEST'];
 const v=ctx.bseEcLeachateConfirmedSummaryFromRows_('BSE-TG-TESTONLY',[row]);
 assert(v.includes('Tarikh: 14/10/2026'));
 assert(!v.includes('GMT+0800'));
});
console.log('GI_COMMAND_TREATMENT_DATE '+passes+'/'+passes+' PASS');
