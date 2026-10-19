'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const {FakeSheets}=require('./test_support/rbac/fake_sheets.cjs');
const {FakeLockService}=require('./test_support/rbac/fake_lock.cjs');
const {inspectRaw}=require('./test_support/rbac/independent_oracle.cjs');
const ctx=vm.createContext({});
for(const file of ['PilotRoleContract.js','PilotRoleResolver.js','PilotRoleGrant.js','PilotRoleRevocation.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx);
const hash=e=>crypto.createHash('sha256').update(JSON.stringify([e.event_id,e.operation_id,e.target,e.actor,e.action,e.revision,e.previous_hash])).digest('hex');
function make(snapshot){
 const db=new FakeSheets(),locks=new FakeLockService();db.seed('ledger',snapshot?.ledger||[]);db.seed('barriers',snapshot?.barriers||[]);
 const api={isOwnerPrivate:(a,c)=>a==='100'&&c==='100',confirmed:r=>r.confirmed===true,registration:t=>t==='200'?'REGISTERED_ACTIVE':'REJECTED',
 lock:()=>locks.getScriptLock('writer'),readLedger:()=>db.read('ledger'),readBarriers:()=>db.read('barriers'),appendEvent:e=>db.append('ledger',e),appendBarrier:e=>db.append('barriers',e),flush:()=>db.flush(),hashEvent:hash,
 sameEvent:(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 commitEvent:op=>{const arr=db.read('ledger'),i=arr.findIndex(e=>e.operation_id===op);arr[i].state='COMMITTED';db.set('ledger',i,arr[i]);},
 closeBarrier:op=>{const arr=db.read('barriers'),i=arr.findIndex(e=>e.operation_id===op);arr[i].active=false;db.set('barriers',i,arr[i]);},
 validateLedger:(events,barriers,target)=>{if(barriers.some(b=>b.target===target&&b.active))return false;const v=inspectRaw({ledger:events,barriers,target});return !['INVALID_CHAIN','BAD_SOURCE'].includes(v.reason);}};
 const req=(operationId,action='GRANT_ADMIN',expectedRevision)=>({operationId,action,target:'200',actor:'100',chat:'100',confirmed:true,expectedRevision});
 return {db,locks,api,req,tx:(r)=>ctx.bseRoleTransaction_(r,api),raw:()=>inspectRaw({ledger:db.read('ledger'),barriers:db.read('barriers'),target:'200'})};
}
let pass=0;function test(n,f){f();pass++;console.log('PASS '+n)}
test('concurrent writer lock via nested callback, second denied',()=>{
 const s=make(),append=s.api.appendEvent;let competing;
 s.api.appendEvent=e=>{competing=s.tx(s.req('parallel','GRANT_ADMIN',0));append(e);};
 assert.equal(s.tx(s.req('first','GRANT_ADMIN',0)).status,'APPLIED_VERIFIED');
 assert.equal(competing.status,'BUSY');assert.equal(s.db.read('ledger').length,1);
});
test('reader during PREPARED observes denial, not grant',()=>{
 const s=make(),commit=s.api.commitEvent;let observed;
 s.api.commitEvent=op=>{observed=s.raw();commit(op)};
 assert.equal(s.tx(s.req('first')).status,'APPLIED_VERIFIED');assert.equal(observed.elevated,false);assert.equal(s.raw().elevated,true);
});
test('persisted PREPARED survives reconstructed adapters and blocks retry',()=>{
 const s=make();s.api.commitEvent=()=>{throw Error('CRASH')};
 assert.equal(s.tx(s.req('first')).status,'WRITE_OUTCOME_UNKNOWN');
 const fresh=make(s.db.snapshot());assert.equal(fresh.raw().elevated,false);
 assert.equal(fresh.tx(fresh.req('first')).status,'WRITE_OUTCOME_UNKNOWN');
 assert.equal(fresh.db.read('ledger').length,1);
});
test('persisted revoke barrier survives new adapters and blocks access',()=>{
 const s=make();assert.equal(s.tx(s.req('grant')).status,'APPLIED_VERIFIED');
 s.api.appendBarrier=e=>{s.db.append('barriers',e);throw Error('CRASH')};
 assert.equal(s.tx(s.req('revoke','REVOKE_ADMIN',1)).status,'WRITE_OUTCOME_UNKNOWN');
 const fresh=make(s.db.snapshot());assert.equal(fresh.raw().elevated,false);
 assert.equal(fresh.db.read('ledger').length,1);
});
test('stale projection cannot override latest committed revoke',()=>{
 const s=make();assert.equal(s.tx(s.req('grant')).status,'APPLIED_VERIFIED');const stale=s.db.snapshot();
 assert.equal(s.tx(s.req('revoke','REVOKE_ADMIN',1)).status,'APPLIED_VERIFIED');
 const projectedAdmin=inspectRaw({ledger:stale.ledger,barriers:stale.barriers,target:'200'});
 assert.equal(projectedAdmin.elevated,true);assert.equal(s.raw().elevated,false);
});
test('mutation rejects unauthorized actor in actual candidate',()=>{
 const s=make(),r=s.req('attack');r.actor='200';assert.equal(s.tx(r).status,'DENIED');assert.equal(s.db.read('ledger').length,0);
});
test('audit and notifier are absent, not simulated as successful',()=>{
 const s=make();assert.equal(typeof s.api.appendAudit,'undefined');assert.equal(typeof s.api.notify,'undefined');
});
console.log('RBAC_M3_ADVERSARIAL '+pass+'/7 LOCAL PASS, single-process controlled interleaving only');
assert.equal(pass,7);
