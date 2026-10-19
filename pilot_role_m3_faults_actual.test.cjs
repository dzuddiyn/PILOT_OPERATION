'use strict';
const {fixtureAuthorize}=require('./test_support/rbac/owner_intent_fixture.cjs');
function securedTx(r,api){return ctx.bseRoleTransaction_(fixtureAuthorize(r,api),api)}

const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const {FakeSheets}=require('./test_support/rbac/fake_sheets.cjs');
const {FakeLockService}=require('./test_support/rbac/fake_lock.cjs');
const {inspectRaw}=require('./test_support/rbac/independent_oracle.cjs');
const ctx=vm.createContext({});
for(const file of ['PilotRoleContract.js','PilotRoleResolver.js','PilotRoleIdentityGuard.js','PilotRoleGrant.js','PilotRoleRevocation.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx);
const hash=e=>crypto.createHash('sha256').update(JSON.stringify([e.event_id,e.operation_id,e.target,e.actor,e.action,e.revision,e.previous_hash])).digest('hex');
function setup(){
 const db=new FakeSheets(),locks=new FakeLockService();db.seed('ledger',[]);db.seed('barriers',[]);
 const api={
 isOwnerPrivate:(a,c)=>a==='100'&&c==='100',confirmed:r=>r.confirmed===true,
 registration:t=>t==='200'?'REGISTERED_ACTIVE':'REJECTED',
 lock:()=>locks.getScriptLock('writer'),readLedger:()=>db.read('ledger'),readBarriers:()=>db.read('barriers'),
 appendEvent:e=>db.append('ledger',e),appendBarrier:e=>db.append('barriers',e),flush:()=>db.flush(),
 hashEvent:hash,sameEvent:(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 commitEvent:op=>{const a=db.read('ledger'),i=a.findIndex(e=>e.operation_id===op);a[i].state='COMMITTED';db.set('ledger',i,a[i]);},
 closeBarrier:op=>{const a=db.read('barriers'),i=a.findIndex(e=>e.operation_id===op);a[i].active=false;db.set('barriers',i,a[i]);},
 validateLedger:(events,barriers,target)=>{
   if(barriers.some(b=>b.target===target&&b.active))return false;
   const state=inspectRaw({ledger:events,barriers,target});
   return state.reason!=='INVALID_CHAIN'&&state.reason!=='BAD_SOURCE';
 }};
 return {db,locks,api,req:(op='g',action='GRANT_ADMIN',expectedRevision)=>({operationId:op,action,target:'200',actor:'100',chat:'100',confirmed:true,expectedRevision})};
}
const tx=(s,r)=>securedTx(r||s.req(),s.api);
const raw=s=>inspectRaw({ledger:s.db.read('ledger'),barriers:s.db.read('barriers'),target:'200'});
function seed(s){assert.equal(tx(s).status,'APPLIED_VERIFIED');assert.equal(raw(s).elevated,true);}
function denied(s){assert.equal(raw(s).elevated,false);}
const cases={
F01:s=>{seed(s);assert.equal(tx(s).status,'ALREADY_APPLIED');assert.equal(s.db.read('ledger').length,1);},
F02:s=>{const r=s.req();r.actor='300';assert.equal(tx(s,r).status,'DENIED');denied(s);},
F03:s=>{const r=s.req();r.actor='200';assert.equal(tx(s,r).status,'DENIED');denied(s);},
F04:s=>{const r=fixtureAuthorize(s.req(),s.api);s.api.now=()=>2001;assert.equal(ctx.bseRoleTransaction_(r,s.api).status,'DENIED');denied(s);},
F05:s=>{const l=s.locks.getScriptLock('other');l.tryLock();assert.equal(tx(s).status,'BUSY');denied(s);l.releaseLock();},
F06:s=>{s.api.appendEvent=()=>{throw Error('FAILED')};assert.equal(tx(s).status,'WRITE_OUTCOME_UNKNOWN');denied(s);},
F07:s=>{const original=s.api.appendEvent;s.api.appendEvent=e=>{original(e);throw Error('TIMEOUT')};assert.equal(tx(s).status,'WRITE_OUTCOME_UNKNOWN');denied(s);assert.equal(s.db.read('ledger').length,1);},
F08:s=>{s.api.readLedger=()=>{throw Error('OUTAGE')};assert.equal(tx(s).status,'WRITE_OUTCOME_UNKNOWN');denied(s);},
F09:s=>{s.api.commitEvent=()=>{throw Error('CRASH')};assert.equal(tx(s).status,'WRITE_OUTCOME_UNKNOWN');denied(s);},
F10:s=>{seed(s);assert.equal(tx(s).status,'ALREADY_APPLIED');},
F11:s=>{assert.equal(tx(s,s.req('g','GRANT_ADMIN',0)).status,'APPLIED_VERIFIED');assert.equal(tx(s,s.req('g2','GRANT_ADMIN',0)).status,'REVISION_CONFLICT');},
F12:s=>{seed(s);assert.equal(tx(s,s.req('r','REVOKE_ADMIN',1)).status,'APPLIED_VERIFIED');assert.equal(tx(s,s.req('g2','GRANT_ADMIN',1)).status,'REVISION_CONFLICT');denied(s);},
F13:s=>{seed(s);assert.equal(s.db.read('ledger').length,1);},
F14:s=>{seed(s);assert.equal(tx(s).status,'ALREADY_APPLIED');},
F15:s=>{seed(s);const rows=s.db.read('ledger');rows[0].digest='broken';s.db.seed('ledger',rows);assert.equal(tx(s,s.req('g2')).status,'SOURCE_MISMATCH');denied(s);},
F16:s=>{s.api.commitEvent=()=>{};assert.equal(tx(s).status,'WRITE_OUTCOME_UNKNOWN');denied(s);},
F17:s=>{seed(s);const e=s.db.read('ledger')[0];s.db.append('ledger',{...e,action:'REVOKE_ADMIN'});assert.equal(tx(s,s.req('g2')).status,'SOURCE_MISMATCH');denied(s);},
F18:s=>{seed(s);tx(s,s.req('r','REVOKE_ADMIN',1));denied(s);},
F19:s=>{s.api.registration=()=> 'REJECTED';assert.equal(tx(s).status,'DENIED');denied(s);},
F20:s=>{const r=s.req();r.actor='101';assert.equal(tx(s,r).status,'DENIED');denied(s);},
F21:s=>{s.api.readBarriers=()=>{throw Error('DOWN')};assert.equal(tx(s).status,'WRITE_OUTCOME_UNKNOWN');denied(s);},
F22:s=>{s.api.commitEvent=()=>{throw Error('HALT')};assert.equal(tx(s).status,'WRITE_OUTCOME_UNKNOWN');assert.equal(tx(s).status,'WRITE_OUTCOME_UNKNOWN');denied(s);},
F23:s=>{seed(s);const e=s.db.read('ledger')[0];s.db.append('ledger',{...e,event_id:'other',operation_id:'other'});assert.equal(tx(s,s.req('g2')).status,'SOURCE_MISMATCH');denied(s);},
F24:s=>{seed(s);assert.equal(tx(s).status,'ALREADY_APPLIED');assert.equal(s.db.read('ledger').length,1);},
F25:s=>{s.api.appendEvent=()=>s.db.append('ledger',{event_id:'partial'});assert.equal(tx(s).status,'WRITE_OUTCOME_UNKNOWN');denied(s);},
F26:s=>{s.api.commitEvent=()=>{};tx(s);denied(s);},
F27:s=>{seed(s);s.api.appendBarrier=e=>{s.db.append('barriers',e);throw Error('CRASH')};assert.equal(tx(s,s.req('r','REVOKE_ADMIN',1)).status,'WRITE_OUTCOME_UNKNOWN');denied(s);},
F28:s=>{seed(s);tx(s,s.req('r','REVOKE_ADMIN',1));denied(s);},
F29:s=>{seed(s);const r=s.req('attack');r.actor='200';assert.equal(tx(s,r).status,'DENIED');assert.equal(ctx.bseRoleResolve_('200','manage_admins',{readBootstrapOwner:()=>({user_id:'100',verified:true}),readRegistration:()=> 'REGISTERED_ACTIVE',readLedger:s.api.readLedger,readBarriers:s.api.readBarriers,sha256:x=>crypto.createHash('sha256').update(x).digest('hex')}).allowed,false);}
};
let pass=0;for(const [id,fn] of Object.entries(cases)){const s=setup();try{fn(s);pass++;console.log(id+' LOCAL_PASS');}catch(e){console.error(id+' FAILED '+e.message);process.exitCode=1;}}
console.log('RBAC_M3_ACTUAL_FAULT '+pass+'/29, source-only synthetic adapters');
assert.equal(Object.keys(cases).length,29);assert.equal(pass,29);
