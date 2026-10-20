'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
let seq=0,mutations=0;
const s={console:{log(){}},SpreadsheetApp:{flush(){}},PropertiesService:{},UrlFetchApp:{},DriveApp:{},ScriptApp:{},Session:{},Utilities:{DigestAlgorithm:{SHA_256:'SHA_256'},Charset:{UTF_8:'UTF_8'},computeDigest:(alg,v)=>Array.from(crypto.createHash('sha256').update(String(v)).digest(),n=>n>127?n-256:n),getUuid:()=>('SYNTHETIC-'+(++seq))}};
vm.createContext(s);
for(const f of fs.readdirSync(__dirname).filter(x=>x.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(__dirname,f),'utf8'),s,{filename:f,timeout:3000});
s.bseRuntimeEnvironmentName_=()=>'PILOT_OPERATION';
class Sheet{
 constructor(name,headers,rows=[]){this.name=name;this.rows=[headers.slice(),...rows.map(r=>r.slice())];this.maxCols=headers.length;}
 getLastRow(){return this.rows.length}
 getMaxRows(){return Math.max(100,this.rows.length)}
 getMaxColumns(){return this.maxCols}
 insertColumnsAfter(n,m){this.maxCols+=m}
 insertRowsAfter(n,m){}
 setFrozenRows(){}
 getRange(r,c,h=1,w=1){const self=this;return {getValues(){return Array.from({length:h},(_,i)=>Array.from({length:w},(_,j)=>self.rows[r-1+i]?.[c-1+j]??''))},setNumberFormat(){return this},setWrap(){return this},setFontWeight(){return this},setValues(rows){for(let i=0;i<rows.length;i++){self.rows[r-1+i]??=[];for(let j=0;j<rows[i].length;j++){self.rows[r-1+i][c-1+j]=rows[i][j]}}mutations++;return this}}}
}
class Book{
 constructor(data){this.items={};for(const [name,v]of Object.entries(data))this.items[name]=new Sheet(name,v[0],v.slice(1));}
 getSheetByName(name){return this.items[name]??null}
 insertSheet(name){return this.items[name]=new Sheet(name,[])}
 rows(name){return this.items[name]?.rows.slice(1)??[]}
}
const h=name=>vm.runInContext(name,s),batch='BSE-SB-CB-20260808-001',allocation=batch+'-PA-001',tr='BSE-SB-TR-20260812-001';
const data={
 TEST_CROP_BATCH:[h('BSE_CROP_BATCH_HEADERS'),['source',1,batch,'2026-08-08','Timun','7055']],
 TEST_PLOT_ALLOCATION:[h('BSE_PLOT_ALLOCATION_HEADERS'),['source',1,batch,allocation,'2026-08-08','M3P1','PLANNED']],
 TEST_CROP_BATCH_REVIEW:[h('BSE_CROP_BATCH_REVIEW_HEADERS'),['r','source',1,'Crop_Batch_Log','hash','APPROVED','','','','','',batch]],
 TEST_TRANSPLANT_EVENT:[h('BSE_TRANSPLANT_EVENT_HEADERS'),['source',1,tr,batch,'2026-08-12','TRANSPLANT']],
 TEST_ALLOCATION_STATUS_EVENT:[h('BSE_ALLOCATION_STATUS_EVENT_HEADERS'),['src',1,'ST1',tr,batch,allocation,'M3P1','PLANNED','ACTIVE','2026-08-12T02:00:00.000Z']],
 TEST_OPERATION_LOG:[h('BSE_OPERATION_LOG_HEADERS')],
 TEST_OPERATION_REVIEW:[h('BSE_OPERATION_REVIEW_HEADERS')]
};
const b=new Book(data),r=s.bsePilotCycleEndResult_('plot tamat\nM3P1\n20/09/26');
const ctx={reference:'BSE-TG-9000900',action:'APPROVED',actor_type:'TELEGRAM',actor_id:'900',actor_name:'fixture-only',source_channel:'TELEGRAM',proposalResult:r};
let count=0;const check=(name,cb)=>{cb();count++;console.log('PASS '+name)};
check('pilot current plot is active',()=>assert.equal(s.bsePilotCycleEndCurrentMatch_(b,r.candidates[0].fields).kind,'UNIQUE'));
check('no writes before Benar',()=>assert.equal(mutations,0));
check('non-approved action cannot write',()=>{let bad={...ctx,action:'REJECTED',reason:'SYNTHETIC'};assert.throws(()=>s.bsePilotCycleEndReviewCore_(b,bad),/Benar|APPROVED/);assert.equal(mutations,0)});
check('Benar writes exactly one operation+review+status event',()=>{
 const result=s.bsePilotCycleEndReviewCore_(b,ctx);assert.equal(result.duplicate,false);assert.equal(result.allocation_status,'INACTIVE');
 assert.equal(b.rows('TEST_OPERATION_LOG').length,1);assert.equal(b.rows('TEST_OPERATION_REVIEW').length,1);assert.equal(b.rows('TEST_ALLOCATION_STATUS_EVENT').length,2);
 const event=b.rows('TEST_ALLOCATION_STATUS_EVENT')[1];
 assert.equal(event[5],allocation);assert.equal(event[6],'M3P1');assert.equal(event[7],'ACTIVE');assert.equal(event[8],'INACTIVE');
 assert.equal(event[0],b.rows('TEST_OPERATION_LOG')[0][0]);
});
check('duplicate Benar idempotent, zero new writes',()=>{
 const before=mutations,again=s.bsePilotCycleEndReviewCore_(b,ctx);
 assert.equal(again.duplicate,true);assert.equal(mutations,before);
});
check('plot no longer active; history retained',()=>{
 assert.equal(s.bsePilotCycleEndCurrentMatch_(b,r.candidates[0].fields).kind,'NONE');
 assert.equal(s.bseActiveAllocationEffectiveStatuses_(b.rows('TEST_ALLOCATION_STATUS_EVENT'))[allocation].status,'INACTIVE');
 assert.equal(b.rows('TEST_CROP_BATCH').length,1);assert.equal(b.rows('TEST_PLOT_ALLOCATION').length,1);
 assert.equal(s.bseTelegramPlotStatusSummary_(b,'M3P1').kind,'NONE');
});
check('as-of ACTIVE before closure / INACTIVE after closure',()=>{
 const early=s.bseCensusStatusEventsAsOf_('2026-09-19',b.rows('TEST_ALLOCATION_STATUS_EVENT'),b.rows('TEST_TRANSPLANT_EVENT'),b.rows('TEST_OPERATION_LOG'));
 const after=s.bseCensusStatusEventsAsOf_('2026-09-20',b.rows('TEST_ALLOCATION_STATUS_EVENT'),b.rows('TEST_TRANSPLANT_EVENT'),b.rows('TEST_OPERATION_LOG'));
 assert.equal(s.bseActiveAllocationEffectiveStatuses_(early)[allocation].status,'ACTIVE');
 assert.equal(s.bseActiveAllocationEffectiveStatuses_(after)[allocation].status,'INACTIVE');
});
check('old inactive batch cannot be transplanted again',()=>{
 const proposal={fields:{crop:'Timun'},plots:['M3P1']},args=[b.rows('TEST_CROP_BATCH'),b.rows('TEST_PLOT_ALLOCATION'),b.rows('TEST_CROP_BATCH_REVIEW'),b.rows('TEST_ALLOCATION_STATUS_EVENT')];
 assert.notEqual(s.bseTransplantFindMatches_(proposal,...args).kind,'UNIQUE');
 assert.notEqual(s.bseTransplantFindPlannedMatchesByPlots_(['M3P1'],...args).kind,'UNIQUE');
});
check('partial write is detected without an extra write',()=>{
 b.getSheetByName('TEST_ALLOCATION_STATUS_EVENT').rows.pop();const before=mutations;
 assert.throws(()=>s.bsePilotCycleEndReviewCore_(b,ctx),/PARTIAL WRITE DETECTED/);
 assert.equal(mutations,before);
});
console.log('GI_CYCLE_END_WRITER '+count+'/'+count+' PASS LOCAL SYNTHETIC');
