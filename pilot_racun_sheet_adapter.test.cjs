'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const tables={
 PILOT_RACUN_TX_JOURNAL:[['reference','fingerprint','status','record_count','updated_at']],
 PILOT_RACUN_TX_ROWS:[['source_key','reference','payload_json','updated_at']]
};
let failAt=0,appends=0;
const sheet=name=>({
 getLastRow:()=>tables[name].length,
 getRange:(r,c,n=1,w=1)=>({
  getValues:()=>tables[name].slice(r-1,r-1+n).map(row=>row.slice(c-1,c-1+w)),
  setValue:value=>{tables[name][r-1][c-1]=value;}
 }),
 appendRow:row=>{tables[name].push(row);if(name==='PILOT_RACUN_TX_ROWS'&&++appends===failAt)throw Error('INJECTED_AFTER_APPEND');}
});
const ctx={Date,JSON,Map,Set,String,Number,Error,SpreadsheetApp:{flush:()=>{}},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION'};
vm.createContext(ctx);
for(const f of ['PilotRacunSheetAdapter.js','PilotRacunJournal.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
const plan={reference:'BSE-TG-TEST-1',storage_mode:'UNLINKED_PILOT',requires_atomic_commit:true,production_write:false,records:Array.from({length:10},(_,i)=>({source_key:'BSE-TG-TEST-1|Treatment_Event_Log|R'+(i+1),value:i}))};
const book={getSheetByName:n=>tables[n]?sheet(n):null};
test('real Sheets API-shaped adapter resumes after one partially committed append',()=>{
 const adapter=ctx.bsePilotRacunSheetAdapter_(book);failAt=5;
 assert.throws(()=>ctx.bsePilotRacunJournalCommit_(plan,adapter),/RECOVERY_REQUIRED/);
 assert.equal(tables.PILOT_RACUN_TX_JOURNAL[1][2],'RECOVERY_REQUIRED');
 failAt=0;
 assert.equal(ctx.bsePilotRacunJournalCommit_(plan,adapter).status,'COMMITTED');
 assert.equal(tables.PILOT_RACUN_TX_ROWS.length,11);
 assert.equal(ctx.bsePilotRacunJournalCommit_(plan,adapter).status,'COMMITTED');
 assert.equal(tables.PILOT_RACUN_TX_ROWS.length,11);
});
test('incorrect schema fails closed',()=>{
 const original=tables.PILOT_RACUN_TX_ROWS[0][0];tables.PILOT_RACUN_TX_ROWS[0][0]='bad';
 assert.throws(()=>ctx.bsePilotRacunSheetAdapter_(book).readRows('BSE-TG-TEST-1'),/SCHEMA_MISMATCH/);
 tables.PILOT_RACUN_TX_ROWS[0][0]=original;
});
