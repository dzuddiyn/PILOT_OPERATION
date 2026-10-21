'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const src=fs.readFileSync(__dirname+'/DeleteBindingTest.js','utf8'),ctx={};vm.createContext(ctx);vm.runInContext(src,ctx);
const ha='9'.repeat(64),hl='a'.repeat(64),ak='BSE-TG-772257418|Inventory_Event_Log|C1',lk='BSE-TG-772257418|INVENTORY_OUT';
const base={approval:{source_key:ak,decision_status:'REPORTER_CONFIRMED',payload_hash:ha},
 ledger:{source_key:lk,status:'APPROVED_TEST',payload_hash:hl,revision:1},
 evidence:{origin:'APPROVAL_TO_LEDGER_COMMIT_RECEIPT',approval_source_key:ak,ledger_source_key:lk,approval_hash:ha,ledger_hash:hl,proof_verified:true,immutable_receipt_id:'TEST_ONLY_RECEIPT'},
 approval_match_count:1,ledger_match_count:1,receipt_match_count:1,ledger_has_revision:true};
const check=x=>ctx.bseDeleteBinding10Validate_(x);
test('distinct approval and ledger hashes accepted only with independently verified provenance',()=>{
 const r=check(base);assert.equal(r.status,'VERIFIED');assert.notEqual(r.approval_hash,r.ledger_hash);
});
for(const [name,change,reason] of [
 ['no evidence',{evidence:null},'PROVENANCE_MISSING_OR_MISMATCH'],
 ['unverified proof',{evidence:{...base.evidence,proof_verified:false}},'PROVENANCE_UNVERIFIED'],
 ['wrong hash',{evidence:{...base.evidence,ledger_hash:'b'.repeat(64)}},'PROVENANCE_MISSING_OR_MISMATCH'],
 ['duplicate approval',{approval_match_count:2},'AMBIGUOUS_MAPPING'],
 ['duplicate ledger',{ledger_match_count:2},'AMBIGUOUS_MAPPING'],
 ['duplicate receipt',{receipt_match_count:2},'AMBIGUOUS_MAPPING'],
 ['no revision',{ledger_has_revision:false,ledger:{...base.ledger,revision:undefined}},'REVISION_UNAVAILABLE'],
 ['invalid revision',{ledger:{...base.ledger,revision:0}},'INVALID_REVISION'],
 ['discarded approval',{approval:{...base.approval,decision_status:'DISCARDED_BY_REPORTER'}},'STATUS_NOT_ELIGIBLE'],
 ['reference collision',{ledger:{...base.ledger,source_key:'BSE-TG-772257419|INVENTORY_OUT'}},'SOURCE_KEY_MISMATCH']
])test(name,()=>{const r=check({...base,...change});assert.equal(r.status,'UNVERIFIED');assert.equal(r.reason,reason)});
test('real legacy evidence with no signed binding and no revision fails closed',()=>{
 const r=check({...base,evidence:null,ledger_has_revision:false,ledger:{source_key:lk,status:'APPROVED_TEST',payload_hash:hl}});
 assert.equal(r.status,'UNVERIFIED');
});
test('pure validator contains no Sheets / Telegram write',()=>assert.doesNotMatch(src,/SpreadsheetApp|setValue\(|appendRow\(|bseTelegramApi_\(/));
