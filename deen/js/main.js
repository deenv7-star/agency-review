/* DV portfolio · journey */
(function(){
  'use strict';
  var d=document.documentElement;
  var hasG=typeof gsap!=='undefined'&&typeof ScrollTrigger!=='undefined';
  var still=!d.classList.contains('motion')||!hasG;
  /* phones/touch: no scroll-driven drawing or scrubs, so the browser scrolls natively */
  var lite=matchMedia('(max-width:899px),(pointer:coarse)').matches;
  window.__ready=true;
  if(hasG){gsap.registerPlugin(ScrollTrigger); if(window.__REC) gsap.globalTimeline.timeScale(window.__REC);}

  /* top bar */
  var top=document.getElementById('topBar');
  var darks=[].slice.call(document.querySelectorAll('[data-dark]'));
  var DK=[], tS=null, tD=null;
  function cacheDark(){DK=darks.map(function(el){var r=el.getBoundingClientRect();return [r.top+scrollY,r.bottom+scrollY]})}
  function onTop(){var y=scrollY, sc=y>40; if(sc!==tS){tS=sc;top.classList.toggle('is-scrolled',sc)}
    var dk=false, yy=y+36; for(var i=0;i<DK.length;i++){if(DK[i][0]<yy&&DK[i][1]>yy){dk=true;break}}
    if(dk!==tD){tD=dk;top.classList.toggle('is-dark',dk)}}
  cacheDark(); onTop(); if(hasG) ScrollTrigger.addEventListener('refresh',function(){cacheDark();onTop()});

  /* accordion */
  document.querySelectorAll('.acc__q').forEach(function(q){
    q.addEventListener('click',function(){
      var open=q.getAttribute('aria-expanded')==='true', a=document.getElementById(q.getAttribute('aria-controls'));
      q.setAttribute('aria-expanded',String(!open));
      if(hasG&&!still){gsap.to(a,{height:open?0:'auto',duration:.42,ease:'power3.out',onComplete:jRebuild});}
      else{a.style.height=open?'0':'auto'; jRebuild();}
    });
  });

  /* fan: screenshots on a gentle concave 3D arc */
  var FP={p:0};
  var fanCards=[].slice.call(document.querySelectorAll('.fan__card'));
  function fanPose(){
    var p=FP.p, mob=innerWidth<900;
    fanCards.forEach(function(c){
      var i=+c.getAttribute('data-i'), a=Math.abs(i);
      var x=i*((mob?74:104)+p*(mob?4:30)), z=-a*(mob?60:120)+p*60*(1-a), y=a*(mob?10:18)-p*(a?24:22);
      var ry=-i*((mob?16:30)+p*(mob?4:8)), rz=i*(1+p*1.5);
      c.style.transform='translate3d(calc(-50% + '+x+'%),'+y.toFixed(1)+'px,'+z.toFixed(1)+'px) rotateY('+ry.toFixed(2)+'deg) rotateZ('+rz.toFixed(2)+'deg)';
    });
  }
  fanPose(); addEventListener('resize',function(){fanPose()});

  var pills=[].slice.call(document.querySelectorAll('[data-pill]'));
  if(still){pills.forEach(function(p){p.classList.add('is-on')}); d.classList.add('still'); }

  /* ---------- motion ---------- */
  if(!still){
    var E='power3.out';
    /* hero intro */
    var tl=gsap.timeline();
    tl.to('.hero__title .ln__in',{y:0,duration:.75,ease:'expo.out',stagger:.07})
      .add(function(){document.querySelectorAll('.hero [data-pill]').forEach(function(p,i){setTimeout(function(){p.classList.add('is-on')},i*180)})},'-=.6')
      .to('.hero [data-intro]',{opacity:1,y:0,duration:.6,ease:E,stagger:.06},'-=.55')
      .fromTo('.fan__in',{opacity:0,yPercent:30},{opacity:1,yPercent:0,duration:.9,ease:'expo.out',stagger:.07},'-=.6');
    /* the arc opens as you leave the hero */
    if(!lite) gsap.to(FP,{p:1,ease:'none',onUpdate:fanPose,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.6}});

    /* generic reveals */
    gsap.utils.toArray('[data-up]').forEach(function(el){
      gsap.to(el,{opacity:1,y:0,duration:.9,ease:E,scrollTrigger:{trigger:el,start:'top 88%',once:true}});
    });
    ScrollTrigger.batch('[data-card]',{start:'top 90%',once:true,onEnter:function(b){gsap.to(b,{opacity:1,y:0,duration:.95,ease:E,stagger:.09,overwrite:true})}});
    pills.forEach(function(p){
      if(p.closest('.hero')) return;
      ScrollTrigger.create({trigger:p,start:'top 80%',once:true,onEnter:function(){p.classList.add('is-on')}});
    });

    /* works: band rises, screenshots zoom out + drift inside cards */
    if(!lite) gsap.utils.toArray('[data-zoom]').forEach(function(img){
      gsap.fromTo(img,{yPercent:0},{yPercent:-9,ease:'none',scrollTrigger:{trigger:img.parentNode,start:'top bottom',end:'bottom top',scrub:true}});
    });

    /* process: the step crossing the middle lights */
    var stepEls=gsap.utils.toArray('[data-step]');
    ScrollTrigger.create({trigger:'#steps',start:'top 72%',end:'bottom 45%',onUpdate:function(self){
      var k=Math.min(stepEls.length-1,Math.floor(self.progress*stepEls.length)); stepEls.forEach(function(s,i){s.classList.toggle('is-on',i===k&&self.isActive)})},
      onLeave:function(){stepEls.forEach(function(s,i){s.classList.toggle('is-on',i===stepEls.length-1)})},
      onLeaveBack:function(){stepEls.forEach(function(s){s.classList.remove('is-on')})}});
    gsap.utils.toArray('[data-step]').forEach(function(s,i){
      gsap.fromTo(s,{opacity:0,x:innerWidth<900?0:-30,y:24},{opacity:1,x:0,y:0,duration:.9,ease:E,scrollTrigger:{trigger:s,start:'top 90%',once:true}});
    });

    /* closing title */
    gsap.to('.contact__title .ln__in',{y:0,duration:1.1,ease:'expo.out',stagger:.1,scrollTrigger:{trigger:'.contact__title',start:'top 85%',once:true}});
  }

  /* ---------- journey line ---------- */
  var main=document.getElementById('top'), svg=document.getElementById('jsvg');
  var dkG=svg.querySelector('.dk'), trackD=svg.querySelector('.track-d'), clip=svg.querySelector('#dkclip'), darkEls=[].slice.call(main.querySelectorAll('[data-dark]')), DR=[];
  var track=svg.querySelector('.track'), tip=svg.querySelector('.tip'), halo=svg.querySelector('.tip-halo'), grad=svg.querySelector('#jg');
  var NS='http://www.w3.org/2000/svg';
  var stations=[].slice.call(main.querySelectorAll('[data-station]'));
  var S=[], stL=[], segs=[], L=0, st={cur:0}, target=0, lastW=-1, lastH=-1, tw=null;
  function f(n){return n.toFixed(1)}
  function cubic(p,acc){
    var n=Math.max(8,Math.ceil((Math.hypot(p[1][0]-p[0][0],p[1][1]-p[0][1])+Math.hypot(p[2][0]-p[1][0],p[2][1]-p[1][1])+Math.hypot(p[3][0]-p[2][0],p[3][1]-p[2][1]))/4));
    var px=p[0][0],py=p[0][1];
    for(var k=1;k<=n;k++){var t=k/n,u=1-t,a=u*u*u,b=3*u*u*t,c=3*u*t*t,e=t*t*t;
      var x=a*p[0][0]+b*p[1][0]+c*p[2][0]+e*p[3][0], y=a*p[0][1]+b*p[1][1]+c*p[2][1]+e*p[3][1];
      acc+=Math.hypot(x-px,y-py); S.push([acc,x,y]); px=x; py=y;}
    return acc;
  }
  function mk(cls,dd){var e=document.createElementNS(NS,'path');e.setAttribute('class',cls);e.setAttribute('d',dd);if(cls==='glow'){e.setAttribute('class','lit-d');dkG.appendChild(e);}else svg.insertBefore(e,dkG);return e}
  function build(){
    var mr=main.getBoundingClientRect(), W=main.clientWidth, H=main.scrollHeight, desk=W>=900;
    lastW=W; lastH=H;
    svg.setAttribute('width',W); svg.setAttribute('height',H); svg.setAttribute('viewBox','0 0 '+W+' '+H);
    grad.setAttribute('y2',H);
    var m=desk?Math.max(30,(W-1180)/2-34):9, R0=desk?120:48;
    var P=stations.map(function(s){var r=s.getBoundingClientRect();return {x:r.left+r.width/2-mr.left,y:r.top+r.height/2-mr.top}});
    segs.forEach(function(s){s.g.parentNode.removeChild(s.g);s.l.parentNode.removeChild(s.l)});
    while(clip.firstChild) clip.removeChild(clip.firstChild); DR=[];
    darkEls.forEach(function(el){var r=el.getBoundingClientRect(),x=r.left-mr.left,y=r.top-mr.top; DR.push([x,y,x+r.width,y+r.height]);
      var c=document.createElementNS(NS,'rect'); c.setAttribute('x',x);c.setAttribute('y',y);c.setAttribute('width',r.width);c.setAttribute('height',r.height);c.setAttribute('rx',24); clip.appendChild(c);});
    segs=[]; S=[[0,P[0].x,P[0].y]]; stL=[0];
    var all='M'+f(P[0].x)+' '+f(P[0].y), side=0, acc=0;
    for(var i=0;i<P.length-1;i++){
      var A=P[i],B=P[i+1];
      if(B.y-A.y<(desk?320:200)){ /* close stations: straight drop */
        var body0=' L'+f(B.x)+' '+f(B.y), st0=acc; all+=body0; acc+=Math.hypot(B.x-A.x,B.y-A.y); S.push([acc,B.x,B.y]);
        var d0='M'+f(A.x)+' '+f(A.y)+body0, g0=mk('glow',d0), l0=mk('lit',d0), b0=Math.max(1,l0.getTotalLength());
        g0.style.strokeDasharray=l0.style.strokeDasharray=b0+' '+(b0+10);
        segs.push({g:g0,l:l0,start:st0,len:Math.max(1,acc-st0),bl:b0,last:-1}); stL.push(acc); continue;
      }
      var xs=side?m:W-m; side=1-side;
      var R=Math.max(10,Math.min(R0,(B.y-A.y)/2-6));
      var c1=[[A.x,A.y],[A.x+(xs-A.x)*.55,A.y],[xs,A.y+R*.45],[xs,A.y+R]];
      var c2=[[xs,B.y-R],[xs,B.y-R*.45],[B.x+(xs-B.x)*.55,B.y],[B.x,B.y]];
      var body=' C'+f(c1[1][0])+' '+f(c1[1][1])+' '+f(c1[2][0])+' '+f(c1[2][1])+' '+f(c1[3][0])+' '+f(c1[3][1])
        +' L'+f(xs)+' '+f(B.y-R)
        +' C'+f(c2[1][0])+' '+f(c2[1][1])+' '+f(c2[2][0])+' '+f(c2[2][1])+' '+f(c2[3][0])+' '+f(c2[3][1]);
      all+=body; var start=acc;
      acc=cubic(c1,acc); acc+=Math.abs((B.y-R)-(A.y+R)); S.push([acc,xs,B.y-R]); acc=cubic(c2,acc);
      var dd='M'+f(A.x)+' '+f(A.y)+body, g=mk('glow',dd), l=mk('lit',dd), bl=l.getTotalLength();
      g.style.strokeDasharray=l.style.strokeDasharray=bl+' '+(bl+10);
      segs.push({g:g,l:l,start:start,len:Math.max(1,acc-start),bl:bl,last:-1});
      stL.push(acc);
    }
    track.setAttribute('d',all); trackD.setAttribute('d',all); L=acc;
    measure(); if(still||lite) st.cur=target; paint();
  }
  function lenAtY(y){
    if(!S.length) return 0; if(y<=S[0][2]) return 0; if(y>=S[S.length-1][2]) return L;
    var lo=0,hi=S.length-1; while(hi-lo>1){var mid=(lo+hi)>>1; if(S[mid][2]<y) lo=mid; else hi=mid;}
    var a=S[lo],b=S[hi],t=(b[2]-a[2])?(y-a[2])/(b[2]-a[2]):0; return a[0]+(b[0]-a[0])*t;
  }
  function ptAt(len){
    if(!S.length) return [-50,-50]; var lo=0,hi=S.length-1;
    if(len<=0) return [S[0][1],S[0][2]]; if(len>=S[hi][0]) return [S[hi][1],S[hi][2]];
    while(hi-lo>1){var mid=(lo+hi)>>1; if(S[mid][0]<len) lo=mid; else hi=mid;}
    var a=S[lo],b=S[hi],t=(b[0]-a[0])?(len-a[0])/(b[0]-a[0]):0; return [a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  }
  function measure(){
    if(still||lite){target=L;return}
    var tp=main.getBoundingClientRect().top;
    target=Math.max(0,lenAtY(-tp+innerHeight*.6));
    var maxY=main.scrollHeight-innerHeight; if(scrollY>=maxY-4) target=L;
  }
  function paint(){
    var cur=st.cur;
    for(var i=0;i<segs.length;i++){var s=segs[i], fr=(cur-s.start)/s.len, off=fr<=0?s.bl+5:fr>=1?0:s.bl*(1-fr);
      if(Math.abs(off-s.last)>.05){s.last=off; s.l.style.strokeDashoffset=off; s.g.style.strokeDashoffset=off;}}
    var p=ptAt(cur), done=cur>=L-1||cur<=1;
    tip.setAttribute('cx',p[0]); tip.setAttribute('cy',p[1]); halo.setAttribute('cx',p[0]); halo.setAttribute('cy',p[1]);
    tip.style.opacity=halo.style.opacity=done?0:'';
    var inD=false; for(var q=0;q<DR.length;q++){if(p[0]>DR[q][0]&&p[0]<DR[q][2]&&p[1]>DR[q][1]&&p[1]<DR[q][3]){inD=true;break}} tip.classList.toggle('on-dark',inD);
    var act=-1;
    for(var j=0;j<stations.length;j++){var on=j===0||cur>=stL[j]-3; stations[j].classList.toggle('on',on); if(on) act=j;}
    for(var k=0;k<stations.length;k++) stations[k].classList.toggle('is-active',k===act);
  }
  var raf=0, ticking=false;
  function loop(){raf=0; var dlt=target-st.cur;
    if(Math.abs(dlt)<.5){st.cur=target;paint();ticking=false;return}
    st.cur+=dlt*.2; paint(); raf=requestAnimationFrame(loop);}
  function onScroll(){
    onTop();
    if(lite) return;
    measure();
    if(still){st.cur=target;paint();return}
    if(!raf) raf=requestAnimationFrame(loop);
  }
  var bt; function rebuild(){clearTimeout(bt);bt=setTimeout(function(){build();cacheDark();st.cur=target;paint();if(hasG)ScrollTrigger.refresh()},120)}
  function jRebuild(){build();cacheDark(); st.cur=target; paint();}
  function maybe(){ if(main.clientWidth!==lastW||main.scrollHeight!==lastH) rebuild(); else onScroll(); }
  build(); st.cur=target; paint();
  var topRaf=0; addEventListener('scroll',function(){ if(lite){ if(!topRaf) topRaf=requestAnimationFrame(function(){topRaf=0;onTop()}); return;} onScroll(); },{passive:true});
  addEventListener('resize',maybe);
  addEventListener('load',rebuild);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(rebuild);
  if('ResizeObserver' in window) new ResizeObserver(maybe).observe(main);
})();

