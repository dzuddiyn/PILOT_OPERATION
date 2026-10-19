'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(__dirname+'/PilotOperationParityProvision.js','utf8');
let env='PILOT_OPERATION',tabs=new Map(),created=[],writes=0;
const headers=['source_key','queue_update_id'];
const book={getSheetByName:n=>tabs.get(n)||null,insertSheet:n=>{
  assert(!tabs.has(n));const tab={name:n,headers:[],rows:0};tabs.set(n,tab);created.push(n);return tab;
}};
const ctx={console,Error,Set,Array,String,JSON,
 bsePilotDigestAssertEnvironment_:()=>{if(env!=='PILOT_OPERATION')throw Error('WRONG_ENV')},
 bsePilotOperationReadOnlyBook_:()=>book,
 bsePilotOperationAuditRegistry_:()=>[['TEST_INVENTORY_EVENT',headers],['TEST_CLAIM_LOG',headers]],
 bseRuntimeSheetName_:n=>n.replace(/^TEST_/,'PILOT_'),
 bsePilotAuditSheetSnapshot_:(b,n,h)=>{
  const s=b.getSheetByName(n.replace(/^TEST_/,'PILOT_'));
  return s?{sheet:s.name,status:s.headers.join('|')===h.join('|')?'CURRENT':'STALE',row_count:s.rows}:{sheet:n.replace(/^TEST_/,'PILOT_'),status:'MISSING'};
 },
 bseEnsureAdditiveHeaders_:(s,h)=>{writes++;s.headers=h.slice()},
 SpreadsheetApp:{flush:()=>{}},
 LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})}
};vm.createContext(ctx);vm.runInContext(src,ctx);
assert.equal(ctx.inspectBsePilotOperationParitySchemaPlan().missing.length,2);
const first=ctx.provisionBsePilotOperationMissingSchemas();
assert.equal(first.status,'VERIFIED');assert.equal(first.created.length,2);assert.equal(writes,2);
const second=ctx.provisionBsePilotOperationMissingSchemas();assert.equal(second.created.length,0);assert.equal(writes,2);
tabs.get('PILOT_CLAIM_LOG').headers=['corrupt'];assert.throws(()=>ctx.provisionBsePilotOperationMissingSchemas(),/EXISTING_MISMATCH/);assert.equal(writes,2);
env='PILOT_TEST';assert.throws(()=>ctx.provisionBsePilotOperationMissingSchemas(),/WRONG_ENV/);
console.log('PILOT_PARITY_SCHEMA 5/5 PASS');
