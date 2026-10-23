'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const ctx={Map,JSON,Error};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/PilotRacunApprovalReconcile.js','utf8'),ctx);
const records=[{source_key:'BSE-TG-1|Treatment_Event_Log|R01',qty:20},{source_key:'BSE-TG-1|Treatment_Event_Log|R02',qty:30}];
const plan={reference:'BSE-TG-1',record_count:2,storage_mode:'UNLINKED_PILOT',records};
const auth={hash_verified:true,authorized:true,reference:'BSE-TG-1'};
const mk=(status='COMMITTED',data=records)=>({getJournal:()=>({status,fingerprint:JSON.stringify(records),count:2}),readRows:()=>data});
test('complete ledger independently read back; approval remains pending',()=>{
 const x=ctx.bsePilotRacunApprovalReconcile_(plan,mk(),auth);assert.equal(x.status,'LEDGER_VERIFIED');assert.equal(x.approval_write,false);
});
test('missing, duplicate, uncertain journal and unauthorized fail closed',()=>{
 assert.equal(ctx.bsePilotRacunApprovalReconcile_(plan,mk('RECOVERY_REQUIRED'),auth).status,'RECOVERY_REQUIRED');
 assert.equal(ctx.bsePilotRacunApprovalReconcile_(plan,mk('COMMITTED',[records[0]]),auth).status,'RECOVERY_REQUIRED');
 assert.throws(()=>ctx.bsePilotRacunApprovalReconcile_(plan,mk('COMMITTED',[...records,records[0]]),auth),/DUPLICATE/);
 assert.throws(()=>ctx.bsePilotRacunApprovalReconcile_(plan,mk(),{...auth,authorized:false}),/NOT_AUTHORIZED/);
});
