'use strict';
const {fixtureAuthorize}=require('./test_support/rbac/owner_intent_fixture.cjs');
function securedTx(r,api){return context.bseRoleTransaction_(fixtureAuthorize(r,api),api)}

const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const {FakeSheets}=require('./test_support/rbac/fake_sheets.cjs');
const {FakeLockService}=require('./test_support/rbac/fake_lock.cjs');
const {inspectRaw}=require('./test_support/rbac/independent_oracle.cjs');
const context=vm.createContext({});
for(const name of ['PilotRoleContract.js','PilotRoleResolver.js','PilotRoleIdentityGuard.js','PilotRoleGrant.js','PilotRoleRevocation.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+name,'utf8'),context);
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function setup(){
 const db=new FakeSheets(),ls=new FakeLockService();db.seed('ledger',[]);db.seed('barriers',[]);
 const api={
 isOwnerPrivate:(actor,chat)=>actor==='100'&&chat==='100',confirmed:req=>req.confirmed===true,
 registration:target=>target==='200'?'REGISTERED_ACTIVE':'REJECTED',
 lock:()=>ls.getScriptLock('role-writer'),readLedger:()=>db.read('ledger'),readBarriers:()=>db.read('barriers'),
 appendEvent:e=>db.append('ledger',e),appendBarrier:e=>db.append('barriers',e),flush:()=>db.flush(),
 hashEvent:e=>sha(JSON.stringify([e.event_id,e.operation_id,e.target,e.actor,e.action,e.revision,e.previous_hash])),
 sameEvent:(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 commitEvent:op=>{const rows=db.read('ledger'),i=rows.findIndex(e=>e.operation_id===op);rows[i].state='COMMITTED';db.set('ledger',i,rows[i]);},
 closeBarrier:op=>{const rows=db.read('barriers'),i=rows.findIndex(e=>e.operation_id===op);rows[i].active=false;db.set('barriers',i,rows[i]);},
 validateLedger:(events,barriers,target)=>{
   if(barriers.some(b=>b.target===target&&b.active))return false;
   return inspectRaw({ledger:events,barriers,target}).reason!=='INVALID_CHAIN';
 }};
 return {db,ls,api,req:(operationId,action='GRANT_ADMIN',expectedRevision)=>({operationId,action,target:'200',actor:'100',chat:'100',confirmed:true,expectedRevision})};
}
let n=0;function run(label,fn){fn();n++;console.log('PASS '+label);}
run('valid grant persisted',()=>{const x=setup(),r=securedTx(x.req('g1'),x.api);assert.equal(r.status,'APPLIED_VERIFIED');assert.equal(inspectRaw({ledger:x.db.read('ledger'),target:'200'}).elevated,true);});
run('duplicate grant does not append',()=>{const x=setup();securedTx(x.req('g1'),x.api);assert.equal(securedTx(x.req('g1'),x.api).status,'ALREADY_APPLIED');assert.equal(x.db.read('ledger').length,1);});
run('nonowner denied',()=>{const x=setup(),q=x.req('x');q.actor='300';assert.equal(securedTx(q,x.api).status,'DENIED');assert.equal(x.db.read('ledger').length,0);});
run('no confirmation denied',()=>{const x=setup(),q=x.req('x');const r=fixtureAuthorize(q,x.api);x.api.now=()=>2001;assert.equal(context.bseRoleTransaction_(r,x.api).status,'DENIED');});
run('lock contention no write',()=>{const x=setup(),outside=x.ls.getScriptLock('other');outside.tryLock();assert.equal(securedTx(x.req('x'),x.api).status,'BUSY');assert.equal(x.db.read('ledger').length,0);outside.releaseLock();});
run('revision conflict no write',()=>{const x=setup();assert.equal(securedTx(x.req('x','GRANT_ADMIN',1),x.api).status,'REVISION_CONFLICT');assert.equal(x.db.read('ledger').length,0);});
run('grant revoke normal',()=>{const x=setup();assert.equal(securedTx(x.req('g1'),x.api).status,'APPLIED_VERIFIED');assert.equal(securedTx(x.req('r1','REVOKE_ADMIN',1),x.api).status,'APPLIED_VERIFIED');assert.equal(inspectRaw({ledger:x.db.read('ledger'),target:'200'}).elevated,false);assert.equal(x.db.read('barriers')[0].active,false);});
run('barrier helper fail closed',()=>{const x=setup();x.db.append('barriers',{target:'200',active:true});assert.equal(context.bseRoleRevokeBarrierActive_('200',x.api),true);x.api.readBarriers=()=>{throw Error('outage');};assert.equal(context.bseRoleRevokeBarrierActive_('200',x.api),true);});
run('revoke commit recovery after barrier-close failure',()=>{const x=setup();assert.equal(securedTx(x.req('g1'),x.api).status,'APPLIED_VERIFIED');const close=x.api.closeBarrier;x.api.closeBarrier=()=>{throw Error('CLOSE_FAILED')};assert.equal(securedTx(x.req('r1','REVOKE_ADMIN',1),x.api).status,'WRITE_OUTCOME_UNKNOWN');assert.equal(x.db.read('barriers')[0].active,true);assert.equal(inspectRaw({ledger:x.db.read('ledger'),barriers:x.db.read('barriers'),target:'200'}).elevated,false);x.api.closeBarrier=close;assert.equal(securedTx(x.req('r1','REVOKE_ADMIN',1),x.api).status,'ALREADY_APPLIED');assert.equal(x.db.read('barriers')[0].active,false);});
console.log('RBAC_M3_SMOKE '+n+'/9 PASS');assert.equal(n,9);
