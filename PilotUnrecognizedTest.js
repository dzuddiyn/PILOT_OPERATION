/** @OnlyCurrentDoc */
// PILOT-only handling for short unrecognized plain text, including comma-separated words. No AI or domain operation.
function bsePilotUnrecognizedPlainText_(input){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return false;
  const word=String(input||'').trim();
  // Short, harmless-looking unknown chatter; never route reports or commands away.
  if(word.length<3||word.length>80||!/[\p{L}]/u.test(word)||! /^[\p{L}\s,.;!?'-]+$/u.test(word))return false;
  const words=word.split(/[^\p{L}]+/u).filter(Boolean);
  if(words.length<1||words.length>5)return false;
  const known=['banci','rekod','semai','semaian','tanam','pindah','transplant',
    'racun','rawatan','baja','inventori','claim','tuntutan','hasil','tuai',
    'status','summary','history','ask','laporan','cuti','servis','rosak',
    'maintenance','observation','pemerhatian','air','ec',
    'sakit','mati','pokok','plot','timun','peria','beli','jual','ambil',
    'tukar','ubah','kemas','tolong','sembur','semak','rekodkan','simpan'];
  return !words.some(w=>known.includes(w.toLowerCase()));
}
function bsePilotUnrecognizedMessage_(reference){
  return '❌ Mesej tidak dapat dikenal pasti sebagai laporan.\n'+
    'Rujukan: '+String(reference||'')+'\n'+
    'Sila hantar laporan menggunakan format yang sesuai.';
}
