'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=(f)=>fs.readFileSync(path.join(__dirname,f),'utf8');
const code=src('PilotIncompleteBatalTest.js'),worker=src('TelegramWorkerTest.js'),ui=src('TelegramApprovalUiTest.js');
let env='PILOT_OPERATION',messageSeq=900,seen=[],edits=[];
const census={validation:'NEED_INFO',production_write:false,candidates:[{target:'Plant_Census_Log',validation:'NEED_INFO',missing:['event_date'],fields:{crop:'Peria Besar',census_entries:[{plot_id:'M6P2',reported_dead_count:143,reported_sick_count:654}]}}]};
const row=Array(18).fill('');
row[0]='772257581';row[1]='-100333';row[2]='1234';row[4]='REKOD BANCI POKOK\nModul: M6P2\nMati: 143\nSakit: 654';row[9]=JSON.stringify(census);row[6]='RESULT_REPLY_PENDING';
const values=[row];
const sheet={getLastRow:()=>values.length+1,getRange:(r,c)=>({
 getValues:()=>values.slice(r-2).map(x=>x.slice(c-1)),
 setValue(v){values[r-2][c-1]=v;edits.push([r,c,v]);return this;},
 setNumberFormat(){return this;}
})};
const context={
 console,Date,JSON,Number,Set,SpreadsheetApp:{flush(){}},
 bseRuntimeEnvironmentName_:()=>env,bseTelegramQueue_:()=>sheet,BSE_TG_QUEUE_HEADERS:Array(18).fill(''),
 bseTelegramApi_:(name,payload)=>{seen.push({name,payload});return {message_id:messageSeq};}
};
vm.createContext(context);vm.runInContext(code,context);
let count=0;function test(label,fn){fn();count++;console.log('PASS '+label);}
test('incomplete eligible, no complete/TEST/production mixing',()=>{
 assert(context.bsePilotIncompleteEligible_(census,'WAITING_INFO'));
 assert(!context.bsePilotIncompleteEligible_({...census,validation:'PASS'},'WAITING_INFO'));
 assert(!context.bsePilotIncompleteEligible_({...census,production_write:true},'WAITING_INFO'));
 env='TEST';assert(!context.bsePilotIncompleteEligible_(census,'WAITING_INFO'));env='PILOT_OPERATION';
});
test('census card only understood fields and supported date formats',()=>{
 const text=context.bsePilotIncompleteCard_(row,census);
 for(const term of ['REKOD BANCI POKOK','BSE-TG-772257581','M6P2','Peria Besar','Mati : 143','Sakit : 654','Tarikh : ❌','10/10/2026','10/10/26','2026-10-10'])assert(text.includes(term),term);
 assert(!text.includes('Benar')&&!text.includes('Simpan Draf'));
});
test('sends only Batal, not Telegram Reply nor ForceReply',()=>{
 const out=context.bsePilotIncompleteOffer_(sheet,row.slice(),census,2);
 assert(out.offered);assert.equal(seen.length,1);
 assert.equal(seen[0].name,'sendMessage');
 assert.equal(seen[0].payload.reply_parameters,undefined);
 assert.equal(seen[0].payload.reply_markup.force_reply,undefined);
 const buttons=seen[0].payload.reply_markup.inline_keyboard.flat();
 assert.equal(buttons.length,1);assert.match(buttons[0].text,/Batal/);
 assert.equal(buttons[0].callback_data,'C2:772257581:C');
 assert.equal(values[0][6],'INCOMPLETE_CANCEL_ONLY');
 assert.equal(values[0][15],'900');
});
const cb=(user=1234,chat='-100333',message_id=900,data='C2:772257581:C')=>({
 id:'callback123',data,from:{id:user},message:{message_id,chat:{id:chat,type:'supergroup'},text:'SEMAKAN LAPORAN BELUM LENGKAP\nRujukan : BSE-TG-772257581'}});
const book={};
test('forged actor, chat, callback card ID or action cannot cancel',()=>{
 for(const arg of [[999,'-100333',900,'C2:772257581:C'],[1234,'-100999',900,'C2:772257581:C'],
 [1234,'-100333',901,'C2:772257581:C'],[1234,'-100333',900,'C2:772257581:S']]){
  const result=context.bsePilotIncompleteCallback_(book,cb(...arg));
  assert(!result.cancelled);
 }
 assert.equal(values[0][6],'INCOMPLETE_CANCEL_ONLY');
});
test('Batal once and repeated click idempotent',()=>{
 const x=context.bsePilotIncompleteCallback_(book,cb());
 assert(x.cancelled);assert.equal(values[0][6],'INCOMPLETE_CANCELLED');
 const count=edits.length;
 const y=context.bsePilotIncompleteCallback_(book,cb());
 assert(y.duplicate);assert.equal(edits.length,count);
 assert(edits.every(x=>[7,16].includes(x[1])));
});
test('no write to plot, sowing, history, summary, status or draft',()=>{
 assert.doesNotMatch(code,/(?:getSheetByName|insertSheet)\(['"](?:TEST_)?(?:CROP_BATCH|PLANTING_EVENT|PLOT_ALLOCATION)/i);
 assert.doesNotMatch(code,/DRAFT_NONCANONICAL|Simpan Draf|planned|PLANNED/);
 assert.doesNotMatch(code,/\b(?:bseCropBatchReviewCore_|bsePlantCensusReviewCore_|bseTransplantReviewCore_)\(/);
 for(const name of ['TelegramHistoryTest.js','TelegramPlotStatusTest.js','TelegramQueueTest.js'])assert(!src(name).includes('bsePilotDraft'));
});
test('callback travels through durable existing approval queue and locked dispatch',()=>{
 assert.match(ui,/\(B1\|D1\|D2\|C2\)/);
 assert.match(ui,/match\[1\]==='C2'/);
 assert.match(ui,/bsePilotIncompleteCallback_\(book,callback\)/);
 assert.match(ui,/bseReviewWithLock_/);
 assert.match(worker,/bsePilotIncompleteOffer_\(sheet,r,result,job.row\)/);
 assert.match(worker,/return;\s*\}\s*try \{\s*if\(!bsePilotTransplantReviewCardOnly_/);
});
test('uncertain Telegram send fails closed, no duplicate retry',()=>{
 values[0][6]='RESULT_REPLY_PENDING';messageSeq=0;
 const a=context.bsePilotIncompleteOffer_(sheet,row.slice(),census,2);
 assert(a.pending);
 assert.equal(values[0][6],'INCOMPLETE_CARD_SEND_PENDING');
 assert(!['QUEUED','RETRY_NEEDED','PROCESSING','RESULT_REPLY_PENDING'].includes(values[0][6]));
 messageSeq=900;
});
test('other report text shows only validated-looking scalar hints, not approval button',()=>{
 const v={validation:'NEED_INFO',production_write:false,candidates:[{target:'Inventory_Event_Log',missing:['quantity'],fields:{item_name:'Baja A',unit:'kg'}}]};
 const card=context.bsePilotIncompleteCard_(row,v);
 assert.match(card,/Baja A/);assert.match(card,/Kuantiti \(contoh 200\)/);assert(!/Benar|Simpan Draf/.test(card));
});
console.log('GI_UX_02_BATAL_ONLY '+count+'/'+count+' PASS');
