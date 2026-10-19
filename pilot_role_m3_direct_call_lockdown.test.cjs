'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function load(withGuard){const c=vm.createContext({});for(const f of (withGuard?['PilotRoleIdentityGuard.js','PilotRoleGrant.js']:['PilotRoleGrant.js']))vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),c);return c;}
let n=0;function test(name,fn){fn();n++;console.log('PASS '+name);}
const req={operationId:'test-op',target:'200',actor:'100',chat:'100',action:'GRANT_ADMIN',confirmed:true};
function api(){const ledger=[];return {ledger,isOwnerPrivate:()=>true,confirmed:()=>true,registration:()=> 'REGISTERED_ACTIVE',lock:()=>({tryLock:()=>true,releaseLock:()=>{}}),readLedger:()=>ledger,readBarriers:()=>[],appendEvent:e=>ledger.push(e),validateLedger:()=>true};}
test('direct call without guard function denies before lock/write',()=>{const a=api(),c=load(false);assert.equal(c.bseRoleTransaction_(req,a).status,'DENIED');assert.equal(a.ledger.length,0);});
test('direct call with old owner.ok adapters denies before lock/write',()=>{const a=api(),c=load(true);assert.equal(c.bseRoleTransaction_(req,a).status,'DENIED');assert.equal(a.ledger.length,0);});
test('direct call forged callback does not write',()=>{const a=api(),c=load(true);a.readBootstrapOwner=()=>({user_id:'100',private_chat_id:'100',verified:true});a.readIntent=()=>({intent_id:'i',operation_id:'test-op',callback_id:'cb',actor_owner_id:'100',target_user_id:'200',action:'GRANT_ADMIN',identity_binding_hash:'h',state:'CONFIRMED',expires_at:2000});a.now=()=>1000;a.verifyCallbackOrigin=()=>false;assert.equal(c.bseRoleTransaction_({...req,chatType:'private',intentId:'i',callbackId:'cb',identityBindingHash:'h'},a).status,'DENIED');assert.equal(a.ledger.length,0);});
console.log('RBAC_DIRECT_CALL_LOCKDOWN '+n+'/3 LOCAL PASS');
