'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const src=fs.readFileSync(__dirname+'/PilotAskKbPoC.js','utf8'),fixed=fs.readFileSync(__dirname+'/SiteBNotePocArchive.js','utf8');
const env={bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION', console:{log:()=>{}}, text:'Nota Induk BSE Site B.\n\nPlot standard: 54 baris x 52 polybag = 2808.\n\n'.repeat(20)};
env.DocumentApp={openById:(id)=>({getBody:()=>({getText:()=>env.text})})};
vm.createContext(env);vm.runInContext(fixed,env);vm.runInContext(src,env);
test('Google Docs ID direct read wins over old JS snapshot',()=>{
 const first=env.bsePilotAskKbDocText_();assert.equal(first.live,true);
 assert.equal(first.text,env.text.trim());
 assert.match(env.bsePilotAskKbNoteContext_('berapa polybag plot standard?',first),/2808/);
});
test('updated Google Doc appears on subsequent read without code change',()=>{
 env.text='Nota Induk Site B terkini.\n\nPlot standard: kapasiti kini diperiksa semula dan jadual baharu digunakan.\n\n'.repeat(20);
 const next=env.bsePilotAskKbDocText_();assert.equal(next.live,true);assert.match(next.text,/jadual baharu/);assert.doesNotMatch(next.text,/2808/);
});
test('read denied uses unchanged prior snapshot as fallback',()=>{
 env.DocumentApp={openById:()=>{throw Error('permission denied')}};
 const res=env.bsePilotAskKbDocText_();assert.equal(res.live,false);assert.match(res.text,/2,808/);
});
