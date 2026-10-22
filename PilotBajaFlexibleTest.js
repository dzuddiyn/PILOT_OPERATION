/** @OnlyCurrentDoc */
// GI-UX-04 field correction: order-independent shorthand, isolated to PILOT Baja.
// A recognized Baja prefix always returns a PILOT proposal, never falls through
// to the old Inventory/Gemini parser even when incomplete or unparseable.
function bsePilotBajaFlexibleDate_(raw){
  const text=String(raw||'').trim();
  const months={
    jan:1,januari:1,january:1,feb:2,februari:2,february:2,
    mac:3,mar:3,march:3,apr:4,april:4,mei:5,may:5,
    jun:6,june:6,julai:7,jul:7,july:7,ogos:8,aug:8,august:8,
    sep:9,sept:9,september:9,okt:10,oct:10,oktober:10,october:10,
    nov:11,november:11,dis:12,dec:12,disember:12,december:12
  };
  let d,m,y,v;
  const slash=text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})$/);
  const iso=text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const named=text.match(/^(\d{1,2})[\s-]+([A-Za-z]+)[\s,-]+(\d{2}|\d{4})$/i);
  if(iso){y=Number(iso[1]);m=Number(iso[2]);d=Number(iso[3]);}
  else if(slash){d=Number(slash[1]);m=Number(slash[2]);y=Number(slash[3]);}
  else if(named&&months[named[2].toLowerCase()]){d=Number(named[1]);m=months[named[2].toLowerCase()];y=Number(named[3]);}
  else return '';
  if(y<100)y+=2000;
  if(!Number.isInteger(y)||y<2000||y>2099)return '';
  const check=new Date(Date.UTC(y,m-1,d));
  return check.getUTCFullYear()===y&&check.getUTCMonth()+1===m&&check.getUTCDate()===d
    ?String(y).padStart(4,'0')+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0'):'';
}
function bsePilotBajaFlexNormalize_(input){
  const original=String(input||'').trim();
  const header=original.match(/^baja\s+(masuk|in|keluar|out)\b\s*:?\s*/i);
  if(!header)return null;
  const inbound=/^(?:masuk|in)$/i.test(header[1]),base=inbound?'Baja Masuk':'Baja Keluar';
  let rest=original.slice(header[0].length),dateTokens=[],plots=[],bad=false;
  // Anchored numeric or named month dates; no year guessing and no Date.parse().
  const month='jan(?:uari|uary)?|feb(?:ruari|ruary)?|mac|mar(?:ch)?|apr(?:il)?|mei|may|jun(?:e)?|jul(?:ai|y)?|ogos|aug(?:ust)?|sep(?:t|tember)?|okt(?:ober)?|oct(?:ober)?|nov(?:ember)?|dis(?:ember)?|dec(?:ember)?';
  const dates=new RegExp('\\b(?:\\d{4}-\\d{1,2}-\\d{1,2}|\\d{1,2}[./-]\\d{1,2}[./-]\\d{2,4}|\\d{1,2}[\\s-]+(?:'+month+')[\\s,-]+\\d{2,4})\\b','gi');
  rest=rest.replace(dates,found=>{
    dateTokens.push(found);return ' ';
  });
  if(dateTokens.length!==1)bad=true;
  const date=dateTokens.length===1?bsePilotBajaFlexibleDate_(dateTokens[0]):'';
  if(dateTokens.length===1&&!date)bad=true;
  // Plot is a separate axis, regardless of its position relative to date/type.
  rest=rest.replace(/\bM\s*[1-9]\d*\s*P\s*[1-9]\d*\b/gi,found=>{
    const plot=found.replace(/\s+/g,'').toUpperCase();
    if(plots.includes(plot))bad=true;
    plots.push(plot);return ' ';
  });
  rest=rest.replace(/\b(?:Tarikh|Date|Plot|Modul)\s*:/gi,' ');
  rest=rest.replace(/\b(?:Tarikh|Date|Plot|Modul)\b/gi,' ');
  // e.g. "F:2", "F 2kg", "N 1 set".
  rest=rest.replace(/([A-Za-z][A-Za-z0-9-]{0,15})\s*[:=]\s*(\d)/g,'$1 $2');
  rest=rest.replace(/(\d+(?:[.,]\d+)?)(kg|g|ml|l|set|beg|botol|unit|pcs|pek|kotak|tong)\b/gi,'$1 $2');
  const tokens=rest.split(/[\s,;&]+/).filter(Boolean);
  const items=[],units='kg|g|L|ml|beg|botol|unit|pcs|pek|kotak|set|tong';
  const isUnit=x=>new RegExp('^(?:'+units+')$','i').test(x||'');
  const isNum=x=>/^\d+(?:[.,]\d+)?$/.test(x||'');
  for(let i=0;i<tokens.length;){
    let kind=tokens[i],qty='',unit='';
    if(isNum(kind)&&i+1<tokens.length&&/^[A-Za-z][A-Za-z0-9-]{0,15}$/.test(tokens[i+1])&&!isUnit(tokens[i+1])){
      qty=kind;kind=tokens[i+1];i+=2;
    }else if(/^[A-Za-z][A-Za-z0-9-]{0,15}$/.test(kind)&&!isUnit(kind)){
      i++;
      if(i<tokens.length&&isNum(tokens[i])){qty=tokens[i];i++;}
    }else {bad=true;i++;continue;}
    if(i<tokens.length&&isUnit(tokens[i])){unit=tokens[i];i++;}
    items.push(kind+(qty?' '+qty:'')+(unit?' '+unit:''));
  }
  if(items.length>12)bad=true;
  return {base:base,original:original,incoming:inbound,date:date,plots:plots,items:items,bad:bad};
}
function bsePilotBajaParse_(input,receivedAt){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return null;
  const norm=bsePilotBajaFlexNormalize_(input);
  if(!norm)return null;
  const canonical=[norm.base];
  if(norm.date)canonical.push('Tarikh: '+norm.date);
  if(norm.plots.length)canonical.push('Plot: '+norm.plots.join(', '));
  canonical.push(...norm.items);
  const out=bsePilotBajaParseCanonical_(canonical.join('\n'),receivedAt);
  if(!out||!Array.isArray(out.candidates)||out.candidates.length!==1)
    throw Error('BAJA_CANONICAL_PARSER_UNAVAILABLE');
  const candidate=out.candidates[0];
  candidate.fields.original_note=norm.original;
  if(norm.bad){
    candidate.missing=Array.from(new Set((candidate.missing||[]).concat(['invalid_baja_line'])));
    candidate.validation='NEED_INFO';out.validation='NEED_INFO';
  }
  // Nonconforming type/quantity/date can never become a valid report via fallback.
  return out;
}
