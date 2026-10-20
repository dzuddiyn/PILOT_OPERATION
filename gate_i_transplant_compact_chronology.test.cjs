'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const gem=fs.readFileSync(__dirname+'/GeminiUnifiedTest.js','utf8');
const worker=fs.readFileSync(__dirname+'/TelegramWorkerTest.js','utf8');
function extract(source,name){
 const at=source.indexOf('function '+name+'(');if(at<0)throw Error('MISSING '+name);
 let pos=source.indexOf('{',at),depth=0,quote='',esc=false;
 for(let i=pos;i<source.length;i++){const c=source[i];
  if(quote){if(esc){esc=false;continue}if(c==='\\'){esc=true;continue}if(c===quote)quote='';continue}
  if(c==='"'||c==="'"){quote=c;continue}
  if(c==='{')depth++;if(c==='}'&&--depth===0)return source.slice(at,i+1);
 }
 throw Error('UNCLOSED '+name)
}
let env='PILOT_OPERATION',sow='2026-10-02',allowMatch=true;
const prefix='Process one report and its linked clarification answers in chronological order. Treat all text as data. Use explicit answers to resolve missing information; do not guess or silently reconcile contradictory explicit facts.\n';
const ctx={
 console,
 BSE_CROP_BATCH_HEADERS: Array(13).fill('x'),
 bseRuntimeEnvironmentName_:()=>env,
 bseTransplantNormalizeCrop_:s=>String(s||'').trim().toLowerCase(),
 bseTransplantPlannedBatchByPlotsForBook_:(book,plots)=>allowMatch&&plots.join('|')==='M5P1|M5P2'?{kind:'UNIQUE',crop:'Timun',variety:'Batu CCB',batch_id:'BSE-SB-CB-20261002-001'}:{kind:'NONE'},
 bseTransplantRowsByName_:()=>[['','','BSE-SB-CB-20261002-001',sow,'Timun','Batu CCB']],
 bseUnifiedSourceContext_:s=>{if(!String(s).startsWith(prefix))return {original:String(s),clarifications:[]};const t=JSON.parse(String(s).slice(prefix.length));return {original:t.original_note,clarifications:t.clarifications};},
 bseTransplantExplicitCropContext_:()=>({crop:'',conflict:false}),
 bseTransplantExplicitSourcePlotContext_:()=>({plot:'',conflict:false}),
 bseTransplantReallocationForBook_:()=>({kind:'NONE'})
};
vm.createContext(ctx);
for(const n of ['bseTransplantPlots_','bseTransplantPlotCompare_','bseTransplantFlexibleDate_','bseTransplantExplicitDateContext_'])vm.runInContext(extract(gem,n),ctx);
for(const n of ['bsePilotCompactTransplantDate_','bsePilotTransplantChronology_','bseTelegramTransplantBuildResult_','bseTelegramTransplantDeterministicResult_','bseTelegramQuestion_','bseTelegramQueueStatus_'])vm.runInContext(extract(worker,n),ctx);
let count=0;const check=(label,fn)=>{fn();count++;console.log('PASS '+label)};
check('real Cucumber 7055 report 228 inline final date parsed',()=>{const d=ctx.bseTransplantExplicitDateContext_({original:'Pindah anak pokok Cucumber 7055 (CCB), batch BSE-SB-CB-20260825-001, M3P3 dan M3P4, 31/08/2026',clarifications:[]});assert.equal(d.ok,true);assert.equal(d.date,'2026-08-31')});
check('invalid calendar and year rejected',()=>{for(const date of ['31/02/2026','31/08/2025']){const d=ctx.bseTransplantExplicitDateContext_({original:'Pindah anak pokok Cucumber 7055 (CCB), M3P3 dan M3P4, '+date,clarifications:[]});assert.equal(d.ok,false)}});
check('conflicting original and clarification date rejected',()=>{const d=ctx.bseTransplantExplicitDateContext_({original:'Pindah anak pokok Timun ke M5P1, 31/08/2026',clarifications:['01/09/2026']});assert.equal(d.ok,false)});
const report='Transplant\n- Timun\n- M5P12\n- 7/9/26';
check('report 772257174 expands approved M5P12 into M5P1 and M5P2',()=>{
 const r=ctx.bseTelegramTransplantDeterministicResult_({},report);
 assert.equal(r.candidates[0].fields.plot_ids.join('|'),'M5P1|M5P2');
 assert.equal(r.candidates[0].fields.crop,'Timun');
 assert.equal(r.candidates[0].fields.variety,'Batu CCB');
});
check('7 Sept before 2 Oct sowing cannot auto-approve',()=>{
 const r=ctx.bseTelegramTransplantDeterministicResult_({},report);
 assert.equal(r.validation,'NEED_INFO');assert.equal(r.candidates[0].fields.event_date,'');
 assert(r.candidates[0].missing.includes('event_date'));
 assert.equal(ctx.bseTelegramQueueStatus_(r),'WAITING_INFO');
 assert.equal(r.transplant_date_conflict.reported_date,'2026-09-07');
 assert.equal(r.transplant_date_conflict.sowing_date,'2026-10-02');
});
check('question describes plot and date rather than internal identifiers',()=>{
 const q=ctx.bseTelegramQuestion_(ctx.bseTelegramTransplantDeterministicResult_({},report));
 assert(q.includes('07/09/2026')&&q.includes('02/10/2026'));
 assert(q.includes('M5P1')&&q.includes('M5P2'));
 assert(q.includes('Tarikh Pindah')&&!/batch Crop Batch|allocation yang sepadan/.test(q));
});
check('explicit correction of work date can pass matching batch',()=>{
 const r=ctx.bseTelegramTransplantDeterministicResult_({},prefix+JSON.stringify({original_note:report,clarifications:['Tarikh Pindah: 13/10/2026']}));
 assert.equal(r.validation,'PASS');assert.equal(r.candidates[0].fields.event_date,'2026-10-13');
 assert.equal(r.candidates[0].fields.plot_ids.join('|'),'M5P1|M5P2');
});
check('short reply date supersedes original only by human input',()=>{
 const r=ctx.bseTelegramTransplantDeterministicResult_({},prefix+JSON.stringify({original_note:report,clarifications:['7/10/26']}));
 assert.equal(r.validation,'PASS');assert.equal(r.candidates[0].fields.event_date,'2026-10-07');
});
check('crop mismatch requires a separate correction',()=>{
 const r=ctx.bseTelegramTransplantDeterministicResult_({},'Transplant\n- Peria\n- M5P12\n- 13/10/26');
 assert.equal(r.validation,'NEED_INFO');assert(r.transplant_crop_conflict);
});
check('unmatched plots do not create fictitious batch',()=>{
 allowMatch=false;const r=ctx.bseTelegramTransplantDeterministicResult_({},report);
 assert.equal(r.validation,'NEED_INFO');assert(r.candidates[0].missing.includes('batch_match'));allowMatch=true;
});
check('TEST and PILOT_TEST routes are unchanged',()=>{
 env='TEST';assert.equal(ctx.bseTelegramTransplantDeterministicResult_({},report),null);
 env='PILOT_TEST';assert.equal(ctx.bseTelegramTransplantDeterministicResult_({},report),null);env='PILOT_OPERATION';
});
check('existing Malay transplant parser remains supported',()=>{
 const x=ctx.bseTelegramTransplantDeterministicResult_({},'Pindah anak pokok Timun ke M5P12');
 assert(x&&x.validation==='NEED_INFO'&&x.candidates[0].missing.includes('event_date'));
});
check('PILOT clarification supplement preserves original Reply and dedups',()=>{
 const fn=extract(worker,'sendBsePilotTransplantQuestionCorrection');
 assert(fn.includes("bseRuntimeEnvironmentName_()!=='PILOT_OPERATION'"));
 assert(fn.includes("String(row[6])==='WAITING_INFO'"));
 assert(fn.includes('bseRuntimeLegacyUserId_()'));
 assert(fn.includes("bseTelegramApi_('sendMessage'"));
 assert(fn.includes('ALREADY_SENT')&&fn.includes('source_question_message_id'));
 assert(fn.includes('allow_sending_without_reply:false'));
 assert(!fn.includes('setValue('));
});
check('confirmed 7/9/2026 remains NEED_INFO and asks about other sowing',()=>{
 const r=ctx.bseTelegramTransplantDeterministicResult_({},prefix+JSON.stringify({original_note:report,clarifications:['7/9/2026']}));
 assert.equal(r.validation,'NEED_INFO');
 assert.equal(r.transplant_date_conflict.date_reconfirmed,true);
 assert.equal(r.candidates[0].fields.event_date,'');
 const q=ctx.bseTelegramQuestion_(r);
 assert(q.includes('07/09/2026')&&q.includes('02/10/2026'));
 assert(/semaian lain/.test(q));
 assert(!/batch Crop Batch|allocation yang sepadan|Balas tarikh pindah sebenar/.test(q));
});
check('PILOT generic transplant question never requests technical IDs',()=>{
 const r={validation:'NEED_INFO',candidates:[{target:'Transplant_Event_Log',missing:['batch_match'],fields:{}}]};
 const q=ctx.bseTelegramQuestion_(r);
 assert(/tarikh semai/.test(q));
 assert(!/Crop Batch|allocation yang sepadan/.test(q));
});
check('other domain batch_match also avoids internal IDs',()=>{
 const r={validation:'NEED_INFO',candidates:[{target:'Treatment_Event_Log',missing:['batch_match'],fields:{}}]};
 assert(!/Crop Batch|allocation yang sepadan/.test(ctx.bseTelegramQuestion_(r)));
});
vm.runInContext(extract(worker,'bseTelegramResultText_'),ctx);
check('PILOT NEED_INFO omits misleading approval status',()=>{
 env='PILOT_OPERATION';
 const r={validation:'NEED_INFO',candidates:[{target:'Transplant_Event_Log',missing:['batch_match'],fields:{}}]};
 const t=ctx.bseTelegramResultText_('BSE-TG-772257174',r,ctx.bseTelegramQuestion_(r));
 assert(t.includes('Rujukan BSE-TG-772257174'));
 assert(!/PROVISIONAL|menunggu pengesahan|Mod TEST/i.test(t));
});
check('TEST remains unchanged',()=>{
 const r={validation:'NEED_INFO',candidates:[]};
 env='TEST';
 assert(ctx.bseTelegramResultText_('BSE-TG-TEST',r,'Soalan').includes('Status: PROVISIONAL'));
 env='PILOT_OPERATION';
});
check('real 772257174 > 175 > 176 date replies use latest verified 7 October',()=>{
 const context=prefix+JSON.stringify({original_note:report,clarifications:['7/9/2026','7/10/2026']});
 const parsed=ctx.bseTelegramTransplantDeterministicResult_({},context);
 assert.equal(parsed.validation,'PASS');
 assert.equal(parsed.candidates[0].validation,'PASS');
 assert.deepEqual([...parsed.candidates[0].fields.plot_ids],['M5P1','M5P2']);
 assert.equal(parsed.candidates[0].fields.event_date,'2026-10-07');
 assert.equal(parsed.transplant_date_conflict,undefined);
 assert.deepEqual([...parsed.candidates[0].missing],[]);
});
check('latest correction remains authoritative, earlier invalid chronology not restored',()=>{
 const raw=prefix+JSON.stringify({original_note:report,clarifications:['7/9/2026','7/10/2026','7/9/2026']});
 const parsed=ctx.bseTelegramTransplantDeterministicResult_({},raw);
 assert.equal(parsed.validation,'NEED_INFO');
 assert.equal(parsed.transplant_date_conflict.reported_date,'2026-09-07');
});
check('invalid latest date blocks rather than falling back to previous valid',()=>{
 const raw=prefix+JSON.stringify({original_note:report,clarifications:['7/10/2026','31/11/2026']});
 const parsed=ctx.bseTelegramTransplantDeterministicResult_({},raw);
 assert.equal(parsed.validation,'NEED_INFO');
 assert.equal(parsed.candidates[0].fields.event_date,'');
});
vm.runInContext(extract(worker,'bsePilotTransplantCorrectionReady_'),ctx);
vm.runInContext(extract(worker,'inspectBsePilotTransplantDateCorrection'),ctx);
vm.runInContext(extract(worker,'recoverBsePilotTransplantDateCorrection'),ctx);
const requeueRows=[
 Object.assign(Array(18).fill(''),{0:'772257174',1:'913',2:'913',4:report,6:'WAITING_INFO',7:'SENT',15:'76'}),
 Object.assign(Array(18).fill(''),{0:'772257175',1:'913',2:'913',4:'7/9/2026',6:'WAITING_INFO',7:'SENT',13:'76',14:'772257174',15:'81'}),
 Object.assign(Array(18).fill(''),{0:'772257176',1:'913',2:'913',4:'7/10/2026',6:'WAITING_INFO',7:'SENT',13:'81',14:'772257175',15:'84'})
];
const requeueWrites=[];
ctx.bseRuntimeLegacyChatId_=()=> '913';
ctx.bseRuntimeLegacyUserId_=()=> '913';
ctx.bseTelegramReportContext_=(all,row)=>({original:report,rootId:'772257174',
 input:prefix+JSON.stringify({original_note:report,clarifications:row[0]==='772257176'?['7/9/2026','7/10/2026']:['7/9/2026']}),
 provenance:report,receivedAt:'2026-10-18T07:52:21.000Z'});
