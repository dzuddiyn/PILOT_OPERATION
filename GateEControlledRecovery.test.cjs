const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const c=vm.createContext({});
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'GateEControlledRecovery.js'),'utf8'),c);
const old=[
 {update_id:772257138,message:{message_id:6,chat:{type:'private'},text:'hi'}},
 {update_id:772257139,message:{message_id:7,chat:{type:'group'},text:'/pilot'}},
 {update_id:772257140,message:{message_id:8,chat:{type:'private'},text:'/ask_ai berapa modul semua?'}}
];
let n=0;
function pass(name,fn){fn();console.log('PASS '+name);n++;}
function fails(name,fn){pass(name,()=>assert.throws(fn,/GATE_E_/));}
pass('all three classified',()=>assert.equal(c.bseGateEClassify_(old).length,3));
pass('future update preserved',()=>assert.equal(c.bseGateEClassify_([...old,{update_id:772257141,message:{message_id:9}}]).length,3));
fails('missing update',()=>c.bseGateEClassify_(old.slice(1)));
fails('wrong old ID',()=>c.bseGateEClassify_([{...old[0],update_id:772257137},...old.slice(1)]));
fails('changed old message',()=>c.bseGateEClassify_([{...old[0],message:{...old[0].message,text:'rawatan benar'}},...old.slice(1)]));
fails('wrong old command',()=>c.bseGateEClassify_([old[0],{...old[1],message:{...old[1].message,text:'/approve'}},old[2]]));
fails('unexpected old update',()=>c.bseGateEClassify_([...old,{update_id:772257139,message:{message_id:90}}]));
const rows=[['772257138','6','private','hi','TEST_ONLY'],['772257139','7','group','/pilot','NON_OPERATIONAL_COMMAND'],['772257140','8','private','/ask_ai','ALREADY_ANSWERED']];
pass('audit readback exact',()=>assert.equal(c.bseGateECheckAudit_(rows,c.bseGateEExpected_()),true));
fails('audit partial',()=>c.bseGateECheckAudit_(rows.slice(0,2),c.bseGateEExpected_()));
fails('audit duplicate',()=>c.bseGateECheckAudit_([...rows,rows[0]],c.bseGateEExpected_()));
fails('audit conflicting disposition',()=>c.bseGateECheckAudit_([['772257138','6','private','hi','WRONG'],...rows.slice(1)],c.bseGateEExpected_()));
fails('execute requires separate approval',()=>c.gateEControlledRecoveryExecute());
console.log('GATE_E_TARGETED '+n+'/12 PASS, no runtime adapters invoked');
