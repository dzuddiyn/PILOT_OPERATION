/** Racun aggregate review gate: no approval unless all candidates and storage are ready. */
function bsePilotRacunAggregateEligibility_(result){
  if(typeof bseRuntimeEnvironmentName_!=='function'||bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')
    return {eligible:false,reason:'WRONG_ENVIRONMENT'};
  if(!result||result.production_write!==false||!Array.isArray(result.candidates)||result.candidates.length<2)
    return {eligible:false,reason:'NOT_MULTI_RACUN'};
  if(!result.candidates.every(c=>c&&c.target==='Treatment_Event_Log'))
    return {eligible:false,reason:'MIXED_TARGETS'};
  if(result.validation!=='PASS'||result.candidates.some(c=>c.validation!=='PASS'||(c.missing||[]).length))
    return {eligible:false,reason:'CANDIDATE_NOT_READY'};
  // A single Telegram callback must never precede verified runtime journal provisioning.
  return {eligible:false,reason:'DURABLE_CALLBACK_NOT_BOUND'};
}
