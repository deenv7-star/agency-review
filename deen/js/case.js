/* case pages: scroll reveal, before/after slider, progress + section index. No libraries. */
(function(){
  var d=document, w=window;
  /* before/after: the range input sits over the image (dir=ltr, 0 = left edge) */
  d.querySelectorAll('.cmp').forEach(function(c){
    var r=c.querySelector('.cmp__range'); if(!r) return;
    var set=function(){c.style.setProperty('--pos',r.value+'%')};
    r.addEventListener('input',set); set();
  });

  /* progress line + current section (top bar title and side index) */
  var top=d.querySelector('.ctop'), bar=d.querySelector('.ctop__prog i'), sec=d.querySelector('.ctop__sec'),
      idx=d.querySelector('.cidx'), links=[].slice.call(d.querySelectorAll('.cidx a')),
      secs=links.map(function(a){return d.getElementById(a.getAttribute('data-nav'))}).filter(Boolean),
      dark=[].slice.call(d.querySelectorAll('[data-dark]')), cur=-1, ticking=false;
  function update(){
    ticking=false;
    var y=w.scrollY, H=d.documentElement.scrollHeight-w.innerHeight;
    if(bar) bar.style.transform='scaleX('+(H>0?Math.min(1,y/H):0)+')';
    var mid=w.innerHeight*.38, n=-1;
    secs.forEach(function(s,i){ if(s.getBoundingClientRect().top<mid) n=i; });
    var last=secs[secs.length-1]; if(last && last.getBoundingClientRect().bottom<mid*.6) n=-1;
    if(n!==cur){
      cur=n;
      links.forEach(function(a,i){a.classList.toggle('on',i===n)});
      if(top) top.classList.toggle('is-sec',n>=0);
      if(sec && n>=0){ var a=links[n]; sec.innerHTML='<span class="mono" dir="ltr">'+a.querySelector('span').textContent+'</span>'+a.querySelector('b').textContent; }
    }
    if(idx){
      idx.classList.toggle('on',n>=0);
      var r=idx.getBoundingClientRect(), c=(r.top+r.bottom)/2, onDark=false;
      dark.forEach(function(el){var b=el.getBoundingClientRect(); if(b.top<c&&b.bottom>c&&b.left<r.right) onDark=true;});
      idx.classList.toggle('dark',onDark);
    }
  }
  function req(){ if(!ticking){ticking=true; w.requestAnimationFrame(update);} }
  w.addEventListener('scroll',req,{passive:true}); w.addEventListener('resize',req); update();

  /* reveal once, when allowed */
  if(!d.documentElement.classList.contains('cm')) return;
  var els=[].slice.call(d.querySelectorAll('[data-r]'));
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{rootMargin:'0px 0px -8% 0px',threshold:.08});
  els.forEach(function(el){
    var p=el.parentElement, idx2=[].indexOf.call(p.children,el);
    if(idx2>0 && idx2<6) el.style.transitionDelay=(idx2*80)+'ms';
    io.observe(el);
  });
  setTimeout(function(){els.forEach(function(el){el.classList.add('in')})},6000);
})();
