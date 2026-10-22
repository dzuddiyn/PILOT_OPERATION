/** @OnlyCurrentDoc */
// PILOT_OPERATION private /claim retrieval. Read-only; no audit, writer or RBAC grants.
const BSE_PILOT_CLAIM_MONTHS=[
  ['Januari','januari','january','jan'],
  ['Februari','februari','february','feb'],
  ['Mac','mac','march','mar'],
  ['April','april','apr'],
  ['Mei','mei','may'],
  ['Jun','jun','june'],
  ['Julai','julai','july','jul'],
  ['Ogos','ogos','august','aug'],
  ['September','september','sept','sep'],
  ['Oktober','oktober','october','okt','oct'],
  ['November','november','nov'],
  ['Disember','disember','december','dis','dec']
];
function bsePilotClaimCommand_(text){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return false;
  const s=String(text||'').trim(),m=s.match(/^\/claim(?:@([A-Za-z0-9_]{5,32}))?(?=\s|$)/i);
  if(!m)return false;
  return !m[1]||String(m[1]).toLowerCase()===String(bseRuntimeBotUsername_()).replace(/^@/,'').toLowerCase();
}
function bsePilotClaimPeriod_(text,now){
  const help='Gunakan /claim, /claim Oktober, /claim Okt 2026, /claim 10/2026 atau /claim 2026-10.';
  if(!bsePilotClaimCommand_(text))return {matched:false,ok:false,help:help};
  const raw=String(text||'').trim().replace(/^\/claim(?:@[A-Za-z0-9_]{5,32})?/i,'').trim();
  const today=Utilities.formatDate(now||new Date(),'Asia/Kuala_Lumpur','yyyy-MM');
  const currentYear=Number(today.slice(0,4)),currentMonth=Number(today.slice(5,7));
  let year=currentYear,month=currentMonth,m;
  if(raw){
    if((m=raw.match(/^(\d{4})-(\d{1,2})$/))){year=Number(m[1]);month=Number(m[2]);}
    else if((m=raw.match(/^(\d{1,2})[\/-](\d{4})$/))){month=Number(m[1]);year=Number(m[2]);}
    else if((m=raw.match(/^([A-Za-z]+)(?:\s+(\d{4}))?$/))){
      const name=m[1].toLowerCase(),hits=BSE_PILOT_CLAIM_MONTHS.map((parts,i)=>parts.slice(1).includes(name)?i+1:0).filter(Boolean);
      if(hits.length!==1)return {matched:true,ok:false,help:help};
      month=hits[0];if(m[2])year=Number(m[2]);
    }else return {matched:true,ok:false,help:help};
  }
  if(!Number.isInteger(year)||year<1900||year>2100||!Number.isInteger(month)||month<1||month>12)return {matched:true,ok:false,help:help};
  return {matched:true,ok:true,year:year,month:month,key:String(year)+'-'+String(month).padStart(2,'0'),label:BSE_PILOT_CLAIM_MONTHS[month-1][0]+' '+year,help:help};
}
function bsePilotClaimTable_(book,name,keys){
  const s=book&&typeof book.getSheetByName==='function'?book.getSheetByName(name):null;
  if(!s)return {ok:false,reason:'SHEET_MISSING'};
  const cols=s.getLastColumn(),last=s.getLastRow();
  if(!Number.isSafeInteger(cols)||cols<keys.length||!Number.isSafeInteger(last)||last<1||last>10001)return {ok:false,reason:'SHEET_BOUNDS'};
  const headers=s.getRange(1,1,1,cols).getValues()[0].map(x=>String(x||'').trim());
  const idx={};for(const k of keys){const found=headers.reduce((acc,v,i)=>v===k?acc.concat(i):acc,[]);if(found.length!==1)return {ok:false,reason:'HEADER_'+k};idx[k]=found[0];}
  const rows=last>1?s.getRange(2,1,last-1,cols).getValues():[];
  return {ok:true,rows:rows,idx:idx};
}
function bsePilotClaimAccess_(book,m){
  const id=String(m&&m.from&&m.from.id||''),chat=String(m&&m.chat&&m.chat.id||'');
  if(!/^\d+$/.test(id)||!m||!m.chat||m.chat.type!=='private'||chat!==id||m.from.is_bot)return {ok:false,scope:''};
  // The immutable bootstrap user is sourced from the existing runtime binding, never from a new is_admin/registration shortcut.
  let bootstrap='';try{if(typeof bseRuntimeLegacyUserId_==='function')bootstrap=String(bseRuntimeLegacyUserId_()||'');}catch(_){return {ok:false,scope:''};}
  const own=bsePilotClaimTable_(book,'TEST_OWNER_REGISTRY',['owner_id','telegram_user_id','private_chat_id','is_active']);
  if(own.ok){
    const active=own.rows.filter(row=>row[own.idx.is_active]===true||String(row[own.idx.is_active]||'').toUpperCase()==='TRUE');
    if(/^\d+$/.test(bootstrap)&&id===bootstrap&&active.length===1&&String(active[0][own.idx.telegram_user_id])===id&&String(active[0][own.idx.private_chat_id])===id&&String(active[0][own.idx.owner_id]||'').trim())return {ok:true,scope:'OWNER',id:id};
    if(active.some(row=>String(row[own.idx.telegram_user_id])===id))return {ok:false,scope:''};
  }
  const reg=bsePilotClaimTable_(book,'TEST_TELEGRAM_USER_REGISTRY',['telegram_user_id','private_chat_id','status']);
  if(!reg.ok)return {ok:false,scope:''};
  const matches=reg.rows.filter(row=>String(row[reg.idx.telegram_user_id])===id);
  if(matches.length!==1||String(matches[0][reg.idx.private_chat_id])!==id||String(matches[0][reg.idx.status])!=='REGISTERED_ACTIVE')return {ok:false,scope:''};
  return {ok:true,scope:'OWN',id:id};
}
function bsePilotClaimDate_(value){
  if(Object.prototype.toString.call(value)==='[object Date]'){
    if(isNaN(value.getTime()))return '';
    return Utilities.formatDate(value,'Asia/Kuala_Lumpur','yyyy-MM-dd');
  }
  const s=String(value||'').trim(),m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m)return '';
  const d=new Date(Date.UTC(Number(m[1]),Number(m[2])-1,Number(m[3])));
  return d.getUTCFullYear()===Number(m[1])&&d.getUTCMonth()+1===Number(m[2])&&d.getUTCDate()===Number(m[3])?s:'';
}
function bsePilotClaimStatus_(status){
  const s=String(status||'').trim().toUpperCase();
  if(['SUBMITTED','SENT','DIHANTAR'].includes(s))return 'Dihantar';
  if(['PENDING','PENDING_REVIEW','REVIEW_PENDING'].includes(s))return 'Menunggu semakan';
  if(s==='APPROVED')return 'Diluluskan (bukan bukti bayaran)';
  if(s==='APPROVED_TEST'||s==='REPORTER_CONFIRMED')return 'Direkodkan PILOT (bukan kelulusan bayaran)';
  if(['REJECTED','REJECTED_TEST'].includes(s))return 'Ditolak';
  if(['CANCELLED','CANCELED','VOIDED_TEST'].includes(s))return 'Dibatalkan';
  return 'Status belum disahkan';
}
const BSE_PILOT_CLAIM_AUDIT_HEADERS=['requested_at','telegram_user_id','chat_id','message_id','period','outcome','reason','scope','matched_count'];
function bsePilotClaimAudit_(book,m,period,outcome,reason,scope,count){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')throw new Error('CLAIM_AUDIT_WRONG_ENVIRONMENT');
  const name='TEST_TELEGRAM_CLAIM_RETRIEVAL_AUDIT';
  let sheet=book.getSheetByName(name);
  if(!sheet)sheet=book.insertSheet(name);
  bseEnsureAdditiveHeaders_(sheet,BSE_PILOT_CLAIM_AUDIT_HEADERS);
  const user=String(m&&m.from&&m.from.id||''),chat=String(m&&m.chat&&m.chat.id||''),message=String(m&&m.message_id||'');
  sheet.appendRow([new Date().toISOString(),user,chat,message,String(period&&period.key||''),String(outcome||''),String(reason||''),String(scope||''),Number(count||0)]);
  SpreadsheetApp.flush();
}
function bsePilotClaimEvidenceMonth_(value){
  // Evidence received_at is a timestamp, not a claim ledger event_date.
  const dateObject=Object.prototype.toString.call(value)==='[object Date]'; if(dateObject&&!Number.isFinite(value.getTime()))return ''; const raw=dateObject?value.toISOString():String(value||'').trim();
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(raw))return '';
  const instant=new Date(raw);
  if(!Number.isFinite(instant.getTime())||instant.toISOString().slice(0,10)!==raw.slice(0,10))return '';
  return Utilities.formatDate(instant,'Asia/Kuala_Lumpur','yyyy-MM');
}
function bsePilotClaimRetrieve_(book,m,now){
  const period=bsePilotClaimPeriod_(m&&m.text,now);
  if(!period.matched)return {handled:false};
  const audit=(outcome,reason,scope,count)=>bsePilotClaimAudit_(book,m,period,outcome,reason,scope,count);
  if(!m||!m.chat||m.chat.type!=='private'){audit('DENIED','NOT_PRIVATE','',0);return {handled:true,text:'',production_write:false};}
  const access=bsePilotClaimAccess_(book,m);
  if(!access.ok){audit('DENIED','NOT_ACTIVE','',0);return {handled:true,text:'Akses tuntutan hanya untuk pengguna aktif melalui PM bot.',production_write:false};}
  if(!period.ok){audit('DENIED','INVALID_PERIOD',access.scope,0);return {handled:true,text:period.help,production_write:false};}
  const table=bsePilotClaimTable_(book,'TEST_FILE_EVIDENCE',['evidence_id','reporter_telegram_user_id','received_at','caption','attachment_type','mime_type','file_name','category','visibility','status','drive_file_id']);
  if(!table.ok){audit('BLOCKED',table.reason,access.scope,0);return {handled:true,text:'Rekod tuntutan belum tersedia untuk semakan.',production_write:false};}
  const i=table.idx,selected=[],invalid=[];
  for(const row of table.rows){
    if(String(row[i.category]||'')!=='INVENTORY_CLAIM')continue;
    if(access.scope!=='OWNER'&&String(row[i.reporter_telegram_user_id]||'')!==access.id)continue;
    if(!bseRuntimeEvidenceIsConfirmed_(row[i.status]))continue;
    const month=bsePilotClaimEvidenceMonth_(row[i.received_at]);
    if(!month){invalid.push('DATE_INVALID');continue;}
    if(month!==period.key)continue;
    if(!['RESTRICTED','PRIVATE_SUBMISSION'].includes(String(row[i.visibility]||''))||
       !String(row[i.evidence_id]||'').trim()||
       !/^\d+$/.test(String(row[i.reporter_telegram_user_id]||''))){invalid.push('SOURCE_INVALID');continue;}
    const text=String(row[i.caption]||'').trim().replace(/[\r\n]+/g,' ');
    if(!text){invalid.push('CAPTION_MISSING');continue;}
    const id=String(row[i.drive_file_id]||'').trim();
    if(id&&!/^[A-Za-z0-9_-]{15,128}$/.test(id)){invalid.push('DRIVE_ID_INVALID');continue;}
    const type=String(row[i.attachment_type]||'').trim().toUpperCase();
    const mime=String(row[i.mime_type]||'').trim().toLowerCase();
    const isImage=type==='PHOTO'||/^image\/(?:jpeg|png|webp|gif|heic|heif)$/.test(mime);
    const fileName=String(row[i.file_name]||'').trim().replace(/[\r\n]+/g,' ').slice(0,180);
    selected.push({stamp:String(row[i.received_at]),text:text,fileName:isImage?fileName:'',url:isImage&&id?'https://drive.google.com/file/d/'+id+'/view':''});
  }
  if(invalid.length){audit('BLOCKED',invalid[0],access.scope,0);return {handled:true,text:'Semakan tuntutan ditahan: rekod evidence perlu disemak.',production_write:false};}
  selected.sort((a,b)=>a.stamp.localeCompare(b.stamp));
  const lines=['Tuntutan '+period.label];
  if(!selected.length)lines.push('Tiada rekod INVENTORY_CLAIM bagi bulan ini.');
  selected.slice(0,10).forEach((x,k)=>{
    lines.push('',(k+1)+'. '+x.text);
    if(x.fileName&&x.url)lines.push('Fail: '+x.fileName,'Pautan: '+x.url);
  });
  if(selected.length>10)lines.push('Memaparkan 10 daripada '+selected.length+' rekod.');
  const output=lines.join('\n');
  if(output.length>3900){audit('BLOCKED','MESSAGE_TOO_LONG',access.scope,0);return {handled:true,text:'Terlalu banyak teks tuntutan untuk satu mesej. Gunakan bulan yang lebih khusus atau rujuk owner.',production_write:false};}
  audit('RESULT_READY','OK',access.scope,selected.length);
  return {handled:true,text:output,count:selected.length,production_write:false};
}
