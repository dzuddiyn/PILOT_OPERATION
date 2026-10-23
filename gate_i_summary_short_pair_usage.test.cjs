'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const c={console:{log(){}},SpreadsheetApp:{},PropertiesService:{},UrlFetchApp:{},DriveApp:{},ScriptApp:{},Session:{}};
vm.createContext(c);
for(const file of fs.readdirSync(__dirname).filter(x=>x.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),c,{filename:file,timeout:4000});
c.bseRuntimeEnvironmentName_=()=>'PILOT_OPERATION';
let passed=0;function check(name,fn){fn();passed++;console.log('PASS '+name)}
const norm=r=>r?{kind:r.kind,plots:Array.from(r.plots)}:null;
const parse=s=>norm(c.bseTelegramPlotRetrievalCommand_(s));
for(const [text,plots] of [
 ['/summary M3P34',['M3P3','M3P4']],
 ['/summary M3P3,4',['M3P3','M3P4']],
 ['/summary plot M3P34',['M3P3','M3P4']],
 ['/summary plot M3P3,4',['M3P3','M3P4']],
 ['/SUMMARY m3p3,4',['M3P3','M3P4']],
 ['/summary M3P3,M3P4',['M3P3','M3P4']],
 ['/summary plot M3P3,M3P4',['M3P3','M3P4']],
 ['/summary M3P3,M3P4,M3P5',['M3P3','M3P4','M3P5']],
 ['/summary M3P34,M3P5',['M3P3','M3P4','M3P5']],
 ['/summary M3P345',['M3P3','M3P4','M3P5']],
 ['/summary M3P3456',['M3P3','M3P4','M3P5','M3P6']],
 ['/summary M2P1,M3P1,M4P1,M5P1,M6P1,M7P1',['M2P1','M3P1','M4P1','M5P1','M6P1','M7P1']]
])check('valid '+text,()=>assert.deepEqual(parse(text),{kind:'SUMMARY',plots}));
for(const text of [
 '/summary','/summary ','/summary plot','/summary ABC','/summary M3P3','/summary M3P33',
 '/summary M3P333','/summary M3P3,3','/summary M3P3,M3P3',
 '/summary M3P34,M3P3','/summary M3P3,M3P4,M3P5,M3P6,M3P7,M3P8,M3P9',
 '/summary M3P3 extra','/summary plot M3P3 extra','/summary xyz M3P34'
])check('invalid '+text,()=>{assert.equal(parse(text),null);assert.equal(c.bseTelegramPlotSummaryUsageCommand_(text),true)});
for(const text of ['/summaryplot M3P34','/summarize M3P34','/status M3P34','/history','/start'])check('unrelated '+text,()=>assert.equal(c.bseTelegramPlotSummaryUsageCommand_(text),false));
check('usage text provides precise supported commands',()=>{
 const t=c.bseTelegramPlotSummaryUsageText_();
 for(const x of ['/summary M3P12','/summary M3P1,2','/summary plot M3P1,M3P2','2 hingga 6','/status M3P1','PM bot'])assert.ok(t.includes(x),x);
});
const message=(text,id=1,group=false)=>({text,from:{id},chat:group?{type:'supergroup',id:-1}:{type:'private',id}});
c.bseTelegramRegistrationPrivateAccess_=(book,m)=>({status:m.chat.type!=='private'?'NOT_PRIVATE':m.from.id===1?'OWNER_ACTIVE':'NOT_REGISTERED_ACTIVE'});
check('bad syntax authorized private gets help',()=>{
 const x=c.bseTelegramPlotSummaryUsageRetrieve_({},message('/summary'));assert.equal(x.handled,true);assert.equal(x.production_write,false);assert.ok(x.text.includes('Cara guna /summary'));
});
check('bad syntax unauthorized PM exposes no plot data',()=>{
 const x=c.bseTelegramPlotSummaryUsageRetrieve_({},message('/summary M3P333',2));assert.equal(x.production_write,false);assert.ok(x.text.includes('ahli aktif'));assert.ok(!x.text.includes('Batch:'));
});
check('group receives PM instruction only',()=>{
 const x=c.bseTelegramPlotSummaryUsageRetrieve_({},message('/summary M3P3',1,true));assert.equal(x.production_write,false);assert.ok(x.text.includes('hanya boleh disemak melalui PM'));
});
check('valid commands do not trigger usage help',()=>assert.equal(c.bseTelegramPlotSummaryUsageRetrieve_({},message('/summary M3P3,4')).handled,false));
check('summary shows concise two unique plot blocks and only audit append',()=>{
 const calls=[],outputs={M3P3:{kind:'UNIQUE',crop:'Cucumber',batch_id:'B',allocation_status:'ACTIVE',census:null,treatment:null},M3P4:{kind:'UNIQUE',crop:'Cucumber',batch_id:'B',allocation_status:'ACTIVE',census:null,treatment:null}};
 const old=c.bseTelegramPlotStatusSummary_;c.bseTelegramPlotStatusSummary_=(book,plot)=>{calls.push(plot);return outputs[plot]};
 c.bseTelegramPlotStatusAudit_=()=>({appendRow(row){c.__audit=row}});c.SpreadsheetApp.flush=()=>{};
 const x=c.bseTelegramPlotStatusRetrieve_({},message('/summary M3P34'));
 assert.equal(x.handled,true);assert.equal(x.production_write,false);assert.deepEqual(calls,['M3P3','M3P4']);assert.ok(x.text.includes('RUMUSAN PLOT'));assert.ok(x.text.includes('Plot M3P3'));assert.ok(x.text.includes('Plot M3P4'));assert.ok(x.text.indexOf('Plot M3P3')<x.text.indexOf('Plot M3P4'));assert.equal(c.__audit[3],'M3P3,M3P4');c.bseTelegramPlotStatusSummary_=old;
});
check('one ACTIVE and one empty remains honest',()=>{
 const before=c.bseTelegramPlotStatusSummary_;
 c.bseTelegramPlotStatusSummary_=(book,id)=>id==='M3P3'?{kind:'UNIQUE',crop:'Cucumber',census:null,treatment:null}:{kind:'NONE'};
 const out=c.bseTelegramPlotStatusRetrieve_({},message('/summary M3P3,4'));assert.equal(out.production_write,false);assert.ok(out.text.includes('Tiada tanaman aktif disahkan'));c.bseTelegramPlotStatusSummary_=before;
});
check('menu summary description advertises new compact and shorthand forms',()=>{
 const entry=vm.runInContext('BSE_TG_TEST_COMMANDS',c).find(x=>x.command==='summary');assert.ok(entry.description.includes('/summary M2P12'));assert.ok(entry.description.includes('/summary M2P1,2'));
});
check('receive branch prioritizes valid summary then malformed summary then reporting intake',()=>{
 const source=fs.readFileSync(path.join(__dirname,'TelegramQueueTest.js'),'utf8');
 const i=source.indexOf("bseTelegramPlotStatusRetrieve_(book,m)"),j=source.indexOf("bseTelegramPlotSummaryUsageRetrieve_(book,m)"),k=source.indexOf('else if(rejectPromptReply)',i);
 assert.ok(i>0&&j>i&&k>j);
});
check('original status and summary harness passes',()=>c.runBseTelegramPlotStatusHarnessTests());
check('status continues to handle one/two plots',()=>{assert.equal(parse('/status M3P3').kind,'STATUS');assert.equal(parse('/status M3P34').kind,'STATUS_MULTI')});
console.log('GI_SUMMARY_SHORT_PAIR '+passed+'/'+passed+' PASS LOCAL SYNTHETIC');
