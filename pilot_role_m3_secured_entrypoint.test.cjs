'use strict';const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c=vm.createContext({});
for(const f of ['PilotRoleIdentityGuard.js','PilotRoleSecuredTransaction.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),c);
const r={actor:'100',chat:'100',chatType:'private',intentId:'i1',operationId:'op1',callbackId:'cb1',target:'200',action:'GRANT_ADMIN',identityBindingHash:'b'};
function api(){return {readBootstrapOwner:()=>({user_id:'100',private_chat_id:'100',verified:true}),readIntent:()=>({intent_id:'i1',operation_id:'op1',callback_id:'cb1',actor_owner_id:'100',target_user_id:'200',action:'GRANT_ADMIN',identity_binding_hash:'b',state:'CONFIRMED',expires_at:200}),verifyCallbackOrigin:()=>true,now:()=>100};}
let calls=0;c.bseRoleTransaction_=()=>{calls++;return {status:'CANDIDATE_CALLED'}};
assert.equal(c.bseRoleSecuredTransaction_(r,api()).status,'CANDIDATE_CALLED');assert.equal(calls,1);
assert.equal(c.bseRoleSecuredTransaction_({...r,actor:'200'},api()).status,'DENIED');assert.equal(calls,1);
assert.equal(c.bseRoleSecuredTransaction_({...r,callbackId:'replayed'},api()).status,'DENIED');assert.equal(calls,1);
const expired=api();expired.now=()=>250;assert.equal(c.bseRoleSecuredTransaction_(r,expired).status,'DENIED');assert.equal(calls,1);
console.log('RBAC_SECURED_ENTRYPOINT 4/4 LOCAL PASS');
