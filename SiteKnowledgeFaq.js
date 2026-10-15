
// Read-only, grounded Site B FAQ for PILOT_OPERATION only.
// Other agriculture questions retain the existing /ask_ai path.
function bsePilotSiteBFaq_(book,question){
  const q=String(question||'').toLowerCase().trim();
  let key='';
  if(/(?:berapa|jumlah|bilangan|kapasiti)/.test(q)&&/modul/.test(q))key='modules_total';
  else if(/(?:berapa|jumlah|bilangan|kapasiti)/.test(q)&&/(?:polybag|polibeg|polibag)/.test(q)&&/(?:plot|petak)/.test(q))key='standard_plot_capacity';
  else if(/(?:berapa|jumlah|keluasan|luas)/.test(q)&&/(?:ekar|acre|tanah|kawasan)/.test(q)&&/(?:tanam|bertanam|cultivat)/.test(q))key='active_cultivation_area_reported';
  else if(/(?:berapa|jumlah|keluasan|luas)/.test(q)&&/(?:ekar|acre)/.test(q)&&/(?:site b|tapak|keseluruhan)/.test(q))key='site_area_reported';
  if(!key)return '';
  const sheet=book&&book.getSheetByName('PILOT_KB_FACTS');
  if(!sheet||sheet.getLastRow()<2)return 'Knowledge base Site B belum tersedia. Tiada angka direka.';
  const rows=sheet.getRange(2,1,sheet.getLastRow()-1,7).getValues();
  const matches=rows.filter(r=>String(r[1])===key);
  if(matches.length!==1)return 'Fakta Site B tidak dapat disahkan daripada knowledge base.';
  const r=matches[0],source=String(r[5]||''),confidence=String(r[4]||'');
  let answer=String(r[2])+' '+String(r[3]||'')+'.';
  if(key==='standard_plot_capacity')answer='Plot standard: '+answer+' Plot khas mempunyai kapasiti berbeza; nyatakan ID plot untuk angka tepat.';
  if(key==='modules_total')answer='Site B mempunyai '+answer+' (M1 hingga M8).';
  if(confidence.includes('PROVISIONAL'))answer='Anggaran dilaporkan: '+answer+' Belum disahkan ukuran lapangan terkini.';
  return answer+'\nSumber: '+source+'\nStatus: '+confidence+'.';
}
