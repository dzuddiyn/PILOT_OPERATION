'use strict';
// Isolated, adapter-injected candidate. Not connected to live runtime.
function bseRoleTransaction_(request,api){
  const reply=(status,revision)=>revision===undefined?{status}:{status,revision};
  if(!request||!api||!['GRANT_ADMIN','REVOKE_ADMIN'].includes(request.action))return reply('DENIED');
  if(!api.isOwnerPrivate?.(request.actor,request.chat)||!api.confirmed?.(request))return reply('DENIED');
  if(!/^[0-9]+$/.test(String(request.target||''))||typeof request.operationId!=='string'||!request.operationId)return reply('DENIED');
  const lock=api.lock?.();if(!lock||!lock.tryLock(1000))return reply('BUSY');
  try {
    if(api.registration(request.target)!=='REGISTERED_ACTIVE')return reply('DENIED');
    let events=api.readLedger(),barriers=api.readBarriers();
    if(!Array.isArray(events)||!Array.isArray(barriers))return reply('UNVERIFIED');
    const mine=events.filter(e=>e.operation_id===request.operationId);
    if(mine.length>1)return reply('SOURCE_MISMATCH');
    if(mine.length===1){
      const e=mine[0];
      if(e.target!==request.target||e.actor!==request.actor||e.action!==request.action||
         e.event_id!=='role-'+request.operationId||e.digest!==api.hashEvent(e)||
         request.expectedRevision!==undefined&&e.revision-1!==request.expectedRevision)return reply('REVISION_CONFLICT');
      if(e.state==='COMMITTED'){
        if(!api.validateLedger(events,request.action==='REVOKE_ADMIN'?[]:barriers,request.target))return reply('UNVERIFIED');
        if(request.action==='REVOKE_ADMIN'){
          if(barriers.some(b=>b.operation_id===request.operationId&&b.active===true)){
            api.closeBarrier(request.operationId);api.flush();barriers=api.readBarriers();
            if(barriers.some(b=>b.operation_id===request.operationId&&b.active!==false))return reply('WRITE_OUTCOME_UNKNOWN');
          }
        }
        if(typeof bseRolePostCommit_==='function')bseRolePostCommit_(request,api);
        return reply('ALREADY_APPLIED',e.revision);
      }
      // PREPARED is never silently promoted: manual investigation until provably safe resume.
      return reply(e.state==='PREPARED'?'WRITE_OUTCOME_UNKNOWN':'SOURCE_MISMATCH');
    }
    if(!api.validateLedger(events,barriers,request.target))return reply('SOURCE_MISMATCH');
    const history=events.filter(e=>e.target===request.target),last=history.at(-1);
    const revision=last?last.revision+1:1;
    if(request.expectedRevision!==undefined&&request.expectedRevision!==revision-1)return reply('REVISION_CONFLICT');
    if(request.action==='REVOKE_ADMIN'){
      // Deny-only barrier must be durable before any ledger revoke write.
      const existing=barriers.filter(b=>b.operation_id===request.operationId);
      if(existing.length>1||existing.some(b=>b.target!==request.target||b.owner!==request.actor))return reply('SOURCE_MISMATCH');
      if(existing.length===0){api.appendBarrier({target:request.target,operation_id:request.operationId,active:true,owner:request.actor});api.flush();}
      barriers=api.readBarriers();
      if(barriers.filter(b=>b.operation_id===request.operationId&&b.active===true).length!==1)return reply('WRITE_OUTCOME_UNKNOWN');
    }
    const event={event_id:'role-'+request.operationId,operation_id:request.operationId,target:request.target,actor:request.actor,action:request.action,revision,previous_hash:last?last.digest:'',state:'PREPARED'};
    event.digest=api.hashEvent(event);
    api.appendEvent(event);api.flush();events=api.readLedger();
    if(events.filter(e=>e.operation_id===request.operationId).length!==1||!api.sameEvent(events.find(e=>e.operation_id===request.operationId),event))return reply('WRITE_OUTCOME_UNKNOWN');
    api.commitEvent(request.operationId);api.flush();events=api.readLedger();
    // REVOKE: active barrier is intentional during ledger proof; verify chain with barrier omitted ONLY for chain evaluation.
    if(!api.validateLedger(events,request.action==='REVOKE_ADMIN'?[]:barriers,request.target)||
      events.find(e=>e.operation_id===request.operationId)?.state!=='COMMITTED')return reply('WRITE_OUTCOME_UNKNOWN');
    if(request.action==='REVOKE_ADMIN'){
      api.closeBarrier(request.operationId);api.flush();barriers=api.readBarriers();
      if(barriers.some(b=>b.operation_id===request.operationId&&b.active!==false))return reply('WRITE_OUTCOME_UNKNOWN');
    }
    if(typeof bseRolePostCommit_==='function')bseRolePostCommit_(request,api);
    return reply('APPLIED_VERIFIED',revision);
  }catch(_){return reply('WRITE_OUTCOME_UNKNOWN');}
  finally{lock.releaseLock();}
}
