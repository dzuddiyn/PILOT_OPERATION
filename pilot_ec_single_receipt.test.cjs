'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),test=require('node:test'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'TelegramApprovalUiTest.js'),'utf8');
const marker='function bseTelegramReporterConfirmationCore_(';
const start=src.lastIndexOf(marker);
const latest=src.slice(start,src.indexOf('\nfunction ',start+marker.length));
test('PILOT EC uses one original card with reporter name; no duplicate owner/PM summary',()=>{
 assert(start>=0);
 assert(latest.includes("domain.target==='EC_Leachate_Log'?bseEcLeachateConfirmedSummary_"));
 const selection=latest.match(/const censusSingle=([^;]+);/);
 assert(selection,'single-message selection must exist');
 assert(selection[1].includes("bseRuntimeEnvironmentName_()==='PILOT_OPERATION'"));
 assert(selection[1].includes("domain.target==='EC_Leachate_Log'"));
 assert(latest.includes("bseTelegramReporterDisplayName_(book,String(row[0]))"));
 assert(latest.includes("receiptText+'\\nPelapor : '+reporterName"));
 assert(latest.includes('if(!censusSingle){'),'fallback notices guarded');
 assert(latest.includes('bseTelegramReporterReceipt_(book,row[3],receiptText)'));
 assert(latest.includes('bseTelegramOwnerNotice_(book,ownerNotice)'));
});
