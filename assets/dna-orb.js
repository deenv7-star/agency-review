(function(){
if(window.__dnaOrb)return;window.__dnaOrb=1;
var WA='https://wa.me/972525979520?text='+encodeURIComponent('היי דין, ראיתי את האתר ואני רוצה לדבר');
function faq(){var out=[];document.querySelectorAll('#faq details').forEach(function(d){var q=d.querySelector('summary');if(!q)return;var qt=(q.querySelector('h3,b,strong,span:last-child')||q).textContent.replace(/^\s*\d+\s*/,'').trim();var clone=d.cloneNode(true);var s=clone.querySelector('summary');if(s)s.remove();var a=clone.textContent.replace(/\s+/g,' ').trim();if(qt&&a)out.push({q:qt,a:a})});return out}
function services(){var t=[];document.querySelectorAll('#services h3').forEach(function(h){var x=h.textContent.trim();if(x&&t.indexOf(x)<0&&t.length<6)t.push(x)});return t}
function osText(){var p=document.querySelector('.dna-os-disclaimer');return p?p.textContent.trim():''}
var KB=null;
function build(){var f=faq(),items=[];
var kw=[['עושים|עושה|מה אתם|שירות|סוכנות','0'],['קמפיינ|ניהול|ממומן|פרסום','1'],['AI|בינה|ai','2'],['עסקים|לקוחות|עם מי|סוג','3'],['פרויקט|אחד|חבילה|התחייבות','4']];
f.forEach(function(x,i){items.push({chip:x.q,a:x.a,re:new RegExp((kw[i]||['^$'])[0],'i')})});
var sv=services();if(sv.length)items.push({chip:'אילו שירותים יש?',a:'השירותים שמופיעים באתר: '+sv.join(' · ')+'.',re:/שירותים|תחומים|מה יש/});
var os=osText();if(os)items.push({chip:'מה זה DNA OS?',a:os,re:/DNA OS|מערכת|os/i});
items.push({chip:'כמה זה עולה?',a:'באתר אין מחירון קבוע - המחיר תלוי בהיקף. הכי מהיר לשאול את דין ישירות.',re:/מחיר|עולה|עלות|תקציב|כמה/,hand:1});
KB=items}
var css='.dna-orb{position:fixed;z-index:60;right:20px;bottom:20px;width:64px;height:64px;border-radius:50%;border:0;padding:0;cursor:pointer;background:radial-gradient(circle at 35% 30%,#f3ffb0 0%,#dfff00 38%,#a8c400 100%);box-shadow:0 12px 30px rgba(0,0,0,.28),inset 0 -6px 14px rgba(0,0,0,.18);transition:transform .25s,opacity .25s;overflow:hidden}'+
'.dna-orb:hover{transform:scale(1.06)}.dna-orb.hide{opacity:0;pointer-events:none;transform:scale(.6)}'+
'.dna-orb:before{content:"";position:absolute;inset:0;border-radius:50%;opacity:.22;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2780%27 height=%2780%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%271.2%27 numOctaves=%272%27/%3E%3C/filter%3E%3Crect width=%2780%27 height=%2780%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")}'+
'.dna-orb:after{content:"";position:absolute;top:9px;left:14px;width:22px;height:12px;border-radius:50%;background:rgba(255,255,255,.7);filter:blur(3px);transform:rotate(-20deg)}'+
'.dna-orb i{position:absolute;top:26px;width:7px;height:12px;border-radius:5px;background:#111;animation:dnaBlink 3.6s infinite;transform-origin:50% 50%}.dna-orb i.l{left:22px}.dna-orb i.r{right:22px;animation-delay:60ms}'+
'@keyframes dnaBlink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}'+
'@media(prefers-reduced-motion:reduce){.dna-orb i{animation:none}}'+
'.dna-orb-panel{position:fixed;z-index:61;right:20px;bottom:96px;width:min(360px,calc(100vw - 32px));max-height:min(560px,calc(100vh - 130px));display:flex;flex-direction:column;background:#111;color:#fff;border-radius:22px;box-shadow:0 30px 70px rgba(0,0,0,.4);direction:rtl;font-family:"Tel Aviv Modernist",Arial,sans-serif;overflow:hidden;opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .2s,transform .2s}'+
'.dna-orb-panel.open{opacity:1;transform:none;pointer-events:auto}'+
'.dna-orb-head{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.1)}.dna-orb-head b{font-family:"Tel Aviv Brutalist",Arial,sans-serif;font-size:18px}.dna-orb-head small{display:block;font-size:12px;color:rgba(255,255,255,.55);margin-top:2px}'+
'.dna-orb-x{background:none;border:0;color:#fff;font-size:22px;cursor:pointer;width:36px;height:36px}'+
'.dna-orb-log{flex:1;min-height:180px;overflow:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px}'+
'.dna-orb-m{max-width:88%;padding:10px 13px;border-radius:16px;font-size:14.5px;line-height:1.5}.dna-orb-m.bot{background:#1f1f1f;align-self:flex-start}.dna-orb-m.me{background:#dfff00;color:#111;align-self:flex-end}'+
'.dna-orb-chips{display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding:0 16px 12px;flex:none}.dna-orb-chips::-webkit-scrollbar{display:none}.dna-orb-chips button{font:inherit;font-size:13px;padding:7px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.25);background:transparent;color:#fff;cursor:pointer;white-space:nowrap;flex:none}.dna-orb-chips button:hover{border-color:#dfff00;color:#dfff00}'+
'.dna-orb-cta{display:flex;gap:8px;padding:0 16px 12px}.dna-orb-cta a{flex:1;text-align:center;padding:10px;border-radius:999px;font-size:14px;font-weight:700;text-decoration:none}.dna-orb-cta .wa{background:#dfff00;color:#111}.dna-orb-cta .fm{border:1px solid rgba(255,255,255,.3);color:#fff}'+
'.dna-orb-in{display:flex;gap:8px;padding:12px 16px;border-top:1px solid rgba(255,255,255,.1)}.dna-orb-in input{flex:1;min-width:0;font:inherit;font-size:16px;background:#1b1b1b;border:1px solid rgba(255,255,255,.15);border-radius:999px;color:#fff;padding:9px 14px}.dna-orb-in button{font:inherit;font-weight:700;border:0;border-radius:999px;background:#fff;color:#111;padding:0 14px;cursor:pointer}'+
'@media(max-width:540px){.dna-orb{right:14px;bottom:14px;width:56px;height:56px}.dna-orb i{top:22px;width:6px;height:11px}.dna-orb i.l{left:19px}.dna-orb i.r{right:19px}.dna-orb-panel{right:12px;left:12px;width:auto;bottom:82px}}';
var st=document.createElement('style');st.id='dna-orb-style';st.textContent=css;document.head.appendChild(st);
var orb=document.createElement('button');orb.className='dna-orb';orb.type='button';orb.setAttribute('aria-label','שאלות נפוצות על DNA STUDIO');orb.setAttribute('aria-expanded','false');orb.innerHTML='<i class="l"></i><i class="r"></i>';
var p=document.createElement('div');p.className='dna-orb-panel';p.setAttribute('role','dialog');p.setAttribute('aria-label','שאלות נפוצות');
p.innerHTML='<div class="dna-orb-head"><div><b>שאלות נפוצות</b><small>תשובות מתוך האתר · לשאר - דין בוואטסאפ</small></div><button class="dna-orb-x" type="button" aria-label="סגירה">×</button></div><div class="dna-orb-log" aria-live="polite"></div><div class="dna-orb-chips"></div><div class="dna-orb-cta"><a class="wa" target="_blank" rel="noopener" href="'+WA+'">וואטסאפ לדין</a><a class="fm" href="#contact">טופס יצירת קשר</a></div><form class="dna-orb-in"><input type="text" placeholder="מה תרצו לדעת?" aria-label="שאלה" maxlength="200"><button type="submit">שלח</button></form>';
document.body.appendChild(orb);document.body.appendChild(p);
var log=p.querySelector('.dna-orb-log'),chips=p.querySelector('.dna-orb-chips');
function say(t,who){var d=document.createElement('div');d.className='dna-orb-m '+who;d.textContent=t;log.appendChild(d);log.scrollTop=log.scrollHeight}
function renderChips(){chips.innerHTML='';KB.forEach(function(k){var b=document.createElement('button');b.type='button';b.textContent=k.chip;b.onclick=function(){ask(k.chip,k)};chips.appendChild(b)})}
function ask(q,k){say(q,'me');if(!k){for(var i=0;i<KB.length;i++){if(KB[i].re.test(q)){k=KB[i];break}}}
setTimeout(function(){if(k){say(k.a,'bot')}else{say('אין לי תשובה לזה מתוך האתר. הכי מהיר לשאול את דין ישירות - בוואטסאפ או בטופס.','bot')}},250)}
var started=0;function open(v){p.classList.toggle('open',v);orb.setAttribute('aria-expanded',v?'true':'false');if(v&&!started){started=1;build();renderChips();say('היי. אפשר לבחור שאלה או לכתוב. אני עונה רק ממה שכתוב באתר.','bot')}}
orb.onclick=function(){open(!p.classList.contains('open'))};p.querySelector('.dna-orb-x').onclick=function(){open(false)};
p.querySelector('.fm').addEventListener('click',function(){open(false)});
p.querySelector('form').onsubmit=function(e){e.preventDefault();var i=this.querySelector('input');var q=i.value.trim();if(!q)return;i.value='';ask(q)};
document.addEventListener('keydown',function(e){if(e.key==='Escape')open(false)});
if('IntersectionObserver' in window){var seen=new Set();var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)seen.add(e.target);else seen.delete(e.target)});var vis=seen.size>0;orb.classList.toggle('hide',vis);if(vis)open(false)},{threshold:0,rootMargin:'0px 0px -40px 0px'});
var tg=[document.getElementById('contact'),document.getElementById('lead-form')];document.querySelectorAll('a[href*="wa.me"]').forEach(function(a){if(!p.contains(a))tg.push(a)});tg.forEach(function(t){if(t)io.observe(t)})}
})();
