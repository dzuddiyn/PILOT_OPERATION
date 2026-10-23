// Current Google Docs capacity table overrides historical standard-plot narrative.
function bsePilotAskCapacityFromDoc_(question,doc){
 if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return '';
 const q=String(question||'').toLowerCase(),s=String(doc&&doc.live&&doc.text||'');
 if(!/(?:polybag|polibeg|polibag)/i.test(q)||!s)return '';
 const section=s.match(/Kemas kini kapasiti polybag mengikut plot[^]*?(?=Seni bina fertigasi|$)/i);
 if(!section)return '';
 const t=section[0],label='\nSumber: Nota Induk BSE Site B (kemas kini 23/10/2026)\nhttps://docs.google.com/document/d/1iRd8fcbHQbzj04Tnia417iYChFmnBjB2Bft4s2yQnyA/edit';
 const plot=(q.match(/\bm([1-8])p([1-4])([ab])?\b/i)||[])[0];
 if(plot){
   const id=plot.toUpperCase(),escaped=id.replace(/[.*+?^\x24{}()|[\]\\]/g,'\\\x24&');
   const match=t.match(new RegExp('\\b'+escaped+'\\s*:\\s*([0-9,]+)','i'));
   if(match)return id+': '+match[1]+' polybag (kapasiti rujukan).'+label;
   if(new RegExp('\\b'+escaped+'\\b[^\\n]*belum dibangunkan','i').test(t))return id+': belum dibangunkan.'+label;
   return id+': kapasiti tidak dinyatakan dalam jadual terkini.'+label;
 }
 const moduleMatch=q.match(/\b(?:modul\s*|\bm)([1-8])\b/i);
 if(moduleMatch&&!/(?:hingga|sampai|1\s*[-–]\s*8)/.test(q)){
   const row=t.match(new RegExp('^M'+moduleMatch[1]+'\\s*\\|[^\\n]*\\|\\s*([0-9,]+)','im'));
   if(row)return 'M'+moduleMatch[1]+': '+row[1]+' polybag (jumlah kapasiti modul).'+label;
 }
 if(/(?:jumlah|keseluruhan|semua|total|site\s*b|\bbse\b)/.test(q)){
   const m=t.match(/JUMLAH KESELURUHAN:\s*([0-9,]+)/i);
   if(m)return 'Jumlah kapasiti reka bentuk BSE Site B: '+m[1]+' polybag. Bukan bilangan tanaman hidup semasa.'+label;
 }
 return '';
}
