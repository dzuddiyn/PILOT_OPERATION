'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const s={console:{log(){}},SpreadsheetApp:{},PropertiesService:{},UrlFetchApp:{},DriveApp:{},ScriptApp:{},Session:{}};
vm.createContext(s);
for(const f of fs.readdirSync(__dirname).filter(x=>x.endsWith('.js')).sort())
 vm.runInContext(fs.readFileSync(path.join(__dirname,f),'utf8'),s,{filename:f,timeout:3000});
let passed=0;
function check(label,fn){fn();console.log('PASS '+label);passed++;}
const inspect=(markup,prefix)=>{
 assert.ok(markup&&Array.isArray(markup.inline_keyboard));
 const buttons=markup.inline_keyboard.flat();
 assert.equal(buttons.length,2);
 assert.deepEqual(Array.from(buttons,b=>b.callback_data),[prefix+':A',prefix+':R']);
 assert.ok(/Benar/.test(buttons[0].text));
 assert.ok(/Batal/.test(buttons[1].text));
 assert.equal(buttons.some(b=>/Betulkan|Buang/.test(b.text)),false);
};
const token='Abc123xY9';
check('generic Operation and Treatment confirmation exactly Benar Batal',()=>inspect(s.bseApprovalMarkup_(token),'B1:'+token));
check('independent multi-operation cards exact Benar Batal',()=>{
 const result={validation:'PASS',production_write:false,candidates:[{target:'Operation_Log',validation:'PASS',missing:[],fields:{plot_id:'M3P1'}},{target:'Operation_Log',validation:'PASS',missing:[],fields:{plot_id:'M3P2'}}]};
 const cards=s.bseApprovalEnvelopes_(result);
 assert.equal(cards.length,2);
 cards.forEach(c=>inspect(s.bseApprovalMarkupForResult_(token,c),'B1:'+token));
});
check('Transplant reallocation confirmation exactly Benar Batal',()=>{
 const result={validation:'PASS',production_write:false,candidates:[{target:'Transplant_Event_Log',fields:{reallocation:{required:true}}}]};
 inspect(s.bseApprovalMarkupForResult_(token,result),'B1:'+token);
});
check('Evidence confirmation exactly Benar Batal',()=>inspect(s.bseTelegramEvidenceMarkup_(token),'E1:'+token));
check('Image Processing confirmation exactly Benar Batal',()=>inspect(s.bseImageProcessingMarkup_(token),'IP1:'+token));
check('image action chooser cancel label Batal, not Buang',()=>{
 const buttons=s.bseImageActionMarkup_(token).inline_keyboard.flat();
 assert.equal(buttons.length,4);
 assert.ok(buttons.some(b=>b.callback_data==='IA1:'+token+':R'&&/Batal/.test(b.text)));
 assert.equal(buttons.some(b=>/Buang/.test(b.text)),false);
});
check('R is direct discard, not another reject-reason prompt in effective PILOT flow',()=>{
 const core=s.bseTelegramReporterConfirmationCore_.toString();
 const b=core.indexOf("if(input.kind==='R')");
 const e=core.indexOf("context.reference=String(row[0]);context.action='APPROVED'",b);
 assert.ok(b>=0&&e>b);
 const branch=core.slice(b,e);
 assert.ok(branch.includes("DISCARDED_BY_REPORTER"));
 assert.ok(branch.includes("bseApprovalRecomputeQueueStatus_"));
 assert.equal(/bseApprovalDomain_\(parsed\)\.core|bseTelegramApi_\('sendMessage'/.test(branch),false);
});
check('old cards with C remain recognized, without displaying it on new cards',()=>{
 assert.ok(s.bseTelegramApprovalPersistCallback_.toString().includes("['A','C','R']"));
 assert.ok(s.bseTelegramReporterConfirmationCore_.toString().includes("if(input.kind==='C')"));
 assert.ok(s.bseTelegramEvidenceIsCallback_({callback_query:{data:'E1:'+token+':C'}}));
 assert.ok(s.bseImageProcessingIsCallback_({callback_query:{data:'IP1:'+token+':C'}}));
});
check('text instruction does not direct users to missing Betulkan button',()=>{
 const worker=fs.readFileSync(path.join(__dirname,'TelegramWorkerTest.js'),'utf8');
 const runtime=fs.readFileSync(path.join(__dirname,'EnvironmentTest.js'),'utf8');
 assert.ok(worker.includes('Sila pilih Benar atau Batal'));
 assert.ok(runtime.includes('Sila pilih Benar atau Batal'));
 assert.equal(worker.includes('Sila pilih Benar, Betulkan atau Batal'),false);
});
console.log('GI_TWO_BUTTON_CONFIRMATION '+passed+'/9 PASS LOCAL VM ONLY');