/* ---------- site check ("בדיקה לאתר") ----------
   ANALYZE_URL: the deployed Supabase Edge Function (backend/analyze/index.ts). Empty = self-check fallback.
   Request:  POST ANALYZE_URL  body {"url":"https://example.co.il"}  (Content-Type: application/json)
   Response: {
     ok: boolean,
     site_title: string,                    // the <title> of their site, may be ""
     findings: [{ title: string,            // where customers may leave, plain Hebrew
                  why: string,              // why it costs them customers, tied to a real signal
                  fix: string }],           // what Deen would do instead
     summary: string                        // one or two plain sentences
   }
   ok:false (or a network error / timeout) also falls back to the self-check. */
(function(){
  'use strict';
  var ANALYZE_URL='https://sqxvjsadnqnnoyfialtg.supabase.co/functions/v1/dna-site-check';
  var WA='https://wa.me/972525979520?text=';
  var form=document.getElementById('checkForm'); if(!form) return;
  var input=document.getElementById('siteUrl'), err=document.getElementById('siteErr');
  var load=document.getElementById('toolLoad'), res=document.getElementById('toolRes'), self=document.getElementById('toolSelf');
  var ticks=[].slice.call(load.querySelectorAll('.ticks li')), timers=[], site='';
  var answers=[null,null,null];

  function norm(v){
    v=(v||'').trim().replace(/\s+/g,''); if(!v) return '';
    if(!/^https?:\/\//i.test(v)) v='https://'+v;
    try{var u=new URL(v); if(!/^https?:$/.test(u.protocol)) return ''; if(!/\.[a-z\u05d0-\u05ea]{2,}$/i.test(u.hostname)) return ''; return u.href;}catch(e){return ''}
  }
  function show(el){[form,load,res,self].forEach(function(x){x.hidden=x!==el}); }
  function setSite(){document.querySelectorAll('#tool [data-site]').forEach(function(s){s.textContent=site.replace(/^https?:\/\//,'').replace(/\/$/,'')})}
  function wa(text){return WA+encodeURIComponent(text)}
  function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function clearT(){timers.forEach(clearTimeout); timers=[]}

  function startSelf(note){
    answers=[null,null,null];
    self.querySelectorAll('.yn__b').forEach(function(b){b.setAttribute('aria-pressed','false')});
    var r=document.getElementById('selfRes'); r.hidden=true; r.className='self__res';
    document.getElementById('selfIntro').textContent=note||'פתחו את האתר שלכם בטלפון, וענו בכנות.';
    document.getElementById('selfWa').href=wa('היי דין, עשיתי את הבדיקה באתר שלך. זה האתר שלי: '+site);
    show(self); var f=self.querySelector('.yn__b'); if(f) f.focus({preventScroll:true});
  }
  function selfResult(){
    var r=document.getElementById('selfRes'), done=answers.every(function(a){return a!==null});
    if(!done) return;
    var no=answers.filter(function(a){return a===0}).length, i;
    r.hidden=false;
    if(!no){r.className='self__res';r.innerHTML='<strong>יפה, האתר עבר את 3 השאלות.</strong>אם בכל זאת לא מגיעות ממנו מספיק פניות, שלחו לי אותו ואגיד לכם מה הייתי משנה.';
      document.getElementById('selfWa').firstElementChild.textContent='שלחו לי את האתר בוואטסאפ';
      document.getElementById('selfWa').href=wa('היי דין, עשיתי את הבדיקה באתר שלך ויצא לי "כן" בכל השאלות. זה האתר שלי: '+site);}
    else{var qs=[];for(i=0;i<3;i++) if(answers[i]===0) qs.push(i+1);
      r.className='self__res is-bad';r.innerHTML='<strong>כאן לקוחות הולכים לאיבוד.</strong>כשאני בונה אתר חדש, את זה אני פותר מההתחלה.';
      document.getElementById('selfWa').firstElementChild.textContent='שלחו לי את האתר בוואטסאפ';
      document.getElementById('selfWa').href=wa('היי דין, עשיתי את הבדיקה באתר שלך ויצא לי "לא" בשאלה '+qs.join(', ')+'. זה האתר שלי: '+site);}
  }
  self.addEventListener('click',function(e){
    var b=e.target.closest('.yn__b'); if(!b) return;
    var q=+b.closest('.q').getAttribute('data-q');
    answers[q]=+b.getAttribute('data-a');
    b.parentNode.querySelectorAll('.yn__b').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});
    selfResult();
  });

  function renderResult(data){
    var f=(data.findings||[]).slice(0,5);
    if(!f.length){ startSelf('לא מצאנו בעיות ברורות. 3 שאלות קצרות יבדקו את מה שרק אתם רואים.'); return; }
    var head=document.getElementById('resHead');
    head.textContent=f.length===1?'מצאנו מקום אחד שבו לקוחות עלולים לוותר עליכם':'מצאנו '+f.length+' מקומות שבהם לקוחות עלולים לוותר עליכם';
    document.getElementById('resSum').textContent=data.summary||'';
    document.getElementById('finds').innerHTML=f.map(function(x){return '<li><h4>'+esc(x.title)+'</h4><p>'+esc(x.why)+'</p><p class="fix"><b>מה הייתי עושה:</b> '+esc(x.fix)+'</p></li>'}).join('');
    document.getElementById('resWa').href=wa('היי דין, עשיתי את הבדיקה באתר שלך ויצאו '+f.length+' ממצאים. זה האתר שלי: '+site);
    show(res); res.focus({preventScroll:true});
  }
  function runTicks(){
    ticks.forEach(function(t){t.className=''});
    ticks.forEach(function(t,i){timers.push(setTimeout(function(){ if(i) ticks[i-1].className='is-done'; t.className='is-now'; },i*1400))});
  }
  function analyze(){
    show(load); runTicks();
    var t0=Date.now(), ctl='AbortController' in window?new AbortController():null;
    var to=setTimeout(function(){ if(ctl) ctl.abort(); },20000);
    fetch(ANALYZE_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:site}),signal:ctl?ctl.signal:undefined})
      .then(function(r){return r.json()})
      .then(function(data){
        clearTimeout(to);
        var wait=Math.max(0,ticks.length*1400-(Date.now()-t0)); /* let the honest steps finish */
        timers.push(setTimeout(function(){clearT(); if(data&&data.ok) renderResult(data); else startSelf('לא הצלחנו לפתוח את האתר מכאן. אפשר לענות על 3 שאלות קצרות במקום.');},Math.min(wait,2500)));
      })
      .catch(function(){clearTimeout(to); clearT(); startSelf('הבדיקה לא הצליחה הפעם. אפשר לענות על 3 שאלות קצרות במקום.');});
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    site=norm(input.value);
    if(!site){err.textContent='נראה שהכתובת לא שלמה. נסו למשל: www.your-business.co.il';err.hidden=false;input.setAttribute('aria-invalid','true');input.focus();return;}
    err.hidden=true; input.removeAttribute('aria-invalid'); setSite();
    if(ANALYZE_URL) analyze(); else startSelf();
  });
  input.addEventListener('input',function(){ if(!err.hidden){err.hidden=true;input.removeAttribute('aria-invalid')} });
  document.querySelectorAll('#tool [data-again]').forEach(function(b){b.addEventListener('click',function(){clearT(); show(form); input.select(); input.focus({preventScroll:true});})});
})();

