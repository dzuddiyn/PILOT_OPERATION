/** @OnlyCurrentDoc */
// Gate 36C: synthetic append-only transition log. No live storage, identity or transaction writer.
function bseAudit36C_(store,approvalId,next,options){
 const out=status=>({status,write_allowed:false});
 if(!store||typeof store.read!=='function'||typeof store.append!=='function'||!options||!options.lock)
 return out('DEPENDENCIES_MISSING');
 if(!options.lock.tryLock(1000))return out('LOCK_BUSY');
 try{
  const rows=store.read(approvalId);
  if(!Array.isArray(rows))return out('AUDIT_READ_UNKNOWN');
  for(let i=0;i<rows.length;i++){
   const row=rows[i];
   if(row.approval_id!==approvalId||row.revision!==i+1||row.nonce!==rows[0].nonce)
    return out('AUDIT_CORRUPT');
  }
  const last=rows[rows.length-1];
  if(!last||!next||next.approval_id!==approvalId)return out('IDENTITY_CONFLICT');
  const keys=['nonce','event_id','approval_hash','ledger_hash'];
  if(keys.some(k=>next[k]!==last[k]))return out('IDENTITY_CONFLICT');
  if(next.revision===last.revision&&next.status===last.status)
   return out('ALREADY_APPLIED');
  const contract=bseAuthority36BTransition_(last,next);
  if(contract.status!=='VALID_TRANSITION_HOLD')return out(contract.status);
  store.append({...next});
  const verified=store.read(approvalId);
  if(!Array.isArray(verified)||verified.length!==rows.length+1||
    verified[verified.length-1].revision!==next.revision||
    verified[verified.length-1].status!==next.status)return out('WRITE_OUTCOME_UNKNOWN');
  return out('APPENDED_SYNTHETIC_HOLD');
 }catch(e){return out('WRITE_OUTCOME_UNKNOWN');}
 finally{options.lock.releaseLock();}
}
