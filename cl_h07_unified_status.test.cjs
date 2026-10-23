'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync(__dirname+'/TelegramPlotStatusTest.js','utf8');
const begin=source.indexOf('function bseTelegramPlotRetrievalCommand_(');
const end=source.indexOf('function bseTelegramPlotStatusUsageCommand_(',begin);
assert(begin>=0&&end>begin);
const ctx={};vm.createContext(ctx);vm.runInContext(source.slice(begin,end),ctx);
const cases=[
 ['/status M3P123',['M3P1','M3P2','M3P3'],'STATUS_MULTI'],
 ['/status M3P1234',['M3P1','M3P2','M3P3','M3P4'],'STATUS_MULTI'],
 ['/status M12P1234',['M12P1','M12P2','M12P3','M12P4'],'STATUS_MULTI'],
 ['/status M12P123456',['M12P1','M12P2','M12P3','M12P4','M12P5','M12P6'],'STATUS_MULTI'],
 ['/status M4P1',['M4P1'],'STATUS'],
 ['/status M4 P1',['M4P1'],'STATUS'],
 ['/status M3 P1 P2',['M3P1','M3P2'],'STATUS_MULTI'],
 ['/status M8P1,2 & M8P3',['M8P1','M8P2','M8P3'],'STATUS_MULTI'],
 ['/status M8P1,M8P2,M8P3',['M8P1','M8P2','M8P3'],'STATUS_MULTI'],
 ['/status M2P3,M3P4',['M2P3','M3P4'],'STATUS_MULTI'],
 ['/status M2P123,M3P123',['M2P1','M2P2','M2P3','M3P1','M3P2','M3P3'],'STATUS_MULTI'],
 ['/summary M3P1234',['M3P1','M3P2','M3P3','M3P4'],'SUMMARY'],
 ['/summary M3P12',['M3P1','M3P2'],'SUMMARY']
];
for(const [input,want,kind] of cases){const r=ctx.bseTelegramPlotRetrievalCommand_(input);assert(r,input);assert.equal(r.kind,kind,input);assert.deepEqual(Array.from(r.plots),want,input)}
for(const input of ['/status M3P11','/status M3P1,1','/status M3P1234567','/status M1P1234,M2P123','/status M3P0','/status M3P2 extra','/status M3P1\nother','/summary M4P1']){
 assert.equal(ctx.bseTelegramPlotRetrievalCommand_(input),null,input);
}
console.log('CL_H07_UNIFIED_STATUS 21/21 PASS');
