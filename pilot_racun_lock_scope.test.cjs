'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),test=require('node:test');
let acquisitions=0,releases=0;
const ctx={Error,LockService:{getScriptLock:()=>({tryLock:()=>{acquisitions++;return true;},releaseLock:()=>{releases++;}})},bseRuntimeEnvironmentName_:()=>ctx.env,boundTestBook_:()=>({id:'fixture'}),env:'PILOT_OPERATION'};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/PilotRacunLockScope.js','utf8'),ctx);
test('one actual outer lock and release even on exception',()=>{
 const ret=ctx.bsePilotRacunWithLock_(book=>{assert.equal(ctx.bsePilotRacunLockOwned_(),true);assert.equal(book.id,'fixture');return 'OK';});
 assert.equal(ret,'OK');assert.equal(ctx.bsePilotRacunLockOwned_(),false);
 assert.throws(()=>ctx.bsePilotRacunWithLock_(()=>{throw Error('INJECTED');}),/INJECTED/);
 assert.equal(acquisitions,2);assert.equal(releases,2);
});
test('nested attempt blocked and lock released',()=>{
 assert.throws(()=>ctx.bsePilotRacunWithLock_(()=>ctx.bsePilotRacunWithLock_(()=>{})),/NESTED_LOCK/);
 assert.equal(acquisitions,3);assert.equal(releases,3);
 ctx.env='TEST';assert.throws(()=>ctx.bsePilotRacunWithLock_(()=>{}),/WRONG_ENVIRONMENT/);
});
