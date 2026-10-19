'use strict';const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(__dirname+'/PilotRoleIdentityGuard.js','utf8'),ctx);
const request={actor:'100',chat:'100',chatType:'private',intentId:'i1',operationId:'op1',callbackId:'cb1',target:'200',action:'GRANT_ADMIN',identityBindingHash:'binding'};
function setup(){const intent={intent_id:'i1',operation_id:'op1',callback_id:'cb1',actor_owner_id:'100',target_user_id:'200',action:'GRANT_ADMIN',identity_binding_hash:'binding',state:'CONFIRMED',expires_at:2000};return {readBootstrapOwner:()=>({user_id:'100',private_chat_id:'100',verified:true}),readIntent:()=>intent,now:()=>1000,verifyCallbackOrigin:()=>true,intent};}
let n=0;function t(name,fn){fn();n++;console.log('PASS '+name)}
t('confirmed owner private callback passes',()=>assert.equal(ctx.bseRoleValidateOwnerIntent_(request,setup()).ok,true));
t('wrong owner denied',()=>assert.equal(ctx.bseRoleValidateOwnerIntent_({...request,actor:'999'},setup()).ok,false));
t('wrong private chat denied',()=>assert.equal(ctx.bseRoleValidateOwnerIntent_({...request,chat:'999'},setup()).ok,false));
t('group denied',()=>assert.equal(ctx.bseRoleValidateOwnerIntent_({...request,chatType:'group'},setup()).ok,false));
t('callback provenance failure denied',()=>{const a=setup();a.verifyCallbackOrigin=()=>false;assert.equal(ctx.bseRoleValidateOwnerIntent_(request,a).ok,false)});
t('callback replay to other intent denied',()=>assert.equal(ctx.bseRoleValidateOwnerIntent_({...request,callbackId:'different'},setup()).ok,false));
t('target substitution denied',()=>assert.equal(ctx.bseRoleValidateOwnerIntent_({...request,target:'300'},setup()).ok,false));
t('expired denied',()=>{const a=setup();a.now=()=>2000;assert.equal(ctx.bseRoleValidateOwnerIntent_(request,a).ok,false)});
t('unverified owner denied',()=>{const a=setup();a.readBootstrapOwner=()=>({user_id:'100',verified:false});assert.equal(ctx.bseRoleValidateOwnerIntent_(request,a).ok,false)});
t('read outage denied',()=>{const a=setup();a.readIntent=()=>{throw Error('read outage')};assert.equal(ctx.bseRoleValidateOwnerIntent_(request,a).ok,false)});
t('missing callback verifier denied',()=>{const a=setup();delete a.verifyCallbackOrigin;assert.equal(ctx.bseRoleValidateOwnerIntent_(request,a).ok,false)});
t('legacy is_admin ignored',()=>{const a=setup();a.readBootstrapOwner=()=>({user_id:'999',private_chat_id:'999',verified:true,is_admin:true});assert.equal(ctx.bseRoleValidateOwnerIntent_(request,a).ok,false)});
console.log('RBAC_IDENTITY_GUARD '+n+'/12 LOCAL PASS');assert.equal(n,12);
