/** Telegram plain-text UX overlay; no changes to canonical ledger authority. */
function bseReportMalayPeriod_(period){
 const names=['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
 const m=String(period||'').match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
 if(!m)return String(period||'');
 const n=Number(m[2]);if(n<1||n>12)return String(period||'');
 return (m[3]?Number(m[3])+' ':'')+names[n-1]+' '+m[1];
}
function bseReportPublicAi_(raw){
 let t=bseReportCleanAi_(raw);
 // Canonical identifiers are internal, even if Gemini echoes them.
 t=t.replace(/BSE-SB-CB-\d{8}-\d+/gi,'kitaran tanaman');
 t=t.replace(/\b(?:CYCLE_END|SEED_SOWING|HARVEST_START|TRANSPLANT)\b/g,m=>({CYCLE_END:'tamat kitaran',SEED_SOWING:'semai',HARVEST_START:'mula tuai',TRANSPLANT:'pindah tanam'}[m]));
 t=t.replace(/\b(?:unlinked|linked cycles|batch ID)\b/gi,'rekod tidak berpaut');
 // Put the user's requested subheadings and enumerations on separate lines.
 t=t.replace(/([•]\s*Aktiviti:\s*[^\n]*?)(Aktiviti utama merangkumi\s*[;:]?)/gi,'$1\n\n$2');
 t=t.replace(/Aktiviti utama merangkumi\s*[;:]?\s*([^\n]+)/gi,(_,items)=>{
   const bits=items.replace(/[.]$/,'').split(/,\s*(?![^()]*\))/).map(x=>x.trim()).filter(Boolean);
   return 'Aktiviti utama merangkumi:\n'+bits.map((x,i)=>(i+1)+'. '+x).join('\n');
 });
 t=t.replace(/([•]\s*Kewangan:\s*)/gi,'\n$1\n');
 t=t.replace(/([•]\s*Tanaman:?)\s*(Melibatkan[^\n]*)/gi,'\n• Tanaman melibatkan varieti:\n1. $2');
 // Separate each substantive risk or expectation instead of a single prose block.
 t=t.replace(/([•]\s*(?:Kitaran Tanaman|Permulaan Baharu|Risiko|Status|Andaian|Had Data):)/gi,'\n$1\n');
 return t.replace(/\n{3,}/g,'\n\n').trim();
}
