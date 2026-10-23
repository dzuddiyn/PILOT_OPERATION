'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),test=require('node:test');
const ctx={env:'PILOT_OPERATION',bseRuntimeEnvironmentName_:()=>ctx.env};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/PilotRacunApprovalGate.js','utf8'),ctx);
const make=(v='PASS')=>({production_write:false,validation:v,candidates:[{target:'Treatment_Event_Log',validation:v,missing:v==='PASS'?[]:['batch_match']},{target:'Treatment_Event_Log',validation:v,missing:v==='PASS'?[]:['batch_match']}]});
test('no aggregate Benar card before durable callback is bound',()=>{
 assert.equal(ctx.bsePilotRacunAggregateEligibility_(make()).reason,'DURABLE_CALLBACK_NOT_BOUND');
 assert.equal(ctx.bsePilotRacunAggregateEligibility_(make('NEED_INFO')).reason,'CANDIDATE_NOT_READY');
 ctx.env='TEST';assert.equal(ctx.bsePilotRacunAggregateEligibility_(make()).reason,'WRONG_ENVIRONMENT');
});
