'use strict';
// GI-FULL-PARITY-P1-SYNTHETIC-COVERAGE-01
// TEST_ONLY synthetic inputs; VM isolation; NO Google/Telegram/Drive/OCR network.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const report=[];let writes=0,sends=0,providerCalls=0;
function scope(file,globals={}) {
 const c=vm.createContext({console,Date,Math,JSON,Set,...globals});
 vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),c,{filename:file,timeout:2000});
 return c;
}
function test(group,name,fn) {
 try{fn();report.push({group,name,verdict:'PASS'});console.log('PASS '+group+' '+name);}
 catch(e){report.push({group,name,verdict:'FAIL',reason:e.message});console.error('FAIL '+group+' '+name+' '+e.stack);}
}
// FP-01: actual domain parsers and pre-write review gate.
const ec=scope('EcLeachateTest.js');
const ecValid='REKOD EC LEACHING\nTarikh: 18/10/2026\nSesi: PAGI\nM1P1 - 1.2 : AK\nM1P2 - x : x';
test('FP-01','EC missing session stops as NEED_INFO',()=>{
 const x=ec.bseEcLeachateParseMessage_(ecValid.replace('Sesi: PAGI\n',''));
 assert.equal(x.validation,'NEED_INFO');assert(x.candidates[0].missing.includes('session'));
});
test('FP-01','EC duplicate plot scope stops',()=>{
 const x=ec.bseEcLeachateParseMessage_(ecValid+'\nM1P1 - 1.3 : 0.7');
 assert.equal(x.validation,'NEED_INFO');assert(x.candidates[0].missing.includes('duplicate_scope'));
});
test('FP-01','EC zero and unmeasured semantics, never canonical on parse',()=>{
 const x=ec.bseEcLeachateParseMessage_(ecValid);
 assert.equal(x.validation,'PASS');assert.equal(x.production_write,false);
 const r=x.candidates[0].fields.readings;assert(r.some(y=>y.input_status==='AK_ZERO'&&y.ec_in_next===0));
 assert(r.some(y=>y.input_status==='NOT_MEASURED'&&y.ec_leachate_out===''));
 assert.equal(x.candidates[0].fields.verification_status,'PROVISIONAL');
});
const sulam=scope('PlantReplacementReviewTest.js',{bseReviewContextValidate_:x=>x});
const sulamValid={production_write:false,validation:'PASS',candidates:[{target:'Plant_Replacement_Event_Log',validation:'PASS',missing:[],fields:{project_id:'BSE_SB',system_year:2026,record_type:'PLANT_REPLACEMENT',verification_status:'PROVISIONAL',production_write:false,event_date:'2026-10-18',plot_id:'M1P1',crop:'TEST_ONLY Peria',replacement_count:1,replacement_type:'SULAM'}}]};
test('FP-01','Sulam cannot accept zero replacement count',()=>{
 const bad=structuredClone(sulamValid);bad.candidates[0].fields.replacement_count=0;
 assert.throws(()=>sulam.bsePlantReplacementValidateCandidate_(bad),/Fakta Plant Replacement/);
});
test('FP-01','Sulam cannot force production write',()=>{
 const bad=structuredClone(sulamValid);bad.candidates[0].fields.production_write=true;
 assert.throws(()=>sulam.bsePlantReplacementValidateCandidate_(bad),/Kontrak Plant Replacement/);
});
test('FP-01','Sulam review rejects non-Benar BEFORE writer',()=>{
 assert.throws(()=>sulam.bsePlantReplacementReviewCore_({}, {action:'BATAL',proposalResult:sulamValid}),/hanya direkod selepas Benar/);
});
const census=scope('CensusReviewTest.js');
test('FP-01','Census missing count cannot be invented',()=>{
 assert.equal(census.bseCensusOperationalCount_('Sakit: 2','Mati|Dead'),null);
 assert.equal(census.bseCensusOperationalCount_('Mati: 2','Mati|Dead'),2);
});
test('FP-01','Census source disagreement preserved as separate values',()=>{
 const r=census.bseCensusOperationalLivingValues_('Hidup: 18',['Hidup: 16'],'M1P1');
 assert.deepEqual(Array.from(r),[18,16]);
});
// FP-02: actual inventory, claim, asset reconciliation and maintenance validators.
const inventory=scope('InventoryReviewTest.js');
test('FP-02','Claim missing identity and invalid amount rejected',()=>{
 const x=inventory.bseInventoryValidateClaim_({claimant:'',item_name:'TEST_ONLY item',amount_myr:-2,event_date:'2026-10-18'});
 assert.equal(x.ok,false);assert(x.missing.includes('claimant'));assert(x.missing.includes('amount_myr'));
});
test('FP-02','Claim valid positive amount remains candidate only',()=>{
 const x=inventory.bseInventoryValidateClaim_({claimant:'TEST_ONLY',item_name:'TEST_ONLY item',amount_myr:'1,200.50',event_date:'2026-10-18'});
 assert.equal(x.ok,true);assert.equal(x.amount_myr,1200.5);
});
test('FP-02','Duplicate asset source key with diverging rows conflicts',()=>{
 const a=Array(21).fill('');a[0]='TEST_ONLY|ASSET'; const b=a.slice();
 assert.equal(inventory.bseInventoryAssetRecoveryDecision_([a,b],'TEST_ONLY|ASSET','ev','hash','ASSET_PROPOSAL').state,'CONFLICT');
});
test('FP-02','Asset event mismatch never classified as recovery',()=>{
 const a=Array(21).fill('');a[0]='TEST_ONLY|ASSET';a[1]='other-event';
 assert.equal(inventory.bseInventoryAssetRecoveryDecision_([a],'TEST_ONLY|ASSET','ev','hash','ASSET_PROPOSAL').state,'CONFLICT');
});
test('FP-02','Absent asset record may be proposed, not assumed applied',()=>{
 assert.equal(inventory.bseInventoryAssetRecoveryDecision_([],'TEST_ONLY|ASSET','ev','hash','ASSET_PROPOSAL').state,'NEW');
});
test('FP-02','Review replay with conflicting payload stays conflict',()=>{
 const prior={source_key:'TEST_ONLY|INV',payload_hash:'old-hash',decision:'APPROVED'};
 assert.equal(inventory.bseInventoryDecisionFromPrior_([prior],'TEST_ONLY|INV','new-hash','APPROVED').state,'CONFLICT');
});
const maintenance=scope('MaintenanceReviewTest.js');
test('FP-02','Maintenance missing asset/date stays NEED_INFO',()=>{
 const x=maintenance.bseMaintenanceValidateProposal_({event_type:'MAINTENANCE_ISSUE',asset_or_component:'',event_date:'',production_write:false});
 assert.equal(x.ok,false);assert(x.missing.includes('asset_or_component'));assert(x.missing.includes('event_date'));
});
test('FP-02','Maintenance request with production flag fails closed',()=>{
 const x=maintenance.bseMaintenanceValidateProposal_({event_type:'MAINTENANCE_COMPLETED',asset_or_component:'TEST_ONLY pam',event_date:'2026-10-18',production_write:true});
 assert.equal(x.ok,false);assert(x.missing.includes('production_write'));
});
// FP-04: actual OCR controller, with forbidden provider/transport calls trapped.
const fakeEvidence=Array(22).fill('');
fakeEvidence[0]='BSE-EV-TESTONLY123';fakeEvidence[4]='200';fakeEvidence[8]='PHOTO';
fakeEvidence[9]='TEST_ONLY_FILE_ID';fakeEvidence[11]='image/jpeg';
fakeEvidence[16]='CONFIRMED_TEST';fakeEvidence[19]='TEST_ONLY_DRIVE_ID';
let ocrAccess='REGISTERED_ACTIVE',ocrActor='300',ocrEvidence=fakeEvidence.slice();
const ocr=scope('EvidenceOcrTest.js',{
 bseEvidenceFindById_:()=>({row:ocrEvidence}),
 bseTelegramRegistrationPrivateAccess_:()=>({status:ocrAccess}),
 bseTestOwnerForTelegramUser_:(_book,user)=>({ok:String(user)==='100'}),
 bseRuntimeEvidenceIsConfirmed_:state=>state==='CONFIRMED_TEST'||state==='CONFIRMED',
 bseEvidenceOcrSheet_:()=>{writes++;throw Error('FORBIDDEN_OCR_SHEET');},
 bseEvidenceOcrExtract_:()=>{providerCalls++;throw Error('FORBIDDEN_PROVIDER');},
 bseTelegramApi_:()=>{sends++;throw Error('FORBIDDEN_TRANSPORT');}
});
const ocrMsg=(user,text='/ocr BSE-EV-TESTONLY123')=>({from:{id:user},chat:{id:user,type:'private'},text});
test('FP-04','OCR unrelated active member denied before sheet/provider',()=>{
 const a=ocr.bseEvidenceOcrRetrieve_({},ocrMsg('300'));
 assert.equal(a.handled,true);assert.match(a.text,/tidak mempunyai akses/);
});
test('FP-04','OCR group/unregistered denied before sheet/provider',()=>{
 ocrAccess='NOT_PRIVATE';const a=ocr.bseEvidenceOcrRetrieve_({},ocrMsg('200'));
 assert.equal(a.handled,true);assert.match(a.text,/PM bot/);ocrAccess='REGISTERED_ACTIVE';
});
test('FP-04','OCR rejects unconfirmed evidence before provider',()=>{
 ocrEvidence=fakeEvidence.slice();ocrEvidence[16]='OPEN';
 const a=ocr.bseEvidenceOcrRetrieve_({},ocrMsg('200'));
 assert.match(a.text,/sudah CONFIRMED/);ocrEvidence=fakeEvidence.slice();
});
test('FP-04','OCR rejects non-photo media before provider',()=>{
 ocrEvidence=fakeEvidence.slice();ocrEvidence[8]='DOCUMENT';ocrEvidence[11]='application/pdf';
 const a=ocr.bseEvidenceOcrRetrieve_({},ocrMsg('200'));
 assert.match(a.text,/PHOTO\/image/);ocrEvidence=fakeEvidence.slice();
});
test('FP-04','OCR command injection/extra tokens not accepted',()=>{
 assert.equal(ocr.bseEvidenceOcrCommand_('/ocr BSE-EV-TESTONLY123 extra'),null);
 assert.equal(ocr.bseEvidenceOcrCommand_('/ocr confirm BSE-EV-TESTONLY123;DROP'),null);
});
test('FP-04','NO OCR provider, transport, or sheet write attempted in negative paths',()=>{
 assert.deepEqual({providerCalls,sends,writes},{providerCalls:0,sends:0,writes:0});
});
// FP-05: actual evidence retrieval with test-only Sheets/Telegram adapters.
let memberState='REGISTERED_ACTIVE',actor='300';
let retrievalRow=Array(23).fill('');retrievalRow[0]='BSE-EV-TESTONLY123';retrievalRow[4]='200';
retrievalRow[8]='PHOTO';retrievalRow[9]='TEST_ONLY_FILE_ID';retrievalRow[15]='PRIVATE_SUBMISSION';retrievalRow[16]='CONFIRMED_TEST';
const auditRows=[],fakeSend=[];
const retrieval=scope('TelegramRetrievalTest.js',{
 bseTelegramRegistrationPrivateAccess_:()=>({status:memberState}),
 bseTelegramEvidenceRows_:()=>[retrievalRow],
 bseTelegramEvidenceSheet_:()=>({}),
 bseRuntimeEvidenceIsConfirmed_:status=>status==='CONFIRMED_TEST',
 bseTestOwnerForTelegramUser_:(_b,user)=>({ok:user==='100'}),
 bseTelegramRetrievalAudit_:()=>({appendRow:r=>auditRows.push(r)}),
 bseTelegramApi_:(type,args)=>{fakeSend.push({type,args});return {};},
 SpreadsheetApp:{flush:()=>{}}
});
// Source function declarations override VM globals: inject storage sink AFTER evaluating source.
retrieval.bseTelegramRetrievalAudit_=()=>({appendRow:r=>auditRows.push(r)});
const retMsg=(id,text='/retrieve BSE-EV-TESTONLY123')=>({from:{id},chat:{id,type:'private'},text});
test('FP-05','Unrelated MEMBER denied private Evidence and no transport',()=>{
 const r=retrieval.bseTelegramEvidenceRetrieve_({},retMsg('300'));
 assert.match(r.text,/tidak mempunyai akses/);assert.equal(fakeSend.length,0);
 assert.equal(auditRows.at(-1)[4],'DENIED');assert.equal(auditRows.at(-1)[5],'VISIBILITY_DENIED');
});
test('FP-05','Inactive reporter denied even for own evidence',()=>{
 memberState='INACTIVE';const r=retrieval.bseTelegramEvidenceRetrieve_({},retMsg('200'));
 assert.match(r.text,/ahli aktif/);assert.equal(fakeSend.length,0);memberState='REGISTERED_ACTIVE';
});
test('FP-05','Unconfirmed group-standard evidence cannot be sent',()=>{
 retrievalRow[15]='GROUP_STANDARD';retrievalRow[16]='OPEN';
 const r=retrieval.bseTelegramEvidenceRetrieve_({},retMsg('300'));
 assert.match(r.text,/belum disahkan/);assert.equal(fakeSend.length,0);
 retrievalRow[16]='CONFIRMED_TEST';
});
test('FP-05','Registered user can retrieve GROUP_STANDARD via mock transport only',()=>{
 const r=retrieval.bseTelegramEvidenceRetrieve_({},retMsg('300'));
 assert.equal(r.handled,true);assert.equal(fakeSend.length,1);
 assert.equal(fakeSend[0].type,'sendPhoto');
 assert.equal(fakeSend[0].args.photo,'TEST_ONLY_FILE_ID');
 assert(!('drive_url' in fakeSend[0].args));
});
test('FP-05','OWNER and reporter can retrieve private Evidence (mock only)',()=>{
 retrievalRow[15]='PRIVATE_SUBMISSION';
 const before=fakeSend.length;
 retrieval.bseTelegramEvidenceRetrieve_({},retMsg('100'));
 retrieval.bseTelegramEvidenceRetrieve_({},retMsg('200'));
 assert.equal(fakeSend.length-before,2);
});
test('FP-05','Unknown/spoofed reference never sends',()=>{
 const before=fakeSend.length;
 assert.equal(retrieval.bseTelegramEvidenceRetrieve_({},retMsg('300','/retrieve BSE-EV-TESTONLY123 extraneous')).handled,false);
 assert.equal(fakeSend.length,before);
});
test('GLOBAL','No real external systems were accessible',()=>{
 assert.equal(providerCalls,0);assert.equal(sends,0);assert.equal(writes,0);
 assert(fakeSend.every(x=>x.args.chat_id==='100'||x.args.chat_id==='200'||x.args.chat_id==='300'));
});
const failed=report.filter(x=>x.verdict==='FAIL');
console.log('GI_FULL_PARITY_P1_SUMMARY '+JSON.stringify({total:report.length,passed:report.length-failed.length,failed:failed.length,groups:Object.fromEntries([...new Set(report.map(x=>x.group))].map(g=>[g,{passed:report.filter(x=>x.group===g&&x.verdict==='PASS').length,failed:report.filter(x=>x.group===g&&x.verdict==='FAIL').length}])),simulatedSends:fakeSend.length,realTransportSends:sends,providerCalls,writes}));
if(failed.length)process.exitCode=1;
