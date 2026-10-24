'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const d=__dirname,ctx={console,Date,Utilities:{formatDate:(date,tz,fmt)=>{assert.equal(tz,'Asia/Kuala_Lumpur');return new Date(date.getTime()+8*3600000).toISOString().slice(0,7)}},PropertiesService:{getScriptProperties:()=>({getProperty:()=>''})}};
vm.createContext(ctx);
for(const f of ['TelegramRecordRetrievalTest.js','TelegramReportTest.js'])vm.runInContext(fs.readFileSync(path.join(d,f),'utf8'),ctx);
let n=0;function check(label,fn){fn();n++;console.log('PASS',label);}
const parsed=(s)=>ctx.bseTelegramReportCommand_(s,new Date('2026-10-24T01:00:00Z'));
check('all requested date input formats and default',()=>{
const entries=[['/report','2026-10'],['/report Okt 2026','2026-10'],['/report Oct 2026','2026-10'],['/report Oktober 2026','2026-10'],['/report 2026-09','2026-09'],['/report 10/2026','2026-10'],['/report 24/10/2026','2026-10-24'],['/report 2026-10-24','2026-10-24'],['/report 24 Okt 2026','2026-10-24'],['/report October 24 2026','2026-10-24']];
for(const [input,want] of entries)assert.equal(parsed(input).period,want,input);
for(const input of ['/report 31/02/2026','/report 2026-13','/report September','/report random','/report 2026-02-30'])assert.equal(parsed(input).invalid,true,input);
assert.equal(parsed('/history 2026-10'),null);
});
check('friendly retrieve groups plots and hides log names',()=>{
const out=ctx.bseTelegramRecordFriendlySummary_('BSE-TG-772257874',[
{target:'Crop_Batch_Log',fields:{crop:'Cucumber',variety:'7055 CCB',event_date:'2026-08-25'}},
{target:'Planting_Event_Log',fields:{crop:'Cucumber',event_date:'2026-08-25',plot_id:'M3P3'}},
{target:'Plot_Allocation_Log',fields:{event_date:'2026-08-25',plot_id:'M3P4'}}]);
assert.match(out,/Cucumber \(7055 CCB\)/);
assert.match(out,/Plot: M3P3, M3P4/);
assert.match(out,/Batch tanaman/);
assert.doesNotMatch(out,/_Log|undefined|null/);
assert.equal((out.match(/M3P3/g)||[]).length,1);
});
check('aggregate unique keys no raw record-by-record in public summary',()=>{
const rows=[{date:'2026-10-01',reference:'BSE-TG-1',category:'FIELD_OPERATION',summary:'Timun'},{date:'2026-10-01',reference:'BSE-TG-1',category:'FIELD_OPERATION',summary:'Timun'},{date:'2026-10-02',reference:'BSE-TG-2',category:'PRIVATE_SUBMISSION',summary:'Penyelia'}];
const a=ctx.bseTelegramReportAggregate_('2026-10',rows);
assert.equal(a.records,2);assert.equal(a.days,2);assert.equal(a.byCategory.length,2);
const out=ctx.bseTelegramReportSummary_(a);assert.match(out,/Jumlah rekod: 2/);assert.doesNotMatch(out,/BSE-TG-1|Penyelia/);
});
check('no AI forecast on empty canonical data',()=>{
assert.equal(ctx.bseTelegramReportGeminiCommentary_('2026-10',{records:0}).reason,'NO_CANONICAL_RECORDS');
});
check('report cannot be reached from group or wrong owner',()=>{
const audits=[],ctx2={...ctx,SpreadsheetApp:{flush:()=>{}},bseTelegramReportAudit_:()=>({appendRow:x=>audits.push(x)}),bseTestOwnerForTelegramUser_:()=>({ok:false}),bseTelegramHistoryRecordEvents_:()=>{throw Error('MUST_NOT_READ')},bseTelegramHistoryEvidenceEvents_:()=>{throw Error('MUST_NOT_READ')}};vm.createContext(ctx2);vm.runInContext(fs.readFileSync(path.join(d,'TelegramReportTest.js'),'utf8'),ctx2);ctx2.bseTelegramReportAudit_=()=>({appendRow:x=>audits.push(x)});
const r=ctx2.bseTelegramReportRetrieve_({}, {text:'/report',from:{id:'123'},chat:{id:'456',type:'group'}});
assert.match(r.text,/OWNER aktif/);assert.equal(audits[0][4],'DENIED');
});
check('built-in report harness',()=>{const t=ctx.runBseTelegramReportHarnessTests();assert.equal(t.length,6)});
console.log('GI_RETRIEVE_REPORT_UX',n+'/'+n,'PASS; NO LIVE WRITE');