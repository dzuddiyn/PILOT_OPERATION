const fs=require('fs'),assert=require('assert'),vm=require('vm');
function extract(s,n){let a=s.indexOf('function '+n+'(');if(a<0)throw Error('missing '+n);let i=s.indexOf('{',a),d=0,q='',esc=false;for(;i<s.length;i++){let c=s[i];if(q){if(esc){esc=false;continue}if(c==='\\'){esc=true;continue}if(c===q)q='';continue}if(c==="'"||c==='"'){q=c;continue}if(c==='{')d++;if(c==='}'&&--d===0)return s.slice(a,i+1)}throw Error('uncLOSED '+n)}
const ctx={bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',bseUnifiedSourceContext_:v=>typeof v==='string'?{original:v,clarifications:[]}:v};vm.createContext(ctx);
vm.runInContext(extract(fs.readFileSync('GeminiUnifiedTest.js','utf8'),'bseCanonicalPlotTokens_'),ctx);
vm.runInContext(extract(fs.readFileSync('GeminiUnifiedTest.js','utf8'),'bseTransplantFlexibleDate_'),ctx);
for(let [file,names] of [['TelegramWorkerTest.js',['bsePilotCompactSowingResult_']],['GeminiUnifiedTest.js',['bseSeedSowingModulePlots_']],['TelegramPlotStatusTest.js',['bseTelegramPlotStatusCommand_','bseTelegramPlotSummaryCommand_','bseTelegramPlotRetrievalCommand_']]]){let s=fs.readFileSync(file,'utf8');for(let n of names)vm.runInContext(extract(s,n),ctx)}
let t=0;const test=(name,fn)=>{fn();t++;console.log('PASS '+name)};
test('M4P12 actual two plots from real sowing',()=>{let r=ctx.bsePilotCompactSowingResult_('semai\nPeria Besar 3328(Hua Li)\nM4P12\n1/9');assert.equal(r.validation,'PASS');assert.deepEqual(Array.from(r.candidates.slice(2),x=>x.fields.plot_id),['M4P1','M4P2'])});
test('M3P34 compact remains two plots',()=>{let r=ctx.bsePilotCompactSowingResult_('semai\nCucumber 7055(CCB)\nM3P34\n25/8/26');assert.equal(r.validation,'PASS');assert.deepEqual(Array.from(r.candidates.slice(2),x=>x.fields.plot_id),['M3P3','M3P4'])});
test('Modul: M4P12 normalizes',()=>assert.deepEqual(Array.from(ctx.bseSeedSowingModulePlots_('Modul: M4P12').plots),['M4P1','M4P2']));
test('module 3 digits rejects',()=>assert.equal(ctx.bseSeedSowingModulePlots_('Modul: M4P123').ok,false));
test('summary expands M4P12, stays in unique canonical items',()=>assert.deepEqual(Array.from(ctx.bseTelegramPlotSummaryCommand_('/summary plot M4P12')),['M4P1','M4P2']));
test('single status refuses compact multi plot',()=>assert.equal(ctx.bseTelegramPlotStatusCommand_('/status plot M4P12'),''));
test('single status canonical remains',()=>assert.equal(ctx.bseTelegramPlotStatusCommand_('/status plot M4P2'),'M4P2'));
test('summary explicit duplicate rejects',()=>assert.equal(ctx.bseTelegramPlotSummaryCommand_('/summary plot M4P12,M4P1').length,0));
test('status combined routes to two detailed plot statuses',()=>assert.deepEqual(JSON.parse(JSON.stringify(ctx.bseTelegramPlotRetrievalCommand_('/status plot M4P12'))),{kind:'STATUS_MULTI',plots:['M4P1','M4P2']}));
console.log('PLOT_CONTRACT '+t+'/'+t+' PASS');
