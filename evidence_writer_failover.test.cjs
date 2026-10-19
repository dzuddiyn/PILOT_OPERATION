'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/TelegramEvidenceTest.js','utf8');
function extract(name){const p=source.indexOf('function '+name+'(');assert(p>=0);let start=source.indexOf('{',p),depth=0;for(let i=start;i<source.length;i++){if(source[i]==='{')depth++;if(source[i]==='}'&&--depth===0)return source.slice(p,i+1)}throw Error(name)}
let created=0,failDownload=false,failCreate=false;
const ctx={console,bseRuntimeEnvironmentName_:()=> 'PILOT_TEST',
 PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'FIXTURE_TOKEN_NOT_REAL'})},
 bseTelegramApi_:(m)=>({file_path:'fixture.jpg'}),
 UrlFetchApp:{fetch:()=>{if(failDownload)throw Error('disconnected');return {getResponseCode:()=>200,getBlob:()=>({setName:()=>({synthetic:true})})}}},
 bseTelegramEvidenceDriveFolder_:()=>({createFile:()=>{if(failCreate)throw Error('Drive unavailable');created++;return {getId:()=> 'MOCK-'+created}}})
};vm.createContext(ctx);vm.runInContext(extract('bseTelegramEvidenceStoreDrive_'),ctx);
let passed=0;function check(n,fn){fn();passed++;console.log('PASS '+n)}
const row=Array(23).fill('');row[9]='FAKE_TELEGRAM_FILE';row[12]='fictional.jpg';
check('failed Telegram download cannot write Drive',()=>{failDownload=true;assert.throws(()=>ctx.bseTelegramEvidenceStoreDrive_({},row),/Muat turun evidence Telegram gagal/);assert.equal(created,0);failDownload=false});
check('Drive unavailable cannot claim file ID',()=>{failCreate=true;assert.throws(()=>ctx.bseTelegramEvidenceStoreDrive_({},row),/Drive unavailable/);assert.equal(created,0);failCreate=false});
check('success produces file ID',()=>assert.equal(ctx.bseTelegramEvidenceStoreDrive_({},row),'MOCK-1'));
const first=created;const retried=ctx.bseTelegramEvidenceStoreDrive_({},row);
check('PARTIAL_WRITE_RISK: retry after metadata failure creates second file',()=>{assert.equal(first,1);assert.equal(retried,'MOCK-2');assert.equal(created,2)});
check('writer lacks reconciliation by evidence id or prior drive file id',()=>{const s=extract('bseTelegramEvidenceStoreDrive_');assert(!s.includes('row[19]'));assert(!s.includes('getFilesByName'));assert(!s.includes('getFileById'))});
console.log('EVIDENCE_WRITER_FAILOVER '+passed+'/'+passed+' scenarios characterized; PARTIAL_WRITE_RISK CONFIRMED (not SAFE PASS)');
