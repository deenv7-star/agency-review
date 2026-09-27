/* ============================================================================
   DNA UI — set 3. Apple-grade interface pieces for hellodna.co.il
     <dna-os-story src="/assets/dna-os-overview.webp"></dna-os-story>
     <dna-sheet></dna-sheet>  +  any element with data-dna-sheet opens it
     <dna-compare before="a.webp" after="b.webp"></dna-compare>
     <dna-glow> …any element… </dna-glow>
     <dna-faq> <details><summary>…</summary>…</details> … </dna-faq>
   One file, no dependencies. Springs are Apple-parameterised (response,
   damping ratio). Reduced motion gets calm equivalents.
   ========================================================================== */
(function () {
  'use strict';
  if (!window.customElements || window.__dnaUI) return; window.__dnaUI = 1;
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LIME = '#D9FF43', INK = '#0B0B0B', PAPER = '#FFFFFF';
  var FD = '"Tel Aviv Brutalist","Heebo",Arial,sans-serif', FT = '"Tel Aviv Modernist","Heebo",Arial,sans-serif';
  var EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rubber(o, dim, c) { c = c || 0.55; return (o * dim * c) / (dim + c * Math.abs(o)); }
  function project(v, d) { d = d || 0.998; return (v / 1000) * d / (1 - d); }
  function Spring(x, r, d) { this.x = x; this.v = 0; this.t = x; this.r = r || 0.4; this.d = d === undefined ? 1 : d; }
  Spring.prototype.step = function (dt) {
    var k = Math.pow(6.2832 / this.r, 2), c = 12.566 * this.d / this.r, n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;
    for (var i = 0; i < n; i++) { var a = -k * (this.x - this.t) - c * this.v; this.v += a * h; this.x += this.v * h; }
    if (Math.abs(this.x - this.t) < 1e-3 && Math.abs(this.v) < 1e-2) { this.x = this.t; this.v = 0; return false; }
    return true;
  };
  function ticker(fn) {                                         // runs fn(dt) each frame until it returns false
    var raf = 0, last = 0;
    function f(now) { var dt = Math.min(0.05, (now - last) / 1000); last = now; if (fn(dt)) raf = requestAnimationFrame(f); else raf = 0; }
    return function () { if (!raf) { last = performance.now(); raf = requestAnimationFrame(f); } };
  }
  function velocity(h) {
    if (h.length < 2) return 0;
    var l = h[h.length - 1], i = h.length - 1; while (i > 0 && l[0] - h[i - 1][0] < 90) i--;
    var dt = (l[0] - h[i][0]) / 1000; return dt > 0 ? (l[1] - h[i][1]) / dt : 0;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ==========================================================================
     <dna-os-story src="…dna-os-overview.webp">
     A laptop with the real DNA OS screen. Four questions scroll past; for each
     one the camera glides (spring) to that region of the screen and a lime
     frame lands on it. The screen is the proof; the text is the promise.
     ========================================================================== */
  var OS_STEPS = [
    { n: '01', q: 'מה קורה?', a: 'קמפיינים, לידים, עלויות ותנועה. במבט אחד.', tag: 'תצוגה חיה', r: [50, 165, 1132, 336] },
    { n: '02', q: 'מה אנחנו עושים?', a: 'קריאייטיב בהפקה וניסויים בתנועה.', tag: 'DNA WORK', r: [50, 350, 468, 748] },
    { n: '03', q: 'מה למדנו?', a: 'מה עובד, מה לא ומה צריך לשנות.', tag: 'DNA PULSE', r: [600, 470, 1132, 580] },
    { n: '04', q: 'מה עכשיו?', a: 'החלטה אחת ברורה לשבוע הבא.', tag: 'הצעד הבא', r: [484, 350, 1132, 748] }
  ];
  class DnaOsStory extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = 1;
      var self = this, src = this.getAttribute('src') || '/assets/dna-os-overview.webp';
      var W0 = 1440, H0 = 900;
      var root = this.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>' +
        ':host{display:block;position:relative;direction:rtl}' +
        '.wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.35fr);gap:clamp(24px,5vw,80px);max-width:1280px;margin:0 auto;padding:0 24px}' +
        '.steps{padding:30vh 0 40vh}' +
        '.step{min-height:62vh;display:flex;flex-direction:column;justify-content:center;opacity:.22;transform:translateY(10px);transition:opacity .45s ' + EASE + ',transform .45s ' + EASE + '}' +
        '.step.on{opacity:1;transform:none}' +
        '.n{font:700 13px ' + FT + ';letter-spacing:.16em;color:#77736B;direction:ltr;text-align:right}' +
        '.q{font:700 clamp(38px,4.6vw,68px)/.95 ' + FD + ';letter-spacing:-.04em;color:' + INK + ';margin:12px 0 14px}' +
        '.a{font:400 clamp(17px,1.5vw,21px)/1.45 ' + FT + ';color:#4a4843;max-width:26ch}' +
        '.tag{display:inline-flex;align-items:center;gap:8px;margin-top:18px;align-self:flex-start;padding:7px 13px;border-radius:99px;background:' + INK + ';color:' + LIME + ';font:700 12px ' + FT + ';letter-spacing:.12em}' +
        '.tag i{width:7px;height:7px;border-radius:9px;background:' + LIME + ';box-shadow:0 0 0 4px rgba(217,255,67,.18)}' +
        '.stage{position:sticky;top:0;height:100vh;height:100svh;display:flex;align-items:center;justify-content:center;background:#fff}' +
        '.mac{width:100%;max-width:820px}' +
        '.lid{position:relative;border-radius:22px 22px 12px 12px;background:#101010;padding:2.2% 2.2% 3%;box-shadow:0 1px 0 1px #2a2a2a inset,0 40px 80px -30px rgba(0,0,0,.45),0 18px 30px -18px rgba(0,0,0,.4)}' +
        '.cam{position:absolute;top:.9%;left:50%;width:5px;height:5px;border-radius:9px;background:#222;transform:translateX(-50%)}' +
        '.screen{position:relative;aspect-ratio:16/10;border-radius:8px;overflow:hidden;background:#f3f1ea}' +
        '.world{position:absolute;left:0;top:0;width:' + W0 + 'px;height:' + H0 + 'px;transform-origin:0 0;will-change:transform}' +
        '.world img{display:block;width:100%;height:100%}' +
        '.ring{position:absolute;border-radius:22px;border:2.5px solid ' + LIME + ';box-shadow:0 0 0 6px rgba(217,255,67,.22),0 0 40px rgba(217,255,67,.35);opacity:0;transition:opacity .35s ease}' +
        '.dim{position:absolute;inset:0;background:rgba(11,11,11,.0);transition:background .4s ease;pointer-events:none}' +
        '.base{height:14px;margin:0 -5%;border-radius:0 0 18px 18px;background:linear-gradient(#d9d7d0,#b9b6ae 60%,#9d9a92);position:relative}' +
        '.base:before{content:"";position:absolute;left:50%;top:0;width:16%;height:6px;transform:translateX(-50%);border-radius:0 0 10px 10px;background:#a9a69e}' +
        '.shadow{height:24px;margin:0 2%;background:radial-gradient(50% 100% at 50% 0,rgba(0,0,0,.18),transparent 70%)}' +
        '@media (max-width:820px){.wrap{display:flex;flex-direction:column}.stage{order:0;position:sticky;top:76px;height:39vh;flex:0 0 auto;z-index:2;background:linear-gradient(#fff 88%,rgba(255,255,255,0))}.steps{order:1;padding:4vh 0 18vh}.step{min-height:48vh}}' +
        '</style>' +
        '<div class="wrap"><div class="steps">' + OS_STEPS.map(function (s, i) {
          return '<div class="step" data-i="' + i + '"><div class="n">' + s.n + ' / 04</div><div class="q">' + esc(s.q) + '</div><div class="a">' + esc(s.a) + '</div><div class="tag"><i></i>' + esc(s.tag) + '</div></div>';
        }).join('') + '</div>' +
        '<div class="stage"><div class="mac"><div class="lid"><div class="cam"></div><div class="screen"><div class="world"><img alt="DNA OS" src="' + esc(src) + '"><div class="ring"></div></div><div class="dim"></div></div></div><div class="base"></div><div class="shadow"></div></div></div></div>';
      var screen = root.querySelector('.screen'), world = root.querySelector('.world'), ring = root.querySelector('.ring');
      var steps = Array.prototype.slice.call(root.querySelectorAll('.step'));
      this.cx = new Spring(W0 / 2, 0.75, 1); this.cy = new Spring(H0 / 2, 0.75, 1); this.cz = new Spring(1, 0.75, 1);
      var active = -1;
      var frame = function () {
        var sw = screen.clientWidth, sh = screen.clientHeight, base = sw / W0;
        var z = self.cz.x * base;
        world.style.transform = 'translate(' + (sw / 2 - self.cx.x * z).toFixed(2) + 'px,' + (sh / 2 - self.cy.x * z).toFixed(2) + 'px) scale(' + z.toFixed(4) + ')';
      };
      var run = ticker(function (dt) {
        if (RM) { self.cx.x = self.cx.t; self.cy.x = self.cy.t; self.cz.x = self.cz.t; frame(); return false; }
        var g = self.cx.step(dt) | self.cy.step(dt) | self.cz.step(dt); frame();
        ring.style.opacity = active >= 0 && Math.abs(self.cz.x - self.cz.t) < 0.06 ? '1' : '0';   // the frame lands once the camera settles
        return !!g;
      });
      var go = function (i) {
        if (i === active) return; active = i;
        steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
        var sw = screen.clientWidth, sh = screen.clientHeight, base = sw / W0;
        if (i < 0) { self.cx.t = W0 / 2; self.cy.t = H0 / 2; self.cz.t = 1; ring.style.opacity = '0'; }
        else {
          var r = OS_STEPS[i].r, pad = 34, rw = r[2] - r[0] + pad * 2, rh = r[3] - r[1] + pad * 2;
          self.cx.t = (r[0] + r[2]) / 2; self.cy.t = (r[1] + r[3]) / 2;
          self.cz.t = clamp(Math.min(sw / (rw * base), sh / (rh * base)), 1, 2.6);
          ring.style.left = (r[0] - 10) + 'px'; ring.style.top = (r[1] - 10) + 'px';
          ring.style.width = (r[2] - r[0] + 20) + 'px'; ring.style.height = (r[3] - r[1] + 20) + 'px';
          ring.style.opacity = '0';
        }
        run();
      };
      var check = function () {
        var mid = innerHeight * (innerWidth <= 820 ? 0.72 : 0.5), best = -1;
        steps.forEach(function (s, k) { var b = s.getBoundingClientRect(); if (b.top < mid && b.bottom > mid) best = k; });
        var rr = self.getBoundingClientRect();
        if (best < 0 && rr.top > -innerHeight * 0.2) best = -1; else if (best < 0) best = active;
        go(best);
      };
      addEventListener('scroll', check, { passive: true }); addEventListener('resize', function () { frame(); check(); });
      new ResizeObserver(frame).observe(screen);
      frame(); check();
    }
  }

  /* ==========================================================================
     <dna-sheet phone="972525979520">   — the "let's talk" sheet
     Any element with data-dna-sheet opens it. On phones it rises from the
     bottom and follows your finger; drag it down (or flick) to dismiss. On
     desktop it's a centred sheet. Sends a composed message to WhatsApp.
     ========================================================================== */
  var NEEDS = ['מרגיש.ה שמשהו בשיווק לא עובד', 'רוצה אתר חדש לעסק', 'לא ברור לי מה אני מקבל.ת היום מהשיווק', 'רוצה לעלות מדרגה בשיווק'];
  class DnaSheet extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = 1;
      var self = this, phone = this.getAttribute('phone') || '972525979520';
      var root = this.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>' +
        ':host{position:fixed;inset:0;z-index:1000;pointer-events:none;direction:rtl}' +
        '.scrim{position:absolute;inset:0;background:rgba(11,11,11,.42);opacity:0;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}' +
        '.sheet{position:absolute;left:0;right:0;bottom:0;max-height:92vh;overflow:auto;background:' + PAPER + ';border-radius:28px 28px 0 0;padding:10px 22px calc(26px + env(safe-area-inset-bottom));box-shadow:0 -20px 60px rgba(0,0,0,.25);transform:translateY(110%);touch-action:none}' +
        '@media (min-width:760px){.sheet{left:50%;right:auto;bottom:auto;top:50%;width:560px;border-radius:30px;padding:26px 34px 30px}}' +
        '.grab{width:40px;height:5px;border-radius:9px;background:rgba(11,11,11,.18);margin:4px auto 16px;cursor:grab}' +
        '@media (min-width:760px){.grab{display:none}}' +
        '.x{position:absolute;top:18px;left:18px;width:34px;height:34px;border-radius:50%;border:0;background:rgba(11,11,11,.07);cursor:pointer;display:grid;place-items:center}' +
        '.x:before,.x:after{content:"";position:absolute;width:13px;height:2px;border-radius:2px;background:' + INK + ';transform:rotate(45deg)}.x:after{transform:rotate(-45deg)}' +
        '.x:active{transform:scale(.92)}' +
        'h2{margin:0 0 6px;font:700 clamp(30px,4vw,40px)/1 ' + FD + ';letter-spacing:-.035em;color:' + INK + '}' +
        'p{margin:0 0 20px;font:400 16px/1.45 ' + FT + ';color:#55534d}' +
        '.lbl{font:700 13px ' + FT + ';color:#77736B;margin:0 0 10px}' +
        '.chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px}' +
        '.chip{border:1.5px solid rgba(11,11,11,.14);background:#fff;border-radius:99px;padding:10px 14px;font:700 14px ' + FT + ';color:' + INK + ';cursor:pointer;transition:background .16s ease,border-color .16s ease,transform .12s ease;-webkit-tap-highlight-color:transparent}' +
        '.chip:active{transform:scale(.96)}.chip[aria-pressed="true"]{background:' + INK + ';color:' + LIME + ';border-color:' + INK + '}' +
        '.f{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}' +
        'input{width:100%;box-sizing:border-box;border:1.5px solid rgba(11,11,11,.14);background:#fff;border-radius:16px;padding:15px 16px;font:400 16px ' + FT + ';color:' + INK + ';outline:none;transition:border-color .16s ease,box-shadow .16s ease;direction:rtl}' +
        'input:focus{border-color:' + INK + ';box-shadow:0 0 0 4px rgba(217,255,67,.55)}' +
        'input[aria-invalid="true"]{border-color:#c43b2f}' +
        '.go{width:100%;border:0;border-radius:99px;padding:18px;background:' + LIME + ';color:' + INK + ';font:700 19px ' + FD + ';cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:transform .12s ease}' +
        '.go:active{transform:scale(.97)}' +
        '.note{margin-top:12px;text-align:center;font:400 13px ' + FT + ';color:#77736B}' +
        '.done{display:none;text-align:center;padding:30px 0 10px}.done svg{width:64px;height:64px}' +
        '.done .c{stroke-dasharray:190;stroke-dashoffset:190;transition:stroke-dashoffset .6s ' + EASE + '}.done .k{stroke-dasharray:40;stroke-dashoffset:40;transition:stroke-dashoffset .35s ' + EASE + ' .45s}' +
        '.sent .form{display:none}.sent .done{display:block}.sent .done .c,.sent .done .k{stroke-dashoffset:0}' +
        '@media (max-width:420px){.f{grid-template-columns:1fr}}' +
        '</style><div class="scrim"></div>' +
        '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="t" tabindex="-1"><div class="grab"></div><button class="x" aria-label="סגירה"></button>' +
        '<div class="form"><h2 id="t">יש משהו בעסק שצריך לזוז?</h2><p>נדבר, נבין מה נכון ונחליט על הצעד הבא.</p>' +
        '<div class="lbl">מה מביא אתכם אלינו?</div><div class="chips">' + NEEDS.map(function (n) { return '<button class="chip" aria-pressed="false">' + esc(n) + '</button>'; }).join('') + '</div>' +
        '<div class="f"><input name="n" placeholder="שם מלא" autocomplete="name"><input name="p" placeholder="טלפון" inputmode="tel" autocomplete="tel"></div>' +
        '<button class="go">שלחו בוואטסאפ</button><div class="note">ממשיכים ישר בוואטסאפ, עם דין.</div></div>' +
        '<div class="done"><svg viewBox="0 0 64 64" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle class="c" cx="32" cy="32" r="29" fill="' + LIME + '"/><path class="k" d="M20 33l8 8 16-17"/></svg><h2 style="margin-top:14px">מעולה. נתראה בוואטסאפ.</h2><p>ההודעה מוכנה. רק ללחוץ שליחה.</p></div></div>';
      var scrim = root.querySelector('.scrim'), sheet = root.querySelector('.sheet'), x = root.querySelector('.x');
      var chips = Array.prototype.slice.call(root.querySelectorAll('.chip')), inputs = root.querySelectorAll('input');
      this.pos = new Spring(1, 0.35, 1);                        // 0 = open, 1 = closed (fraction of the sheet's height)
      var wide = function () { return innerWidth >= 760; };
      var lastFocus = null, isOpen = false;
      var paint = function () {
        var p = self.pos.x, h = sheet.offsetHeight || 1;
        scrim.style.opacity = clamp(1 - p, 0, 1).toFixed(3);
        if (wide()) {
          var e = clamp(p, 0, 1);
          sheet.style.transform = 'translate(-50%,-50%) translateY(' + (e * 24).toFixed(1) + 'px) scale(' + (1 - e * 0.04).toFixed(4) + ')';
          sheet.style.opacity = (1 - e).toFixed(3);
        } else { sheet.style.opacity = '1'; sheet.style.transform = 'translateY(' + (p * (h + 30)).toFixed(1) + 'px)'; }
      };
      var run = ticker(function (dt) { var g = self.pos.step(dt); paint(); if (!g && self.pos.t === 1) { self.style.pointerEvents = 'none'; self.style.visibility = 'hidden'; } return g; });
      this.open = function () {
        if (isOpen) return; isOpen = true; lastFocus = document.activeElement;
        self.style.visibility = 'visible'; self.style.pointerEvents = 'auto';
        root.querySelector('.sheet').classList.remove('sent');
        self.pos.t = 0; self.pos.d = 1; self.pos.r = wide() ? 0.32 : 0.36;
        if (RM) self.pos.x = 0;
        run(); setTimeout(function () { sheet.focus({ preventScroll: true }); }, 30);
        document.documentElement.style.overflow = 'hidden';
      };
      this.close = function (v) {
        if (!isOpen) return; isOpen = false; self.pos.t = 1;
        if (v !== undefined) self.pos.v = v;
        if (RM) self.pos.x = 1;
        run(); document.documentElement.style.overflow = '';
        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      };
      this.style.visibility = 'hidden'; paint();
      scrim.addEventListener('click', function () { self.close(); });
      x.addEventListener('click', function () { self.close(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) self.close(); });
      root.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {                                   // keep focus inside the sheet
          var f = Array.prototype.slice.call(sheet.querySelectorAll('button,input')).filter(function (el) { return el.offsetParent; });
          var first = f[0], last = f[f.length - 1], cur = root.activeElement;
          if (e.shiftKey && cur === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && cur === last) { e.preventDefault(); first.focus(); }
        }
      });
      chips.forEach(function (c) { c.addEventListener('click', function () { c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); }); });
      root.querySelector('.go').addEventListener('click', function () {
        var name = inputs[0].value.trim(), tel = inputs[1].value.trim(), ok = true;
        inputs[0].setAttribute('aria-invalid', name ? 'false' : 'true'); if (!name) ok = false;
        inputs[1].setAttribute('aria-invalid', /\d{7,}/.test(tel.replace(/\D/g, '')) ? 'false' : 'true'); if (!/\d{7,}/.test(tel.replace(/\D/g, ''))) ok = false;
        if (!ok) { (name ? inputs[1] : inputs[0]).focus(); return; }
        var need = chips.filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; }).map(function (c) { return '• ' + c.textContent; }).join('\n');
        var msg = 'היי דין, הגעתי מהאתר.\n' + (need ? need + '\n' : '') + 'שם: ' + name + '\nטלפון: ' + tel;
        sheet.classList.add('sent');
        setTimeout(function () { window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank', 'noopener'); }, 650);
      });
      // drag to dismiss (phones): 1:1 from the grab point, rubber-band upward, projected flick
      var drag = null;
      sheet.addEventListener('pointerdown', function (e) {
        if (wide() || e.target.closest('input,button:not(.grab)')) return;
        if (sheet.scrollTop > 0 && !e.target.closest('.grab')) return;
        drag = { y0: e.clientY, p0: self.pos.x, h: [[performance.now(), e.clientY]], moved: false };
        sheet.setPointerCapture(e.pointerId); self.pos.t = self.pos.x; self.pos.v = 0;
      });
      sheet.addEventListener('pointermove', function (e) {
        if (!drag) return;
        var dy = e.clientY - drag.y0, H = sheet.offsetHeight + 30;
        if (!drag.moved && Math.abs(dy) < 6) return; drag.moved = true;
        drag.h.push([performance.now(), e.clientY]); if (drag.h.length > 12) drag.h.shift();
        var p = drag.p0 + dy / H; if (p < 0) p = -rubber(-p, 1, 0.12);
        self.pos.x = self.pos.t = p; paint();
      });
      var end = function () {
        if (!drag) return; var d = drag; drag = null; if (!d.moved) return;
        var v = velocity(d.h), H = sheet.offsetHeight + 30;
        var proj = self.pos.x + project(v) / H;
        if (proj > 0.5) self.close(v / H); else { self.pos.t = 0; self.pos.v = v / H; self.pos.d = 0.8; run(); }
      };
      sheet.addEventListener('pointerup', end); sheet.addEventListener('pointercancel', end);
      document.addEventListener('click', function (e) {
        var t = e.target.closest && e.target.closest('[data-dna-sheet]');
        if (t) { e.preventDefault(); self.open(); }
      });
    }
  }

  /* ==========================================================================
     <dna-compare before="raw.webp" after="final.webp" label-before="לפני" label-after="אחרי" start="0.5">
     ========================================================================== */
  class DnaCompare extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = 1;
      var self = this, root = this.attachShadow({ mode: 'open' });
      var lb = this.getAttribute('label-before') || 'לפני', la = this.getAttribute('label-after') || 'אחרי';
      root.innerHTML = '<style>:host{display:block;position:relative;aspect-ratio:' + (this.getAttribute('ratio') || '4/5') + ';border-radius:26px;overflow:hidden;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:ew-resize;background:#ddd}' +
        'img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}' +
        '.after{clip-path:inset(0 0 0 50%)}' +
        '.line{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:#fff;box-shadow:0 0 12px rgba(0,0,0,.25)}' +
        '.knob{position:absolute;top:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:rgba(255,255,255,.72);backdrop-filter:blur(14px) saturate(160%);-webkit-backdrop-filter:blur(14px) saturate(160%);box-shadow:0 8px 24px rgba(0,0,0,.25),inset 0 0 0 1px rgba(255,255,255,.7);display:grid;place-items:center;transition:transform .16s ' + EASE + '}' +
        '.knob:before,.knob:after{content:"";position:absolute;width:8px;height:8px;border-top:2.5px solid ' + INK + ';border-left:2.5px solid ' + INK + ';top:50%;margin-top:-5px}' +
        '.knob:before{left:12px;transform:rotate(-45deg)}.knob:after{right:12px;transform:rotate(135deg)}' +
        ':host(:active) .knob{transform:scale(.92)}' +
        '.tag{position:absolute;top:16px;padding:7px 12px;border-radius:99px;font:700 13px ' + FT + ';background:rgba(11,11,11,.55);color:#fff;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transition:opacity .2s ease}' +
        '.tb{left:16px}.ta{right:16px;background:' + LIME + ';color:' + INK + '}' +
        ':host(:focus-visible){outline:2px solid ' + LIME + ';outline-offset:4px}</style>' +
        '<img class="before" alt="' + esc(lb) + '" src="' + esc(this.getAttribute('before') || '') + '"><img class="after" alt="' + esc(la) + '" src="' + esc(this.getAttribute('after') || '') + '">' +
        '<div class="tag tb">' + esc(lb) + '</div><div class="tag ta">' + esc(la) + '</div><div class="line"></div><div class="knob"></div>';
      var after = root.querySelector('.after'), line = root.querySelector('.line'), knob = root.querySelector('.knob'), tb = root.querySelector('.tb'), ta = root.querySelector('.ta');
      this.tabIndex = 0; this.setAttribute('role', 'slider'); this.setAttribute('aria-label', lb + ' / ' + la); this.setAttribute('aria-valuemin', '0'); this.setAttribute('aria-valuemax', '100');
      this.s = new Spring(parseFloat(this.getAttribute('start') || '0.5'), 0.3, 1);
      var paint = function () {
        var p = clamp(self.s.x, 0, 1), pc = (p * 100).toFixed(2) + '%';
        after.style.clipPath = 'inset(0 0 0 ' + pc + ')'; line.style.left = pc; knob.style.left = pc;
        tb.style.opacity = p < 0.12 ? '0' : '1'; ta.style.opacity = p > 0.88 ? '0' : '1';
        self.setAttribute('aria-valuenow', Math.round(p * 100));
      };
      var run = ticker(function (dt) { var g = self.s.step(dt); paint(); return g; });
      var at = function (e) { var r = self.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 1); };
      var drag = null;
      this.addEventListener('pointerdown', function (e) { self.setPointerCapture(e.pointerId); drag = 1; self.hinted = 1; self.s.t = at(e); self.s.d = 1; run(); });
      this.addEventListener('pointermove', function (e) { if (!drag) return; self.s.x = self.s.t = at(e); self.s.v = 0; paint(); });
      var up = function () { drag = null; };
      this.addEventListener('pointerup', up); this.addEventListener('pointercancel', up);
      this.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); self.s.t = clamp(self.s.t + (e.key === 'ArrowRight' ? 0.05 : -0.05), 0, 1); run(); }
      });
      // once, when first seen: a small nudge that explains the handle, then it settles back
      new IntersectionObserver(function (en, io) {
        if (!en[0].isIntersecting || RM) return; io.disconnect();
        setTimeout(function () { if (self.hinted) return; var s0 = self.s.t; self.s.t = s0 + 0.12; run(); setTimeout(function () { if (!self.hinted) { self.s.t = s0; self.s.d = 0.8; run(); } }, 420); }, 500);
      }, { threshold: 0.6 }).observe(this);
      paint();
    }
  }

  /* ==========================================================================
     <dna-glow radius="28"> …any element… </dna-glow>
     A living light around the edge, in the brand's lime.
     ========================================================================== */
  var glowCSS = '@property --dna-a{syntax:"<angle>";initial-value:0deg;inherits:false}' +
    'dna-glow{--r:28px;display:block;position:relative;border-radius:var(--r);isolation:isolate}' +
    'dna-glow::before,dna-glow::after{content:"";position:absolute;inset:-2px;border-radius:calc(var(--r) + 2px);z-index:-1;pointer-events:none;' +
    'background:conic-gradient(from var(--dna-a),#D9FF43,#F4FFB8,#9FD11C,#ffffff,#C6F03A,#7BA21A,#D9FF43);animation:dna-spin 6s linear infinite}' +
    'dna-glow::after{inset:-10px;border-radius:calc(var(--r) + 10px);filter:blur(22px);opacity:.75}' +
    'dna-glow>*{position:relative;border-radius:var(--r)}' +
    '@keyframes dna-spin{to{--dna-a:360deg}}' +
    '@media (prefers-reduced-motion:reduce){dna-glow::before,dna-glow::after{animation:none}}';
  class DnaGlow extends HTMLElement {
    connectedCallback() {
      if (!document.getElementById('dna-glow-css')) { var s = document.createElement('style'); s.id = 'dna-glow-css'; s.textContent = glowCSS; document.head.appendChild(s); }
      if (this.getAttribute('radius')) this.style.setProperty('--r', this.getAttribute('radius') + 'px');
    }
  }

  /* ==========================================================================
     <dna-faq> wraps plain <details>. Works without JS; with it, answers open
     and close on the transform/opacity track and can be interrupted mid-way.
     ========================================================================== */
  var faqCSS = 'dna-faq details{border-top:1px solid rgba(11,11,11,.12)}dna-faq details:last-child{border-bottom:1px solid rgba(11,11,11,.12)}' +
    'dna-faq summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:24px 2px;font:700 clamp(20px,2vw,26px)/1.2 ' + FD + ';letter-spacing:-.02em}' +
    'dna-faq summary::-webkit-details-marker{display:none}dna-faq summary>svg{display:none}dna-faq summary>span:first-child{font:700 13px '+FT+';letter-spacing:.12em;color:#77736B;margin-inline-end:14px}' +
    'dna-faq summary{justify-content:flex-start}dna-faq summary .pm{margin-inline-start:auto}' +
    'dna-faq summary .pm{flex:0 0 auto;width:34px;height:34px;border-radius:50%;background:rgba(11,11,11,.06);position:relative;transition:background .2s ease,transform .3s ' + EASE + '}' +
    'dna-faq summary .pm:before,dna-faq summary .pm:after{content:"";position:absolute;left:50%;top:50%;width:13px;height:2px;margin:-1px 0 0 -6.5px;border-radius:2px;background:currentColor;transition:transform .3s ' + EASE + '}' +
    'dna-faq summary .pm:after{transform:rotate(90deg)}' +
    'dna-faq details.open summary .pm{background:' + LIME + ';transform:rotate(180deg)}dna-faq details.open summary .pm:after{transform:rotate(0)}' +
    'dna-faq .dna-a{display:grid;grid-template-rows:0fr;transition:grid-template-rows .32s ' + EASE + '}' +
    'dna-faq .dna-a>div{overflow:hidden;opacity:0;transform:translateY(-6px);transition:opacity .25s ease,transform .32s ' + EASE + '}' +
    'dna-faq details.open .dna-a{grid-template-rows:1fr}dna-faq details.open .dna-a>div{opacity:1;transform:none}' +
    'dna-faq .dna-a>div>*{margin:0;padding:0 2px 24px;font:400 18px/1.55 ' + FT + ';color:#4a4843;max-width:62ch}' +
    '@media (hover:hover) and (pointer:fine){dna-faq summary:hover .pm{background:rgba(11,11,11,.12)}dna-faq details.open summary:hover .pm{background:' + LIME + '}}' +
    '@media (prefers-reduced-motion:reduce){dna-faq .dna-a,dna-faq .dna-a>div,dna-faq summary .pm,dna-faq summary .pm:before,dna-faq summary .pm:after{transition-duration:.01s}}';
  class DnaFaq extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = 1;
      if (!document.getElementById('dna-faq-css')) { var s = document.createElement('style'); s.id = 'dna-faq-css'; s.textContent = faqCSS; document.head.appendChild(s); }
      var single = this.hasAttribute('single');
      var all = Array.prototype.slice.call(this.querySelectorAll('details'));
      all.forEach(function (d) {
        var sum = d.querySelector('summary'); if (!sum) return; var was = d.hasAttribute('open');
        var pm = document.createElement('span'); pm.className = 'pm'; pm.setAttribute('aria-hidden', 'true'); sum.appendChild(pm);
        var body = document.createElement('div'); body.className = 'dna-a'; var inner = document.createElement('div');
        while (sum.nextSibling) inner.appendChild(sum.nextSibling);
        body.appendChild(inner); d.appendChild(body);
        d.open = true;                                          // content stays in the accessibility tree; state lives in .open
        var set = function (on) { d.classList.toggle('open', on); sum.setAttribute('aria-expanded', on ? 'true' : 'false'); inner.inert = !on; };
        set(was);
        sum.addEventListener('click', function (e) {
          e.preventDefault(); var on = !d.classList.contains('open');
          if (on && single) all.forEach(function (o) { if (o !== d && o.classList.contains('open')) o.__set(false); });
          set(on);
        });
        d.__set = set;
      });
    }
  }

  customElements.define('dna-os-story', DnaOsStory);
  customElements.define('dna-sheet', DnaSheet);
  customElements.define('dna-compare', DnaCompare);
  customElements.define('dna-glow', DnaGlow);
  customElements.define('dna-faq', DnaFaq);
})();
