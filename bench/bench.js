/* Net Worth benchmark harness: functional flows + WCAG 2.2 AA (axe-core) + Lighthouse + persistence.
   Usage: node bench.js  -> writes report.json and prints a PASS/FAIL scorecard. */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const {execSync,spawn}=require('child_process');
const SRC='/home/user/networth/design/webapp-preview.html';const APP=__dirname+'/www/index.html';fs.mkdirSync(__dirname+'/www',{recursive:true});fs.writeFileSync(APP,'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><link rel="icon" href="data:,"></head><body>'+fs.readFileSync(SRC,'utf8')+'</body></html>');try{fs.copyFileSync('/home/user/networth/design/family.jpg',__dirname+'/www/family.jpg')}catch{}const SP='/tmp/claude-0/-home-user-net-worth/0d8ea8f5-255b-568d-8402-df56007d0fec/scratchpad/';
const AXE=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
const SEED=`const W=BUBS.findIndex(x=>x[0]==='Wise');S.accounts=[{id:'u',kind:'bank',name:'SGD account',mask:'4403',balance:1047.4,bank:W,inst:'Wise (US)',show:true},{id:'cb',kind:'brokerage',name:'Coinbase',balance:2.28,bank:BUBS.findIndex(x=>x[0]==='Coinbase'),show:true,added:Date.now()-36e4}];S.tx=null;S.user={name:'Sam Lee',email:'sam@example.com',onboarded:true};S.ob.step='done';ensureTx();save();`;
const SCREENS=[['home',{}],['home',{homeTab:'Net worth'}],['spending',{tab:'Overview'}],['spending',{tab:'Breakdown & budget'}],['spending',{tab:'Transactions'}],['spending',{tab:'Recurring'}],['spending',{tab:'Reports'}],['invest',{invTab:'Overview'}],['invest',{invTab:'Holdings'}],['invest',{invTab:'Market watch'}],['forecast',{}],['equity',{}],['brokerage',{}],['estate',{}],['tax',{}],['planner',{}],['settings',{stTab:'profile'}],['settings',{stTab:'security'}],['settings',{stTab:'accounts'}]];
const FLOW_TESTS=['tx-test.js','rec-test.js','inv-test.js','mw-test.js','fc-test.js','eq-test.js','br-test.js','will-test.js','tax-test.js','st-test.js','sp-test.js','au-test.js','tour-test.js','fp-test.js','stmt-test.js','smoke-test.js'];
const out={when:new Date().toISOString(),flows:{},axe:{},lighthouse:{},persistence:{},console:{}};
(async()=>{
 /* 1. functional flow suites */
 for(const t of FLOW_TESTS){if(!fs.existsSync(SP+t)){out.flows[t]='missing';continue}try{const r=execSync(`timeout 900 node ${SP+t}`,{cwd:SP,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop();out.flows[t]=r}catch(e){out.flows[t]='ERROR '+String(e.stdout||e.message).slice(-200)}}
 /* 2. accessibility (WCAG 2.2 A/AA rules) per screen, light + dark */
 const b=await chromium.launch();
 for(const mode of ['light','dark']){const p=await b.newPage({viewport:{width:1366,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
  await p.goto('file://'+APP);await p.evaluate(`${SEED}S.mode='${mode}';applyMode();`);
  for(const [v,ex] of SCREENS){await p.evaluate(([v,ex])=>{document.querySelectorAll('.ov,.wiz').forEach(o=>o.remove());S.view=v;Object.assign(S,ex);render();scrollTo(0,0)},[v,ex]);await p.waitForTimeout(1800);
   await p.addScriptTag({content:AXE});const r=await p.evaluate(async()=>{const res=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']},resultTypes:['violations']});return res.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>n.target.join(' '))}))});
   out.axe[`${mode}:${v}:${Object.values(ex).join('')||'-'}`]=r}
  out.console[mode]=[...new Set(errs)].slice(0,20);await p.close()}
 /* auth screens */
 {const p=await b.newPage({viewport:{width:1366,height:900}});await p.goto('file://'+APP);for(const st of ['signup','login']){await p.evaluate(st=>{S.user=null;S.ob={step:st,email:'',name:''};render()},st);await p.waitForTimeout(2400);await p.addScriptTag({content:AXE});out.axe['light:auth:'+st]=await p.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>n.target.join(' '))})))}await p.close()}
 /* 3. persistence ("back end" of the prototype: data survives reload, logout/login, reset) */
 {const ctx=await b.newContext();const p=await ctx.newPage();await p.goto('file://'+APP);await p.evaluate(`localStorage.clear();${SEED}S.rules=[{id:'r1',if:{amount:{op:'Greater than',v:100}},then:{tag:['Offsite']}}];S.watch=['AAPL'];S.fc={profile:{dob:'1995-02-16',income:60000,expenses:1500,retAge:67,life:90},scen:[{id:'s1',name:'Scenario 1',events:[]}],cur:'s1'};S.eq=[{id:'c1',name:'Acme',fmv:2,price:3,grants:[]}];save()`);
  await p.reload();await p.waitForTimeout(800);out.persistence.reload=await p.evaluate(()=>({accounts:S.accounts.length,rules:(S.rules||[]).length,watch:(S.watch||[]).length,fc:!!S.fc,eq:(S.eq||[]).length,user:!!S.user}));
  await p.evaluate(()=>doLogout());await p.waitForTimeout(400);await p.fill('#li-p','Abcdef1!');await p.click('#li-go');await p.waitForTimeout(2600);out.persistence.relogin=await p.evaluate(()=>({user:S.user?.name,accounts:S.accounts.length,view:S.view}));await ctx.close()}
 await b.close();
 /* 4. Lighthouse (served over http) */
 const srv=spawn('python3',['-m','http.server','8765','--directory',path.dirname(APP)],{stdio:'ignore'});await new Promise(r=>setTimeout(r,1200));
 try{const lh=path.join(__dirname,'node_modules/.bin/lighthouse');execSync(`${lh} http://127.0.0.1:8765/${path.basename(APP)} --quiet --output=json --output-path=${__dirname}/lh.json --only-categories=performance,accessibility,best-practices,seo --chrome-path=/opt/pw-browsers/chromium/chrome-linux/chrome --chrome-flags="--headless=new --no-sandbox" --preset=desktop`,{stdio:'ignore',timeout:240000});
  const j=JSON.parse(fs.readFileSync(__dirname+'/lh.json'));for(const [k,c] of Object.entries(j.categories))out.lighthouse[k]=Math.round(c.score*100);const a=j.audits;out.lighthouse.LCP_ms=Math.round(a['largest-contentful-paint'].numericValue);out.lighthouse.CLS=+a['cumulative-layout-shift'].numericValue.toFixed(3);out.lighthouse.TBT_ms=Math.round(a['total-blocking-time'].numericValue);out.lighthouse.failing=Object.values(a).filter(x=>x.score!==null&&x.score<0.9&&x.scoreDisplayMode==='binary').map(x=>x.id)}catch(e){out.lighthouse.error=String(e.message).slice(0,200)}finally{srv.kill()}
 /* scorecard */
 const flowFail=Object.entries(out.flows).filter(([k,v])=>!/^\[\]/.test(v));const axeAll=Object.values(out.axe).flat();const crit=axeAll.filter(v=>['critical','serious'].includes(v.impact));
 const L=out.lighthouse,P=out.persistence;
 const gates=[['Functional flows (all suites, 0 errors)',flowFail.length===0,`${FLOW_TESTS.length-flowFail.length}/${FLOW_TESTS.length}`],
  ['WCAG 2.2 AA – 0 critical/serious axe violations',crit.length===0,`${crit.length} critical/serious, ${axeAll.length} total`],
  ['Lighthouse Accessibility ≥ 90',L.accessibility>=90,L.accessibility],['Lighthouse Best Practices ≥ 90',L['best-practices']>=90,L['best-practices']],['Lighthouse Performance ≥ 90',L.performance>=90,L.performance],['Lighthouse SEO ≥ 90',L.seo>=90,L.seo],
  ['Core Web Vitals: LCP ≤ 2500 ms',L.LCP_ms<=2500,L.LCP_ms],['Core Web Vitals: CLS ≤ 0.1',L.CLS<=0.1,L.CLS],
  ['No console/page errors',[...out.console.light,...out.console.dark].length===0,[...out.console.light,...out.console.dark].length],
  ['Persistence: reload keeps data',P.reload&&P.reload.accounts===2&&P.reload.rules===1&&P.reload.watch===1&&P.reload.fc&&P.reload.eq===1,JSON.stringify(P.reload)],
  ['Persistence: logout → login restores account',P.relogin&&P.relogin.user==='Sam Lee'&&P.relogin.accounts===2,JSON.stringify(P.relogin)]];
 out.gates=gates.map(([n,ok,v])=>({gate:n,pass:!!ok,value:v}));out.pass=out.gates.every(g=>g.pass);
 fs.writeFileSync(__dirname+'/report.json',JSON.stringify(out,null,1));
 console.log(out.gates.map(g=>`${g.pass?'PASS':'FAIL'}  ${g.gate}  [${g.value}]`).join('\n'));console.log(out.pass?'\nBENCHMARK: PASS':'\nBENCHMARK: FAIL');
 if(flowFail.length)console.log('flow failures:',JSON.stringify(flowFail));
 const agg={};axeAll.forEach(v=>{const k=v.id+'|'+v.impact;agg[k]=(agg[k]||0)+v.n});console.log('axe by rule:',JSON.stringify(agg));
 if(L.failing)console.log('LH failing audits:',L.failing.join(', '));console.log('console:',JSON.stringify(out.console).slice(0,800));
})();
