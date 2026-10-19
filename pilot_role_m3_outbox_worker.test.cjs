'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(__dirname+'/PilotRoleOutboxWorker.js','utf8'),ctx);
function setup(rows){const state=structuredClone(rows),sent=[],audit=[],lock={owner:false,tryLock(){if(this.owner)return false;this.owner=true;return true;},releaseLock(){this.owner=false;}};
 const api={lock:()=>lock,readOutbox:()=>structuredClone(state),updateOutbox:r=>{const i=state.findIndex(x=>x.key===r.key);state[i]=structuredClone(r);},flush:()=>{},verifyCommitted:()=>true,notify:r=>sent.push(r),appendAudit:r=>audit.push(r)};
 return {state,sent,audit,api,run:()=>ctx.bseRoleOutboxWorker_(api)};
}
const pending=(kind='notification')=>({key:'op1:'+kind,type:kind,operation_id:'op1',target:'200',action:'GRANT_ADMIN',state:'PENDING'});
let n=0;function test(name,fn){fn();n++;console.log('PASS '+name);}
test('pending processed without any Telegram callback',()=>{const s=setup([pending()]);assert.equal(s.run().done,1);assert.equal(s.state[0].state,'DONE');assert.equal(s.sent.length,1);});
test('second worker run idempotent after DONE',()=>{const s=setup([pending()]);s.run();assert.equal(s.run().skipped,1);assert.equal(s.sent.length,1);});
test('audit and notification independent',()=>{const s=setup([pending('audit'),pending()]);assert.equal(s.run().done,2);assert.equal(s.audit.length,1);assert.equal(s.sent.length,1);});
test('transport outage stays PENDING and later run completes',()=>{const s=setup([pending()]);s.api.notify=()=>{throw Error('offline')};assert.equal(s.run().pending,1);assert.equal(s.state[0].state,'PENDING');s.api.notify=r=>s.sent.push(r);assert.equal(s.run().done,1);});
test('restart by snapshot recreation',()=>{const a=setup([pending()]);a.api.notify=()=>{throw Error('offline')};a.run();const b=setup(a.state);assert.equal(b.run().done,1);assert.equal(b.sent[0].idempotency_key,'op1:notification');});
test('unverified ledger blocks transport',()=>{const s=setup([pending()]);s.api.verifyCommitted=()=>false;assert.equal(s.run().unverified,1);assert.equal(s.sent.length,0);});
test('duplicate key fails closed',()=>{const s=setup([pending(),pending()]);assert.equal(s.run().conflicts,1);assert.equal(s.sent.length,0);});
test('lock contention prevents send',()=>{const s=setup([pending()]);const l=s.api.lock();l.tryLock();assert.equal(s.run().skipped,1);assert.equal(s.sent.length,0);l.releaseLock();});
test('stale read after snapshot does not send',()=>{const s=setup([pending()]);let call=0;const orig=s.api.readOutbox;s.api.readOutbox=()=>{call++;return call===1?orig():[];};assert.equal(s.run().conflicts,1);assert.equal(s.sent.length,0);});
test('transport succeeded but DONE write failed remains pending',()=>{const s=setup([pending()]);s.api.updateOutbox=()=>{throw Error('write failed')};assert.equal(s.run().pending,1);assert.equal(s.sent.length,1);assert.equal(s.state[0].state,'PENDING');});
test('invalid key denied',()=>{const s=setup([{...pending(),key:'another'}]);assert.equal(s.run().conflicts,1);assert.equal(s.sent.length,0);});
test('unknown adapter denies',()=>{const s=setup([pending()]);delete s.api.verifyCommitted;assert.equal(s.run().unverified,1);assert.equal(s.sent.length,0);});
console.log('RBAC_OUTBOX_WORKER '+n+'/12 LOCAL PASS');assert.equal(n,12);
