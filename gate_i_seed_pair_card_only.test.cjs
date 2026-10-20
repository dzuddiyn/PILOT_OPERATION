'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const worker=fs.readFileSync(__dirname+'/TelegramWorkerTest.js','utf8');
const approval=fs.readFileSync(__dirname+'/TelegramApprovalUiTest.js','utf8');
function extract(source,name){
 const at=source.indexOf('function '+name+'(');if(at<0)throw Error('MISSING '+name);
 let pos=source.indexOf('{',at),depth=0,quote='',esc=false;
 for(let i=pos;i<source.length;i++){const c=source[i];
  if(quote){if(esc){esc=false;continue}if(c==='\\'){esc=true;continue}if(c===quote)quote='';continue}
  if(c==='"'||c==="'"){quote=c;continue}
  if(c==='{')depth++;else if(c==='}'&&--depth===0)return source.slice(at,i+1);
 }throw Error('UNCLOSED '+name);
}
let env='PILOT_OPERATION',n=0;
const ctx={bseRuntimeEnvironmentName_:()=>env,bseUnifiedSourceContext_:s=>({original:String(s),clarifications:[]}),bseApprovalDisplayDate_:s=>String(s).split('-').reverse().join('/')};
vm.createContext(ctx);
vm.runInContext(extract(fs.readFileSync('GeminiUnifiedTest.js','utf8'),'bseTransplantFlexibleDate_'),ctx);
for(const k of ['bsePilotCompactSowingResult_','bsePilotSowingReviewCardOnly_','bsePilotTransplantReviewCardOnly_'])
 vm.runInContext(extract(worker,k),ctx);
vm.runInContext(extract(approval,'bseApprovalSummary_'),ctx);
const check=(name,fn)=>{fn();n++;console.log('PASS '+name)};
const report='- Semai\nTimun (282)\n- M5P34\n- 6/10/26';
const result=ctx.bsePilotCompactSowingResult_(report);
check('actual report 772257184 parsed to ONE batch TWO canonical plot allocations',()=>{
 assert.equal(result.validation,'PASS');assert.equal(result.candidates.length,4);
 assert.deepEqual(result.candidates.map(x=>x.target),['Crop_Batch_Log','Planting_Event_Log','Plot_Allocation_Log','Plot_Allocation_Log']);
 assert.deepEqual(result.candidates.slice(2).map(x=>x.fields.plot_id),['M5P3','M5P4']);
});
check('actual date crop and cultivar 282 preserved exactly, never treated as plant count',()=>{
 const f=result.candidates[0].fields;
 assert.equal(f.crop,'Timun');assert.equal(f.variety,'282');assert.equal(f.event_date,'2026-10-06');
 assert.equal(f.original_note,report);assert.equal(result.production_write,false);
});
check('real card shows two plots and correct 6 Oct date before Benar',()=>{
 const card=ctx.bseApprovalSummary_('BSE-TG-772257184',result);
 assert(card.includes('Tarikh semai: 06/10/2026'));assert(card.includes('Timun'));
 assert(card.includes('Varieti: 282'));assert(card.includes('Plot: M5P3, M5P4'));
 assert(!card.includes('Plot: M5P34'));
});
check('VALID PILOT seed batch PASS goes direct to review card',()=>{
 assert.equal(ctx.bsePilotSowingReviewCardOnly_(result,'NEEDS_HUMAN_REVIEW'),true);
 assert(worker.includes('!bsePilotSowingReviewCardOnly_(result,reviewStatus)'));
});
check('ambiguous 3-digit plot suffix fails closed, no fabricated plot',()=>{
 const r=ctx.bsePilotCompactSowingResult_(report.replace('M5P34','M5P345'));
 assert.equal(r.validation,'NEED_INFO');assert.equal(ctx.bsePilotSowingReviewCardOnly_(r,'WAITING_INFO'),false);
});
check('invalid calendar date cannot reach human PASS',()=>{
 const r=ctx.bsePilotCompactSowingResult_(report.replace('6/10/26','31/11/26'));
 assert.equal(r.validation,'NEED_INFO');assert.equal(ctx.bsePilotSowingReviewCardOnly_(r,'WAITING_INFO'),false);
});
check('compact explicit two plot comma M2P1,2 is recognized',()=>{
 const r=ctx.bsePilotCompactSowingResult_('- Semai\nPeria Besar (Hup Nong)\n- M2P1,2\n- 14/10/26');
 assert.equal(r.validation,'PASS');
 assert.deepEqual(r.candidates.slice(2).map(x=>x.fields.plot_id),['M2P1','M2P2']);
});
check('duplicate plot pair P33 cannot become a false two-plot allocation',()=>{
 const r=ctx.bsePilotCompactSowingResult_(report.replace('M5P34','M5P33'));
 assert.equal(r.validation,'NEED_INFO');
});
check('TEST and PILOT_TEST retain historic grammar and no card-only change',()=>{
 env='TEST';assert.equal(ctx.bsePilotCompactSowingResult_(report),null);
 assert.equal(ctx.bsePilotSowingReviewCardOnly_(result,'NEEDS_HUMAN_REVIEW'),false);
 env='PILOT_TEST';assert.equal(ctx.bsePilotCompactSowingResult_(report),null);
 env='PILOT_OPERATION';
});
check('non-batch reports never use seed card-only filter',()=>{
 const x={...result,candidates:[{...result.candidates[0],target:'Transplant_Event_Log'}]};
 assert.equal(ctx.bsePilotSowingReviewCardOnly_(x,'NEEDS_HUMAN_REVIEW'),false);
});
check('one unmatched seed source line cannot silently succeed',()=>{
 const r=ctx.bsePilotCompactSowingResult_(report+'\nextra unknown plot');
 assert.equal(r.validation,'NEED_INFO');
});
console.log('GATE_I_SEED_PAIR_CARD_ONLY '+n+'/'+n+' PASS');
