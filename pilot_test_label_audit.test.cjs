'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');let env='PILOT_OPERATION';const ctx={console,PropertiesService:{getScriptProperties:()=>({getProperty:k=>k==='BSE_RUNTIME_ENV'?env:''})}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/EnvironmentTest.js','utf8'),ctx);let n=0;function check(name,fn){fn();n++;console.log('PASS '+name)}
const o=s=>ctx.bseRuntimeTelegramPayload_('sendMessage',{text:s}).text;
check('PILOT strips bracketed test heading but keeps content',()=>assert.equal(o('[PILOT TEST]\nPemeriksaan pam M2P2'),'Pemeriksaan pam M2P2'));
check('PILOT strips HTML test heading only',()=>assert(!o('<b>[PILOT TEST]</b>\nRujukan BSE-EV-126').includes('TEST')));
check('PILOT OCR result has no TEST label',()=>assert.equal(o('OCR TEST BSE-EV-126 disahkan'),'OCR BSE-EV-126 disahkan'));
check('PILOT Evidence heading is neutral',()=>assert.equal(o('Evidence TEST BSE-EV-126'),'Lampiran BSE-EV-126'));
check('PILOT user eligibility wording neutral',()=>assert(!o('History hanya boleh diminta melalui PM oleh owner/admin atau user TEST yang aktif.').includes('TEST')));
check('PILOT retains original reporter quote and TEST_ONLY',()=>{const x='Catatan asal: TEST_ONLY bahan sintetik';assert.equal(o(x),x)});
check('TEST unchanged',()=>{env='TEST';const x='[PILOT TEST]\nContoh';assert.equal(o(x),x)});
check('PILOT_TEST retains legacy prefix',()=>{env='PILOT_TEST';assert(o('Contoh').startsWith('[PILOT TEST]'))});
console.log('PILOT_LABEL_AUDIT '+n+'/'+n+' PASS');
