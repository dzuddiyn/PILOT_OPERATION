/** @OnlyCurrentDoc */
// Gate 36O diagnostic: read-only identity probe, redacted phase codes only.
// No approval issuance, Sheets mutation, external messaging or secret logging.
function bseNondelete36OLiveIdentityReadOnly_(){
 const result=(status,stage)=>({status,diagnostic_stage:stage,identity_authorized:false,approval_issued:false,transaction_write:false});
 let stage='ENVIRONMENT';
 try{
  if(typeof Session==='undefined'||typeof SpreadsheetApp==='undefined')return result('RUNTIME_UNAVAILABLE',stage);
  stage='EFFECTIVE_USER';
  const effectiveUser=Session.getEffectiveUser();
  stage='EFFECTIVE_EMAIL_READ';
  const effective=effectiveUser.getEmail();
  stage='ACTIVE_USER';
  const active=Session.getActiveUser().getEmail();
  stage='OPEN_TEST_ONLY_WORKBOOK';
  const book=SpreadsheetApp.openById('1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY');
  stage='READ_WORKBOOK_ID';
  const id=book.getId();
  stage='SCOPE_CHECK';
  if(id!=='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY')return result('WRONG_WORKBOOK',stage);
  stage='IDENTITY_CHECK';
  if(effective!=='dzuddiyn01@gmail.com')return result('EFFECTIVE_USER_MISMATCH',stage);
  if(!active)return result('ACTIVE_USER_UNAVAILABLE',stage);
  return result(active===effective?'IDENTITIES_MATCH_NOT_AUTHORIZED':'ACTOR_DIFFERS',stage);
 }catch(e){
  // Do not print exception messages, user email or access tokens.
  const message=String(e&&e.message||'');
  const category=message.includes('https://www.googleapis.com/auth/userinfo.email')?'USERINFO_EMAIL_SCOPE':
    /permission|authoriz|scope|izin|otorisasi/i.test(message)?'AUTHORIZATION_OR_SCOPE':'UNCLASSIFIED';
  return Object.assign(result('READ_ONLY_PROBE_FAILED',stage),{failure_category:category});
 }
}
function runBseNondelete36OIdentityReadOnly(){
 const result=bseNondelete36OLiveIdentityReadOnly_();
 console.log('TEST_ONLY_36O_IDENTITY_RESULT '+JSON.stringify(result));
 return result;
}
