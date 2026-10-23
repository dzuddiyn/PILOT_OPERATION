/** /ask KB PoC: additive static archive binding, no refresh/synchronization jobs. */
var BSE_PILOT_ASK_KB_MANIFESTS=[
 {id:'1PLNRvOWnSuzQlcC0L8_DvpGyzZdRzjVm7ZMOTS14gf0',
  title:'DOA + SISMARP — KB Archive Manifest',
  source:'DOA portal snapshot + existing SISMARP authority/cache; manifest itself is an archive index, not the raw DOA data'},
 {id:'1ED2v4Wu31DKBaeL5DoHkoVjgxG_TlVsB5VwMuWQPE2Y',
  title:'IRAC MoA v11.5 — KB Archive Manifest',
  source:'IRAC February 2026 source imported into existing Gemini File Search; manifest itself is not the raw IRAC table'}
];
function bsePilotAskKbWords_(s){
 const stop={yang:1,untuk:1,dengan:1,atau:1,dalam:1,tentang:1,adakah:1,apakah:1,bagaimana:1,berapa:1,senarai:1,daripada:1,pada:1,site:1,semua:1,boleh:1,jenis:1,mana:1,buat:1,oleh:1,serta:1,dan:1,itu:1,ini:1,ada:1,apa:1,the:1,of:1,for:1,how:1,are:1,from:1,will:1};
 return Array.from(new Set((String(s||'').toLowerCase().match(/[a-z0-9]{2,}/g)||[])
   .filter(w=>!stop[w]&&w.length>=3))).slice(0,16);
}
const BSE_PILOT_SITE_B_DOC_ID='1iRd8fcbHQbzj04Tnia417iYChFmnBjB2Bft4s2yQnyA';
function bsePilotAskKbDocText_(){
 if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return {text:'',live:false};
 try{
   const text=String(DocumentApp.openById(BSE_PILOT_SITE_B_DOC_ID).getBody().getText()||'').trim();
   if(text.length>=500)return {text:text,live:true};
   console.log('PILOT_ASK_DOC_EMPTY_OR_SHORT');
 }catch(error){console.log('PILOT_ASK_DOC_READ_FAILED: '+String(error&&error.message||error).slice(0,100));}
 return {text:typeof BSE_SITE_B_NOTE_POC_TEXT==='string'?BSE_SITE_B_NOTE_POC_TEXT:'',live:false};
}
function bsePilotAskKbNoteContext_(question,doc){
 if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return '';
 const terms=bsePilotAskKbWords_(question);
 if(!terms.length)return '';
 const source=String(doc&&doc.text||bsePilotAskKbDocText_().text||'');
 const blocks=source.split(/\n\s*\n/).map(x=>x.trim()).filter(x=>x.length>=35);
 const ranked=blocks.map((block,i)=>{
   const normalized=block.toLowerCase();const matched=terms.filter(t=>normalized.indexOf(t)>=0);
   const score=matched.length*8 + (matched.length>=2?5:0) - Math.min(block.length/1500,3);
   return {block:block,index:i,score:score,matched:matched.length};
 }).filter(x=>x.matched>=1).sort((a,b)=>b.score-a.score||a.index-b.index);
 if(!ranked.length||ranked[0].score<5)return '';
 const picked=[],seen=new Set();let length=0;
 for(const x of ranked){if(picked.length>=6||length>=6500)break;
   const clean=x.block.slice(0,Math.max(0,6500-length));
   if(!clean||seen.has(clean))continue;
   picked.push(clean);seen.add(clean);length+=clean.length;
 }
 if(!picked.length)return '';
 return '\n\nKB_SITE_B_EXTRACT (snapshot Nota Induk BSE Site B v1.0, 10 Sep 2026; sourced from attached DOCX, NOT live operating status):\n'
   +picked.join('\n---\n')
   +'\nWhen quoting facts here, attribute to Nota Induk BSE Site B (10/09/2026). Do not claim these historical notes reflect current conditions. If not supported by KB, say so and use general knowledge separately.';
}
function bsePilotAskKbManifestContext_(question){
 if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return '';
 const q=String(question||'');
 const relevant=BSE_PILOT_ASK_KB_MANIFESTS.filter(x=>/IRAC|MoA|mode of action/i.test(q)?/IRAC/.test(x.title):/SISMARP|DOA|racun|pestisid|perosak|pendaftaran/i.test(q)?/DOA/.test(x.title):false);
 if(!relevant.length)return '';
 return '\n\nKB_ARCHIVE_MANIFEST_INDEX (the following are archive pointers, NOT substantive pesticide/IRAC reference tables):\n'+
  relevant.map(x=>x.title+' | Google Doc ID: '+x.id+' | '+x.source).join('\n')+
  '\nUse existing Gemini File Search as the source of substantive IRAC/DOA facts; never infer a pesticide class/registration from this manifest alone.';
}
function bsePilotAskKbStatusTest(){
 const store=String(PropertiesService.getScriptProperties().getProperty(BSE_AI_FILE_SEARCH_STORE_PROPERTY)||'').trim();
 return {environment:bseRuntimeEnvironmentName_(),source:'Nota Induk BSE Site B v1.0',
  extracted_characters:typeof BSE_SITE_B_NOTE_POC_TEXT==='string'?BSE_SITE_B_NOTE_POC_TEXT.length:0,
  archive_doc_ids:BSE_PILOT_ASK_KB_MANIFESTS.map(x=>x.id),
  existing_file_search_configured:!!store,production_write:false};
}
