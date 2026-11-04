// DNA /sites/ landing · small, no library. Phones: tap to auto-scroll the real site inside. Header + bottom bar state. One entry reveal.
(() => {
  const d = document, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.documentElement.classList.add('js');

  // reveal once
  const ro = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting || e.boundingClientRect.top < 0) { e.target.classList.add('in'); ro.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  d.querySelectorAll('[data-r]').forEach((el) => ro.observe(el));

  // header + sticky bar
  const hd = d.querySelector('.hd'), bar = d.querySelector('.bar'), hero = d.querySelector('[data-hero]'), end = d.querySelector('[data-end]');
  let endIn = false;
  if (end) new IntersectionObserver(([e]) => { endIn = e.isIntersecting; tick(); }).observe(end);
  const tick = () => {
    const y = scrollY; hd && hd.classList.toggle('sc', y > 12);
    if (bar && hero) bar.classList.toggle('on', y > hero.offsetHeight * 0.75 && !endIn);
  };
  addEventListener('scroll', tick, { passive: true }); tick();

  // phones
  const phones = [...d.querySelectorAll('.ph')];
  const stopAll = (except) => phones.forEach((p) => p !== except && p._pause && p._pause());
  phones.forEach((ph) => {
    const scr = ph.querySelector('.ph-s'), img = scr.querySelector('img'), btn = ph.querySelector('.ph-p'), lbl = btn.querySelector('span'), prog = ph.querySelector('.ph-bar');
    const L = { play: btn.dataset.play, pause: btn.dataset.pause, again: btn.dataset.again };
    let ready = false, want = false, anim = null, raf = 0;
    const load = () => {
      if (ph._loading) return; ph._loading = true;
      const t = new Image(); t.src = ph.dataset.tall;
      (t.decode ? t.decode() : Promise.resolve()).catch(() => {}).then(() => {
        img.src = t.src; img.width = 600; img.height = +ph.dataset.h; ready = true; ph.classList.remove('loading');
        if (want) start();
      });
    };
    new IntersectionObserver(([e]) => { if (e.isIntersecting) load(); else if (ph._pause) ph._pause(); }, { rootMargin: '500px 0px' }).observe(ph);
    const loop = () => { if (!anim) return; const ct = anim.currentTime || 0, du = anim.effect.getTiming().duration; prog.style.transform = `scaleX(${Math.min(1, ct / du)})`; raf = requestAnimationFrame(loop); };
    const start = () => {
      if (RM) { scr.classList.add('free'); btn.hidden = true; return; }
      if (!ready) { want = true; ph.classList.add('loading'); load(); return; }
      stopAll(ph);
      if (!anim || anim.playState === 'finished') {
        const dist = img.getBoundingClientRect().height - scr.clientHeight;
        anim = img.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-dist}px)` }], { duration: Math.max(6000, (dist / scr.clientHeight) * 2300), easing: 'cubic-bezier(.42,0,.58,1)', fill: 'forwards' });
        anim.onfinish = () => { ph.classList.remove('playing'); ph.classList.add('paused'); lbl.textContent = L.again; cancelAnimationFrame(raf); prog.style.transform = 'scaleX(1)'; };
      } else anim.play();
      ph.classList.add('playing'); ph.classList.remove('paused'); lbl.textContent = L.pause; cancelAnimationFrame(raf); loop();
    };
    ph._pause = () => { if (anim && anim.playState === 'running') { anim.pause(); ph.classList.remove('playing'); ph.classList.add('paused'); lbl.textContent = L.play; cancelAnimationFrame(raf); } };
    const toggle = () => (anim && anim.playState === 'running') ? ph._pause() : start();
    btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
    scr.addEventListener('click', () => { if (!scr.classList.contains('free')) toggle(); });
    ph._start = start;
    addEventListener('resize', () => { if (anim) { anim.cancel(); anim = null; ph.classList.remove('playing', 'paused'); lbl.textContent = L.play; prog.style.transform = 'scaleX(0)'; } });
  });

  // tabs (version B / C): one phone per tab, switching pauses the others
  d.querySelectorAll('[data-tabs]').forEach((tb) => {
    const tabs = [...tb.querySelectorAll('[role=tab]')];
    tabs.forEach((t) => t.addEventListener('click', () => {
      tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', on); const pane = d.getElementById(x.getAttribute('aria-controls')); pane.hidden = !on; });
      stopAll(null);
    }));
  });

  // carousel dots (version C)
  d.querySelectorAll('[data-rail]').forEach((rail) => {
    const dots = [...d.querySelectorAll(`[data-dots="${rail.dataset.rail}"] button`)], items = [...rail.children];
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && e.intersectionRatio > 0.6) { const i = items.indexOf(e.target); dots.forEach((b, j) => b.setAttribute('aria-current', i === j)); stopAll(e.target.querySelector('.ph')); } }), { root: rail, threshold: [0.6] });
    items.forEach((it) => io.observe(it));
    dots.forEach((b, i) => b.addEventListener('click', () => items[i].scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'nearest', inline: 'center' })));
  });
})();
