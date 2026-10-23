'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path'),crypto=require('crypto');
const inv=fs.readFileSync(path.join(__dirname,'InventoryReviewTest.js'),'utf8');
const parser=fs.readFileSync(path.join(__dirname,'PilotBajaTest.js'),'utf8');
const flex=fs.readFileSync(path.join(__dirname,'PilotBajaFlexibleTest.js'),'utf8');
const writer=fs.readFileSync(path.join(__dirname,'PilotBajaReviewTest.js'),'utf8');
const ui=fs.readFileSync(path.join(__dirname,'TelegramApprovalUiTest.js'),'utf8');
const worker=fs.readFileSync(path.join(__dirname,'TelegramWorkerTest.js'),'utf8');
let env='PILOT_OPERATION';
const ctx={console,Date,Number,Set,JSON,
 bseRuntimeEnvironmentName_:()=>env,
 bseInventoryPayloadHash_:p=>crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex'),
 bseReviewContextValidate_:c=>c,
 Utilities:{getUuid:()=> 'test-review-id'},SpreadsheetApp:{flush(){}}
};
vm.createContext(ctx);vm.runInContext(inv,ctx);vm.runInContext(parser,ctx);vm.runInContext(flex,ctx);vm.runInContext(writer,ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'PilotIncompleteBatalTest.js'),'utf8'),ctx);
ctx.bseInventoryPayloadHash_=p=>crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex');
let n=0;const t=(title,fn)=>{fn();n++;console.log('PASS '+title)};
const parse=x=>ctx.bsePilotBajaParse_(x,'2026-10-22T10:00:00Z');
const known='22/10/2026';
t('Masuk date, type and quantity required; unit defaults set, item Baja',()=>{
 const r=parse('Baja Masuk\nTarikh: '+known+'\nF 2\nN 3');
 assert.equal(r.validation,'PASS');assert.equal(r.candidates.length,1);
 assert.deepEqual(JSON.parse(JSON.stringify(r.candidates[0].fields.baja_items.map(x=>[x.item_name,x.baja_type,x.quantity,x.unit,x.destination]))),
 [['Baja','F',2,'set',''],['Baja','N',3,'set','']]);
 assert(!r.candidates[0].fields.destination);
});
t('Masuk permits explicit alternate unit but no plot',()=>{
 const r=parse('Baja Masuk\nTarikh: '+known+'\nF 2 kg');assert.equal(r.validation,'PASS');
 assert.equal(r.candidates[0].fields.baja_items[0].unit,'kg');
 const withPlot=parse('Baja Masuk\nTarikh: '+known+'\nPlot: M5P3\nF 2');
 assert.equal(withPlot.validation,'NEED_INFO');
});
t('Masuk absent quantity or absent date blocks all',()=>{
 for(const s of ['Baja Masuk\nTarikh: '+known+'\nF','Baja Masuk\nF 2',
 'Baja Masuk\nTarikh: 32/10/2026\nF 2']){
   const r=parse(s);assert.equal(r.validation,'NEED_INFO',s);
 }
});
t('Keluar type/date/plot mandatory; quantity 1 set PER plot',()=>{
 const r=parse('Baja Keluar\nTarikh: '+known+'\nPlot: M5P3\nF\nN');
 assert.equal(r.validation,'PASS');
 assert.deepEqual(JSON.parse(JSON.stringify(r.candidates[0].fields.baja_items.map(x=>[x.baja_type,x.quantity,x.unit,x.destination]))),
 [['F',1,'set','M5P3'],['N',1,'set','M5P3']]);
});
t('Keluar multiple plots multiply one set each plot by each item',()=>{
 const r=parse('Baja Keluar\nTarikh: '+known+'\nPlot: M5P3, M6P1\nF\nN');
 assert.equal(r.validation,'PASS');
 assert.equal(r.candidates[0].fields.baja_items.length,4);
 assert.equal(new Set(r.candidates[0].fields.baja_items.map(x=>x.baja_type+'|'+x.destination)).size,4);
 assert(r.candidates[0].fields.baja_items.every(x=>x.quantity===1&&x.unit==='set'));
});
t('Keluar missing plot/date/type or unknown line fails closed',()=>{
 const bad=['Baja Keluar\nTarikh: '+known+'\nF',
 'Baja Keluar\nPlot: M5P3\nF',
 'Baja Keluar\nTarikh: '+known+'\nPlot: M5P3',
 'Baja Keluar\nTarikh: '+known+'\nPlot: M5P3\nF\n???'];
 for(const s of bad)assert.equal(parse(s).validation,'NEED_INFO',s);
});
t('No duplicated products, no silent quantity zero, no invented items',()=>{
 for(const s of ['Baja Masuk\nTarikh: '+known+'\nF 2\nF 3',
 'Baja Masuk\nTarikh: '+known+'\nF 0\nN 2',
 'Baja Keluar\nTarikh: '+known+'\nPlot: M5P3\nF\nF']){
   assert.equal(parse(s).validation,'NEED_INFO',s);
 }
});
t('One item-card per complete report; incomplete cannot pass validator',()=>{
 const r=parse('Baja Keluar\nTarikh: '+known+'\nPlot: M5P3\nF\nN');
 assert.equal(ctx.bsePilotBajaValidateResult_(r).validation,'PASS');
 const card=ctx.bsePilotBajaCard_('BSE-TG-772257700',r);
 assert.match(card,/BAJA KELUAR/);assert.match(card,/1\. Baja F — 1 set/);
 assert.match(card,/2\. Baja N — 1 set/);assert(!card.includes('Simpan Draf'));
 const incomplete=parse('Baja Masuk\nTarikh: '+known+'\nF');
 assert.equal(ctx.bsePilotBajaValidateResult_(incomplete).validation,'NEED_INFO');
});
class Sheet{
 constructor(name,headers){this.name=name;this.headers=headers;this.rows=[];this.failOnceAt=0;this.appendCalls=0;}
 getLastRow(){return this.rows.length+1;}
 getRange(r,c,n,w){return {getValues:()=>this.rows.slice(r-2,r-2+n).map(x=>x.slice(c-1,c-1+w))};}
 appendRow(row){this.appendCalls++;if(this.failOnceAt&&this.appendCalls===this.failOnceAt){
  this.failOnceAt=0;throw Error('SYNTHETIC_APPEND_FAIL');
 }this.rows.push(row);}
}
let db;
ctx.bseInventoryMigrateSheetHeaders_=(book,name,headers)=>book.getSheetByName(name)||book.insertSheet(name,headers);
ctx.bseInventoryEnsureSheet_=(book,name,headers)=>book.getSheetByName(name)||book.insertSheet(name,headers);
const book=()=>{const data=new Map();return {
 getSheetByName:name=>data.get(name),
 insertSheet:(name,headers)=>{const s=new Sheet(name,headers);data.set(name,s);return s;},
 data
}};
const context=r=>({reference:'BSE-TG-772257700',actor_name:'dzuddiyn',actor_id:'1234',
 actor_type:'REPORTER',source_channel:'TELEGRAM',action:'APPROVED',proposalResult:r,
 reporter_name:'dzuddiyn'});
