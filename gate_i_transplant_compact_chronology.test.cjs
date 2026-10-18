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
for(const n of ['bseTransplantPlots_','bseTransplantPlotCompare_','bseTransplantExplicitDateContext_'])vm.runInContext(extract(gem,n),ctx);
for(const n of ['bsePilotCompactTransplantDate_','bsePilotTransplantChronology_','bseTelegramTransplantBuildResult_','bseTelegramTransplantDeterministicResult_','bseTelegramQuestion_','bseTelegramQueueStatus_'])vm.runInContext(extract(worker,n),ctx);
let count=0;const check=(label,fn)=>{fn();count++;console.log('PASS '+label)};
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
check('existing pending Telegram question repair is guarded and edits rather than resends',()=>{
 const fn=extract(worker,'repairBsePilotTransplantWaitingQuestion');
 assert(fn.includes("bseRuntimeEnvironmentName_()!=='PILOT_OPERATION'"));
 assert(fn.includes("String(row[6])==='WAITING_INFO'"));
 assert(fn.includes('bseRuntimeLegacyUserId_()'));
 assert(fn.includes("bseTelegramApi_('editMessageText'"));
 assert(!fn.includes("bseTelegramApi_('sendMessage'"));
 assert(!fn.includes('setValue('));
});
console.log('GATE_I_TRANSPLANT_COMPACT '+count+'/'+count+' PASS');
