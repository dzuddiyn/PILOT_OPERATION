'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const load=(name,ctx)=>{vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,name),'utf8'),ctx,{filename:name});return ctx;};
let checks=0;
function check(name,run){run();checks++;console.log('PASS '+name);}
let env='PILOT_OPERATION';
const menu=load('TelegramCommandTest.js',{bseRuntimeEnvironmentName_:()=>env});
check('PILOT command menu advertises /ask and /ec, never legacy labels',()=>{
 const names=Array.from(menu.bsePilotTelegramCommandMenu_(),c=>c.command);
 assert(names.includes('ask'));assert(names.includes('ec'));assert(!names.includes('ask_ai'));assert(!names.includes('ec_history'));});
check('TEST and PILOT_TEST keep their historical command menus',()=>{
 for(const e of ['TEST','PILOT_TEST']){env=e;const names=Array.from(menu.bsePilotTelegramCommandMenu_(),c=>c.command);assert(names.includes('ask_ai'));assert(names.includes('ec_history'));assert(!names.includes('ask'));}env='PILOT_OPERATION';});
const ai=load('TelegramAiTest.js',{bseRuntimeEnvironmentName_:()=>env});
check('PILOT /ask works with or without @bot and rejects /ask_ai',()=>{
 assert(ai.bseTelegramAiCommand_('/ask kumpulan IRAC dimethoate?'));
 assert(ai.bseTelegramAiCommand_('/ask@pilot_bot macam mana?'));
 assert.equal(ai.bseTelegramAiQuestion_('/ask test soalan?'),'test soalan?');
 assert(!ai.bseTelegramAiCommand_('/ask_ai wrong'));assert(!ai.bseTelegramAiCommand_('/asking nope'));});
check('TEST still accepts /ask_ai only',()=>{env='TEST';assert(ai.bseTelegramAiCommand_('/ask_ai test'));assert(!ai.bseTelegramAiCommand_('/ask test'));env='PILOT_OPERATION';});
const treat=load('TreatmentReviewTest.js',{});
check('session-only pg/pagi/ptg/petang not treated as chemical products',()=>{
 const body='Racun\n19/10/2026\nIsnin\nPETANG\nMancezob - 500\nTop plus - 140';
 const pending=Array.from(treat.bseTreatmentPendingItems_(body)),items=Array.from(treat.bseTreatmentListItems_(body));
 assert(!pending.some(x=>/^(PG|PAGI|PTG|PETANG)$/i.test(x)));
 assert(items.some(x=>x.product==='Mancezob'&&x.dosage===500));
 assert(items.some(x=>x.product==='Top plus'&&x.dosage===140));
 for(const s of ['PG','pagi','PTG','Petang'])assert(treat.bseTreatmentListControlLine_(s));});
const census=load('CensusReviewTest.js',{
 bsePlotSingleLocation_:(p)=>({plot_id:p,ok:true}),
 bsePlantCensusMalaysiaDate_:()=> '2026-10-21'
});
check('all requested census headline synonyms are recognized',()=>{
 const headings=['REKOD BANCI POKOK','pokok sakit','pokok mati','banci pokok','banci tanaman','kira pokok','kiraan pokok','REKOD BANCI POKOK 6/10/26'];
 for(const title of headings)assert(census.bseCensusOperationalSignal_(title+'\nMati: 143\nSakit: 654'),title);
 assert(!census.bseCensusOperationalSignal_('Racun\n19/10/2026'));});
check('census dates support DD/MM/YYYY, DD/MM/YY, DD-MM-YYYY and ISO with proper validity',()=>{
 const r='2026-10-21T00:00:00.000Z';
 assert.equal(census.bseCensusOperationalDate_('REKOD BANCI POKOK 6/10/26',r,[]),'2026-10-06');
 assert.equal(census.bseCensusOperationalDate_('banci pokok\nTarikh : 19/10/2026',r,[]),'2026-10-19');
 assert.equal(census.bseCensusOperationalDate_('kira pokok\nDate: 19-10-2026',r,[]),'2026-10-19');
 assert.equal(census.bseCensusOperationalDate_('kiraan pokok\n2026-10-14',r,[]),'2026-10-14');
 assert.equal(census.bseCensusOperationalDate_('banci pokok\n31/02/2026',r,[]),'2026-10-21');
});
check('census count aliases accept pokok mati and pokok sakit',()=>{
 assert.equal(census.bseCensusOperationalCount_('Pokok Mati: 143','Mati|Dead'),143);
 assert.equal(census.bseCensusOperationalCount_('Pokok Sakit: 654','Sakit|Sick'),654);
});
const ux=load('TelegramApprovalUiTest.js',{Utilities:{formatDate:(d,t,fmt)=>{assert.equal(t,'Asia/Kuala_Lumpur');return '14/10/2026';}}});
check('actual Sheet Date objects display Malaysian dates',()=>{
 assert.equal(ux.bseApprovalDisplayDate_(new Date('2026-10-14T00:00:00Z')),'14/10/2026');
 assert.equal(ux.bseApprovalDisplayDate_('2026-10-14'),'14/10/2026');
 assert.equal(ux.bseApprovalDisplayDate_('2026-10-14T00:00:00.000Z'),'14/10/2026');
 assert.equal(ux.bseApprovalDisplayDate_('Wed Oct 14 2026 08:00:00 GMT+0800 (Singapore Standard Time)'),'14/10/2026');
});
const ev=load('PilotEvidenceSafeStore.js',{Utilities:{formatDate:()=> '2026-10-20'}});
check('Evidence filename has date + caption + reference, never time',()=>{
 const row=Array(24).fill('');row[0]='BSE-EV-528-ABCDEFGH';row[3]='528';row[6]='2026-10-20T20:06:00.000Z';row[7]='claim racun Swee Chiang RM 159';row[8]='PHOTO';row[10]='abcdefghijk';row[12]='photo.jpg';
 const s=ev.bsePilotEvidenceStoredName_(row);
 assert(s.startsWith('2026-10-21_claim_racun_Swee_Chiang_RM_159_')||s.startsWith('2026-10-20_claim_racun_Swee_Chiang_RM_159_'));
 assert(s.includes('BSE-EV-528-ABCDEFGH'));assert(s.endsWith('.jpg'));assert(!/\d\d:\d\d/.test(s));
 row[7]='Foto semakan 14/10/2026';assert(ev.bsePilotEvidenceStoredName_(row).startsWith('2026-10-14_'));
});
check('legacy Evidence filenames remain discoverable through retained function',()=>{
 const row=Array(24).fill('');row[0]='BSE-EV-528-ABCDEFGH';row[10]='abcdefghijk';row[12]='photo.jpg';
 assert.equal(ev.bsePilotEvidenceStoredName_(row),ev.bsePilotEvidenceLegacyStoredName_(row));
});
const environmentText=fs.readFileSync(path.join(__dirname,'EnvironmentTest.js'),'utf8');
check('PILOT start token is OpsMate and legacy token removed from active config',()=>{
 assert(environmentText.includes("startToken: 'OpsMate'"));
 assert(!environmentText.includes("startToken: 'BSE_PILOT'"));
});
check('PILOT display humanizes confirmation labels without changing stored source',()=>{
 assert(environmentText.includes("CONFIRMED TEST"));
 assert(environmentText.includes('DISAHKAN'));
 assert(environmentText.includes("Status: APPROVED_TEST"));
});
console.log('GI_UX_FOLLOWUP '+checks+'/'+checks+' PASS');
