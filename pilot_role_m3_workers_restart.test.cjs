'use strict';
const {fixtureAuthorize}=require('./test_support/rbac/owner_intent_fixture.cjs');
function securedTx(ctx,r,api){return ctx.bseRoleTransaction_(fixtureAuthorize(r,api),api)}

// Real Node worker_threads, shared atomic lock and disk-backed synthetic fixture.
// Strictly local temporary files, never real Google/Telegram.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('node:worker_threads');
const hash=e=>crypto.createHash('sha256').update(JSON.stringify([e.event_id,e.operation_id,e.target,e.actor,e.action,e.revision,e.previous_hash])).digest('hex');
const load=()=>{const ctx=vm.createContext({});for(const f of ['PilotRolePostCommit.js','PilotRoleIdentityGuard.js','PilotRoleGrant.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,f),'utf8'),ctx);return ctx;};
function invoke(file,lockArray,request,simulateCrash=false){
 const ctx=load();
 const read=()=>JSON.parse(fs.readFileSync(file,'utf8'));
 const update=fn=>{const state=read();fn(state);fs.writeFileSync(file,JSON.stringify(state));};
 const lock={tryLock:()=>Atomics.compareExchange(lockArray,0,0,1)===0,releaseLock:()=>{Atomics.store(lockArray,0,0);Atomics.notify(lockArray,0);}};
 const api={isOwnerPrivate:(a,c)=>a==='100'&&c==='100',confirmed:r=>r.confirmed===true,registration:()=> 'REGISTERED_ACTIVE',lock:()=>lock,
 readLedger:()=>read().ledger,readBarriers:()=>read().barriers,
 appendEvent:e=>update(s=>s.ledger.push(e)),appendBarrier:e=>update(s=>s.barriers.push(e)),flush:()=>{},
 hashEvent:hash,sameEvent:(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 commitEvent:op=>{if(simulateCrash)process.exit(79);update(s=>{s.ledger.find(e=>e.operation_id===op).state='COMMITTED';});},
 closeBarrier:op=>update(s=>{s.barriers.find(e=>e.operation_id===op).active=false;}),
 validateLedger:(events,barriers)=>{if(barriers.some(e=>e.active))return false;return events.every((e,i)=>e.state==='COMMITTED'&&e.revision===i+1&&e.digest===hash(e));}};
 return securedTx(ctx,request,api);
}
if(!isMainThread){
 try{const result=invoke(workerData.file,new Int32Array(workerData.lock),workerData.req,workerData.crash);parentPort.postMessage(result);}
 catch(e){parentPort.postMessage({error:e.message});}
}else{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'bse-rbac-synthetic-')),file=path.join(tmp,'fixture.json');
 const lock=new SharedArrayBuffer(4),arr=new Int32Array(lock);
 const req=(id,rev=0)=>({operationId:id,action:'GRANT_ADMIN',actor:'100',chat:'100',target:'200',confirmed:true,expectedRevision:rev});
 const spawn=(id,rev,crash=false)=>new Promise((resolve,reject)=>{const w=new Worker(__filename,{workerData:{file,lock,req:req(id,rev),crash}});let report=null;w.on('message',x=>report=x);w.on('error',reject);w.on('exit',code=>resolve({code,report}));});
 (async()=>{
 try{
 fs.writeFileSync(file,JSON.stringify({ledger:[],barriers:[]}));
 const results=await Promise.all([spawn('a',0),spawn('b',0)]);
 assert.equal(results.filter(x=>x.report?.status==='APPLIED_VERIFIED').length,1);
 assert.equal(JSON.parse(fs.readFileSync(file)).ledger.length,1);
 console.log('PASS genuine concurrent Node workers serialize grant via shared Atomics lock');
 // Reset shared lock and restore a clean fixture to simulate restarted process.
 Atomics.store(arr,0,0);fs.writeFileSync(file,JSON.stringify({ledger:[],barriers:[]}));
 const crashed=await spawn('crash',0,true);
 assert.equal(crashed.code,79);
 const persisted=JSON.parse(fs.readFileSync(file));assert.equal(persisted.ledger[0].state,'PREPARED');
 Atomics.store(arr,0,0);const restarted=await spawn('crash',0);
 assert.equal(restarted.report?.status,'WRITE_OUTCOME_UNKNOWN');
 assert.equal(JSON.parse(fs.readFileSync(file)).ledger.length,1);
 console.log('PASS OS worker termination and restart from disk-backed PREPARED fixture refuses duplicate');
 console.log('RBAC_WORKER_RESTART 2/2 LOCAL PASS; not Google Sheets durability');
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
 })().catch(e=>{console.error(e);process.exitCode=1;});
}
