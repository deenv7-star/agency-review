/* ============================================================================
   DNA SERVICES — a living Bento grid for hellodna.co.il #services
     <dna-services base="media/"></dna-services>
   Six tiles. Each one shows its service working instead of describing it:
     01 קמפיינים   — a deck of ads that keeps shuffling
     02 סרטים      — a real film playing, with a recording timecode
     03 מיתוג      — the DNA monogram being constructed, then the palette
     04 אתרים      — a browser that types a real address and loads the site
     05 אוטומציות  — a lead travelling through the flow to a booked meeting
     06 סאונד      — a lime disc you can actually play, bars move with the sound
   The whole tile is the link to the service page. Animations run only while
   the tile is on screen, and stop for prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';
  if (!window.customElements || window.__dnaServices) return; window.__dnaServices = 1;
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FD = '"Tel Aviv Brutalist","Heebo",Arial,sans-serif', FT = '"Tel Aviv Modernist","Heebo",Arial,sans-serif';
  var EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
  var MONO = 'M0.0 104.1 L0.2 176.9 L2.1 183.3 L4.1 187.2 L11.0 194.7 L16.9 198.2 L23.8 200.0 L127.9 199.8 L127.5 165.7 L124.3 157.2 L121.1 152.9 L116.5 148.7 L111.4 146.0 L103.7 144.2 L44.9 144.2 L42.8 141.9 L42.3 117.8ZM0.0 46.2 L0.5 83.1 L2.1 88.1 L4.3 92.2 L6.9 95.4 L11.7 99.5 L16.5 102.1 L114.4 136.2 L122.7 139.6 L131.4 144.6 L131.1 103.0 L128.1 95.0 L122.9 89.2 L113.5 84.9ZM20.6 0.0 L20.8 28.4 L24.3 36.4 L29.1 41.6 L34.3 44.9 L40.5 46.7 L87.9 46.9 L89.5 48.1 L90.2 49.9 L90.2 69.8 L131.4 83.8 L131.1 21.7 L130.2 17.8 L127.9 12.8 L121.5 5.5 L114.9 1.6 L108.7 0.0Z';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var TILES = [
    { k: 'ads', n: '01', t: 'קמפיינים ושיווק', p: 'מסר חד, קריאייטיב נכון ומדיה שעובדת.', c: 'PPC · גוגל · מטא · אסטרטגיה', h: 'services/campaigns.html', tone: 'ink' },
    { k: 'film', n: '02', t: 'קריאייטיב ופרסומות AI', p: 'קונספטים וסרטים שאנשים רוצים לראות.', c: 'פרסומות AI · סרטים · סושיאל · מושן', h: 'services/creative-production.html', tone: 'film' },
    { k: 'brand', n: '03', t: 'מיתוג', p: 'זהות ברורה שאפשר לזהות ולזכור.', c: 'שם · זהות · מסרים', h: 'services/branding.html', tone: 'paper' },
    { k: 'sound', n: '06', t: 'מיתוג קולי וג׳ינגלים', p: 'סאונד שנותן למותג קול משלו.', c: 'ג׳ינגלים · קריינות · מוזיקה', h: 'services/sonic-branding.html', tone: 'lime' },
    { k: 'web', n: '04', t: 'אתרים ומערכות', p: 'דפי נחיתה, אתרים מלאים ומערכות מורכבות.', c: 'דפי נחיתה · אתרים · מערכות', h: 'services/websites.html', tone: 'paper' },
    { k: 'flow', n: '05', t: 'אוטומציות, בוטים ו-CRM', p: 'פחות עבודה ידנית. יותר דברים שקורים בזמן.', c: 'בוטים · CRM · וואטסאפ · סוכני AI', h: 'services/automation.html', tone: 'ink' }
  ];

  var CSS = [
    ':host{display:block;direction:rtl;font-family:' + FT + ';--ink:#0B0B0B;--paper:#F2F0EA;--lime:#D9FF43;--r:28px;color:var(--ink)}',
    '*{box-sizing:border-box}',
    '.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:310px 310px 330px;gap:14px}',
    '.t{position:relative;border-radius:var(--r);overflow:hidden;isolation:isolate;container-type:inline-size;opacity:0;transform:translateY(28px);transition:opacity .8s ' + EASE + ',transform .8s ' + EASE + ',box-shadow .5s ' + EASE + '}',
    '.t.in{opacity:1;transform:none}',
    '.t[data-k=ads]{grid-column:1/3;grid-row:1/3}.t[data-k=film]{grid-column:3;grid-row:1/3}.t[data-k=brand]{grid-column:4;grid-row:1}.t[data-k=sound]{grid-column:4;grid-row:2}.t[data-k=web]{grid-column:1/3;grid-row:3}.t[data-k=flow]{grid-column:3/5;grid-row:3}',
    '.ink{background:var(--ink);color:#fff}.paper{background:var(--paper)}.lime{background:var(--lime)}.film{background:#111;color:#fff}',
    /* text */
    '.tx{position:absolute;inset:0 0 auto 0;z-index:3;padding:26px 28px 0 84px;pointer-events:none}',
    '.t[data-k=web] .tx{left:auto;width:46%;padding-left:0}',
    '.n{display:block;font:700 11px/1 ' + FT + ';letter-spacing:.16em;opacity:.5;margin-bottom:12px;direction:ltr;text-align:right}',
    'h3{margin:0;font:700 clamp(26px,2.3vw,36px)/1 ' + FD + ';letter-spacing:-.025em;max-width:13ch}',
    '.t[data-k=ads] h3{font-size:clamp(34px,3.6vw,56px)}',
    '.tx p{margin:10px 0 0;font:400 15px/1.45 ' + FT + ';opacity:.72;max-width:30ch}',
    '.tx small{display:block;margin-top:8px;font:700 11px/1.4 ' + FT + ';letter-spacing:.04em;opacity:.45}',
    '.film .tx{inset:auto 0 0 0;padding:0 26px 26px}',
    '.film .tx:before{content:"";position:absolute;inset:-120px 0 0 0;z-index:-1;background:linear-gradient(0deg,rgba(0,0,0,.82),rgba(0,0,0,0))}',
    /* the whole tile is the link */
    '.hit{position:absolute;inset:0;z-index:4;border-radius:inherit;-webkit-tap-highlight-color:transparent}',
    '.hit:focus-visible{outline:3px solid var(--lime);outline-offset:3px}',
    '.paper .hit:focus-visible,.lime .hit:focus-visible{outline-color:var(--ink)}',
    '.go{position:absolute;top:22px;left:22px;z-index:5;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;pointer-events:none;box-shadow:inset 0 0 0 1.5px currentColor;opacity:.55;transition:transform .5s ' + EASE + ',opacity .3s ' + EASE + ',background-color .3s ' + EASE + ',color .3s ' + EASE + '}',
    '.go svg{width:16px;height:16px;transition:transform .5s ' + EASE + '}',
    '.film .go{color:#fff}',
    '@media (hover:hover) and (pointer:fine){',
    ' .t:hover{transform:translateY(-4px);box-shadow:0 24px 50px -24px rgba(0,0,0,.35)}',
    ' .t:hover .go{opacity:1;background:var(--lime);color:var(--ink);box-shadow:none}',
    ' .lime:hover .go{background:var(--ink);color:var(--lime)}',
    ' .t:hover .go svg{transform:rotate(45deg)}',
    '}',
    '.t.press{transform:scale(.985);transition-duration:.15s}',
    '.stage{position:absolute;inset:0;z-index:1}',
    /* 01 ads — card deck */
    '.deck{position:absolute;left:8%;bottom:-6%;width:min(250px,42%);aspect-ratio:250/380}',
    '.ad{position:absolute;inset:0;border-radius:18px;background:#fff;color:var(--ink);overflow:hidden;box-shadow:0 30px 60px -20px rgba(0,0,0,.6);transition:transform .9s ' + EASE + ',opacity .6s ' + EASE + ';will-change:transform}',
    '.ad header{display:flex;align-items:center;gap:8px;padding:10px 12px;font:700 11px/1.15 ' + FT + '}',
    '.ad header i{width:22px;height:22px;border-radius:50%;background:var(--ink);flex:none}',
    '.ad header span{display:block;font-weight:400;opacity:.55;font-size:10px}',
    '.ad img{display:block;width:100%;aspect-ratio:4/5;object-fit:cover;background:#ddd}',
    '.ad footer{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;font:700 11px/1 ' + FT + '}',
    '.ad footer b{padding:7px 10px;border-radius:8px;background:var(--lime);font-weight:700}',
    '.chipsA{position:absolute;right:28px;bottom:28px;display:flex;flex-direction:column;align-items:flex-start;gap:8px}',
    '.chipsA span{padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);font:700 12px/1 ' + FT + ';color:rgba(255,255,255,.8);opacity:0;transform:translateY(8px);transition:opacity .6s ' + EASE + ',transform .6s ' + EASE + '}',
    '.chipsA span.on{opacity:1;transform:none}',
    '.chipsA span b{color:var(--lime);margin-left:6px}',
    /* 02 film */
    '.film video,.film .poster{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}',
    '.rec{position:absolute;top:26px;right:26px;z-index:3;display:flex;align-items:center;gap:8px;font:700 11px/1 ui-monospace,Menlo,monospace;letter-spacing:.08em;color:#fff;direction:ltr;padding:7px 10px;border-radius:999px;background:rgba(0,0,0,.35);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}',
    '.rec i{width:7px;height:7px;border-radius:50%;background:#ff3b30;animation:blink 1.2s steps(1) infinite}',
    '@keyframes blink{50%{opacity:0}}',
    '.frame{position:absolute;inset:18px;z-index:2;pointer-events:none;border-radius:16px}',
    '.frame:before,.frame:after{content:"";position:absolute;width:22px;height:22px;border:2px solid rgba(255,255,255,.7)}',
    '.frame:before{left:0;bottom:0;border-top:0;border-right:0;border-bottom-left-radius:10px}.frame:after{left:0;top:56px;border-bottom:0;border-right:0;border-top-left-radius:10px;opacity:0}',
    /* 03 brand */
    '.mk{position:absolute;left:50%;top:56%;width:min(44%,150px);transform:translate(-50%,-50%)}',
    '.mk svg{display:block;width:100%;overflow:visible}',
    '.mk .gd{stroke:rgba(11,11,11,.18);stroke-width:.6;fill:none}',
    '.mk .ol{fill:none;stroke:var(--ink);stroke-width:1.4;stroke-linejoin:round}',
    '.mk .fl{fill:var(--ink);opacity:0}',
    '.sw{position:absolute;left:24px;bottom:24px;display:flex;gap:6px;direction:ltr}',
    '.sw i{width:26px;height:26px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12);transform:scale(.6);opacity:0;transition:transform .6s ' + EASE + ',opacity .4s ' + EASE + '}',
    '.sw i.on{transform:none;opacity:1}',
    '.brand .tx p,.brand .tx small{display:none}',
    /* 06 sound */
    '.sound .tx p,.sound .tx small{display:none}',
    '.eq{position:absolute;left:0;right:0;bottom:0;height:56%;width:100%}',
    '.play{position:absolute;z-index:6;left:22px;bottom:22px;width:56px;height:56px;border:0;border-radius:50%;background:var(--ink);color:var(--lime);display:grid;place-items:center;cursor:pointer;transition:transform .35s ' + EASE + ';-webkit-tap-highlight-color:transparent}',
    '.play:active{transform:scale(.92)}',
    '.play:focus-visible{outline:3px solid var(--ink);outline-offset:3px}',
    '.play i{width:18px;height:20px;background:currentColor;clip-path:polygon(15% 0,15% 100%,100% 50%,100% 50%);transition:clip-path .35s ' + EASE + '}',
    '.play[aria-pressed=true] i{clip-path:polygon(0 0,0 100%,38% 100%,38% 0,62% 0,62% 100%,100% 100%,100% 0)}',
    '.play[aria-pressed=true] i{width:16px;height:18px}',
    '.lbl{position:absolute;z-index:5;left:90px;bottom:38px;font:700 11px/1.2 ' + FT + ';opacity:.6;pointer-events:none}',
    /* 04 web */
    '.br{position:absolute;left:24px;bottom:-14px;width:min(40%,400px);border-radius:14px 14px 0 0;background:#fff;box-shadow:0 30px 60px -24px rgba(0,0,0,.35),0 0 0 1px rgba(0,0,0,.06);overflow:hidden}',
    '.bar{display:flex;align-items:center;gap:6px;padding:9px 12px;background:#f4f3ef;direction:ltr}',
    '.bar i{width:9px;height:9px;border-radius:50%;background:#d9d6cd}',
    '.url{flex:1;margin-left:8px;height:24px;border-radius:7px;background:#fff;box-shadow:inset 0 0 0 1px rgba(0,0,0,.06);font:500 11px/24px ui-monospace,Menlo,monospace;color:#555;padding:0 10px;white-space:nowrap;overflow:hidden}',
    '.url b{display:inline-block;width:1px;height:12px;margin-left:1px;vertical-align:-2px;background:#555;animation:blink 1s steps(1) infinite}',
    '.prog{height:2px;background:var(--lime);transform-origin:0 50%;transform:scaleX(0)}',
    '.vp{position:relative;aspect-ratio:1200/760;overflow:hidden;background:#eee}',
    '.vp img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top;opacity:0;transform:scale(1.04);transition:opacity .7s ' + EASE + ',transform 1.2s ' + EASE + '}',
    '.vp img.on{opacity:1;transform:none}',
    /* 05 flow */
    '.fl5{position:absolute;left:24px;right:24px;bottom:26px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}',
    '.st{position:relative;padding:14px 12px 12px;border-radius:16px;background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);font:700 13px/1.2 ' + FT + ';color:rgba(255,255,255,.55);transition:background-color .4s ' + EASE + ',color .4s ' + EASE + ',box-shadow .4s ' + EASE + '}',
    '.st small{display:block;margin-bottom:8px;font:700 9px/1 ' + FT + ';letter-spacing:.14em;opacity:.6;direction:ltr;text-align:right}',
    '.st em{position:absolute;top:10px;left:10px;width:18px;height:18px;border-radius:50%;background:var(--lime);color:var(--ink);font-style:normal;display:grid;place-items:center;font-size:11px;transform:scale(0.4);opacity:0;transition:transform .45s ' + EASE + ',opacity .3s ' + EASE + '}',
    '.st.on{color:#fff;box-shadow:inset 0 0 0 1.5px var(--lime);background:rgba(217,255,67,.07)}',
    '.st.done em{transform:none;opacity:1}',
    '.msg{position:absolute;left:24px;bottom:122px;max-width:min(300px,60%);padding:11px 14px;border-radius:16px 16px 16px 4px;background:#DCF8C6;color:#0b0b0b;font:400 13px/1.4 ' + FT + ';box-shadow:0 10px 30px -10px rgba(0,0,0,.4);opacity:0;transform:translateY(10px) scale(.96);transform-origin:0 100%;transition:opacity .5s ' + EASE + ',transform .6s ' + EASE + '}',
    '.msg.on{opacity:1;transform:none}',
    '.msg span{display:block;margin-top:4px;font-size:10px;opacity:.5;text-align:left;direction:ltr}',
    /* responsive */
    '@media (max-width:1000px){.grid{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:none;grid-auto-rows:auto}',
    ' .t{grid-column:auto!important;grid-row:auto!important;min-height:330px}',
    ' .t[data-k=ads]{grid-column:1/3!important;min-height:480px}.t[data-k=film]{min-height:420px}.t[data-k=brand]{min-height:420px}',
    ' .t[data-k=web],.t[data-k=flow]{grid-column:1/3!important;min-height:360px}}',
    '@media (max-width:640px){.grid{display:flex!important;gap:10px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;margin:0 -20px;padding:0 20px 6px;scroll-padding:0 20px}.grid::-webkit-scrollbar{display:none}:host{--r:24px}',
    ' .t{flex:0 0 84%;scroll-snap-align:center;min-height:440px!important;grid-column:auto!important}',
    ' .t[data-k=brand],.t[data-k=sound]{min-height:440px!important}',
    ' .t[data-k=brand] .mk{width:38%;top:56%}.brand .tx p,.brand .tx small,.sound .tx p,.sound .tx small{display:block}',
    ' .brand h3,.sound h3{font-size:26px!important;max-width:13ch!important}',
    ' .t[data-k=ads] h3{font-size:30px}',
    ' .dots{display:flex}',
    ' .t[data-k=ads]{min-height:470px}.t[data-k=film]{grid-column:1/3!important;min-height:440px}',
    ' .t[data-k=brand],.t[data-k=sound]{min-height:250px}',
    ' .t[data-k=web]{min-height:400px}.t[data-k=flow]{min-height:440px}',
    ' .tx{padding:22px 20px 0 66px}.t[data-k=web] .tx{width:auto;left:0;padding-left:66px}.film .tx{padding:0 20px 22px}.go{top:18px;left:18px;width:36px;height:36px}',
    ' h3{font-size:26px}.t[data-k=ads] h3{font-size:34px}.brand h3,.sound h3{font-size:20px;max-width:9ch}',
    ' .brand .n,.sound .n{margin-bottom:8px}',
    ' .deck{left:50%;transform:translateX(-50%);width:200px;bottom:-40px}.chipsA{display:none}',
    ' .br{left:16px;right:16px;width:auto;bottom:-14px}',
    ' .fl5{grid-template-columns:1fr 1fr;left:16px;right:16px;bottom:16px}.msg{left:16px;bottom:150px;max-width:78%}',
    ' .mk{top:62%;width:44%}.sw{left:14px;bottom:14px}.sw i{width:20px;height:20px}',
    ' .play{width:48px;height:48px;left:16px;bottom:16px}.lbl{display:none}}',
    '.dots{display:none;justify-content:center;gap:6px;margin-top:14px}.dots i{width:6px;height:6px;border-radius:3px;background:rgba(11,11,11,.18);transition:width .4s ' + EASE + ',background-color .3s ' + EASE + '}.dots i.on{width:18px;background:#0B0B0B}',
    '@media (prefers-reduced-motion:reduce){.t{transition:none;opacity:1;transform:none}}'
  ].join('');

  var LARR = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8H3M7 4 3 8l4 4"/></svg>';
  var ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 4 12M4 5.5V12h6.5"/></svg>';

  function DnaServices() { return Reflect.construct(HTMLElement, [], DnaServices); }
  DnaServices.prototype = Object.create(HTMLElement.prototype);
  DnaServices.prototype.constructor = DnaServices;
  Object.setPrototypeOf(DnaServices, HTMLElement);

  DnaServices.prototype.connectedCallback = function () {
    if (this._ready) return; this._ready = 1;
    var self = this, B = this.getAttribute('base') || 'media/';
    var M = {
      ads: (this.getAttribute('data-ads') || 'portfolio-curated/beauty-portrait.webp,portfolio-curated/jewelry-shadow.webp,portfolio-curated/rope-fragrance.webp,portfolio-curated/jewelry-editorial.webp').split(','),
      film: this.getAttribute('data-film') || 'portfolio-curated/beauty-motion.mp4',
      filmPoster: this.getAttribute('data-film-poster') || 'portfolio-curated/beauty-motion-poster.webp',
      sound: this.getAttribute('data-sound') || 'sonic/sketch-tech.mp3',
      sites: (this.getAttribute('data-sites') || 'infinityhom.com|site-previews/infinityhom.webp,vinoamusic.com|site-previews/vinoa.webp,silviaohayon.lovable.app|site-previews/silviaohayon.webp,solaire-sun-spun.lovable.app|site-previews/solaire.webp').split(',').map(function (s) { s = s.split('|'); return { u: s[0], i: s[1] }; })
    };
    if (this.getAttribute('layout') === 'compact') return this._compact(B, M);
    var root = this.attachShadow({ mode: 'open' });
    root.innerHTML = '<style>' + CSS + '</style><div class="grid">' + TILES.map(function (T) {
      return '<article class="t ' + T.tone + (T.k === 'brand' ? ' brand' : '') + (T.k === 'sound' ? ' sound' : '') + '" data-k="' + T.k + '">' +
        '<div class="stage">' + stage(T.k, B, M) + '</div>' +
        '<div class="tx"><span class="n">' + T.n + '</span><h3>' + esc(T.t) + '</h3><p>' + esc(T.p) + '</p><small>' + esc(T.c) + '</small></div>' +
        '<span class="go" aria-hidden="true">' + ARROW + '</span>' +
        '<a class="hit" href="' + esc(T.h) + '" aria-label="' + esc(T.t + ': ' + T.p) + '"></a>' +
        (T.k === 'sound' ? '<button class="play" type="button" aria-pressed="false" aria-label="השמעת סקיצת סאונד"><i></i></button>' : '') +
        '</article>';
    }).join('') + '</div><div class="dots" aria-hidden="true">' + TILES.map(function () { return '<i></i>'; }).join('') + '</div>';
    this._root = root;
    (function () {
      var g = root.querySelector('.grid'), d = [].slice.call(root.querySelectorAll('.dots i'));
      var upd = function () { var w = g.clientWidth, mid = g.getBoundingClientRect().left + w / 2, best = 0, bd = 1e9;
        [].forEach.call(g.children, function (t, i) { var r = t.getBoundingClientRect(), c = Math.abs(r.left + r.width / 2 - mid); if (c < bd) { bd = c; best = i; } });
        d.forEach(function (x, i) { x.classList.toggle('on', i === best); }); };
      g.addEventListener('scroll', function () { requestAnimationFrame(upd); }, { passive: true }); upd();
    })();
    var tiles = [].slice.call(root.querySelectorAll('.t'));
    // press feedback (transform only), works for touch and mouse
    tiles.forEach(function (t) {
      var hit = t.querySelector('.hit');
      hit.addEventListener('pointerdown', function () { t.classList.add('press'); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { hit.addEventListener(ev, function () { t.classList.remove('press'); }); });
    });
    this._loops = {
      ads: adsLoop(root.querySelector('[data-k=ads]')),
      film: filmLoop(root.querySelector('[data-k=film]')),
      brand: brandLoop(root.querySelector('[data-k=brand]')),
      sound: soundLoop(root.querySelector('[data-k=sound]')),
      web: webLoop(root.querySelector('[data-k=web]'), M.sites),
      flow: flowLoop(root.querySelector('[data-k=flow]'))
    };
    // staggered entrance + run each demo only while it is visible
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var t = e.target, L = self._loops[t.getAttribute('data-k')];
        if (e.isIntersecting) {
          if (!t.classList.contains('in')) {
            var i = tiles.indexOf(t);
            setTimeout(function () { t.classList.add('in'); }, RM ? 0 : i * 70);
          }
          if (L) L.start();
        } else if (L) L.stop();
      });
    }, { threshold: 0.18 });
    tiles.forEach(function (t) { io.observe(t); });
    this._io = io;
  };
  DnaServices.prototype.disconnectedCallback = function () {
    if (this._io) this._io.disconnect();
    for (var k in this._loops) if (this._loops[k]) this._loops[k].stop();
  };


  /* ===================== compact layout (default) =====================
     One live screen + the list of six services. Same demos, one at a time:
     about half the height of the Bento grid on desktop, a quarter on phones. */
  var CCSS = [
    '.cw{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(24px,4vw,64px);align-items:stretch;height:clamp(460px,40vw,560px)}',
    '.scr{position:relative;border-radius:var(--r);overflow:hidden;isolation:isolate;background:#111;order:2}',
    '.t.pane{position:absolute;inset:0;border-radius:0;opacity:0;transform:none;min-height:0!important;transition:opacity .6s ' + EASE + ';pointer-events:none}',
    '.t.pane.on{opacity:1;pointer-events:auto}',
    '.t.pane:hover{transform:none;box-shadow:none}',
    '.pane .deck{left:50%;bottom:-10%;width:min(240px,40%);transform:translateX(-50%)}',
    '.pane .mk{top:50%;width:min(28%,140px)}',
    '.pane .br{left:50%;width:min(78%,540px);transform:translateX(-50%)}',
    '.pane .msg{bottom:118px}',
    '.list{order:1;display:flex;flex-direction:column;justify-content:center;margin:0;padding:0}',
    '.row{position:relative;border-top:1px solid rgba(11,11,11,.12)}',
    '.row:last-child{border-bottom:1px solid rgba(11,11,11,.12)}',
    '.rb{appearance:none;border:0;background:none;width:100%;display:flex;align-items:baseline;gap:14px;padding:15px 0;cursor:pointer;color:inherit;text-align:right;font:inherit;-webkit-tap-highlight-color:transparent}',
    '.rb .n{margin:0;flex:none;width:22px}',
    '.rt{font:700 clamp(21px,1.9vw,28px)/1.05 ' + FD + ';letter-spacing:-.02em;opacity:.38;transition:opacity .35s ' + EASE + '}',
    '.row.on .rt{opacity:1}',
    '@media (hover:hover) and (pointer:fine){.rb:hover .rt{opacity:.75}.row.on .rb:hover .rt{opacity:1}}',
    '.rb:focus-visible{outline:2px solid var(--ink);outline-offset:4px;border-radius:6px}',
    '.more{display:grid;grid-template-rows:0fr;transition:grid-template-rows .5s ' + EASE + '}',
    '.row.on .more{grid-template-rows:1fr}',
    '.more>div{overflow:hidden;padding-right:36px}',
    '.more p{margin:0;font:400 15px/1.5 ' + FT + ';color:#55534d}',
    '.more a{display:inline-flex;align-items:center;gap:8px;margin:12px 0 16px;padding:9px 14px;border-radius:999px;background:var(--ink);color:#fff;font:700 13px/1 ' + FT + ';text-decoration:none;transition:transform .3s ' + EASE + '}',
    '.more a:active{transform:scale(.96)}',
    '.more a:focus-visible{outline:2px solid var(--ink);outline-offset:3px}',
    '.more a svg{width:13px;height:13px}',
    '.pg{position:absolute;right:0;left:0;top:-1px;height:2px;overflow:hidden;opacity:0}',
    '.row.on .pg{opacity:1}',
    '.pg b{display:block;height:100%;background:var(--ink);transform-origin:100% 50%;transform:scaleX(0)}',
    '@media (max-width:760px){.cw{grid-template-columns:1fr;height:auto;gap:18px}.scr{order:1;height:min(88vw,360px)}.list{order:2}',
    ' .rb{padding:12px 0}.rt{font-size:21px}.more>div{padding-right:36px}',
    ' .pane .deck{width:46%;bottom:-18%}.pane .mk{width:30%}.pane .br{width:86%}.pane .fl5{bottom:14px}.pane .msg{bottom:150px}}'
  ].join('');

  DnaServices.prototype._compact = function (B, M) {
    var self = this, root = this.attachShadow({ mode: 'open' });
    var T = TILES.slice().sort(function (a, b) { return a.n < b.n ? -1 : 1; });
    root.innerHTML = '<style>' + CSS + CCSS + '</style><div class="cw">' +
      '<div class="scr" aria-hidden="false">' + T.map(function (t, i) {
        return '<div class="t pane ' + t.tone + (t.k === 'brand' ? ' brand' : '') + (t.k === 'sound' ? ' sound' : '') + '" data-k="' + t.k + '" id="p' + i + '" role="tabpanel" aria-label="' + esc(t.t) + '">' +
          '<div class="stage">' + stage(t.k, B, M) + '</div>' +
          (t.k === 'sound' ? '<button class="play" type="button" aria-pressed="false" aria-label="השמעת סקיצת סאונד"><i></i></button>' : '') + '</div>';
      }).join('') + '</div>' +
      '<div class="list" role="tablist" aria-orientation="vertical" aria-label="השירותים">' + T.map(function (t, i) {
        return '<div class="row" data-i="' + i + '"><i class="pg"><b></b></i>' +
          '<button class="rb" type="button" role="tab" aria-selected="false" aria-controls="p' + i + '" tabindex="-1"><span class="n">' + t.n + '</span><span class="rt">' + esc(t.t) + '</span></button>' +
          '<div class="more"><div><p>' + esc(t.p) + '</p><a href="' + esc(t.h) + '">לעמוד השירות' + LARR + '</a></div></div></div>';
      }).join('') + '</div></div>';
    var panes = [].slice.call(root.querySelectorAll('.pane')), rows = [].slice.call(root.querySelectorAll('.row')), btns = rows.map(function (r) { return r.querySelector('.rb'); });
    var loops = {};
    panes.forEach(function (p) {
      var k = p.getAttribute('data-k');
      loops[k] = k === 'ads' ? adsLoop(p) : k === 'film' ? filmLoop(p) : k === 'brand' ? brandLoop(p) : k === 'sound' ? soundLoop(p) : k === 'web' ? webLoop(p, M.sites) : flowLoop(p);
    });
    this._loops = loops;
    var cur = -1, visible = false, auto = !RM, hover = false, timer = 0, barAnim = null, DUR = 6500;
    function loopOf(i) { return loops[panes[i].getAttribute('data-k')]; }
    function schedule() {
      clearTimeout(timer); if (barAnim) { barAnim.cancel(); barAnim = null; }
      if (!auto || !visible || hover) return;
      var b = rows[cur].querySelector('.pg b');
      barAnim = b.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: DUR, easing: 'linear', fill: 'forwards' });
      timer = setTimeout(function () { select((cur + 1) % panes.length, false); }, DUR);
    }
    function select(i, user) {
      if (user) auto = false;
      if (i !== cur) {
        if (cur >= 0) { loopOf(cur).stop(); panes[cur].classList.remove('on'); rows[cur].classList.remove('on'); btns[cur].setAttribute('aria-selected', 'false'); btns[cur].tabIndex = -1; }
        cur = i;
        panes[i].classList.add('on'); rows[i].classList.add('on'); btns[i].setAttribute('aria-selected', 'true'); btns[i].tabIndex = 0;
        if (visible) loopOf(i).start();
      }
      schedule();
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { select(i, true); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0; if (!d) return;
        e.preventDefault(); var j = (i + d + btns.length) % btns.length; select(j, true); btns[j].focus();
      });
    });
    var cw = root.querySelector('.cw');
    cw.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hover = true; schedule(); } });
    cw.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hover = false; schedule(); } });
    select(0, false);
    this._io = new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) loopOf(cur).start(); else loopOf(cur).stop();
      schedule();
    }, { threshold: 0.25 });
    this._io.observe(this);
  };

  function stage(k, B, M) {
    if (k === 'ads') {
      return '<div class="deck">' + M.ads.map(function (src) {
        return '<div class="ad"><header><i></i><div>המותג שלכם<span>ממומן</span></div></header><img alt="" loading="lazy" decoding="async" src="' + esc(B + src) + '"><footer><span>••• </span><b>למידע נוסף</b></footer></div>';
      }).join('') + '</div><div class="chipsA"><span><b>●</b>מסר</span><span><b>●</b>קריאייטיב</span><span><b>●</b>מדיה</span></div>';
    }
    if (k === 'film') {
      return '<img class="poster" alt="" loading="lazy" decoding="async" src="' + esc(B + M.filmPoster) + '"><video muted loop playsinline preload="none" poster="' + esc(B + M.filmPoster) + '" src="' + esc(B + M.film) + '"></video><div class="rec"><i></i><span>00:00:00:00</span></div>';
    }
    if (k === 'brand') {
      return '<div class="mk"><svg viewBox="-20 -20 172 240" aria-hidden="true">' +
        '<g class="gd"><line x1="-20" y1="0" x2="152" y2="0"/><line x1="-20" y1="200" x2="152" y2="200"/><line x1="-20" y1="100" x2="152" y2="100"/><line x1="0" y1="-20" x2="0" y2="220"/><line x1="131.4" y1="-20" x2="131.4" y2="220"/><circle cx="65.7" cy="100" r="100"/><circle cx="65.7" cy="100" r="46"/></g>' +
        '<path class="fl" d="' + MONO + '"/><path class="ol" d="' + MONO + '" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg></div>' +
        '<div class="sw"><i style="background:#0B0B0B"></i><i style="background:#F2F0EA"></i><i style="background:#D9FF43"></i></div>';
    }
    if (k === 'sound') return '<canvas class="eq"></canvas><audio preload="none" src="' + esc(B + M.sound) + '"></audio>';
    if (k === 'web') {
      return '<div class="br"><div class="bar"><i></i><i></i><i></i><div class="url"><span></span><b></b></div></div><div class="prog"></div><div class="vp">' +
        M.sites.map(function (s) { return '<img alt="" loading="lazy" decoding="async" src="' + esc(B + s.i) + '">'; }).join('') + '</div></div>';
    }
    if (k === 'flow') {
      return '<div class="msg">היי! קיבלנו את הפנייה שלך. מתי נוח לדבר?<span>10:42 ✓✓</span></div><div class="fl5">' +
        [['01', 'ליד חדש מהאתר'], ['02', 'סוכן AI עונה'], ['03', 'הודעה בוואטסאפ'], ['04', 'פגישה ביומן']].map(function (s) {
          return '<div class="st"><em>✓</em><small>STEP ' + s[0] + '</small>' + s[1] + '</div>';
        }).join('') + '</div>';
    }
    return '';
  }

  /* ---- a tiny scheduler: each demo is a list of timed steps on a loop ---- */
  function Loop(steps, period) {
    var timers = [], on = false, cycle;
    cycle = function () {
      if (!on) return;
      steps.forEach(function (s) { timers.push(setTimeout(function () { if (on) s[1](); }, s[0])); });
      timers.push(setTimeout(cycle, period));
    };
    return {
      start: function () { if (on || RM) return; on = true; cycle(); },
      stop: function () { on = false; timers.forEach(clearTimeout); timers = []; }
    };
  }

  // 01 — the front ad slides away and joins the back of the deck
  function adsLoop(t) {
    var cards = [].slice.call(t.querySelectorAll('.ad')), chips = [].slice.call(t.querySelectorAll('.chipsA span'));
    var order = cards.map(function (c, i) { return i; });
    var ROT = [-4, 3, -1.5, 4];
    function lay() {
      order.forEach(function (ci, slot) {
        var c = cards[ci];
        c.style.zIndex = String(10 - slot);
        c.style.transform = 'translate(' + (slot * -16) + 'px,' + (slot * -14) + 'px) rotate(' + ROT[slot] + 'deg) scale(' + (1 - slot * 0.05) + ')';
        c.style.opacity = slot > 2 ? '0' : '1';
      });
    }
    lay();
    chips.forEach(function (c) { c.classList.add('on'); });
    if (RM) return { start: function () {}, stop: function () {} };
    return Loop([
      [0, function () { chips.forEach(function (c, i) { setTimeout(function () { c.classList.toggle('on', true); }, i * 120); }); }],
      [2200, function () {
        var front = cards[order[0]];
        front.style.transform = 'translate(-130%,30px) rotate(-16deg)';
        front.style.opacity = '0';
        setTimeout(function () { order.push(order.shift()); lay(); }, 420);
      }]
    ], 3000);
  }

  // 02 — the film plays only while visible; the timecode runs with it
  function filmLoop(t) {
    var v = t.querySelector('video'), tc = t.querySelector('.rec span'), raf = 0, t0 = 0;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function tick(now) {
      var s = (now - t0) / 1000, f = Math.floor((s % 1) * 25);
      tc.textContent = '00:' + pad(Math.floor(s / 60) % 60) + ':' + pad(Math.floor(s) % 60) + ':' + pad(f);
      raf = requestAnimationFrame(tick);
    }
    return {
      start: function () { if (RM) return; var p = v.play(); if (p && p.catch) p.catch(function () {}); t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); },
      stop: function () { v.pause(); cancelAnimationFrame(raf); }
    };
  }

  // 03 — construction lines, the outline draws, it fills, the palette lands
  function brandLoop(t) {
    var ol = t.querySelector('.ol'), fl = t.querySelector('.fl'), gd = t.querySelector('.gd'), sw = [].slice.call(t.querySelectorAll('.sw i'));
    function reset() {
      ol.getAnimations && ol.getAnimations().forEach(function (a) { a.cancel(); });
      ol.style.strokeDashoffset = '1'; fl.style.opacity = '0'; gd.style.opacity = '1';
      sw.forEach(function (s) { s.classList.remove('on'); });
    }
    if (RM) { ol.style.strokeDashoffset = '0'; fl.style.opacity = '1'; gd.style.opacity = '.4'; sw.forEach(function (s) { s.classList.add('on'); }); return { start: function () {}, stop: function () {} }; }
    var L = Loop([
      [0, reset],
      [200, function () { ol.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1800, easing: 'cubic-bezier(0.65,0,0.35,1)', fill: 'forwards' }); }],
      [2000, function () { fl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, easing: EASE, fill: 'forwards' }); gd.animate([{ opacity: 1 }, { opacity: .35 }], { duration: 600, fill: 'forwards' }); }],
      [2500, function () { sw.forEach(function (s, i) { setTimeout(function () { s.classList.add('on'); }, i * 110); }); }],
      [6200, function () { fl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' }); }]
    ], 6800);
    return { start: L.start, stop: function () { L.stop(); } };
  }

  // 06 — bars breathe on their own; press play and they follow the real sound
  function soundLoop(t) {
    var cv = t.querySelector('canvas'), cx = cv.getContext('2d'), btn = t.querySelector('.play'), au = t.querySelector('audio');
    var raf = 0, ac, an, data, running = false, dpr = Math.min(2, window.devicePixelRatio || 1), N = 28;
    function size() { var r = cv.getBoundingClientRect(); cv.width = Math.max(1, r.width * dpr); cv.height = Math.max(1, r.height * dpr); }
    function draw(now) {
      var w = cv.width, h = cv.height, bw = w / N;
      cx.clearRect(0, 0, w, h); cx.fillStyle = '#0B0B0B';
      if (an) an.getByteFrequencyData(data);
      for (var i = 0; i < N; i++) {
        var v;
        if (an && !au.paused) v = data[Math.floor(2 + i * (data.length * 0.55) / N)] / 255;
        else v = 0.16 + 0.12 * Math.sin(now / 520 + i * 0.55) + 0.06 * Math.sin(now / 230 + i * 1.7);
        var bh = Math.max(3 * dpr, v * h * 0.92);
        var x = w - (i + 1) * bw + bw * 0.28, bwid = bw * 0.44, y = h - bh;
        cx.beginPath();
        if (cx.roundRect) cx.roundRect(x, y, bwid, bh, bwid / 2); else cx.rect(x, y, bwid, bh);
        cx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!ac) {
        try { ac = new (window.AudioContext || window.webkitAudioContext)(); var src = ac.createMediaElementSource(au); an = ac.createAnalyser(); an.fftSize = 128; data = new Uint8Array(an.frequencyBinCount); src.connect(an); an.connect(ac.destination); } catch (err) { an = null; }
      }
      if (ac && ac.state === 'suspended') ac.resume();
      if (au.paused) { var p = au.play(); if (p && p.catch) p.catch(function () {}); } else au.pause();
    });
    au.addEventListener('play', function () { btn.setAttribute('aria-pressed', 'true'); btn.setAttribute('aria-label', 'עצירת סקיצת הסאונד'); });
    ['pause', 'ended'].forEach(function (ev) { au.addEventListener(ev, function () { btn.setAttribute('aria-pressed', 'false'); btn.setAttribute('aria-label', 'השמעת סקיצת סאונד'); }); });
    new ResizeObserver(size).observe(cv);
    size();
    if (RM) { requestAnimationFrame(function (n) { draw(n); cancelAnimationFrame(raf); }); }
    return {
      start: function () { if (running || RM) return; running = true; raf = requestAnimationFrame(draw); },
      stop: function () { running = false; cancelAnimationFrame(raf); if (!au.paused) au.pause(); }
    };
  }

  // 04 — type a real address, the bar fills, the site arrives
  function webLoop(t, sites) {
    var url = t.querySelector('.url span'), prog = t.querySelector('.prog'), imgs = [].slice.call(t.querySelectorAll('.vp img')), i = 0, timers = [], on = false;
    imgs[0].classList.add('on'); url.textContent = sites[0].u;
    function later(ms, f) { timers.push(setTimeout(function () { if (on) f(); }, ms)); }
    function next() {
      i = (i + 1) % sites.length; var u = sites[i].u;
      url.textContent = '';
      for (var c = 1; c <= u.length; c++) (function (c) { later(c * 45, function () { url.textContent = u.slice(0, c); }); })(c);
      var typed = u.length * 45 + 150;
      later(typed, function () { prog.animate([{ transform: 'scaleX(0)', opacity: 1 }, { transform: 'scaleX(1)', opacity: 1 }, { transform: 'scaleX(1)', opacity: 0 }], { duration: 900, easing: 'ease-out', fill: 'forwards' }); });
      later(typed + 500, function () { imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); }); });
      later(typed + 3600, next);
    }
    return {
      start: function () { if (on || RM) return; on = true; later(1600, next); },
      stop: function () { on = false; timers.forEach(clearTimeout); timers = []; }
    };
  }

  // 05 — a lead walks through the flow; the WhatsApp reply lands at step 3
  function flowLoop(t) {
    var st = [].slice.call(t.querySelectorAll('.st')), msg = t.querySelector('.msg');
    function reset() { st.forEach(function (s) { s.classList.remove('on', 'done'); }); msg.classList.remove('on'); }
    if (RM) { st.forEach(function (s) { s.classList.add('done'); }); msg.classList.add('on'); return { start: function () {}, stop: function () {} }; }
    var steps = [[0, reset]];
    st.forEach(function (s, k) {
      steps.push([400 + k * 1100, function () { if (k) { st[k - 1].classList.remove('on'); st[k - 1].classList.add('done'); } s.classList.add('on'); }]);
    });
    steps.push([400 + 2 * 1100 + 300, function () { msg.classList.add('on'); }]);
    steps.push([400 + 4 * 1100, function () { st[3].classList.remove('on'); st[3].classList.add('done'); }]);
    var L = Loop(steps, 7600);
    return { start: L.start, stop: function () { L.stop(); } };
  }

  customElements.define('dna-services', DnaServices);
})();
