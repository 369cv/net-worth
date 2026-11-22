const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1366,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));const w=t=>p.waitForTimeout(t);let n=0;const D='/tmp/claude-0/-home-user-net-worth/0d8ea8f5-255b-568d-8402-df56007d0fec/scratchpad/';const shot=async()=>{await p.screenshot({path:`${D}i${++n}.png`})};
const step=async(name,fn)=>{try{await fn()}catch(e){errs.push(name+': '+e.message.split('\n')[0])}};
await p.goto('file:///home/user/networth/design/webapp-preview.html');
await p.evaluate(()=>{const W=BUBS.findIndex(x=>x[0]==='Wise');S.accounts=[{id:'u',kind:'bank',name:'SGD account',balance:1009.13,bank:W,inst:'Wise (US)',show:true}];S.tx=null;S.user={name:'Sam Lee',onboarded:true};S.ob.step='done';S.view='spending';S.tab='Reports';save();render()});await w(1200);await shot();//1 cash flow
await step('exp',async()=>{await p.click('[data-reptab="Expenses"]');await w(500);await shot();await p.click('[data-repc="donut"]');await w(600);await shot()});
await step('filter',async()=>{await p.click('[data-repfilter]');await w(500);await p.click('[data-rfc="Shopping"]');await p.click('[data-rfc="Auto & transport"]');await shot();await p.click('[data-rfap]');await w(600);await shot()});
await step('save',async()=>{await p.click('[data-repsave]');await w(400);await shot();await p.click('#srf .btn.pri');await w(700);await shot()});
await step('apply',async()=>{await p.click('[data-reptab="Income"]');await w(300);await p.click('[data-srep]');await w(400);await shot()});
await step('invEmpty',async()=>{await p.evaluate(()=>{S.view='invest';render()});await w(700);await shot()});
await step('inv',async()=>{await p.evaluate(()=>{S.accounts.push({id:'cb',kind:'brokerage',name:'Coinbase',balance:2.12,bank:BUBS.findIndex(x=>x[0]==='Coinbase'),show:true,added:Date.now()-36e4});render()});await w(900);await shot();await p.click('[data-icmp="1"]');await w(500);await p.hover('[data-icmpchart]',{position:{x:300,y:80}});await w(300);await shot();await p.click('[data-iser="Bonds"]');await w(300);await p.mouse.wheel(0,600);await w(400);await shot()});
await step('hold',async()=>{await p.click('[data-itab="Holdings"]');await w(500);await shot();await p.click('.tgl:has([data-pro])');await w(500);await shot();await p.fill('#hq','zz');await w(300);await shot()});
console.log(JSON.stringify(errs));await b.close()})();
