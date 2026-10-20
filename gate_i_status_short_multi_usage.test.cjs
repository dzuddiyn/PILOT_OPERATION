'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const ctx={console:{log(){}},SpreadsheetApp:{},PropertiesService:{},UrlFetchApp:{},DriveApp:{},ScriptApp:{},Session:{}};
vm.createContext(ctx);
for(const file of fs.readdirSync(__dirname).filter(f=>f.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),ctx,{filename:file,timeout:4000});
let n=0;const check=(name,fn)=>{fn();console.log('PASS '+name);n++};
function parse(message){const r=ctx.bseTelegramPlotRetrievalCommand_(message);return r?{kind:r.kind,plots:Array.from(r.plots)}:null}
const single=['/status M3P2','/status plot M3P2','/STATUS m3p2','/status   plot   m3p2 '];
single.forEach(x=>check('single '+x,()=>assert.deepEqual(parse(x),{kind:'STATUS',plots:['M3P2']})));
for(const value of ['/status M3P12','/status M3P1,2','/status plot M3P12','/status plot M3P1,2','/status M3P1,M3P2','/status M12P34']){
 check('two plots '+value,()=>{
 const module=value.includes('M12')?'M12':'M3';
 assert.deepEqual(parse(value),{kind:'STATUS_MULTI',plots:module==='M12'?['M12P3','M12P4']:['M3P1','M3P2']});
 });
}
for(const value of ['/status','/status plot','/status ABC','/status M3P11','/status M3P1,1','/status M3P123','/status M3P1,M4P2','/status M3P1,2,3','/status M3P0','/status M3P2 extra','/status M3P1\nother','/statusplot M3P1']){
 check('invalid '+value.replace(/\n/g,'\\n'),()=>{
 assert.equal(parse(value),null);
 assert.equal(ctx.bseTelegramPlotStatusUsageCommand_(value),!/\/statusplot/.test(value));
 });
}
check('invalid prefix does not hijack other slash commands',()=>{
 for(const value of ['/statusxyz M3P1','/start','/summary plot M3P1,M3P2','/status_report M3P1'])assert.equal(ctx.bseTelegramPlotStatusUsageCommand_(value),false);
 assert.deepEqual(parse('/summary plot M3P1,M3P2'),{kind:'SUMMARY',plots:['M3P1','M3P2']});
});
check('help returns exact permitted patterns and invalid examples',()=>{
 const txt=ctx.bseTelegramPlotStatusUsageText_();
 for(const term of ['/status M3P2','/status plot M3P2','/status M3P12','/status M3P1,2','PM bot'])assert.ok(txt.includes(term),term);
});
ctx.bseTelegramRegistrationPrivateAccess_=(book,msg)=>({status:msg.chat.type!=='private'?'NOT_PRIVATE':msg.from.id===1?'OWNER_ACTIVE':'NOT_REGISTERED_ACTIVE'});
const privateMsg=(text,id=1)=>({text,from:{id},chat:{type:'private',id}});
check('malformed private active user sees usage, no domain write',()=>{
 const res=ctx.bseTelegramPlotStatusUsageRetrieve_({},privateMsg('/status M3P11'));
 assert.equal(res.handled,true);assert.equal(res.production_write,false);assert.ok(res.text.includes('Cara guna /status'));
});
check('malformed unauthorized user gets no status data',()=>{
 const res=ctx.bseTelegramPlotStatusUsageRetrieve_({},privateMsg('/status M3P12x',20));
 assert.ok(res.text.includes('ahli aktif'));assert.equal(res.production_write,false);
});
check('malformed group message gets PM guidance',()=>{
 const res=ctx.bseTelegramPlotStatusUsageRetrieve_({},{text:'/status',chat:{type:'supergroup',id:-10},from:{id:1}});
 assert.ok(res.text.includes('PM bot'));assert.equal(res.production_write,false);
});
check('valid command never produces help',()=>assert.equal(ctx.bseTelegramPlotStatusUsageRetrieve_({},privateMsg('/status M3P12')).handled,false));
check('full independent status for each plot preserves ordering',()=>{
 const sums=[];
 const originalSummary=ctx.bseTelegramPlotStatusSummary_;
 ctx.bseTelegramPlotStatusSummary_=(book,plot)=>{sums.push(plot);return {kind:plot==='M3P1'?'UNIQUE':'NONE',crop:'Timun',batch_id:'B1',allocation_status:'ACTIVE',census:null,treatment:null}};
 ctx.bseTelegramPlotStatusAudit_=()=>({appendRow(v){ctx.__audit=v}});
 ctx.SpreadsheetApp.flush=()=>{};
 ctx.bseRuntimeEnvironmentName_=()=> 'PILOT_OPERATION';
 const answer=ctx.bseTelegramPlotStatusRetrieve_({},privateMsg('/status M3P12'));
 assert.equal(answer.handled,true);assert.equal(answer.production_write,false);
 assert.deepEqual(sums,['M3P1','M3P2']);
 assert.match(answer.text,/Status Plot TEST M3P1/);
 assert.match(answer.text,/Status Plot TEST M3P2/);
 assert.ok(answer.text.indexOf('M3P1')<answer.text.indexOf('M3P2'));
 assert.equal(ctx.__audit[3],'M3P1,M3P2');assert.equal(ctx.__audit[4],'PARTIAL');
 ctx.bseTelegramPlotStatusSummary_=originalSummary;
});
check('do not bypass group denial for valid status command',()=>{
 const res=ctx.bseTelegramPlotStatusRetrieve_({},{text:'/status M3P1,2',chat:{type:'supergroup',id:-10},from:{id:1}});
 assert.equal(res.handled,true);assert.match(res.text,/PM bot/);
});
check('receiver valid -> usage -> remaining intake order',()=>{
 const s=fs.readFileSync(path.join(__dirname,'TelegramQueueTest.js'),'utf8');
 const i=s.indexOf("bseTelegramPlotStatusRetrieve_(book,m)"),u=s.indexOf("bseTelegramPlotStatusUsageRetrieve_(book,m)"),r=s.indexOf('else if(rejectPromptReply)',i);
 assert.ok(i>0&&u>i&&r>u);
});
check('original Apps Script harness still passes',()=>{
 ctx.runBseTelegramPlotStatusHarnessTests();
});
console.log('GI_STATUS_SHORT_MULTI '+n+'/'+n+' PASS LOCAL VM');
