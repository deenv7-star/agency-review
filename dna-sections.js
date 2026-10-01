/* ============================================================================
   DNA SECTIONS — set 6. Replacements for the weakest parts of hellodna.co.il
     <dna-os-live></dna-os-live>      DNA OS you can click — replaces the screenshot laptop story
     <dna-steps></dna-steps>          "ככה עובדים יחד" — four steps on one thread that draws as you scroll
     <dna-stepform>…form…</dna-stepform>  wraps the existing #lead-form, one question per screen
     <dna-signoff src></dna-signoff>  a giant DNA wordmark that rises at the end of the page
   All Hebrew copy comes from the site. DNA OS shows demo data and says so.
   ========================================================================== */
(function () {
  'use strict';
  if (!window.customElements || window.__dnaSections) return; window.__dnaSections = 1;
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FD = '"Tel Aviv Brutalist","Heebo",Arial,sans-serif', FT = '"Tel Aviv Modernist","Heebo",Arial,sans-serif';
  var EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function define(name, proto) {
    function C() { return Reflect.construct(HTMLElement, [], C); }
    C.prototype = Object.create(HTMLElement.prototype); C.prototype.constructor = C;
    Object.setPrototypeOf(C, HTMLElement);
    for (var k in proto) C.prototype[k] = proto[k];
    customElements.define(name, C);
  }
  function countUp(el, to, ms, fmt) {
    if (RM) { el.textContent = fmt(to); return; }
    var t0 = performance.now();
    (function f(now) {
      var p = clamp((now - t0) / ms, 0, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(to * e));
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  }
  var nf = function (n) { return n.toLocaleString('en-US'); };

  /* ==========================================================================
     <dna-os-live> — the real thing instead of a picture of it
     ======================================================================== */
  var ICON = {
    home: '<path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    leads: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/>',
    camp: '<path d="M4 10v4a1 1 0 0 0 1 1h2l6 4V5L7 9H5a1 1 0 0 0-1 1z"/><path d="M17 9a4 4 0 0 1 0 6"/>',
    next: '<path d="M5 12h12M13 6l6 6-6 6"/>'
  };
  function ic(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICON[n] + '</svg>'; }
  var LEADS = [
    ['מיכל ל.', 'אירוע פרטי · 40 איש', 'גוגל', 'חדש'],
    ['רועי ב.', 'ארוחת צוות', 'אינסטגרם', 'נקבעה שיחה'],
    ['נועה ש.', 'קייטרינג לכנס', 'וואטסאפ', 'חדש'],
    ['אבי מ.', 'יום הולדת 50', 'גוגל', 'נסגר'],
    ['דנה ק.', 'סדנת קפה', 'אתר', 'נקבעה שיחה'],
    ['יוסי ר.', 'הזמנה קבוצתית', 'פייסבוק', 'חדש']
  ];
  var OSCSS = [
    ':host{display:block;direction:rtl;font-family:' + FT + ';--ink:#0B0B0B;--paper:#F2F0EA;--lime:#D9FF43;color:var(--ink)}',
    '*{box-sizing:border-box}',
    '.dev{position:relative;max-width:1120px;margin:0 auto;padding:14px;border-radius:30px;background:#0B0B0B;box-shadow:0 50px 100px -40px rgba(0,0,0,.45),inset 0 0 0 1px rgba(255,255,255,.08)}',
    '.app{position:relative;display:grid;grid-template-columns:210px 1fr;aspect-ratio:16/9.6;border-radius:18px;overflow:hidden;background:#FAF9F5}',
    'nav{background:#F2F0EA;border-left:1px solid rgba(0,0,0,.06);padding:22px 14px;display:flex;flex-direction:column;gap:4px}',
    '.brand{display:flex;align-items:center;gap:8px;font:700 15px/1 ' + FD + ';padding:0 10px 18px}',
    '.brand i{width:9px;height:9px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 3px rgba(217,255,67,.35)}',
    'nav button{appearance:none;border:0;background:none;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;font:700 14px/1 ' + FT + ';color:rgba(11,11,11,.55);cursor:pointer;text-align:right;transition:background-color .3s ' + EASE + ',color .3s ' + EASE + ';-webkit-tap-highlight-color:transparent}',
    'nav button svg{width:18px;height:18px;flex:none}',
    'nav button[aria-selected=true]{background:var(--ink);color:#fff}',
    'nav button[aria-selected=true] svg{color:var(--lime)}',
    '@media (hover:hover) and (pointer:fine){nav button:not([aria-selected=true]):hover{background:rgba(0,0,0,.05);color:var(--ink)}}',
    'nav button:focus-visible{outline:2px solid var(--ink);outline-offset:2px}',
    '.client{margin-top:auto;padding:12px;border-radius:14px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.06);font:700 12px/1.3 ' + FT + '}',
    '.client span{display:block;font-weight:400;opacity:.55;font-size:11px}',
    'main{position:relative;overflow:hidden}',
    '.top{display:flex;align-items:center;justify-content:space-between;padding:22px 28px 0}',
    '.top h4{margin:0;font:700 26px/1 ' + FD + ';letter-spacing:-.02em}',
    '.top small{display:block;margin-top:6px;font:400 12px ' + FT + ';opacity:.55}',
    '.demo{white-space:nowrap;flex:none;padding:6px 10px;border-radius:999px;background:var(--lime);font:700 10px/1 ' + FT + ';letter-spacing:.08em}',
    '.v{position:absolute;inset:78px 28px 24px;opacity:0;transform:translateY(10px);transition:opacity .45s ' + EASE + ',transform .55s ' + EASE + ';pointer-events:none}',
    '.v.on{opacity:1;transform:none;pointer-events:auto}',
    /* overview */
    '.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}',
    '.k{padding:16px;border-radius:16px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.06)}',
    '.k small{display:block;font:700 11px/1.2 ' + FT + ';opacity:.55;margin-bottom:14px}',
    '.k b{display:block;font:700 30px/1 ' + FD + ';letter-spacing:-.02em;direction:ltr;text-align:right}',
    '.k em{display:inline-block;margin-top:10px;padding:4px 8px;border-radius:999px;background:#EEF9C9;font:700 10px/1 ' + FT + ';font-style:normal}',
    '.row2{display:grid;grid-template-columns:1.35fr 1fr;gap:12px;margin-top:12px;height:calc(100% - 128px)}',
    '.card{position:relative;padding:16px 18px;border-radius:16px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.06);overflow:hidden}',
    '.card h5{margin:0 0 10px;font:700 14px/1 ' + FT + '}',
    '.chart{position:absolute;inset:44px 14px 14px}',
    '.chart svg{width:100%;height:100%;overflow:visible}',
    '.feed{list-style:none;margin:0;padding:0}',
    '.feed li{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid rgba(0,0,0,.06);font:400 12px/1.4 ' + FT + ';opacity:0;transform:translateY(6px);transition:opacity .4s ' + EASE + ',transform .5s ' + EASE + '}',
    '.feed li.on{opacity:1;transform:none}',
    '.feed li i{flex:none;width:7px;height:7px;margin-top:5px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 2px rgba(11,11,11,.08)}',
    '.feed li span{display:block;opacity:.45;font-size:10.5px}',
    /* leads */
    '.tbl{border-radius:16px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.06);overflow:hidden}',
    '.tr{display:grid;grid-template-columns:1.1fr 1.4fr .9fr 1fr;align-items:center;gap:10px;padding:13px 18px;border-bottom:1px solid rgba(0,0,0,.06);font:400 13px/1.2 ' + FT + '}',
    '.tr.h{font-weight:700;font-size:11px;opacity:.5;padding-block:11px}',
    '.tr b{font-weight:700}',
    '.tr.new{animation:pop 1.6s ' + EASE + '}',
    '@keyframes pop{0%{background:rgba(217,255,67,.55);transform:translateY(-8px);opacity:0}30%{opacity:1;transform:none}100%{background:transparent}}',
    '.st{justify-self:start;padding:5px 9px;border-radius:999px;font:700 11px/1 ' + FT + ';background:#F2F0EA}',
    '.st.s0{background:var(--lime)}.st.s1{background:#0B0B0B;color:#fff}',
    /* campaigns */
    '.camps{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}',
    '.cp{border-radius:16px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.06);overflow:hidden}',
    '.cp .im{height:118px;background:#ddd center/cover}',
    '.cp .bd{padding:14px 16px}',
    '.cp h6{margin:0 0 4px;font:700 14px/1.2 ' + FT + '}',
    '.cp p{margin:0 0 12px;font:400 11px/1.3 ' + FT + ';opacity:.55}',
    '.bar{height:6px;border-radius:6px;background:#F2F0EA;overflow:hidden}',
    '.bar i{display:block;height:100%;border-radius:inherit;background:var(--ink);transform-origin:100% 50%;transform:scaleX(0);transition:transform 1.4s ' + EASE + '}',
    '.cp .meta{display:flex;justify-content:space-between;margin-top:8px;font:700 10.5px/1 ' + FT + ';opacity:.6}',
    '.live{display:inline-flex;align-items:center;gap:6px;font:700 10.5px/1 ' + FT + '}',
    '.live:before{content:"";width:7px;height:7px;border-radius:50%;background:#2ecc71;animation:pl 1.6s infinite}',
    '@keyframes pl{50%{opacity:.3}}',
    /* next move */
    '.nx{max-width:620px;margin:6px auto 0;padding:26px;border-radius:22px;background:#0B0B0B;color:#fff;box-shadow:0 30px 60px -30px rgba(0,0,0,.5)}',
    '.nx small{display:inline-block;padding:6px 10px;border-radius:999px;background:var(--lime);color:var(--ink);font:700 10px/1 ' + FT + ';letter-spacing:.08em}',
    '.nx h5{margin:16px 0 10px;font:700 clamp(22px,2.4vw,34px)/1.1 ' + FD + ';letter-spacing:-.02em}',
    '.nx p{margin:0;font:400 14px/1.55 ' + FT + ';opacity:.7}',
    '.why{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}',
    '.why span{padding:7px 10px;border-radius:999px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);font:700 11px/1 ' + FT + ';opacity:.85}',
    '.acts{display:flex;gap:10px;margin-top:22px}',
    '.acts button{appearance:none;border:0;padding:12px 18px;border-radius:999px;font:700 13px/1 ' + FT + ';cursor:pointer;transition:transform .25s ' + EASE + ',background-color .3s ' + EASE + '}',
    '.acts button:active{transform:scale(.96)}',
    '.acts .ok{background:var(--lime);color:var(--ink)}.acts .tk{background:rgba(255,255,255,.1);color:#fff}',
    '.acts button:focus-visible{outline:2px solid #fff;outline-offset:2px}',
    '.done{display:flex;align-items:center;gap:10px;margin-top:22px;font:700 14px ' + FT + ';color:var(--lime)}',
    '.done svg{width:22px;height:22px}',
    '.done path{stroke-dasharray:30;stroke-dashoffset:30;animation:dr .6s ' + EASE + ' forwards}',
    '@keyframes dr{to{stroke-dashoffset:0}}',
    /* responsive: becomes a phone app with a bottom tab bar */
    '@media (max-width:860px){.app{grid-template-columns:1fr;grid-template-rows:1fr auto;aspect-ratio:auto;height:600px}',
    ' .dev{padding:10px;border-radius:30px;max-width:420px}',
    ' nav{order:2;flex-direction:row;justify-content:space-around;padding:8px;border-left:0;border-top:1px solid rgba(0,0,0,.06)}',
    ' .brand,.client{display:none}',
    ' nav button{flex-direction:column;gap:5px;padding:8px 6px;font-size:10.5px;flex:1}',
    ' nav button[aria-selected=true]{background:transparent;color:var(--ink)}nav button[aria-selected=true] svg{color:var(--ink)}',
    ' nav button[aria-selected=true]:after{content:"";width:16px;height:3px;border-radius:3px;background:var(--lime)}',
    ' .top{padding:18px 18px 0}.top h4{font-size:22px}',
    ' .v{inset:70px 14px 14px;overflow:hidden}',
    ' .kpis{grid-template-columns:1fr 1fr;gap:8px}.k{padding:12px}.k b{font-size:24px}.k small{margin-bottom:8px}',
    ' .row2{grid-template-columns:1fr;height:auto;margin-top:8px}.row2 .card:last-child{display:none}.card{height:200px}',
    ' .tr{grid-template-columns:1fr auto;padding:12px 14px}.tr .d,.tr .s{display:none}.tr.h{display:none}',
    ' .camps{grid-template-columns:1fr;gap:8px}.cp{display:grid;grid-template-columns:96px 1fr}.cp .im{height:auto}.cp .bd{padding:12px}',
    ' .nx{padding:20px}.acts{flex-direction:column}}'
  ].join('');

  define('dna-os-live', {
    connectedCallback: function () {
      if (this._r) return; this._r = 1;
      var self = this, B = this.getAttribute('base') || 'media/';
      var imgs = (this.getAttribute('data-camp-images') || 'portfolio-curated/beauty-portrait.webp,portfolio-curated/rope-fragrance.webp,portfolio-curated/jewelry-shadow.webp').split(',');
      var root = this.attachShadow({ mode: 'open' });
      var tabs = [['home', 'סקירה', 'בוקר טוב, קפה הדקל', 'זו התמונה של היום.'], ['leads', 'לידים', 'לידים', 'כל פנייה, ממי ומאיפה.'], ['camp', 'קמפיינים', 'קמפיינים', 'מה רץ עכשיו ואיפה הכסף.'], ['next', 'הצעד הבא', 'הצעד הבא', 'החלטה אחת ברורה לשבוע הבא.']];
      root.innerHTML = '<style>' + OSCSS + '</style><div class="dev"><div class="app">' +
        '<nav role="tablist" aria-label="DNA OS"><div class="brand"><i></i>DNA OS</div>' +
        tabs.map(function (t, i) { return '<button role="tab" type="button" aria-selected="' + (i ? 'false' : 'true') + '" tabindex="' + (i ? -1 : 0) + '" data-i="' + i + '">' + ic(t[0]) + '<span>' + t[1] + '</span></button>'; }).join('') +
        '<div class="client">קפה הדקל<span>לקוח לדוגמה</span></div></nav>' +
        '<main><div class="top"><div><h4></h4><small></small></div><span class="demo">נתוני דוגמה</span></div>' +
        // overview
        '<section class="v" data-v="0"><div class="kpis">' +
        [['קמפיינים פעילים', 4, '', '+1 השבוע'], ['לידים החודש', 63, '', '+18% מול חודש קודם'], ['הוצאה החודש', 11240, '₪', '62% מהתקציב'], ['משימות פתוחות', 7, '', '2 מחכות לאישור שלך']].map(function (k) {
          return '<div class="k"><small>' + k[0] + '</small><b data-to="' + k[1] + '" data-pre="' + k[2] + '">0</b><em>' + k[3] + '</em></div>';
        }).join('') + '</div><div class="row2"><div class="card"><h5>לידים לפי שבוע</h5><div class="chart"></div></div>' +
        '<div class="card"><h5>מה קרה לאחרונה</h5><ul class="feed">' +
        [['ליד חדש מגוגל: פגישת טעימות', 'לפני שעתיים'], ['גרסה 3 של סרט הקמפיין עלתה לבקרה', 'היום, 08:15'], ['קמפיין החיפוש ניצל את התקציב היומי', 'אתמול, 21:47'], ['תובנה חדשה נוספה ל-DNA PULSE', 'אתמול, 14:03']].map(function (f) {
          return '<li><i></i><div>' + f[0] + '<span>' + f[1] + '</span></div></li>';
        }).join('') + '</ul></div></div></section>' +
        // leads
        '<section class="v" data-v="1"><div class="tbl"><div class="tr h"><span>שם</span><span class="d">פנייה</span><span class="s">מקור</span><span>סטטוס</span></div><div class="rows"></div></div></section>' +
        // campaigns
        '<section class="v" data-v="2"><div class="camps">' +
        [['חיפוש · אירועים', 'גוגל', 0.62], ['רילס · תפריט סתיו', 'אינסטגרם', 0.41], ['ריטרגטינג · אתר', 'מטא', 0.78]].map(function (c, i) {
          return '<div class="cp"><div class="im" style="background-image:url(' + esc(B + (imgs[i] || imgs[0])) + ')"></div><div class="bd"><h6>' + c[0] + '</h6><p>' + c[1] + '</p><div class="bar"><i data-p="' + c[2] + '"></i></div><div class="meta"><span class="live">פעיל</span><span>' + Math.round(c[2] * 100) + '% מהתקציב</span></div></div></div>';
        }).join('') + '</div></section>' +
        // next move
        '<section class="v" data-v="3"><div class="nx"><small>ההמלצה לשבוע הבא</small><h5>להעביר ₪1,500 מטיקטוק לקמפיין החיפוש</h5><p>החיפוש מביא פניות לאירועים בעלות נמוכה יותר. טיקטוק מביא חשיפה, אבל פחות פניות.</p><div class="why"><span>לידים מחיפוש</span><span>עלות לפנייה</span><span>תקציב שבועי</span></div><div class="acts"><button class="ok" type="button">מאשרים</button><button class="tk" type="button">נדבר על זה</button></div></div></section>' +
        '</main></div></div>';
      this._tabs = tabs;
      this._btn = [].slice.call(root.querySelectorAll('nav button'));
      this._v = [].slice.call(root.querySelectorAll('.v'));
      this._h = root.querySelector('.top h4'); this._s = root.querySelector('.top small');
      this._root = root; this._cur = -1; this._auto = !RM; this._vis = false;
      this._btn.forEach(function (b, i) {
        b.addEventListener('click', function () { self.show(i, true); });
        b.addEventListener('keydown', function (e) {
          var d = { ArrowDown: 1, ArrowLeft: 1, ArrowUp: -1, ArrowRight: -1 }[e.key]; if (!d) return;
          e.preventDefault(); var j = (i + d + 4) % 4; self.show(j, true); self._btn[j].focus();
        });
      });
      var acts = root.querySelector('.acts');
      root.querySelector('.ok').addEventListener('click', function () {
        self._auto = false; clearTimeout(self._t);
        acts.outerHTML = '<div class="done"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 12.6l4.7 4.7L19.2 7.4"/></svg>אושר. נעדכן אתכם כשזה רץ.</div>';
      });
      root.querySelector('.tk').addEventListener('click', function () {
        var c = document.querySelector('#contact'); if (c) c.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
      });
      new IntersectionObserver(function (es) {
        self._vis = es[0].isIntersecting;
        if (self._vis && self._cur < 0) self.show(0, false);
        else self._sched();
      }, { threshold: 0.35 }).observe(this);
    },
    _sched: function () {
      var self = this; clearTimeout(this._t);
      if (!this._auto || !this._vis) return;
      this._t = setTimeout(function () { self.show((self._cur + 1) % 4, false); }, this._cur === 1 ? 7000 : 5200);
    },
    show: function (i, user) {
      if (user) this._auto = false;
      var r = this._root, t = this._tabs[i];
      clearInterval(this._li);
      this._btn.forEach(function (b, k) { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
      this._v.forEach(function (v, k) { v.classList.toggle('on', k === i); });
      this._h.textContent = t[2]; this._s.textContent = t[3];
      var first = !this['_seen' + i]; this['_seen' + i] = 1;
      if (i === 0) {
        if (first) [].slice.call(r.querySelectorAll('.k b')).forEach(function (b) { var pre = b.getAttribute('data-pre'); countUp(b, +b.getAttribute('data-to'), 1200, function (n) { return pre + nf(n); }); });
        this._chart(first);
        [].slice.call(r.querySelectorAll('.feed li')).forEach(function (li, k) { setTimeout(function () { li.classList.add('on'); }, RM ? 0 : 300 + k * 140); });
      }
      if (i === 1) this._leads();
      if (i === 2) [].slice.call(r.querySelectorAll('.bar i')).forEach(function (b) { b.style.transform = 'scaleX(0)'; void b.offsetWidth; setTimeout(function () { b.style.transform = 'scaleX(' + b.getAttribute('data-p') + ')'; }, 60); });
      this._cur = i; this._sched();
    },
    _chart: function () {
      var box = this._root.querySelector('.chart');
      var data = [9, 12, 10, 15, 13, 18, 16, 22], w = 100, h = 60, max = 24;
      var pts = data.map(function (v, i) { return [w - i * (w / (data.length - 1)), h - v / max * h]; });   // RTL: time runs right→left
      var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('');
      var area = d + 'L0 ' + h + 'L' + w + ' ' + h + 'Z';
      box.innerHTML = '<svg viewBox="0 0 100 60" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9FF43" stop-opacity=".55"/><stop offset="1" stop-color="#D9FF43" stop-opacity="0"/></linearGradient></defs>' +
        [15, 30, 45].map(function (y) { return '<line x1="0" x2="100" y1="' + y + '" y2="' + y + '" stroke="rgba(0,0,0,.06)" stroke-width=".4" vector-effect="non-scaling-stroke"/>'; }).join('') +
        '<path d="' + area + '" fill="url(#g)" opacity="0"/><path class="ln" d="' + d + '" fill="none" stroke="#0B0B0B" stroke-width="2" vector-effect="non-scaling-stroke" pathLength="1" stroke-dasharray="1" stroke-dashoffset="' + (RM ? 0 : 1) + '"/></svg>';
      if (RM) { box.querySelector('path').setAttribute('opacity', '1'); return; }
      box.querySelector('.ln').animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1400, easing: 'cubic-bezier(0.65,0,0.35,1)', fill: 'forwards' });
      box.querySelector('path').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 800, delay: 900, fill: 'forwards' });
    },
    _leads: function () {
      var rows = this._root.querySelector('.rows'), n = 0, self = this;
      function html(L, isNew) {
        var s = L[3] === 'חדש' ? 's0' : L[3] === 'נסגר' ? 's1' : '';
        return '<div class="tr' + (isNew ? ' new' : '') + '"><b>' + L[0] + '</b><span class="d">' + L[1] + '</span><span class="s">' + L[2] + '</span><span class="st ' + s + '">' + L[3] + '</span></div>';
      }
      rows.innerHTML = LEADS.slice(2).map(function (L) { return html(L, false); }).join('');
      if (RM) return;
      // two fresh leads arrive while you watch
      this._li = setInterval(function () {
        if (n > 1) { clearInterval(self._li); return; }
        rows.insertAdjacentHTML('afterbegin', html(LEADS[1 - n], true)); n++;
        while (rows.children.length > 6) rows.removeChild(rows.lastChild);
      }, 1500);
    }
  });

  /* ==========================================================================
     <dna-steps> — ככה עובדים יחד. One thread, four steps, scroll draws it.
     ======================================================================== */
  var STEPS = [
    ['01', 'היכרות', 'מבינים מה באמת צריך', 'מה יעזור לעסק עכשיו, לא מה אפשר למכור לכם.', '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2.5"/>'],
    ['02', 'אסטרטגיה', 'סוגרים כיוון', 'מסר, רעיון, מה בונים ואיך נדע אם זה עובד.', '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'],
    ['03', 'הפקה', 'עושים', 'כותבים, מעצבים, בונים, מצלמים ומעלים.', '<rect x="4" y="6" width="16" height="12" rx="2.5"/><path d="m10.5 9.8 4 2.2-4 2.2z"/>'],
    ['04', 'תוצאות', 'רואים מה קרה', 'מסתכלים על הנתונים, לומדים ומשפרים.', '<path d="M4 19h16"/><path d="M7 15v-3M12 15V8M17 15v-5"/>']
  ];
  var STCSS = [
    ':host{display:block;direction:rtl;font-family:' + FT + ';--ink:#0B0B0B;--lime:#D9FF43;color:var(--ink)}',
    '*{box-sizing:border-box}',
    '.hd{display:grid;grid-template-columns:1fr auto;align-items:end;gap:32px;margin-bottom:clamp(36px,5vw,64px)}',
    '.ey{display:block;font:700 11px/1 ' + FT + ';letter-spacing:.16em;opacity:.5;margin-bottom:14px}',
    'h2{margin:0;font:700 clamp(40px,5.4vw,80px)/.95 ' + FD + ';letter-spacing:-.04em}',
    '.hd p{margin:0;max-width:300px;font:400 16px/1.55 ' + FT + ';color:#55534d}',
    '.rail{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}',
    '.th{position:absolute;top:27px;right:28px;left:28px;height:2px;background:rgba(11,11,11,.1);border-radius:2px}',
    '.th i{position:absolute;inset:0;background:var(--ink);transform-origin:100% 50%;transform:scaleX(0);border-radius:inherit}',
    '.s{position:relative;padding-top:74px}',
    '.dot{position:absolute;top:0;right:0;width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:#fff;box-shadow:inset 0 0 0 2px rgba(11,11,11,.12);transition:background-color .5s ' + EASE + ',box-shadow .5s ' + EASE + ',transform .6s ' + EASE + '}',
    '.dot svg{width:24px;height:24px;opacity:.35;transition:opacity .4s ' + EASE + '}',
    '.dot path,.dot circle,.dot rect{stroke-dasharray:80;stroke-dashoffset:80;transition:stroke-dashoffset 1.1s ' + EASE + '}',
    '.s.on .dot{background:var(--lime);box-shadow:inset 0 0 0 2px var(--ink);transform:scale(1.04)}',
    '.s.on .dot svg{opacity:1}',
    '.s.on .dot path,.s.on .dot circle,.s.on .dot rect{stroke-dashoffset:0}',
    '.n{display:block;font:700 11px/1 ' + FT + ';letter-spacing:.14em;opacity:.45;margin-bottom:10px;direction:ltr;text-align:right}',
    '.lb{display:inline-block;margin-bottom:10px;padding:6px 10px;border-radius:999px;background:#F2F0EA;font:700 12px/1 ' + FT + '}',
    'h3{margin:0 0 10px;font:700 clamp(22px,2vw,30px)/1.05 ' + FD + ';letter-spacing:-.02em;opacity:.35;transition:opacity .5s ' + EASE + '}',
    '.s.on h3{opacity:1}',
    '.s p{margin:0;max-width:26ch;font:400 15px/1.55 ' + FT + ';color:#55534d}',
    '@media (max-width:760px){.hd{grid-template-columns:1fr;gap:14px}.rail{grid-template-columns:1fr;gap:28px;padding-right:76px}',
    ' .th{top:28px;bottom:28px;right:27px;left:auto;width:2px;height:auto}.th i{transform-origin:50% 0;transform:scaleY(0)}',
    ' .s{padding-top:4px;min-height:56px}.dot{right:-76px}}'
  ].join('');
  define('dna-steps', {
    connectedCallback: function () {
      if (this._r) return; this._r = 1;
      var self = this, root = this.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>' + STCSS + '</style><div class="hd"><div><span class="ey">' + esc(this.getAttribute('data-eyebrow') || 'DNA / איך זה עובד') + '</span><h2>' + esc(this.getAttribute('data-title') || 'ככה עובדים יחד.') + '</h2></div><p>' + esc(this.getAttribute('data-lead') || 'בלי מצגות של חודש ובלי להעביר אתכם מאדם לאדם.') + '</p></div>' +
        '<div class="rail"><div class="th"><i></i></div>' + STEPS.map(function (s) {
          return '<article class="s"><span class="dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + s[4] + '</svg></span><span class="n">' + s[0] + '</span><span class="lb">' + s[1] + '</span><h3>' + s[2] + '</h3><p>' + s[3] + '</p></article>';
        }).join('') + '</div>';
      this._s = [].slice.call(root.querySelectorAll('.s')); this._th = root.querySelector('.th i'); this._rail = root.querySelector('.rail');
      if (RM) { this._s.forEach(function (s) { s.classList.add('on'); }); this._th.style.transform = 'none'; return; }
      this._f = function () { if (!self._q) { self._q = 1; requestAnimationFrame(function () { self._q = 0; self._upd(); }); } };
      addEventListener('scroll', this._f, { passive: true }); addEventListener('resize', this._f); this._upd();
    },
    disconnectedCallback: function () { if (this._f) { removeEventListener('scroll', this._f); removeEventListener('resize', this._f); } },
    _upd: function () {
      var r = this._rail.getBoundingClientRect(), vh = innerHeight;
      // thread starts when the rail is 80% down the screen and is full when it reaches 40%
      var p = clamp((vh * 0.8 - r.top) / (vh * 0.4), 0, 1);
      var vertical = getComputedStyle(this._rail).gridTemplateColumns.split(' ').length < 2;
      if (vertical) p = clamp((vh * 0.75 - r.top) / Math.max(1, r.height), 0, 1);
      this._th.style.transform = vertical ? 'scaleY(' + p + ')' : 'scaleX(' + p + ')';
      var n = this._s.length;
      this._s.forEach(function (s, i) { s.classList.toggle('on', p >= i / (n - 1) - 0.02 || (i === 0 && p > 0)); });
    }
  });

  /* ==========================================================================
     <dna-stepform> — wraps the site's own #lead-form (light DOM, so the
     existing submit, tracking and FormSubmit delivery keep working) and shows
     it as three short screens.
     ======================================================================== */
  var SFCSS = [
    'dna-stepform{display:block}',
    'dna-stepform .dsf-prog{display:flex;align-items:center;gap:10px;margin:2px 0 18px;font:700 11px/1 ' + FT + ';letter-spacing:.1em;opacity:.7}',
    'dna-stepform .dsf-prog i{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.14);overflow:hidden}',
    'dna-stepform .dsf-prog b{display:block;height:100%;background:#D9FF43;transform-origin:100% 50%;transition:transform .6s ' + EASE + '}',
    'dna-stepform .dsf-step{display:none}',
    'dna-stepform .dsf-step.on{display:block;animation:dsfIn .5s ' + EASE + '}',
    'dna-stepform .dsf-step.back{animation-name:dsfBack}',
    '@keyframes dsfIn{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:none}}',
    '@keyframes dsfBack{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}',
    'dna-stepform .dsf-q{margin:0 0 14px;font:700 clamp(20px,2vw,26px)/1.15 ' + FD + ';letter-spacing:-.02em}',
    'dna-stepform .dsf-nav{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:18px}',
    'dna-stepform .dsf-next{appearance:none;border:0;cursor:pointer;flex:1;min-height:52px;border-radius:999px;background:#D9FF43;color:#0B0B0B;font:700 15px/1 ' + FT + ';transition:transform .2s ' + EASE + '}',
    'dna-stepform .dsf-next:active{transform:scale(.97)}',
    'dna-stepform .dsf-prev{appearance:none;border:0;background:none;color:inherit;opacity:.65;cursor:pointer;font:700 13px/1 ' + FT + ';padding:14px 6px}',
    'dna-stepform .dsf-prev[hidden]{display:none}',
    'dna-stepform .dsf-next:focus-visible,dna-stepform .dsf-prev:focus-visible{outline:2px solid #D9FF43;outline-offset:3px}',
    'dna-stepform [data-dsf-last] button[type=submit]{width:100%}'
  ].join('');
  define('dna-stepform', {
    connectedCallback: function () {
      if (this._r) return; this._r = 1;
      var self = this, f = this.querySelector('form'); if (!f) return;
      if (!document.getElementById('dsf-css')) { var st = document.createElement('style'); st.id = 'dsf-css'; st.textContent = SFCSS; document.head.appendChild(st); }
      function lab(name) { var i = f.querySelector('[name="' + name + '"]'); return i && i.closest('label'); }
      var groups = [
        { q: 'מה מביא אתכם אלינו?', els: [f.querySelector('.lead-reasons')] },
        { q: 'איך קוראים לכם ואיך נחזור אליכם?', els: [lab('name'), lab('phone')] },
        { q: 'עוד שני פרטים, אם בא לכם.', els: [lab('business'), lab('email'), f.querySelector('.lead-privacy-note'), f.querySelector('button[type=submit]'), f.querySelector('.form-status')] }
      ];
      var anchor = f.querySelector('.lead-sub') || f.querySelector('h3');
      var prog = document.createElement('div'); prog.className = 'dsf-prog'; prog.innerHTML = '<span class="dsf-c">1 / 3</span><i><b style="transform:scaleX(.333)"></b></i>';
      anchor.after(prog);
      var steps = groups.map(function (g, i) {
        var d = document.createElement('div'); d.className = 'dsf-step'; d.setAttribute('data-step', i);
        if (i === groups.length - 1) d.setAttribute('data-dsf-last', '');
        d.innerHTML = '<p class="dsf-q">' + g.q + '</p>';
        g.els.forEach(function (e) { if (e) d.appendChild(e); });
        if (g.els[0] && g.els[0].matches && g.els[0].matches('fieldset')) { var lg = g.els[0].querySelector('legend'); if (lg) lg.style.display = 'none'; }
        return d;
      });
      var nav = document.createElement('div'); nav.className = 'dsf-nav';
      nav.innerHTML = '<button type="button" class="dsf-prev" hidden>חזרה</button><button type="button" class="dsf-next">המשך</button>';
      var after = prog; steps.forEach(function (s) { after.after(s); after = s; }); after.after(nav);
      this._f = f; this._steps = steps; this._prog = prog; this._nav = nav; this._i = 0;
      nav.querySelector('.dsf-next').addEventListener('click', function () { self.go(self._i + 1); });
      nav.querySelector('.dsf-prev').addEventListener('click', function () { self.go(self._i - 1, true); });
      // Enter on an early screen moves forward instead of submitting the form
      document.addEventListener('submit', function (e) {
        if (e.target !== f || self._i === steps.length - 1) return;
        e.preventDefault(); e.stopImmediatePropagation(); self.go(self._i + 1);
      }, true);
      this.go(0, false, true);
    },
    go: function (i, back, init) {
      var s = this._steps, cur = s[this._i];
      if (!back && !init && i > this._i) {
        var bad = [].slice.call(cur.querySelectorAll('input[required]')).filter(function (x) { return !x.checkValidity(); })[0];
        if (bad) { bad.reportValidity(); bad.focus(); return; }
      }
      i = clamp(i, 0, s.length - 1); this._i = i;
      s.forEach(function (x, k) { x.classList.toggle('on', k === i); x.classList.toggle('back', !!back); });
      this._prog.querySelector('.dsf-c').textContent = (i + 1) + ' / ' + s.length;
      this._prog.querySelector('b').style.transform = 'scaleX(' + ((i + 1) / s.length).toFixed(3) + ')';
      this._nav.querySelector('.dsf-prev').hidden = i === 0;
      this._nav.querySelector('.dsf-next').style.display = i === s.length - 1 ? 'none' : '';
      if (!init) { var first = s[i].querySelector('input:not([type=hidden]):not([type=checkbox])'); if (first) first.focus({ preventScroll: true }); }
    }
  });

  /* ==========================================================================
     <dna-signoff> — the last thing on the page: the wordmark, rising into place
     ======================================================================== */
  define('dna-signoff', {
    connectedCallback: function () {
      if (this._r) return; this._r = 1;
      var self = this, root = this.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>:host{display:block;overflow:hidden;padding-top:clamp(30px,5vw,70px)}img{display:block;width:100%;height:auto;opacity:.95;transform:translateY(var(--y,40%));will-change:transform}' +
        '</style><img alt="" aria-hidden="true" loading="lazy" decoding="async" src="' + esc(this.getAttribute('src') || 'media/dna-logo-footer.webp') + '">';
      var img = root.querySelector('img');
      if (RM) { img.style.setProperty('--y', '0%'); return; }
      this._f = function () {
        if (self._q) return; self._q = 1;
        requestAnimationFrame(function () {
          self._q = 0; var r = self.getBoundingClientRect();
          var p = clamp((innerHeight - r.top) / Math.max(1, r.height), 0, 1);
          img.style.setProperty('--y', ((1 - (1 - Math.pow(1 - p, 3))) * 40).toFixed(2) + '%');
        });
      };
      addEventListener('scroll', this._f, { passive: true }); this._f();
    },
    disconnectedCallback: function () { if (this._f) removeEventListener('scroll', this._f); }
  });
})();
