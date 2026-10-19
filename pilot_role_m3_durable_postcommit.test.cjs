'use strict';
const {fixtureAuthorize}=require('./test_support/rbac/owner_intent_fixture.cjs');
function securedTx(r,api){return ctx.bseRoleTransaction_(fixtureAuthorize(r,api),api)}

const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const ctx=vm.createContext({});
for(const f of ['PilotRolePostCommit.js','PilotRoleIdentityGuard.js','PilotRoleGrant.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
const hash=e=>crypto.createHash('sha256').update(JSON.stringify([e.event_id,e.operation_id,e.target,e.actor,e.action,e.revision,e.previous_hash])).digest('hex');
function make(saved){
 const ledger=structuredClone(saved?.ledger||[]),barriers=structuredClone(saved?.barriers||[]),outbox=structuredClone(saved?.outbox||[]),sent=[],audits=[];
 const api={
 isOwnerPrivate:()=>true,confirmed:()=>true,registration:()=> 'REGISTERED_ACTIVE',
 lock:()=>({tryLock:()=>true,releaseLock:()=>{}}),readLedger:()=>structuredClone(ledger),readBarriers:()=>structuredClone(barriers),
 appendEvent:e=>ledger.push(structuredClone(e)),appendBarrier:e=>barriers.push(structuredClone(e)),flush:()=>{},
 hashEvent:hash,sameEvent:(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 commitEvent:op=>{ledger.find(e=>e.operation_id===op).state='COMMITTED';},
 closeBarrier:op=>{barriers.find(e=>e.operation_id===op).active=false;},
 validateLedger:events=>events.every((e,i)=>e.state==='COMMITTED'&&e.digest===hash(e)&&e.revision===i+1),
 readOutbox:()=>structuredClone(outbox),appendOutbox:e=>outbox.push(structuredClone(e)),
 updateOutbox:e=>{const i=outbox.findIndex(x=>x.key===e.key);outbox[i]=structuredClone(e);},
 appendAudit:e=>audits.push(e),notify:e=>sent.push(e)
 };
 const req={operationId:'g1',target:'200',actor:'100',chat:'100',confirmed:true,action:'GRANT_ADMIN'};
 return {api,req,ledger,outbox,sent,audits,snapshot:()=>structuredClone({ledger,barriers,outbox}),tx:()=>securedTx(req,api)};
}
let n=0;function test(name,fn){fn();n++;console.log('PASS '+name);}
test('durably queue audit and notify before effects',()=>{const s=make();assert.equal(s.tx().status,'APPLIED_VERIFIED');assert.equal(s.outbox.length,2);assert(s.outbox.every(x=>x.state==='DONE'));assert.equal(s.audits.length,1);assert.equal(s.sent.length,1);});
test('F13 audit failure remains pending; retry same operation without duplicate role write',()=>{const s=make();s.api.appendAudit=()=>{throw Error('AUDIT_DOWN')};assert.equal(s.tx().status,'APPLIED_VERIFIED');assert.equal(s.outbox.find(x=>x.type==='audit').state,'PENDING');assert.equal(s.ledger.length,1);s.api.appendAudit=e=>s.audits.push(e);assert.equal(s.tx().status,'ALREADY_APPLIED');assert.equal(s.outbox.find(x=>x.type==='audit').state,'DONE');assert.equal(s.ledger.length,1);});
test('F14 transport failure remains pending and retry uses stable idempotency key',()=>{const s=make();s.api.notify=()=>{throw Error('NETWORK_DOWN')};assert.equal(s.tx().status,'APPLIED_VERIFIED');assert.equal(s.outbox.find(x=>x.type==='notification').state,'PENDING');s.api.notify=e=>s.sent.push(e);assert.equal(s.tx().status,'ALREADY_APPLIED');assert.equal(s.sent[0].idempotency_key,'g1:notification');});
test('restart from persisted outbox retries pending notification',()=>{const s=make();s.api.notify=()=>{throw Error('OUTAGE')};s.tx();const fresh=make(s.snapshot());assert.equal(fresh.tx().status,'ALREADY_APPLIED');assert.equal(fresh.sent.length,1);assert.equal(fresh.outbox.find(x=>x.type==='notification').state,'DONE');});
test('no outbox adapter means no untracked side effects',()=>{const s=make();delete s.api.readOutbox;assert.equal(s.tx().status,'APPLIED_VERIFIED');assert.equal(s.audits.length,0);assert.equal(s.sent.length,0);});
test('uncertain append cannot trigger send',()=>{const s=make();s.api.appendOutbox=()=>{throw Error('WRITE_UNKNOWN')};s.tx();assert.equal(s.audits.length,0);assert.equal(s.sent.length,0);});
test('uncertain DONE marking leaves pending (at-least-once; no exactly-once claim)',()=>{const s=make();s.api.updateOutbox=()=>{throw Error('AFTER_SEND')};s.tx();assert(s.outbox.every(x=>x.state==='PENDING'));assert.equal(s.sent.length,1);assert.equal(s.audits.length,1);});
test('corrupted outbox key conflict prevents side effects',()=>{const s=make();s.outbox.push({key:'g1:audit',type:'audit',operation_id:'g1',target:'999',action:'GRANT_ADMIN',state:'PENDING'});s.tx();assert.equal(s.audits.length,0);});
console.log('RBAC_DURABLE_POSTCOMMIT '+n+'/8 LOCAL PASS');
assert.equal(n,8);
