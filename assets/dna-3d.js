/* ============================================================================
   DNA 3D — rendered-object components (Blender image sequences, Apple style)
     <dna-explode src="/media/dna-explode/f_{i}.webp" frames="72"></dna-explode>
        A tall scroll section. The monogram is pinned; scrolling scrubs the
        rendered film: it opens into its three parts, each labelled with one
        of the three engines, then locks back into one mark.
     <dna-turntable src="/media/dna-turn/f_{i}.webp" frames="60"></dna-turntable>
        The monogram as a product on a turntable. Drag to spin; it keeps your
        momentum, then settles into a slow idle turn.
   {i} is replaced by the zero-padded frame number (3 digits).
   ========================================================================== */
(function () {
  'use strict';
  if (!window.customElements || window.__dna3d) return; window.__dna3d = 1;
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LIME = '#D9FF43', INK = '#0B0B0B';
  var FD = '"Tel Aviv Brutalist","Heebo",Arial,sans-serif', FT = '"Tel Aviv Modernist","Heebo",Arial,sans-serif';
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function inv(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function pad(i) { return ('00' + i).slice(-3); }

  /* load a sequence: first frame first, then the rest in order */
  function Seq(pattern, n, onReady) {
    this.imgs = new Array(n); this.ok = new Array(n); this.n = n;
    var self = this, order = [0];
    for (var i = 1; i < n; i++) order.push(i);
    var next = 0, busy = 0;
    function load() {
      while (busy < 6 && next < order.length) {
        (function (k) {
          var im = new Image(); busy++;
          im.decoding = 'async';
          im.onload = function () { self.ok[k] = 1; busy--; if (k === 0 && onReady) onReady(); load(); };
          im.onerror = function () { busy--; load(); };
          im.src = pattern.replace('{i}', pad(k)); self.imgs[k] = im;
        })(order[next++]);
      }
    }
    this.start = function () { if (next === 0) load(); };
  }
  Seq.prototype.nearest = function (k) {
    k = clamp(Math.round(k), 0, this.n - 1);
    for (var d = 0; d < this.n; d++) { if (this.ok[k - d]) return this.imgs[k - d]; if (this.ok[k + d]) return this.imgs[k + d]; }
    return null;
  };
  function fitCanvas(cv) {
    var r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
    var W = Math.round(r.width * d), H = Math.round(r.height * d);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    return { w: r.width, h: r.height, d: d };
  }
  function drawContain(ctx, im, W, H, alpha) {
    if (!im) return null;
    var s = Math.min(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s;
    var x = (W - w) / 2, y = (H - h) / 2;
    ctx.globalAlpha = alpha === undefined ? 1 : alpha; ctx.drawImage(im, x, y, w, h); ctx.globalAlpha = 1;
    return { x: x, y: y, w: w, h: h };
  }

  /* screen anchors of the three parts for every frame, exported from the 3D scene */
  var ANCHORS = window.DNA_EXPLODE_ANCHORS || [{"top":[0.5329,0.3477],"middle":[0.4981,0.5],"bottom":[0.4886,0.6394]},{"top":[0.5331,0.3477],"middle":[0.498,0.5],"bottom":[0.4888,0.6395]},{"top":[0.5333,0.3477],"middle":[0.498,0.5],"bottom":[0.4889,0.6395]},{"top":[0.5335,0.3477],"middle":[0.498,0.4999],"bottom":[0.489,0.6396]},{"top":[0.5338,0.3478],"middle":[0.4979,0.4999],"bottom":[0.489,0.6396]},{"top":[0.534,0.3478],"middle":[0.4979,0.4999],"bottom":[0.489,0.6397]},{"top":[0.5343,0.3479],"middle":[0.4979,0.4999],"bottom":[0.4889,0.6397]},{"top":[0.5346,0.3479],"middle":[0.4979,0.4999],"bottom":[0.4888,0.6398]},{"top":[0.5349,0.348],"middle":[0.4979,0.4999],"bottom":[0.4887,0.6399]},{"top":[0.535,0.3477],"middle":[0.4983,0.4999],"bottom":[0.4887,0.6402]},{"top":[0.5347,0.3469],"middle":[0.4993,0.5],"bottom":[0.4892,0.641]},{"top":[0.5339,0.3453],"middle":[0.5008,0.5001],"bottom":[0.4902,0.6424]},{"top":[0.5323,0.3429],"middle":[0.5028,0.5003],"bottom":[0.4919,0.6446]},{"top":[0.5297,0.3394],"middle":[0.5051,0.5004],"bottom":[0.4945,0.6477]},{"top":[0.5261,0.335],"middle":[0.5076,0.5006],"bottom":[0.4979,0.6516]},{"top":[0.5214,0.3295],"middle":[0.5098,0.5006],"bottom":[0.5022,0.6563]},{"top":[0.5156,0.3231],"middle":[0.5115,0.5006],"bottom":[0.5073,0.6618]},{"top":[0.5087,0.3159],"middle":[0.5126,0.5004],"bottom":[0.5132,0.668]},{"top":[0.5009,0.3079],"middle":[0.5128,0.5],"bottom":[0.5198,0.6747]},{"top":[0.4922,0.2994],"middle":[0.512,0.4995],"bottom":[0.5268,0.6818]},{"top":[0.4829,0.2906],"middle":[0.5101,0.4987],"bottom":[0.5341,0.6892]},{"top":[0.4733,0.2816],"middle":[0.5069,0.4978],"bottom":[0.5415,0.6966]},{"top":[0.4635,0.2727],"middle":[0.5027,0.4968],"bottom":[0.5488,0.7039]},{"top":[0.4539,0.2642],"middle":[0.4974,0.4956],"bottom":[0.5558,0.711]},{"top":[0.4446,0.2562],"middle":[0.4913,0.4943],"bottom":[0.5624,0.7175]},{"top":[0.4361,0.249],"middle":[0.4846,0.4929],"bottom":[0.5683,0.7235]},{"top":[0.4284,0.2427],"middle":[0.4775,0.4916],"bottom":[0.5736,0.7287]},{"top":[0.4218,0.2374],"middle":[0.4704,0.4903],"bottom":[0.5779,0.7331]},{"top":[0.4164,0.2333],"middle":[0.4634,0.4891],"bottom":[0.5814,0.7367]},{"top":[0.4123,0.2302],"middle":[0.4569,0.4881],"bottom":[0.584,0.7394]},{"top":[0.4093,0.2282],"middle":[0.451,0.4872],"bottom":[0.5857,0.7412]},{"top":[0.4073,0.2271],"middle":[0.4458,0.4865],"bottom":[0.5867,0.7423]},{"top":[0.4061,0.2267],"middle":[0.4413,0.486],"bottom":[0.5872,0.7429]},{"top":[0.4053,0.2266],"middle":[0.4374,0.4856],"bottom":[0.5874,0.7432]},{"top":[0.4045,0.2265],"middle":[0.434,0.4854],"bottom":[0.5876,0.7435]},{"top":[0.4039,0.2264],"middle":[0.431,0.4852],"bottom":[0.5878,0.7437]},{"top":[0.4034,0.2264],"middle":[0.4286,0.4851],"bottom":[0.588,0.7438]},{"top":[0.4029,0.2265],"middle":[0.4265,0.4852],"bottom":[0.5882,0.7439]},{"top":[0.4025,0.2265],"middle":[0.425,0.4853],"bottom":[0.5883,0.7439]},{"top":[0.4021,0.2266],"middle":[0.4239,0.4856],"bottom":[0.5885,0.7439]},{"top":[0.4018,0.2267],"middle":[0.4233,0.486],"bottom":[0.5886,0.7438]},{"top":[0.4016,0.2269],"middle":[0.4231,0.4865],"bottom":[0.5888,0.7436]},{"top":[0.4015,0.2271],"middle":[0.4233,0.4871],"bottom":[0.5889,0.7435]},{"top":[0.4014,0.2273],"middle":[0.4241,0.4878],"bottom":[0.5891,0.7432]},{"top":[0.4014,0.2276],"middle":[0.4252,0.4886],"bottom":[0.5892,0.7429]},{"top":[0.4014,0.2279],"middle":[0.4268,0.4896],"bottom":[0.5893,0.7425]},{"top":[0.4015,0.2283],"middle":[0.4288,0.4906],"bottom":[0.5894,0.7421]},{"top":[0.4018,0.2286],"middle":[0.4313,0.4917],"bottom":[0.5895,0.7417]},{"top":[0.4021,0.2291],"middle":[0.4342,0.4929],"bottom":[0.5895,0.7412]},{"top":[0.4025,0.2295],"middle":[0.4375,0.4942],"bottom":[0.5896,0.7406]},{"top":[0.4029,0.23],"middle":[0.4413,0.4956],"bottom":[0.5895,0.74]},{"top":[0.404,0.2309],"middle":[0.4456,0.4971],"bottom":[0.5892,0.739]},{"top":[0.4065,0.233],"middle":[0.4508,0.4987],"bottom":[0.5877,0.7371]},{"top":[0.4111,0.2369],"middle":[0.457,0.5003],"bottom":[0.5848,0.7337]},{"top":[0.4181,0.2429],"middle":[0.4639,0.5018],"bottom":[0.5801,0.7288]},{"top":[0.4274,0.2507],"middle":[0.4712,0.5031],"bottom":[0.5736,0.7223]},{"top":[0.4386,0.2603],"middle":[0.4784,0.5042],"bottom":[0.5656,0.7144]},{"top":[0.4512,0.2712],"middle":[0.4851,0.5049],"bottom":[0.5564,0.7055]},{"top":[0.4647,0.2829],"middle":[0.4908,0.5052],"bottom":[0.5463,0.6958]},{"top":[0.4784,0.2948],"middle":[0.4953,0.5051],"bottom":[0.5358,0.6858]},{"top":[0.4915,0.3065],"middle":[0.4985,0.5047],"bottom":[0.5255,0.676]},{"top":[0.5035,0.3172],"middle":[0.5004,0.504],"bottom":[0.5158,0.6667]},{"top":[0.514,0.3267],"middle":[0.5011,0.5031],"bottom":[0.5071,0.6585]},{"top":[0.5225,0.3346],"middle":[0.5009,0.5022],"bottom":[0.4999,0.6516]},{"top":[0.529,0.3407],"middle":[0.5002,0.5013],"bottom":[0.4943,0.6461]},{"top":[0.5333,0.3449],"middle":[0.4993,0.5006],"bottom":[0.4904,0.6423]},{"top":[0.5358,0.3474],"middle":[0.4984,0.5001],"bottom":[0.4882,0.64]},{"top":[0.5368,0.3485],"middle":[0.498,0.4999],"bottom":[0.4873,0.6389]},{"top":[0.537,0.3487],"middle":[0.4978,0.4998],"bottom":[0.4872,0.6386]},{"top":[0.5369,0.3487],"middle":[0.4978,0.4998],"bottom":[0.4873,0.6386]},{"top":[0.5369,0.3487],"middle":[0.4978,0.4998],"bottom":[0.4874,0.6385]},{"top":[0.5369,0.3487],"middle":[0.4978,0.4999],"bottom":[0.4874,0.6384]}];
  var ENGINES = [['top', 'אסטרטגיה ומסר', '01'], ['middle', 'קריאייטיב ומדיה', '02'], ['bottom', 'דיגיטל ומערכות', '03']];

  class DnaExplode extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = 1;
      var self = this, n = parseInt(this.getAttribute('frames') || '72', 10);
      var root = this.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>' +
        ':host{display:block;position:relative;height:' + (this.getAttribute('length') || '340vh') + '}' +
        '.pin{position:sticky;top:0;height:100vh;height:100svh;overflow:hidden;background:#fff}' +
        'canvas{position:absolute;inset:0;width:100%;height:100%}' +
        '.beat{position:absolute;left:0;right:0;text-align:center;direction:rtl;pointer-events:none;padding:0 20px;' +
        'font:700 clamp(38px,6.4vw,92px)/.95 ' + FD + ';letter-spacing:-.04em;color:' + INK + ';' +
        'opacity:0;transform:translateY(22px);transition:opacity .5s cubic-bezier(.23,1,.32,1),transform .5s cubic-bezier(.23,1,.32,1)}' +
        '.beat.on{opacity:1;transform:none}.beat em{font-style:normal;color:#7BA21A}' +
        '.b1{top:9vh}.b3{bottom:8vh}' +
        '.lab{position:absolute;left:0;top:0;pointer-events:none;direction:rtl;white-space:nowrap;opacity:0;transition:opacity .35s ease;background:rgba(255,255,255,.82);padding:5px 8px;border-radius:8px}' +
        '.lab .t{font:700 clamp(17px,1.7vw,24px)/1.1 ' + FD + ';color:' + INK + ';text-shadow:0 1px 0 rgba(255,255,255,.9)}' +
        '.lab .n{display:block;font:700 12px ' + FT + ';letter-spacing:.14em;color:#77736B;margin-bottom:4px;direction:ltr;text-align:right}' +
        'svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}' +
        '@media (max-width:700px){.b1{top:12vh}.lab .t{font-size:15px}}' +
        '</style><div class="pin"><canvas></canvas><svg></svg>' +
        '<div class="beat b1">סוכנות אחת.</div>' +
        '<div class="beat b3">שלושה מנועים. <em>צמיחה אחת.</em></div>' +
        ENGINES.map(function (e) { return '<div class="lab" data-k="' + e[0] + '"><span class="n">' + e[2] + '</span><span class="t">' + e[1] + '</span></div>'; }).join('') +
        '</div>';
      this.cv = root.querySelector('canvas'); this.ctx = this.cv.getContext('2d'); this.svg = root.querySelector('svg');
      this.b1 = root.querySelector('.b1'); this.b3 = root.querySelector('.b3');
      this.labs = Array.prototype.slice.call(root.querySelectorAll('.lab'));
      this.seq = new Seq(this.getAttribute('src'), n, function () { self.paint(); });
      new IntersectionObserver(function (en, observer) { if (en[0].isIntersecting) { self.seq.start(); observer.disconnect(); } }, {rootMargin:'500px'}).observe(this);
      this.n = n; this.f = RM ? n - 1 : 0; this.target = this.f;
      var raf = 0;
      var loop = function () {
        raf = 0;
        self.f += (self.target - self.f) * 0.16;               // inertia: the film trails the scroll a touch, like Apple's
        if (Math.abs(self.target - self.f) < 0.01) self.f = self.target;
        self.paint();
        if (self.f !== self.target) raf = requestAnimationFrame(loop);
      };
      var onScroll = function () {
        var r = self.getBoundingClientRect(), span = r.height - innerHeight;
        var p = clamp(-r.top / Math.max(1, span), 0, 1);
        self.p = p; self.target = RM ? n - 1 : p * (n - 1);
        if (!raf) raf = requestAnimationFrame(loop);
      };
      addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
      onScroll();
    }
    paint() {
      var g = fitCanvas(this.cv), ctx = this.ctx;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.cv.width, this.cv.height);
      var k = this.f, a = Math.floor(k), fr = k - a;
      var im0 = this.seq.nearest(a), im1 = this.seq.ok[a + 1] ? this.seq.imgs[a + 1] : null;
      var box = drawContain(ctx, im0, this.cv.width, this.cv.height, 1);
      if (im1 && fr > 0.02) drawContain(ctx, im1, this.cv.width, this.cv.height, fr);   // sub-frame blend: silk, not steps
      var p = this.f / (this.n - 1);
      this.b1.classList.toggle('on', p < 0.14);
      this.b3.classList.toggle('on', p > 0.9 || RM);
      // engine labels ride on their part while the mark is open
      var show = RM ? 0 : smooth(inv(p, 0.26, 0.34)) * (1 - smooth(inv(p, 0.68, 0.78)));
      var lines = '';
      if (box && ANCHORS) {
        var A = ANCHORS[Math.round(this.f)] || ANCHORS[0], d = g.d;
        var mobile = g.w < 700;
        this.labs.forEach(function (lab, i) {
          var key = lab.getAttribute('data-k'), an = A[key];
          var px = (box.x + an[0] * box.w) / d, py = (box.y + an[1] * box.h) / d;
          var side = mobile ? (i === 1 ? 1 : -1) : (key === 'middle' ? 1 : -1);    // alternate sides so lines never cross
          var lx = side > 0 ? Math.min(g.w - 20, px + (mobile ? 34 : 115)) : Math.max(20, px - (mobile ? 34 : 115));
          var ly = py - 10;
          lab.style.opacity = show.toFixed(3);
          var wLab = lab.offsetWidth;
          lab.style.transform = 'translate(' + clamp((side > 0 ? lx : lx - wLab), 8, g.w - wLab - 8).toFixed(1) + 'px,' + (ly - lab.offsetHeight + 8).toFixed(1) + 'px)';
          var ex = side > 0 ? lx - 8 : lx + 8;
          lines += '<line x1="' + px.toFixed(1) + '" y1="' + py.toFixed(1) + '" x2="' + ex.toFixed(1) + '" y2="' + ly.toFixed(1) + '" stroke="' + INK + '" stroke-width="1" opacity="' + (0.5 * show).toFixed(3) + '"/>' +
            '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="4.5" fill="' + LIME + '" stroke="' + INK + '" stroke-width="1.2" opacity="' + show.toFixed(3) + '"/>';
        });
      }
      this.svg.innerHTML = lines;
    }
  }

  class DnaTurntable extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = 1;
      var self = this, n = parseInt(this.getAttribute('frames') || '60', 10);
      var root = this.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>:host{display:block;position:relative;aspect-ratio:1/1;touch-action:pan-y;cursor:grab;user-select:none;-webkit-user-select:none;outline:none}' +
        ':host(:active){cursor:grabbing}:host(:focus-visible){outline:2px solid ' + LIME + ';outline-offset:6px;border-radius:24px}' +
        'canvas{position:absolute;inset:0;width:100%;height:100%}' +
        '.hint{position:absolute;bottom:4%;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:10px;padding:8px 16px;border-radius:99px;' +
        'background:rgba(255,255,255,.6);backdrop-filter:blur(14px) saturate(160%);-webkit-backdrop-filter:blur(14px) saturate(160%);border:1px solid rgba(11,11,11,.08);' +
        'font:700 14px ' + FT + ';color:' + INK + ';direction:rtl;transition:opacity .5s ease;pointer-events:none}' +
        '.hint i{width:26px;height:10px;position:relative}.hint i:before,.hint i:after{content:"";position:absolute;top:1px;width:7px;height:7px;border-top:2px solid ' + INK + ';border-left:2px solid ' + INK + '}' +
        '.hint i:before{left:0;transform:rotate(-45deg)}.hint i:after{right:0;transform:rotate(135deg)}</style>' +
        '<canvas></canvas><div class="hint"><i></i>גררו לסיבוב</div>';
      this.cv = root.querySelector('canvas'); this.ctx = this.cv.getContext('2d'); this.hint = root.querySelector('.hint');
      this.tabIndex = 0; this.setAttribute('role', 'img'); this.setAttribute('aria-label', this.getAttribute('label') || 'הסמל של DNA, מסתובב');
      this.seq = new Seq(this.getAttribute('src'), n, function () { self.paint(); });
      this.n = n; this.ang = 0; this.v = 0; this.idleV = RM ? 0 : 14; this.lastTouch = -1e9; this.vis = false;
      var drag = null;
      this.addEventListener('pointerdown', function (e) {
        self.setPointerCapture(e.pointerId); drag = { x: e.clientX, a: self.ang, h: [[performance.now(), e.clientX]] };
        self.v = 0; self.lastTouch = performance.now(); self.hint.style.opacity = '0';
      });
      this.addEventListener('pointermove', function (e) {
        if (!drag) return;
        var w = self.getBoundingClientRect().width;
        self.ang = drag.a - (e.clientX - drag.x) / w * 300;         // 1:1: one width of drag ≈ 300°
        drag.h.push([performance.now(), e.clientX]); if (drag.h.length > 10) drag.h.shift();
        self.lastTouch = performance.now();
      });
      var up = function () {
        if (!drag) return;
        var h = drag.h, i = h.length - 1; while (i > 0 && h[h.length - 1][0] - h[i - 1][0] < 90) i--;
        var dt = (h[h.length - 1][0] - h[i][0]) / 1000, w = self.getBoundingClientRect().width;
        self.v = dt > 0 ? -(h[h.length - 1][1] - h[i][1]) / dt / w * 300 : 0;   // hand the release velocity to momentum
        drag = null; self.lastTouch = performance.now();
      };
      this.addEventListener('pointerup', up); this.addEventListener('pointercancel', up);
      this.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); self.v -= 240; self.lastTouch = performance.now(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); self.v += 240; self.lastTouch = performance.now(); }
      });
      new IntersectionObserver(function (en) { self.vis = en[0].isIntersecting; if (self.vis) { self.seq.start(); self.run(); } }, {rootMargin:'300px'}).observe(this);
      this.dragging = function () { return !!drag; };
    }
    run() {
      var self = this; if (this._raf) return;
      var last = performance.now();
      var f = function (now) {
        self._raf = 0; if (!self.vis) return;
        var dt = Math.min(0.05, (now - last) / 1000); last = now;
        if (!self.dragging()) {
          self.v *= Math.pow(0.998, dt * 1000);                     // Apple's deceleration rate
          var idle = smooth(inv(now - self.lastTouch, 2200, 4200));  // after you let go, a calm idle turn fades back in
          self.ang += (self.v + self.idleV * idle) * dt;
        }
        self.paint();
        self._raf = requestAnimationFrame(f);
      };
      this._raf = requestAnimationFrame(f);
    }
    paint() {
      fitCanvas(this.cv); var ctx = this.ctx;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.cv.width, this.cv.height);
      var k = ((this.ang / 360 * this.n) % this.n + this.n) % this.n, a = Math.floor(k), fr = k - a, b = (a + 1) % this.n;
      drawContain(ctx, this.seq.nearest(a), this.cv.width, this.cv.height, 1);
      if (this.seq.ok[b] && fr > 0.02) drawContain(ctx, this.seq.imgs[b], this.cv.width, this.cv.height, fr);
    }
  }
  customElements.define('dna-explode', DnaExplode);
  customElements.define('dna-turntable', DnaTurntable);
})();
