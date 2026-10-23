/** PILOT Racun: pure callback-to-journal coordinator; no Telegram side effects.
 * Caller must independently authenticate callback, verify proposal hash and lock approval.
 * Never marks reporter confirmed before durable read-back.
 */
function bsePilotRacunCommitConfirmed_(input,adapter){
  if(typeof bseRuntimeEnvironmentName_!=='function'||bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')
    throw Error('RACUN_WRONG_ENVIRONMENT');
  if(!input||input.action!=='A'||input.authorized!==true||input.hash_verified!==true||
      input.approval_state!=='OPEN'||!/^BSE-TG-\d+$/.test(String(input.reference||'')))
    throw Error('RACUN_CALLBACK_NOT_AUTHORIZED');
  if(!input.proposal||input.proposal.production_write!==false||
      !Array.isArray(input.proposal.candidates)||input.proposal.candidates.length<2||
      !input.proposal.candidates.every(c=>c&&c.target==='Treatment_Event_Log'))
    throw Error('RACUN_NOT_AGGREGATE');
  const plan=bsePilotRacunAtomicPlan_(input.proposal,input.reference);
  if(plan.records.length!==input.proposal.candidates.length)throw Error('RACUN_PLAN_MISMATCH');
  const outcome=bsePilotRacunJournalCommit_(plan,adapter);
  if(outcome.status!=='COMMITTED'||outcome.count!==plan.record_count)
    throw Error('RACUN_COMMIT_NOT_VERIFIED');
  // Approval state is deliberately not mutated here. Caller must reconcile independently.
  return {status:'LEDGER_COMMITTED_APPROVAL_PENDING',reference:plan.reference,count:outcome.count,
    production_write:false,official_bse_write:false};
}
