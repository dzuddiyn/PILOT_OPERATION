'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(__dirname+'/EnvironmentTest.js','utf8');
let env='PILOT_OPERATION';
const ctx={
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>k==='BSE_RUNTIME_ENV'?env:''})},
 console
};
vm.createContext(ctx);vm.runInContext(src,ctx);
let count=0;function check(title,fn){fn();count++;console.log('PASS '+title)}
check('PILOT retrieval title and mode normalized',()=>{
 env='PILOT_OPERATION';const x=ctx.bseRuntimeTelegramPayload_('sendMessage',{
 text:'Rekod TEST BSE-TG-772257142\nMod TEST - tiada rekod production ditulis.'});
 assert.equal(x.text,'[PILOT]\nRekod PILOT BSE-TG-772257142\nMod PILOT - tiada rekod production ditulis.');
});
check('PILOT evidence caption normalized',()=>{
 env='PILOT_OPERATION';const x=ctx.bseRuntimeTelegramPayload_('sendPhoto',{caption:'Evidence TEST BSE-EV-1'});
 assert.equal(x.caption,'[PILOT]\nEvidence PILOT BSE-EV-1');
});
check('PILOT plot and daily UI headings normalized',()=>{
 env='PILOT_OPERATION';for(const [old,next] of [['Status Plot TEST M5P1','Status Plot PILOT M5P1'],
  ['Laporan TEST - 2026-10-02','Laporan PILOT - 2026-10-02'],
  ['Makluman TEST BSE-TG','Makluman PILOT BSE-TG']]){
  assert.equal(ctx.bseRuntimeTelegramPayload_('sendMessage',{text:old}).text,'[PILOT]\n'+next);
 }
});
check('PILOT original notes remain verbatim',()=>{
 env='PILOT_OPERATION';const note='Original note: Rekod TEST near midline, TEST_ONLY Gate H';
 assert.equal(ctx.bseRuntimeTelegramPayload_('sendMessage',{text:note}).text,'[PILOT]\n'+note);
});
check('PILOT existing prefix does not duplicate',()=>{
 env='PILOT_OPERATION';const r=ctx.bseRuntimeTelegramPayload_('sendMessage',{
  text:'[PILOT]\nRekod TEST BSE-TG-1'});
 assert.equal(r.text,'[PILOT]\nRekod PILOT BSE-TG-1');
});
check('PILOT_TEST output unchanged',()=>{
 env='PILOT_TEST';const r=ctx.bseRuntimeTelegramPayload_('sendMessage',{text:'Rekod TEST BSE-TG-1'});
 assert.equal(r.text,'[PILOT TEST]\nRekod TEST BSE-TG-1');
});
check('TEST output unchanged',()=>{
 env='TEST';const r=ctx.bseRuntimeTelegramPayload_('sendMessage',{text:'Rekod TEST BSE-TG-1'});
 assert.equal(r.text,'Rekod TEST BSE-TG-1');
});
check('PILOT transport does not rewrite non-text fields',()=>{
 env='PILOT_OPERATION';const p={chat_id:123,parse_mode:'HTML',text:'Rekod TEST BSE-TG-1'};
 const r=ctx.bseRuntimeTelegramPayload_('sendMessage',p);
 assert.equal(r.chat_id,123);assert.equal(r.parse_mode,'HTML');assert.equal(p.text,'Rekod TEST BSE-TG-1');
});
console.log('GATE_I_PILOT_PRESENTATION '+count+'/'+count+' PASS');
