'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const c=vm.createContext({});
for(const f of ['PilotRolePostCommit.js','PilotRoleGrant.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),c);
const digest=e=>crypto.createHash('sha256').update(JSON.stringify([e.event_id,e.operation_id,e.target,e.actor,e.action,e.revision,e.previous_hash])).digest('hex');
function setup(){
const ledger=[],barriers=[],audits=[],notices=[];let busy=false;
const api={isOwnerPrivate:()=>true,confirmed:()=>true,registration:()=> 'REGISTERED_ACTIVE',
lock:()=>({tryLock:()=>{if(busy)return false;busy=true;return true;},releaseLock:()=>{busy=false;}}),
readLedger:()=>structuredClone(ledger),readBarriers:()=>structuredClone(barriers),
appendEvent:e=>ledger.push(structuredClone(e)),appendBarrier:e=>barriers.push(structuredClone(e)),flush:()=>{},
hashEvent:digest,sameEvent:(a,b)=>JSON.stringify(a)===JSON.stringify(b),
commitEvent:op=>{const e=ledger.find(e=>e.operation_id===op);e.state='COMMITTED';},
closeBarrier:op=>{barriers.find(b=>b.operation_id===op).active=false;},
validateLedger:(events,b)=>{if(b.some(x=>x.active))return false;return events.every((e,i)=>e.state==='COMMITTED'&&e.digest===digest(e)&&e.revision===i+1);},
appendAudit:r=>audits.push(r),notify:r=>notices.push(r)};
return {api,ledger,barriers,audits,notices,req:{operationId:'g',target:'200',actor:'100',chat:'100',confirmed:true,action:'GRANT_ADMIN'}};
}
let n=0;
function test(name,fn){fn();console.log('PASS '+name);n++;}
test('F13 actual audit failure does not regrant',()=>{const s=setup();s.api.appendAudit=()=>{throw Error('AUDIT_FAIL')};assert.equal(c.bseRoleTransaction_(s.req,s.api).status,'APPLIED_VERIFIED');assert.equal(s.ledger.length,1);assert.equal(s.notices.length,1);assert.equal(c.bseRoleTransaction_(s.req,s.api).status,'ALREADY_APPLIED');assert.equal(s.ledger.length,1);});
test('F14 actual notification failure does not regrant',()=>{const s=setup();s.api.notify=()=>{throw Error('TELEGRAM_UNAVAILABLE')};assert.equal(c.bseRoleTransaction_(s.req,s.api).status,'APPLIED_VERIFIED');assert.equal(s.audits.length,1);assert.equal(s.ledger.length,1);assert.equal(c.bseRoleTransaction_(s.req,s.api).status,'ALREADY_APPLIED');assert.equal(s.ledger.length,1);});
test('audit and notification outcome explicitly PENDING',()=>{const s=setup();s.api.appendAudit=()=>{throw Error('NO')};s.api.notify=()=>{throw Error('NO')};const status=c.bseRolePostCommit_(s.req,s.api);assert.equal(status.audit,'AUDIT_PENDING');assert.equal(status.notification,'NOTIFY_PENDING');});
test('postcommit only after committed ledger',()=>{const s=setup();s.api.commitEvent=()=>{throw Error('CRASH')};assert.equal(c.bseRoleTransaction_(s.req,s.api).status,'WRITE_OUTCOME_UNKNOWN');assert.equal(s.audits.length,0);assert.equal(s.notices.length,0);});
console.log('RBAC_AUDIT_NOTIFY '+n+'/4 LOCAL PASS');
