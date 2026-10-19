'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={console};vm.createContext(ctx);
for(const f of ['TelegramEvidenceTest.js','ImageProcessingTest.js','ImageActionTest.js','EvidenceOcrTest.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx,{filename:f});
let n=0;function test(label,fn){fn();n++;console.log('PASS '+label)}
const photo={photo:[{file_id:'PHOTOid123456',file_unique_id:'UIDphoto1234',file_size:500},{file_id:'PHOTOid123457',file_unique_id:'UIDphoto1234',file_size:900}],message_id:42,caption:'plot M1P1'};
test('highest resolution photo chosen with stable file unique ID',()=>{const r=ctx.bseTelegramEvidenceAttachment_(photo);assert.equal(r.type,'PHOTO');assert.equal(r.fileId,'PHOTOid123457');assert.equal(r.uniqueId,'UIDphoto1234');assert.equal(r.mime,'image/jpeg')});
test('document metadata retains Telegram unique and mime lineage',()=>{const r=ctx.bseTelegramEvidenceAttachment_({document:{file_id:'DOCid123456',file_unique_id:'UIDdoc1234',mime_type:'application/pdf',file_name:'FICTIONAL.pdf',file_size:1024}});assert.equal(r.type,'DOCUMENT');assert.equal(r.uniqueId,'UIDdoc1234');assert.equal(r.mime,'application/pdf')});
test('video metadata is not silently misclassified as photo',()=>{const r=ctx.bseTelegramEvidenceAttachment_({video:{file_id:'VIDEOid123456',file_unique_id:'UIDvideo1234',file_size:2048}});assert.equal(r.type,'VIDEO');assert.equal(r.mime,'video/mp4')});
test('non-attachment message returns null',()=>assert.equal(ctx.bseTelegramEvidenceAttachment_({text:'FICTIONAL'}),null));
test('caption categories separate inventory/admin/field/unknown',()=>{assert.equal(ctx.bseTelegramEvidenceCategory_('Resit stok'),'INVENTORY_CLAIM');assert.equal(ctx.bseTelegramEvidenceCategory_('Surat admin'),'ADMIN_DOCUMENT');assert.equal(ctx.bseTelegramEvidenceCategory_('Plot pokok'),'FIELD_OPERATION');assert.equal(ctx.bseTelegramEvidenceCategory_('Gambar'),'UNCLASSIFIED_TEST')});
test('visibility never promotes private submission to group standard',()=>{for(const cat of ['FIELD_OPERATION','INVENTORY_CLAIM','ADMIN_DOCUMENT'])assert.equal(ctx.bseImageProcessingVisibility_('private',cat),'PRIVATE_SUBMISSION')});
test('group restricted categories fail closed',()=>{for(const cat of ['INVENTORY_CLAIM','ADMIN_DOCUMENT','UNCLASSIFIED_TEST'])assert.equal(ctx.bseImageProcessingVisibility_('group',cat),'RESTRICTED');assert.equal(ctx.bseImageProcessingVisibility_('group','FIELD_OPERATION'),'GROUP_STANDARD')});
test('explicit caption commands routed with bounded instruction',()=>{assert.equal(ctx.bseImageProcessingCaptionMeta_('/image_to_text FICTIONAL').mode,'IMAGE_TO_TEXT');assert.equal(ctx.bseImageProcessingCaptionMeta_('/image_analysis@opsmate '+'a'.repeat(2200)).instruction.length,2000);assert.equal(ctx.bseImageProcessingCaptionMeta_('foto biasa').mode,'')});
test('OCR command parses evidence identity without executing extraction',()=>{assert.equal(ctx.bseEvidenceOcrCommand_('/ocr BSE-EV-FICTIONAL123').action,'EXTRACT');assert.equal(ctx.bseEvidenceOcrCommand_('/ocr confirm BSE-EV-FICTIONAL123').action,'CONFIRM');assert.equal(ctx.bseEvidenceOcrCommand_('/ocr discard BSE-EV-FICTIONAL123').action,'DISCARD')});
test('image action callback accepts only defined action alphabet',()=>{assert(ctx.bseImageActionIsCallback_({callback_query:{data:'IA1:AbCdEf123:E'}}));assert(!ctx.bseImageActionIsCallback_({callback_query:{data:'IA1:AbCdEf123:X'}}))});
test('evidence callback accepts only approve/discard',()=>{assert(ctx.bseTelegramEvidenceIsCallback_({callback_query:{data:'E1:AbCdEf123:A'}}));assert(ctx.bseTelegramEvidenceIsCallback_({callback_query:{data:'E1:AbCdEf123:R'}}));assert(!ctx.bseTelegramEvidenceIsCallback_({callback_query:{data:'E1:AbCdEf123:Z'}}))});
test('error normalizer does not leak credentials or raw provider text',()=>{const raw=ctx.bseImageProcessingSafeError_(Error('Bearer SECRET_TOKEN_PRIVATE'));assert.equal(raw,'IMAGE_PROCESSING_ERROR');assert(!raw.includes('SECRET_TOKEN'))});
test('suggested record remains suggestion, not farm domain write',()=>{assert.equal(ctx.bseImageProcessingSuggestedRecordFallback_('rawatan racun'),'Treatment_Event_Log');assert.equal(ctx.bseImageProcessingSuggestedRecordFallback_('generic image'),'EVIDENCE_ONLY')});
test('raw evidence receive guards file IDs, max file size and deduplicates by chat-message-unique',()=>{
 const src=fs.readFileSync(__dirname+'/TelegramEvidenceTest.js','utf8');
 const receiver=src.slice(src.indexOf('function bseTelegramEvidenceReceiveMessage_(book,m){'),src.indexOf('function bseTelegramEvidenceIsCallback_('));
 assert(receiver.includes('a.size>20000000'));assert(receiver.includes("String(r[1])+'|'+String(r[3])+'|'+String(r[10])===key"));
 assert(receiver.includes('REGISTERED_ACTIVE'));assert(receiver.includes('OWNER_ACTIVE'));
});
test('Drive creation is gated behind reporter confirmation and no PILOT auto-create folder',()=>{
 const src=fs.readFileSync(__dirname+'/TelegramEvidenceTest.js','utf8');
 const folder=src.slice(src.indexOf('function bseTelegramEvidenceDriveFolder_('),src.indexOf('function bseTelegramEvidenceCallback_('));
 assert(folder.includes("bseRuntimeEnvironmentName_()!=='TEST'"));assert(folder.includes('auto-create dilarang'));
 const cb=src.slice(src.lastIndexOf('function bseTelegramEvidenceCallback_('));
 assert(cb.includes("actor!==String(r[4])||chat!==String(r[1])"));assert(cb.includes("'DRIVE_CREATE_PENDING'"));assert(cb.includes("m[2]!=='A'"));
});
console.log('TELEGRAM_MEDIA_OCR_EVIDENCE '+n+'/'+n+' PASS (isolated fixture; zero transports)');
