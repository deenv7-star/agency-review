/* DNA OS - early-launch client app (static skeleton, no backend yet).
   Modes:
   - demo (?demo=1): illustrative data for a fictional business, clearly labelled.
   - client (invite session): honest empty states until DNA connects real accounts. */
(function () {
  var BRAND = window.DNA_OS_BRAND || { productName: "DNA OS", studio: "DNA STUDIO" };

  /* ---------------- session ----------------
     demo (?demo=1): illustrative data, no login needed.
     otherwise: a Supabase Auth session (email + password) is required. */
  var params = new URLSearchParams(location.search);
  var SESSION_KEY = "dna_os_session";
  var isDemo = params.get("demo") === "1" || (function () {
    try { return sessionStorage.getItem(SESSION_KEY + "_demo") === "1"; } catch (e) { return false; }
  })();
  if (params.get("still") === "1") { document.body.classList.add("still"); }

  var clientName = "";
  var sbClient = null;
  var isAdminUser = false;

  /* ---------------- demo data (fictional!) ---------------- */
  var DEMO = {
    kpis: [
      { label: "קמפיינים פעילים", num: "4", delta: "+1 השבוע", up: true, icon: "campaigns", tint: "var(--p-blue)", tink: "var(--p-blue-ink)" },
      { label: "לידים החודש", num: "63", delta: "+18% מול חודש קודם", up: true, icon: "leads", tint: "var(--p-teal)", tink: "var(--p-teal-ink)" },
      { label: "הוצאה החודש", num: "11,240", small: "₪", delta: "62% מהתקציב", up: false, flat: true, icon: "costs", tint: "var(--p-violet)", tink: "var(--p-violet-ink)" },
      { label: "משימות פתוחות", num: "7", delta: "2 מחכות לאישור שלך", up: false, flat: true, icon: "inbox", tint: "var(--p-amber)", tink: "var(--p-amber-ink)" }
    ],
    campaigns: [
      { name: "קיץ בבית הקפה", plat: "META", status: "on", statusText: "פעיל", leads: 31, cpl: 142, spend: 4400, budget: 6000 },
      { name: "חיפוש - קפה בצפון", plat: "GOOGLE", status: "on", statusText: "פעיל", leads: 19, cpl: 168, spend: 3190, budget: 4500 },
      { name: "טיקטוק - מאחורי הקליים", plat: "TIKTOK", status: "wait", statusText: "בלמידה", leads: 13, cpl: 227, spend: 2950, budget: 5000 },
      { name: "רימרקטינג - עגלות", plat: "META", status: "off", statusText: "מושהה", leads: 0, cpl: 0, spend: 700, budget: 2500 }
    ],
    leads: [
      { name: "נועה ל.", source: "אינסטגרם", srcClass: "meta", detail: "הזמנת קייטרינג", date: "היום, 09:41", status: "new", statusText: "חדש", tint: "var(--p-violet)", tink: "var(--p-violet-ink)" },
      { name: "אורי מ.", source: "גוגל", srcClass: "google", detail: "פגישת טעימות", date: "אתמול, 16:02", status: "new", statusText: "חדש", tint: "var(--p-blue)", tink: "var(--p-blue-ink)" },
      { name: "דנה ש.", source: "טיקטוק", srcClass: "tiktok", detail: "סיור בבית הקליה", date: "אתמול, 11:20", status: "prog", statusText: "בטיפול", tint: "var(--p-teal)", tink: "var(--p-teal-ink)" },
      { name: "יוסף כ.", source: "אינסטגרם", srcClass: "meta", detail: "סיטונאי - פולים", date: "לפני יומיים", status: "prog", statusText: "בטיפול", tint: "var(--p-orange)", tink: "var(--p-orange-ink)" },
      { name: "מיכל ר.", source: "גוגל", srcClass: "google", detail: "יום הולדת - 30 איש", date: "לפני 3 ימים", status: "done", statusText: "נסגר", tint: "var(--p-lime)", tink: "var(--p-lime-ink)" }
    ],
    spend: {
      budget: 18000, spent: 11240,
      channels: [
        { name: "Meta", v: 5100, color: "var(--p-blue-ink)" },
        { name: "Google", v: 3190, color: "var(--p-orange-ink)" },
        { name: "TikTok", v: 2950, color: "var(--ink)" }
      ],
      daily: [220, 310, 280, 390, 350, 470, 410, 520, 460, 610, 540, 690, 630, 580]
    },
    work: [
      { title: "סרט קמפיין - קיץ בבית הקפה", kind: "וידאו", stage: 2, stages: ["בריף", "הפקה", "עריכה", "בקרה", "אוויר"], eta: "צפי: יומיים" },
      { title: "דף נחיתה - קייטרינג לאירועים", kind: "אתר", stage: 3, stages: ["בריף", "עיצוב", "בנייה", "בקרה", "אוויר"], eta: "צפי: השבוע" },
      { title: "חבילת קריאייטיב - ספטמבר", kind: "קריאייטיב", stage: 1, stages: ["בריף", "סקיצות", "הפקה", "בקרה", "מסירה"], eta: "צפי: שבועיים" }
    ],
    insights: [
      { q: "וידאו מאחורי הקליים מביא לידים ב-40% פחות", p: "התוכן הגולמי מהריסטורנט עובד חזק יותר מהקריאייטיב המלוטש. הזזנו תקציב לשם.", src: "META + TIKTOK", when: "השבוע" },
      { q: "חיפושי 'קייטרינג' ממירים פי 2 בשעות הערב", p: "בין 19:00-22:00 העלות להמרה יורדת חדות. לוח הזמנות המודעות עודכן.", src: "GOOGLE", when: "השבוע" },
      { q: "קהל המבקרים החוזרים קטן מדי לרימרקטינג", p: "הקמפיין הושהה זמנית. נחזיר אותו כשהטראפיק יגדל מספיק.", src: "META", when: "שבוע שעבר" }
    ],
    nextMove: {
      title: "להעביר ₪1,500 מטיקטוק לקמפיין החיפוש",
      p: "קמפיין החיפוש מייצר לידים ב-₪168 מול ₪227 בטיקטוק, והוא מיצה את התקציב היומי שלו 6 ימים ברצף. ההעברה צפויה להוסיף כ-9 לידים החודש באותו תקציב.",
      why: ["CPL נמוך יותר", "ניצול תקציב מלא", "בלי להגדיל הוצאה"]
    },
    moves: [
      { title: "לאשר את גרסת העריכה החדשה", p: "הסרט 'קיץ בבית הקפה' מחכה לאישור שלך. כל יום דחוי דוחה את העלייה לאוויר.", impact: "חוסם השקה" },
      { title: "להוסיף מודעת 'טעימות חינם' בסוף השבוע", p: "סופי שבוע מביאים את התנועה הכי זולה. מודעה אחת, תקציב קטן, חלון קצר.", impact: "הזדמנות קצרה" },
      { title: "לעדכן את תמונת הפרופיל העסקי", p: "34% מהלידים בודקים את הפרופיל לפני שהם משאירים פרטים. התמונה הנוכחית בת שנה.", impact: "שיפור המרה" }
    ],
    feed: [
      { t: "ליד חדש מגוגל: פגישת טעימות", time: "לפני שעתיים", hot: true },
      { t: "גרסה 3 של סרט הקמפיין עלתה לבקרה", time: "היום, 08:15", hot: true },
      { t: "קמפיין החיפוש ניצל את התקציב היומי", time: "אתמול, 21:47", hot: false },
      { t: "תובנה חדשה נוספה ל-DNA PULSE", time: "אתמול, 14:03", hot: false },
      { t: "דף הנחיתה 'קייטרינג' עבר לשלב בנייה", time: "לפני יומיים", hot: false }
    ]
  };

  /* ---------------- icons (inline SVG, stroke style) ---------------- */
  function ic(path) {
    return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + path + "</svg>";
  }
  var ICONS = {
    overview: ic('<rect x="3" y="3" width="8" height="8" rx="2.5"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10" width="8" height="11" rx="2.5"/><rect x="3" y="13" width="8" height="8" rx="2.5"/>'),
    campaigns: ic('<path d="M3 11l14-6v14L3 13v-2z"/><path d="M7 13.5V17a2 2 0 0 0 4 0v-2"/><path d="M20 8.5a3.5 3.5 0 0 1 0 7"/>'),
    leads: ic('<circle cx="9" cy="8" r="3.5"/><path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8"/><path d="M16 5.5a3.5 3.5 0 0 1 0 6.6"/><path d="M17.5 14.6c1.7.7 2.8 2.1 3.1 4"/>'),
    costs: ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9"/><path d="M15 9.5c-.7-1-1.8-1.5-3-1.5-1.5 0-2.7.9-2.7 2.1 0 2.9 5.7 1.5 5.7 4.3 0 1.2-1.2 2.1-2.9 2.1-1.3 0-2.4-.6-3.1-1.6"/>'),
    work: ic('<path d="M12 3l1.9 3.9L18 7.8l-3 3 .7 4.2L12 13.1 8.3 15l.7-4.2-3-3 4.1-.9L12 3z" stroke-linejoin="round"/>'),
    pulse: ic('<path d="M3 12h4l2.5-6 4 12L16 12h5"/>'),
    next: ic('<path d="M5 12h13"/><path d="M13 6l6 6-6 6"/>'),
    inbox: ic('<path d="M4 5h16v14H4z" rx="3"/><path d="M4 13h5l1.5 2.5h3L15 13h5"/>')
  };

  /* ---------------- views ---------------- */
  var VIEWS = [
    { id: "overview", title: "סקירה", tag: "LIVE VIEW", icon: ICONS.overview },
    { id: "campaigns", title: "קמפיינים", tag: "CAMPAIGNS", icon: ICONS.campaigns },
    { id: "leads", title: "לידים", tag: "LEADS", icon: ICONS.leads },
    { id: "costs", title: "עלויות", tag: "COSTS", icon: ICONS.costs },
    { id: "work", title: "בתהליך", tag: "DNA WORK", icon: ICONS.work },
    { id: "pulse", title: "למידה", tag: "DNA PULSE", icon: ICONS.pulse },
    { id: "next", title: "הצעד הבא", tag: "NEXT MOVE", icon: ICONS.next }
  ];

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var nis = function (n) { return "₪" + Number(n).toLocaleString("en-US"); };

  function emptyState(icon, title, p) {
    return '<div class="empty"><div class="eic">' + icon + "</div><h3>" + title + "</h3><p>" + p + "</p></div>";
  }

  /* --- renderers (demo mode) --- */
  var R = {};

  function greetLine() {
    var h = new Date().getHours();
    var g = h < 12 ? "בוקר טוב" : (h < 17 ? "צהריים טובים" : "ערב טוב");
    return g + ", <b>" + esc(clientName) + "</b> - הנה התמונה של היום.";
  }

  R.overview = function () {
    var kpis = DEMO.kpis.map(function (k) {
      return '<div class="card kpi"><div class="kpi-head"><div class="k-label">' + k.label + '</div>' +
        '<span class="k-chip" style="--tint:' + k.tint + ';--tink:' + k.tink + '">' + ICONS[k.icon] + "</span></div>" +
        '<div class="k-num">' + k.num + (k.small ? " <small>" + k.small + "</small>" : "") + "</div>" +
        '<span class="k-delta' + (k.flat ? " flat" : "") + '">' + k.delta + "</span></div>";
    }).join("");
    var feed = DEMO.feed.map(function (f) {
      return '<div class="fi"><span class="dot' + (f.hot ? "" : " dim") + '"></span><div><p>' + f.t + "</p><time>" + f.time + "</time></div></div>";
    }).join("");
    return '<p class="greet">' + greetLine() + "</p>" +
      '<div class="grid g4" style="margin-bottom:14px">' + kpis + "</div>" +
      '<div class="grid g23">' +
        '<div class="card pad-lg next-hero"><span class="kicker">NEXT MOVE</span>' +
          "<h3>" + DEMO.nextMove.title + "</h3><p>" + DEMO.nextMove.p + "</p>" +
          '<div class="why">' + DEMO.nextMove.why.map(function (w) { return '<span class="why-chip">' + w + "</span>"; }).join("") + "</div>" +
          '<div style="margin-top:20px;display:flex;gap:10px"><button class="btn" data-approve>מאשר את המהלך</button><a class="btn ghost" href="#/next">כל ההמלצות</a></div>' +
        "</div>" +
        '<div class="card"><div class="card-head"><h3>מה קרה לאחרונה</h3><span class="tag">ACTIVITY</span></div><div class="feed">' + feed + "</div></div>" +
      "</div>";
  };

  R.campaigns = function () {
    return '<div class="grid g2">' + DEMO.campaigns.map(function (c) {
      var pct = Math.round((c.spend / c.budget) * 100);
      return '<div class="card camp"><div class="camp-top"><div><h3>' + c.name + "</h3>" +
        '<div class="camp-meta" style="margin-top:9px"><span class="plat ' + c.plat.toLowerCase() + '">' + c.plat + '</span><span class="pill ' + c.status + '">' + c.statusText + "</span></div></div>" +
        '<div style="text-align:left"><div style="font:900 24px var(--f-display);direction:ltr">' + (c.leads || "—") + '</div><div style="font-size:11px;color:var(--cream-dim)">לידים</div></div></div>' +
        '<div class="camp-stats">' +
          '<div class="st"><b>' + (c.cpl ? nis(c.cpl) : "—") + "</b><span>עלות לליד</span></div>" +
          '<div class="st"><b>' + nis(c.spend) + "</b><span>הוצא עד כה</span></div>" +
          '<div class="st"><b>' + pct + "%</b><span>מהתקציב</span></div>" +
        "</div>" +
        '<div><div class="budget-line"><span>תקציב חודשי</span><b>' + nis(c.spend) + " / " + nis(c.budget) + '</b></div><div class="bar"><i style="width:' + pct + '%"></i></div></div>' +
      "</div>";
    }).join("") + "</div>";
  };

  R.leads = function () {
    var rows = DEMO.leads.map(function (l) {
      var pill = l.status === "new" ? "on" : (l.status === "done" ? "off" : "wait");
      return "<tr><td><div style='display:flex;align-items:center;gap:11px'><span class='av' style='--tint:" + l.tint + ";--tink:" + l.tink + "'>" + l.name.trim().charAt(0) + "</span><div><div class='name'>" + l.name + "</div><div class='dim'>" + l.detail + "</div></div></div></td>" +
        "<td><span class='plat " + l.srcClass + "'>" + l.source + "</span></td>" +
        "<td class='dim'>" + l.date + "</td>" +
        "<td><span class='pill " + pill + "'>" + l.statusText + "</span></td></tr>";
    }).join("");
    return '<div class="card pad-lg"><div class="card-head"><h3>5 הלידים האחרונים</h3><span class="tag">LEADS</span></div>' +
      '<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>ליד</th><th>מקור</th><th>מתי</th><th>סטטוס</th></tr></thead><tbody>' + rows + "</tbody></table></div></div>";
  };

  R.costs = function () {
    var s = DEMO.spend, pct = Math.round((s.spent / s.budget) * 100);
    var max = Math.max.apply(null, s.daily);
    var pts = s.daily.map(function (v, i) {
      var x = 20 + (i * (560 / (s.daily.length - 1)));
      var y = 130 - (v / max) * 105;
      return [Math.round(x), Math.round(y)];
    });
    var line = pts.map(function (p, i) { return (i ? "L" : "M") + p[0] + " " + p[1]; }).join(" ");
    var area = line + " L" + pts[pts.length - 1][0] + " 140 L20 140 Z";
    var channels = s.channels.map(function (c) {
      var w = Math.round((c.v / s.spent) * 100);
      return '<div class="bar-row"><span>' + c.name + '</span><div class="bar"><i style="width:' + w + '%;background:' + c.color + '"></i></div><span class="v">' + nis(c.v) + "</span></div>";
    }).join("");
    return '<div class="grid g2">' +
      '<div class="card pad-lg"><div class="card-head"><h3>תקציב מול ביצוע</h3><span class="tag">ספטמבר</span></div>' +
        '<div style="display:flex;align-items:baseline;gap:10px;margin-bottom:6px"><span style="font:900 42px var(--f-display);direction:ltr">' + nis(s.spent) + '</span><span style="color:var(--cream-dim);font-size:14px">מתוך ' + nis(s.budget) + "</span></div>" +
        '<div class="bar" style="height:10px"><i style="width:' + pct + '%"></i></div>' +
        '<div style="font-size:12px;color:var(--cream-dim);margin-top:10px">' + pct + '% מהתקציב · נותרו ' + nis(s.budget - s.spent) + "</div>" +
        '<div style="margin-top:26px">' + channels + "</div></div>" +
      '<div class="card pad-lg"><div class="card-head"><h3>הוצאה יומית</h3><span class="tag">14 DAYS</span></div>' +
        '<svg class="spark" viewBox="0 0 600 150" preserveAspectRatio="none"><defs><linearGradient id="spg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#111" stop-opacity=".14"/><stop offset="1" stop-color="#111" stop-opacity="0"/></linearGradient></defs><path class="area" d="' + area + '"/><path class="line" pathLength="1000" d="' + line + '"/><circle class="dot" cx="' + pts[pts.length - 1][0] + '" cy="' + pts[pts.length - 1][1] + '" r="4.5"/></svg>' +
        '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--cream-faint)"><span>לפני שבועיים</span><span>אתמול: ' + nis(s.daily[s.daily.length - 1]) + "</span></div></div>" +
      "</div>";
  };

  R.work = function () {
    return '<div class="grid g3">' + DEMO.work.map(function (w) {
      var steps = w.stages.map(function (st, i) {
        var cls = i < w.stage ? "done" : (i === w.stage ? "now" : "");
        return '<div class="step ' + cls + '">' + st + "</div>";
      }).join("");
      return '<div class="card work-item"><div class="card-head" style="margin-bottom:2px"><span class="plat">' + w.kind + '</span><span class="tag">' + w.eta + "</span></div>" +
        "<h3>" + w.title + '</h3><div class="steps">' + steps + "</div></div>";
    }).join("") + "</div>";
  };

  R.pulse = function () {
    return '<div class="grid g3">' + DEMO.insights.map(function (i) {
      return '<div class="card insight"><div class="card-head" style="margin-bottom:2px"><span class="tag">' + i.when + '</span><span class="plat">' + i.src + "</span></div>" +
        '<div class="q">' + i.q + "</div><p>" + i.p + "</p></div>";
    }).join("") + "</div>";
  };

  R.next = function () {
    var moves = DEMO.moves.map(function (m) {
      return '<div class="card move"><h3>' + m.title + "</h3><p>" + m.p + "</p>" +
        '<div class="foot"><button class="btn" data-approve>מאשר</button><span class="impact">למה: <b>' + m.impact + "</b></span></div></div>";
    }).join("");
    return '<div class="card pad-lg next-hero" style="margin-bottom:14px"><span class="kicker">NEXT MOVE · ההמלצה של השבוע</span>' +
      "<h3>" + DEMO.nextMove.title + "</h3><p>" + DEMO.nextMove.p + "</p>" +
      '<div class="why">' + DEMO.nextMove.why.map(function (w) { return '<span class="why-chip">' + w + "</span>"; }).join("") + "</div>" +
      '<div style="margin-top:20px"><button class="btn" data-approve>מאשר את המהלך</button></div></div>' +
      '<div class="grid g3">' + moves + "</div>";
  };

  /* --- empty states (client mode, pre-connection) --- */
  var E = {
    overview: function () {
      return '<div class="card pad-lg welcome"><span class="kicker">WELCOME</span>' +
        "<h3 style='font:900 26px var(--f-display)'>ברוכים הבאים ל-DNA OS</h3>" +
        "<p class='sub'>זה הבית של השיווק שלך: מה קורה, מה DNA עושה בשבילך ומה הצעד הבא - הכל במקום אחד. המערכת ריקה כרגע, וזה צפוי: היא מתמלאת כשצוות DNA מחבר את החשבונות שלך.</p>" +
        "<ol><li><span class='n'>1</span><span><b>חיבור החשבונות.</b> צוות DNA מחבר את חשבונות הפרסום והאתר שלך למערכת.</span></li>" +
        "<li><span class='n'>2</span><span><b>הנתונים מתחילים לזרום.</b> קמפיינים, לידים ועלויות מופיעים כאן בזמן אמת.</span></li>" +
        "<li><span class='n'>3</span><span><b>החלטה אחת ברורה.</b> מדי שבוע מופיעה כאן המלצת NEXT MOVE - ואתה מאשר בלחיצה.</span></li></ol></div>";
    },
    campaigns: function () { return emptyState(ICONS.campaigns, "עוד אין קמפיינים", "כשהקמפיין הראשון שלך יעלה לאוויר, הוא יופיע כאן עם תקציב, תוצאות וסטטוס בזמן אמת."); },
    leads: function () { return emptyState(ICONS.leads, "עוד לא נכנסו לידים", "כל ליד שנכנס מהקמפיינים שלך יופיע כאן, עם המקור והסטטוס שלו."); },
    costs: function () { return emptyState(ICONS.costs, "אין עדיין נתוני עלויות", "אחרי חיבור חשבונות הפרסום תראה כאן את ההוצאה מול התקציב, לפי ערוץ ולפי יום."); },
    work: function () { return emptyState(ICONS.work, "אין כרגע עבודות בתהליך", "סרטים, דפים וקריאייטיב ש-DNA מפיקה בשבילך יופיעו כאן עם שלב ההתקדמות שלהם."); },
    pulse: function () { return emptyState(ICONS.pulse, "עוד לא נאספו תובנות", "אחרי שהקמפיינים ירוצו, נרשום כאן מה למדנו: מה עובד, מה לא ומה שינינו."); },
    next: function () { return emptyState(ICONS.next, "הצעד הבא יופיע כאן", "ברגע שיהיו מספיק נתונים, תקבל כאן המלצה אחת ברורה לשבוע - עם הסבר למה, ואישור בלחיצה."); }
  };

  function init() {
  if (isAdminUser && !isDemo) {
    VIEWS.push({ id: "admin", title: "ניהול", tag: "ADMIN", icon: ICONS.work });
  }

  /* ---------------- chrome ---------------- */
  document.getElementById("brandMark").innerHTML = "DNA <span>OS</span><i></i>";
  document.getElementById("clientLabel").innerHTML = (isDemo ? "מציגים בתור" : "מחובר בתור") + "<b>" + esc(clientName) + "</b>";
  var pill = document.getElementById("modePill");
  if (isDemo) {
    pill.className = "mode-pill demo";
    pill.textContent = "מצב דמו - נתוני הדגמה של עסק דמיוני. הנתונים אינם של לקוח אמיתי.";
  } else {
    pill.textContent = "גישה פרטית ומאובטחת · הנתונים נגישים לבעלי החשבון בלבד.";
  }

  var nav = document.getElementById("nav");
  var tabbar = document.getElementById("tabbar");
  VIEWS.forEach(function (v) {
    var b = document.createElement("button");
    b.innerHTML = v.icon + "<span>" + v.title + '</span><span class="tag">' + v.tag + "</span>";
    b.dataset.view = v.id;
    b.addEventListener("click", function () { location.hash = "#/" + v.id; });
    nav.appendChild(b);
    var t = document.createElement("button");
    t.innerHTML = v.icon + "<span>" + v.title + "</span>";
    t.dataset.view = v.id;
    t.addEventListener("click", function () { location.hash = "#/" + v.id; });
    tabbar.appendChild(t);
  });

  document.getElementById("exitBtn").addEventListener("click", function () {
    try { sessionStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY + "_demo"); } catch (e) {}
    if (sbClient) {
      sbClient.auth.signOut().then(function () { location.href = "../dna-os-login.html"; }).catch(function () { location.href = "../dna-os-login.html"; });
    } else {
      location.href = "../dna-os-login.html";
    }
  });

  var DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  var MONTHS = ["בינואר", "בפברואר", "במרץ", "באפריל", "במאי", "ביוני", "ביולי", "באוגוסט", "בספטמבר", "באוקטובר", "בנובמבר", "בדצמבר"];
  var now = new Date();
  document.getElementById("todayDate").textContent = "יום " + DAYS[now.getDay()] + ", " + now.getDate() + " " + MONTHS[now.getMonth()] + " " + now.getFullYear();

  /* ---------------- router ---------------- */
  function route() {
    var id = (location.hash || "#/overview").replace("#/", "").split("?")[0];
    var view = VIEWS.filter(function (v) { return v.id === id; })[0] || VIEWS[0];
    document.getElementById("viewTag").textContent = (isDemo ? "DNA OS / " : "DNA OS / ") + view.tag;
    document.getElementById("viewTitle").textContent = view.title;
    document.title = "DNA OS · " + view.title;
    var root = document.getElementById("viewRoot");
    if (view.id === "admin" && window.DNAOS_ADMIN) {
      if (root.dataset.view !== "admin") {
        root.dataset.view = "admin";
        root.innerHTML = '<div class="view">' + window.DNAOS_ADMIN.render() + "</div>";
        window.DNAOS_ADMIN.mount(root, sbClient);
      }
    } else {
      root.dataset.view = view.id;
      root.innerHTML = '<div class="view">' + (isDemo ? R[view.id]() : E[view.id]()) + "</div>";
    }
    document.querySelectorAll("[data-view]").forEach(function (b) {
      b.classList.toggle("active", b.dataset.view === view.id);
    });
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  if (isAdminUser && !isDemo && !location.hash) location.hash = "#/admin";
  route();

  /* ---------------- approve buttons ---------------- */
  var toastTimer = null;
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-approve]");
    if (!btn) return;
    btn.classList.add("done");
    btn.textContent = "נרשם ✓";
    var t = document.getElementById("toast");
    t.textContent = isDemo
      ? "בדמו האישור לא נשלח. במערכת המלאה הבחירה מגיעה ישר לצוות DNA."
      : "הבחירה נרשמה. בגרסה המלאה היא נשלחת ישירות לצוות DNA.";
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3200);
  });

  var veil = document.getElementById("bootVeil");
  if (veil) veil.remove();
  }

  /* ---------------- boot ---------------- */
  function boot(name, sb, admin) {
    clientName = name;
    sbClient = sb || null;
    isAdminUser = !!admin;
    if (isDemo) document.body.classList.add("demo");
    init();
  }

  if (isDemo) {
    try { sessionStorage.setItem(SESSION_KEY + "_demo", "1"); } catch (e) {}
    boot("קפה הדקל (דמו)", null);
  } else {
    (async function () {
      var fail = function () { location.replace("../dna-os-login.html"); };
      try {
        var cfg = window.DNA_OS_SB || {};
        var mod = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm");
        var sb = mod.createClient(cfg.url, cfg.anonKey);
        var r = await sb.auth.getSession();
        var sess = r && r.data && r.data.session;
        if (!sess) { fail(); return; }
        var name = (sess.user && sess.user.email) || "לקוח DNA";
        var admin = false;
        try {
          var pr = await sb.from("profiles").select("display_name,is_admin").eq("user_id", sess.user.id).maybeSingle();
          if (pr && pr.data && pr.data.display_name) name = pr.data.display_name;
          if (pr && pr.data && pr.data.is_admin) admin = true;
        } catch (e) {}
        boot(name, sb, admin);
      } catch (e) { fail(); }
    })();
  }
})();
