'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('vm'),fs=require('fs');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/NondeleteAuthorizationBoundary35B.js','utf8'),ctx);
const request={environment:'TEST_ONLY',owner_authorized:true,approval_status:'REPORTER_CONFIRMED',workbook_id:'1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY',event_id:'TEST_ONLY_35_A',approval_source_key:'a',ledger_source_key:'b',approval_hash:'c',ledger_hash:'d'};
function deps(verify){let released=0;return {book:{},lock:{tryLock:()=>true,releaseLock:()=>released++},authSource:verify?{verify}:undefined,get released(){return released}};}
test('caller-supplied authorization alone cannot trigger a write',()=>{assert.equal(ctx.bseNondelete35BAuthorizedTransaction_(deps(),request).status,'AUTH_SOURCE_UNAVAILABLE')});
test('verified proof is still transaction-HOLD, not a write',()=>{const d=deps(()=>({...request,status:'VERIFIED',owner_approved:true}));assert.equal(ctx.bseNondelete35BAuthorizedTransaction_(d,request).status,'AUTH_VERIFIED_TRANSACTION_HOLD');assert.equal(d.released,1)});
test('mismatch identity fails closed',()=>{for(const patch of [{event_id:'OTHER'},{approval_hash:'OTHER'},{workbook_id:'OTHER'},{owner_approved:false},{status:'PENDING'}]){const d=deps(()=>({...request,status:'VERIFIED',owner_approved:true,...patch}));assert.equal(ctx.bseNondelete35BAuthorizedTransaction_(d,request).status,'AUTH_NOT_VERIFIED');assert.equal(d.released,1)}});
test('authorization source failure fails closed',()=>{const d=deps(()=>{throw Error('NETWORK')});assert.equal(ctx.bseNondelete35BAuthorizedTransaction_(d,request).status,'AUTH_READ_FAILED');assert.equal(d.released,1)});
test('busy lock denies before authority read',()=>{let called=false;const d=deps(()=>{called=true});d.lock.tryLock=()=>false;assert.equal(ctx.bseNondelete35BAuthorizedTransaction_(d,request).status,'LOCK_BUSY');assert.equal(called,false)});
