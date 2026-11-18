(function () {
  'use strict';

  const hero = document.getElementById('hero');
  const header = document.getElementById('topBar');
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const atlas = document.querySelector('.atlas-preview');
  const links = [...header.querySelectorAll('.top__nav a')];
  const destinations = links.map(link => document.querySelector(link.hash));
  let checkpoints = [];
  let pageLength = 1;
  let heroHeight = 1;
  let atlasTop = 0;
  let atlasHeight = 1;
  let index = -1;
  let frame = 0;
  let cursorX = 0;
  let cursorY = 0;
  let x = 0;
  let y = 0;

  function requestPaint() {
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function measure() {
    const offset = header.offsetHeight + 96;
    checkpoints = destinations.map(section => section.getBoundingClientRect().top + scrollY - offset);
    pageLength = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    heroHeight = Math.max(1, hero.offsetHeight);
    const atlasBounds = atlas.getBoundingClientRect();
    atlasTop = atlasBounds.top + scrollY;
    atlasHeight = atlasBounds.height;
    requestPaint();
  }

  function paint() {
    frame = 0;
    let active = -1;
    checkpoints.forEach((point, i) => {
      if (scrollY >= point) active = i;
    });
    if (active !== index) {
      if (index >= 0) links[index].removeAttribute('aria-current');
      if (active >= 0) links[active].setAttribute('aria-current', 'location');
      index = active;
    }
    if (!motion.matches) return;
    header.style.setProperty('--scroll-progress', Math.min(1, scrollY / pageLength).toFixed(4));
    if (scrollY + innerHeight > atlasTop && scrollY < atlasTop + atlasHeight) {
      const progress = (scrollY + innerHeight - atlasTop) / (atlasHeight + innerHeight);
      atlas.style.setProperty('--atlas-desktop', `${(progress - .5) * 20}px`);
      atlas.style.setProperty('--atlas-phone', `${(.5 - progress) * 38}px`);
    }
    if (scrollY > heroHeight + 40) return;

    const travel = Math.min(1, Math.max(0, scrollY / heroHeight));
    x += (cursorX - x) * .12;
    y += (cursorY - y) * .12;
    hero.style.setProperty('--hero-fold', `${travel * Math.min(34, innerWidth * .027)}px`);
    hero.style.setProperty('--sky-y', `${travel * 57}px`);
    hero.style.setProperty('--metal-scale', 1 + travel * .18);
    hero.style.setProperty('--word-opacity', .79 - travel * .42);
    hero.style.setProperty('--word-y', `${travel * 52 + y * 8}px`);
    hero.style.setProperty('--metal-x', `${x * 20}px`);
    hero.style.setProperty('--metal-y', `${y * 16 + travel * 81}px`);
    hero.style.setProperty('--metal-rx', `${y * -8}deg`);
    hero.style.setProperty('--metal-ry', `${x * 11}deg`);
    hero.style.setProperty('--metal-rz', `${-9 + travel * 33}deg`);
    if (Math.abs(cursorX - x) + Math.abs(cursorY - y) > .002) requestPaint();
  }

  hero.addEventListener('pointermove', event => {
    if (!motion.matches || !pointer.matches || event.pointerType !== 'mouse') return;
    const bounds = hero.getBoundingClientRect();
    cursorX = (event.clientX - bounds.left) / bounds.width - .5;
    cursorY = (event.clientY - bounds.top) / bounds.height - .5;
    requestPaint();
  }, { passive: true });

  hero.addEventListener('pointerleave', () => {
    cursorX = 0;
    cursorY = 0;
    requestPaint();
  });

  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  addEventListener('resize', measure, { passive: true });
  addEventListener('scroll', requestPaint, { passive: true });
  motion.addEventListener('change', requestPaint);
  measure();
}());