/* ---------- floating whatsapp on mobile: after the hero, hidden over the closing band ---------- */
(function(){
  var fab=document.getElementById('fab'), hero=document.getElementById('hero'), close=document.getElementById('contact');
  if(!fab||!hero||!('IntersectionObserver' in window)) return;
  var pastHero=false, atClose=false, hide=new Set();
  function set(){fab.classList.toggle('is-on',pastHero&&!hide.size);document.documentElement.classList.toggle('past-hero',pastHero)}
  new IntersectionObserver(function(e){pastHero=!e[0].isIntersecting&&e[0].boundingClientRect.top<0;set()},{rootMargin:'0px 0px -40% 0px'}).observe(hero.querySelector('.frame'));
  /* never cover the tool's own WhatsApp button or the closing button */
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting) hide.add(e.target); else hide.delete(e.target)}); set()},{threshold:0});
  [close,document.getElementById('tool')].forEach(function(el){if(el) io.observe(el)});
})();



/* ---------- mobile polish: header slides away while reading down; floats step aside for any CTA near the bottom ---------- */
(function(){
  var mq=matchMedia('(max-width:900px)'), top=document.getElementById('topBar');
  var fab=document.getElementById('fab'), pill=document.getElementById('iraPill');
  if(top){
    var lastY=scrollY, ticking=false;
    function hdr(){ticking=false; var y=scrollY, dy=y-lastY;
      if(!mq.matches||y<120||document.documentElement.classList.contains('ira-lock')){top.classList.remove('is-hidden');lastY=y;return}
      if(dy>8){top.classList.add('is-hidden');lastY=y}else if(dy<-8){top.classList.remove('is-hidden');lastY=y}}
    addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(hdr)}},{passive:true});
    /* jumping to a section from a link: keep the bar out of the way */
    document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(a&&mq.matches&&a.getAttribute('href').length>1){setTimeout(function(){top.classList.add('is-hidden');lastY=scrollY},40)}});
  }
  if(!(fab||pill)||!('IntersectionObserver' in window)) return;
  var near=new Set(), io=null;
  function tuck(){var t=near.size>0&&mq.matches; if(fab) fab.classList.toggle('is-tuck',t); if(pill) pill.classList.toggle('is-tuck',t)}
  function watch(){
    if(io) io.disconnect(); near.clear();
    var band=Math.max(0,innerHeight-96);
    io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting) near.add(e.target); else near.delete(e.target)}); tuck()},{rootMargin:(-band)+'px 0px 0px 0px',threshold:0});
    document.querySelectorAll('main .btn, .acc, .bb__ctrl, .wcard__foot, a.wcard__go, .hero__link, .check form, .acc__item:last-child, .alts, .foot').forEach(function(el){io.observe(el)});
  }
  watch(); var rt; addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(watch,200)});
})();