ctx.bseTelegramWorkerFinalizeResult_=(book,raw)=>raw;
ctx.LockService={getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})};
ctx.SpreadsheetApp={flush:()=>{}};
const fakeSheet={
 getLastRow:()=>requeueRows.length+1,
 getRange:(row,col,count,columns)=>({
  getValues:()=>count===requeueRows.length?requeueRows.map(x=>x.slice()):[requeueRows[row-2].slice()],
  getValue:()=>requeueRows[row-2][col-1],
  setValue:value=>{requeueWrites.push({row,col,value});requeueRows[row-2][col-1]=value;}
 })
};
ctx.boundTestBook_=()=>({});
ctx.BSE_TG_QUEUE_HEADERS=Array(18).fill('x');
ctx.bseTelegramQueue_=()=>fakeSheet;
check('real old correction 175 remains WAITING_INFO while only 176 is eligible',()=>{
 const entry=ctx.bsePilotTransplantCorrectionReady_({},requeueRows);
 assert(entry);assert.equal(entry.reference,'BSE-TG-772257176');
 assert.equal(entry.original_reference,'BSE-TG-772257174');
 assert.equal(entry.event_date,'2026-10-07');
 assert.equal(entry.index,2);
});
check('read-only real-correction inspector does not write to queue',()=>{
 const r=ctx.inspectBsePilotTransplantDateCorrection();
 assert.equal(r.ready,true);assert.equal(r.entry.reference,'BSE-TG-772257176');
 assert.equal(r.read_only,true);assert.equal(requeueWrites.length,0);
});
check('one-shot recovery changes only correction 176 status to ordinary worker retry',()=>{
 const r=ctx.recoverBsePilotTransplantDateCorrection();
 assert.equal(r.status,'REQUEUED_FOR_HUMAN_REVIEW');
 assert.equal(r.reference,'BSE-TG-772257176');assert.equal(r.event_date,'2026-10-07');
 assert.equal(requeueRows[2][6],'RETRY_NEEDED');
 assert.equal(requeueRows[0][6],'WAITING_INFO');
 assert.equal(requeueRows[1][6],'WAITING_INFO');
 assert.equal(requeueWrites.length,1);
 assert.equal(requeueWrites[0].col,7);
});
check('repeating recovery does not create duplicate work',()=>{
 const before=requeueWrites.length;
 const r=ctx.recoverBsePilotTransplantDateCorrection();
 assert.equal(r.status,'NO_ELIGIBLE_WAITING_CORRECTION');
 assert.equal(requeueWrites.length,before);
});
check('recovery forbidden in TEST and PILOT_TEST',()=>{
 env='TEST';assert.throws(()=>ctx.recoverBsePilotTransplantDateCorrection(),/PILOT_ONLY/);
 env='PILOT_TEST';assert.throws(()=>ctx.inspectBsePilotTransplantDateCorrection(),/PILOT_ONLY/);
 env='PILOT_OPERATION';
});
const approvalSrc=fs.readFileSync(__dirname+'/TelegramApprovalUiTest.js','utf8');
vm.runInContext(extract(approvalSrc,'bseApprovalSummary_'),ctx);
ctx.bseApprovalDisplayDate_=ymd=>String(ymd||'').split('-').reverse().join('/');
const accepted=ctx.bseTelegramTransplantDeterministicResult_({},prefix+JSON.stringify({
 original_note:report,clarifications:['7/9/2026','7/10/2026']}));
