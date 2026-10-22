'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const load=(n)=>fs.readFileSync(path.join(__dirname,n),'utf8');
const census=load('CensusReviewTest.js');
function part(name){
 const i=census.indexOf('function '+name+'(');assert(i>=0,name);
 const j=census.indexOf('\nfunction ',i+8);return census.slice(i,j<0?census.length:j);
}
const ctx={console,Date,Number,JSON,Set,
 bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',
 bseUnifiedSourceContext_:s=>({original:s,clarifications:[],provenance:s}),
 bsePlantCensusSource_:()=>({ok:false}),
 bsePlantCensusMalaysiaDate_:()=> '2026-10-22',
 bsePlotSingleLocation_:s=>({plot_id:s})
};
vm.createContext(ctx);
vm.runInContext(census.slice(census.indexOf('const BSE_CENSUS_ESTIMATE_METHOD'),census.indexOf('function bseCensusPlotCapacity_')),ctx);
for(const name of ['bseCensusPlotCapacity_','bseCensusOperationalSignal_','bseCensusOperationalCount_','bseCensusOperationalPlot_','bseCensusOperationalCrop_','bseCensusOperationalDate_','bseTelegramCensusDeterministicResult_'])vm.runInContext(part(name),ctx);
vm.runInContext(load('PilotUnrecognizedTest.js'),ctx);
let n=0;function t(name,fn){fn();n++;console.log('PASS '+name);}
const make=(suffix,plot='M5P3',crop='')=>'REKOD BANCI POKOK\n6/10/2026\nModul: '+plot+'\n'+(crop?'Tanaman: '+crop+'\n':'')+suffix;
const parse=(x)=>ctx.bseTelegramCensusDeterministicResult_(x,'2026-10-22T10:00:00Z');
t('only sick supplied: dead defaults to zero',()=>{
 const x=parse(make('Sakit: 654'));assert.equal(x.validation,'PASS');
 const a=x.candidates[0].fields.census_entries[0];
 assert.equal(a.reported_dead_count,0);assert.equal(a.reported_sick_count,654);
 assert.equal(a.living_plant_count,2808);
});
t('only dead supplied: sick defaults to zero',()=>{
 const x=parse(make('Mati: 143'));assert.equal(x.validation,'PASS');
 const a=x.candidates[0].fields.census_entries[0];
 assert.equal(a.reported_dead_count,143);assert.equal(a.reported_sick_count,0);
 assert.equal(a.living_plant_count,2665);
});
t('both counts absent: defaults to zero per owner contract',()=>{
 const x=parse(make(''));assert.equal(x.validation,'PASS');
 const a=x.candidates[0].fields.census_entries[0];
 assert.equal(a.reported_dead_count,0);assert.equal(a.reported_sick_count,0);
});
t('crop is optional at parsing and cannot be fabricated',()=>{
 const x=parse(make('Sakit: 33'));assert.equal(x.validation,'PASS');
 assert.equal(x.candidates[0].fields.crop,'');
});
t('date is mandatory and never borrowed from Telegram on PILOT',()=>{
 const x=parse('REKOD BANCI POKOK\nModul: M5P3\nSakit: 5');
 assert.equal(x.validation,'NEED_INFO');assert(x.candidates[0].missing.includes('event_date'));
 assert.equal(x.candidates[0].fields.event_date,'');
});
t('plot is mandatory and no ungrounded plot inferred',()=>{
 const x=parse('REKOD BANCI POKOK\n6/10/2026\nSakit: 5');
 assert.equal(x.validation,'NEED_INFO');assert(x.candidates[0].missing.includes('plot_id'));
});
t('unknown rubbish is handled; real report words not misclassified',()=>{
 assert(ctx.bsePilotUnrecognizedPlainText_('merapu'));
 for(const x of ['banci','semai','baja','claim','status','/status','M5P3','REKOD BANCI POKOK'])assert(!ctx.bsePilotUnrecognizedPlainText_(x),x);
 assert.match(ctx.bsePilotUnrecognizedMessage_('BSE-TG-772257614'),/Mesej tidak dapat dikenal pasti/);
});
t('worker records unknown before Gemini and reserves idempotent reply',()=>{
 const s=load('TelegramWorkerTest.js');
 assert(s.indexOf("bsePilotUnrecognizedPlainText_(job.original||job.input)")>0);
 const start=s.indexOf("bsePilotUnrecognizedPlainText_(job.original||job.input)");
 const fallback=s.indexOf("bseUnifiedProcess_(job.input,job.receivedAt)",start);
 assert(start>=0&&fallback>start&&s.indexOf("UNRECOGNIZED_REPLY_PENDING",start)<fallback);
 assert(s.includes("setValue('UNRECOGNIZED_MESSAGE')"));
 assert(s.includes("do not auto-replay"));
});
t('census missing batch displays internal plot-data issue, not user batch request',()=>{
 const s=load('PilotIncompleteBatalTest.js');
 assert.match(s,/Plot belum dipadankan kepada tanaman aktif dalam sistem/);
});
console.log('GI_UX_03_OPTIONAL_UNKNOWN '+n+'/'+n+' PASS');
