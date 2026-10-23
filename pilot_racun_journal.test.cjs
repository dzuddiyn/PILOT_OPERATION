'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/PilotRacunJournal.js','utf8'),ctx);
const records=Array.from({length:10},(_,i)=>({source_key:'BSE-TG-756|Treatment_Event_Log|R'+String(i+1).padStart(2,'0'),value:i}));
const plan={reference:'BSE-TG-756',storage_mode:'UNLINKED_PILOT',requires_atomic_commit:true,production_write:false,records};
const mock=(failAt=0)=>{const state={rows:[],journal:null,appends:0};const adapter={lock:fn=>fn(),getJournal:()=>state.journal,createJournal:(_,x)=>{state.journal={...x};},readRows:()=>state.rows.map(r=>({...r})),appendRow:r=>{state.appends++;state.rows.push({...r});if(state.appends===failAt)throw Error('INJECTED_AFTER_WRITE');},setJournal:(_,status)=>{state.journal.status=status;},flush:()=>{}};return {state,adapter};};
test('10 records commit; repeat is idempotent',()=>{
 const x=mock();assert.equal(ctx.bsePilotRacunJournalCommit_(plan,x.adapter).count,10);
 assert.equal(x.state.journal.status,'COMMITTED');
 assert.equal(ctx.bsePilotRacunJournalCommit_(plan,x.adapter).count,10);
 assert.equal(x.state.appends,10);
});
test('after each partial append injection recovery converges without duplicates',()=>{
 for(let i=1;i<=10;i++){
  const x=mock(i);assert.throws(()=>ctx.bsePilotRacunJournalCommit_(plan,x.adapter),/RECOVERY_REQUIRED/);
  assert.equal(x.state.journal.status,'RECOVERY_REQUIRED');
  assert.equal(ctx.bsePilotRacunJournalCommit_(plan,x.adapter).status,'COMMITTED');
  assert.equal(x.state.rows.length,10);
  assert.equal(new Set(x.state.rows.map(r=>r.source_key)).size,10);
 }
});
test('revision conflict, orphan and unexpected rows fail closed',()=>{
 const x=mock();x.state.journal={fingerprint:'other',status:'PREPARED'};
 assert.throws(()=>ctx.bsePilotRacunJournalCommit_(plan,x.adapter),/REVISION_CONFLICT/);
 const y=mock();y.state.rows.push({...records[0]});
 assert.throws(()=>ctx.bsePilotRacunJournalCommit_(plan,y.adapter),/ORPHAN/);
 const z=mock();z.state.journal={fingerprint:JSON.stringify(records),status:'PREPARED'};z.state.rows.push({source_key:'unexpected'});
 assert.throws(()=>ctx.bsePilotRacunJournalCommit_(plan,z.adapter),/RECOVERY_REQUIRED/);
});
