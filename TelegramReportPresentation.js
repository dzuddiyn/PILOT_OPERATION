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
 const p=String(a.period||'');const lines=['📊 LAPORAN OPERASI — '+bseReportMalayPeriod_(p),'','📌 RINGKASAN','Rekod: '+Number(a.records||0)+'  |  Hari aktif: '+Number(a.days||0)];
 const categories=(a.byCategory||[]).slice(0,5),max=Math.max(1,...categories.map(c=>Number(c.count)||0));
 if(categories.length){lines.push('','📈 Pecahan rekod');for(const c of categories){const bars=Math.max(1,Math.round((Number(c.count)||0)*8/max));lines.push('  '+c.name+'  '+String(c.count)+'  '+ '▰'.repeat(bars));}}
 const cycles=a.cycles&&Array.isArray(a.cycles.linked)?a.cycles.linked.filter(c=>String(c.batch_id||'')!=='BSE-SB-CB-20260808-003'):[];
 const byPlot=new Map();
 for(const c of cycles){
  const plots=Array.isArray(c.plots)?c.plots.filter(x=>/^M[0-9]+P[0-9]+$/.test(String(x))):[];
  for(const plot of plots){if(!byPlot.has(plot))byPlot.set(plot,[]);byPlot.get(plot).push(c);}
 }
 if(byPlot.size){lines.push('','🌱 KITARAN TANAMAN — MENGIKUT PLOT');
  for(const [plot,items] of Array.from(byPlot.entries()).sort((a,b)=>a[0].localeCompare(b[0],undefined,{numeric:true})).slice(0,12)){
   lines.push('','📍 '+plot);
   for(const c of items){
    const name=(c.crops||[]).join(', ')||'Tanaman tidak dinyatakan';
    const variety=String(c.variety||'').trim();
    const all=Array.isArray(c.stages)?c.stages:[];
    const last=all.filter(x=>x&&['CYCLE_END','HARVEST_START','TRANSPLANT','SEED_SOWING'].includes(String(x.type))).sort((x,y)=>String(x.date||'').localeCompare(String(y.date||'')))[all.filter(x=>x&&['CYCLE_END','HARVEST_START','TRANSPLANT','SEED_SOWING'].includes(String(x.type))).length-1];
    const phases={SEED_SOWING:'🌱 Fasa Semaian',TRANSPLANT:'🌿 Fasa Pertumbuhan',HARVEST_START:'🥒 Fasa Tuaian',CYCLE_END:'🛠️ Fasa Penyelenggaraan'};
    lines.push('  '+name+(variety?' — '+variety:''));
    lines.push('  '+(last&&phases[last.type]||'Fasa belum dapat dipastikan'));
   }
  }
 }else if(a.records)lines.push('','🌱 Tiada kitaran tanaman berpaut pada plot untuk tempoh ini.');
 if(!a.records)lines.push('Tiada rekod disahkan bagi tempoh ini.');
 return lines.join('\n');
}
function bseReportCompose_(aggregate,gemini){
 const base=bseReportPlainSummary_(aggregate);
 const ai=gemini&&gemini.ok?bseReportPublicAi_(gemini.text):'Analisis AI tidak tersedia. Data ringkasan masih boleh digunakan.';
 // Send a complete, readable message; never cut mid-word or mid-section.
 const reserved=135,limit=3800;let room=limit-base.length-reserved;
 let commentary='';if(room>130){commentary=ai.length<=room?ai:ai.slice(0,room).replace(/\s+\S*$/,'')+'\n… Analisis diringkaskan.';}
 const result=base+(commentary?'\n\n🧠 ANALISIS & JANGKAAN\n'+commentary:'')+'\n\nℹ️ Data PILOT sahaja. Jangkaan bukan fakta; tiada rekod rasmi BSE diubah.';
 return result.slice(0,4000);
}
