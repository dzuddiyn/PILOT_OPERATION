'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),test=require('node:test');
const src=fs.readFileSync(__dirname+'/PilotOperationDigests.js','utf8');
const ctx={bseTelegramHistorySafeLine_:e=>e.line};vm.createContext(ctx);
const begin=src.indexOf('function bsePilotDigestReadableRecord_('),end=src.indexOf('function bsePilotDigestRender_(',begin);
vm.runInContext(src.slice(begin,end),ctx);
test('Separate multiline records, retain canonical facts and reference',()=>{
 const lines=[];ctx.bsePilotDigestAppendRecords_(lines,[{line:'Semaian\nTanaman: Timun\nRujukan: BSE-TG-731'},{line:'Semaian\nTanaman: Timun\nRujukan: BSE-TG-729'}]);
 assert(lines.join('\n').includes('Rujukan: BSE-TG-731\n\n• Semaian'));
 assert(lines.join('\n').includes('Rujukan: BSE-TG-729'));
});
test('Break fallback pipe-delimited technical rows without losing facts',()=>{
 const x=ctx.bsePilotDigestReadableRecord_({line:'Tarikh kerja: 2026-10-16 | BSE-TG-733 | EC_Leachate_Log | EC Leaching 9 bacaan'});
 for(const t of ['2026-10-16','BSE-TG-733','EC_Leachate_Log','9 bacaan'])assert(x.includes(t));
 assert(x.includes('\n  BSE-TG-733'));
});
