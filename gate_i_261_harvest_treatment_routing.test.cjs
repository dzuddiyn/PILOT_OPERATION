'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const worker=fs.readFileSync('TelegramWorkerTest.js','utf8'),unified=fs.readFileSync('GeminiUnifiedTest.js','utf8'),treatment=fs.readFileSync('TreatmentReviewTest.js','utf8'),ui=fs.readFileSync('TelegramApprovalUiTest.js','utf8');
function section(src,a,b){let start=src.indexOf('function '+a+'('),end=src.indexOf('function '+b+'(',start+1);assert(start>=0&&end>start,'SECTION_MISSING_'+a);return src.slice(start,end)}
const input='Tarikh mula harverst / tuai\nM7P3\n14-Oct-26';
const ctx={bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',
 bseUnifiedSourceContext_:x=>({original:String(x),clarifications:[],provenance:String(x)}),
 bseApprovalDisplayDate_:x=>String(x||'').split('-').reverse().join('/'),
 bseChlorineTreatmentParseMessage_:()=> null,
 bseTreatmentListItems_:()=> [],bseTreatmentPendingItems_:()=> [],bseTreatmentResolvePendingDosages_:()=>({resolved:[],unresolved:[]}),
 bseTreatmentListPlots_:()=>['M7P3'],bseTreatmentListCrop_:()=> 'Peria Besar',bseTreatmentListDate_:()=> '2026-10-20'};
vm.createContext(ctx);
for(const [s,a,b] of [[unified,'bseCanonicalPlotTokens_','bseTransplantPlots_'],[unified,'bseTransplantFlexibleDate_','bseTransplantExplicitDate_'],[worker,'bsePilotHarvestStartResult_','bsePilotTreatmentReviewCardOnly_'],[worker,'bsePilotTreatmentReviewCardOnly_','bsePilotSowingReviewCardOnly_'],[treatment,'bseTreatmentListParseMessage_','bseTreatmentFinalizeResult_'],[ui,'bseApprovalSummary_','runBseTelegramPrivateOptInHarnessTests']])vm.runInContext(section(s,a,b),ctx);
let n=0;function check(name,fn){fn();n++;console.log('PASS '+name)}
const harvest=ctx.bsePilotHarvestStartResult_(input);
check('same genuine 261 input routes to Operation HARVEST_START',()=>assert(harvest&&harvest.validation==='PASS'&&harvest.candidates.length===1&&harvest.candidates[0].target==='Operation_Log'&&harvest.candidates[0].fields.operation_type==='HARVEST_START'));
check('genuine date and plot exact, no treatment/yield fields',()=>{const f=harvest.candidates[0].fields;assert(f.event_date==='2026-10-14'&&f.plot_id==='M7P3'&&!('treatment_description'in f)&&!('quantity'in f))});
check('treatment parser explicitly excludes genuine 261 input',()=>assert.equal(ctx.bseTreatmentListParseMessage_(input,'2026-10-20T06:08:32.815Z'),null));
check('wrong or ambiguous harvest still cannot be misread as treatment',()=>{for(const s of ['Tarikh mula harverst / tuai\nM7P3,3\n14-Oct-26','Tarikh mula tuai\nM7P3\n31-Feb-26']){assert.notEqual(ctx.bsePilotHarvestStartResult_(s).validation,'PASS');assert.equal(ctx.bseTreatmentListParseMessage_(s,'2026-10-20T06:08:32.815Z'),null)}});
check('original worker harvest priority precedes census and Treatment',()=>{const a=worker.indexOf('const harvestStartResult='),b=worker.indexOf('const censusResult='),c=worker.indexOf('const treatmentResult=');assert(a>0&&a<b&&b<c&&worker.slice(b,c).includes('!harvestStartResult'));});
check('generic/LLM fallback cannot override harvest',()=>assert(worker.includes('const rawResult=')&&worker.includes('||harvestStartResult||operationDecisionResult||bseUnifiedProcess_')&&worker.includes('!harvestStartResult&&!ecResult')));
check('valid treatment input still parses treatment',()=>{const t=ctx.bseTreatmentListParseMessage_('RAWATAN DIBUAT\nJenis Tanaman: Peria\nM7P3\nRawatan: Semburan','2026-10-20T06:08:32.815Z');assert(t&&t.candidates[0].target==='Treatment_Event_Log'&&t.candidates[0].fields.treatment_description==='Semburan')});
const treatmentCandidate={validation:'PASS',production_write:false,candidates:[{target:'Treatment_Event_Log',validation:'PASS',missing:[],fields:{event_date:'2026-10-20',crop:'Peria',plot_ids:['M7P3'],treatment_description:'Semburan'}}]};
check('PILOT confirmed treatment suppresses duplicate interim message',()=>assert(ctx.bsePilotTreatmentReviewCardOnly_(treatmentCandidate,'NEEDS_HUMAN_REVIEW')&&worker.includes('!bsePilotTreatmentReviewCardOnly_(result,reviewStatus)')));
check('PILOT treatment still creates reviewer card and remains human-controlled',()=>{assert(worker.includes("if(reviewStatus==='NEEDS_HUMAN_REVIEW')")&&worker.includes('bseTelegramApprovalEnsureCard_(book,latest)'));assert(ctx.bseApprovalSummary_('BSE-TG-1',treatmentCandidate).includes('Rawatan / Racun'))});
check('NEED_INFO treatment never suppresses clarification',()=>{const x=JSON.parse(JSON.stringify(treatmentCandidate));x.validation='NEED_INFO';x.candidates[0].validation='NEED_INFO';x.candidates[0].missing=['treatment_dosage'];assert(!ctx.bsePilotTreatmentReviewCardOnly_(x,'WAITING_INFO'))});
check('TEST/non-PILOT behavior unchanged',()=>{ctx.bseRuntimeEnvironmentName_=()=> 'TEST';assert(!ctx.bsePilotTreatmentReviewCardOnly_(treatmentCandidate,'NEEDS_HUMAN_REVIEW'));assert.equal(ctx.bsePilotHarvestStartResult_(input),null);ctx.bseRuntimeEnvironmentName_=()=> 'PILOT_OPERATION'});
check('no synthetic Telegram sends or callback state effects in parser',()=>{const fun=section(worker,'bsePilotHarvestStartResult_','bsePilotTreatmentReviewCardOnly_');assert(!/sendMessage|setValue|setValues|appendRow|ScriptProperties/.test(fun))});
console.log('GI261_ROOT_CAUSE_REGRESSION '+n+'/'+n+' PASS');