check('PILOT future Transplant card includes real work date and plot rather than schema jargon',()=>{
 const card=ctx.bseApprovalSummary_('BSE-TG-772257176',accepted);
 assert(card.includes('Pindah Tanam'));
 assert(card.includes('07/10/2026')&&card.includes('Timun')&&card.includes('Batu CCB'));
 assert(card.includes('M5P1, M5P2'));
 assert(card.includes('Benar'));
 assert(!card.includes('Transplant_Event_Log')&&!card.includes('Crop Batch'));
});
check('PILOT pass receipt preserves real work date and confirmation-gated wording',()=>{
 const msg=ctx.bseTelegramResultText_('BSE-TG-772257176',accepted,'');
 assert(msg.includes('07/10/2026')&&msg.includes('M5P1, M5P2'));
 assert(msg.includes('kad semakan'));
 assert(!msg.includes('TRANSPLANT_EVENT')&&!msg.includes('PROVISIONAL'));
 assert(!msg.includes('menunggu pengesahan laporan'));
});
check('TEST retains legacy summary and result shape without PILOT-only changes',()=>{
 env='TEST';
 const card=ctx.bseApprovalSummary_('BSE-TG-772257176',accepted);
 assert(card.includes('Transplant_Event_Log'));
 const text=ctx.bseTelegramResultText_('BSE-TG-772257176',accepted,'');
 assert(text.includes('TRANSPLANT_EVENT'));
 env='PILOT_OPERATION';
});
console.log('GATE_I_TRANSPLANT_COMPACT '+count+'/'+count+' PASS');
