'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const src=fs.readFileSync(__dirname+'/TelegramApprovalUiTest.js','utf8');
const start=src.indexOf('function bseApprovalCandidateEnvelope_('),end=src.indexOf('function bseApprovalCandidateIndexFromSourceKey_(',start);
const ctx={JSON,Error,bsePilotRacunAggregateEnvelope_:()=>({aggregate_type:'PILOT_RACUN_ATOMIC',candidates:[{},{}]}),bsePilotRacunAggregateEligibility_:()=>({eligible:false,reason:'DURABLE_CALLBACK_NOT_BOUND'})};
vm.createContext(ctx);vm.runInContext(src.slice(start,end),ctx);
const result={validation:'PASS',production_write:false,candidates:[{target:'Treatment_Event_Log',validation:'PASS',fields:{original_note:'Racun\n1. M7'}},{target:'Treatment_Event_Log',validation:'PASS',fields:{original_note:'Racun\n1. M7'}}]};
test('Racun cannot bypass readiness or split into individually confirmable cards',()=>{assert.throws(()=>ctx.bseApprovalEnvelopes_(result),/RACUN_AGGREGATE_NOT_READY/);});
test('eligible-only routing selects single atomic envelope',()=>{ctx.bsePilotRacunAggregateEligibility_=()=>({eligible:true});assert.equal(ctx.bseApprovalEnvelopes_(result).length,1);});
