'use strict';
// M1 contract only. No runtime binding, mutation or deployment.
const BSE_RBAC_CAPABILITIES=Object.freeze({
  ORDINARY:'ordinary', RESTRICTED_HISTORY:'restricted_history',
  RESTRICTED_RETRIEVAL:'restricted_retrieval', APPROVE:'approve',
  DELETE:'delete', REGISTRATION_DECISION:'registration_decision',
  MANAGE_ADMINS:'manage_admins', MUTATE_OWNER:'mutate_owner'
});
function bseRoleCapabilityAllowed_(role,capability){
  if(!Object.values(BSE_RBAC_CAPABILITIES).includes(capability))return false;
  if(role==='OWNER')return true;
  if(role==='ADMIN')return capability!==BSE_RBAC_CAPABILITIES.MANAGE_ADMINS&&capability!==BSE_RBAC_CAPABILITIES.MUTATE_OWNER;
  return role==='REGISTERED_ACTIVE'&&capability===BSE_RBAC_CAPABILITIES.ORDINARY;
}
function bseRoleEventDigest_(e,sha256){
  if(typeof sha256!=='function')throw Error('HASH_ADAPTER_REQUIRED');
  return sha256(JSON.stringify([e.event_id,e.operation_id,e.target,e.actor,e.action,e.revision,e.previous_hash]));
}
