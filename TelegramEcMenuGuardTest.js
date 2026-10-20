/** @OnlyCurrentDoc */
// GI-EC-MENU: explicit, guarded Telegram default-scope command rename.
// Never read, print, or return bot tokens. No queue/approval/domain operations.
function bsePilotEcMenuReadOnly_(){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')
    throw new Error('EC_MENU_ENVIRONMENT_MISMATCH');
  const expected=String(bseRuntimeBotUsername_()||'');
  if(!expected||!/^[-_a-zA-Z0-9]+$/.test(expected))
    throw new Error('EC_MENU_EXPECTED_IDENTITY_MISSING');
  const bot=bseTelegramApi_('getMe',{});
  if(!bot||bot.is_bot!==true||String(bot.username||'')!==expected)
    throw new Error('EC_MENU_BOT_IDENTITY_MISMATCH');
  const current=bseTelegramApi_('getMyCommands',{});
  return {bot_username:expected,commands:bsePilotEcMenuValidate_(current)};
}
function bsePilotEcMenuValidate_(commands){
  if(!Array.isArray(commands)||commands.length>100)
    throw new Error('EC_MENU_INVALID_COMMANDS');
  const seen={};
  return commands.map(function(item){
    if(!item||typeof item.command!=='string'||typeof item.description!=='string')
      throw new Error('EC_MENU_INVALID_ENTRY');
    const name=item.command,description=item.description;
    if(!/^[a-z0-9_]{1,32}$/.test(name)||!description.trim()||
       description.length>256||Object.prototype.hasOwnProperty.call(seen,name))
      throw new Error('EC_MENU_INVALID_OR_DUPLICATE_COMMAND');
    seen[name]=true;
    return {command:name,description:description};
  });
}
function inspectBsePilotEcMenu(){
  const current=bsePilotEcMenuReadOnly_();
  const snapshot={
    environment:'PILOT_OPERATION',bot_username:current.bot_username,
    scope:'default',commands:current.commands,command_count:current.commands.length,
    production_write:false
  };
  console.log('GI_EC_MENU_PREWRITE_READ_ONLY '+JSON.stringify(snapshot));
  return snapshot;
}
function updateBsePilotEcMenu(){
  const current=bsePilotEcMenuReadOnly_();
  const originals=current.commands,old=originals.filter(function(c){return c.command==='ec_history';}),
    renamed=originals.filter(function(c){return c.command==='ec';});
  if(old.length===0&&renamed.length===1){
    console.log('GI_EC_MENU_ALREADY_APPLIED '+JSON.stringify({
      environment:'PILOT_OPERATION',bot_username:current.bot_username,commands:originals,
      writes:0,production_write:false
    }));
    return {status:'ALREADY_APPLIED',commands:originals,writes:0,production_write:false};
  }
  if(old.length!==1||renamed.length!==0)
    throw new Error('EC_MENU_RENAME_PRECONDITION_FAILED');
  const next=originals.map(function(c){
    return c.command==='ec_history'?{command:'ec',description:c.description}:c;
  });
  bsePilotEcMenuValidate_(next);
  // Telegram has no compare-and-swap. Detect any intervening menu drift
  // immediately before the one authorized rename write.
  const fresh=bsePilotEcMenuValidate_(bseTelegramApi_('getMyCommands',{}));
  if(JSON.stringify(fresh)!==JSON.stringify(originals))
    throw new Error('EC_MENU_PREWRITE_REVISION_CONFLICT');
  // Log the full original default-scope menu BEFORE any Telegram WRITE.
  console.log('GI_EC_MENU_PREWRITE_SNAPSHOT '+JSON.stringify({
    environment:'PILOT_OPERATION',bot_username:current.bot_username,
    scope:'default',original_commands:originals,proposed_commands:next,
    production_write:false
  }));
  const accepted=bseTelegramApi_('setMyCommands',{commands:next});
  if(accepted!==true)throw new Error('EC_MENU_WRITE_OUTCOME_UNKNOWN_READ_BACK_REQUIRED');
  const actual=bsePilotEcMenuValidate_(bseTelegramApi_('getMyCommands',{}));
  if(JSON.stringify(actual)!==JSON.stringify(next))
    throw new Error('EC_MENU_POSTWRITE_MISMATCH_RECONCILIATION_REQUIRED');
  console.log('GI_EC_MENU_UPDATED_AND_VERIFIED '+JSON.stringify({
    environment:'PILOT_OPERATION',bot_username:current.bot_username,
    scope:'default',command_count:actual.length,commands:actual,
    writes:1,production_write:false
  }));
  return {status:'VERIFIED',commands:actual,writes:1,production_write:false};
}