t('No ledger write is made by parser, validation, or card preview',()=>{
 db=book();const r=parse('Baja Masuk\nTarikh: '+known+'\nF 2\nN 3');
 ctx.bsePilotBajaValidateResult_(r);ctx.bsePilotBajaCard_('BSE-TG-772257700',r);
 assert.equal(db.data.size,0);
});
t('One Benar writes two typed, separately identifiable Baja items once',()=>{
 db=book();const r=parse('Baja Masuk\nTarikh: '+known+'\nF 2\nN 3');
 const result=ctx.bsePilotBajaReviewCore_(db,context(r));
 assert.equal(result.validation,'PASS');assert.equal(result.record_count,2);
 const sheet=db.getSheetByName('TEST_INVENTORY_EVENT');
 assert.equal(sheet.rows.length,2);assert(sheet.rows.every(x=>x[3]==='Baja'));
 assert.deepEqual(sheet.rows.map(x=>x[26]),['F','N']);
 assert.equal(db.getSheetByName('TEST_INVENTORY_REVIEW').rows.length,1);
 assert(sheet.rows.every(x=>x[12]===false));
 const summary=ctx.bsePilotBajaConfirmedSummary_(db,'BSE-TG-772257700',r);
 assert.match(summary,/Baja F : 2 set/);assert.match(summary,/Baja N : 3 set/);
});
t('Callback retry returns duplicate with no duplicate ledger rows',()=>{
 const r=parse('Baja Masuk\nTarikh: '+known+'\nF 2\nN 3');
 const answer=ctx.bsePilotBajaReviewCore_(db,context(r));
 assert.equal(answer.duplicate,true);
 assert.equal(db.getSheetByName('TEST_INVENTORY_EVENT').rows.length,2);
 assert.equal(db.getSheetByName('TEST_INVENTORY_REVIEW').rows.length,1);
});
t('Partial failure then retry recovers earlier line without duplication',()=>{
 db=book();
 const s=db.insertSheet('TEST_INVENTORY_EVENT',[]);
 s.failOnceAt=2;
 const r=parse('Baja Keluar\nTarikh: '+known+'\nPlot: M5P3\nF\nN');
 assert.throws(()=>ctx.bsePilotBajaReviewCore_(db,context(r)),/SYNTHETIC_APPEND_FAIL/);
 assert.equal(s.rows.length,1);
 const done=ctx.bsePilotBajaReviewCore_(db,context(r));
 assert.equal(done.record_count,2);assert.equal(s.rows.length,2);
 assert.equal(db.getSheetByName('TEST_INVENTORY_REVIEW').rows.length,1);
 assert.deepEqual(s.rows.map(x=>x[26]),['F','N']);
});
t('Ledger conflict fails closed rather than overwrite or double append',()=>{
 const r=parse('Baja Keluar\nTarikh: '+known+'\nPlot: M5P3\nF\nN');
 db.getSheetByName('TEST_INVENTORY_EVENT').rows[0][26]='WRONG';
 assert.throws(()=>ctx.bsePilotBajaReviewCore_(db,context(r)),/CONFLICT/);
});
t('Legacy non-PILOT never routes through new Baja parser',()=>{
 env='TEST';assert.equal(parse('Baja Masuk\nTarikh: '+known+'\nF 2'),null);env='PILOT_OPERATION';
});
t('A single card is wired through worker guard and one reporter notification',()=>{
 assert(worker.includes("f.baja_group===true)return bsePilotBajaValidateResult_(result).validation==='PASS'"));
 assert(ui.includes("bsePilotBajaConfirmedSummary_(book,String(row[0]),parsed)"));
 assert(ui.includes("domain.target==='Plant_Census_Log'||bajaGroup"));
});
t('Incomplete Baja Masuk gives one readable Batal-only card',()=>{
 const r=parse('Baja Masuk\nTarikh: 22/10/2026\nF');
 const row=Array(18).fill('');row[0]='772257800';
 const card=ctx.bsePilotIncompleteCard_(row,r);
 assert.match(card,/BAJA MASUK/);assert.match(card,/Belum lengkap/);
 assert.match(card,/Kuantiti|Format item baja/);
 assert(!/Simpan Draf|Benar/.test(card));
});
t('Incomplete Baja Keluar explains missing plot',()=>{
 const r=parse('Baja Keluar\nTarikh: 22/10/2026\nF\nN');
 const row=Array(18).fill('');row[0]='772257801';
 const card=ctx.bsePilotIncompleteCard_(row,r);
 assert.match(card,/BAJA KELUAR/);assert.match(card,/Plot \(contoh M1P1\)/);
 assert.match(card,/Baja F/);assert(!/Simpan Draf|Benar/.test(card));
});
console.log('GI_UX_04_BAJA_OWNER_CONTRACT '+n+'/'+n+' PASS');

