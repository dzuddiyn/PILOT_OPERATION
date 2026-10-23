/** PILOT Racun approval requires proven source, callback binding and correctly provisioned bound Sheets. */
function bsePilotRacunAggregateEligibility_(result,book){
  if(typeof bseRuntimeEnvironmentName_!=='function'||bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')
    return {eligible:false,reason:'WRONG_ENVIRONMENT'};
  if(!result||result.production_write!==false||!Array.isArray(result.candidates)||result.candidates.length<2)
    return {eligible:false,reason:'NOT_MULTI_RACUN'};
  if(!result.candidates.every(c=>c&&c.target==='Treatment_Event_Log'))
    return {eligible:false,reason:'MIXED_TARGETS'};
  if(result.validation!=='PASS'||result.candidates.some(c=>c.validation!=='PASS'||(c.missing||[]).length))
    return {eligible:false,reason:'CANDIDATE_NOT_READY'};
  const required=[
    'bsePilotRacunTelegramAggregateCore_','bsePilotRacunExecuteApproval_',
    'bsePilotRacunApprovalReconcile_','bsePilotRacunFinalizeApproval_',
    'bsePilotRacunAtomicPlan_','bsePilotRacunSheetAdapter_',
    'bsePilotRacunApprovalSheetAdapter_','bsePilotRacunLockOwned_'
  ];
  if(required.some(name=>{
    switch(name){
      case 'bsePilotRacunTelegramAggregateCore_':return typeof bsePilotRacunTelegramAggregateCore_!=='function';
      case 'bsePilotRacunExecuteApproval_':return typeof bsePilotRacunExecuteApproval_!=='function';
      case 'bsePilotRacunApprovalReconcile_':return typeof bsePilotRacunApprovalReconcile_!=='function';
      case 'bsePilotRacunFinalizeApproval_':return typeof bsePilotRacunFinalizeApproval_!=='function';
      case 'bsePilotRacunAtomicPlan_':return typeof bsePilotRacunAtomicPlan_!=='function';
      case 'bsePilotRacunSheetAdapter_':return typeof bsePilotRacunSheetAdapter_!=='function';
      case 'bsePilotRacunApprovalSheetAdapter_':return typeof bsePilotRacunApprovalSheetAdapter_!=='function';
      case 'bsePilotRacunLockOwned_':return typeof bsePilotRacunLockOwned_!=='function';
      default:return true;
    }
  }))return {eligible:false,reason:'DURABLE_CALLBACK_NOT_BOUND'};
  if(!book||typeof book.getSheetByName!=='function')return {eligible:false,reason:'STORAGE_BOOK_UNBOUND'};
  try{
    const plan=bsePilotRacunAtomicPlan_(result,'BSE-TG-999999999999');
    if(plan.record_count!==result.candidates.length)throw Error('RACUN_PLAN_CARDINALITY');
    const adapter=bsePilotRacunSheetAdapter_(book);
    // Probes are READ-ONLY, but force both physical tabs and exact headers to exist.
    adapter.getJournal('BSE-TG-0');adapter.readRows('BSE-TG-0');
    bsePilotRacunApprovalSheetAdapter_(book,'BSE-TG-0|Treatment_Event_Log','READONLY01');
  }catch(error){return {eligible:false,reason:'STORAGE_UNVERIFIED_'+String(error&&error.message||'UNKNOWN').slice(0,72)};}
  return {eligible:true,reason:'DURABLE_READY',storage_mode:'UNLINKED_PILOT'};
}
