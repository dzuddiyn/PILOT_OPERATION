'use strict';
// Read-only recovery: never promote PREPARED or replay unknown writes.
function bseRoleReconcile_(request,api){
 const reply=(status,reason)=>({status,reason});
 if(!request||!api||typeof api.readLedger!=='function'||typeof api.readBarriers!=='function'||typeof api.validateLedger!=='function')return reply('UNVERIFIED','ADAPTER_MISSING');
 try {
  const events=api.readLedger(),barriers=api.readBarriers();
  if(!Array.isArray(events)||!Array.isArray(barriers))return reply('UNVERIFIED','AUTHORITY_UNAVAILABLE');
  const matches=events.filter(e=>e&&e.operation_id===request.operationId);
  if(matches.length>1)return reply('SOURCE_MISMATCH','DUPLICATE_OPERATION');
  if(matches.length===0)return reply('NOT_APPLIED','NO_LEDGER_EVENT');
  const e=matches[0];
  if(e.target!==request.target||e.actor!==request.actor||e.action!==request.action)return reply('REVISION_CONFLICT','OPERATION_MISMATCH');
  if(e.state==='PREPARED')return reply('WRITE_OUTCOME_UNKNOWN','PREPARED_MANUAL_HOLD');
  if(e.state!=='COMMITTED')return reply('SOURCE_MISMATCH','INVALID_STATE');
  if(!api.validateLedger(events,e.action==='REVOKE_ADMIN'?[]:barriers,e.target))return reply('UNVERIFIED','CHAIN_INVALID');
  if(e.action==='REVOKE_ADMIN'&&barriers.some(b=>b.target===e.target&&b.active===true))return reply('WRITE_OUTCOME_UNKNOWN','REVOKE_BARRIER_ACTIVE');
  return reply('ALREADY_APPLIED','COMMITTED_VALIDATED');
 }catch(_){return reply('UNVERIFIED','READ_FAILURE');}
}
