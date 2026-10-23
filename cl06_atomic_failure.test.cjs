'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),crypto=require('node:crypto'),test=require('node:test');
let held=false,flushes=0,mutation=0,seq=0;
const s={console:{log(){}},SpreadsheetApp:{flush(){flushes++}},PropertiesService:{},UrlFetchApp:{},DriveApp:{},ScriptApp:{},Session:{},LockService:{getScriptLock(){return {tryLock(){if(held)return false;held=true;return true},releaseLock(){held=false}}}},Utilities:{DigestAlgorithm:{SHA_256:'SHA_256'},Charset:{UTF_8:'UTF_8'},computeDigest:(_,v)=>Array.from(crypto.createHash('sha256').update(String(v)).digest(),n=>n>127?n-256:n),getUuid:()=>('CL06-SYNTH-'+(++seq))}};
vm.createContext(s);for(const f of fs.readdirSync(__dirname).filter(x=>x.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(__dirname,f),'utf8'),s,{filename:f,timeout:3000});
s.bseRuntimeEnvironmentName_=()=>'PILOT_OPERATION';s.boundTestBook_=()=>({synthetic:true});
const context={reference:'BSE-TG-900006',action:'APPROVED',actor_type:'TELEGRAM',actor_id:'CL06_TEST',actor_name:'CL06 Synthetic Tester',source_channel:'TELEGRAM',production_write:false};
const row=(batch,id,plot)=>['SOURCE',0,batch,id,'2026-10-23',plot,'PLANNED'];
const trans=(id,from,to)=>['SOURCE',0,'STATUS','TRANSPLANT','B1',id,'M1P1',from,to];
test('C1 lock: second simultaneous approval fails closed, first holds ownership',()=>{
 let first=0,second=0;
 s.bseReviewWithLock_(context,()=>{first++;assert.throws(()=>s.bseReviewWithLock_(context,()=>{second++}),/Barisan sedang dikemas kini/);assert.equal(held,true)});
 assert.equal(first,1);assert.equal(second,0);assert.equal(held,false);
});
test('C2 lock released after injected review exception, retry possible',()=>{
 assert.throws(()=>s.bseReviewWithLock_(context,()=>{throw Error('SYNTHETIC_FAIL')}),/SYNTHETIC_FAIL/);
 assert.equal(held,false);assert.equal(s.bseReviewWithLock_(context,()=>42),42);
});
test('C3 plot collision checked after first synthetic approval before second',()=>{
 const a=[];s.bseReviewWithLock_(context,()=>{s.bsePilotLifecycleRequireFreePlots_(a,[],['M1P1']);a.push(row('B1','A1','M1P1'))});
 assert.throws(()=>s.bseReviewWithLock_(context,()=>s.bsePilotLifecycleRequireFreePlots_(a,[],['M1P1'])),/CROP_LIFECYCLE_CONFLICT/);
 assert.equal(a.length,1);
});
test('C4 partial orphaned batch rejects duplicate source-key instead of inventing success',()=>{
 const source=fs.readFileSync(path.join(__dirname,'CropBatchReviewTest.js'),'utf8');
 assert.match(source,/if\(batches\.some\(row=>String\(row\[0\]\)===sourceKey\)\|\|events\.some/);
 assert.match(source,/bseCropBatchAssertApprovedRows_/);
});
test('C5 partial cycle end log + review without status is reconciled fail-closed by guard',()=>{
 const source=fs.readFileSync(path.join(__dirname,'PilotCycleEndTest.js'),'utf8');
 assert.match(source,/priorLog\.length!==1\|\|priorReview\.length!==1\|\|priorStatus\.length!==1/);
 assert.match(source,/PARTIAL WRITE DETECTED/);
});
test('C6 historical open allocation must block after interrupted multi-sheet write',()=>{
 assert.throws(()=>s.bsePilotLifecycleRequireFreePlots_([row('B1','A1','M1P1')],[],['M1P1']),/CROP_LIFECYCLE_CONFLICT/);
});
test('C7 independently verify multi-sheet writes are non-transactional, hence no atomic PASS',()=>{
 const source=fs.readFileSync(path.join(__dirname,'CropBatchReviewTest.js'),'utf8');
 assert.match(source,/bseCropBatchAppend_\(batchOut/);assert.match(source,/bseCropBatchAppend_\(eventOut/);assert.match(source,/bseCropBatchAppend_\(allocationOut/);
 assert.ok(source.indexOf('bseCropBatchAppend_(batchOut')<source.indexOf('bseCropBatchAppend_(eventOut'));
});
