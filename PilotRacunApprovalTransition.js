/** PILOT Racun durable approval reconciliation. Caller supplies authenticated, locked adapter. */
function bsePilotRacunFinalizeApproval_(plan,ledger,approvalAdapter,proof){
  if(typeof bseRuntimeEnvironmentName_!=='function'||bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')throw Error('RACUN_APPROVAL_WRONG_ENV');
  if(!proof||proof.authorized!==true||proof.hash_verified!==true||
     proof.reference!==plan.reference)throw Error('RACUN_APPROVAL_UNAUTHORIZED');
  if(!approvalAdapter||typeof approvalAdapter.get!=='function'||typeof approvalAdapter.set!=='function')throw Error('RACUN_APPROVAL_ADAPTER_MISSING');
  const verified=bsePilotRacunApprovalReconcile_(plan,ledger,proof);
  if(verified.status!=='LEDGER_VERIFIED')return {status:'RECOVERY_REQUIRED',approval_write:false};
  const before=approvalAdapter.get(plan.reference);
  if(!before||before.hash!==proof.approval_hash)throw Error('RACUN_APPROVAL_HASH_CONFLICT');
  if(before.status==='REPORTER_CONFIRMED')return {status:'ALREADY_CONFIRMED',approval_write:false};
  if(before.status!=='OPEN'&&before.status!=='COMMIT_PENDING')throw Error('RACUN_APPROVAL_STATE_CONFLICT');
  // Recoverable transition. Never record confirmation before journal read-back.
  approvalAdapter.set(plan.reference,'REPORTER_CONFIRMED');
  const after=approvalAdapter.get(plan.reference);
  if(!after||after.status!=='REPORTER_CONFIRMED'||after.hash!==proof.approval_hash)
    throw Error('RACUN_APPROVAL_READBACK_UNKNOWN');
  return {status:'REPORTER_CONFIRMED',record_count:verified.record_count,approval_write:true,production_write:false};
}
