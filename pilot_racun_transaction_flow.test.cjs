'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const calls=[];const store={hash:'HASH',status:'OPEN'};
const ctx={
 bsePilotRacunSheetAdapter_:()=>({}),
 bsePilotRacunApprovalSheetAdapter_:()=>({get:()=>({...store}),set:(_r,s)=>{store.status=s;}}),
 bsePilotRacunAtomicPlan_:()=>({reference:'BSE-TG-100',storage_mode:'UNLINKED_PILOT'}),
 bsePilotRacunCommitConfirmed_:()=>{calls.push('commit');return {status:'LEDGER_COMMITTED_APPROVAL_PENDING'};},
 bsePilotRacunFinalizeApproval_:()=>{calls.push('readback');return {status:'REPORTER_CONFIRMED'};},
 Error,String
};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/PilotRacunTransactionFlow.js','utf8'),ctx);
const input={action:'A',authorized:true,hash_verified:true,reference:'BSE-TG-100',source_key:'BSE-TG-100|Treatment_Event_Log',approval_hash:'HASH',callback_token:'ABCDEFGHIJKL',proposal:{}};
test('orchestration calls ledger before approval readback',()=>{assert.equal(ctx.bsePilotRacunExecuteApproval_(input,{}).status,'REPORTER_CONFIRMED');assert.deepEqual(calls,['commit','readback']);});
test('mismatched hash and forged source block before ledger',()=>{
 assert.throws(()=>ctx.bsePilotRacunExecuteApproval_({...input,approval_hash:'OTHER'},{}),/CONFLICT/);
 assert.throws(()=>ctx.bsePilotRacunExecuteApproval_({...input,source_key:'other'},{}),/SOURCE_CONFLICT/);
 assert.deepEqual(calls,['commit','readback']);
});
