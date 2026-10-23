'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const src=fs.readFileSync(__dirname+'/ReviewCoreTest.js','utf8');
const begin=src.indexOf('function bseReviewWithLock_('),end=src.indexOf('function runBseReviewTimezoneHarnessTests(',begin);
assert(begin>=0&&end>begin);
let locks=0,releases=0;
const ctx={Error,LockService:{getScriptLock:()=>({tryLock:()=>{locks++;return true;},releaseLock:()=>{releases++;}})},
 bseReviewContextValidate_:v=>v,boundTestBook_:()=>({name:'PILOT_TEST_FIXTURE'}),
 bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION'};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/PilotRacunLockScope.js','utf8'),ctx);
vm.runInContext(src.slice(begin,end),ctx);
test('real review controller proves held lock to transaction flow then releases',()=>{
 const out=ctx.bseReviewWithLock_({actor_name:'TEST_ONLY'},book=>{
  assert.equal(book.name,'PILOT_TEST_FIXTURE');
  assert.equal(ctx.bsePilotRacunLockOwned_(),true);
  return 'PASS';
 });
 assert.equal(out,'PASS');
 assert.equal(ctx.bsePilotRacunLockOwned_(),false);
 assert.equal(locks,1);assert.equal(releases,1);
});
test('real review controller clears scope and lock after exception',()=>{
 assert.throws(()=>ctx.bseReviewWithLock_({},()=>{throw Error('INJECTED_CALLBACK');}),/INJECTED_CALLBACK/);
 assert.equal(ctx.bsePilotRacunLockOwned_(),false);
 assert.equal(locks,2);assert.equal(releases,2);
});
test('nested review callback fails and both lock handles are released',()=>{
 assert.throws(()=>ctx.bseReviewWithLock_({},()=>ctx.bseReviewWithLock_({},()=>{})),/NESTED_LOCK/);
 assert.equal(ctx.bsePilotRacunLockOwned_(),false);
 assert.equal(locks,4);assert.equal(releases,4);
});
