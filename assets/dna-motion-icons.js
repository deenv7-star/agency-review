/*!
 * DNA MOTION — web components for hellodna.co.il
 * One file, no dependencies. Add once:
 *   <script src="/assets/dna-motion.js" defer><\/script>
 * Then place any element:
 *   <dna-helix></dna-helix>                 hero: five strands → knot → one helix (loop | scroll)
 *   <dna-orbit></dna-orbit>                 DNA OS: four questions orbiting, a live signal lights each
 *   <dna-process theme="light"></dna-process>  four steps, the line draws as you scroll
 *   <dna-icon type="campaigns"></dna-icon>  campaigns | film | web | brand | sound | automation
 *   <dna-signal></dna-signal>               a small live pulse for labels and CTAs
 * Every element: sizes to its box (CSS width/height or aspect-ratio), renders at
 * device pixel ratio, pauses off-screen, honours prefers-reduced-motion.
 * Brand: INK #0B0B0B · PAPER #F2F0EA · LIME #D9FF43 · Tel Aviv Brutalist / Modernist
 */
(function () {
  'use strict';
  if (!window.customElements || window.__dnaMotion) return;
  window.__dnaMotion = 1;

  var INK = [11, 11, 11], PAPER = [242, 240, 234], LIME = [217, 255, 67], G1 = [119, 115, 107], G2 = [185, 182, 174];
  var FD = '"Tel Aviv Brutalist", "Heebo", Arial, sans-serif';
  var FT = '"Tel Aviv Modernist", "Heebo", Arial, sans-serif';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- math ---------- */
  function clamp(v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function inv(t, a, b) { return clamp((t - a) / (b - a)); }
  function smooth(t) { t = clamp(t); return t * t * (3 - 2 * t); }
  function smoother(t) { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); }
  function expoOut(t) { t = clamp(t); return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function expoInOut(t) { t = clamp(t); if (t === 0 || t === 1) return t; return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2; }
  function backOut(t) { t = clamp(t); var c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  function mixc(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function rgb(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a === undefined ? 1 : clamp(a)) + ')'; }
  function rotY(p, a) { var c = Math.cos(a), s = Math.sin(a); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; }
  function rotX(p, a) { var c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; }
  function mix3(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  /* ==========================================================================
     BASE — canvas, sizing, visibility, scroll progress, pointer, reduced motion
     ========================================================================== */
  function Base() { return Reflect.construct(HTMLElement, [], this.constructor); }
  Base.prototype = Object.create(HTMLElement.prototype);
  Base.prototype.constructor = Base;
  Object.setPrototypeOf(Base, HTMLElement);

  Base.prototype.connectedCallback = function () {
    if (this._init) return; this._init = true;
    var root = this.attachShadow({ mode: 'open' });
    var st = document.createElement('style');
    st.textContent = ':host{display:block;position:relative;' + (this.defaultCSS || '') + '}canvas{position:absolute;inset:0;width:100%;height:100%;display:block}';
    this._cv = document.createElement('canvas');
    this._cv.setAttribute('aria-hidden', 'true');
    root.appendChild(st); root.appendChild(this._cv);
    this._ctx = this._cv.getContext('2d');
    this._t0 = performance.now(); this._vis = false; this._p = 0; this._pS = 0;
    this._ptr = [0, 0]; this._ptrS = [0, 0]; this._hover = 0; this._enter = -1;
    var self = this;
    this._ro = new ResizeObserver(function () { self._resize(); });
    this._ro.observe(this);
    this._io = new IntersectionObserver(function (e) {
      self._vis = e[0].isIntersecting;
      if (self._vis && self._enter < 0) self._enter = self.now();
      if (self._vis) self._kick();
    }, { rootMargin: '80px' });
    this._io.observe(this);
    this.addEventListener('pointermove', function (e) {
      var r = self.getBoundingClientRect();
      self._ptr = [((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1];
    });
    this.addEventListener('pointerleave', function () { self._ptr = [0, 0]; });
    this.addEventListener('pointerenter', function () { self._hoverAt = self.now(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { self._draw(); });
    this._resize();
  };
  Base.prototype.disconnectedCallback = function () { this._vis = false; };
  Base.prototype.now = function () { return (performance.now() - this._t0) / 1000; };
  Base.prototype._resize = function () {
    var r = this.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
    this._w = Math.max(1, r.width); this._h = Math.max(1, r.height);
    this._cv.width = Math.round(this._w * d); this._cv.height = Math.round(this._h * d); this._d = d;
    this._draw();
  };
  Base.prototype._scroll = function () {
    var r = this.getBoundingClientRect(), vh = window.innerHeight || 1;
    return clamp((vh - r.top) / (vh + r.height));
  };
  Base.prototype._kick = function () {
    if (this._raf || REDUCED) { if (REDUCED) this._draw(); return; }
    var self = this;
    var loop = function () {
      self._raf = 0;
      if (!self._vis) return;
      self._draw();
      self._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  };
  Base.prototype._draw = function () {
    if (!this._ctx) return;
    this._p = this._scroll();
    this._pS += (this._p - this._pS) * (REDUCED ? 1 : 0.09);          // inertia, Apple-style
    this._ptrS[0] += (this._ptr[0] - this._ptrS[0]) * 0.06;
    this._ptrS[1] += (this._ptr[1] - this._ptrS[1]) * 0.06;
    var c = this._ctx;
    c.setTransform(this._d, 0, 0, this._d, 0, 0);
    c.clearRect(0, 0, this._w, this._h);
    this.draw(c, this._w, this._h, REDUCED ? (this.staticTime || 0) : this.now());
  };
  Base.prototype.theme = function () {
    var dark = (this.getAttribute('theme') || 'dark') !== 'light';
    return { fg: dark ? PAPER : INK, bg: dark ? INK : PAPER, dim: dark ? G1 : [150, 147, 140], mid: dark ? G2 : [90, 88, 82], dark: dark };
  };
  function define(name, proto, css, staticTime) {
    function C() { return Base.call(this); }
    C.prototype = Object.create(Base.prototype);
    C.prototype.constructor = C;
    Object.setPrototypeOf(C, Base);
    for (var k in proto) C.prototype[k] = proto[k];
    C.prototype.defaultCSS = css;
    C.prototype.staticTime = staticTime;
    if (!customElements.get(name)) customElements.define(name, C);
  }

  /* ==========================================================================
     <dna-process theme="light" mode="scroll|auto" steps="היכרות|אסטרטגיה|הפקה|תוצאות">
     ========================================================================== */
  define('dna-process', {
    draw: function (ctx, w, h, t) {
      var th = this.theme();
      var steps = (this.getAttribute('steps') || 'היכרות|אסטרטגיה|הפקה|תוצאות').split('|');
      var subs = (this.getAttribute('subs') || 'מבינים מה באמת צריך|סוגרים כיוון|עושים|רואים מה קרה').split('|');
      var mode = this.getAttribute('mode') || 'scroll';
      var p = REDUCED ? 1 : mode === 'auto' ? smooth(inv((t % 7), 0.3, 4.8)) : smoother(inv(this._pS, 0.22, 0.62));
      var vertical = w < 560, n = steps.length;
      var pts = [];
      for (var i = 0; i < n; i++) {
        var f = n === 1 ? 0 : i / (n - 1);
        pts.push(vertical ? [w - 40, lerp(46, h - 70, f)] : [lerp(w - 70, 70, f), h * 0.36]);   // RTL: step 1 on the right
      }
      var a = pts[0], b = pts[n - 1];
      ctx.lineCap = 'round';
      ctx.strokeStyle = rgb(th.fg, 0.12); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      var ex = lerp(a[0], b[0], p), ey = lerp(a[1], b[1], p);
      ctx.strokeStyle = th.dark ? rgb(LIME) : rgb(INK); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(ex, ey); ctx.stroke();
      // leading light
      if (p > 0.001 && p < 0.999) {
        var g = ctx.createRadialGradient(ex, ey, 0, ex, ey, 26);
        g.addColorStop(0, rgb(LIME, 0.9)); g.addColorStop(1, rgb(LIME, 0));
        ctx.fillStyle = g; ctx.fillRect(ex - 26, ey - 26, 52, 52);
      }
      for (var j = 0; j < n; j++) {
        var fj = n === 1 ? 0 : j / (n - 1), on = expoOut(inv(p, fj - 0.02, fj + 0.08)), x = pts[j][0], y = pts[j][1];
        ctx.fillStyle = rgb(th.bg); ctx.beginPath(); ctx.arc(x, y, 16, 0, 6.2832); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = rgb(th.fg, 0.25); ctx.stroke();
        if (on > 0) {
          ctx.fillStyle = rgb(LIME); ctx.beginPath(); ctx.arc(x, y, 16 * backOut(on), 0, 6.2832); ctx.fill();
          if (!th.dark) { ctx.lineWidth = 2; ctx.strokeStyle = rgb(INK); ctx.stroke(); }
        }
        ctx.font = '700 12px ' + FT; ctx.direction = 'ltr'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = on > 0.5 ? rgb(INK) : rgb(th.fg, 0.55);
        ctx.fillText('0' + (j + 1), x, y + 1);
        ctx.direction = 'rtl'; ctx.textBaseline = 'alphabetic';
        var rise = (1 - on) * 14, al = lerp(0.35, 1, on);
        if (vertical) {
          ctx.textAlign = 'right';
          ctx.font = '700 26px ' + FD; ctx.fillStyle = rgb(th.fg, al); ctx.fillText(steps[j], x - 36, y + 4 + rise);
          ctx.font = '400 16px ' + FT; ctx.fillStyle = rgb(th.mid, al); ctx.fillText(subs[j] || '', x - 36, y + 28 + rise);
        } else {
          ctx.textAlign = 'center';
          ctx.font = '700 ' + Math.min(30, w / 26) + 'px ' + FD; ctx.fillStyle = rgb(th.fg, al); ctx.fillText(steps[j], x, y + 62 + rise);
          ctx.font = '400 ' + Math.min(17, w / 48) + 'px ' + FT; ctx.fillStyle = rgb(th.mid, al); ctx.fillText(subs[j] || '', x, y + 92 + rise);
        }
      }
    }
  }, 'width:100%;height:230px}@media (max-width:600px){:host{height:400px}', 0);

  /* ==========================================================================
     <dna-icon type="campaigns|film|web|brand|sound|automation" theme="dark">
     Lines draw on when first seen, then a small idle behaviour; hover replays.
     ========================================================================== */
  function part(ctx, prim, f) {                             // draw a primitive up to fraction f
    if (f <= 0) return;
    ctx.beginPath();
    if (prim[0] === 'l') { ctx.moveTo(prim[1], prim[2]); ctx.lineTo(lerp(prim[1], prim[3], f), lerp(prim[2], prim[4], f)); }
    else if (prim[0] === 'a') { ctx.arc(prim[1], prim[2], prim[3], prim[4], lerp(prim[4], prim[5], f)); }
    else if (prim[0] === 'p') {
      var P = prim[1].slice(); if (prim[2]) P.push(P[0]);
      var L = 0, seg = [];
      for (var i = 1; i < P.length; i++) { var d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(d); L += d; }
      var want = L * f; ctx.moveTo(P[0][0], P[0][1]);
      for (var k = 1; k < P.length && want > 0; k++) {
        var e = Math.min(1, want / seg[k - 1]);
        ctx.lineTo(lerp(P[k - 1][0], P[k][0], e), lerp(P[k - 1][1], P[k][1], e)); want -= seg[k - 1];
      }
    }
    ctx.stroke();
  }
  function rrPts(x, y, w, h, r) {
    var P = [], q = 6;
    [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]].forEach(function (c) {
      for (var i = 0; i <= q; i++) { var a = c[2] + i / q * Math.PI / 2; P.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); }
    });
    return P;
  }
  var ICONS = {
    campaigns: {
      prims: [['p', [[24, 42], [60, 26], [60, 74], [24, 58]], 1], ['p', [[24, 43], [16, 43], [16, 57], [24, 57]], 0], ['p', [[30, 60], [34, 76], [42, 76], [39, 63]], 0]],
      idle: function (ctx, t, c) {
        for (var i = 0; i < 3; i++) {
          var ph = ((t * 0.9 - i * 0.22) % 1 + 1) % 1, a = Math.sin(ph * Math.PI);
          ctx.strokeStyle = rgb(LIME, a); ctx.beginPath(); ctx.arc(60, 50, 12 + i * 9 + ph * 4, -0.55, 0.55); ctx.stroke();
        }
      }
    },
    film: {
      prims: [['p', rrPts(16, 24, 68, 52, 10), 1], ['p', [[44, 38], [62, 50], [44, 62]], 1]],
      idle: function (ctx, t, c) {
        var k = 1 + 0.08 * Math.sin(t * 3);
        ctx.save(); ctx.translate(51, 50); ctx.scale(k, k); ctx.translate(-51, -50);
        ctx.fillStyle = rgb(LIME, 0.9); ctx.beginPath(); ctx.moveTo(44, 38); ctx.lineTo(62, 50); ctx.lineTo(44, 62); ctx.closePath(); ctx.fill(); ctx.restore();
        ctx.save(); ctx.beginPath(); ctx.rect(20, 26, 60, 48); ctx.clip();
        ctx.fillStyle = rgb(c, 0.5);
        for (var i = -1; i < 7; i++) { var x = 20 + ((i * 11 + t * 14) % 77); ctx.fillRect(x, 28, 5, 4); ctx.fillRect(x, 68, 5, 4); }
        ctx.restore();
      }
    },
    web: {
      prims: [['p', rrPts(14, 22, 72, 56, 8), 1], ['l', 14, 34, 86, 34], ['l', 24, 46, 70, 46], ['l', 24, 55, 58, 55]],
      idle: function (ctx, t, c) {
        ctx.fillStyle = rgb(c, 0.6);
        [22, 29, 36].forEach(function (x) { ctx.beginPath(); ctx.arc(x, 28, 1.8, 0, 6.2832); ctx.fill(); });
        var cyc = t % 3.2, click = inv(cyc, 1.6, 2.2);
        rr(ctx, 24, 62, 24, 9, 4.5); ctx.fillStyle = rgb(LIME, 0.35 + 0.65 * (cyc > 1.6 ? 1 : 0)); ctx.fill();
        var mx = lerp(74, 38, smooth(inv(cyc, 0.2, 1.5))), my = lerp(74, 67, smooth(inv(cyc, 0.2, 1.5)));
        if (click > 0 && click < 1) { ctx.strokeStyle = rgb(LIME, 1 - click); ctx.beginPath(); ctx.arc(36, 66.5, 4 + click * 10, 0, 6.2832); ctx.stroke(); }
        ctx.fillStyle = rgb(c); ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx, my + 11); ctx.lineTo(mx + 3, my + 8); ctx.lineTo(mx + 7, my + 9); ctx.closePath(); ctx.fill();
      }
    },
    brand: {
      prims: [['p', [[50, 16], [66, 44], [58, 58], [42, 58], [34, 44]], 1], ['l', 50, 16, 50, 40], ['p', [[40, 64], [60, 64], [60, 72], [40, 72]], 1]],
      idle: function (ctx, t, c) {
        ctx.fillStyle = rgb(c); ctx.beginPath(); ctx.arc(50, 44, 3, 0, 6.2832); ctx.fill();
        var cyc = (t % 3) / 3, e = smooth(inv(cyc, 0.05, 0.75)), fa = 1 - smooth(inv(cyc, 0.8, 1));
        ctx.strokeStyle = rgb(LIME, fa); ctx.beginPath();
        for (var i = 0; i <= 40 * e; i++) { var u = i / 40, x = 16 + u * 68, y = 86 + Math.sin(u * 12) * 4 * (1 - u * 0.5); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
        ctx.stroke();
      }
    },
    sound: {
      prims: [],
      idle: function (ctx, t, c, d) {
        for (var i = 0; i < 7; i++) {
          var x = 23 + i * 9, amp = 0.35 + 0.65 * Math.abs(Math.sin(t * (2.1 + i * 0.37) + i * 1.3)) * (1 - Math.abs(i - 3) * 0.12);
          var hh = 50 * amp * d;
          ctx.strokeStyle = i === 3 ? rgb(LIME) : rgb(c);
          ctx.beginPath(); ctx.moveTo(x, 50 - hh / 2); ctx.lineTo(x, 50 + hh / 2); ctx.stroke();
        }
      }
    },
    automation: {
      prims: [['a', 26, 32, 9, 0, 6.2832], ['a', 74, 32, 9, 0, 6.2832], ['a', 50, 72, 9, 0, 6.2832], ['l', 35, 32, 65, 32], ['l', 70, 40, 55, 64], ['l', 45, 64, 30, 40]],
      idle: function (ctx, t, c) {
        var N = [[26, 32], [74, 32], [50, 72]], u = (t * 0.55) % 3, k = Math.floor(u), f = smooth(u - k);
        var A = N[k], Bn = N[(k + 1) % 3];
        var x = lerp(A[0], Bn[0], f), y = lerp(A[1], Bn[1], f);
        var g = ctx.createRadialGradient(x, y, 0, x, y, 10); g.addColorStop(0, rgb(LIME, 0.9)); g.addColorStop(1, rgb(LIME, 0));
        ctx.fillStyle = g; ctx.fillRect(x - 10, y - 10, 20, 20);
        ctx.fillStyle = rgb(LIME); ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 6.2832); ctx.fill();
        var hit = 1 - inv(u - k, 0, 0.35);
        ctx.fillStyle = rgb(LIME, 0.9 * hit); ctx.beginPath(); ctx.arc(A[0], A[1], 5, 0, 6.2832); ctx.fill();
      }
    }
  };
  define('dna-icon', {
    draw: function (ctx, w, h, t) {
      var th = this.theme(), ic = ICONS[this.getAttribute('type') || 'campaigns'] || ICONS.campaigns;
      var s = Math.min(w, h) / 100;
      ctx.save(); ctx.translate((w - 100 * s) / 2, (h - 100 * s) / 2); ctx.scale(s, s);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 4.2;
      var start = Math.max(this._enter < 0 ? 1e9 : this._enter, -1);
      var d = REDUCED ? 1 : expoOut(inv(t, start + 0.05, start + 1.1));
      ctx.strokeStyle = rgb(th.fg);
      for (var i = 0; i < ic.prims.length; i++) part(ctx, ic.prims[i], clamp(d * 1.25 - i * 0.08));
      if (d > 0.6 || !ic.prims.length) { ctx.save(); ctx.globalAlpha = ic.prims.length ? inv(d, 0.6, 1) : 1; ic.idle(ctx, 0, th.fg, ic.prims.length ? 1 : Math.max(0.05, d)); ctx.restore(); }
      ctx.restore();
    }
  }, 'width:96px;height:96px', 1);

})();
