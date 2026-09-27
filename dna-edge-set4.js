/* ============================================================================
   DNA EDGE — set 4. Taking hellodna.co.il to the edge.
     <dna-island></dna-island>          Dynamic-Island section navigator
     <dna-reel> <figure data-video data-poster data-title data-sub></figure>… </dna-reel>
     <dna-coverflow> <a href data-img data-title data-sub></a>… </dna-coverflow>
     <dna-sound> <audio src data-title data-sub></audio>… </dna-sound>
   ========================================================================== */
(function () {
  'use strict';
  if (!window.customElements || window.__dnaEdge) return; window.__dnaEdge = 1;
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LIME = '#D9FF43', INK = '#0B0B0B', PAPER = '#F2F0EA';
  var FD = '"Tel Aviv Brutalist","Heebo",Arial,sans-serif', FT = '"Tel Aviv Modernist","Heebo",Arial,sans-serif';
  var EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rubber(o, dim, c) { c = c || 0.55; return (o * dim * c) / (dim + c * Math.abs(o)); }
  function project(v, d) { d = d || 0.998; return (v / 1000) * d / (1 - d); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function Spring(x, r, d) { this.x = x; this.v = 0; this.t = x; this.r = r || 0.4; this.d = d === undefined ? 1 : d; }
  Spring.prototype.step = function (dt) {
    var k = Math.pow(6.2832 / this.r, 2), c = 12.566 * this.d / this.r, n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;
    for (var i = 0; i < n; i++) { var a = -k * (this.x - this.t) - c * this.v; this.v += a * h; this.x += this.v * h; }
    if (Math.abs(this.x - this.t) < 1e-3 && Math.abs(this.v) < 1e-2) { this.x = this.t; this.v = 0; return false; }
    return true;
  };
  function ticker(fn) {
    var raf = 0, last = 0;
    function f(now) { var dt = Math.min(0.05, (now - last) / 1000); last = now; if (fn(dt)) raf = requestAnimationFrame(f); else raf = 0; }
    return function () { if (!raf) { last = performance.now(); raf = requestAnimationFrame(f); } };
  }
  function velocity(h) {
    if (h.length < 2) return 0;
    var l = h[h.length - 1], i = h.length - 1; while (i > 0 && l[0] - h[i - 1][0] < 90) i--;
    var dt = (l[0] - h[i][0]) / 1000; return dt > 0 ? (l[1] - h[i][1]) / dt : 0;
  }

  /* ==========================================================================
     <dna-island>  — reads sections marked data-island="label" (or section[id]
     with an h2). Appears once you leave the hero. Label changes morph the pill
     width on a spring; a ring shows how far down the page you are. Tap → it
     grows into a menu from itself.
     ========================================================================== */
  class DnaIsland extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = 1;
      var self = this, root = this.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>' +
        ':host{position:fixed;bottom:92px;left:18px;z-index:900;transform:none;direction:rtl;pointer-events:none}' +
        '.pill{pointer-events:auto;position:relative;background:#050505;color:#fff;border-radius:22px;overflow:hidden;cursor:pointer;box-shadow:0 12px 34px rgba(0,0,0,.28),inset 0 0 0 1px rgba(255,255,255,.06);will-change:transform,width,height;-webkit-tap-highlight-color:transparent}' +
        '.bar{position:absolute;top:0;right:0;left:0;height:44px;display:flex;align-items:center;gap:10px;padding:0 16px 0 10px;white-space:nowrap}' +
        '.ring{flex:0 0 auto;width:24px;height:24px}' +
        '.lab{position:relative;flex:1 1 auto;height:20px;font:700 15px/20px ' + FD + ';letter-spacing:-.01em;overflow:hidden}' +
        '.lab span{position:absolute;right:0;top:0;transition:transform .45s ' + EASE + ',opacity .3s ease}' +
        '.dot{width:7px;height:7px;border-radius:9px;background:' + LIME + ';flex:0 0 auto;box-shadow:0 0 10px ' + LIME + '}' +
        '.menu{position:absolute;bottom:52px;right:10px;left:10px;opacity:0;transform:translateY(-6px);transition:opacity .2s ease,transform .3s ' + EASE + '}' +
        '.open .menu{opacity:1;transform:none;transition-delay:.08s}' +
        '.it{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 10px;border-radius:14px;font:700 17px ' + FD + ';color:#fff;cursor:pointer;transition:background .15s ease}.it span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
        '.it small{font:700 11px ' + FT + ';letter-spacing:.12em;color:#77736B;direction:ltr}' +
        '.it.on{color:' + LIME + '}' +
        '@media (hover:hover) and (pointer:fine){.it:hover{background:rgba(255,255,255,.07)}}' +
        '.meas{position:absolute;visibility:hidden;white-space:nowrap;font:700 15px ' + FD + '}' +
        '</style><div class="pill" role="navigation" aria-label="ניווט באתר"><div class="bar"><span class="dot"></span><div class="lab"></div>' +
        '<svg class="ring" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="2.5"/><circle class="rp" cx="12" cy="12" r="9.5" fill="none" stroke="' + LIME + '" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="59.7" stroke-dashoffset="59.7" transform="rotate(-90 12 12)"/></svg></div>' +
        '<div class="menu" role="menu"></div></div><span class="meas"></span>';
      var pill = root.querySelector('.pill'), lab = root.querySelector('.lab'), rp = root.querySelector('.rp'), menu = root.querySelector('.menu'), meas = root.querySelector('.meas');
      var secs = [];
      var collect = function () {
        var list = Array.prototype.slice.call(document.querySelectorAll('[data-island]'));
        if (!list.length) list = Array.prototype.slice.call(document.querySelectorAll('section[id]')).filter(function (s) { return s.querySelector('h2'); });
        secs = list.map(function (el) { return { el: el, label: (el.getAttribute('data-island') || el.querySelector('h2').textContent).trim().slice(0, 26) }; });
        menu.innerHTML = secs.map(function (s, i) { return '<div class="it" role="menuitem" tabindex="0" data-i="' + i + '"><span>' + esc(s.label) + '</span><small>' + ('0' + (i + 1)).slice(-2) + '</small></div>'; }).join('');
      };
      collect();
      this.w = new Spring(120, 0.42, 0.82); this.h = new Spring(44, 0.42, 0.82); this.y = new Spring(-80, 0.45, 1);
      var open = false, cur = -2, labelEl = null;
      var paint = function () {
        pill.style.width = self.w.x.toFixed(1) + 'px'; pill.style.height = self.h.x.toFixed(1) + 'px'; pill.style.borderRadius = Math.min(self.h.x / 2, 30).toFixed(1) + 'px';
        pill.style.transform = 'translateY(' + self.y.x.toFixed(1) + 'px)';
      };
      var run = ticker(function (dt) { var g = self.w.step(dt) | self.h.step(dt) | self.y.step(dt); paint(); return !!g; });
      var fitW = function (txt) { meas.textContent = txt; return Math.min(innerWidth - 32, meas.offsetWidth + 86); };
      var setLabel = function (i) {
        if (i === cur) return; var dir = i > cur ? 1 : -1; cur = i;
        var txt = i >= 0 ? secs[i].label : 'DNA STUDIO';
        var s = document.createElement('span'); s.textContent = txt; s.style.transform = 'translateY(' + (dir * 22) + 'px)'; s.style.opacity = '0';
        lab.appendChild(s); void s.offsetWidth; s.style.transform = 'none'; s.style.opacity = '1';
        if (labelEl) { var old = labelEl; old.style.transform = 'translateY(' + (-dir * 22) + 'px)'; old.style.opacity = '0'; setTimeout(function () { old.remove(); }, 460); }
        labelEl = s;
        Array.prototype.forEach.call(menu.children, function (m, k) { m.classList.toggle('on', k === i); });
        if (!open) { self.w.t = fitW(txt); run(); }
      };
      var toggle = function (on) {
        open = on; pill.classList.toggle('open', on);
        if (on) { self.w.t = Math.min(innerWidth - 24, 380); self.h.t = 58 + secs.length * 46; }
        else { self.w.t = fitW(cur >= 0 ? secs[cur].label : 'DNA STUDIO'); self.h.t = 44; }
        self.w.d = on ? 0.78 : 1; self.h.d = on ? 0.78 : 1; run();
      };
      var onScroll = function () {
        var y = scrollY, H = document.documentElement.scrollHeight - innerHeight;
        rp.setAttribute('stroke-dashoffset', (59.7 * (1 - clamp(y / Math.max(1, H), 0, 1))).toFixed(2));
        var show = y > innerHeight * 0.55;
        var ty = show ? 0 : -80; if (self.y.t !== ty) { self.y.t = ty; run(); if (!show && open) toggle(false); }
        var mid = innerHeight * 0.4, best = -1;
        secs.forEach(function (s, i) { var r = s.el.getBoundingClientRect(); if (r.top <= mid) best = i; });
        setLabel(best);
      };
      pill.addEventListener('click', function (e) {
        var it = e.target.closest('.it');
        if (it && open) { var s = secs[+it.getAttribute('data-i')]; toggle(false); s.el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); return; }
        toggle(!open);
      });
      menu.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.target.click(); });
      document.addEventListener('click', function (e) { if (open && !self.contains(e.target) && e.composedPath().indexOf(pill) < 0) toggle(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) toggle(false); });
      addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
      if (RM) { this.w.r = this.h.r = this.y.r = 0.12; }
      paint(); onScroll();
    }
  }

  /* ==========================================================================
     <dna-reel>  — TV-style carousel. Flick with momentum; it lands on a card.
     The centred card plays muted. Tap it: the card itself grows into the
     player (shared element); drag down to shrink it back to where it lives.
     Children: <figure data-video data-poster data-title data-sub></figure>
     ========================================================================== */
  class DnaReel extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = 1;
      var self = this;
      var items = Array.prototype.slice.call(this.querySelectorAll('figure')).map(function (f) {
        return { v: f.getAttribute('data-video'), p: f.getAttribute('data-poster'), t: f.getAttribute('data-title') || '', s: f.getAttribute('data-sub') || '' };
      });
      var root = this.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>' +
        ':host{display:block;position:relative;direction:rtl;touch-action:pan-y;user-select:none;-webkit-user-select:none}' +
        '.vp{position:relative;height:min(78vh,720px,calc((100vw - 64px) * 1.25 / .88));overflow:hidden}' +
        '.card{position:absolute;top:0;left:50%;height:88%;aspect-ratio:4/5;border-radius:26px;overflow:hidden;background:#111;cursor:pointer;will-change:transform;box-shadow:0 30px 60px -24px rgba(0,0,0,.5)}' +
        '.card video,.card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
        '.card .sh{position:absolute;inset:auto 0 0 0;height:50%;background:linear-gradient(transparent,rgba(0,0,0,.72))}' +
        '.card .t{position:absolute;right:22px;left:22px;bottom:20px;color:#fff}' +
        '.card .t b{display:block;font:700 clamp(22px,2.2vw,30px)/1 ' + FD + ';letter-spacing:-.02em}' +
        '.card .t small{display:block;margin-top:6px;font:400 14px ' + FT + ';color:rgba(255,255,255,.72)}' +
        '.card .play{position:absolute;top:18px;left:18px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.2);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:grid;place-items:center;opacity:0;transition:opacity .3s ease}' +
        '.card.on .play{opacity:1}.card .play:after{content:"";margin-left:3px;border-left:13px solid #fff;border-top:8px solid transparent;border-bottom:8px solid transparent}' +
        '.dots{display:flex;justify-content:center;gap:8px;margin-top:6px}.dots i{width:7px;height:7px;border-radius:9px;background:rgba(11,11,11,.18);transition:width .35s ' + EASE + ',background .35s}.dots i.on{width:24px;background:' + INK + '}' +
        '.nav{position:absolute;top:44%;width:48px;height:48px;border-radius:50%;border:0;background:rgba(255,255,255,.82);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 8px 24px rgba(0,0,0,.15);cursor:pointer;z-index:5}' +
        '.nav:before{content:"";position:absolute;top:50%;left:50%;width:9px;height:9px;border-top:2.5px solid ' + INK + ';border-left:2.5px solid ' + INK + '}' +
        '.nx{left:14px}.nx:before{transform:translate(-30%,-50%) rotate(-45deg)}.pv{right:14px}.pv:before{transform:translate(-70%,-50%) rotate(135deg)}' +
        '.nav:active{transform:scale(.94)}@media (hover:none){.nav{display:none}}' +
        '.fs{position:fixed;inset:0;z-index:1200;pointer-events:none}' +
        '.fs .bg{position:absolute;inset:0;background:#000;opacity:0}' +
        '.fs .box{position:absolute;overflow:hidden;background:#000;border-radius:26px}' +
        '.fs video{width:100%;height:100%;object-fit:contain;background:#000}' +
        '.fs .x{position:absolute;top:16px;right:16px;width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.16);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);cursor:pointer;opacity:0;transition:opacity .25s ease}' +
        '.fs .x:before,.fs .x:after{content:"";position:absolute;left:50%;top:50%;width:15px;height:2px;margin:-1px 0 0 -7.5px;background:#fff;border-radius:2px;transform:rotate(45deg)}.fs .x:after{transform:rotate(-45deg)}' +
        '.fs.live{pointer-events:auto}.fs.live .x{opacity:1}' +
        '</style><div class="vp">' + items.map(function (it, i) {
          return '<div class="card" data-i="' + i + '"><img alt="" src="' + esc(it.p) + '"><video muted playsinline loop preload="none" poster="' + esc(it.p) + '" src="' + esc(it.v) + '"></video><div class="sh"></div><div class="play"></div><div class="t"><b>' + esc(it.t) + '</b><small>' + esc(it.s) + '</small></div></div>';
        }).join('') + '<button class="nav pv" aria-label="הקודם"></button><button class="nav nx" aria-label="הבא"></button></div>' +
        '<div class="dots">' + items.map(function () { return '<i></i>'; }).join('') + '</div>' +
        '<div class="fs"><div class="bg"></div><div class="box"><video playsinline controls></video></div><button class="x" aria-label="סגירה"></button></div>';
      var vp = root.querySelector('.vp'), cards = Array.prototype.slice.call(root.querySelectorAll('.card')), dots = root.querySelectorAll('.dots i');
      var fs = root.querySelector('.fs'), fbg = fs.querySelector('.bg'), fbox = fs.querySelector('.box'), fvid = fs.querySelector('video'), fx = fs.querySelector('.x');
      var N = items.length; this.pos = new Spring(0, 0.5, 1); var active = -1;
      var gap = function () { return cards[0].offsetWidth * 0.78; };
      var paint = function () {
        var p = self.pos.x, G = gap();
        cards.forEach(function (c, i) {
          var d = i - p, ad = Math.abs(d);
          var s = lerp(1, 0.84, clamp(ad, 0, 1)), op = clamp(1.4 - ad * 0.45, 0, 1);
          c.style.transform = 'translateX(calc(-50% + ' + (-d * G).toFixed(1) + 'px)) scale(' + s.toFixed(4) + ')';   // RTL: next card sits to the left
          c.style.opacity = op.toFixed(3); c.style.zIndex = String(100 - Math.round(ad * 10));
          c.style.filter = 'brightness(' + lerp(1, 0.62, clamp(ad, 0, 1)).toFixed(3) + ')';
        });
        var a = clamp(Math.round(p), 0, N - 1);
        if (a !== active) {
          active = a;
          cards.forEach(function (c, i) {
            var v = c.querySelector('video'); c.classList.toggle('on', i === a);
            if (i === a && !RM) { v.preload = 'auto'; var pr = v.play(); if (pr && pr.catch) pr.catch(function () { }); } else v.pause();
          });
          Array.prototype.forEach.call(dots, function (d, i) { d.className = i === a ? 'on' : ''; });
        }
      };
      var run = ticker(function (dt) { var g = self.pos.step(dt); paint(); return g; });
      var go = function (i, v) { self.pos.t = clamp(i, 0, N - 1); if (v !== undefined) self.pos.v = v; self.pos.d = 1; run(); };
      root.querySelector('.nx').addEventListener('click', function () { go(Math.round(self.pos.t) + 1); });
      root.querySelector('.pv').addEventListener('click', function () { go(Math.round(self.pos.t) - 1); });
      this.tabIndex = 0;
      this.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') go(Math.round(self.pos.t) + 1); if (e.key === 'ArrowRight') go(Math.round(self.pos.t) - 1); });
      // drag: 1:1, rubber-band at the ends, flick projects to a card
      var drag = null;
      vp.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.nav')) return;
        drag = { x0: e.clientX, p0: self.pos.x, h: [[performance.now(), e.clientX]], moved: false, card: e.target.closest('.card') };
        self.pos.t = self.pos.x; self.pos.v = 0;
      });
      vp.addEventListener('pointermove', function (e) {
        if (!drag) return; var dx = e.clientX - drag.x0;
        if (!drag.moved && Math.abs(dx) > 8) { drag.moved = true; vp.setPointerCapture(e.pointerId); }
        if (!drag.moved) return;
        drag.h.push([performance.now(), e.clientX]); if (drag.h.length > 12) drag.h.shift();
        var p = drag.p0 + dx / gap();                            // RTL: dragging right reveals the previous… content moves with the finger
        if (p < 0) p = -rubber(-p, 1, 0.3); else if (p > N - 1) p = N - 1 + rubber(p - (N - 1), 1, 0.3);
        self.pos.x = self.pos.t = p; paint();
      });
      var up = function (e) {
        if (!drag) return; var d = drag; drag = null;
        if (!d.moved) { if (d.card) { var i = +d.card.getAttribute('data-i'); if (i === active) expand(i); else go(i); } return; }
        var v = velocity(d.h) / gap(); var proj = self.pos.x + project(v * 1000) / 1000 * 0.9;
        go(Math.round(clamp(proj, 0, N - 1)), v);
      };
      vp.addEventListener('pointerup', up); vp.addEventListener('pointercancel', function () { drag = null; go(Math.round(self.pos.x)); });
      // ---- shared-element expand ----
      var R = { x: new Spring(0, 0.42, 1), y: new Spring(0, 0.42, 1), w: new Spring(0, 0.42, 1), h: new Spring(0, 0.42, 1), o: new Spring(0, 0.42, 1), r: new Spring(26, 0.42, 1) };
      var from = null, isOpen = false;
      var fpaint = function () {
        fbox.style.left = R.x.x + 'px'; fbox.style.top = R.y.x + 'px'; fbox.style.width = R.w.x + 'px'; fbox.style.height = R.h.x + 'px';
        fbox.style.borderRadius = R.r.x + 'px'; fbg.style.opacity = clamp(R.o.x, 0, 1).toFixed(3);
      };
      var frun = ticker(function (dt) { var g = 0; for (var k in R) g |= R[k].step(dt); fpaint();
        var home = !isOpen && Math.abs(R.x.x - R.x.t) < 0.8 && Math.abs(R.y.x - R.y.t) < 0.8 && Math.abs(R.w.x - R.w.t) < 0.8;
        if (home) { for (var q in R) { R[q].x = R[q].t; R[q].v = 0; } fpaint(); fs.style.visibility = 'hidden'; cards[from.i].style.visibility = ''; return false; }
        return !!g; });
      var target = function () { var W = innerWidth, H = innerHeight, w = Math.min(W, H * 16 / 9), h = w * 9 / 16; if (h > H) { h = H; w = h * 16 / 9; } return { x: (W - w) / 2, y: (H - h) / 2, w: w, h: h }; };
      var expand = function (i) {
        var c = cards[i], r = c.getBoundingClientRect(); from = { i: i }; isOpen = true;
        R.x.x = r.left; R.y.x = r.top; R.w.x = r.width; R.h.x = r.height; R.r.x = 26; R.o.x = 0;
        var t = target(); R.x.t = t.x; R.y.t = t.y; R.w.t = t.w; R.h.t = t.h; R.r.t = 0; R.o.t = 1;
        for (var k in R) { R[k].v = 0; R[k].d = 1; R[k].r = 0.42; if (RM) R[k].x = R[k].t; }
        fvid.poster = items[i].p; fvid.src = items[i].v; fvid.muted = false;
        var cv = c.querySelector('video'); try { fvid.currentTime = cv.currentTime || 0; } catch (e) { }
        fs.style.visibility = 'visible'; fs.classList.add('live'); c.style.visibility = 'hidden';
        var pr = fvid.play(); if (pr && pr.catch) pr.catch(function () { });
        frun(); document.documentElement.style.overflow = 'hidden';
      };
      var collapse = function (v) {
        if (!isOpen) return; isOpen = false; fs.classList.remove('live'); fvid.pause();
        var r = cards[from.i].getBoundingClientRect();
        R.x.t = r.left; R.y.t = r.top; R.w.t = r.width; R.h.t = r.height; R.r.t = 26; R.o.t = 0; for (var kk in R) R[kk].r = 0.36;
        if (v) R.y.v = v; for (var k in R) { if (RM) R[k].x = R[k].t; }
        frun(); document.documentElement.style.overflow = '';
      };
      fx.addEventListener('click', function () { collapse(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') collapse(); });
      // drag the player down to send it home (Photos-style): it shrinks as it follows
      var fd = null;
      fbox.addEventListener('pointerdown', function (e) { if (e.target === fvid && e.offsetY > fbox.clientHeight - 60) return; fd = { y0: e.clientY, x0: e.clientX, h: [[performance.now(), e.clientY]], t: target(), moved: false }; });
      fbox.addEventListener('pointermove', function (e) {
        if (!fd) return; var dy = e.clientY - fd.y0; if (!fd.moved && dy > 10) { fd.moved = true; fbox.setPointerCapture(e.pointerId); }
        if (!fd.moved) return; fd.h.push([performance.now(), e.clientY]); if (fd.h.length > 12) fd.h.shift();
        var k = clamp(1 - dy / (innerHeight * 1.4), 0.55, 1), t = fd.t;
        R.w.x = R.w.t = t.w * k; R.h.x = R.h.t = t.h * k; R.x.x = R.x.t = t.x + (t.w - t.w * k) / 2 + (e.clientX - fd.x0);
        R.y.x = R.y.t = t.y + dy; R.o.x = R.o.t = clamp(1 - dy / (innerHeight * 0.6), 0.2, 1); R.r.x = R.r.t = 26 * (1 - k) / 0.45; fpaint();
      });
      fbox.addEventListener('pointerup', function () {
        if (!fd) return; var d = fd; fd = null; if (!d.moved) return;
        var v = velocity(d.h), dy = R.y.x - d.t.y;
        if (dy + project(v) * 0.4 > innerHeight * 0.18) collapse(v);
        else { var t = d.t; R.x.t = t.x; R.y.t = t.y; R.w.t = t.w; R.h.t = t.h; R.o.t = 1; R.r.t = 0; R.y.v = v; frun(); }
      });
      fs.style.visibility = 'hidden';
      new ResizeObserver(paint).observe(vp);
      var pr0 = RM ? null : null;
      paint();
    }
  }

  /* ==========================================================================
     <dna-coverflow>  — the sites we built, in Cover Flow. Drag or flick; it
     lands on a site. Tap a side cover to bring it forward; tap the front one
     to visit. Children: <a href data-img data-title data-sub></a>
     ========================================================================== */
  class DnaCoverflow extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = 1;
      var self = this;
      var items = Array.prototype.slice.call(this.querySelectorAll('a')).map(function (a) {
        return { h: a.getAttribute('href'), i: a.getAttribute('data-img'), t: a.getAttribute('data-title') || '', s: a.getAttribute('data-sub') || '' };
      });
      var root = this.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>' +
        ':host{display:block;position:relative;direction:rtl;touch-action:pan-y;user-select:none;-webkit-user-select:none;outline:none}' +
        '.stage{position:relative;height:clamp(300px,42vw,520px);perspective:1400px;overflow:hidden}' +
        '.cv{position:absolute;top:8%;left:50%;width:min(62vw,620px);aspect-ratio:1200/900;margin-left:calc(min(62vw,620px) / -2);transform-style:preserve-3d;will-change:transform;cursor:pointer;' +
        '-webkit-box-reflect:below 6px linear-gradient(transparent 62%,rgba(255,255,255,.22))}' +
        '.win{position:absolute;inset:0;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 30px 60px -20px rgba(0,0,0,.35),0 0 0 1px rgba(11,11,11,.08)}' +
        '.chrome{height:7.5%;min-height:18px;background:#ecebe6;display:flex;align-items:center;gap:6px;padding:0 10px;direction:ltr}' +
        '.chrome i{width:9px;height:9px;border-radius:9px;background:#d5d3cc}.chrome i:nth-child(1){background:#ff5f57}.chrome i:nth-child(2){background:#febc2e}.chrome i:nth-child(3){background:#28c840}' +
        '.chrome em{flex:1;margin:0 12% 0 8%;height:56%;border-radius:6px;background:#fff;font:400 10px/1.9 ' + FT + ';color:#888;font-style:normal;text-align:center;overflow:hidden;white-space:nowrap}' +
        '.win img{display:block;width:100%;height:92.5%;object-fit:cover;object-position:top}' +
        '.shade{position:absolute;inset:0;border-radius:14px;background:#000;pointer-events:none}' +
        '.cap{text-align:center;margin-top:6px;min-height:64px;position:relative}' +
        '.cap div{position:absolute;inset:0;transition:opacity .3s ease,transform .45s ' + EASE + '}' +
        '.cap b{display:block;font:700 clamp(24px,2.6vw,34px)/1 ' + FD + ';letter-spacing:-.02em;color:' + INK + '}' +
        '.cap small{display:inline-block;margin-top:8px;font:400 15px ' + FT + ';color:#6c6a64}' +
        ':host(:focus-visible) .stage{outline:2px solid ' + LIME + ';outline-offset:4px;border-radius:18px}' +
        '</style><div class="stage">' + items.map(function (it, i) {
          var host = new URL(it.h).hostname;
          return '<div class="cv" data-i="' + i + '"><div class="win"><div class="chrome"><i></i><i></i><i></i><em>' + esc(host) + '</em></div><img alt="' + esc(it.t) + '" src="' + esc(it.i) + '"></div><div class="shade"></div></div>';
        }).join('') + '</div><div class="cap"></div>';
      var covers = Array.prototype.slice.call(root.querySelectorAll('.cv')), cap = root.querySelector('.cap'), stage = root.querySelector('.stage');
      var N = items.length; this.pos = new Spring(Math.floor(N / 2), 0.5, 1); var shown = -1;
      var W = function () { return covers[0].offsetWidth; };
      var paint = function () {
        var p = self.pos.x, w = W();
        covers.forEach(function (c, i) {
          var d = i - p, s = Math.sign(d), ad = Math.min(Math.abs(d), 6);
          var near = clamp(ad, 0, 1);
          var x = -(s * (near * w * 0.52 + Math.max(0, ad - 1) * w * 0.16));   // RTL: later items to the left
          var ry = s * near * 58, z = -near * w * 0.38 - Math.max(0, ad - 1) * 20;
          c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,' + z.toFixed(1) + 'px) rotateY(' + ry.toFixed(2) + 'deg)';
          c.style.zIndex = String(100 - Math.round(ad * 10));
          c.querySelector('.shade').style.opacity = (near * 0.28 + Math.max(0, ad - 1) * 0.08).toFixed(3);
          c.style.visibility = ad > 5.5 ? 'hidden' : '';
        });
        var a = clamp(Math.round(p), 0, N - 1);
        if (a !== shown) {
          var dir = a > shown ? 1 : -1; shown = a;
          var n = document.createElement('div'); n.innerHTML = '<b>' + esc(items[a].t) + '</b><small>' + esc(items[a].s) + '</small>';
          n.style.opacity = '0'; n.style.transform = 'translateY(' + (10 * dir) + 'px)'; cap.appendChild(n); void n.offsetWidth; n.style.opacity = '1'; n.style.transform = 'none';
          var olds = Array.prototype.slice.call(cap.children, 0, -1); olds.forEach(function (o) { o.style.opacity = '0'; setTimeout(function () { o.remove(); }, 320); });
        }
      };
      var run = ticker(function (dt) { var g = self.pos.step(dt); paint(); return g; });
      var go = function (i, v) { self.pos.t = clamp(i, 0, N - 1); if (v !== undefined) self.pos.v = v; run(); };
      this.tabIndex = 0;
      this.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') go(Math.round(self.pos.t) + 1); if (e.key === 'ArrowRight') go(Math.round(self.pos.t) - 1);
        if (e.key === 'Enter' && items[shown].h) window.open(items[shown].h, '_blank', 'noopener');
      });
      var drag = null;
      stage.addEventListener('pointerdown', function (e) { drag = { x0: e.clientX, p0: self.pos.x, h: [[performance.now(), e.clientX]], moved: false, c: e.target.closest('.cv') }; self.pos.t = self.pos.x; self.pos.v = 0; });
      stage.addEventListener('pointermove', function (e) {
        if (!drag) return; var dx = e.clientX - drag.x0;
        if (!drag.moved && Math.abs(dx) > 8) { drag.moved = true; stage.setPointerCapture(e.pointerId); }
        if (!drag.moved) return; drag.h.push([performance.now(), e.clientX]); if (drag.h.length > 12) drag.h.shift();
        var p = drag.p0 + dx / (W() * 0.55);
        if (p < 0) p = -rubber(-p, 1, 0.3); else if (p > N - 1) p = N - 1 + rubber(p - (N - 1), 1, 0.3);
        self.pos.x = self.pos.t = p; paint();
      });
      stage.addEventListener('pointerup', function () {
        if (!drag) return; var d = drag; drag = null;
        if (!d.moved) { if (d.c) { var i = +d.c.getAttribute('data-i'); if (i === shown && items[i].h) window.open(items[i].h, '_blank', 'noopener'); else go(i); } return; }
        var v = velocity(d.h) / (W() * 0.55); go(Math.round(clamp(self.pos.x + v * 0.35, 0, N - 1)), v);
      });
      stage.addEventListener('pointercancel', function () { drag = null; go(Math.round(self.pos.x)); });
      new ResizeObserver(paint).observe(stage);
      paint();
    }
  }

  /* ==========================================================================
     <dna-sound>  — sonic branding player. A lime disc whose ring of bars is
     driven by the real audio (Web Audio analyser). The play glyph morphs into
     pause. Children: <audio src data-title data-sub></audio>
     ========================================================================== */
  class DnaSound extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = 1;
      var self = this;
      var tracks = Array.prototype.slice.call(this.querySelectorAll('audio')).map(function (a) { return { s: a.getAttribute('src'), t: a.getAttribute('data-title') || '', d: a.getAttribute('data-sub') || '' }; });
      var root = this.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>' +
        ':host{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,5vw,70px);align-items:center;direction:rtl}' +
        '.disc{position:relative;aspect-ratio:1/1;width:100%;max-width:460px;justify-self:center}' +
        'canvas{position:absolute;inset:0;width:100%;height:100%}' +
        '.pb{position:absolute;top:50%;left:50%;width:30%;height:30%;margin:-15% 0 0 -15%;border-radius:50%;border:0;background:' + INK + ';cursor:pointer;display:grid;place-items:center;box-shadow:0 14px 30px -10px rgba(0,0,0,.5);transition:transform .14s ease}' +
        '.pb:active{transform:scale(.94)}' +
        '.g{width:34%;height:34%;background:' + LIME + ';transition:clip-path .32s ' + EASE + ';clip-path:polygon(16% 0,16% 100%,100% 50%,100% 50%,16% 0,16% 0,16% 100%,16% 100%)}' +
        '.on .g{clip-path:polygon(4% 0,4% 100%,38% 100%,38% 0,62% 0,62% 100%,96% 100%,96% 0)}' +
        '.list{display:flex;flex-direction:column;gap:10px}' +
        '.tr{display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:20px;background:#fff;border:1.5px solid rgba(11,11,11,.08);cursor:pointer;transition:border-color .2s ease,transform .12s ease}' +
        '.tr:active{transform:scale(.985)}.tr.on{border-color:' + INK + '}' +
        '.tr .n{font:700 12px ' + FT + ';letter-spacing:.12em;color:#77736B;direction:ltr;width:22px}' +
        '.tr b{display:block;font:700 20px ' + FD + ';color:' + INK + '}.tr small{display:block;font:400 14px ' + FT + ';color:#6c6a64;margin-top:2px}' +
        '.tr .eq{margin-inline-start:auto;display:flex;gap:3px;align-items:flex-end;height:16px;opacity:0}' +
        '.tr .eq i{width:3px;background:' + INK + ';border-radius:2px;height:30%}' +
        '.tr.on.playing .eq{opacity:1}.tr.on.playing .eq i{animation:eq .9s ease-in-out infinite}.tr .eq i:nth-child(2){animation-delay:-.3s}.tr .eq i:nth-child(3){animation-delay:-.6s}' +
        '@keyframes eq{0%,100%{height:30%}50%{height:100%}}' +
        '.bar{height:4px;border-radius:4px;background:rgba(11,11,11,.1);margin-top:6px;overflow:hidden}.bar i{display:block;height:100%;width:0;background:' + INK + '}' +
        '@media (max-width:760px){:host{grid-template-columns:1fr}}' +
        '@media (prefers-reduced-motion:reduce){.tr .eq i{animation:none!important}}' +
        '</style><div class="disc"><canvas></canvas><button class="pb" aria-label="נגן"><span class="g"></span></button></div>' +
        '<div class="list">' + tracks.map(function (t, i) { return '<div class="tr" data-i="' + i + '" role="button" tabindex="0"><span class="n">0' + (i + 1) + '</span><div style="flex:1"><b>' + esc(t.t) + '</b><small>' + esc(t.d) + '</small><div class="bar"><i></i></div></div><span class="eq"><i></i><i></i><i></i></span></div>'; }).join('') + '</div>';
      var cv = root.querySelector('canvas'), ctx = cv.getContext('2d'), pb = root.querySelector('.pb'), disc = root.querySelector('.disc');
      var rows = Array.prototype.slice.call(root.querySelectorAll('.tr'));
      var audio = new Audio(); audio.preload = 'none'; audio.crossOrigin = 'anonymous';
      var cur = 0, ac = null, an = null, data = null, lvl = new Float32Array(64), energy = new Spring(0, 0.25, 1);
      var setTrack = function (i, play) {
        cur = i; audio.src = tracks[i].s;
        rows.forEach(function (r, k) { r.classList.toggle('on', k === i); r.querySelector('.bar i').style.width = '0'; });
        if (play) start();
      };
      var start = function () {
        if (!ac) {
          try {
            var AC = window.AudioContext || window.webkitAudioContext; ac = new AC();
            var src = ac.createMediaElementSource(audio); an = ac.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = 0.78;
            src.connect(an); an.connect(ac.destination); data = new Uint8Array(an.frequencyBinCount);
          } catch (e) { an = null; }
        }
        if (ac && ac.state === 'suspended') ac.resume();
        var p = audio.play(); if (p && p.catch) p.catch(function () { });
      };
      pb.addEventListener('click', function () { if (!audio.src) setTrack(cur, false); if (audio.paused) start(); else audio.pause(); });
      rows.forEach(function (r) {
        var act = function () { var i = +r.getAttribute('data-i'); if (i === cur && audio.src && !audio.paused) audio.pause(); else setTrack(i, true); };
        r.addEventListener('click', act); r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      });
      var sync = function () { var on = !audio.paused; disc.classList.toggle('on', on); pb.setAttribute('aria-label', on ? 'השהיה' : 'נגן'); rows.forEach(function (r, k) { r.classList.toggle('playing', on && k === cur); }); };
      audio.addEventListener('play', sync); audio.addEventListener('pause', sync);
      audio.addEventListener('ended', function () { setTrack((cur + 1) % tracks.length, true); });
      audio.addEventListener('timeupdate', function () { if (audio.duration) rows[cur].querySelector('.bar i').style.width = (audio.currentTime / audio.duration * 100).toFixed(1) + '%'; });
      setTrack(0, false);
      var t0 = performance.now(), last = t0;
      var frame = function (now) {
        requestAnimationFrame(frame);
        var dt = Math.min(0.05, (now - last) / 1000); last = now; var t = (now - t0) / 1000;
        var r = cv.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
        var d = Math.min(2, devicePixelRatio || 1); if (cv.width !== Math.round(r.width * d)) { cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); }
        var W = cv.width, H = cv.height, cx = W / 2, cy = H / 2, R = W * 0.3;
        var playing = !audio.paused, got = false, sum = 0;
        if (an && playing) { an.getByteFrequencyData(data); for (var q = 0; q < data.length; q++) sum += data[q]; got = sum > 0; }
        for (var i = 0; i < 64; i++) {
          var target;
          if (got) { var b = data[Math.min(data.length - 1, Math.floor(Math.pow(i / 64, 1.6) * data.length * 0.8) + 1)] / 255; target = b; }
          else if (playing) target = 0.25 + 0.25 * Math.abs(Math.sin(t * 4.1 + i * 0.7) * Math.sin(t * 1.7 + i * 0.23));
          else target = 0.06 + 0.03 * Math.sin(t * 1.4 + i * 0.35);
          lvl[i] += (target - lvl[i]) * Math.min(1, dt * (target > lvl[i] ? 18 : 6));
        }
        energy.t = playing ? (got ? sum / (data.length * 255) : 0.3) : 0; energy.step(dt);
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
        var e = energy.x;
        var g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * (1.9 + e));
        g.addColorStop(0, 'rgba(217,255,67,' + (0.35 + e * 0.4).toFixed(3) + ')'); g.addColorStop(1, 'rgba(217,255,67,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * (1.9 + e), 0, 6.2832); ctx.fill();
        var dg = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R * (1.02 + e * 0.06));
        dg.addColorStop(0, '#F4FFC2'); dg.addColorStop(0.45, LIME); dg.addColorStop(1, '#A9CC23');
        ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(cx, cy, R * (1 + e * 0.06), 0, 6.2832); ctx.fill();
        ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = W * 0.009;
        for (var j = 0; j < 64; j++) {
          var a = j / 64 * 6.2832 - Math.PI / 2 + t * 0.05, len = R * (0.05 + lvl[j] * 0.42);
          var r0 = R * 1.12 + e * R * 0.05;
          ctx.globalAlpha = 0.25 + lvl[j] * 0.75;
          ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len)); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      };
      requestAnimationFrame(frame);
    }
  }

  customElements.define('dna-island', DnaIsland);
  customElements.define('dna-reel', DnaReel);
  customElements.define('dna-coverflow', DnaCoverflow);
  customElements.define('dna-sound', DnaSound);
})();
