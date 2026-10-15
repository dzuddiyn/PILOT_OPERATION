// PILOT_OPERATION only: grounded Site B structural reference, no operational writes.
function bsePilotKbStructuredAnswer_(book,question){
 if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return '';
 const q=String(question||'').toLowerCase().trim();
 const ask=/(?:berapa|jumlah|bilangan|kapasiti|luas|keluasan|saiz|ukuran|spesifikasi|apa|apakah|senaraikan|status)/.test(q);
 if(!ask)return '';
 const read=name=>{const s=book&&book.getSheetByName(name);return s&&s.getLastRow()>1?s.getRange(2,1,s.getLastRow()-1,7).getValues():[];};
 const facts=read('PILOT_KB_FACTS');
 const fact=key=>facts.find(r=>String(r[1]).toLowerCase()===key.toLowerCase());
 const reply=(row,prefix)=>row?(prefix+String(row[2])+(row[3]?' '+row[3]:'')+'.\nSumber: '+row[5]+'\nStatus: '+row[4]+(String(row[4]).includes('PROVISIONAL')?' (anggaran; belum disahkan semasa).':'')):'Maklumat tidak tersedia dalam knowledge base yang disahkan.';
 const plot=(q.match(/\bm[1-8]p[1-4](?:[ab])?\b/i)||[])[0];
 if(plot&&/(?:polybag|polibeg|polibag|kapasiti|berapa|status)/.test(q)){
  const key=plot.toUpperCase()+'_capacity';const row=fact(key);
  if(row)return reply(row,'Kapasiti '+plot.toUpperCase()+': ');
  const s=book.getSheetByName('PILOT_KB_PLOT_REGISTRY');
  if(!s||s.getLastRow()<2)return 'Maklumat plot tidak tersedia.';
  const records=s.getRange(2,1,s.getLastRow()-1,7).getValues(),r=records.find(x=>String(x[0]).toLowerCase()===plot.toLowerCase());
  if(!r)return 'Plot tidak ditemui dalam registry.';
  if(!r[4])return plot.toUpperCase()+': kapasiti tidak direkodkan ('+r[3]+').\nSumber: Plot_Registry.csv';
  return plot.toUpperCase()+': '+r[4]+' polybag (design capacity, '+r[3]+').\nSumber: Plot_Registry.csv\nNota: '+(r[5]||'Tiada')+'.';
 }
 if(/modul/.test(q))return reply(fact('modules_total'),'Jumlah modul: ');
 if(/(?:polybag|polibeg|polibag)/.test(q)&&/(?:plot|petak)/.test(q))return reply(fact('standard_plot_capacity'),'Kapasiti plot standard: ')+' Plot khas berbeza.';
 if(/(?:ekar|acre|keluasan|luas)/.test(q)){
  if(/(?:tanam|bertanam|cultivat)/.test(q))return reply(fact('active_cultivation_area_reported'),'Kawasan bertanaman dilaporkan: ');
  return reply(fact('site_area_reported'),'Keluasan tapak dilaporkan: ');
 }
 if(/(?:baris|rows)/.test(q))return reply(fact('standard_plot_rows'),'Plot standard: ');
 if(/(?:tangki|pam|kolam|wire|kawat|anchor|polybag 16)/.test(q)){
  const rows=read('PILOT_KB_INFRASTRUCTURE');
  const terms=['pam','tangki','kolam','kawat','wire','anchor','polybag'];const needle=terms.find(t=>q.includes(t));
  const found=rows.filter(r=>String(r.slice(0,5).join(' ')).toLowerCase().includes(needle||'___'));
  if(!found.length)return 'Tiada butiran infrastruktur yang sepadan dalam registry. Jangan anggap peralatan tidak wujud.';
  return found.slice(0,5).map(r=>r[2]+': '+r[3]).join('\n')+'\nSumber: Infrastructure_Registry.csv (reference, bukan status fizikal semasa).';
 }
 return '';
}
function runBsePilotKbStructuredHarness(){
 const props=PropertiesService.getScriptProperties();
 const old=props.getProperty('BSE_RUNTIME_ENV');
 try{props.setProperty('BSE_RUNTIME_ENV','PILOT_OPERATION');
  const tab={PILOT_KB_FACTS:[['site','modules_total','8','modul','VERIFIED_DESIGN','Plot_Registry.csv',''],['plot','standard_plot_capacity','2808','polybag','DESIGN_CAPACITY','Plot_Registry.csv',''],['area','active_cultivation_area_reported','30','ekar','PROVISIONAL_APPROXIMATE','Project_Profile.csv',''],['plot','M7P1_capacity','408','polybag','CONFIRMED_ACTUAL','Plot_Registry.csv','']],PILOT_KB_PLOT_REGISTRY:[['M4P3','M4','UNDEVELOPED','ALLOCATED_NOT_DEVELOPED','','Still bush','']]};
  const book={getSheetByName:n=>tab[n]?{getLastRow:()=>tab[n].length+1,getRange:()=>({getValues:()=>tab[n]})}:null};
  const cases=[['berapa modul',/8/],['berapa polybag per plot',/2808/],['berapa kapasiti M7P1',/408/],['berapa ekar tanah bertanam',/PROVISIONAL/],['berapa kapasiti M4P3',/tidak direkodkan/],['berapa pam air',/Tiada butiran/]];
  const fail=cases.filter(([q,re])=>!re.test(bsePilotKbStructuredAnswer_(book,q)));
  if(fail.length)throw new Error('KB HARNESS FAILED: '+fail.map(x=>x[0]).join(', '));
  return {passed:cases.length,failed:0,production_write:false};
 }finally{if(old==null)props.deleteProperty('BSE_RUNTIME_ENV');else props.setProperty('BSE_RUNTIME_ENV',old);}
}
