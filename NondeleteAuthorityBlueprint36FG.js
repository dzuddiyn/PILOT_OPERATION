/** @OnlyCurrentDoc */
// Gate 36F synthetic provision blueprint: returns schema only, NEVER mutates Sheets.
function bseNondelete36FBlueprint_(){
 return {status:'PLAN_ONLY',provisioned:false,write_allowed:false,workbook_id:'1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY',
  tables:{
   approval:{name:'TEST_ONLY_NONDELETE_APPROVAL_AUTH',columns:['approval_id','event_id','approval_source_key','ledger_source_key','approval_hash','ledger_hash','actor_id','status','revision','issued_ms','expires_ms','nonce']},
   audit:{name:'TEST_ONLY_NONDELETE_APPROVAL_AUDIT',columns:['approval_id','revision','event_id','status','actor_id','nonce','previous_hash','entry_hash','timestamp_ms']}
  }};
}
function bseNondelete36GPreflight_(deps){
 const fail=s=>({status:s,ready_for_write:false});
 if(!deps||typeof deps.getWorkbookMetadata!=='function'||typeof deps.getAccessEvidence!=='function')return fail('DEPENDENCIES_MISSING');
 try{
  const wb=deps.getWorkbookMetadata(),acl=deps.getAccessEvidence();
  if(!wb||wb.id!=='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY')return fail('WRONG_WORKBOOK');
  if(!acl||acl.owner!=='dzuddiyn01@gmail.com')return fail('OWNER_MISMATCH');
  if(!Array.isArray(wb.tabs)||!['TEST_ONLY_NONDELETE_INTENT','TEST_ONLY_NONDELETE_LEDGER','TEST_ONLY_NONDELETE_EVIDENCE','TEST_ONLY_NONDELETE_RECEIPT'].every(n=>wb.tabs.includes(n)))return fail('TRANSACTION_TABS_MISSING');
  if(wb.tabs.includes('TEST_ONLY_NONDELETE_APPROVAL_AUTH')||wb.tabs.includes('TEST_ONLY_NONDELETE_APPROVAL_AUDIT'))return fail('RECONCILE_EXISTING_AUTHORITY');
  return fail('PROVISION_APPROVAL_REQUIRED');
 }catch(e){return fail('READ_FAILED');}
}
