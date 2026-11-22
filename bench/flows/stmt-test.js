const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1366,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/bench/www/index.html');await p.evaluate(`S.accounts=[];S.tx=null;S.user={name:'Sam',email:'s@x.com',onboarded:true};S.ob.step='done';S.view='home';render()`);
for(const f of ['neo.csv','t.ofx','t.sta']){await p.evaluate(()=>addAccount());await p.waitForTimeout(300);await p.click('[data-man="import"]');await p.waitForTimeout(300);
 await p.setInputFiles('#stf',__dirname+'/si/'+f);await p.waitForTimeout(400);if(f==='neo.csv'){await p.selectOption('#stc','AED');await p.screenshot({path:__dirname+'/si/prev.png'})}await p.click('[data-stgo]');await p.waitForTimeout(500)}
// re-import dup
await p.evaluate(()=>addAccount());await p.waitForTimeout(300);await p.click('[data-man="import"]');await p.waitForTimeout(300);await p.setInputFiles('#stf',__dirname+'/si/neo.csv');await p.waitForTimeout(300);await p.selectOption('#sta',{index:1});await p.click('[data-stgo]');await p.waitForTimeout(400);
console.log(await p.evaluate(()=>JSON.stringify({a:S.accounts.map(a=>[a.name,a.balance,a.currency]),tx:S.tx.filter(t=>t.src).map(t=>[t.date,t.name,t.cat,t.amount])})));
await p.evaluate(`S.view='spending';S.tab='Transactions';render()`);await p.waitForTimeout(600);await p.screenshot({path:__dirname+'/si/tx.png'});console.log(JSON.stringify(errs));await b.close()})();
