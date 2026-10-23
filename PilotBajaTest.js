/** @OnlyCurrentDoc */
// GI-UX-04: isolated PILOT fertilizer IN/OUT contract. No domain write before Benar.
const BSE_PILOT_BAJA_UNITS_=['kg','g','L','ml','beg','botol','unit','pcs','pek','kotak','set','tong'];
function bsePilotBajaDate_(raw){
 const s=String(raw||'').trim();let y,m,d,x;
 if((x=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/))){d=+x[1];m=+x[2];y=+x[3];}
 else if((x=s.match(/^(\d{4})-(\d{2})-(\d{2})$/))){y=+x[1];m=+x[2];d=+x[3];}
 else return '';
 const dt=new Date(Date.UTC(y,m-1,d));
 return dt.getUTCFullYear()===y&&dt.getUTCMonth()===m-1&&dt.getUTCDate()===d
  ?String(y).padStart(4,'0')+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0'):'';
}
function bsePilotBajaItem_(line,incoming){
 const s=String(line||'').trim(),units='kg|g|L|ml|beg|botol|unit|pcs|pek|kotak|set|tong';
 const m=s.match(new RegExp('^(?:Baja\\s+)?([A-Za-z][A-Za-z0-9-]{0,15})(?:\\s*[:=-]?\\s+(\\d+(?:[.,]\\d+)?)\\s*('+units+')?)?$','i'));
 const reverse=s.match(new RegExp('^(\\d+(?:[.,]\\d+)?)\\s*('+units+')?\\s+(?:Baja\\s+)?([A-Za-z][A-Za-z0-9-]{0,15})$','i'));
 let type,quantity,unit;
 if(m){type=m[1];quantity=m[2];unit=m[3];}
 else if(reverse){type=reverse[3];quantity=reverse[1];unit=reverse[2];}
 else return null;
 type=String(type||'').toUpperCase();
 if(['BAJA','MASUK','KELUAR','PLOT','TARIKH'].includes(type))return null;
 if(incoming&&!quantity)return null; // In: quantity required; no guessing.
 if(!incoming&&!quantity){quantity='1';unit='set';} // Out: one set PER plot by default.
 else if(!unit)unit='set'; // Unit defaults to set for both directions.
 const number=Number(String(quantity).replace(',','.'));
 const check=bseInventoryValidateQuantity_(number,unit);
 if(!check.ok)return null;
 return {item_name:'Baja',baja_type:type,quantity:check.quantity,unit:check.unit};
}
function bsePilotBajaParseCanonical_(text,receivedAt){
 if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return null;
 const source=String(text||'').trim(),lines=source.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 const first=lines[0]&&lines[0].match(/^baja\s+(masuk|keluar)\s*:?\s*$/i);
 if(!first)return null;
 const incoming=first[1].toLowerCase()==='masuk';
 const domain=incoming?'INVENTORY_IN':'INVENTORY_OUT';
 let date='',dateLines=0,plotLines=0,badLine=false;
 const plots=[],items=[];
 for(const line of lines.slice(1)){
   if(/^Tarikh\s*:/i.test(line)||/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(line)||/^\d{4}-\d{2}-\d{2}$/.test(line)){
     dateLines++;if(dateLines>1){badLine=true;continue;}
     date=bsePilotBajaDate_(line.replace(/^Tarikh\s*:\s*/i,''));continue;
   }
   if(/^Plot\s*:/i.test(line)||/^M\s*[1-9]\d*\s*P\s*[1-9]\d*$/i.test(line)){
     plotLines++;if(plotLines>1){badLine=true;continue;}
     const raw=line.replace(/^Plot\s*:\s*/i,'');
     const tokens=raw.split(/\s*(?:,|&|\bdan\b)\s*/i).filter(Boolean);
     if(!tokens.length){badLine=true;continue;}
     for(const token of tokens){
       const name=token.replace(/\s+/g,'').toUpperCase();
       if(!/^M[1-9]\d*P[1-9]\d*$/.test(name)||plots.includes(name)){badLine=true;continue;}
       plots.push(name);
     }
     continue;
   }
   if(/^(?:Penanggungjawab|Bertanggungjawab)\s*:\s*\S+/i.test(line))continue;
   const item=bsePilotBajaItem_(line,incoming);
   if(item)items.push(item);
   else badLine=true;
 }
 const missing=[];
 if(!dateLines||!date)missing.push('event_date');
 if(incoming&&plotLines)missing.push('plot_not_applicable');
 if(!incoming&&!plots.length)missing.push('plot_id');
 if(!items.length)missing.push('jenis_baja',...(incoming?['quantity']:[]));
 if(new Set(items.map(x=>x.baja_type)).size!==items.length)missing.push('duplicate_baja_type');
 if(badLine)missing.push('invalid_baja_line');
 const flat=incoming?items:plots.length?items.flatMap(item=>plots.map(plot=>({...item,destination:plot}))):items.map(item=>({...item,destination:''}));
 if(flat.length>24)missing.push('too_many_baja_items');
 const finalItems=flat.map(item=>({...item,destination:incoming?'':item.destination}));
 const good=missing.length===0;
 return {validation:good?'PASS':'NEED_INFO',production_write:false,candidates:[{
   target:'Inventory_Event_Log',validation:good?'PASS':'NEED_INFO',missing:missing,
   fields:{project_id:'BSE_SB',system_year:2026,record_type:domain,event_type:domain,
     movement_type:incoming?'IN':'OUT',event_date:date,event_date_explicit:dateLines===1,
     event_date_valid:!!date,item_name:'Baja',unit:'set',
     destination:incoming?'':plots.join(', '),baja_group:true,baja_items:finalItems,
     original_note:source,verification_status:'PROVISIONAL',router_confidence:'HIGH'}
 }]};
}
function bsePilotBajaValidateResult_(result){
 const candidate=result&&Array.isArray(result.candidates)&&result.candidates.length===1&&result.candidates[0];
 const f=candidate&&candidate.fields||{},missing=[];
 if(!candidate||candidate.target!=='Inventory_Event_Log'||f.baja_group!==true||result.production_write!==false)missing.push('baja_group');
 const incoming=f.record_type==='INVENTORY_IN';
 if(!['INVENTORY_IN','INVENTORY_OUT'].includes(f.record_type)||f.event_type!==f.record_type)missing.push('movement_type');
 if(!bsePilotBajaDate_(f.event_date)||f.event_date_explicit!==true)missing.push('event_date');
 if(f.item_name!=='Baja')missing.push('item_name');
 if(incoming&&f.destination)missing.push('plot_not_applicable');
 const plots=incoming?[]:String(f.destination||'').split(',').map(x=>x.trim()).filter(Boolean);
 if(!incoming&&(!plots.length||plots.some(x=>!/^M[1-9]\d*P[1-9]\d*$/.test(x))||
   new Set(plots).size!==plots.length))missing.push('plot_id');
 const items=Array.isArray(f.baja_items)?f.baja_items:[];
 if(!items.length||items.length>24)missing.push('baja_items');
 const seen=new Set();
 for(const item of items){
   const type=String(item&&item.baja_type||'');
   if(!/^[A-Z][A-Z0-9-]{0,15}$/.test(type)||['BAJA','MASUK','KELUAR','PLOT','TARIKH'].includes(type))missing.push('jenis_baja');
   if(item.item_name!=='Baja')missing.push('item_name');
   const q=bseInventoryValidateQuantity_(item.quantity,item.unit);
   if(!q.ok)missing.push('quantity','unit');
   const plot=String(item.destination||'');
   if(incoming&&plot)missing.push('plot_not_applicable');
   if(!incoming&&!plots.includes(plot))missing.push('plot_id');
   const key=type+'|'+plot;
   if(seen.has(key))missing.push('duplicate_baja_type');
   seen.add(key);
 }
 // Scoped fertilizer groups may intentionally target different plots. Every listed plot
 // must still have at least one valid item; duplicate (type,plot) pairs are blocked above.
 if(!incoming&&f.baja_scoped_group===true&&plots.some(plot=>!items.some(item=>item.destination===plot)))missing.push('plot_without_baja_item');
 if(!incoming&&f.baja_scoped_group!==true&&items.length!==plots.length*(new Set(items.map(i=>i.baja_type))).size)missing.push('plot_product_grid');
 const combined=Array.from(new Set([...(Array.isArray(candidate&&candidate.missing)?candidate.missing:[]),...missing]));
 return {validation:combined.length===0&&candidate.validation==='PASS'&&result.validation==='PASS'?'PASS':'NEED_INFO',missing:combined};
}
function bsePilotBajaCard_(reference,result){
 const f=result.candidates[0].fields,inc=f.record_type==='INVENTORY_IN';
 const out=[inc?'BAJA MASUK':'BAJA KELUAR','Rujukan: '+reference,
   'Tarikh: '+String(f.event_date||'❌ Belum lengkap')];
 if(!inc)out.push('Plot: '+String(f.destination||'❌ Belum lengkap'));
 const items=f.baja_items||[];
 items.forEach((item,i)=>out.push((i+1)+'. Baja '+item.baja_type+' — '+item.quantity+' '+item.unit+
   (!inc?' ('+item.destination+')':'')));
 out.push('Sila semak maklumat sebelum pilih Benar atau Batal.');
 return out.join('\n');
}