t('Baja in free-order report reads 4 set F without inventing fields',()=>{
 const raw='Baja in\n23/10/2026\n4 set F';
 const r=parse(raw);assert.equal(r.validation,'PASS');
 const item=r.candidates[0].fields.baja_items[0];
 assert.equal(item.baja_type,'F');assert.equal(item.quantity,4);assert.equal(item.unit,'set');
 assert.equal(r.candidates[0].fields.original_note,raw);
});
t('Baja in shorthand still fails closed for missing type',()=>{
 assert.equal(parse('Baja in\n23/10/2026\n4 set').validation,'NEED_INFO');
});

t('Baja Out module-shared P1 P2 yields F per plot, not P2 fertilizer',()=>{
 const r=parse('Baja out\nF\nM1 P1 P2\n19/10/2026');
 assert.equal(r.validation,'PASS');
 assert.deepEqual(JSON.parse(JSON.stringify(r.candidates[0].fields.baja_items.map(x=>[x.baja_type,x.quantity,x.unit,x.destination]))),[['F',1,'set','M1P1'],['F',1,'set','M1P2']]);
});
t('Baja Out module-shared P3 P4 works',()=>{
 const r=parse('baja out , F , M3 P3 P4 , 20/10/2026');
 assert.equal(r.validation,'PASS');
 assert.deepEqual(r.candidates[0].fields.baja_items.map(x=>x.destination).join(','),'M3P3,M3P4');
});
t('Baja In 4 set F remains PASS',()=>{
 const r=parse('Baja in\n23/10/2026\n4 set F');assert.equal(r.validation,'PASS');
 assert.equal(r.candidates[0].fields.baja_items[0].quantity,4);
});
t('Date roundtrip guard',()=>{assert(writer.includes('Utilities.formatDate'));assert(writer.includes('getSpreadsheetTimeZone'));});
