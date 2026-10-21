'use strict';
// LOCAL SYNTHETIC TEST HARNESS ONLY. No Apps Script global, no Sheets, no network writer.
// Runtime actor/store providers are test fixtures; NOT an authenticated live authority.
const crypto=require('node:crypto');
const lock=require('./authority_mode_36p.lock.json');
const BOOK=lock.workbook_id,OWNER=lock.permitted_owner;
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
const keys=['event_id','operation','workbook_id','approval_source_key','ledger_source_key','approval_hash','ledger_hash'];
const exact=(o,expected)=>o&&typeof o==='object'&&!Array.isArray(o)&&
  Object.keys(o).sort().join('|')===expected.slice().sort().join('|');
const response=status=>({status,approval_issued:false,transaction_write:false,production_write:false,official_bse_write:false});
const serialize=t=>JSON.stringify(keys.map(k=>t[k]));
const validate=t=>!!t&&t.workbook_id===BOOK&&/^TEST_ONLY_36_[A-Z0-9_]{1,80}$/.test(t.event_id||'')&&
  lock.operations.includes(t.operation)&&/^[0-9a-f]{64}$/.test(t.approval_hash||'')&&
  /^[0-9a-f]{64}$/.test(t.ledger_hash||'')&&
  typeof t.approval_source_key==='string'&&t.approval_source_key.length>0&&t.approval_source_key.length<=200&&
  typeof t.ledger_source_key==='string'&&t.ledger_source_key.length>0&&t.ledger_source_key.length<=200;
function create36PSyntheticHarness(adapter){
 if(!adapter||adapter.synthetic_only!==true||typeof adapter.currentActor!=='function'||
   typeof adapter.readCanonical!=='function'||typeof adapter.now!=='function'||
   !adapter.lock||typeof adapter.lock.tryLock!=='function'||typeof adapter.lock.releaseLock!=='function')
   throw Error('SYNTHETIC_ADAPTER_REQUIRED');
 const challenges=new Map(),journal=[],usedNonces=new Set(),pendingByEvent=new Map(),finalizedByEvent=new Map();
 let quarantine=false,previous='0'.repeat(64);
 const owner=()=>{try{return adapter.currentActor()===OWNER}catch(e){return false}};
 const clock=()=>{try{const n=adapter.now();return Number.isSafeInteger(n)&&n>0?n:null}catch(e){return null}};
 const transaction=id=>{try{const t=adapter.readCanonical(id);return validate(t)&&t.event_id===id?t:null}catch(e){return null}};
 function appendAudit(c,decision,now){
  const base={seq:journal.length+1,event_id:c.tx.event_id,decision,
    fingerprint:c.fingerprint,nonce_digest:digest(c.nonce),at_ms:now,previous_hash:previous};
  const entry={...base,entry_hash:digest(JSON.stringify(base))};
  // A future server-backed journal must be independently anchored. This Map is NOT authority.
  journal.push(entry);previous=entry.entry_hash;
  if(adapter.failAfterAuditAppend&&adapter.failAfterAuditAppend())throw Error('SYNTHETIC_TORN_WRITE');
  if(journal[journal.length-1]!==entry||entry.previous_hash!==base.previous_hash)
    throw Error('SYNTHETIC_READBACK_FAILED');
 }
 function underLock(work){
  let acquired=false;
  try{
   acquired=adapter.lock.tryLock(1000)===true;
   if(!acquired)return response('LOCK_BUSY');
   if(quarantine)return response('AUDIT_RECOVERY_REQUIRED');
   return work();
  }catch(e){quarantine=true;return response('WRITE_OUTCOME_UNKNOWN_SYNTHETIC')}
  finally{if(acquired)adapter.lock.releaseLock()}
 }
 function preview(input){
  if(!exact(input,['event_id'])||typeof input.event_id!=='string')return response('INVALID_REQUEST');
  return underLock(()=>{
   if(!owner())return response('ACTOR_UNVERIFIED');
   const now=clock(),tx=transaction(input.event_id);
   if(!now||!tx)return response('CANONICAL_TRANSACTION_UNVERIFIED');
   if(finalizedByEvent.has(tx.event_id))return response('EVENT_ALREADY_FINALIZED');
   const prior=challenges.get(pendingByEvent.get(tx.event_id));
   if(prior&&prior.state==='PENDING_SYNTHETIC'&&now<=prior.expires_ms)return response('CHALLENGE_ALREADY_PENDING');
   const nonce=crypto.randomBytes(24).toString('base64url');
   const id='S36P_'+crypto.randomBytes(12).toString('hex');
   const c={id,nonce,created_ms:now,expires_ms:now+lock.consent_requirements.nonce_ttl_ms,
     tx:structuredClone(tx),fingerprint:digest(serialize(tx)),state:'PENDING_SYNTHETIC'};
   challenges.set(id,c);pendingByEvent.set(tx.event_id,id);
   return {...response('PREVIEW_READY_SYNTHETIC'),challenge_id:id,nonce,
     expires_ms:c.expires_ms,preview:{event_id:tx.event_id,operation:tx.operation,
       approval_source_key:tx.approval_source_key,ledger_source_key:tx.ledger_source_key,
       approval_hash:tx.approval_hash,ledger_hash:tx.ledger_hash,workbook_id:BOOK}};
  });
 }
 function decide(input){
  if(!exact(input,['challenge_id','nonce','decision'])||
     typeof input.challenge_id!=='string'||typeof input.nonce!=='string'||
     !['APPROVE','REJECT'].includes(input.decision))return response('INVALID_DECISION_REQUEST');
  return underLock(()=>{
   if(!owner())return response('ACTOR_UNVERIFIED');
   const now=clock(),c=challenges.get(input.challenge_id);
   if(!now||!c)return response('CHALLENGE_NOT_FOUND');
   if(now>c.expires_ms)return response('CHALLENGE_EXPIRED');
   const supplied=Buffer.from(input.nonce,'utf8'),expected=Buffer.from(c.nonce,'utf8');
   if(supplied.length!==expected.length||!crypto.timingSafeEqual(supplied,expected))
     return response('NONCE_INVALID');
   if(c.state!=='PENDING_SYNTHETIC')
     return response(c.state===('SIM_'+input.decision)?'ALREADY_APPLIED_SYNTHETIC':'REPLAY_OR_CONFLICT');
   if(usedNonces.has(c.nonce))return response('NONCE_ALREADY_USED');
   const tx=transaction(c.tx.event_id);
   if(!tx||digest(serialize(tx))!==c.fingerprint)return response('TRANSACTION_SOURCE_CHANGED');
   appendAudit(c,input.decision,now);
   usedNonces.add(c.nonce);
   c.state='SIM_'+input.decision;
   pendingByEvent.delete(c.tx.event_id);
   finalizedByEvent.set(c.tx.event_id,c.state);
   return {...response(input.decision==='APPROVE'?'SIM_APPROVED_ONLY':'SIM_REJECTED_ONLY'),
     audit_entries:journal.length};
  });
 }
 function inspectSyntheticOnly(){
  return {quarantine,used_nonces:usedNonces.size,journal:journal.map(x=>({...x})),
    finalized_events:finalizedByEvent.size,
    states:[...challenges.values()].map(x=>({challenge_id:x.id,state:x.state})),
    independently_anchored:false};
 }
 return Object.freeze({preview,decide,inspectSyntheticOnly});
}
module.exports={create36PSyntheticHarness};
