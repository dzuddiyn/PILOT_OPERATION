'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/NondeleteIssuer36KLM.js','utf8'),c);
const r={environment:'TEST_ONLY',workbook_id:'1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY',event_id:'TEST_ONLY_36_ISSUER',approval_hash:'a'.repeat(64),ledger_hash:'b'.repeat(64),explicit_decision:'APPROVE'};
function fixture(over={}){let releases=0;return {verifyActor:()=>({status:'VERIFIED',actor_id:'TEST_ONLY_OWNER_36B',user_action_verified:true}),randomId:()=> 'SYNTHETIC',appendAudit:()=>{},lock:{tryLock:()=>true,releaseLock:()=>{releases++}},...over,get releases(){return releases}}}
test('36K injected verified actor remains runtime HOLD',()=>{const d=fixture();assert.equal(c.bseNondelete36KIssue_(d,r).status,'ISSUER_RUNTIME_HOLD');assert.equal(d.releases,1)});
test('36K spoofed client approval cannot replace identity',()=>{const d=fixture({verifyActor:()=>({status:'VERIFIED',actor_id:'FAKE'})});assert.equal(c.bseNondelete36KIssue_(d,{...r,owner_authorized:true}).status,'ACTOR_UNVERIFIED')});
test('36K no user approval denies',()=>assert.equal(c.bseNondelete36KIssue_(fixture(),{...r,explicit_decision:'NONE'}).status,'APPROVAL_INVALID'));
test('36K wrong book and missing dependencies deny',()=>{assert.equal(c.bseNondelete36KIssue_(fixture(),{...r,workbook_id:'OTHER'}).status,'SCOPE_DENIED');assert.equal(c.bseNondelete36KIssue_({},r).status,'ISSUER_UNBOUND')});
test('36K lock contention denies',()=>assert.equal(c.bseNondelete36KIssue_(fixture({lock:{tryLock:()=>false,releaseLock:()=>{}}}),r).status,'LOCK_BUSY'));
test('36L never grants transaction',()=>assert.equal(c.bseNondelete36LReview_(fixture(),r).transaction_allowed,false));
test('36M stays unbound for head and transaction',()=>{const x=c.bseNondelete36MReady_();assert.equal(x.script_head_updated,false);assert.equal(x.live_transaction,false)});
