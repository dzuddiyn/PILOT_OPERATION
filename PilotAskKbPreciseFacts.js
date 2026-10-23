/** Exact facts from Nota Induk BSE Site B v1.0; do not extrapolate standard to special plots. */
function bsePilotAskKbPrecisePlotAnswer_(question){
 if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return '';
 const q=String(question||'').toLowerCase();
 if(!/(?:polybag|polibeg|polibag)/.test(q))return '';
 const moduleMatch=q.match(/\b(?:modul\s*)?m?([1-8])\b/);
 const modu=moduleMatch&&Number(moduleMatch[1]);
 const plots={1:4,2:4,3:4,4:2,5:4,6:2,7:2,8:3};
 const special={3:'M3P4',7:'M7P1–M7P2',8:'M8P1–M8P3'};
 if(modu&&/modul|\bm[1-8]\b/.test(q)&&!/(?:hingga|sampai|[–-])\s*m?8\b/.test(q)){
   return 'M'+modu+': '+plots[modu]+' plot'+(special[modu]?' (plot khas: '+special[modu]+')':'')+
     '.\nJumlah polybag sebenar bagi modul ini tidak dinyatakan dalam Nota Induk.\nRujukan: Nota Induk Site B, Jadual Susunan Modul.';
 }
 if(/(?:modul\s*1\s*(?:hingga|sampai|-)\s*8|modul\s*m1\s*(?:hingga|sampai|-)\s*m8|modul\s*1[-–]8|modul\s*m1[-–]m8)/.test(q)){
   return 'Plot mengikut modul: M1 4, M2 4, M3 4, M4 2, M5 4, M6 2, M7 2, M8 3 (jumlah 25 plot).\nBilangan polybag sebenar mengikut modul tidak lengkap dalam Nota Induk.\nKapasiti standard ialah 2,808 *per plot*, bukan per modul.';
 }
 return '';
}
