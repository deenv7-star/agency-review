/* DNA STUDIO — service pages shared behavior */
(() => {
  /* services dropdown */
  const dd = document.querySelector('[data-nav-dd]');
  if (dd) {
    const btn = dd.querySelector('.nav-dd-btn');
    const close = () => { dd.removeAttribute('data-open'); btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dd.hasAttribute('data-open');
      open ? close() : (dd.setAttribute('data-open', ''), btn.setAttribute('aria-expanded', 'true'));
    });
    document.addEventListener('click', (e) => { if (!dd.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* mobile overlay */
  const burger = document.querySelector('[data-nav-burger]');
  const overlay = document.querySelector('[data-nav-overlay]');
  if (burger && overlay) {
    const setOverlay = (open) => {
      overlay.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => setOverlay(true));
    overlay.querySelector('[data-nav-close]')?.addEventListener('click', () => setOverlay(false));
    overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOverlay(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOverlay(false); });
  }

  /* videos: load + play in view */
  const vids = document.querySelectorAll('video[data-src]');
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const v = en.target;
      if (en.isIntersecting) {
        if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); }
        v.play().catch(() => {});
      } else if (!v.dataset.keepSound) {
        v.pause();
      }
    });
  }, { threshold: 0.25 }) : null;
  vids.forEach(v => {
    v.muted = true;
    if (io) io.observe(v);
    else { v.src = v.dataset.src; v.play().catch(() => {}); }
  });

  /* sound toggles */
  document.querySelectorAll('[data-sound-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.work-card');
      const v = card && card.querySelector('video');
      if (!v) return;
      const on = card.getAttribute('data-sound') === 'on';
      document.querySelectorAll('.work-card[data-sound="on"]').forEach((c) => {
        c.removeAttribute('data-sound');
        const ov = c.querySelector('video');
        if (ov) { ov.muted = true; delete ov.dataset.keepSound; }
        const b = c.querySelector('[data-sound-toggle] span');
        if (b) b.textContent = 'עם סאונד';
      });
      if (!on) {
        card.setAttribute('data-sound', 'on');
        v.dataset.keepSound = '1';
        v.muted = false;
        v.play().catch(() => {});
        btn.querySelector('span').textContent = 'בלי סאונד';
      }
    });
  });

  /* faq: one open at a time */
  document.querySelectorAll('.faq-list details').forEach((d) => {
    d.addEventListener('toggle', () => {
      if (d.open) document.querySelectorAll('.faq-list details[open]').forEach((o) => { if (o !== d) o.open = false; });
    });
  });

  /* cookie consent + analytics (shared consent key with main site) */
  const KEY = 'dna-cookie-consent-v1';
  const banner = document.querySelector('#cookie-banner');
  const manage = document.querySelector('.cookie-manage');
  let loaded = false;
  const loadAnalytics = () => {
    if (loaded) return; loaded = true;
    const { GA4_ID, META_PIXEL_ID } = window.DNA_ANALYTICS || {};
    if (GA4_ID) {
      const g = document.createElement('script'); g.async = true;
      g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
      document.head.appendChild(g);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments); };
      gtag('js', new Date()); gtag('config', GA4_ID);
    }
    if (META_PIXEL_ID) {
      window.fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
      fbq.queue = []; fbq.loaded = true; fbq.version = '2.0';
      const f = document.createElement('script'); f.async = true;
      f.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(f);
      fbq('init', META_PIXEL_ID); fbq('track', 'PageView');
    }
  };
  if (banner) {
    const choice = localStorage.getItem(KEY);
    if (choice === 'accept') loadAnalytics();
    else if (!choice) banner.hidden = false;
    document.querySelectorAll('[data-cookie]').forEach((b) => b.addEventListener('click', () => {
      localStorage.setItem(KEY, b.dataset.cookie);
      banner.hidden = true;
      if (b.dataset.cookie === 'accept') loadAnalytics();
    }));
    manage && manage.addEventListener('click', () => { banner.hidden = false; });
  }
})();
