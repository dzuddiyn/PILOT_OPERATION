'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'CensusReviewTest.js'),'utf8');
const a=source.indexOf('function bseCensusResolveOperationalContext_('),b=source.indexOf('function bseCensusDeterministicFinalize_(',a);
assert(a>=0&&b>a);
let historic={kind:'NONE'},current={kind:'NONE'},asOfDate='';
const ctx={
 bseCensusStatusEventsAsOf_:(date)=>{asOfDate=date;return {historical:true}},
 bseActiveAllocationFindMatchesByPlots_:(_plots,_b,_a,_r,statuses)=>statuses.historical?historic:current
};
vm.createContext(ctx);vm.runInContext(source.slice(a,b),ctx);
const resolve=()=>ctx.bseCensusResolveOperationalContext_({validation:'PASS',candidates:[{target:'Plant_Census_Log',validation:'PASS',missing:[],fields:{event_date:'2026-10-06',crop:'',census_entries:[{plot_id:'M1P2',reported_dead_count:143,reported_sick_count:654}]}}]},[],[],[],{current:true},[],[]);
test('historical unique allocation resolves crop at event date',()=>{
 historic={kind:'UNIQUE',crop:'Peria',batch_id:'HIST'};current={kind:'UNIQUE',crop:'Timun'};
 const out=resolve();assert.equal(asOfDate,'2026-10-06');assert.equal(out.validation,'PASS');assert.equal(out.candidates[0].fields.crop,'Peria');
});
test('current crop cannot silently substitute missing historical allocation',()=>{
 historic={kind:'NONE'};current={kind:'UNIQUE',crop:'Timun'};
 const out=resolve();assert.equal(out.validation,'NEED_INFO');assert(out.candidates[0].missing.includes('census_date_before_active'));
});
test('ambiguous historical allocations never select a crop',()=>{
 historic={kind:'MULTIPLE'};current={kind:'MULTIPLE'};
 const out=resolve();assert.equal(out.validation,'NEED_INFO');assert(out.candidates[0].missing.includes('batch_match'));assert.equal(out.candidates[0].fields.crop,'');
});
