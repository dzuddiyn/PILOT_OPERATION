/** @OnlyCurrentDoc */
// 36O-36Q preflight-only orchestration; no Script HEAD deployment or Sheets writes.
function bseNondelete36OPrepare_(runtime){
 const fail=s=>({gate:'36O',status:s,head_write:false,identity_proven:false});
 if(!runtime||typeof runtime.probe!=='function')return fail('PROBE_UNBOUND');
 try {const x=runtime.probe();if(!x||x.status!=='READ_ONLY_IDENTITY_EVIDENCE')return fail('NO_LIVE_EVIDENCE');return fail('OWNER_ACTION_PROOF_REQUIRED');}
 catch(e){return fail('PROBE_FAILED')}
}
function bseNondelete36PPrepare_(auth){
 const fail=s=>({gate:'36P',status:s,issued:false});
 if(!auth||typeof auth.verifySession!=='function'||typeof auth.verifyExplicitDecision!=='function')return fail('AUTH_DEPENDENCIES_MISSING');
 try{
  if(auth.verifySession()!==true||auth.verifyExplicitDecision()!==true)return fail('AUTH_NOT_PROVEN');
  return fail('INDEPENDENT_ISSUER_NOT_INSTALLED');
 }catch(e){return fail('AUTH_FAILED')}
}
function bseNondelete36QPrepare_(deps,request){
 const fail=s=>({gate:'36Q',status:s,transaction_write:false});
 if(!request||request.workbook_id!=='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY'||request.environment!=='TEST_ONLY')return fail('SCOPE_DENIED');
 if(!deps||typeof deps.readApproval!=='function'||typeof deps.readAudit!=='function'||typeof deps.readTransaction!=='function')return fail('STORE_UNBOUND');
 try{
  const approval=deps.readApproval(),audit=deps.readAudit(),txn=deps.readTransaction();
  if(!approval||!Array.isArray(audit)||!txn)return fail('INCOMPLETE_READ');
  return fail('ATOMIC_WRITER_APPROVAL_REQUIRED');
 }catch(e){return fail('READ_FAILED')}
}
