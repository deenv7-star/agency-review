const hero = document.querySelector('.hero');
const motion = matchMedia('(prefers-reduced-motion: no-preference)');
let pending = false;
function paint() {
  pending = false;
  const distance = Math.max(0, -hero.getBoundingClientRect().top);
  hero.style.setProperty('--drift', (motion.matches ? Math.min(distance, hero.offsetHeight) * .27 : 0) + 'px');
}
function schedule() {
  if (!pending) {
    pending = true;
    requestAnimationFrame(paint);
  }
}
addEventListener('scroll', schedule, {passive:true});
motion.addEventListener('change', schedule);
paint();
