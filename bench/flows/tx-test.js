const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1366,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));const w=t=>p.waitForTimeout(t);let n=0;const shot=async()=>{await p.screenshot({path:`/tmp/claude-0/-home-user-net-worth/0d8ea8f5-255b-568d-8402-df56007d0fec/scratchpad/t${++n}.png`})};
await p.goto('file:///home/user/networth/design/webapp-preview.html');
await p.evaluate(()=>{const W=BUBS.findIndex(x=>x[0]==='Wise');S.accounts=[{id:'u',kind:'bank',name:'SGD account',balance:1009.13,bank:W,inst:'Wise (US)',show:true}];S.tx=null;S.user={name:'Sam Lee',onboarded:true};S.ob.step='done';S.view='spending';S.tab='Transactions';save();render()});await w(1400);await shot(); //1 table
await p.click('[data-txo="r1"] td');await w(700);await shot();                                 //2 detail
await p.click('[data-tagrow]');await w(400);await shot();                                       //3 tag picker
await p.click('[data-tg="Offsite"]');await w(150);await p.click('[data-tsave]');await w(600);await shot(); //4 tagged
await p.click('[data-thide]');await w(700);await shot();                                        //5 hidden
await p.click('[data-thide]');await w(400);await p.click('[data-tsplit]');await w(700);await shot(); //6 split drawer
await p.click('[data-spadd]');await w(300);await shot();                                        //7 invalid empty
await p.fill('[data-spa="0"]','55.45');await p.click('[data-scat="1"]');await w(300);await shot(); //8 category picker
await p.click('.cpop [data-cp="Groceries"]');await p.fill('[data-spa="1"]','16.50');await w(300);await shot(); //9 valid
await p.click('[data-spapply]');await w(1200);await shot();                                     //10 split created
await p.evaluate(()=>document.querySelectorAll('.drw').forEach(d=>d.remove()));await w(400);await p.fill('#txq','zzz');await w(400);await shot(); //11 empty search
console.log(JSON.stringify(errs));await b.close()})();
