/** @OnlyCurrentDoc */
// PILOT-only handling for a single unrecognized word. No AI or domain operation.
function bsePilotUnrecognizedPlainText_(input){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return false;
  const word=String(input||'').trim();
  if(!/^[\p{L}]{3,32}$/u.test(word))return false;
  const known=['banci','rekod','semai','semaian','tanam','pindah','transplant',
    'racun','rawatan','baja','inventori','claim','tuntutan','hasil','tuai',
    'status','summary','history','ask','laporan','cuti','servis','rosak',
    'maintenance','observation','pemerhatian','air','ec'];
  return !known.includes(word.toLowerCase());
}
function bsePilotUnrecognizedMessage_(reference){
  return '❌ Mesej tidak dapat dikenal pasti sebagai laporan.\n'+
    'Rujukan: '+String(reference||'')+'\n'+
    'Sila hantar laporan menggunakan format yang sesuai.';
}
