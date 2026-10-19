'use strict';
// Isolated owner-confirmation boundary; not a Telegram authenticator or runtime binding.
function bseRoleValidateOwnerIntent_(r,api){
 const deny=reason=>({ok:false,reason});
 if(!r||!api||typeof api.readBootstrapOwner!=='function'||typeof api.readIntent!=='function'||typeof api.now!=='function'||typeof api.verifyCallbackOrigin!=='function')return deny('AUTHORITY_UNAVAILABLE');
 try{
  const owner=api.readBootstrapOwner(),intent=api.readIntent(r.intentId);
  if(!owner||owner.verified!==true||!/^[0-9]+$/.test(String(owner.user_id||''))||!intent)return deny('AUTHORITY_UNVERIFIED');
  if(r.actor!==String(owner.user_id)||r.chat!==String(owner.private_chat_id)||r.chatType!=='private')return deny('OWNER_IDENTITY_MISMATCH');
  if(api.verifyCallbackOrigin(r)!==true)return deny('CALLBACK_UNVERIFIED');
  if(typeof r.operationId!=='string'||!r.operationId||typeof r.callbackId!=='string'||!r.callbackId||typeof r.intentId!=='string'||!r.intentId)return deny('INVALID_BINDING');
  if(intent.operation_id!==r.operationId||intent.intent_id!==r.intentId||intent.actor_owner_id!==r.actor||intent.target_user_id!==r.target||intent.action!==r.action||intent.callback_id!==r.callbackId||intent.identity_binding_hash!==r.identityBindingHash||intent.state!=='CONFIRMED')return deny('INTENT_MISMATCH');
  const now=api.now(),expiry=Number(intent.expires_at);
  if(!Number.isFinite(now)||!Number.isFinite(expiry)||now>=expiry)return deny('CONFIRMATION_EXPIRED');
  return {ok:true,reason:''};
 }catch(_){return deny('AUTHORITY_READ_FAILED');}
}
