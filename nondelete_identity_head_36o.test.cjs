'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const src=fs.readFileSync(__dirname+'/NondeleteIdentityHead36O.js','utf8');
const id='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY';
function run(effective='dzuddiyn01@gmail.com',active='dzuddiyn01@gmail.com',book=id){
 const c={Session:{getEffectiveUser:()=>({getEmail:()=>effective}),getActiveUser:()=>({getEmail:()=>active})},SpreadsheetApp:{getActiveSpreadsheet:()=>({getId:()=>book})}};
 vm.createContext(c);vm.runInContext(src,c);return c.bseNondelete36OLiveIdentityReadOnly_();
}
test('36O matching identities still do not authorize',()=>{const r=run();assert.equal(r.status,'IDENTITIES_MATCH_NOT_AUTHORIZED');assert.equal(r.identity_authorized,false);assert.equal(r.approval_issued,false);assert.equal(r.transaction_write,false)});
test('36O missing active identity denies',()=>assert.equal(run('dzuddiyn01@gmail.com','').status,'ACTIVE_USER_UNAVAILABLE'));
test('36O wrong effective account denies',()=>assert.equal(run('other@example.test').status,'EFFECTIVE_USER_MISMATCH'));
test('36O different active account denies',()=>assert.equal(run('dzuddiyn01@gmail.com','other@example.test').status,'ACTOR_DIFFERS'));
test('36O wrong workbook denies',()=>assert.equal(run(undefined,undefined,'other').status,'WRONG_WORKBOOK'));
test('36O runtime unavailable fails closed',()=>{const c={};vm.createContext(c);vm.runInContext(src,c);assert.equal(c.bseNondelete36OLiveIdentityReadOnly_().status,'RUNTIME_UNAVAILABLE')});
