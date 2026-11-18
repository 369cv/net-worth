// nav state + mobile menu
const nav=document.getElementById('nav');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40),{passive:true});
document.getElementById('burger').onclick=e=>{const o=document.getElementById('links').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',o)};
document.querySelectorAll('#links a').forEach(a=>a.onclick=()=>document.getElementById('links').classList.remove('open'));

// reveal + count-up
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  e.target.classList.add('in');
  e.target.querySelectorAll('[data-count]').forEach(count);
  io.unobserve(e.target);
}),{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
function count(el){
  const end=+el.dataset.count,dec=+(el.dataset.dec||0),pre=el.dataset.pre||'',suf=el.dataset.suf||'';
  const t0=performance.now(),d=1400;
  (function f(t){const p=Math.min((t-t0)/d,1),v=end*(1-Math.pow(1-p,3));
    el.textContent=pre+v.toLocaleString(undefined,{minimumFractionDigits:dec,maximumFractionDigits:dec})+suf;
    if(p<1)requestAnimationFrame(f)})(t0);
}

// chart line draw-on: tag every stroked path
document.querySelectorAll('svg path[fill="none"]:not(.nodraw)').forEach(p=>{if(p.closest('symbol,.mark,.ic'))return;
  const L=Math.ceil(p.getTotalLength());p.style.setProperty('--len',L);p.classList.add('draw');
});
// standalone observers for phone + typing
const once=(el,fn)=>{if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){fn(el);o.disconnect()}},{threshold:.3});o.observe(el)};
once(document.getElementById('dlPhone'),el=>el.classList.add('in'));
// ask-anything sequence: type question -> send -> thinking -> answer + chart
(()=>{const el=document.getElementById('typed');if(!el)return;const card=el.closest('.chat');card.classList.add('seq');
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
once(card,()=>{const s=el.dataset.text;if(rm){el.textContent=s;card.classList.add('sent','answered');return}let i=0;
 (function t(){el.textContent=s.slice(0,++i);if(i<s.length)return setTimeout(t,38+Math.random()*40);
  setTimeout(()=>{card.classList.add('sent');setTimeout(()=>card.classList.add('answered'),1700)},450)})()})})();
// hero phone untilts as it scrolls into center
const hp=document.getElementById('heroPhone');
if(hp)addEventListener('scroll',()=>{const r=hp.getBoundingClientRect(),c=(r.top+r.height/2)/innerHeight;hp.style.setProperty('--t',Math.max(0,Math.min(1,(c-.35)/.6)).toFixed(3))},{passive:true});
// cursor spotlight on cards
document.querySelectorAll('.card').forEach(c=>c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}));
// hero v2: split headline into per-letter masks
const ht=document.getElementById('heroTitle');let k=0;
if(ht){[...ht.childNodes].forEach(n=>{
  const isOwn=n.nodeType===1;const words=n.textContent.trim().split(/\s+/);
  const frag=document.createDocumentFragment();
  words.forEach((w,wi)=>{const wd=document.createElement('span');wd.className='wd';
    [...w].forEach(c=>{const s=document.createElement('span');s.className='ch';s.textContent=c;s.style.animationDelay=(.25+k++*.045)+'s'+(isOwn?',2s':'');wd.appendChild(s)});
    frag.appendChild(wd);if(wi<words.length-1||!isOwn)frag.appendChild(document.createTextNode(' '))});
  if(isOwn){n.textContent='';n.appendChild(frag)}else{frag.prepend(document.createTextNode(' '));n.replaceWith(frag)}
});
ht.setAttribute('aria-label',ht.textContent.trim())}
// hero v2: scroll-out (content lifts + fades, sky drifts slower) and mouse parallax on glow
const hero=document.querySelector('.hero');
if(hero&&hero.querySelector('.glow')){const hw=hero.querySelector('.wrap'),glow=hero.querySelector('.glow');
addEventListener('scroll',()=>{const y=scrollY;if(y>innerHeight)return;
  hero.style.backgroundPositionY=`calc(50% + ${y*.35}px)`;
  hw.style.transform=`translateY(${y*.25}px) scale(${1-y/innerHeight*.06})`;hw.style.opacity=1-y/(innerHeight*.75)},{passive:true});
hero.addEventListener('pointermove',e=>{const x=(e.clientX/innerWidth-.5),y=(e.clientY/innerHeight-.5);
  glow.style.translate=`${x*60}px ${y*40}px`});
// hero v2: rotating example questions in the ask bar
const qi=hero.querySelector('.ask input'),qs=['Where am I overspending this month?','Can I afford a $600k home?','How much should I save for retirement?','Am I on track to retire at 60?'];let qn=0;
setInterval(()=>{if(document.activeElement===qi)return;qi.style.opacity=0;setTimeout(()=>{qi.placeholder=qs[++qn%qs.length];qi.style.opacity=1},300)},3200);}

