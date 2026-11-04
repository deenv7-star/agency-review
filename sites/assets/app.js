// DNA /sites/ A2 · tiny: header background after scrolling, sticky WhatsApp/call bar between the hero buttons and the final CTA. No reveals, no scroll animation.
(() => {
  const d = document, hd = d.querySelector('.hd'), bar = d.querySelector('.bar');
  const heroCtas = d.querySelector('.hero .ctas'), end = d.querySelector('[data-end] .ctas'), ft = d.querySelector('.ft');
  let pastHero = false, endIn = false, ftIn = false;
  const set = () => bar && bar.classList.toggle('on', pastHero && !endIn && !ftIn);
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.target === heroCtas) pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
    if (e.target === end) endIn = e.isIntersecting;
    if (e.target === ft) ftIn = e.isIntersecting;
    set();
  }));
  [heroCtas, end, ft].forEach((el) => el && io.observe(el));
  const tick = () => hd && hd.classList.toggle('sc', scrollY > 12);
  addEventListener('scroll', tick, { passive: true }); tick();
})();
