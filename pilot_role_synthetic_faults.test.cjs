'use strict';
// GI RBAC F01-F29 synthetic-only exercise. This is NOT production RBAC code.
// No network, filesystem writes, Telegram, Google APIs or real Sheets.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const OWNER='100', MEMBER='200', OTHER='300';
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
class FakeLockService{
  busy=false; tryLock(){if(this.busy)return false;this.busy=true;return true;}
  releaseLock(){this.busy=false;}
}
class FakeSheets{
  constructor(){this.ledger=[];this.intents=[];this.barriers=[];this.audit=[];this.registration=new Map([[MEMBER,'REGISTERED_ACTIVE'],[OTHER,'REGISTERED_ACTIVE']]);this.outage=false;this.fault='';this.writeCount=0;}
  read(name){if(this.outage||this.fault==='read')throw Error('SHEET_UNAVAILABLE');return structuredClone(this[name]);}
  append(name,value){this.writeCount++;if(this.fault==='append')throw Error('APPEND_FAILED');if(this.fault==='torn'){this[name].push({event_id:value.event_id});throw Error('TORN_WRITE');}this[name].push(structuredClone(value));if(this.fault==='afterAppend')throw Error('TIMEOUT_AFTER_APPEND');}
}
class SyntheticRoleMachine{
 constructor(){this.db=new FakeSheets();this.lock=new FakeLockService();this.now=1000;this.notifications=[];this.cache=new Map();}
 event(op,action,revision,previous){const e={event_id:'event-'+op,operation_id:op,target:MEMBER,actor:OWNER,action,revision,previous_hash:previous||'',state:'PREPARED'};e.digest=hash([e.event_id,e.operation_id,e.target,e.actor,e.action,e.revision,e.previous_hash]);return e;}
 verifyChain(){
   if(this.db.outage||this.db.fault==='read')return {ok:false,reason:'UNVERIFIED'};
   const all=this.db.ledger.filter(e=>e.target===MEMBER);let prev='',rev=0,role='MEMBER';const ids=new Set();
   for(const e of all){
     if(!e.event_id||ids.has(e.event_id)||e.revision!==rev+1||e.previous_hash!==prev||
       e.digest!==hash([e.event_id,e.operation_id,e.target,e.actor,e.action,e.revision,e.previous_hash])||
       !['PREPARED','COMMITTED'].includes(e.state))
       return {ok:false,reason:'SOURCE_MISMATCH'};
     ids.add(e.event_id);
     if(e.state!=='COMMITTED')return {ok:false,reason:'UNVERIFIED'};
     rev=e.revision;prev=e.digest;role=e.action==='GRANT_ADMIN'?'ADMIN':'MEMBER';
   }
   return {ok:true,role,revision:rev,hash:prev};
 }
 resolve(user=MEMBER,capability='restricted'){
   if(user===OWNER)return {allowed:true,role:'OWNER',manage:true};
   if(this.db.outage||this.db.fault==='read')return {allowed:false,reason:'UNVERIFIED'};
   if(this.db.registration.get(user)!=='REGISTERED_ACTIVE')return {allowed:false,reason:'INACTIVE'};
   if(this.db.barriers.some(b=>b.target===user&&b.active!==false))return {allowed:false,reason:'REVOKE_BARRIER'};
   const chain=this.verifyChain();
   if(!chain.ok)return {allowed:false,reason:chain.reason};
   if(capability==='manage')return {allowed:false,reason:'OWNER_ONLY'};
   return {allowed:chain.role==='ADMIN',role:chain.role,revision:chain.revision};
 }
 transact({op='op1',actor=OWNER,action='GRANT_ADMIN',expected,expired=false,chat='private',callbackValid=true,fault='',target=MEMBER}={}){
   if(actor!==OWNER||chat!=='private'||!callbackValid||expired)return {status:'DENIED'};
   if(this.db.registration.get(target)!=='REGISTERED_ACTIVE')return {status:'DENIED'};
   if(!this.lock.tryLock())return {status:'BUSY'};
   try{
     const existing=this.db.ledger.filter(e=>e.operation_id===op);
     if(existing.length){const v=this.verifyChain();return {status:v.ok&&existing.length===1&&existing[0].state==='COMMITTED'?'ALREADY_APPLIED':'WRITE_OUTCOME_UNKNOWN'};}
     const before=this.verifyChain();if(!before.ok)return {status:before.reason};
     if(expected!==undefined&&expected!==before.revision)return {status:'REVISION_CONFLICT'};
     if(action==='REVOKE_ADMIN')this.db.barriers.push({target,op,active:true});
     const event=this.event(op,action,before.revision+1,before.hash);
     try{this.db.fault=fault==='afterAppend'?'afterAppend':fault==='torn'?'torn':fault==='append'?'append':'';
       this.db.append('ledger',event);
     }catch(_){return {status:'WRITE_OUTCOME_UNKNOWN'};}finally{this.db.fault='';}
     if(fault==='crashBeforeCommit')return {status:'WRITE_OUTCOME_UNKNOWN'};
     event.state='COMMITTED';this.db.ledger[this.db.ledger.length-1].state='COMMITTED';
     const after=this.verifyChain();
     if(!after.ok)return {status:'UNVERIFIED'};
     if(action==='REVOKE_ADMIN')this.db.barriers=this.db.barriers.map(b=>b.op===op?{...b,active:false}:b);
     return {status:'APPLIED_VERIFIED'};
   }finally{this.lock.releaseLock();}
 }
}
function evaluate(m,expected){const state=m.resolve();assert.equal(state.allowed,expected,'independent final-state check failed');return {role:state.role||state.reason,grants:m.db.ledger.filter(x=>x.state==='COMMITTED'&&x.action==='GRANT_ADMIN').length,writes:m.db.writeCount};}
function prepareAdmin(m){assert.equal(m.transact({op:'seed'}).status,'APPLIED_VERIFIED');assert.equal(m.resolve().allowed,true);}
const scenarios={
 F01:m=>{m.transact();assert.equal(m.transact().status,'ALREADY_APPLIED');assert.equal(m.db.ledger.length,1);evaluate(m,true);},
 F02:m=>{assert.equal(m.transact({actor:MEMBER}).status,'DENIED');evaluate(m,false);},
 F03:m=>{assert.equal(m.transact({actor:OTHER}).status,'DENIED');evaluate(m,false);},
 F04:m=>{assert.equal(m.transact({expired:true}).status,'DENIED');evaluate(m,false);},
 F05:m=>{m.lock.busy=true;assert.equal(m.transact().status,'BUSY');evaluate(m,false);},
 F06:m=>{assert.equal(m.transact({fault:'append'}).status,'WRITE_OUTCOME_UNKNOWN');evaluate(m,false);},
 F07:m=>{assert.equal(m.transact({fault:'afterAppend'}).status,'WRITE_OUTCOME_UNKNOWN');assert.equal(m.db.ledger.length,1);evaluate(m,false);},
 F08:m=>{prepareAdmin(m);m.db.outage=true;evaluate(m,false);},
 F09:m=>{m.db.ledger.push(m.event('x','GRANT_ADMIN',1,''));evaluate(m,false);},
 F10:m=>{prepareAdmin(m);assert.equal(m.transact({op:'seed'}).status,'ALREADY_APPLIED');evaluate(m,true);},
 F11:m=>{m.transact({op:'first',expected:0});assert.equal(m.transact({op:'second',expected:0}).status,'REVISION_CONFLICT');evaluate(m,true);},
 F12:m=>{prepareAdmin(m);assert.equal(m.transact({op:'revoke',action:'REVOKE_ADMIN',expected:1}).status,'APPLIED_VERIFIED');assert.equal(m.transact({op:'stale',expected:1}).status,'REVISION_CONFLICT');evaluate(m,false);},
 F13:m=>{prepareAdmin(m);m.db.fault='append';assert.throws(()=>m.db.append('audit',{}));m.db.fault='';evaluate(m,true);},
 F14:m=>{prepareAdmin(m);m.notifications.push({delivered:false});evaluate(m,true);},
 F15:m=>{prepareAdmin(m);m.db.ledger[0].digest='tampered';evaluate(m,false);},
 F16:m=>{m.db.ledger.push(m.event('uncommitted','GRANT_ADMIN',1,''));evaluate(m,false);},
 F17:m=>{prepareAdmin(m);m.db.ledger.push({...m.db.ledger[0],action:'REVOKE_ADMIN'});evaluate(m,false);},
 F18:m=>{prepareAdmin(m);m.cache.set(MEMBER,'ADMIN');m.transact({op:'revoke',action:'REVOKE_ADMIN'});evaluate(m,false);},
 F19:m=>{m.db.registration.set(MEMBER,'REJECTED');assert.equal(m.transact().status,'DENIED');evaluate(m,false);},
 F20:m=>{assert.equal(m.transact({actor:'wrong'}).status,'DENIED');evaluate(m,false);},
 F21:m=>{m.db.outage=true;evaluate(m,false);},
 F22:m=>{assert.equal(m.transact({fault:'crashBeforeCommit'}).status,'WRITE_OUTCOME_UNKNOWN');evaluate(m,false);},
 F23:m=>{prepareAdmin(m);const e=m.event('collision','REVOKE_ADMIN',1,'');e.state='COMMITTED';m.db.ledger.push(e);evaluate(m,false);},
 F24:m=>{prepareAdmin(m);assert.equal(m.transact({op:'seed'}).status,'ALREADY_APPLIED');evaluate(m,true);},
 F25:m=>{m.transact({fault:'torn'});evaluate(m,false);},
 F26:m=>{m.db.ledger.push(m.event('pending','GRANT_ADMIN',1,''));evaluate(m,false);},
 F27:m=>{prepareAdmin(m);m.db.barriers.push({target:MEMBER,op:'pending-revoke',active:true});evaluate(m,false);},
 F28:m=>{prepareAdmin(m);m.cache.set(MEMBER,'ADMIN');m.transact({op:'revoke',action:'REVOKE_ADMIN'});evaluate(m,false);},
 F29:m=>{prepareAdmin(m);assert.equal(m.resolve(MEMBER,'manage').allowed,false);assert.equal(m.transact({actor:MEMBER}).status,'DENIED');evaluate(m,true);}
};
const outputs=[];
for(const [id,scenario] of Object.entries(scenarios)){
  const m=new SyntheticRoleMachine();try{scenario(m);outputs.push({id,result:'LOCAL_PASS'});console.log(id+' LOCAL_PASS');}
  catch(error){outputs.push({id,result:'FAIL',error:error.message});console.error(id+' FAIL '+error.message);}
}
const passed=outputs.filter(x=>x.result==='LOCAL_PASS').length;
console.log('GI_RBAC_SYNTHETIC '+passed+'/29 LOCAL_PASS; simulator-only, NOT production implementation proof');
assert.equal(Object.keys(scenarios).length,29);assert.equal(passed,29);
