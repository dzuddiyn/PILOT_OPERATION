'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'PilotIncompleteBatalTest.js'),'utf8');
const oldCard=[
 'SEMAKAN LAPORAN BELUM LENGKAP',
 'Rujukan : BSE-TG-772257603',
 'Jenis : Transplant Event Log',
 '❌ Belum lengkap: event_date, crop, batch_match',
 'Tiada rekod operasi disimpan. Betulkan dan hantar laporan baharu.'
].join('\n');
const candidate={validation:'NEED_INFO',production_write:false,candidates:[{target:'Transplant_Event_Log',
 validation:'NEED_INFO',missing:['event_date','crop','batch_match'],fields:{}}]};
const row=Array(18).fill('');
row[0]='772257603';row[1]='-100333';row[2]='1234';row[6]='INCOMPLETE_CANCEL_ONLY';
row[9]=JSON.stringify(candidate);row[15]='900';row[4]='Transplant Event sample';
const values=[row],writes=[],calls=[];
let editFailure='',environment='PILOT_OPERATION';
const sheet={
 getLastRow(){return values.length+1;},
 getRange(r,c,n=1,w=1){return {
  getValues:()=>values.slice(r-2,r-2+n).map(x=>x.slice(c-1,c-1+w)),
  setValue(v){values[r-2][c-1]=v;writes.push({row:r,column:c,value:v});return this;},
  setNumberFormat(){return this;}
 }}
};
const context={console,Date,JSON,Number,Set,SpreadsheetApp:{flush(){}},
 bseRuntimeEnvironmentName_:()=>environment,
 BSE_TG_QUEUE_HEADERS:Array(18).fill(''),
 bseTelegramQueue_:()=>sheet,
 bseTelegramApi_:(name,payload)=>{
  calls.push({name,payload});
  if(name==='editMessageText'&&editFailure){
   const err=editFailure;editFailure='';throw new Error(err);
  }
  return name==='editMessageText'?{message_id:900,ok:true}:true;
 }
};
vm.createContext(context);vm.runInContext(source,context);
const callback=(user=1234,text=oldCard,messageId=900)=>({
 id:'callback_1',
 data:'C2:772257603:C',
 from:{id:user},
 message:{chat:{id:-100333,type:'supergroup'},message_id:messageId,text}
});
let count=0;function t(name,fn){fn();count++;console.log('PASS '+name);}
function reset(state='INCOMPLETE_CANCEL_ONLY'){row[6]=state;calls.length=0;writes.length=0;editFailure='';}
t('cancel preserves exact entire original card and adds only status header',()=>{
 reset();
 const result=context.bsePilotIncompleteCallback_({},callback());
 assert.equal(result.cancelled,true);
 assert.equal(row[6],'INCOMPLETE_CANCELLED');
 const edits=calls.filter(c=>c.name==='editMessageText');
 assert.equal(edits.length,1);
 assert.equal(edits[0].payload.text,'❌ Dibatalkan\n'+oldCard);
 assert.deepEqual(Array.from(edits[0].payload.reply_markup.inline_keyboard),[]);
 assert.equal(edits[0].payload.chat_id,'-100333');
 assert.equal(edits[0].payload.message_id,900);
 assert(!calls.some(c=>c.name==='sendMessage'));
 assert.deepEqual(writes.map(x=>x.column),[7,7]);
});
t('previously cancelled old card can be visibly repaired without queue mutation',()=>{
 reset('INCOMPLETE_CANCELLED');
 const result=context.bsePilotIncompleteCallback_({},callback());
 assert.equal(result.duplicate,true);
 assert.equal(writes.length,0);
 assert.equal(calls.filter(x=>x.name==='editMessageText').length,1);
 assert.equal(calls[0].payload.text,'❌ Dibatalkan\n'+oldCard);
});
t('double prefix never added when Telegram message already says cancelled',()=>{
 reset('INCOMPLETE_CANCELLED');
 context.bsePilotIncompleteCallback_({},callback(1234,'❌ Dibatalkan\n'+oldCard));
 assert.equal(calls[0].payload.text,'❌ Dibatalkan\n'+oldCard);
});
t('edit failure reserves cancellation and retry repairs same card',()=>{
 reset();
 editFailure='Telegram HTTP 429: retry later';
 assert.throws(()=>context.bsePilotIncompleteCallback_({},callback()),/retry later/);
 assert.equal(row[6],'INCOMPLETE_CANCEL_ACK_PENDING');
 assert.deepEqual(writes.map(x=>x.column),[7]);
 calls.length=0;writes.length=0;
 const fixed=context.bsePilotIncompleteCallback_({},callback());
 assert.equal(fixed.cancelled,true);
 assert.equal(row[6],'INCOMPLETE_CANCELLED');
 assert.deepEqual(writes.map(x=>x.column),[7]);
 assert.equal(calls[0].payload.text,'❌ Dibatalkan\n'+oldCard);
});
t('message not modified counts as an already successful Telegram card update',()=>{
 reset('INCOMPLETE_CANCEL_ACK_PENDING');
 editFailure='Bad Request: message is not modified';
 assert(context.bsePilotIncompleteCallback_({},callback()).cancelled);
 assert.equal(row[6],'INCOMPLETE_CANCELLED');
});
t('unauthorized reporter or wrong card cannot change card or technical queue',()=>{
 reset();
 assert.equal(context.bsePilotIncompleteCallback_({},callback(9999)).authorized,false);
 assert.equal(context.bsePilotIncompleteCallback_({},callback(1234,oldCard,901)).authorized,false);
 assert.equal(calls.length,0);
 assert.equal(writes.length,0);
 assert.equal(row[6],'INCOMPLETE_CANCEL_ONLY');
});
t('missing Telegram text fails closed and never overwrites historic card',()=>{
 reset();
 assert.throws(()=>context.bsePilotIncompleteCallback_({},callback(1234,'')),/ORIGINAL_CARD_TEXT_UNAVAILABLE/);
 assert.equal(calls.filter(x=>x.name==='editMessageText').length,0);
 assert.equal(row[6],'INCOMPLETE_CANCEL_ACK_PENDING');
});
t('example labels for plot, missing date, crop and batch match',()=>{
 const text=context.bsePilotIncompleteCard_(row,candidate);
 assert.match(text,/Tarikh \(contoh 10\/10\/2026\)/);
 assert.match(text,/Tanaman \(contoh Peria Besar\)/);
 assert.match(text,/Padanan batch/);
 const plotResult={...candidate,candidates:[{target:'Crop_Batch_Log',missing:['plot_id'],fields:{}}]};
 assert.match(context.bsePilotIncompleteCard_(row,plotResult),/Plot \(contoh M1P1\)/);
});
t('date hints scoped to parsers actually available',()=>{
 const census={...candidate,candidates:[{target:'Plant_Census_Log',missing:['event_date'],fields:{census_entries:[{plot_id:'M6P2'}]}}]};
 assert.match(context.bsePilotIncompleteCard_(row,census),/10\/10\/26, 2026-10-10/);
 const compact=[...row];compact[4]='semai\nPeria Besar (936 Hua Li)\n31-Aug-26';
 const s={...candidate,candidates:[{target:'Crop_Batch_Log',missing:['event_date'],fields:{}}]};
 const content=context.bsePilotIncompleteCard_(compact,s);
 assert.match(content,/10 Ogos 2026/);
 assert.match(content,/10\/10, 10\/10\/2026/);
});
t('all API interactions are callback acknowledgment or card edit, not operational write',()=>{
 assert(!/\b(?:appendRow|insertSheet|bseCropBatchReviewCore_|bsePlantCensusReviewCore_)\(/.test(source));
 assert(!source.includes('DRAFT_NONCANONICAL'));
});
console.log('GI_UX_02_BATAL_FEEDBACK '+count+'/'+count+' PASS');
