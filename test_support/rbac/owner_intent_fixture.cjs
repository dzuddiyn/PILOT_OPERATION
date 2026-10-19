'use strict';
// TEST_ONLY synthetic verified intent. Never import in runtime sources.
function fixtureAuthorize(request,api){
  const r={...request,chatType:'private',intentId:'intent-'+request.operationId,
    callbackId:'callback-'+request.operationId,identityBindingHash:'synthetic-binding'};
  api.readBootstrapOwner=()=>({user_id:'100',private_chat_id:'100',verified:true});
  api.readIntent=()=>({intent_id:r.intentId,operation_id:r.operationId,callback_id:r.callbackId,
    actor_owner_id:'100',target_user_id:r.target,action:r.action,
    identity_binding_hash:r.identityBindingHash,state:'CONFIRMED',expires_at:2000});
  api.verifyCallbackOrigin=()=>true;api.now=()=>1000;
  return r;
}
module.exports={fixtureAuthorize};
