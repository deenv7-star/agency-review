/* ============================================================================
   DNA ABOUT — set 5. "מי אנחנו. ולמה זה בנוי אחרת."
     <dna-relay></dna-relay>                     scroll story: five separate vendors → one table
     <dna-lit><p>…</p></dna-lit>                 words light up as you read (light DOM, keeps site styles)
     <dna-founders src alt>
        <div data-x data-y data-name data-role>bio</div> …
     </dna-founders>                             photo hotspots that open into cards
   All copy is taken from hellodna.co.il and can be overridden with attributes.
   ========================================================================== */
(function () {
  'use strict';
  if (!window.customElements || window.__dnaAbout) return; window.__dnaAbout = 1;
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LIME = '#D9FF43';
  var FD = '"Tel Aviv Brutalist","Heebo",Arial,sans-serif', FT = '"Tel Aviv Modernist","Heebo",Arial,sans-serif';
  var EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function inv(v, a, b) { return clamp((v - a) / (b - a), 0, 1); }
  function sm(t) { t = clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); }
  function eo(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function attr(el, n, d) { var v = el.getAttribute(n); return v == null || v === '' ? d : v; }

  /* =========================================================================
     <dna-relay>  —  the idea:
     Act 1 "בדרך כלל": your brief is handed from vendor to vendor. At every
     handoff it waits, and a little of it gets lost (broken telephone).
     Act 2: the five pieces pull together into one ring around the founders,
     and the winding line straightens.
     Act 3 "אצלנו": the same brief goes straight to the table and arrives whole.
     ======================================================================= */
  var VENDORS = ['אסטרטגיה', 'קריאייטיב', 'מדיה', 'אתרים', 'אוטומציות'];
  var MSG = 'מה העסק צריך';
  // deterministic "broken telephone": which letters get lost at each handoff
  var LOSS = [[3], [3, 9], [0, 3, 9], [0, 3, 6, 9, 11], [0, 1, 3, 5, 6, 9, 11]];
  var NOISE = 'ךםןףץ';

  var relayCSS = [
    ':host{display:block;position:relative;color:#fff;font-family:' + FT + ';direction:rtl;--lime:' + LIME + '}',
    '.track{position:relative;height:200vh}@media (max-width:760px){.track{height:360svh}}',
    '.stage{position:sticky;top:0;height:100vh;height:100svh;overflow:hidden;display:grid;grid-template-rows:auto 1fr auto;padding:clamp(145px,19vh,185px) max(clamp(20px,5vw,72px),calc((100vw - 1280px) / 2)) clamp(26px,5vh,54px);box-sizing:border-box}',
    'header{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap}',
    '.meta{font:700 11px/1 ' + FT + ';letter-spacing:.16em;color:rgba(255,255,255,.5);margin-bottom:14px}',
    'h2{margin:0;font:700 clamp(40px,5.6vw,84px)/.98 ' + FD + ';letter-spacing:-.03em}',
    'h2 em{display:block;font-style:normal;color:var(--lime)}',
    /* segmented control */
    '.seg{position:relative;display:inline-grid;grid-auto-flow:column;grid-auto-columns:1fr;padding:4px;border-radius:999px;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1px rgba(255,255,255,.1)}',
    '.seg button{position:relative;z-index:1;appearance:none;border:0;background:none;color:rgba(255,255,255,.62);font:700 14px/1 ' + FT + ';padding:12px 20px;border-radius:999px;cursor:pointer;transition:color .3s ' + EASE + ';-webkit-tap-highlight-color:transparent}',
    '.seg button[aria-pressed=true]{color:#0b0b0b}',
    '.seg button:focus-visible{outline:2px solid var(--lime);outline-offset:2px}',
    '.thumb{position:absolute;top:4px;bottom:4px;right:4px;width:calc(50% - 4px);border-radius:999px;background:var(--lime);box-shadow:0 6px 20px rgba(217,255,67,.25);transition:transform .5s ' + EASE + '}',
    '.seg[data-s="1"] .thumb{transform:translateX(-100%)}',
    /* scene */
    '.scene{position:relative;min-height:0}',
    'svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}',
    '.node{position:absolute;left:0;top:0;will-change:transform;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;min-width:112px;padding:12px 18px;box-sizing:border-box;border-radius:16px;background:#171717;box-shadow:inset 0 0 0 1px rgba(255,255,255,.13);font:700 15px/1 ' + FT + ';color:#d9d9d9;white-space:nowrap}',
    '.node small{font:700 10px/1 ' + FT + ';letter-spacing:.12em;color:rgba(255,255,255,.62);direction:ltr}',
    '.node .ring{position:absolute;inset:-1px;border-radius:inherit;box-shadow:inset 0 0 0 1.5px var(--lime);opacity:0}',
    '.node .dots{position:absolute;top:-9px;left:-9px;display:flex;gap:3px;padding:6px 7px;border-radius:999px;background:#2a2a2a;opacity:0;transform:scale(.6)}',
    '.node .dots i{width:4px;height:4px;border-radius:50%;background:#bbb;animation:dt 1s infinite}',
    '.node .dots i:nth-child(2){animation-delay:.15s}.node .dots i:nth-child(3){animation-delay:.3s}',
    '@keyframes dt{0%,60%,100%{opacity:.35}30%{opacity:1}}',
    '.client{position:absolute;left:0;top:0;will-change:transform;display:flex;align-items:center;gap:8px;padding:11px 16px;border-radius:999px;background:#fff;color:#0b0b0b;font:700 14px/1 ' + FT + ';white-space:nowrap}',
    '.client b{width:8px;height:8px;border-radius:50%;background:#0b0b0b}',
    '.msg{position:absolute;left:0;top:0;will-change:transform,opacity,filter;padding:9px 14px;border-radius:999px;background:var(--lime);color:#0b0b0b;font:700 14px/1 ' + FT + ';white-space:nowrap;box-shadow:0 8px 24px rgba(217,255,67,.28)}',
    '.msg span{display:inline-block}',
    '.center{position:absolute;left:0;top:0;will-change:transform,opacity;display:flex;flex-direction:column;align-items:center;gap:10px;pointer-events:none}',
    '.faces{display:flex;direction:ltr}',
    '.faces img{width:var(--fs,64px);height:var(--fs,64px);border-radius:50%;object-fit:cover;box-shadow:0 0 0 3px #0b0b0b;background:#222}',
    '.faces img+img{margin-left:calc(var(--fs,64px) * -0.22)}',
    '.center .who{font:700 13px/1.2 ' + FT + ';color:#fff;text-align:center}',
    '.center .who span{display:block;margin-top:5px;font-weight:400;font-size:11px;letter-spacing:.06em;color:rgba(255,255,255,.55)}',
    '.pulse{position:absolute;left:50%;top:calc(var(--fs,64px) / 2);width:calc(var(--fs,64px) * 1.9);height:calc(var(--fs,64px) * 1.9);margin:calc(var(--fs,64px) * -0.95) 0 0 calc(var(--fs,64px) * -0.95);border-radius:50%;box-shadow:0 0 0 2px var(--lime);opacity:0}',
    /* captions */
    '.caps{position:relative;min-height:clamp(78px,11vh,104px)}',
    '.cap{position:absolute;inset:0 0 auto 0;opacity:0;transform:translateY(10px);transition:opacity .45s ' + EASE + ',transform .45s ' + EASE + '}',
    '.cap.on{opacity:1;transform:none}',
    '.cap small{display:block;font:700 11px/1 ' + FT + ';letter-spacing:.16em;color:rgba(255,255,255,.5);margin-bottom:10px}',
    '.cap p{margin:0;max-width:760px;font:700 clamp(22px,2.6vw,36px)/1.2 ' + FD + ';letter-spacing:-.02em;text-wrap:balance}',
    '.cap em{font-style:normal;color:var(--lime)}',
    '@media (min-width:1100px){.node{font-size:16px;padding:14px 22px}.client{font-size:15px;padding:12px 18px}.msg{font-size:15px}}@media (max-width:640px){.center .who span{display:none}.stage{padding-top:135px}.node{min-width:0;padding:9px 12px;font-size:13px;border-radius:13px}.node small{font-size:9.5px}.client{padding:9px 13px;font-size:13px}.msg{font-size:12.5px;padding:8px 12px}.seg button{padding:10px 16px;font-size:13px}header{gap:14px}}',
    ':host([data-rm]) .track{height:auto}:host([data-rm]) .stage{position:relative;height:auto;min-height:760px}'
  ].join('');

  function DnaRelay() { return Reflect.construct(HTMLElement, [], DnaRelay); }
  DnaRelay.prototype = Object.create(HTMLElement.prototype);
  DnaRelay.prototype.constructor = DnaRelay;
  Object.setPrototypeOf(DnaRelay, HTMLElement);
  DnaRelay.prototype.connectedCallback = function () {
    if (this._ready) return; this._ready = 1;
    var self = this, root = this.attachShadow({ mode: 'open' });
    var vendors = attr(this, 'data-vendors', VENDORS.join(',')).split(',');
    this._n = vendors.length;
    var a = attr(this, 'data-avatar-a', 'media/about/deen.webp'), b = attr(this, 'data-avatar-b', 'media/about/noa.webp');
    var caps = [
      [attr(this, 'data-cap1-label', 'ככה זה בנוי בדרך כלל'), attr(this, 'data-cap1', 'רעיון, קריאייטיב, טכנולוגיה ופרסום חיים בנפרד.')],
      [attr(this, 'data-cap2-label', 'ככה זה בנוי אצלנו'), attr(this, 'data-cap2', 'בלי להעביר אתכם בין חמישה ספקים.')],
      [attr(this, 'data-cap3-label', 'ככה זה בנוי אצלנו'), attr(this, 'data-cap3', 'עובדים יחד סביב מטרה אחת: <em>להזיז את העסק קדימה.</em>')]
    ];
    var html = '<style>' + relayCSS + '</style><div class="track" part="track"><div class="stage">' +
      '<header>' + (this.hasAttribute('no-title') ? '<span></span>' :
        '<div><div class="meta">' + esc(attr(this, 'data-meta', 'DNA / עלינו')) + '</div><h2>' + esc(attr(this, 'data-title', 'מי אנחנו.')) + '<em>' + esc(attr(this, 'data-title2', 'ולמה זה בנוי אחרת.')) + '</em></h2></div>') +
      '<div class="seg" role="group" aria-label="השוואה"><i class="thumb"></i><button type="button" aria-pressed="true">' + esc(attr(this, 'data-seg1', 'בדרך כלל')) + '</button><button type="button" aria-pressed="false">' + esc(attr(this, 'data-seg2', 'אצלנו')) + '</button></div></header>' +
      '<div class="scene" aria-hidden="true"><svg><circle class="orbit" fill="none" stroke="' + LIME + '" stroke-width="1.2"/>' +
      '<path class="p-old" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="1.5" stroke-dasharray="3 7" stroke-linecap="round"/>' +
      '<path class="p-new" fill="none" stroke="' + LIME + '" stroke-width="2" stroke-linecap="round"/></svg>' +
      '<div class="center"><div class="faces"><img alt="" src="' + esc(a) + '"><img alt="" src="' + esc(b) + '"></div><i class="pulse"></i><div class="who">' + esc(attr(this, 'data-founders', 'דין & נועה')) + '<span>' + esc(attr(this, 'data-founders-sub', 'עובדים ישירות עם המייסדים.')) + '</span></div></div>' +
      vendors.map(function (v, i) { return '<div class="node"><i class="ring"></i><i class="dots"><i></i><i></i><i></i></i><small>' + (attr(self, 'data-vendor-tag', 'VENDOR') + ' 0' + (i + 1)) + '</small>' + esc(v) + '</div>'; }).join('') +
      '<div class="client"><b></b>' + esc(attr(this, 'data-client', 'העסק שלכם')) + '</div>' +
      '<div class="msg">' + esc(attr(this, 'data-msg', MSG)) + '</div></div>' +
      '<div class="caps" aria-live="polite">' + caps.map(function (c) { return '<div class="cap"><small>' + esc(c[0]) + '</small><p>' + c[1] + '</p></div>'; }).join('') + '</div>' +
      '</div></div>';
    root.innerHTML = html;
    var $ = function (s) { return root.querySelector(s); }, $$ = function (s) { return [].slice.call(root.querySelectorAll(s)); };
    this._el = { track: $('.track'), scene: $('.scene'), svg: $('svg'), orbit: $('.orbit'), pOld: $('.p-old'), pNew: $('.p-new'),
      nodes: $$('.node'), smalls: $$('.node small'), rings: $$('.node .ring'), dots: $$('.node .dots'), client: $('.client'), msg: $('.msg'), center: $('.center'),
      pulse: $('.pulse'), faces: $('.faces'), caps: $$('.cap'), seg: $('.seg'), segB: $$('.seg button') };
    this._msgText = attr(this, 'data-msg', MSG);
    this._lossStep = -1;
    this._p = 0; this._pv = 0; this._pt = 0;
    if (RM) this.setAttribute('data-rm', '');
    this._el.segB.forEach(function (btn, i) { btn.addEventListener('click', function () { self.go(i); }); });
    this._ro = new ResizeObserver(function () { self._measure(); self._render(self._p); });
    this._ro.observe(this._el.scene);
    this._onScroll = function () { self._target(); self._kick(); };
    addEventListener('scroll', this._onScroll, { passive: true });
    addEventListener('resize', this._onScroll);
    this._measure(); this._target(); this._p = this._pt; this._render(this._p);
  };
  DnaRelay.prototype.disconnectedCallback = function () {
    removeEventListener('scroll', this._onScroll); removeEventListener('resize', this._onScroll);
    if (this._ro) this._ro.disconnect(); cancelAnimationFrame(this._raf);
  };
  DnaRelay.prototype.go = function (i) {
    // segmented control: jump to "usually" (end of act 1) or "ours" (end of act 3)
    var want = i ? 0.95 : 0.40;
    if (RM) { this._pt = this._p = want; this._render(want); return; }
    var r = this._el.track.getBoundingClientRect(), span = r.height - (this._el.track.firstChild.offsetHeight || innerHeight);
    scrollTo({ top: scrollY + r.top + span * want, behavior: 'smooth' });
  };
  DnaRelay.prototype._target = function () {
    if (RM) return;
    var r = this._el.track.getBoundingClientRect(), span = r.height - (this._el.track.firstChild.offsetHeight || innerHeight);
    this._pt = span > 0 ? clamp(-r.top / span, 0, 1) : 1;
  };
  DnaRelay.prototype._kick = function () {
    var self = this; if (this._raf) return;
    var last = performance.now();
    var tick = function (now) {
      var dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
      // Time-based smoothing remains stable even if a background tab drops frames.
      var k = 1 - Math.exp(-dt * (innerWidth < 760 ? 7 : 12));
      self._p = clamp(self._p + (self._pt - self._p) * k, 0, 1);
      if (Math.abs(self._p - self._pt) < 0.0004) { self._p = self._pt; self._raf = 0; self._render(self._p); return; }
      self._render(self._p); self._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  };
  DnaRelay.prototype._measure = function () {
    var e = this._el, w = e.scene.clientWidth, h = e.scene.clientHeight, n = this._n;
    var port = w < h * 1.05, L = {};
    L.w = w; L.h = h; L.port = port;
    L.sizes = e.nodes.map(function (el) { return [el.offsetWidth, el.offsetHeight]; });
    L.cs = [e.client.offsetWidth, e.client.offsetHeight];
    L.ms = [e.msg.offsetWidth, e.msg.offsetHeight];
    var i, pts = [], ring = [];
    if (!port) {
      var pad = Math.max(70, w * 0.06);
      L.client = [w - pad, h * 0.5];
      for (i = 0; i < n; i++) {
        var t = (i + 1) / (n + 0.35);
        pts.push([lerp(w - pad, pad * 0.9, t), h * 0.5 + (i % 2 ? 1 : -1) * h * 0.27 + (i === 2 ? h * 0.05 : 0)]);
      }
      L.c = [w * 0.42, h * 0.5];
      L.R = Math.min(h * 0.37, w * 0.2);
    } else {
      var top = Math.max(26, h * 0.05) + (L.ms[1] || 30) + 8;
      L.client = [w * 0.5, top];
      for (i = 0; i < n; i++) pts.push([w * 0.5 + (i % 2 ? 1 : -1) * w * 0.24, lerp(top + h * 0.16, h * 0.93, i / (n - 1))]);
      L.c = [w * 0.5, h * 0.58];
      L.R = Math.min(w * 0.33, h * 0.3);
    }
    // the straight line enters the ring from the client side; put the gap between two pills there
    L.a0 = (port ? -Math.PI / 2 : 0) + Math.PI / n;
    for (i = 0; i < n; i++) {
      var ang = L.a0 + i * 2 * Math.PI / n;
      ring.push([L.c[0] + Math.cos(ang) * L.R, L.c[1] + Math.sin(ang) * L.R]);
    }
    L.pts = pts; L.ring = ring;
    L.fs = port ? Math.round(clamp(w * 0.13, 44, 60)) : Math.round(clamp(h * 0.12, 54, 76));
    this._el.center.style.setProperty('--fs', L.fs + 'px');
    this._L = L;
  };
  // Catmull-Rom → cubic Bézier through points
  function crSegs(P) {
    var s = [];
    for (var i = 0; i < P.length - 1; i++) {
      var p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      s.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]);
    }
    return s;
  }
  function bez(s, t) {
    var u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * s[0][0] + b * s[1][0] + c * s[2][0] + d * s[3][0], a * s[0][1] + b * s[1][1] + c * s[2][1] + d * s[3][1]];
  }
  function dOf(S) {
    if (!S.length) return '';
    var d = 'M' + S[0][0][0].toFixed(1) + ' ' + S[0][0][1].toFixed(1);
    S.forEach(function (s) { d += 'C' + [s[1], s[2], s[3]].map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' '); });
    return d;
  }
  function place(el, x, y, sx, sy, extra) {
    el.style.transform = 'translate(' + (x - sx / 2).toFixed(1) + 'px,' + (y - sy / 2).toFixed(1) + 'px)' + (extra || '');
  }
  DnaRelay.prototype._setLoss = function (k) {
    if (k === this._lossStep) return; this._lossStep = k;
    var txt = this._msgText.split(''), lost = k >= 0 ? LOSS[Math.min(k, LOSS.length - 1)] : [];
    this._el.msg.innerHTML = txt.map(function (ch, i) {
      if (lost.indexOf(i) >= 0 && ch !== ' ') return '<span style="opacity:.35;filter:blur(1.2px)">' + NOISE[i % NOISE.length] + '</span>';
      return esc(ch);
    }).join('');
  };
  DnaRelay.prototype._render = function (p) {
    var L = this._L, e = this._el, n = this._n, i; if (!L || !L.w) return;
    // ---- timeline ----
    var A = inv(p, 0.04, 0.40);          // act 1: brief travels vendor → vendor
    var m = sm(inv(p, 0.47, 0.70));      // act 2: everything pulls together
    var C = inv(p, 0.73, 0.90);          // act 3: brief goes straight to the table
    var spin = (p - 0.7) * 0.5;          // slow drift of the ring while you scroll
    // ---- path geometry ----
    var Pold = [L.client].concat(L.pts), Snew = [], Pnew = [];
    for (i = 0; i <= n; i++) Pnew.push([lerp(L.client[0], L.c[0], i / n), lerp(L.client[1], L.c[1], i / n)]);
    var Pm = Pold.map(function (pt, i) { return [lerp(pt[0], Pnew[i][0], m), lerp(pt[1], Pnew[i][1], m)]; });
    var S = crSegs(Pm); var d = dOf(S);
    e.pOld.setAttribute('d', d); e.pOld.style.opacity = (1 - m).toFixed(3);
    Snew = crSegs(Pnew);
    var len = Math.hypot(L.c[0] - L.client[0], L.c[1] - L.client[1]);
    e.pNew.setAttribute('d', 'M' + L.client[0].toFixed(1) + ' ' + L.client[1].toFixed(1) + 'L' + L.c[0].toFixed(1) + ' ' + L.c[1].toFixed(1));
    e.pNew.style.strokeDasharray = len.toFixed(1) + ' ' + (len + 10).toFixed(1);
    e.pNew.style.strokeDashoffset = (len * (1 - eo(C))).toFixed(1);
    e.pNew.style.opacity = m.toFixed(3);
    // orbit ring draws in with the merge
    var circ = 2 * Math.PI * L.R;
    e.orbit.setAttribute('cx', L.c[0]); e.orbit.setAttribute('cy', L.c[1]); e.orbit.setAttribute('r', L.R);
    e.orbit.style.strokeDasharray = circ.toFixed(1); e.orbit.style.strokeDashoffset = (circ * (1 - m)).toFixed(1);
    e.orbit.style.opacity = (0.28 + 0.5 * sm(inv(p, 0.88, 0.95))).toFixed(3);
    e.orbit.style.transformOrigin = L.c[0] + 'px ' + L.c[1] + 'px';
    e.orbit.style.transform = 'rotate(' + (-90 + spin * 60) + 'deg)';
    // ---- client ----
    place(e.client, L.client[0], L.client[1], L.cs[0], L.cs[1]);
    // ---- vendors ----
    var seg = n, perSeg = 1 / seg, sIdx = Math.min(seg - 1, Math.floor(A / perSeg)), local = (A - sIdx * perSeg) / perSeg;
    var travel = eo(inv(local, 0, 0.55)), dwell = local > 0.55 && A < 1 ? 1 : 0;
    var arrived = A >= 1 ? n - 1 : (travel >= 1 ? sIdx : sIdx - 1);
    for (i = 0; i < n; i++) {
      var ang = L.a0 + i * 2 * Math.PI / n + spin * 0.35 * m;
      var rx = L.c[0] + Math.cos(ang) * L.R, ry = L.c[1] + Math.sin(ang) * L.R;
      var x = lerp(L.pts[i][0], rx, m), y = lerp(L.pts[i][1], ry, m);
      var rot = (i % 2 ? 2.5 : -3) * (1 - m) + Math.sin(i * 1.7) * 1.2 * (1 - m);
      place(e.nodes[i], x, y, L.sizes[i][0], L.sizes[i][1], ' rotate(' + rot.toFixed(2) + 'deg)');
      e.smalls[i].style.opacity = (1 - m).toFixed(3);
      var hit = (i === sIdx && dwell) ? 1 : 0;
      e.dots[i].style.opacity = hit * (1 - m);
      e.dots[i].style.transform = 'scale(' + (hit ? 1 : 0.6) + ')';
      e.dots[i].style.transition = 'opacity .25s ' + EASE + ',transform .35s ' + EASE;
      e.rings[i].style.opacity = (0.35 * m + 0.65 * sm(inv(p, 0.88, 0.94)) * m).toFixed(3);
      e.nodes[i].style.color = m > 0.5 ? '#fff' : '#d9d9d9';
    }
    // ---- center (founders) ----
    var cs = lerp(0.7, 1, eo(inv(p, 0.55, 0.75))), co = sm(inv(p, 0.55, 0.72));
    var arr = inv(p, 0.88, 0.97);
    e.center.style.opacity = co.toFixed(3);
    var ch = e.center.offsetHeight, cw = e.center.offsetWidth;
    e.center.style.transform = 'translate(' + (L.c[0] - cw / 2).toFixed(1) + 'px,' + (L.c[1] - L.fs / 2).toFixed(1) + 'px) scale(' + (cs * (1 + 0.05 * Math.sin(Math.PI * arr))).toFixed(4) + ')';
    e.center.style.transformOrigin = '50% ' + (L.fs / 2) + 'px';
    e.pulse.style.opacity = (Math.sin(Math.PI * arr) * 0.9).toFixed(3);
    e.pulse.style.transform = 'scale(' + (0.7 + 0.6 * arr).toFixed(3) + ')';
    // ---- the brief ----
    var mx, my, mo, blur = 0, scale = 1, bg = LIME;
    if (p < 0.47) {
      if (A <= 0) { mx = L.client[0]; my = L.client[1]; mo = inv(p, 0.0, 0.04); this._setLoss(-1); }
      else {
        var pt = bez(S[sIdx], travel); mx = pt[0]; my = pt[1]; mo = 1;
        this._setLoss(arrived);
        blur = Math.max(0, arrived) * 0.35;
      }
      mo *= 1 - inv(p, 0.42, 0.47);
      var fade = Math.max(0, arrived + 1) / n;
      bg = 'rgb(' + Math.round(lerp(217, 120, fade)) + ',' + Math.round(lerp(255, 120, fade)) + ',' + Math.round(lerp(67, 110, fade)) + ')';
      var nh = L.sizes[0][1], off = L.port ? [0, -(nh / 2 + L.ms[1] / 2 + 4)] : [0, -(nh / 2 + L.ms[1] / 2 + 6)];
      mx += off[0]; my += off[1];
    } else {
      this._setLoss(-1);
      var t = eo(C);
      mx = lerp(L.client[0], L.c[0], t); my = lerp(L.client[1], L.c[1], t);
      if (!L.port) my -= 0; else mx += 0;
      mo = inv(p, 0.72, 0.75) * (1 - inv(p, 0.87, 0.9));
      scale = lerp(1, 0.6, inv(p, 0.86, 0.9));
    }
    e.msg.style.background = bg;
    e.msg.style.opacity = mo.toFixed(3);
    e.msg.style.filter = blur ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';
    place(e.msg, mx, my, L.ms[0], L.ms[1], ' scale(' + scale.toFixed(3) + ')');
    // ---- captions + segmented control ----
    var ci = p < 0.46 ? 0 : p < 0.80 ? 1 : 2;
    if (ci !== this._ci) {
      this._ci = ci;
      e.caps.forEach(function (c, k) { c.classList.toggle('on', k === ci); });
      e.seg.setAttribute('data-s', ci ? '1' : '0');
      e.segB.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === (ci ? 1 : 0))); });
    }
  };
  customElements.define('dna-relay', DnaRelay);

  /* =========================================================================
     <dna-lit> — text that lights up word by word as it passes the reading line
     ======================================================================= */
  function DnaLit() { return Reflect.construct(HTMLElement, [], DnaLit); }
  DnaLit.prototype = Object.create(HTMLElement.prototype);
  DnaLit.prototype.constructor = DnaLit;
  Object.setPrototypeOf(DnaLit, HTMLElement);
  DnaLit.prototype.connectedCallback = function () {
    if (this._ready) return; this._ready = 1;
    var self = this, words = [];
    if (!document.getElementById('dna-lit-css')) {
      var st = document.createElement('style'); st.id = 'dna-lit-css';
      st.textContent = 'dna-lit{display:block}dna-lit .lw{opacity:var(--lit-off,.2);transition:opacity .5s ' + EASE + '}dna-lit .lw.on{opacity:1}';
      document.head.appendChild(st);
    }
    if (RM) return;
    var walk = function (node) {
      [].slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parts = c.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            var s = document.createElement('span'); s.className = 'lw'; s.textContent = w; frag.appendChild(s); words.push(s);
          });
          c.parentNode.replaceChild(frag, c);
        } else if (c.nodeType === 1 && !/^(FOOTER|SCRIPT|STYLE)$/.test(c.tagName)) walk(c);
      });
    };
    walk(this);
    this._w = words; this._on = -1;
    this._f = function () { if (!self._q) { self._q = 1; requestAnimationFrame(function () { self._q = 0; self._upd(); }); } };
    addEventListener('scroll', this._f, { passive: true }); addEventListener('resize', this._f);
    this._upd();
  };
  DnaLit.prototype.disconnectedCallback = function () { removeEventListener('scroll', this._f); removeEventListener('resize', this._f); };
  DnaLit.prototype._upd = function () {
    var r = this.getBoundingClientRect(), vh = innerHeight;
    // starts when the block's top reaches 85% of the screen, done when its bottom reaches 55%
    var start = vh * 0.85, end = vh * 0.62;
    var p = clamp((start - r.top) / ((start - end) + r.height), 0, 1);
    var k = Math.round(p * this._w.length);
    if (k === this._on) return; this._on = k;
    for (var i = 0; i < this._w.length; i++) this._w[i].classList.toggle('on', i < k);
  };
  customElements.define('dna-lit', DnaLit);

  /* =========================================================================
     <dna-founders> — one photo, a hotspot on each person. Tap opens a card
     that grows out of the hotspot (transform + opacity only).
     ======================================================================= */
  var fCSS = [
    ':host{display:block;position:relative;direction:rtl;font-family:' + FT + ';--lime:' + LIME + '}',
    'figure{position:relative;margin:0;border-radius:24px;overflow:hidden;background:#161616;aspect-ratio:6/5;isolation:isolate}',
    'figure>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(var(--z,1.06));will-change:transform}',
    'figure:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.35),transparent 40%);pointer-events:none}',
    '.hs{position:absolute;z-index:2;transform:translateY(-50%);display:flex;align-items:center;gap:10px;appearance:none;border:0;padding:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent}',
    '.dot{position:relative;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:rgba(20,20,20,.55);-webkit-backdrop-filter:blur(14px) saturate(1.6);backdrop-filter:blur(14px) saturate(1.6);box-shadow:inset 0 0 0 1px rgba(255,255,255,.28),0 8px 24px rgba(0,0,0,.25);transition:transform .35s ' + EASE + ',background .3s ' + EASE + '}',
    '.dot:before,.dot:after{content:"";position:absolute;width:10px;height:1.5px;border-radius:2px;background:#fff;transition:transform .45s ' + EASE + '}',
    '.dot:after{transform:rotate(90deg)}',
    '.hs[aria-expanded=true] .dot{background:var(--lime)}',
    '.hs[aria-expanded=true] .dot:before{transform:rotate(45deg);background:#0b0b0b}.hs[aria-expanded=true] .dot:after{transform:rotate(135deg);background:#0b0b0b}',
    '.dot i{position:absolute;inset:-3px;border-radius:50%;box-shadow:0 0 0 1px var(--lime);opacity:0;animation:br 3.6s ' + EASE + ' 1}',
    ':host([data-touched]) .dot i{animation:none}',
    '@keyframes br{0%{opacity:.9;transform:scale(.8)}70%,100%{opacity:0;transform:scale(1.35)}}',
    '.nm{padding:8px 12px;border-radius:999px;background:rgba(20,20,20,.55);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);color:#fff;font:700 13px/1 ' + FT + ';white-space:nowrap;box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}',
    '.hs:active .dot{transform:scale(.92)}',
    '@media (hover:hover) and (pointer:fine){.hs:hover .dot{transform:scale(1.08)}}',
    '.hs:focus-visible{outline:none}.hs:focus-visible .dot{box-shadow:0 0 0 3px var(--lime)}',
    '.card{position:absolute;z-index:3;width:min(320px,calc(100% - 32px));box-sizing:border-box;padding:22px 22px 20px;border-radius:22px;background:rgba(14,14,14,.72);-webkit-backdrop-filter:blur(24px) saturate(1.5);backdrop-filter:blur(24px) saturate(1.5);box-shadow:inset 0 0 0 1px rgba(255,255,255,.16),0 30px 60px rgba(0,0,0,.35);color:#fff;opacity:0;pointer-events:none;will-change:transform,opacity}',
    '.card.open{pointer-events:auto}',
    '.card small{display:block;font:700 11px/1.2 ' + FT + ';letter-spacing:.14em;color:var(--lime);margin-bottom:10px}',
    '.card strong{display:block;font:700 26px/1 ' + FD + ';letter-spacing:-.02em;margin-bottom:10px}',
    '.card p{margin:0;font:400 15px/1.55 ' + FT + ';color:rgba(255,255,255,.78)}',
    '.card .in{opacity:0}',
    '@media (max-width:600px){.nm{display:none}.card{right:16px!important;left:16px!important;width:auto;bottom:16px;top:auto!important}}'
  ].join('');
  function DnaFounders() { return Reflect.construct(HTMLElement, [], DnaFounders); }
  DnaFounders.prototype = Object.create(HTMLElement.prototype);
  DnaFounders.prototype.constructor = DnaFounders;
  Object.setPrototypeOf(DnaFounders, HTMLElement);
  DnaFounders.prototype.connectedCallback = function () {
    if (this._ready) return; this._ready = 1;
    var self = this, root = this.attachShadow({ mode: 'open' });
    var people = [].slice.call(this.children).filter(function (c) { return c.hasAttribute('data-x'); }).map(function (c) {
      return { x: +c.getAttribute('data-x'), y: +c.getAttribute('data-y'), name: c.getAttribute('data-name') || '', short: c.getAttribute('data-short') || (c.getAttribute('data-name') || '').split(' ')[0], role: c.getAttribute('data-role') || '', bio: c.innerHTML };
    });
    root.innerHTML = '<style>' + fCSS + '</style><figure><img alt="' + esc(attr(this, 'alt', '')) + '" src="' + esc(attr(this, 'src', 'media/team-deen-noa.webp')) + '" loading="lazy" decoding="async">' +
      people.map(function (p, i) { return '<button class="hs" type="button" aria-label="' + esc(p.name) + '" aria-expanded="false" aria-controls="c' + i + '" style="right:calc(' + (100 - p.x) + '% - 15px);top:' + p.y + '%"><span class="dot"><i></i></span><span class="nm">' + esc(p.short) + '</span></button>'; }).join('') +
      people.map(function (p, i) { return '<div class="card" id="c' + i + '" role="dialog" aria-label="' + esc(p.name) + '"><div class="in"><small>' + esc(p.role) + '</small><strong>' + esc(p.name) + '</strong><p>' + p.bio + '</p></div></div>'; }).join('') +
      '</figure>';
    this._p = people;
    this._hs = [].slice.call(root.querySelectorAll('.hs'));
    this._cards = [].slice.call(root.querySelectorAll('.card'));
    this._fig = root.querySelector('figure'); this._img = root.querySelector('figure>img');
    this._open = -1;
    this._hs.forEach(function (h, i) { h.addEventListener('click', function (ev) { ev.stopPropagation(); self.toggle(i); }); });
    this._cards.forEach(function (c) { c.addEventListener('click', function (ev) { ev.stopPropagation(); }); });
    this._fig.addEventListener('click', function () { self.toggle(-1); });
    this._esc = function (ev) { if (ev.key === 'Escape' && self._open >= 0) { var h = self._hs[self._open]; self.toggle(-1); h.focus(); } };
    document.addEventListener('keydown', this._esc);
    if (!RM) {
      this._sc = function () {
        if (self._q) return; self._q = 1;
        requestAnimationFrame(function () {
          self._q = 0; var r = self.getBoundingClientRect(), t = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
          self._img.style.setProperty('--z', (1.1 - 0.1 * eo(t * 1.4)).toFixed(4));
        });
      };
      addEventListener('scroll', this._sc, { passive: true }); this._sc();
    } else this._img.style.setProperty('--z', 1);
  };
  DnaFounders.prototype.disconnectedCallback = function () { document.removeEventListener('keydown', this._esc); if (this._sc) removeEventListener('scroll', this._sc); };
  DnaFounders.prototype._layout = function (i) {
    var c = this._cards[i], p = this._p[i], fw = this._fig.clientWidth, fh = this._fig.clientHeight;
    var hx = fw * p.x / 100, hy = fh * p.y / 100;
    if (fw <= 600) { c.style.top = ''; c.style.left = ''; c.style.right = ''; var cr = c.getBoundingClientRect(), fr = this._fig.getBoundingClientRect();
      c.style.transformOrigin = (hx - (cr.left - fr.left)) + 'px ' + (hy - (cr.top - fr.top)) + 'px'; return; }
    var cw = c.offsetWidth, chh = c.offsetHeight, gap = 34;
    var left = p.x > 50 ? hx - gap - cw : hx + gap;
    left = clamp(left, 16, fw - cw - 16);
    var top = clamp(hy - chh / 2, 16, fh - chh - 16);
    c.style.left = left + 'px'; c.style.top = top + 'px'; c.style.right = 'auto';
    c.style.transformOrigin = (hx - left) + 'px ' + (hy - top) + 'px';
  };
  DnaFounders.prototype.toggle = function (i) {
    var self = this;
    if (i === this._open) i = -1;
    this.setAttribute('data-touched', '');
    if (this._open >= 0) {
      var oc = this._cards[this._open], oh = this._hs[this._open];
      oh.setAttribute('aria-expanded', 'false'); oc.classList.remove('open');
      if (oc._a) oc._a.cancel();
      oc._a = oc.animate([{ opacity: getComputedStyle(oc).opacity, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.2)' }], { duration: RM ? 1 : 220, easing: 'cubic-bezier(0.4,0,1,1)', fill: 'forwards' });
      oc.querySelector('.in').animate([{ opacity: 1 }, { opacity: 0 }], { duration: RM ? 1 : 120, fill: 'forwards' });
    }
    this._open = i;
    if (i < 0) return;
    var c = this._cards[i], h = this._hs[i];
    this._layout(i);
    h.setAttribute('aria-expanded', 'true'); c.classList.add('open');
    if (c._a) c._a.cancel();
    // grows out of the hotspot — spring-like overshoot-free ease-out
    c._a = c.animate([{ opacity: 0, transform: 'scale(.2)' }, { opacity: 1, transform: 'scale(1)' }], { duration: RM ? 1 : 520, easing: 'cubic-bezier(0.2, 0.9, 0.25, 1)', fill: 'forwards' });
    c.querySelector('.in').animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: RM ? 1 : 360, delay: RM ? 0 : 140, easing: EASE, fill: 'forwards' });
  };
  customElements.define('dna-founders', DnaFounders);
})();
