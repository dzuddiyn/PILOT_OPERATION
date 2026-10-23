'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const ctx={Date,Set,Map,JSON,Number,String,Error,bseRuntimeEnvironmentName_:()=>ctx.env,env:'PILOT_OPERATION'};
vm.createContext(ctx);
for(const f of ['PilotRacunAtomicPlan.js','PilotRacunJournal.js','PilotRacunCallbackCoordinator.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
const candidate=i=>({target:'Treatment_Event_Log',fields:{event_date:'2026-10-19',plot_ids:['M'+i+'P1'],treatment_description:'Dynamec - 20',verification_status:'PROVISIONAL',pending_treatment_items:[],crop:''}});
const proposal={production_write:false,candidates:[candidate(1),candidate(2)]};
const input={action:'A',authorized:true,hash_verified:true,approval_state:'OPEN',reference:'BSE-TG-772257756',proposal};
const fixture=()=>{const rows=[],journal=new Map(),adapter={lock:fn=>fn(),getJournal:ref=>journal.get(ref)||null,createJournal:(ref,value)=>journal.set(ref,{...value}),readRows:()=>rows.map(r=>({...r})),appendRow:r=>rows.push({...r}),setJournal:(ref,status)=>journal.get(ref).status=status,flush:()=>{}};return {rows,journal,adapter};};
test('confirmed aggregate transaction commits and is idempotent without changing approval',()=>{
 const x=fixture(),result=ctx.bsePilotRacunCommitConfirmed_(input,x.adapter);
 assert.equal(result.status,'LEDGER_COMMITTED_APPROVAL_PENDING');assert.equal(result.count,2);
 assert.equal(x.rows.length,2);assert.equal(ctx.bsePilotRacunCommitConfirmed_(input,x.adapter).count,2);assert.equal(x.rows.length,2);
});
test('auth, hash, approval state, environment fail before write',()=>{
 for(const change of [{authorized:false},{hash_verified:false},{approval_state:'CLOSED'},{action:'R'}]){
  const x=fixture();assert.throws(()=>ctx.bsePilotRacunCommitConfirmed_({...input,...change},x.adapter),/NOT_AUTHORIZED/);assert.equal(x.rows.length,0);
 }
 const x=fixture();ctx.env='TEST';assert.throws(()=>ctx.bsePilotRacunCommitConfirmed_(input,x.adapter),/WRONG_ENVIRONMENT/);
});
