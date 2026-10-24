/** Plain-text Telegram presentation. No Markdown parse_mode required. */
function bseReportFriendlyTerm_(s){
 const labels={Inventory_Event:'Inventori',Operation:'Operasi ladang',Plant_Census:'Bancian tanaman',Transplant_Event:'Pindah tanam',Crop_Batch:'Batch tanaman',Planting_Event:'Semaian',Plot_Allocation:'Peruntukan plot',Treatment_Event:'Rawatan',PILOT_EC_CANONICAL_BATCH:'Bacaan EC',SEED_SOWING:'Semai',TRANSPLANT:'Pindah tanam',CYCLE_END:'Tamat kitaran',HARVEST_START:'Mula tuai'};
 return labels[String(s)]||String(s).replace(/_/g,' ');
}
function bseReportCleanAi_(raw){
 let t=String(raw||'').replace(/\\\*/g,'*').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/(^|\n)\s*\*\s+/g,'$1• ').replace(/\*([^*\n]+)\*/g,'$1').replace(/\\_/g,'_').replace(/#{1,4}\s*/g,'').replace(/\n{3,}/g,'\n\n').trim();
 const heads={'1. Dapatan Utama':'🔎 Dapatan utama','2. Trend dan Risiko':'⚠️ Trend dan risiko','3. Jangkaan Kitaran Seterusnya':'🌱 Jangkaan kitaran','4. Perkara Perlu Dipantau':'👀 Perkara dipantau'};
 for(const [a,b] of Object.entries(heads))t=t.split(a).join(b);
 return t;
}
function bseReportPlainSummary_(a){
 const p=String(a.period||'');const lines=['📊 LAPORAN OPERASI — '+p,'','📌 RINGKASAN','Rekod: '+Number(a.records||0)+'  |  Hari aktif: '+Number(a.days||0)];
 const categories=(a.byCategory||[]).slice(0,5),max=Math.max(1,...categories.map(c=>Number(c.count)||0));
 if(categories.length){lines.push('','📈 Pecahan rekod');for(const c of categories){const bars=Math.max(1,Math.round((Number(c.count)||0)*8/max));lines.push('  '+c.name+'  '+String(c.count)+'  '+ '▰'.repeat(bars));}}
 for(const [label,counts] of [['🌿 Tanaman',a.crops],['🛠️ Aktiviti',a.activities],['📍 Plot',a.plots]]){
  const pairs=Object.entries(counts||{}).sort((x,y)=>y[1]-x[1]).slice(0,5);
  if(pairs.length){lines.push('',label);for(const [k,v] of pairs)lines.push('  • '+bseReportFriendlyTerm_(k)+': '+v);}
 }
 const cycles=a.cycles&&Array.isArray(a.cycles.linked)?a.cycles.linked:[];
 if(cycles.length){lines.push('','🌱 KITARAN TANAMAN ('+cycles.length+')');for(const c of cycles.slice(0,4)){
  const suffix=String(c.batch_id||'').split('-').slice(-2).join('-');
  const stages=Array.isArray(c.activities)?c.activities:(Array.isArray(c.stages)?c.stages.map(s=>s.type):[]);
  lines.push('• '+(c.crops||[]).join(', ')+' · '+(c.plots||[]).join(', '));
  lines.push('  '+(stages.map(bseReportFriendlyTerm_).join(' → ')||'Aktiviti belum lengkap')+' · Batch '+suffix);
 }}else if(a.records)lines.push('','🌱 Kitaran tanaman: tiada rekod berpaut untuk tempoh ini');
 if(a.cycles&&a.cycles.unlinked_records)lines.push('ℹ️ '+a.cycles.unlinked_records+' rekod belum berpaut pada batch.');
 if(!a.records)lines.push('Tiada rekod disahkan bagi tempoh ini.');
 return lines.join('\n');
}
function bseReportCompose_(aggregate,gemini){
 const base=bseReportPlainSummary_(aggregate);
 const ai=gemini&&gemini.ok?bseReportCleanAi_(gemini.text):'Analisis AI tidak tersedia. Data ringkasan masih boleh digunakan.';
 // Send a complete, readable message; never cut mid-word or mid-section.
 const reserved=135,limit=3800;let room=limit-base.length-reserved;
 let commentary='';if(room>130){commentary=ai.length<=room?ai:ai.slice(0,room).replace(/\s+\S*$/,'')+'\n… Analisis diringkaskan.';}
 const result=base+(commentary?'\n\n🧠 ANALISIS & JANGKAAN\n'+commentary:'')+'\n\nℹ️ Data PILOT sahaja. Jangkaan bukan fakta; tiada rekod rasmi BSE diubah.';
 return result.slice(0,4000);
}
