'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(__dirname+'/TelegramHistoryTest.js','utf8');
function extract(name){
 const start=src.indexOf('function '+name+'(');assert(start>=0,name);
 let n=0,q='',esc=false;
 for(let i=src.indexOf('{',start);i<src.length;i++){
 const ch=src[i];if(q){if(esc)esc=false;else if(ch==='\\')esc=true;else if(ch===q)q='';continue;}
 if(ch==='"'||ch==="'"||ch==='\x60'){q=ch;continue;}
 if(ch==='{')n++;if(ch==='}'&&--n===0)return src.slice(start,i+1);
 }
 throw Error('unclosed '+name);
}
const transplant=['BSE-TG-772257182|Transplant_Event_Log','772257182','TR-14','batch','2026-10-14','TRANSPLANT','Peria Besar','Hup Nong','M2P1|M2P2','COMPLETED','VERIFIED_TEST','private report'];
const treatment=['BSE-TG-772257161|Treatment_Event_Log','772257161','TX-15','batch','2026-10-15','Timun','Axtraroots - 60\nenvoy - 20','["M5P1","M5P2"]','COMPLETED','VERIFIED_TEST','private raw report'];
const ctx={
 bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',
 BSE_TRANSPLANT_EVENT_HEADERS:[], BSE_TREATMENT_EVENT_HEADERS:[],
 bseTransplantRowsByName_:(_b,n)=> n==='TEST_TRANSPLANT_EVENT'?[transplant]:n==='TEST_TREATMENT_EVENT'?[treatment]:[],
 bseTelegramHistoryRecordEvents_:()=>[{date:'2026-10-15',reference:'BSE-TG-772257161',reporter_user_id:'owner',visibility:'PRIVATE_SUBMISSION',pilot_summary:'old approval'},{date:'2026-10-14',reference:'BSE-TG-OTHER-SOURCE',reporter_user_id:'owner',visibility:'PRIVATE_SUBMISSION',pilot_summary:'Pindah tanam\nTanaman: Peria Besar\nVarieti: Hup Nong\nTarikh kerja: 2026-10-14\nPlot: M2P1, M2P2\nStatus: Disahkan'},{date:'2026-10-14',reference:'BSE-TG-DISTINCT',reporter_user_id:'owner',visibility:'PRIVATE_SUBMISSION',pilot_summary:'Pindah tanam\nTanaman: Peria Besar\nVarieti: Hup Nong\nTarikh kerja: 2026-10-14\nPlot: M2P3\nStatus: Disahkan'}],
 bseTelegramHistoryEvidenceEvents_:()=>[{date:'2026-10-15',reference:'PRIVATE-EV',reporter_user_id:'owner',visibility:'PRIVATE_SUBMISSION',pilot_summary:'private evidence'}]
};vm.createContext(ctx);
for(const n of ['bseTelegramHistoryPilotOperationalEvents_','bseTelegramHistoryPilotTreatmentEvents_','bseTelegramHistoryCanonicalIdentity_','bseTelegramHistoryAllEvents_','bseTelegramHistoryEventVisibleTo_'])vm.runInContext(extract(n),ctx);
const all=ctx.bseTelegramHistoryAllEvents_({});
assert.equal(all.length,4,'one transplant, one treatment, one distinct private report and private evidence');
assert(!all.some(x=>x.reference==='BSE-TG-OTHER-SOURCE'),'same operation from different source deduplicated');
assert(all.some(x=>x.reference==='BSE-TG-DISTINCT'),'different plot retained for owner');
assert.equal(all.filter(x=>x.category==='Rawatan tanaman').length,1);
assert(!all.some(x=>x.reference==='BSE-TG-772257161'),'duplicate approval excluded');
assert.equal(all.find(x=>x.reference==='TX-15').date,'2026-10-15');
assert(ctx.bseTelegramHistoryEventVisibleTo_(all.find(x=>x.reference==='TX-15'),'registered',false));
assert(!ctx.bseTelegramHistoryEventVisibleTo_(all.find(x=>x.reference==='PRIVATE-EV'),'registered',false));
assert(!JSON.stringify(all).includes('private raw report'));
assert(!JSON.stringify(all).includes('private report'));
assert(extract('bseTelegramHistoryRetrieve_').includes("bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')lines.push('Mod TEST"));
console.log('PILOT_HISTORY_COVERAGE 9/9 PASS');
