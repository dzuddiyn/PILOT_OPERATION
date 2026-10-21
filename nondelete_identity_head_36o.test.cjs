'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const src=fs.readFileSync(__dirname+'/NondeleteIdentityHead36O.js','utf8');
const id='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY';
function run(effective='dzuddiyn01@gmail.com',active='dzuddiyn01@gmail.com',book=id){
 const c={Session:{getEffectiveUser:()=>({getEmail:()=>effective}),getActiveUser:()=>({getEmail:()=>active})},SpreadsheetApp:{openById:()=>({getId:()=>book})}};
 vm.createContext(c);vm.runInContext(src,c);return c.bseNondelete36OLiveIdentityReadOnly_();
}
test('36O matching identities still do not authorize',()=>{const r=run();assert.equal(r.status,'IDENTITIES_MATCH_NOT_AUTHORIZED');assert.equal(r.identity_authorized,false);assert.equal(r.approval_issued,false);assert.equal(r.transaction_write,false)});
test('36O missing active identity denies',()=>assert.equal(run('dzuddiyn01@gmail.com','').status,'ACTIVE_USER_UNAVAILABLE'));
test('36O wrong effective account denies',()=>assert.equal(run('other@example.test').status,'EFFECTIVE_USER_MISMATCH'));
test('36O different active account denies',()=>assert.equal(run('dzuddiyn01@gmail.com','other@example.test').status,'ACTOR_DIFFERS'));
test('36O wrong workbook denies',()=>assert.equal(run(undefined,undefined,'other').status,'WRONG_WORKBOOK'));
test('36O runtime unavailable fails closed',()=>{const c={};vm.createContext(c);vm.runInContext(src,c);assert.equal(c.bseNondelete36OLiveIdentityReadOnly_().status,'RUNTIME_UNAVAILABLE')});
test('36O failing effective user call returns only stage',()=>{const c={Session:{getEffectiveUser:()=>{throw Error('secret-diagnostic')},getActiveUser:()=>({getEmail:()=>''})},SpreadsheetApp:{openById:()=>null}};vm.createContext(c);vm.runInContext(src,c);const x=c.bseNondelete36OLiveIdentityReadOnly_();assert.equal(x.diagnostic_stage,'EFFECTIVE_USER');assert.equal(x.status,'READ_ONLY_PROBE_FAILED');assert.equal(JSON.stringify(x).includes('secret-diagnostic'),false)});
test('36O failing active user call is isolated',()=>{const c={Session:{getEffectiveUser:()=>({getEmail:()=> 'dzuddiyn01@gmail.com'}),getActiveUser:()=>{throw Error('blocked')}},SpreadsheetApp:{openById:()=>null}};vm.createContext(c);vm.runInContext(src,c);assert.equal(c.bseNondelete36OLiveIdentityReadOnly_().diagnostic_stage,'ACTIVE_USER')});
test('36O denied workbook open reports only phase',()=>{const c={Session:{getEffectiveUser:()=>({getEmail:()=> 'dzuddiyn01@gmail.com'}),getActiveUser:()=>({getEmail:()=> 'dzuddiyn01@gmail.com'})},SpreadsheetApp:{openById:()=>{throw Error('scope deny')}}};vm.createContext(c);vm.runInContext(src,c);assert.equal(c.bseNondelete36OLiveIdentityReadOnly_().diagnostic_stage,'OPEN_TEST_ONLY_WORKBOOK')});
test('36O null workbook reports read-id failure',()=>{const c={Session:{getEffectiveUser:()=>({getEmail:()=> 'dzuddiyn01@gmail.com'}),getActiveUser:()=>({getEmail:()=> 'dzuddiyn01@gmail.com'})},SpreadsheetApp:{openById:()=>null}};vm.createContext(c);vm.runInContext(src,c);assert.equal(c.bseNondelete36OLiveIdentityReadOnly_().diagnostic_stage,'READ_WORKBOOK_ID')});
test('36O user email OAuth scope missing classifies safely',()=>{
 const c={Session:{getEffectiveUser:()=>({getEmail:()=>{throw Error('You do not have permission to call getEmail; https://www.googleapis.com/auth/userinfo.email required')}}),getActiveUser:()=>({getEmail:()=>''})},SpreadsheetApp:{openById:()=>null}};
 vm.createContext(c);vm.runInContext(src,c);
 const x=c.bseNondelete36OLiveIdentityReadOnly_();
 assert.equal(x.diagnostic_stage,'EFFECTIVE_EMAIL_READ');
 assert.equal(x.failure_category,'USERINFO_EMAIL_SCOPE');
 assert.equal(x.identity_authorized,false);
 assert.equal(JSON.stringify(x).includes('You do not have permission'),false);
});
