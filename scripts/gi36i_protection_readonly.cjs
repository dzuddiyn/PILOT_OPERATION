'use strict';
// READ-ONLY diagnostic: NEVER print credentials.
const fs=require('fs'),path=require('path');
const {google}=require(path.join(process.env.APPDATA,'npm','node_modules','@google','clasp','node_modules','googleapis'));
const tokens=JSON.parse(fs.readFileSync(path.join(process.env.USERPROFILE,'.clasprc.json'),'utf8')).tokens.default;
const auth=new google.auth.OAuth2(tokens.client_id,tokens.client_secret);
auth.setCredentials({refresh_token:tokens.refresh_token,access_token:tokens.access_token,expiry_date:tokens.expiry_date});
(async()=>{
 const sheets=google.sheets({version:'v4',auth});
 const id='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY';
 const v=(await sheets.spreadsheets.get({spreadsheetId:id,fields:'spreadsheetId,sheets(properties(sheetId,title),protectedRanges(protectedRangeId,range,warningOnly,editors,requestingUserCanEdit))'})).data;
 console.log(JSON.stringify(v.sheets.filter(s=>[36001,36002].includes(s.properties.sheetId))));
})().catch(e=>{console.error('READ_ONLY_ERROR',String(e.message).slice(0,180));process.exitCode=1;});
