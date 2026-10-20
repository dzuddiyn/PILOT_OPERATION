'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const worker=fs.readFileSync('TelegramWorkerTest.js','utf8');
const unified=fs.readFileSync('GeminiUnifiedTest.js','utf8');
const ui=fs.readFileSync('TelegramApprovalUiTest.js','utf8');
const review=fs.readFileSync('OperationDecisionReviewTest.js','utf8');
function section(text,begin,end){const a=text.indexOf(begin),b=text.indexOf(end,a+begin.length);assert(a>=0&&b>a,begin);return text.slice(a,b);}
const ctx={bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',
 bseUnifiedSourceContext_:v=>({original:String(v),clarifications:[]}),
 bseApprovalDisplayDate_:date=>date?date.slice(8,10)+'/'+date.slice(5,7)+'/'+date.slice(0,4):''};
vm.createContext(ctx);
vm.runInContext(section(unified,'function bseCanonicalPlotTokens_','function bseTransplantPlots_'),ctx);
vm.runInContext(section(unified,'function bseTransplantFlexibleDate_','function bseTransplantExplicitDate_'),ctx);
vm.runInContext(section(worker,'function bsePilotHarvestStartResult_','function bsePilotSowingReviewCardOnly_'),ctx);
vm.runInContext(section(ui,'function bseApprovalSummary_','function runBseTelegramPrivateOptInHarnessTests'),ctx);
vm.runInContext(section(review,'function bseOperationDecisionCandidate_','function bseOperationDecisionSourceKey_'),ctx);
const input='Tarikh mula harverst / tuai\nM7P3\n14-Oct-26',res=ctx.bsePilotHarvestStartResult_(input);
let n=0;function check(label,fn){fn();n++;console.log('PASS '+label);}
check('typo real user message parsed exactly',()=>assert.equal(res.validation,'PASS'));
check('single operation candidate and no direct write',()=>assert.equal(res.candidates.length,1)&&assert.equal(res.candidates[0].target,'Operation_Log')&&assert.equal(res.production_write,false));
check('exact plot and report date',()=>assert.equal(res.candidates[0].fields.plot_id,'M7P3')&&assert.equal(res.candidates[0].fields.event_date,'2026-10-14'));
check('no crop weight yield or physical claims inferred',()=>{const f=res.candidates[0].fields;assert.equal(f.operation_type,'HARVEST_START');assert.equal(f.verification_status,'PROVISIONAL');assert.equal(f.event_time,'');assert(!('crop'in f)&&!('quantity'in f)&&!('weight'in f));});
check('existing Operation Log review contract accepts candidate',()=>assert.equal(ctx.bseOperationDecisionCandidate_(res,'Operation_Log').candidate.fields.plot_id,'M7P3'));
check('English spelling supported',()=>assert.equal(ctx.bsePilotHarvestStartResult_('Tarikh mula harvest / tuai\nM7P3\n14-Oct-26').validation,'PASS'));
check('Malay header supported',()=>assert.equal(ctx.bsePilotHarvestStartResult_('Tarikh mula tuai\nM7P3\n14/10/26').validation,'PASS'));
check('invalid date waits for correction not guessed',()=>{const r=ctx.bsePilotHarvestStartResult_('Tarikh mula tuai\nM7P3\n31-Feb-26');assert.equal(r.validation,'NEED_INFO');assert.equal(r.candidates[0].fields.event_date,'');});
check('missing plot cannot approve',()=>assert.notEqual(ctx.bsePilotHarvestStartResult_('Tarikh mula tuai\n14-Oct-26').validation,'PASS'));
check('multiple plots rejected',()=>assert.equal(ctx.bsePilotHarvestStartResult_('Tarikh mula tuai\nM7P3,4\n14-Oct-26').validation,'REJECTED'));
check('unexpected fourth line rejected',()=>assert.equal(ctx.bsePilotHarvestStartResult_('Tarikh mula tuai\nM7P3\n14-Oct-26\n100 kg').validation,'REJECTED'));
check('unsupported year rejected or NEED_INFO',()=>assert.notEqual(ctx.bsePilotHarvestStartResult_('Tarikh mula tuai\nM7P3\n14-Oct-25').validation,'PASS'));
check('unrelated messages not hijacked',()=>assert.equal(ctx.bsePilotHarvestStartResult_('semai\nCucumber 6656 (282 CP)\nM7P3\n14-Oct-26'),null));
check('non pilot does not route harvest',()=>{ctx.bseRuntimeEnvironmentName_=()=> 'TEST';assert.equal(ctx.bsePilotHarvestStartResult_(input),null);ctx.bseRuntimeEnvironmentName_=()=> 'PILOT_OPERATION';});
check('harvest router before Gemini fallback',()=>assert(worker.indexOf('harvestStartResult||operationDecisionResult||bseUnifiedProcess_')>=0&&worker.indexOf('bsePilotHarvestStartResult_(job.input)')<worker.indexOf('bseUnifiedProcess_(job.input,job.receivedAt)',worker.indexOf('const harvestStartResult='))));
check('reporter card says Mula Tuai and preserves approval buttons',()=>{const msg=ctx.bseApprovalSummary_('BSE-TG-9',res);assert(msg.includes('Mula Tuai')&&msg.includes('Plot: M7P3')&&msg.includes('14/10/2026'));assert(!msg.includes('Tekan Benar hanya jika')&&!msg.includes('Selepas Benar, rekod pindah tanam'));});
const transplant={validation:'PASS',production_write:false,candidates:[{target:'Transplant_Event_Log',fields:{crop:'Peria',event_date:'2026-09-06',plot_ids:['M7P3']}}]};
check('transplant approval card omits both crossed sentences',()=>{const msg=ctx.bseApprovalSummary_('BSE-TG-259',transplant);assert(msg.includes('Pindah Tanam')&&msg.includes('M7P3'));assert(!msg.includes('Tekan Benar hanya')&&!msg.includes('Selepas Benar, rekod pindah tanam'));});
const sow={validation:'PASS',production_write:false,candidates:[{target:'Crop_Batch_Log',fields:{event_date:'2026-08-31',crop:'Peria',variety:'936 Hua li'}},{target:'Planting_Event_Log',fields:{}},{target:'Plot_Allocation_Log',fields:{plot_id:'M7P3',allocation_status:'PLANNED'}}]};
check('sowing approval card also omits crossed sentences',()=>{const msg=ctx.bseApprovalSummary_('BSE-TG-257',sow);assert(!msg.includes('Tekan Benar hanya')&&!msg.includes('Selepas Benar, rekod pindah tanam'));});
check('all source card templates free of crossed sentences',()=>{assert(!ui.includes("'Tekan Benar hanya jika tarikh, tanaman dan plot ini betul.'"));assert(!ui.includes("'Selepas Benar, rekod pindah tanam disimpan dan status plot berkaitan dikemas kini.'"));});
console.log('GI_HARVEST_AND_CARDS '+n+'/'+n+' PASS');
