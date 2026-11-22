/* Click-every-button smoke test: on each screen, click each visible button once and record any page error. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1366,height:860}});
const errs=[];let cur='';p.on('pageerror',e=>errs.push(cur+' → '+e.message));p.on('dialog',d=>d.dismiss());
await p.goto('file:///home/user/networth/design/webapp-preview.html');
const SEED=()=>{const W=BUBS.findIndex(x=>x[0]==='Wise');S.accounts=[{id:'u',kind:'bank',name:'SGD account',mask:'4403',balance:1047.4,bank:W,inst:'Wise (US)',show:true},{id:'cb',kind:'brokerage',name:'Coinbase',balance:2.28,bank:BUBS.findIndex(x=>x[0]==='Coinbase'),show:true,added:Date.now()-36e4}];S.tx=null;S.user={name:'Sam Lee',email:'sam@example.com',onboarded:true};S.ob.step='done';S.tourDone=1;ensureTx();save()};
const SC=[['home',{}],['home',{homeTab:'Net worth'}],['spending',{tab:'Overview'}],['spending',{tab:'Breakdown & budget'}],['spending',{tab:'Transactions'}],['spending',{tab:'Recurring'}],['spending',{tab:'Reports'}],['invest',{invTab:'Overview'}],['invest',{invTab:'Holdings'}],['invest',{invTab:'Market watch'}],['forecast',{}],['equity',{}],['brokerage',{}],['estate',{}],['tax',{}],['planner',{}],['settings',{stTab:'profile'}],['settings',{stTab:'accounts'}],['settings',{stTab:'refer'}],['settings',{stTab:'security'}],['settings',{stTab:'member'}],['settings',{stTab:'aiprof'}]];
let clicks=0;
for(const [v,ex] of SC){const reset=async()=>{await p.evaluate(([v,ex])=>{document.querySelectorAll('.ov,.wiz,.cmenu,.tour,.drw').forEach(o=>o.remove());document.body.style.overflow='';S.view=v;Object.assign(S,ex);S.hdet=null;render();scrollTo(0,0)},[v,ex]);await p.waitForTimeout(250)};
 await p.evaluate(SEED);await reset();
 const n=await p.evaluate(()=>[...document.querySelectorAll('#root button:not([disabled]),#root a[href="#"]')].filter(x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0}).length);
 for(let i=0;i<Math.min(n,60);i++){cur=`${v}${Object.values(ex).join('')?':'+Object.values(ex).join(''):''} #${i}`;
  const label=await p.evaluate(i=>{const els=[...document.querySelectorAll('#root button:not([disabled]),#root a[href="#"]')].filter(x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0});const el=els[i];if(!el)return null;if(/log ?out|delete account/i.test(el.textContent+el.getAttribute('aria-label')))return 'skip';el.click();return (el.getAttribute('aria-label')||el.textContent||'').trim().slice(0,30)},i).catch(e=>'ERR '+e.message);
  if(label&&label!=='skip'){cur+=' "'+label+'"';clicks++}await p.waitForTimeout(120);await reset()}}
console.error('clicks',clicks);console.log(JSON.stringify([...new Set(errs)].slice(0,30)));await b.close()})();
