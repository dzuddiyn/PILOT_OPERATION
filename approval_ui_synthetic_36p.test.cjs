'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),vm=require('node:vm');
const {create36PSyntheticHarness}=require('./NondeleteApprovalUiSynthetic36P.cjs');
const BOOK='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY';
const tx=()=>({event_id:'TEST_ONLY_36_P_UI',operation:'BAJA',workbook_id:BOOK,
 approval_source_key:'SYNTH|Inventory_Event_Log|C1',ledger_source_key:'SYNTH|INVENTORY_IN|ITEM_B',
 approval_hash:'a'.repeat(64),ledger_hash:'b'.repeat(64)});
function fixture(){
 let now=1800000000000,actor='dzuddiyn01@gmail.com',source=tx(),locked=false,releases=0,fail=false;
 const adapter={synthetic_only:true,currentActor:()=>actor,now:()=>now,
 readCanonical:id=>id===source.event_id?source:null,
 lock:{tryLock:()=>!locked,releaseLock:()=>{releases++}},failAfterAuditAppend:()=>fail};
 return {service:create36PSyntheticHarness(adapter),setActor:x=>actor=x,setNow:x=>now=x,
 setSource:x=>source=x,setLocked:x=>locked=x,setFail:x=>fail=x,get releases(){return releases}};
}
const open=f=>f.service.preview({event_id:'TEST_ONLY_36_P_UI'});
const action=(f,p,decision='APPROVE')=>f.service.decide({challenge_id:p.challenge_id,nonce:p.nonce,decision});
test('synthetic adapter required; no live Google Sheets or permission service',()=>assert.throws(()=>create36PSyntheticHarness({}),/SYNTHETIC_ADAPTER_REQUIRED/));
test('preview strictly scoped and never issues approvals',()=>{const f=fixture(),r=open(f);assert.equal(r.status,'PREVIEW_READY_SYNTHETIC');assert.equal(r.approval_issued,false);assert.equal(r.transaction_write,false);assert.equal(r.preview.workbook_id,BOOK);assert.equal(r.preview.operation,'BAJA')});
test('nonce is 24 bytes crypto random base64url and fresh across records',()=>{const a=open(fixture()),b=open(fixture());assert.match(a.nonce,/^[A-Za-z0-9_-]{32}$/);assert.notEqual(a.nonce,b.nonce);assert.notEqual(a.challenge_id,b.challenge_id)});
test('no preview for blank/mismatched server identity',()=>{const f=fixture();f.setActor('');assert.equal(open(f).status,'ACTOR_UNVERIFIED');f.setActor('other@example.test');assert.equal(open(f).status,'ACTOR_UNVERIFIED')});
test('actor is reverified at decision; client claims cannot replace owner',()=>{const f=fixture(),p=open(f);f.setActor('intruder@example.test');assert.equal(f.service.decide({...p,owner_authorized:true}).status,'INVALID_DECISION_REQUEST');assert.equal(action(f,p).status,'ACTOR_UNVERIFIED');assert.equal(f.service.inspectSyntheticOnly().journal.length,0)});
test('invalid event request/extra fields denied',()=>{const f=fixture();assert.equal(f.service.preview({event_id:'TEST_ONLY_36_P_UI',actor_id:'owner'}).status,'INVALID_REQUEST');assert.equal(f.service.preview({event_id:'../../other'}).status,'CANONICAL_TRANSACTION_UNVERIFIED')});
test('wrong workbook or DELETE cannot be reviewed even from server fixture',()=>{const f=fixture();f.setSource({...tx(),workbook_id:'OTHER'});assert.equal(open(f).status,'CANONICAL_TRANSACTION_UNVERIFIED');f.setSource({...tx(),operation:'DELETE'});assert.equal(open(f).status,'CANONICAL_TRANSACTION_UNVERIFIED')});
test('a second active challenge for same event fails closed',()=>{const f=fixture();open(f);assert.equal(open(f).status,'CHALLENGE_ALREADY_PENDING')});
test('happy synthetic approval writes only in-memory audit',()=>{const f=fixture(),p=open(f),r=action(f,p);assert.equal(r.status,'SIM_APPROVED_ONLY');assert.equal(r.approval_issued,false);assert.equal(r.transaction_write,false);const s=f.service.inspectSyntheticOnly();assert.equal(s.journal.length,1);assert.equal(s.used_nonces,1);assert.equal(s.independently_anchored,false);assert.equal(s.finalized_events,1)});
test('synthetic reject appends one audit but no transaction',()=>{const f=fixture(),p=open(f),r=action(f,p,'REJECT');assert.equal(r.status,'SIM_REJECTED_ONLY');assert.equal(r.transaction_write,false);assert.equal(f.service.inspectSyntheticOnly().journal[0].decision,'REJECT')});
test('same decision replay is idempotent and conflicting replay denied',()=>{const f=fixture(),p=open(f);action(f,p);assert.equal(action(f,p).status,'ALREADY_APPLIED_SYNTHETIC');assert.equal(action(f,p,'REJECT').status,'REPLAY_OR_CONFLICT');assert.equal(f.service.inspectSyntheticOnly().journal.length,1)});
test('second approval for finalized event blocked even with new challenge',()=>{const f=fixture(),p=open(f);action(f,p);assert.equal(open(f).status,'EVENT_ALREADY_FINALIZED')});
test('bad nonce cannot consume or mutate audit',()=>{const f=fixture(),p=open(f);assert.equal(action(f,{...p,nonce:'x'}).status,'NONCE_INVALID');assert.equal(f.service.inspectSyntheticOnly().journal.length,0)});
test('challenge expiry fail-closed with no audit',()=>{const f=fixture(),p=open(f);f.setNow(p.expires_ms+1);assert.equal(action(f,p).status,'CHALLENGE_EXPIRED');assert.equal(f.service.inspectSyntheticOnly().journal.length,0)});
test('unknown challenge and invalid decision cannot write',()=>{const f=fixture(),p=open(f);assert.equal(f.service.decide({challenge_id:'other',nonce:p.nonce,decision:'APPROVE'}).status,'CHALLENGE_NOT_FOUND');assert.equal(action(f,p,'DELETE').status,'INVALID_DECISION_REQUEST')});
test('source mutation after review rejects stale challenge',()=>{const f=fixture(),p=open(f);f.setSource({...tx(),ledger_hash:'c'.repeat(64)});assert.equal(action(f,p).status,'TRANSACTION_SOURCE_CHANGED');assert.equal(f.service.inspectSyntheticOnly().journal.length,0)});
test('busy lock denies and does not release unacquired lock',()=>{const f=fixture();f.setLocked(true);assert.equal(open(f).status,'LOCK_BUSY');assert.equal(f.releases,0)});
test('fault after audit append quarantines service and forbids retry',()=>{const f=fixture(),p=open(f);f.setFail(true);assert.equal(action(f,p).status,'WRITE_OUTCOME_UNKNOWN_SYNTHETIC');assert.equal(f.service.inspectSyntheticOnly().journal.length,1);assert.equal(f.service.inspectSyntheticOnly().quarantine,true);f.setFail(false);assert.equal(action(f,p).status,'AUDIT_RECOVERY_REQUIRED')});
test('audit entry is hash chained and carries nonce hash rather than raw nonce',()=>{const f=fixture(),p=open(f);action(f,p);const e=f.service.inspectSyntheticOnly().journal[0];assert.equal(e.previous_hash,'0'.repeat(64));assert.notEqual(e.nonce_digest,p.nonce);const copy={...e};delete copy.entry_hash;assert.equal(e.entry_hash,crypto.createHash('sha256').update(JSON.stringify(copy)).digest('hex'))});
test('UI file labels synthetic and uses safe textContent instead of innerHTML',()=>{const html=fs.readFileSync(__dirname+'/NondeleteApprovalUi36P.html','utf8');assert.match(html,/TEST_ONLY · SYNTHETIC UI/);assert.match(html,/textContent/);assert.doesNotMatch(html,/innerHTML|eval\s*\(/);assert.match(html,/withFailureHandler/);assert.match(html,/approve\.disabled/);assert.match(html,/role="status"/)});
test('UI never automatically calls approval on initial load',()=>{const html=fs.readFileSync(__dirname+'/NondeleteApprovalUi36P.html','utf8');const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];const elements=new Map();const el=id=>{if(!elements.has(id))elements.set(id,{value:'',disabled:false,hidden:false,textContent:'',events:{},addEventListener(type,fn){this.events[type]=fn}});return elements.get(id)};let backendCalls=0;const sandbox={document:{getElementById:el},window:{google:{script:{run:{withSuccessHandler(){backendCalls++;return this},withFailureHandler(){return this}}}}}};vm.createContext(sandbox);vm.runInContext(js,sandbox);assert.equal(backendCalls,0);assert.equal(el('approve').disabled,true);assert.equal(el('reject').disabled,true);assert.equal(el('review').hidden,true)});
test('synthetic UI to backend preview and approve, explicit clicks only, no live writes',()=>{
 const f=fixture(),html=fs.readFileSync(__dirname+'/NondeleteApprovalUi36P.html','utf8');
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1],elements=new Map(),calls=[];
 const el=id=>{if(!elements.has(id))elements.set(id,{value:'',disabled:false,hidden:false,
  textContent:'',events:{},addEventListener(type,fn){this.events[type]=fn}});return elements.get(id)};
 const run={withSuccessHandler(success){return {withFailureHandler(fail){return{
  bse36pLoadPreview(arg){calls.push('PREVIEW');try{success(f.service.preview(arg))}catch(e){fail(e)}},
  bse36pSubmitDecision(arg){calls.push('DECISION');try{success(f.service.decide(arg))}catch(e){fail(e)}}
 }}}}};
 const sandbox={document:{getElementById:el},window:{google:{script:{run}}}};
 vm.createContext(sandbox);vm.runInContext(script,sandbox);
 assert.deepEqual(calls,[]);
 el('event').value='TEST_ONLY_36_P_UI';
 el('load').events.click();
 assert.deepEqual(calls,['PREVIEW']);
 assert.equal(el('review').hidden,false);
 assert.equal(el('approve').disabled,false);
 assert.equal(el('opValue').textContent,'BAJA');
 assert.equal(f.service.inspectSyntheticOnly().journal.length,0);
 el('approve').events.click();
 assert.deepEqual(calls,['PREVIEW','DECISION']);
 assert.equal(f.service.inspectSyntheticOnly().journal.length,1);
 assert.equal(f.service.inspectSyntheticOnly().used_nonces,1);
 assert.equal(el('review').hidden,true);
 assert.match(el('status').textContent,/SIM_APPROVED_ONLY/);
});
test('synthetic UI fail closed without a bound runtime bridge',()=>{
 const html=fs.readFileSync(__dirname+'/NondeleteApprovalUi36P.html','utf8');
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1],els=new Map();
 const el=id=>{if(!els.has(id))els.set(id,{value:'',disabled:false,hidden:false,textContent:'',
 events:{},addEventListener(type,fn){this.events[type]=fn}});return els.get(id)};
 const sandbox={document:{getElementById:el},window:{}};
 vm.createContext(sandbox);vm.runInContext(script,sandbox);
 el('event').value='TEST_ONLY_36_P_UI';el('load').events.click();
 assert.equal(el('approve').disabled,true);
 assert.equal(el('review').hidden,true);
 assert.match(el('status').textContent,/Backend TEST_ONLY belum dipasang/);
});
