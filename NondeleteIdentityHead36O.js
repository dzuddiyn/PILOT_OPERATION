/** @OnlyCurrentDoc */
// 36O candidate: TEST_ONLY READ-ONLY Apps Script Session diagnostic.
// No approval issuance, no Sheet mutation and no external messaging.
function bseNondelete36OLiveIdentityReadOnly_(){
 const result=(status,details)=>Object.assign({status,identity_authorized:false,approval_issued:false,transaction_write:false},details||{});
 try{
  if(typeof Session==='undefined'||typeof SpreadsheetApp==='undefined')return result('RUNTIME_UNAVAILABLE');
  const effective=Session.getEffectiveUser().getEmail();
  const active=Session.getActiveUser().getEmail();
  // Standalone script: active spreadsheet may be null; open the exact TEST_ONLY workbook for read-only identity binding.
  const id=SpreadsheetApp.openById('1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY').getId();
  if(id!=='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY')return result('WRONG_WORKBOOK');
  // Return only booleans; never print addresses or credentials.
  if(effective!=='dzuddiyn01@gmail.com')return result('EFFECTIVE_USER_MISMATCH');
  if(!active)return result('ACTIVE_USER_UNAVAILABLE');
  return result(active===effective?'IDENTITIES_MATCH_NOT_AUTHORIZED':'ACTOR_DIFFERS');
 }catch(e){return result('READ_ONLY_PROBE_FAILED')}
}

// Editor-only read-only entrypoint; delegates to the guarded identity probe.
function runBseNondelete36OIdentityReadOnly(){
 const result=bseNondelete36OLiveIdentityReadOnly_();
 console.log('TEST_ONLY_36O_IDENTITY_RESULT '+JSON.stringify(result));
 return result;
}
