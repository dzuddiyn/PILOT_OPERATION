const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const ctx={console};vm.createContext(ctx);
const g=fs.readFileSync(__dirname+'/GeminiUnifiedTest.js','utf8');
const p=fs.readFileSync(__dirname+'/TelegramPlotStatusTest.js','utf8');
function pick(src,name){let x=src.indexOf('function '+name+'(');assert(x>=0,name);let i=src.indexOf('{',x),d=0;for(let k=i;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'&&!--d)return src.slice(x,k+1)}throw Error(name)}
for(const n of ['bseCanonicalPlotTokens_'])vm.runInContext(pick(g,n),ctx);
for(const n of ['bseTelegramPlotStatusCommand_','bseTelegramPlotSummaryCommand_','bseTelegramPlotRetrievalCommand_'])vm.runInContext(pick(p,n),ctx);
const summary=['/summary M8P1,2 & M8P3','/summary M8P1,M8P2,M8P3','/summary plot M8 P1, M8 P2, M8 P3'];
for(const x of summary)assert.equal(Array.from(ctx.bseTelegramPlotSummaryCommand_(x)).join(','),'M8P1,M8P2,M8P3',x);
assert.equal(ctx.bseTelegramPlotSummaryCommand_('/summary M4P1').length,0);
assert.equal(ctx.bseTelegramPlotSummaryCommand_('/summary M8P1,M8P1').length,0);
assert.equal(ctx.bseTelegramPlotSummaryCommand_('/summary M8P123').length,0);
for(const x of ['/status M4P1','/status M4 P1','/status plot M4P1'])assert.equal(ctx.bseTelegramPlotStatusCommand_(x),'M4P1');
console.log('CL_H07_PLOT_COMMANDS 9/9 PASS');
