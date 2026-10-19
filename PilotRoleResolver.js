'use strict';
// M2 pure dependency-injected, fail-closed resolver. NOT wired to Apps Script.
function bseRoleResolve_(actorId,capability,adapters){
  const deny=reason=>({allowed:false,role:'UNVERIFIED',reason});
  if(!/^\d+$/.test(String(actorId||'')))return deny('INVALID_ACTOR');
  if(!adapters||typeof adapters.readBootstrapOwner!=='function'||typeof adapters.readRegistration!=='function'||typeof adapters.readLedger!=='function'||typeof adapters.readBarriers!=='function'||typeof adapters.sha256!=='function')return deny('ADAPTER_MISSING');
  try{
    const owner=adapters.readBootstrapOwner();
    if(!owner||!/^\d+$/.test(String(owner.user_id||''))||owner.verified!==true)return deny('BOOTSTRAP_UNVERIFIED');
    if(String(actorId)===String(owner.user_id)){
      return {allowed:bseRoleCapabilityAllowed_('OWNER',capability),role:'OWNER',reason:'',revision:null};
    }
    const registration=adapters.readRegistration(String(actorId));
    if(registration!=='REGISTERED_ACTIVE')return deny('NOT_REGISTERED_ACTIVE');
    const ledger=adapters.readLedger(),barriers=adapters.readBarriers();
    if(!Array.isArray(ledger)||!Array.isArray(barriers))return deny('AUTHORITY_UNAVAILABLE');
    // Corrupt or unvalidated barrier cannot be ignored to regain access.
    for(const b of barriers){
      if(!b||!/^\d+$/.test(String(b.target||''))||typeof b.active!=='boolean')return deny('BARRIER_UNVERIFIED');
      if(String(b.target)===String(actorId)&&b.active)return deny('REVOKE_BARRIER');
    }
    const ids=new Set(),operations=new Set();let revision=0,prev='',role='REGISTERED_ACTIVE';
    for(const e of ledger){
      if(!e||!/^\d+$/.test(String(e.target||'')))return deny('SOURCE_MISMATCH');
      if(String(e.target)!==String(actorId))continue;
      if(typeof e.event_id!=='string'||!e.event_id||typeof e.operation_id!=='string'||!e.operation_id||ids.has(e.event_id)||operations.has(e.operation_id)||e.revision!==revision+1||e.previous_hash!==prev||
        e.actor!==String(owner.user_id)||!['GRANT_ADMIN','REVOKE_ADMIN'].includes(e.action)||
        e.digest!==bseRoleEventDigest_(e,adapters.sha256))return deny('SOURCE_MISMATCH');
      ids.add(e.event_id);operations.add(e.operation_id);
      // Uncommitted rows may be physically present, but must never confer privilege.
      if(e.state!=='COMMITTED')return deny('UNCOMMITTED_OR_CORRUPT');
      revision=e.revision;prev=e.digest;role=e.action==='GRANT_ADMIN'?'ADMIN':'REGISTERED_ACTIVE';
    }
    return {allowed:bseRoleCapabilityAllowed_(role,capability),role,reason:'',revision};
  }catch(_){return deny('AUTHORITY_READ_FAILED');}
}
