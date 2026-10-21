/** @OnlyCurrentDoc */
// 36K synthetic issuer, not callable Apps Script entrypoint. Runtime credentials are NOT bound.
function bseNondelete36KIssue_(d,x){
 const out=status=>({status,issued:false,live_write:false});
 if(!d||typeof d.verifyActor!=='function'||typeof d.randomId!=='function'||typeof d.appendAudit!=='function'||!d.lock)return out('ISSUER_UNBOUND');
 if(!x||x.environment!=='TEST_ONLY'||x.workbook_id!=='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY'||!/^TEST_ONLY_36_[A-Z0-9_]+$/.test(String(x.event_id||'')))return out('SCOPE_DENIED');
 if(!d.lock.tryLock(1000))return out('LOCK_BUSY');
 try{
  const a=d.verifyActor();
  if(!a||a.status!=='VERIFIED'||a.actor_id!=='TEST_ONLY_OWNER_36B'||a.user_action_verified!==true)return out('ACTOR_UNVERIFIED');
  if(x.explicit_decision!=='APPROVE'||x.approval_hash?.length!==64||x.ledger_hash?.length!==64)return out('APPROVAL_INVALID');
  // Do NOT mint real approvals until trusted identity, secure randomness and append-only store exist.
  return out('ISSUER_RUNTIME_HOLD');
 }catch(e){return out('ISSUER_ERROR_HOLD')}finally{d.lock.releaseLock()}
}
function bseNondelete36LReview_(issuer,request){
 const x=bseNondelete36KIssue_(issuer,request);
 return {status:x.status,approval_granted:false,transaction_allowed:false};
}
function bseNondelete36MReady_(){
 return {status:'SCRIPT_HEAD_APPROVAL_REQUIRED',trusted_identity:false,real_issuer_installed:false,script_head_updated:false,live_transaction:false};
}
