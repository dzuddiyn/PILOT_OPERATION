/** Racun review orchestration; caller owns outer callback authentication and lock. */
function bsePilotRacunExecuteApproval_(input,book){
  if(!input||input.authorized!==true||input.hash_verified!==true||input.action!=='A')
    throw Error('RACUN_EXECUTE_UNAUTHORIZED');
  if(!input.source_key||input.source_key!==input.reference+'|Treatment_Event_Log')
    throw Error('RACUN_EXECUTE_SOURCE_CONFLICT');
  const rows=bsePilotRacunSheetAdapter_(book);
  const approval=bsePilotRacunApprovalSheetAdapter_(book,input.source_key,input.callback_token);
  const current=approval.get(input.reference);
  if(current.hash!==input.approval_hash||!['OPEN','COMMIT_PENDING','REPORTER_CONFIRMED'].includes(current.status))
    throw Error('RACUN_EXECUTE_APPROVAL_CONFLICT');
  const plan=bsePilotRacunAtomicPlan_(input.proposal,input.reference);
  if(current.status!=='REPORTER_CONFIRMED'){
    bsePilotRacunCommitConfirmed_({...input,approval_state:'OPEN'},rows);
  }
  return bsePilotRacunFinalizeApproval_(plan,rows,approval,{
    reference:input.reference,authorized:true,hash_verified:true,approval_hash:input.approval_hash
  });
}
