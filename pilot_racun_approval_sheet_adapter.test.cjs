'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const source=fs.readFileSync(__dirname+'/TelegramApprovalUiTest.js','utf8');
const match=source.match(/const BSE_APPROVAL_UI_HEADERS=(\[[^;]+\]);/);
assert(match);
const heads=vm.runInNewContext(match[1]),record=Array(heads.length).fill('');
record[0]='BSE-TG-100';record[1]='BSE-TG-100|Treatment_Event_Log';record[2]='sha';record[10]='ABCDEF123456';record[17]='OPEN';
const data=[heads,record];
const sheet={getLastRow:()=>data.length,getRange:(r,c,n=1,w=1)=>({getValues:()=>data.slice(r-1,r-1+n).map(v=>v.slice(c-1,c-1+w)),setValue:x=>{data[r-1][c-1]=x;}})};
const ctx={JSON,String,Error,SpreadsheetApp:{flush:()=>{}},BSE_APPROVAL_UI_HEADERS:heads,bseRuntimeEnvironmentName_:()=>ctx.env,env:'PILOT_OPERATION'};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/PilotRacunApprovalSheetAdapter.js','utf8'),ctx);
const book={getSheetByName:()=>sheet};
test('real schema-shaped approval adapter reads and writes back exactly one status',()=>{
 const a=ctx.bsePilotRacunApprovalSheetAdapter_(book,'BSE-TG-100|Treatment_Event_Log','ABCDEF123456');
 assert.equal(a.get('BSE-TG-100').status,'OPEN');
 a.set('BSE-TG-100','REPORTER_CONFIRMED');
 assert.equal(a.get('BSE-TG-100').status,'REPORTER_CONFIRMED');
});
test('wrong token and non PILOT and invalid state fail closed',()=>{
 assert.throws(()=>ctx.bsePilotRacunApprovalSheetAdapter_(book,'BSE-TG-100|Treatment_Event_Log','BADTOKEN').get('BSE-TG-100'),/TOKEN_CONFLICT/);
 ctx.env='PILOT_TEST';assert.throws(()=>ctx.bsePilotRacunApprovalSheetAdapter_(book,'BSE-TG-100|Treatment_Event_Log','ABCDEF123456'),/WRONG_ENV/);
});
