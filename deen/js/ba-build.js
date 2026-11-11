/* ---------- before / after: "the site builds itself" (atlas case) ----------
   Plays once when the frame comes into view (time-based, never scroll-scrubbed).
   1 old page · 2 it comes apart under a scan line · 3 blueprint draws itself ·
   4 real crops of the new page land in their boxes · 5 the live page, light sweep.
   Only real screenshot pixels: strips of the "before" shot, crops of the "after" shot.
   Reduced motion / no GSAP: the finished page + the לפני/אחרי toggle. */
(function(){
  'use strict';
  var root=document.getElementById('bb'); if(!root) return;
  var stage=root.querySelector('.bb__stage'), stepEl=root.querySelector('.bb__step'),
      finA=root.querySelector('.bb__final--after'), finB=root.querySelector('.bb__final--before'),
      tagB=root.querySelector('.ba__tag--before'), tagA=root.querySelector('.ba__tag--after'),
      replay=document.getElementById('bbReplay'), seg=[].slice.call(document.querySelectorAll('[data-bb-show]'));
  var REC=window.__BB_REC||null, BASE=(REC&&REC.base)||'';
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches && !REC;
  var mq=matchMedia('(max-width:899px)');

  /* piece boxes in % of the stage [left, top, width, height] + source size, from qa/build/assets.py */
  var SPEC={
    d:{W:1440,H:900,sw:1.6,strips:10,
      p:{nav:[6.944,1.111,86.111,6.667],c1:[9.722,64.778,25,7.333],c2:[7.778,73.222,25,7.333],c3:[9.722,81.667,25,7.333],
         h1a:[55.278,42.444,35.556,11.556],h1b:[55.278,54.222,35.556,11.778],sub:[66.528,68.667,24.167,6.444],
         cta:[73.889,78.222,16.389,6.444],link:[65.694,79.778,6.944,3.556],fine:[72.917,85.778,17.778,2.889]},
      /* wireframe boxes in source px: x0,y0,x1,y1,radius, label */
      w:[[100,10,1340,70,30,'תפריט','in'],[796,382,1308,594,8,'כותרת'],[958,618,1306,676,6,'טקסט'],[1064,704,1300,762,29,'כפתור'],
         [140,583,500,649,20,'הודעות'],[112,659,472,725,20],[140,735,500,801,20]],
      photo:[36,16]},
    m:{W:780,H:1464,sw:2.4,strips:11,
      p:{nav:[6.154,1.366,87.692,8.197],c1:[6.154,11.749,87.692,9.016],c2:[6.154,21.858,87.692,9.016],c3:[6.154,31.967,87.692,9.016],
         h1a:[37.179,62.5,57.692,6.694],h1b:[37.179,69.194,57.692,6.694],sub:[7.179,78.689,87.692,7.514],
         cta:[33.333,89.822,60.513,7.855]},
      w:[[48,20,732,140,60,'תפריט','in'],[48,172,732,304,44,'הודעות','in'],[48,320,732,452,44],[48,468,732,600,44],
         [290,915,740,1111,10,'כותרת'],[56,1152,740,1262,8,'טקסט'],[260,1315,732,1430,57,'כפתור']],
      photo:[50,49]}
  };
  /* which wireframe box each piece clears when it lands */
  var CLEAR={d:{nav:0,h1b:1,sub:2,cta:3,c1:4,c2:5,c3:6},m:{nav:0,c1:1,c2:2,c3:3,h1b:4,sub:5,cta:6}};

  var fitStrips=function(){}, rzT=0;
  var mode=null, seq=null, tl=null, played=false, built=false, ready=false, wantPlay=false;
  var NS='http://www.w3.org/2000/svg';
  function el(tag,cls,parent){var e=document.createElement(tag); if(cls) e.className=cls; if(parent) parent.appendChild(e); return e;}
  function pos(e,b){e.style.left=b[0]+'%';e.style.top=b[1]+'%';e.style.width=b[2]+'%';e.style.height=b[3]+'%';}

  function build(){
    mode=REC?REC.mode:(mq.matches?'m':'d'); var S=SPEC[mode];
    if(seq) seq.remove();
    seq=el('div','bb__seq'); seq.setAttribute('aria-hidden','true');
    stage.insertBefore(seq,finA);
    el('div','bb__grid',seq);
    var photo=el('img','bb__photo',seq); photo.alt=''; photo.decoding='async'; photo.src=BASE+'img/bb-'+mode+'-bg.webp';
    /* blueprint */
    var svg=document.createElementNS(NS,'svg'); svg.setAttribute('class','bb__wire'); svg.setAttribute('viewBox','0 0 '+S.W+' '+S.H);
    svg.setAttribute('preserveAspectRatio','xMidYMin slice'); seq.appendChild(svg);
    function line(x1,y1,x2,y2,c){var l=document.createElementNS(NS,'line');l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);l.setAttribute('pathLength','1');l.setAttribute('class',c);l.style.strokeWidth=S.sw;svg.appendChild(l);return l;}
    var diag=[line(0,0,S.W,S.H,'bb__diag'),line(S.W,0,0,S.H,'bb__diag')];
    var rects=[], labels=[];
    S.w.forEach(function(b){
      var r=document.createElementNS(NS,'rect');
      r.setAttribute('x',b[0]);r.setAttribute('y',b[1]);r.setAttribute('width',b[2]-b[0]);r.setAttribute('height',b[3]-b[1]);r.setAttribute('rx',b[4]);
      r.setAttribute('pathLength','1'); r.setAttribute('class','bb__box'); r.style.strokeWidth=S.sw; svg.appendChild(r); rects.push(r);
      var lab=null;
      if(b[5]){ lab=el('span','bb__lab'+(b[6]?' bb__lab--in':''),seq); lab.textContent=b[5];
        lab.style.right=(100-b[2]/S.W*100)+'%'; lab.style.top=(b[1]/S.H*100)+'%'; }
      labels.push(lab);
    });
    var pl=el('span','bb__lab bb__lab--photo',seq); pl.textContent='תמונה'; pl.style.left=S.photo[0]+'%'; pl.style.top=S.photo[1]+'%';
    /* new-site pieces (real crops) */
    var P={};
    Object.keys(S.p).forEach(function(k){
      var w=el('div','bb__p bb__p--'+k,seq); pos(w,S.p[k]);
      var clip=(k==='h1a'||k==='h1b')?el('div','bb__clip',w):w;
      var im=el('img','',clip); im.alt=''; im.decoding='async'; im.src=BASE+'img/bb-'+mode+'-'+k+'.webp';
      if(clip!==w){ var c=el('i','bb__caret',w); P[k]={w:w,clip:clip,img:im,caret:c}; } else P[k]={w:w,img:im};
    });
    /* the old page in strips (background = the same file the "before" picture loads) */
    var strips=el('div','bb__strips',seq), N=S.strips, src=BASE+'img/ba-atlas-before-'+(mode==='m'?'m':(stage.offsetWidth*(window.devicePixelRatio||1)>1100?'1440':'960'))+'.webp', st=[];
    for(var i=0;i<N;i++){ var s=el('div','bb__strip',strips);
      s.style.top=(i/N*100)+'%'; s.style.height=(100/N+.05)+'%';
      s.style.backgroundImage='url('+src+')'; st.push(s); }
    fitStrips=function(){ var h=seq.offsetHeight; st.forEach(function(s,i){ s.style.backgroundPosition='0 '+(-i*h/N).toFixed(2)+'px'; }); };
    fitStrips();
    var scan=el('div','bb__scan',seq); el('i','',scan);
    var cur=el('div','bb__cursor'+(mode==='m'?' bb__cursor--tap':''),seq);
    if(mode!=='m') cur.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l14 7.5-6.2 1.6L9.6 18 5 3z"/></svg>';
    var ring=el('i','bb__ring',seq);
    var fx=root.querySelector('.bb__fx'); fx.innerHTML=''; var sweep=el('div','bb__sweep',fx);
    /* preload what the first seconds need */
    var need=[photo].concat(Object.keys(P).map(function(k){return P[k].img}));
    var pre=new Image(); pre.src=src; need.push(pre);
    ready=false;
    Promise.all(need.map(function(im){return (im.decode?im.decode():Promise.resolve()).catch(function(){})}))
      .then(function(){ ready=true; if(wantPlay) play(); });
    var t=setTimeout(function(){ if(!ready){ ready=true; if(wantPlay) play(); } },3500);
    makeTL({S:S,photo:photo,diag:diag,rects:rects,labels:labels,pl:pl,P:P,st:st,scan:scan,cur:cur,ring:ring,sweep:sweep});
    built=true; window.__bbTL=tl;
  }

  function step(t){ return function(){ if(stepEl) stepEl.textContent=t; }; }

  function makeTL(o){
    if(tl) tl.kill();
    var g=window.gsap, S=o.S, P=o.P, cl=CLEAR[mode], M=mode==='m';
    tl=g.timeline({paused:true,defaults:{ease:'power3.out'},onComplete:done});
    /* start state */
    tl.set(finA,{opacity:0},0).set(finB,{opacity:1},0).set(tagA,{opacity:0},0).set(tagB,{opacity:1},0)
      .set(o.photo,{opacity:0,scale:1.08},0).set([o.diag,o.rects],{strokeDashoffset:1},0)
      .set(o.labels.filter(Boolean).concat(o.pl),{opacity:0,y:6},0)
      .set(o.st,{y:0,rotation:0,opacity:1},0).set(o.scan,{yPercent:-2,opacity:0},0)
      .set(o.cur,{opacity:0,x:function(){return seq.offsetWidth*(M?.12:.3)},y:function(){return seq.offsetHeight*1.04},scale:1},0).set(o.ring,{opacity:0,scale:.2},0).set(o.sweep,{xPercent:-120,opacity:0},0)
      .set(seq,{opacity:1},0);
    Object.keys(P).forEach(function(k){ tl.set(P[k].w,{opacity:0,x:0,y:0,scale:1},0);
      if(P[k].clip){ tl.set(P[k].clip,{xPercent:100},0).set(P[k].img,{xPercent:-100},0).set(P[k].caret,{opacity:0,x:0},0); } });
    tl.call(step('לפני'),null,0);

    /* 2 · comes apart */
    var T=.9, scanD=M?1.15:1.05;
    tl.call(step('מפרקים'),null,T);
    tl.set(finB,{opacity:0},T);
    tl.to(o.scan,{opacity:1,duration:.15,ease:'none'},T).to(o.scan,{yPercent:100,duration:scanD,ease:'power1.inOut'},T).to(o.scan,{opacity:0,duration:.2},T+scanD-.1);
    tl.to(tagB,{opacity:0,duration:.3},T+.25);
    o.st.forEach(function(s,i){ var r=(i%2?1:-1)*(1.2+((i*37)%5)*.45);
      tl.to(s,{y:(M?26:38)+((i*53)%4)*10,rotation:r,opacity:0,duration:.62,ease:'power2.in'},T+.08+i/o.st.length*scanD*.92); });

    /* 3 · blueprint */
    var B=T+.95;
    tl.call(step('משרטטים'),null,B);
    tl.to(o.diag,{strokeDashoffset:0,duration:.9,ease:'power2.inOut',stagger:.1},B);
    tl.to(o.rects,{strokeDashoffset:0,duration:.6,ease:'power2.inOut',stagger:.07},B+.15);
    tl.to(o.labels.filter(Boolean).concat(o.pl),{opacity:1,y:0,duration:.35,stagger:.07},B+.45);

    /* 4 · real pieces land */
    var C=B+1.25;
    tl.call(step('בונים'),null,C);
    tl.to(o.photo,{opacity:1,scale:1,duration:1.1,ease:'power2.out'},C);
    tl.to(o.diag,{opacity:0,duration:.5},C+.2).to(o.pl,{opacity:0,duration:.3},C+.2);
    function clear(k,at){ var i=cl[k]; if(i==null) return; tl.to([o.rects[i],o.labels[i]].filter(Boolean),{opacity:0,duration:.25,ease:'none'},at); }
    function land(k,at,from,d,ease){ if(!P[k]) return; tl.fromTo(P[k].w,from,{opacity:1,x:0,y:0,scale:1,duration:d||.6,ease:ease||'expo.out',immediateRender:false},at); clear(k,at+.12); }
    land('nav',C+.15,{opacity:0,y:-22});
    var hA=M?C+.85:C+.35;
    if(M){ land('c1',C+.35,{opacity:0,x:-60,scale:.96},.75,'back.out(1.5)'); land('c2',C+.47,{opacity:0,x:-60,scale:.96},.75,'back.out(1.5)'); land('c3',C+.59,{opacity:0,x:-60,scale:.96},.75,'back.out(1.5)'); }
    ['h1a','h1b'].forEach(function(k,j){ var p=P[k], at=hA+j*.42;
      tl.set(p.w,{opacity:1},at).set(p.caret,{opacity:1},at)
        .to(p.clip,{xPercent:0,duration:.5,ease:'power2.inOut'},at).to(p.img,{xPercent:0,duration:.5,ease:'power2.inOut'},at)
        .to(p.caret,{x:function(){return -p.w.offsetWidth},duration:.5,ease:'power2.inOut'},at).to(p.caret,{opacity:0,duration:.15},at+.5);
      if(j===1) clear('h1b',at+.3); });
    var sA=hA+.95;
    land('sub',sA,{opacity:0,y:12},.6);
    if(!M){ land('c1',sA+.05,{opacity:0,x:-70,scale:.95},.8,'back.out(1.5)'); land('c2',sA+.17,{opacity:0,x:-70,scale:.95},.8,'back.out(1.5)'); land('c3',sA+.29,{opacity:0,x:-70,scale:.95},.8,'back.out(1.5)'); }
    land('cta',sA+.25,{opacity:0,scale:.6},.65,'back.out(2.2)');
    land('link',sA+.4,{opacity:0,y:8},.5); land('fine',sA+.48,{opacity:0,y:6},.5);

    /* click */
    var K=sA+.95, ctaB=S.p.cta;
    tl.to(o.cur,{opacity:1,duration:.2},K);
    tl.to(o.cur,{x:function(){return seq.offsetWidth*(ctaB[0]+ctaB[2]*.42)/100},y:function(){return seq.offsetHeight*(ctaB[1]+ctaB[3]*.55)/100},duration:.8,ease:'power2.inOut'},K);
    tl.to(o.cur,{scale:.8,duration:.1,ease:'power2.in',yoyo:true,repeat:1},K+.85);
    tl.fromTo(P.cta.w,{scale:1},{scale:.95,duration:.1,ease:'power2.in',yoyo:true,repeat:1,immediateRender:false},K+.85);
    tl.set(o.ring,{x:function(){return seq.offsetWidth*(ctaB[0]+ctaB[2]*.42)/100},y:function(){return seq.offsetHeight*(ctaB[1]+ctaB[3]*.55)/100}},K+.85);
    tl.fromTo(o.ring,{opacity:.9,scale:.2},{opacity:0,scale:1.6,duration:.6,ease:'power2.out',immediateRender:false},K+.88);

    /* 5 · live */
    var L=K+1.15;
    tl.call(step('באוויר'),null,L);
    tl.to(finA,{opacity:1,duration:.55,ease:'power1.inOut'},L);
    tl.to(o.cur,{opacity:0,duration:.25},L);
    tl.to(o.sweep,{opacity:1,duration:.1,ease:'none'},L+.05).to(o.sweep,{xPercent:120,duration:1.05,ease:'power2.inOut'},L+.05).to(o.sweep,{opacity:0,duration:.2},L+.95);
    tl.to(tagA,{opacity:1,duration:.4},L+.45);
    tl.set(seq,{opacity:0},L+.6);
  }

  function done(){ played=true; root.classList.add('is-done'); root.classList.remove('is-playing'); setSeg('after',true); }
  function play(){ wantPlay=false; if(!tl) return; root.classList.add('is-playing'); root.classList.remove('is-done'); setSeg('after',true); tl.invalidate().restart(); }
  function setSeg(v,silent){
    seg.forEach(function(b){ b.setAttribute('aria-pressed',String(b.getAttribute('data-bb-show')===v)); });
    if(silent) return;
    if(tl && tl.isActive()) tl.progress(1);
    root.setAttribute('data-show',v); if(stepEl) stepEl.textContent=v==='before'?'לפני':'באוויר';
    if(window.gsap){ gsap.to(finB,{opacity:v==='before'?1:0,duration:reduce?0:.35,ease:'power2.out',overwrite:true});
      gsap.to(tagB,{opacity:v==='before'?1:0,duration:reduce?0:.25,overwrite:true}); gsap.to(tagA,{opacity:v==='before'?0:1,duration:reduce?0:.25,overwrite:true}); }
    else root.classList.toggle('show-before',v==='before');
  }
  seg.forEach(function(b){ b.addEventListener('click',function(){ setSeg(b.getAttribute('data-bb-show')); }); });

  /* fallback: finished page + toggle */
  if(reduce||!window.gsap||!('IntersectionObserver' in window)&&!REC){
    root.classList.add('is-static'); if(replay) replay.hidden=true; return;
  }
  root.classList.add('is-seq');
  if(replay) replay.addEventListener('click',function(){ root.setAttribute('data-show','after'); gsap.set(finB,{opacity:0}); if(!built) build(); if(ready) play(); else wantPlay=true; });

  if(REC){ build(); window.__bbTL=tl; window.__bbReady=function(){return ready}; return; }

  var near=new IntersectionObserver(function(es){ if(!es[0].isIntersecting) return; near.disconnect(); if(!built){ build(); tl.seek(.01,false); } },{rootMargin:'900px 0px'});
  near.observe(stage);
  addEventListener('resize',function(){ clearTimeout(rzT); rzT=setTimeout(function(){ fitStrips(); },120); },{passive:true});
  var io=new IntersectionObserver(function(es){ if(!es[0].isIntersecting||played) return; io.disconnect(); if(!built){ build(); }
      if(ready) play(); else wantPlay=true; },{threshold:mq.matches?.4:.55});
  io.observe(stage);
  /* layout switch (rotate / resize across the breakpoint): rebuild at the finished state */
  (mq.addEventListener?mq.addEventListener.bind(mq,'change'):mq.addListener.bind(mq))(function(){
    if(!built) return; build(); tl.progress(1); done(); });
})();
