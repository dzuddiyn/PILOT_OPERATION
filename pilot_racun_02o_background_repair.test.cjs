'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const src=fs.readFileSync(__dirname+'/PilotRacunTelegramAggregateCore.js','utf8');
const begin=src.indexOf('function bsePilotRacunRepairPendingCard_(');
const end=src.indexOf('/** Retry repair after journal',begin);
const card=Array(26).fill('');card[0]='BSE-TG-100';card[1]='BSE-TG-100|Treatment_Event_Log';card[2]='HASH';card[17]='REPORTER_CONFIRMED';card[18]='PILOT_RACUN_ATOMIC';card[19]='RACUN_CARD_EDIT_PENDING';
const ctx={Error,String,Number,JSON,
 bsePilotRacunLockOwned_:()=>true,
 bseTelegramApprovalSheet_:()=>({}),
 bseApprovalRows_:()=>[card],
 bseTelegramQueue_:()=>({getLastRow:()=>2,getRange:()=>({getValues:()=>[['100','','','','','','','','',JSON.stringify({synthetic_only:true})]]})}),
 BSE_TG_QUEUE_HEADERS:Array(10).fill(''),
 bsePilotRacunAggregateEnvelope_:()=>({aggregate_type:'PILOT_RACUN_ATOMIC'}),
 bseApprovalHash_:()=> 'HASH',
 bsePilotRacunAtomicPlan_:()=>({reference:'BSE-TG-100',record_count:10}),
 bsePilotRacunSheetAdapter_:()=>({}),
 bsePilotRacunApprovalReconcile_:()=>({status:'LEDGER_VERIFIED',record_count:10}),
 bsePilotRacunReceiptText_:()=> 'VERIFIED 10',
 bsePilotRacunCardEdit_:()=>({synced:true})
};vm.createContext(ctx);vm.runInContext(src.slice(begin,end),ctx);
test('worker repairs only pending committed card with independent evidence',()=>{
 assert.equal(ctx.bsePilotRacunRepairPendingCard_({}).status,'CARD_REPAIRED');
 card[19]='';assert.equal(ctx.bsePilotRacunRepairPendingCard_({}).status,'NO_PENDING');
});
test('worker refuses repair when ledger not independently verified',()=>{
 card[19]='RACUN_CARD_EDIT_PENDING';ctx.bsePilotRacunApprovalReconcile_=()=>({status:'RECOVERY_REQUIRED'});
 assert.throws(()=>ctx.bsePilotRacunRepairPendingCard_({}),/LEDGER_UNVERIFIED/);
});