// ===== WAITLIST =====
const wl=document.getElementById('wl'),wf=document.getElementById('wlForm'),wd=document.getElementById('wlDone'),we=document.getElementById('wlErr');
const qp=new URLSearchParams(location.search);const REF=qp.get('ref')||'';const UTM=Object.fromEntries([...qp].filter(([k])=>k.startsWith('utm_')));
let ctx={source:'unknown',question:''};
function openWL(source,role,email,question){ctx={source,question:question||''};wf.hidden=false;wd.hidden=true;we.textContent='';
  wf.role.value=role||'individual';if(email)wf.email.value=email;setKind();wl.classList.add('open');setTimeout(()=>wf.email.focus(),200)}
function closeWL(){wl.classList.remove('open')}
document.addEventListener('click',e=>{const t=e.target.closest('[data-waitlist]');if(t){e.preventDefault();openWL(t.dataset.waitlist,t.dataset.role);if(t.dataset.platform)wf.platform.value=t.dataset.platform}
  if(e.target===wl||e.target.closest('[data-close]'))closeWL()});
addEventListener('keydown',e=>{if(e.key==='Escape')closeWL()});
document.getElementById('heroAsk')?.addEventListener('submit',e=>{e.preventDefault();openWL('hero-ask',null,'',e.target.querySelector('input').value)});
document.querySelectorAll('.inline-wl').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();openWL(f.dataset.source,null,f.email.value)}));
// Wix Forms backend (Waitlist form). Falls back to /api/waitlist (Vercel) if Wix is unreachable.
const WIX={clientId:'93d68ff8-1a94-4b42-a760-c0ea27b7bac5',forms:{waitlist:'1d9929b8-d1e7-48e4-9672-7997bfec89ca',investor:'0c6e759b-583e-4251-9593-95576abc4666',employer:'f48bc911-d749-42e2-92d4-1ff892dbb100'}};
const KIND={investor:{t:'<em>Investor</em> inquiry',sub:"Tell us about you and we'll send the deck and set up a founder call.",btn:'Request the deck',sl:'Check size',opts:['Under $50k','$50k-$250k','$250k-$1M','$1M+','Fund / institutional']},
employer:{t:'<em>Book</em> a demo',sub:'Tell us about your team and we\'ll set up a pilot walkthrough.',btn:'Book a demo',sl:'Team size',opts:['1-50','51-200','201-1000','1000+']}};
function setKind(){const r=wf.role.value,k=KIND[r];const ex=document.getElementById('wlExtra');ex.hidden=!k;
 document.getElementById('wlPlat').closest('form').querySelector('label[for=wlPlat]').hidden=!!k;document.getElementById('wlPlat').hidden=!!k;
 document.getElementById('wlTitle').innerHTML=k?k.t:'<em>Request</em> access';wf.querySelector('p.muted').textContent=k?k.sub:'Invites go out weekly. The web app comes first, then iOS and Android.';
 wf.querySelector('button[type=submit]').textContent=k?k.btn:'Join the waitlist';
 if(k){document.getElementById('wlSizeL').textContent=k.sl;document.getElementById('wlSize').innerHTML=k.opts.map(o=>`<option>${o}</option>`).join('')}}
