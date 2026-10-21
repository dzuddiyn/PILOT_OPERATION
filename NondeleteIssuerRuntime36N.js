/** @OnlyCurrentDoc */
// Gate 36N: read-only binding probe; never authenticates a transaction or issues approval.
function bseNondelete36NProbe_(services, expected){
 const deny=(status,extra)=>Object.assign({status,identity_bound:false,approval_issued:false,live_write:false},extra||{});
 if(!services||typeof services.getEffectiveEmail!=='function'||typeof services.getActiveEmail!=='function'||typeof services.getWorkbookId!=='function')return deny('RUNTIME_UNBOUND');
 try{
  const owner=services.getEffectiveEmail(),active=services.getActiveEmail(),book=services.getWorkbookId();
  if(book!=='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY')return deny('WORKBOOK_MISMATCH');
  if(owner!=='dzuddiyn01@gmail.com')return deny('EXECUTOR_UNVERIFIED');
  if(!active||active!==owner)return deny('ACTOR_UNVERIFIED');
  // Identity consistency alone cannot prove explicit approval or a separate authenticated action.
  if(!expected||expected.explicit_user_action_proof!==true)return deny('ACTION_PROOF_MISSING');
  return deny('TRUSTED_ISSUER_NOT_BOUND');
 }catch(e){return deny('RUNTIME_READ_FAILED')}
}
