'use strict';
// Isolated candidate transaction engine. No runtime adapters are wired.
function bseRoleTransaction_(request,api){
  const fail=status=>({status});
  if(!request||!api||!['GRANT_ADMIN','REVOKE_ADMIN'].includes(request.action))return fail('DENIED');
  if(!api.isOwnerPrivate?.(request.actor,request.chat)||!api.confirmed?.(request))return fail('DENIED');
  if(!/^[0-9]+$/.test(String(request.target||''))||typeof request.operationId!=='string'||!request.operationId)return fail('DENIED');
  const lock=api.lock?.();
  if(!lock||!lock.tryLock(1000))return fail('BUSY');
  try{
    if(api.registration(request.target)!=='REGISTERED_ACTIVE')return fail('DENIED');
    let events=api.readLedger(),barriers=api.readBarriers();
    if(!Array.isArray(events)||!Array.isArray(barriers))return fail('UNVERIFIED');
    const duplicates=events.filter(e=>e.operation_id===request.operationId);
    if(duplicates.length>1)return fail('SOURCE_MISMATCH');
    if(duplicates.length===1){
      const e=duplicates[0];
      if(e.target!==request.target||e.action!==request.action)return fail('REVISION_CONFLICT');
      return fail(e.state==='COMMITTED'&&api.validateLedger(events,barriers,request.target)?'ALREADY_APPLIED':'WRITE_OUTCOME_UNKNOWN');
    }
    if(!api.validateLedger(events,barriers,request.target))return fail('SOURCE_MISMATCH');
    const history=events.filter(e=>e.target===request.target),last=history.at(-1);
    const revision=last?last.revision+1:1;
    if(request.expectedRevision!==undefined&&request.expectedRevision!==revision-1)return fail('REVISION_CONFLICT');
    if(request.action==='REVOKE_ADMIN'){
      api.appendBarrier({target:request.target,operation_id:request.operationId,active:true,owner:request.actor});
      api.flush();
      barriers=api.readBarriers();
      if(!barriers.some(b=>b.target===request.target&&b.operation_id===request.operationId&&b.active===true))return fail('WRITE_OUTCOME_UNKNOWN');
    }
    const event={event_id:'role-'+request.operationId,operation_id:request.operationId,target:request.target,actor:request.actor,action:request.action,revision,previous_hash:last?last.digest:'',state:'PREPARED'};
    event.digest=api.hashEvent(event);
    api.appendEvent(event);api.flush();
    events=api.readLedger();
    if(events.filter(e=>e.operation_id===request.operationId).length!==1||!api.sameEvent(events.find(e=>e.operation_id===request.operationId),event))return fail('WRITE_OUTCOME_UNKNOWN');
    api.commitEvent(request.operationId);api.flush();
    events=api.readLedger();
    if(!api.validateLedger(events,request.action==='REVOKE_ADMIN'?[]:barriers,request.target)||events.find(e=>e.operation_id===request.operationId)?.state!=='COMMITTED')return fail('WRITE_OUTCOME_UNKNOWN');
    if(request.action==='REVOKE_ADMIN'){
      api.closeBarrier(request.operationId);api.flush();
      barriers=api.readBarriers();
      if(barriers.some(b=>b.operation_id===request.operationId&&b.active!==false))return fail('WRITE_OUTCOME_UNKNOWN');
    }
    return {status:'APPLIED_VERIFIED',revision};
  }catch(_){return fail('WRITE_OUTCOME_UNKNOWN');}
  finally{lock.releaseLock();}
}
