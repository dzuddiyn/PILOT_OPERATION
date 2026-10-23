'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const src=fs.readFileSync(__dirname+'/TelegramAiTest.js','utf8');
const begin=src.indexOf('function bseTelegramAiReceive_('),end=src.indexOf('function bseAiKbConfiguredFolder_(',begin);
const ctx={String,Error,JSON,RegExp,console,bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',
 bseTelegramAiCommand_:x=>String(x).startsWith('/ask '),
 bseTelegramAiAccessAllowed_:()=>true,bseTelegramAiQuestion_:s=>s.replace(/^\/ask /,''),
 bsePilotAskKbNoteContext_:q=>/polybag|keluasan|modul/i.test(q)?'KB_SITE_B_EXTRACT: doc text':'',
 bsePilotKbStructuredAnswer_:()=> 'OLD STRUCTURED ANSWER',
 bsePilotSiteBFaq_:()=>'',bseTelegramAiSend_:(_m,text)=>ctx.sent.push(text),
 bseAiSismarpCurrent_:()=>null,bseAiIracGroundingQuestion_:x=>x,
 bseAiIracGroundedReliable_:()=>null,
 bseAiGeminiAnswer_:()=>({text:'NOTA INDUK ANSWER',kb_used:true,sources:['Nota Induk'],sismarp_current:null}),
 bseTelegramAiRender_:r=>r.text,sent:[]};vm.createContext(ctx);vm.runInContext(src.slice(begin,end),ctx);
test('Site B notes answer before old structured KB even if old matcher would answer',()=>{
 const x=ctx.bseTelegramAiReceive_({}, {text:'/ask berapa bilangan polybag untuk modul 1-8'},true,false);
 assert.equal(ctx.sent.at(-1),'NOTA INDUK ANSWER');assert.equal(x.kb_used,true);
});
test('note API error falls back to existing structured KB',()=>{
 ctx.bseAiGeminiAnswer_=()=>{throw Error('502')};ctx.bseTelegramAiReceive_({}, {text:'/ask keluasan 1 plot'},true,false);
 assert.equal(ctx.sent.at(-1),'OLD STRUCTURED ANSWER');
});
test('IRAC still routed to dedicated grounding without structured intercept',()=>{
 ctx.bseAiGeminiAnswer_=()=>({text:'IRAC FALLBACK',kb_used:false,sources:[]});
 ctx.bseTelegramAiReceive_({}, {text:'/ask kumpulan IRAC abamectin'},true,false);
 assert.equal(ctx.sent.at(-1),'IRAC FALLBACK');
});
