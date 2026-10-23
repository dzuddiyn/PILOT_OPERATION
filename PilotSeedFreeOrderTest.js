/** @OnlyCurrentDoc */
// GI-UX-05 FIELD: read explicit sowing facts in mixed order, not fixed lines.
// Constrained to PILOT "Semai"/"Semaian" with an actual (crop) (variety) pair.
// No AI, no field inference, no sheet write, no lifecycle transition.
function bsePilotSowingHeadingPattern_(){
  // Deliberately anchored: activity titles only, never a crop/variety substring.
  return /^(?:(?:KERJA|LAPORAN|AKTIVITI)\s+)?(?:SEMAI(?:AN)?(?:\s+BENIH)?|MENYEMAI(?:\s+BENIH)?|TABUR\s+BENIH|SOWING(?:\s+(?:SEEDS?|ACTIVITY|REPORT))?|SEED\s+SOWING|SEEDING(?:\s+(?:ACTIVITY|REPORT))?|PLANTING\s+SEEDS?)\b\s*:?\s*/i;
}
function bsePilotSeedFreeOrderFacts_(input){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return null;
  const src=bseUnifiedSourceContext_(input);
  if((src.clarifications||[]).length)return null; // Historic clarification path untouched.
  const original=String(src.original||'').trim();
  if(!bsePilotSowingHeadingPattern_().test(original))return null;
  // Structured formal reports stay on the existing labelled-fields parser.
  if(/^KERJA\s+SEMAIAN\s+BENIH\b/i.test(original)&&/^(?:Jenis\s+Tanaman|Varieti|Modul|Tarikh\s+Semai)\s*:/im.test(original))return null;
  let rest=original.replace(bsePilotSowingHeadingPattern_(),' ');
  const pairs=Array.from(rest.matchAll(/\b([\p{L}][\p{L}-]*(?:\s+[\p{L}][\p{L}-]*){0,3})\s*\(([^()\r\n]{1,50})\)/gu));
  if(pairs.length!==1)return null; // Preserve existing contract for other sowing messages.
  let crop=String(pairs[0][1]).trim();
  const variety=String(pairs[0][2]).trim();
  const preceding=rest.slice(0,pairs[0].index);
  const tokens=crop.split(/\s+/),potentialUnit=tokens[0]||'';
  // "65 tray Timun (7055 CCB)" — tray belongs to the quantity,
  // never the crop. Only detach a recognized *unit* immediately after
  // an explicit number. An arbitrary word remains part of the crop.
  const commonUnits=/^(?:biji|tray|trays|paket|pek|g|kg|gram|grams|set|pcs|unit|bungkus|bekas|polybag|seeds)$/i;
  const unitBeforeCrop=/\d+(?:[.,]\d+)?\s*$/.test(preceding)&&tokens.length>=2&&commonUnits.test(potentialUnit);
  if(unitBeforeCrop)crop=tokens.slice(1).join(' ');
  rest=rest.replace(pairs[0][0],unitBeforeCrop?' '+potentialUnit+' ':' ');
  // Numbers inside varieties (7055 CCB) are never a seed count.
  const month='jan(?:uari|uary)?|feb(?:ruari|ruary)?|mac|mar(?:ch)?|apr(?:il)?|mei|may|jun(?:e)?|jul(?:ai|y)?|ogos|aug(?:ust)?|sep(?:t|tember)?|okt(?:ober)?|oct(?:ober)?|nov(?:ember)?|dis(?:ember)?|dec(?:ember)?';
  const datePattern=new RegExp('\\b(?:2026-\\d{1,2}-\\d{1,2}|\\d{1,2}[./-]\\d{1,2}(?:[./-]\\d{2,4})?|\\d{1,2}[\\s-]+(?:'+month+')[\\s,-]+\\d{2,4})\\b','gi');
  const dates=[];
  rest=rest.replace(datePattern,text=>{dates.push(text);return ' ';});
  const date=dates.length===1?bsePilotSeedFlexibleDate_(dates[0]):'';
  const fragments=[];
  // Preserve the existing "M1 P1 P2" grammar before matching general MxPy,z.
  rest=rest.replace(/\bM\s*[1-9]\d*\s+(?:P\s*[1-9]\d*\s*){2,}/gi,match=>{
    fragments.push(match.trim());return ' ';
  });
  const plotPattern=/\bM\s*([1-9]\d*)\s*P\s*([1-9]\d*)(?:\s*(?:,|&|\bdan\b)\s*(?:P\s*)?([1-9]\d*))?/gi;
  rest=rest.replace(plotPattern,match=>{fragments.push(match);return ' ';});
  const expanded=fragments.map(fragment=>bsePilotSeedFlexiblePlots_(fragment));
  const plots=expanded.flatMap(p=>p.ok?p.plots:[]);
  const plotsValid=fragments.length>0&&expanded.every(p=>p.ok)&&
    plots.length<=12&&new Set(plots).size===plots.length;
  rest=rest.replace(/\b(?:Tarikh(?:\s+Semai)?|Date|Modul|Plot)\s*:/gi,' ')
    .replace(/\b(?:Kuantiti\s+Benih|Jumlah\s+Benih|Benih)\s*:/gi,' ')
    .replace(/\b(?:dan)\b/gi,' ');
  const remainder=rest.replace(/[\s,;&]+/g,' ').trim();
  // Unlabelled quantity/unit is legitimate ONLY after date, plot, crop and
  // variety were removed. Never infer from text inside parentheses.
  const exact=remainder.match(/^(\d+(?:[.,]\d{1,3})?)\s+([A-Za-z][A-Za-z0-9/%-]{0,15})$/);
  const quantity=exact?Number(exact[1].replace(',','.')):null;
  const unit=exact?exact[2]:'';
  const quantityValid=exact&&Number.isFinite(quantity)&&quantity>0&&quantity<=1000000000;
  const bad=!date||dates.length!==1||!plotsValid||
     !crop||!variety||(!quantityValid&&remainder!=='');
  return {original,crop,variety,date,plots,quantity:quantityValid?quantity:null,
    unit:quantityValid?unit:'',quantityValid:!!quantityValid,remaining:remainder,bad,
    dateCount:dates.length};
}
function bsePilotSeedFreeOrderResult_(input){
  const facts=bsePilotSeedFreeOrderFacts_(input);
  if(!facts)return null;
  // Reuse the proven 3-target atomic sowing proposal. Original fact values
  // are checked again by the FINAL source-aware approval boundary.
  const normalized=['Semai',facts.crop+' ('+facts.variety+')'];
  normalized.push(facts.plots.join(', ')||'');
  normalized.push(facts.date||'');
  const result=bsePilotSeedFlexibleResult_(normalized.join('\n'));
  if(!result)throw Error('SEED_ORDER_NORMALIZER_MISSING');
  if(facts.bad){
    result.validation='NEED_INFO';
    const missing=[];
    if(!facts.date||facts.dateCount!==1)missing.push('event_date');
    if(!facts.plots.length)missing.push('plot_id');
    if(facts.remaining&&!facts.quantityValid)missing.push('seed_quantity');
    missing.push('report_format');
    for(const c of result.candidates){
      c.validation='NEED_INFO';
      c.missing=Array.from(new Set((Array.isArray(c.missing)?c.missing:[]).concat(missing)));
    }
  }
  return result;
}
