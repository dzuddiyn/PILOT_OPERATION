const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const s=fs.readFileSync(__dirname+'/PilotBajaReviewTest.js','utf8');const a=s.indexOf('function bsePilotBajaAuditRows_('),b=s.indexOf('function bsePilotBajaReviewCore_(',a);
const c={Utilities:{formatDate:()=> '2026-10-22'}};vm.createContext(c);vm.runInContext(s.slice(a,b),c);
const key='REF|INVENTORY_OUT|BAJA_F|M2P3',note='Baja out',row=Array(27).fill('');const item={sourceKey:key,id:'ID',hash:'HASH',payload:{domain:'INVENTORY_OUT',item_name:'Baja',quantity:1,unit:'set',event_date:'2026-10-22',original_note:note,destination:'M2P3',baja_type:'F'}};
Object.assign(row,{0:key,1:'ID',2:'INVENTORY_OUT',3:'Baja',4:1,5:'set',6:new Date('2026-10-22'),10:'APPROVED_TEST',12:false,13:note,17:'HASH',21:'M2P3',26:'F'});
assert.equal(c.bsePilotBajaAuditRows_([row],item,'Etc/GMT'),'RECOVER');row[6]='2026-10-22';assert.equal(c.bsePilotBajaAuditRows_([row],item,'Etc/GMT'),'RECOVER');row[26]='N';assert.throws(()=>c.bsePilotBajaAuditRows_([row],item,'Etc/GMT'),/CONFLICT/);console.log('BAJA_DATE_ROUNDTRIP_3_3_PASS');