wf.role.addEventListener('change',setKind);
let wixTok=null;
async function wixToken(){if(wixTok)return wixTok;const r=await fetch('https://www.wixapis.com/oauth2/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clientId:WIX.clientId,grantType:'anonymous'})});wixTok=(await r.json()).access_token;return wixTok}
async function submitWix(d){
  const u0=Object.entries(d.utm||{}).map(([k,v])=>k+'='+v).join('&').slice(0,200);
  if(d.role==='investor'||d.role==='employer'){const s={email:d.email,source:d.source||'unknown'};if(d.name)s.first_name=d.name;if(d.org)s.company=d.org;if(d.size)s[d.role==='investor'?'check_size':'team_size']=d.size;if(d.message)s.message=d.message.slice(0,1000);if(u0)s.utm=u0;
   const r=await fetch('https://www.wixapis.com/form-submission-service/v4/submissions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:await wixToken()},body:JSON.stringify({submission:{formId:WIX.forms[d.role],submissions:s}})});if(!r.ok)throw new Error('wix '+r.status);return}
  const s={email:d.email,role:d.role,platform:d.platform,source:d.source||'unknown'};
  if(d.name)s.first_name=d.name;if(d.question)s.question=d.question.slice(0,500);if(d.ref)s.referred_by=d.ref;
  const u=Object.entries(d.utm||{}).map(([k,v])=>k+'='+v).join('&');if(u)s.utm=u.slice(0,200);
  const r=await fetch('https://www.wixapis.com/form-submission-service/v4/submissions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:await wixToken()},body:JSON.stringify({submission:{formId:WIX.forms.waitlist,submissions:s}})});
  if(!r.ok)throw new Error('wix '+r.status);
}
async function refCode(e){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(e.trim().toLowerCase()));return [...new Uint8Array(b)].slice(0,4).map(x=>x.toString(16).padStart(2,'0')).join('')}
async function submitWL(data){
  if(data.company)return {code:'x'};
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email))throw new Error('Please enter a valid email.');
  try{await submitWix(data);return {code:await refCode(data.email)}}catch(e){console.warn('Wix submit failed, trying /api',e)}
  const r=await fetch('/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Something went wrong. Please try again.');return j}
wf.addEventListener('submit',async e=>{e.preventDefault();we.textContent='';const b=wf.querySelector('button[type=submit]');b.disabled=true;b.textContent='Joining…';
  try{const j=await submitWL({email:wf.email.value,name:wf.name.value,role:wf.role.value,platform:wf.platform.value,company:wf.company.value,source:ctx.source,question:ctx.question,org:wf.org.value,size:wf.size.value,message:wf.message.value,ref:REF,utm:UTM,page:location.pathname});
    document.getElementById('wlRef').value=location.origin+'/?ref='+j.code;wf.hidden=true;wd.hidden=false;
    window.va&&window.va('event',{name:'waitlist_join',data:{source:ctx.source,role:wf.role.value}});
  }catch(err){we.textContent=err.message}finally{b.disabled=false;setKind()}});
document.getElementById('wlCopy').onclick=e=>{navigator.clipboard?.writeText(document.getElementById('wlRef').value);e.target.textContent='Copied ✓'};

// testimonial carousel
// any .dots row scrolls the nearest .hscroll in its section
document.querySelectorAll('.dots button').forEach(b=>b.onclick=()=>{const c=b.closest('section').querySelector('.hscroll');if(c)c.scrollBy({left:+b.dataset.dir*(c.firstElementChild.offsetWidth+28),behavior:'smooth'})});
// FAQ cards: one open at a time per list
document.querySelectorAll('.faq2').forEach(l=>l.addEventListener('toggle',e=>{if(e.target.open)l.querySelectorAll('details[open]').forEach(d=>d!==e.target&&(d.open=false))},true));
// mark current nav link
document.querySelectorAll('#links a').forEach(a=>{if(a.getAttribute('href')===(location.pathname.split('/').pop()||'index.html').replace(/^([^.]+)$/,'$1.html'))a.classList.add('cur')});

// employers: typed AI reply when visible
(()=>{const el=document.getElementById('empReply');if(!el)return;const t="Likely yes. At your current savings rate you'd reach about 92% of your target by 60. Raising contributions by 3% closes the gap without changing your spending.";
new IntersectionObserver((e,o)=>{if(!e[0].isIntersecting)return;o.disconnect();let i=0;(function f(){el.textContent=t.slice(0,i+=2);if(i<t.length)setTimeout(f,22)})()},{threshold:.4}).observe(el)})();

// fan v2: settle flag after entrance, scroll-linked spread only while visible (rAF-throttled)
(()=>{const fan=document.querySelector('.fan');if(!fan)return;const stage=fan.closest('.stage');
let vis=false,tick=false;
const upd=()=>{tick=false;const r=fan.getBoundingClientRect();const c=(r.top+r.height/2)/innerHeight;const v=Math.max(0,Math.min(1,(.75-c)/.6));fan.style.setProperty('--sp',v.toFixed(3))};
new IntersectionObserver(([e])=>{vis=e.isIntersecting;stage&&stage.classList.toggle('live',vis);if(vis){fan.classList.add('in');setTimeout(()=>fan.classList.add('settled'),1400);upd()}},{threshold:.2}).observe(fan);
if(!matchMedia('(prefers-reduced-motion: reduce)').matches)addEventListener('scroll',()=>{if(vis&&!tick&&fan.classList.contains('settled')){tick=true;requestAnimationFrame(upd)}},{passive:true});
})();

// nav v2: products dropdown (click/keyboard, closes on outside click / Escape)
(()=>{const dd=document.querySelector('.dd');if(!dd)return;const b=dd.querySelector('.nb');
const set=o=>{dd.classList.toggle('open',o);b.setAttribute('aria-expanded',o)};
b.addEventListener('click',e=>{e.stopPropagation();set(!dd.classList.contains('open'))});
if(matchMedia('(hover:hover)').matches){dd.addEventListener('mouseenter',()=>set(true));dd.addEventListener('mouseleave',()=>set(false))}
document.addEventListener('click',e=>{if(!dd.contains(e.target))set(false)});
addEventListener('keydown',e=>{if(e.key==='Escape')set(false)});
dd.querySelectorAll('.ddm a').forEach(a=>{if(a.getAttribute('href')===(location.pathname.split('/').pop()||'index.html'))a.classList.add('cur')});
})();

// simplify: scroll-driven rotate-up of the phone (0 = isometric, 1 = upright), rAF-throttled, only while visible
(()=>{const fan=document.getElementById('fan');if(!fan||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const stage=fan.closest('.stage'),ph=fan.querySelector('.ph-c'),bars=[...fan.querySelectorAll('.prog i')];let vis=false,tick=false;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const upd=()=>{tick=false;const r=stage.getBoundingClientRect();const total=r.height-innerHeight*.9;const raw=Math.min(1,Math.max(0,(-r.top+innerHeight*.15)/Math.max(1,total)));
 const p=ease(raw);ph.style.setProperty('--p',p.toFixed(4));bars.forEach((b,i)=>b.style.setProperty('--f',Math.min(1,Math.max(0,raw*3-i)).toFixed(3)))};
new IntersectionObserver(([e])=>{vis=e.isIntersecting;if(vis){fan.classList.add('in');upd()}},{rootMargin:'0px 0px -10% 0px'}).observe(stage);
addEventListener('scroll',()=>{if(vis&&!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});addEventListener('resize',upd);})();
