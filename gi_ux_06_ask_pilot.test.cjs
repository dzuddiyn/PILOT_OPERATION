'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
let env='PILOT_OPERATION';
const sent=[];
const ctx={console,bseRuntimeEnvironmentName_:()=>env,bseTelegramApi_:(method,payload)=>{
 assert.equal(method,'sendMessage');sent.push(payload);return {message_id:100};
}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'TelegramAiTest.js'),'utf8'),ctx);
const msg={chat:{id:123,type:'private'},message_id:99};
function check(name,fn){fn();console.log('PASS '+name);}
check('PILOT /ask AI response has user-facing heading with no legacy technical heading',()=>{
 sent.length=0;
 ctx.bseTelegramAiSend_(msg,ctx.bseTelegramAiRender_({text:'Maklumat ujian.',sources:[]}));
 assert.equal(sent.length,1);
 assert.match(sent[0].text,/Jawapan AI — Maklumat rujukan sahaja/);
 assert.doesNotMatch(sent[0].text,/NON_CANONICAL|PILOT_TEST/);
 assert.equal(sent[0].reply_parameters,undefined);
});
check('PILOT /ask structured KB answer uses the same heading and no reply thread',()=>{
 sent.length=0;ctx.bseTelegramAiSend_(msg,'Maklumat daripada KB.');
 assert.match(sent[0].text,/Jawapan AI — Maklumat rujukan sahaja/);
 assert.doesNotMatch(sent[0].text,/NON_CANONICAL/);
 assert.equal(sent[0].reply_parameters,undefined);
});
check('PILOT system prompt does not claim PILOT_TEST or /ask_ai',()=>{
 const p=ctx.bseTelegramAiSystemPrompt_(true);
 assert.doesNotMatch(p,/mod PILOT_TEST|\/ask_ai/);
 assert.match(p,/\/ask/);
});
check('PILOT /ask rejects /ask_ai and legacy TEST retains historic semantics',()=>{
 assert(ctx.bseTelegramAiCommand_('/ask sesuatu'));
 assert(!ctx.bseTelegramAiCommand_('/ask_ai sesuatu'));
 env='TEST';sent.length=0;
 assert(ctx.bseTelegramAiCommand_('/ask_ai soalan'));
 ctx.bseTelegramAiSend_(msg,'Jawapan TEST');
 assert.equal(sent[0].reply_parameters.message_id,99);
 assert.doesNotMatch(sent[0].text,/Jawapan AI — Maklumat rujukan sahaja/);
 assert.match(ctx.bseTelegramAiSystemPrompt_(false),/PILOT_TEST/);
});
check('PILOT usage, oversized input and service errors are notices, not AI answers',()=>{
  const ask=(text)=>{sent.length=0;ctx.bseTelegramAiReceive_(null,{...msg,text},true,false);assert.equal(sent.length,1);assert.equal(sent[0].reply_parameters,undefined);assert.doesNotMatch(sent[0].text,/Jawapan AI — Maklumat rujukan sahaja/);};
  env='PILOT_OPERATION';
  ask('/ask');assert.match(sent[0].text,/Gunakan: \/ask/);
  ask('/ask '+'x'.repeat(6001));assert.match(sent[0].text,/Soalan terlalu panjang/);
  ctx.bsePilotKbStructuredAnswer_=()=>null;ctx.bsePilotSiteBFaq_=()=>null;
  ctx.bseAiSismarpCurrent_=()=>{throw Error('SYNTHETIC_OFFLINE');};
  ask('/ask pertanyaan ujian');assert.match(sent[0].text,/AI tidak dapat menjawab sekarang/);
});
console.log('GI_UX_06_LOCAL_TEST: 5/5 PASS');