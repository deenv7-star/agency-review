/* DV portfolio · journey */
(function(){
  'use strict';
  var d=document.documentElement;
  var hasG=typeof gsap!=='undefined'&&typeof ScrollTrigger!=='undefined';
  var still=!d.classList.contains('motion')||!hasG;
  window.__ready=true;
  if(hasG){gsap.registerPlugin(ScrollTrigger); if(window.__REC) gsap.globalTimeline.timeScale(window.__REC);}

  /* smooth scroll (desktop only, never while recording) */
  var lenis=null;
  if(!still&&!window.__REC&&typeof Lenis!=='undefined'&&matchMedia('(pointer:fine)').matches){
    lenis=new Lenis({duration:1.05,easing:function(t){return 1-Math.pow(1-t,3)},smoothWheel:true});
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(function(t){lenis.raf(t*1000)}); gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){
      var t=document.querySelector(a.getAttribute('href')); if(!t)return; e.preventDefault(); lenis.scrollTo(t,{offset:-80});})});
  }

  /* top bar */
  var top=document.getElementById('topBar');
  var darks=[].slice.call(document.querySelectorAll('[data-dark]'));
  function onTop(){top.classList.toggle('is-scrolled',scrollY>40);
    var dk=false; for(var i=0;i<darks.length;i++){var r=darks[i].getBoundingClientRect(); if(r.top<36&&r.bottom>36){dk=true;break}}
    top.classList.toggle('is-dark',dk);}
  addEventListener('scroll',onTop,{passive:true}); onTop(); if(hasG) ScrollTrigger.addEventListener('refresh',onTop);

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
  if(still){pills.forEach(function(p){p.classList.add('is-on')}); d.classList.add('still'); document.querySelectorAll('.lr').forEach(function(l){l.style.opacity=1});}

  /* ---------- motion ---------- */
  if(!still){
    var E='power3.out';
    /* hero intro */
    var tl=gsap.timeline({delay:.15});
    tl.to('.hero__title .ln__in',{y:0,duration:1.1,ease:'expo.out',stagger:.1})
      .add(function(){document.querySelectorAll('.hero [data-pill]').forEach(function(p,i){setTimeout(function(){p.classList.add('is-on')},i*180)})},'-=.6')
      .to('.hero [data-intro]',{opacity:1,y:0,duration:.8,ease:E,stagger:.08},'-=.7')
      .fromTo('.fan__in',{opacity:0,yPercent:30},{opacity:1,yPercent:0,duration:1.3,ease:'expo.out',stagger:.09},'-=.7');
    /* gentle float */
    gsap.utils.toArray('.fan__in').forEach(function(el,i){
      gsap.to(el,{y:i===2?-7:-10,duration:3.2+i*.5,ease:'sine.inOut',yoyo:true,repeat:-1,delay:1.6+i*.3});
    });
    /* the arc opens as you leave the hero */
    gsap.to(FP,{p:1,ease:'none',onUpdate:fanPose,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.6}});

    /* generic reveals */
    gsap.utils.toArray('[data-up]').forEach(function(el){
      gsap.to(el,{opacity:1,y:0,duration:.9,ease:E,scrollTrigger:{trigger:el,start:'top 88%',once:true}});
    });
    ScrollTrigger.batch('[data-card]',{start:'top 90%',once:true,onEnter:function(b){gsap.to(b,{opacity:1,y:0,duration:.95,ease:E,stagger:.09,overwrite:true})}});
    pills.forEach(function(p){
      if(p.closest('.hero')) return;
      ScrollTrigger.create({trigger:p,start:'top 80%',once:true,onEnter:function(){p.classList.add('is-on')}});
    });

    /* letter: line by line, scrubbed */
    var lb=document.getElementById('letterBand'), lrs=gsap.utils.toArray('.lr'), lpills=[].slice.call(lb.querySelectorAll('[data-pill]'));
    var ltl=gsap.timeline({scrollTrigger:{trigger:lb,start:'top 12px',end:'+='+Math.round(innerHeight*(innerWidth<900?.9:1.1)),pin:true,pinSpacing:true,scrub:.5,anticipatePin:1,
      onUpdate:function(self){lpills.forEach(function(p,i){p.classList.toggle('is-on',self.progress>(i+.55)/lrs.length*.82)})}}});
    lrs.forEach(function(l,i){ltl.to(l,{opacity:1,ease:'none',duration:1},i*.9)});
    ltl.fromTo(lb.querySelector('.band__img'),{scale:1.12,yPercent:-3},{scale:1,yPercent:3,ease:'none',duration:lrs.length*.9+1},0);
    gsap.fromTo(lb,{clipPath:'inset(6% 3% 0% 3% round 28px)'},{clipPath:'inset(0% 0% 0% 0% round 28px)',ease:'none',scrollTrigger:{trigger:lb,start:'top bottom',end:'top 12px',scrub:true}});

    /* trio: sky card drifts, cards lift in */
    gsap.fromTo('.tcard__bg',{yPercent:-6,scale:1.08},{yPercent:6,scale:1,ease:'none',scrollTrigger:{trigger:'.trio',start:'top bottom',end:'bottom top',scrub:true}});
    gsap.utils.toArray('.tcard__n').forEach(function(n,i){
      gsap.fromTo(n,{yPercent:40,opacity:0},{yPercent:0,opacity:1,duration:1.1,ease:'expo.out',delay:i*.09,scrollTrigger:{trigger:'.trio__grid',start:'top 80%',once:true}});
    });

    /* works: band rises, screenshots zoom out + drift inside cards */
    gsap.utils.toArray('[data-zoom]').forEach(function(img){
      gsap.fromTo(img,{scale:1.14,yPercent:0},{scale:1,yPercent:-9,ease:'none',scrollTrigger:{trigger:img.parentNode,start:'top bottom',end:'bottom top',scrub:true}});
    });
    gsap.utils.toArray('.wcard').forEach(function(c){
      gsap.fromTo(c,{scale:.96},{scale:1,ease:'none',scrollTrigger:{trigger:c,start:'top bottom',end:'top 55%',scrub:true}});
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

    /* screenshots drift inside their cards */
    gsap.utils.toArray('[data-par]').forEach(function(img){
      gsap.fromTo(img,{yPercent:0},{yPercent:-6,ease:'none',scrollTrigger:{trigger:img.parentNode,start:'top bottom',end:'bottom top',scrub:true}});
    });
    /* gallery: alternating drift */
    gsap.utils.toArray('[data-g]').forEach(function(g,i){
      gsap.fromTo(g,{y:i%2?60:20,opacity:.0},{opacity:1,duration:1,ease:E,scrollTrigger:{trigger:g,start:'top 92%',once:true}});
      gsap.to(g.querySelector('img'),{yPercent:i%2?-4:-8,ease:'none',scrollTrigger:{trigger:g,start:'top bottom',end:'bottom top',scrub:true}});
      gsap.to(g,{y:0,ease:'none',scrollTrigger:{trigger:g,start:'top bottom',end:'top 40%',scrub:true}});
    });

    /* closing title + ticket */
    gsap.to('.contact__title .ln__in',{y:0,duration:1.1,ease:'expo.out',stagger:.1,scrollTrigger:{trigger:'.contact__title',start:'top 85%',once:true}});
    gsap.fromTo('.ticket__stub',{x:-40,opacity:0},{x:0,opacity:1,duration:1,ease:E,scrollTrigger:{trigger:'#ticket',start:'top 85%',once:true}});
    gsap.fromTo('.ticket__main',{x:40,opacity:0},{x:0,opacity:1,duration:1,ease:E,scrollTrigger:{trigger:'#ticket',start:'top 85%',once:true,
      onEnter:function(){gsap.delayedCall(.6,function(){document.getElementById('ticket').classList.add('lit')})}}});
  }

  /* ---------- journey line ---------- */
  var main=document.getElementById('top'), svg=document.getElementById('jsvg');
  var dkG=svg.querySelector('.dk'), trackD=svg.querySelector('.track-d'), clip=svg.querySelector('#dkclip'), darkEls=[].slice.call(main.querySelectorAll('.work [data-dark], .faq [data-dark]')), DR=[];
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
    measure(); if(still) st.cur=target; paint();
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
    if(still){target=L;return}
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
  function onScroll(){
    measure();
    if(still||!hasG){st.cur=target;paint();return}
    if(tw) tw.kill();
    tw=gsap.to(st,{cur:target,duration:.55,ease:'power2.out',onUpdate:paint});
  }
  var bt; function rebuild(){clearTimeout(bt);bt=setTimeout(function(){build();st.cur=target;paint();if(hasG)ScrollTrigger.refresh()},120)}
  function jRebuild(){build(); st.cur=target; paint();}
  function maybe(){ if(main.clientWidth!==lastW||main.scrollHeight!==lastH) rebuild(); else onScroll(); }
  build(); st.cur=target; paint();
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',maybe);
  addEventListener('load',rebuild);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(rebuild);
  if('ResizeObserver' in window) new ResizeObserver(maybe).observe(main);
})();
