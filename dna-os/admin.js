/* DNA OS - admin console (visible only to profiles.is_admin).
   Create client logins and enter real client data. Writes go through RLS;
   user creation goes through the admin-create-user edge function. */
window.DNAOS_ADMIN = (function () {
  var sb = null, rootEl = null;
  var clients = [], currentClientId = null, tab = "campaigns", msgTimer = null;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var TABS = {
    campaigns: {
      title: "קמפיינים", table: "campaigns",
      fields: [
        { k: "name", label: "שם הקמפיין", t: "text", req: 1 },
        { k: "platform", label: "פלטפורמה", t: "select", opts: ["META", "GOOGLE", "TIKTOK"] },
        { k: "status", label: "סטטוס", t: "select", opts: ["active", "learning", "paused"], he: { active: "פעיל", learning: "בלמידה", paused: "מושהה" } },
        { k: "budget", label: "תקציב חודשי ₪", t: "number" },
        { k: "spend", label: "הוצא עד כה ₪", t: "number" },
        { k: "leads", label: "לידים", t: "number" },
        { k: "cpl", label: "עלות לליד ₪", t: "number" },
        { k: "delta", label: "שינוי (טקסט חופשי)", t: "text" }
      ],
      cols: [["name", "שם"], ["platform", "פלטפורמה"], ["status", "סטטוס"], ["leads", "לידים"], ["cpl", "CPL"], ["spend", "הוצא"], ["budget", "תקציב"]]
    },
    leads: {
      title: "לידים", table: "leads",
      fields: [
        { k: "name", label: "שם הליד", t: "text", req: 1 },
        { k: "source", label: "מקור", t: "select", opts: ["אינסטגרם", "גוגל", "טיקטוק", "אתר", "אחר"] },
        { k: "status", label: "סטטוס", t: "select", opts: ["new", "prog", "done"], he: { new: "חדש", prog: "בטיפול", done: "נסגר" } },
        { k: "value", label: "שווי ₪", t: "number" },
        { k: "note", label: "הערה", t: "text" }
      ],
      cols: [["name", "שם"], ["source", "מקור"], ["status", "סטטוס"], ["value", "שווי"], ["created_at", "נוצר"]]
    },
    costs: {
      title: "עלויות", table: "costs",
      fields: [
        { k: "label", label: "סעיף", t: "text", req: 1 },
        { k: "amount", label: "סכום ₪", t: "number", req: 1 },
        { k: "kind", label: "סוג", t: "select", opts: ["fixed", "variable"], he: { fixed: "קבוע", variable: "משתנה" } },
        { k: "month", label: "חודש", t: "date" }
      ],
      cols: [["label", "סעיף"], ["kind", "סוג"], ["amount", "סכום"], ["month", "חודש"]]
    },
    moves: {
      title: "הצעד הבא", table: "next_moves", doneField: "done",
      fields: [
        { k: "title", label: "כותרת ההמלצה", t: "text", req: 1 },
        { k: "body", label: "הסבר - למה", t: "text", req: 1 }
      ],
      cols: [["title", "כותרת"], ["body", "הסבר"], ["done", "בוצע"]]
    },
    tasks: {
      title: "משימות", table: "tasks", doneField: "done",
      fields: [
        { k: "title", label: "משימה", t: "text", req: 1 },
        { k: "due", label: "יעד", t: "date" },
        { k: "owner", label: "אחראי", t: "select", opts: ["agency", "client"], he: { agency: "DNA", client: "לקוח" } }
      ],
      cols: [["title", "משימה"], ["due", "יעד"], ["owner", "אחראי"], ["done", "בוצע"]]
    }
  };

  function injectStyle() {
    if (document.getElementById("admStyle")) return;
    var st = document.createElement("style");
    st.id = "admStyle";
    st.textContent =
      ".adm .card{margin-bottom:14px}" +
      ".adm-top{display:flex;flex-wrap:wrap;align-items:flex-end;gap:14px}" +
      ".adm-top .kicker{width:100%}" +
      ".adm-sel{display:flex;align-items:center;gap:10px;flex:1;min-width:260px}" +
      ".adm-sel select{flex:1;height:46px;border:1px solid var(--line);border-radius:12px;background:var(--panel);padding:0 12px;font:700 15px var(--f-body);color:var(--ink)}" +
      ".adm-new{margin-top:14px;border-top:1px dashed var(--line);padding-top:14px}" +
      ".adm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:12px}" +
      ".adm-f span{display:block;font:700 12px var(--f-body);color:var(--ink-dim);margin:0 2px 6px}" +
      ".adm-f input,.adm-f select{width:100%;height:44px;border:1px solid var(--line);border-radius:12px;background:var(--panel);padding:0 11px;font:400 14px var(--f-body);color:var(--ink);outline:0}" +
      ".adm-f input:focus,.adm-f select:focus{border-color:var(--ink)}" +
      ".adm-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:2px 0 14px}" +
      ".adm-tab{border:1px solid var(--line);background:var(--panel);border-radius:99px;padding:9px 16px;font:900 13px var(--f-body);color:var(--ink-dim);cursor:pointer}" +
      ".adm-tab.on{background:var(--ink);color:#fff;border-color:var(--ink)}" +
      ".adm-msg{border-radius:11px;padding:10px 13px;font:700 13px var(--f-body);margin:10px 0;display:none}" +
      ".adm-msg.ok{display:block;background:var(--p-lime);color:var(--p-lime-ink)}" +
      ".adm-msg.err{display:block;background:var(--p-orange);color:var(--p-orange-ink)}" +
      ".adm-rows td .del{border:1px solid var(--line);background:none;border-radius:8px;width:26px;height:26px;cursor:pointer;color:var(--ink-dim);font-size:13px}" +
      ".adm-rows td .del:hover{color:#c00;border-color:#c00}" +
      ".adm-done{width:18px;height:18px;accent-color:#789c11;cursor:pointer}" +
      ".adm-empty{padding:26px;text-align:center;color:var(--ink-dim);font-size:14px}";
    document.head.appendChild(st);
  }

  function he(f, v) { return (f.he && f.he[v]) || v || "—"; }

  function render() {
    injectStyle();
    return '<div class="adm">' +
      '<div class="card pad-lg adm-top"><span class="kicker">ADMIN · ניהול</span>' +
        '<div class="adm-sel"><select id="admClient"><option value="">...טוען לקוחות</option></select>' +
        '<button class="btn ghost" id="admNewBtn" type="button">+ לקוח חדש</button></div>' +
        '<div class="adm-new" id="admNew" hidden>' +
          '<div class="adm-grid">' +
            '<label class="adm-f"><span>שם העסק</span><input id="ncName" type="text"></label>' +
            '<label class="adm-f"><span>איש קשר (שם תצוגה)</span><input id="ncDisplay" type="text"></label>' +
            '<label class="adm-f"><span>אימייל לכניסה</span><input id="ncEmail" type="email" dir="ltr"></label>' +
            '<label class="adm-f"><span>תחום (אופציונלי)</span><input id="ncBiz" type="text"></label>' +
          '</div>' +
          '<button class="btn" id="ncCreate" type="button">יצירת חשבון + שליחת מייל הגדרת סיסמה</button>' +
          '<div class="adm-msg" id="ncMsg"></div>' +
        '</div>' +
      '</div>' +
      '<div id="admData" hidden>' +
        '<div class="adm-tabs" id="admTabs"></div>' +
        '<div class="card pad-lg"><div id="admForm"></div><div class="adm-msg" id="admMsg"></div><div id="admRows" style="margin-top:16px"></div></div>' +
      '</div>' +
    '</div>';
  }

  async function loadClients() {
    var r = await sb.from("clients").select("id,name,business,status").order("created_at", { ascending: false });
    clients = r.data || [];
    var sel = rootEl.querySelector("#admClient");
    sel.innerHTML = clients.length
      ? clients.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + "</option>"; }).join("")
      : '<option value="">אין עדיין לקוחות</option>';
    if (clients.length && !currentClientId) currentClientId = clients[0].id;
    if (currentClientId) sel.value = currentClientId;
    rootEl.querySelector("#admData").hidden = !clients.length;
  }

  function fieldInput(f) {
    var inner;
    if (f.t === "select") {
      inner = '<select data-k="' + f.k + '">' + f.opts.map(function (o) {
        return '<option value="' + o + '">' + esc(he(f, o)) + "</option>";
      }).join("") + "</select>";
    } else {
      inner = '<input data-k="' + f.k + '" type="' + f.t + '"' + (f.t === "number" ? ' dir="ltr" min="0" step="any"' : "") + ">";
    }
    return '<label class="adm-f"><span>' + f.label + (f.req ? " *" : "") + "</span>" + inner + "</label>";
  }

  function renderForm() {
    var t = TABS[tab];
    rootEl.querySelector("#admForm").innerHTML =
      '<div class="adm-grid">' + t.fields.map(fieldInput).join("") + "</div>" +
      '<button class="btn" id="admAdd" type="button">הוספה · ' + t.title + "</button>";
    rootEl.querySelector("#admAdd").addEventListener("click", addRow);
  }

  function renderTabs() {
    var wrap = rootEl.querySelector("#admTabs");
    wrap.innerHTML = Object.keys(TABS).map(function (k) {
      return '<button type="button" class="adm-tab' + (k === tab ? " on" : "") + '" data-tab="' + k + '">' + TABS[k].title + "</button>";
    }).join("");
    wrap.querySelectorAll("[data-tab]").forEach(function (b) {
      b.addEventListener("click", function () { tab = b.dataset.tab; renderTabs(); renderForm(); loadRows(); });
    });
  }

  function showMsg(id, kind, text) {
    var m = rootEl.querySelector("#" + id);
    m.className = "adm-msg " + kind;
    m.textContent = text;
    clearTimeout(msgTimer);
    msgTimer = setTimeout(function () { m.className = "adm-msg"; }, 5000);
  }

  async function addRow() {
    var t = TABS[tab];
    var row = { client_id: currentClientId };
    var missing = false;
    rootEl.querySelectorAll("#admForm [data-k]").forEach(function (el) {
      var f = t.fields.filter(function (x) { return x.k === el.dataset.k; })[0];
      var v = el.value.trim();
      if (f.req && !v) missing = true;
      if (f.t === "number") { row[f.k] = v === "" ? 0 : Number(v); }
      else if (f.t === "date") { if (v) row[f.k] = v; }
      else if (v !== "") row[f.k] = v;
    });
    if (missing) { showMsg("admMsg", "err", "חסר שדה חובה."); return; }
    var r = await sb.from(t.table).insert(row);
    if (r.error) { showMsg("admMsg", "err", "שמירה נכשלה: " + r.error.message); return; }
    showMsg("admMsg", "ok", "נשמר.");
    renderForm(); loadRows();
  }

  function cellVal(t, col, row) {
    var k = col[0], v = row[k];
    var f = t.fields.filter(function (x) { return x.k === k; })[0];
    if (t.doneField === k) return '<input type="checkbox" class="adm-done" data-id="' + row.id + '"' + (v ? " checked" : "") + ">";
    if (f && f.t === "select") return esc(he(f, v));
    if (k === "created_at" || k === "month" || k === "due") return v ? esc(String(v).slice(0, 10)) : "—";
    if (typeof v === "number" && (k === "amount" || k === "value" || k === "cpl" || k === "spend" || k === "budget")) return "₪" + Number(v).toLocaleString("en-US");
    return (v === null || v === undefined || v === "") ? "—" : esc(v);
  }

  async function loadRows() {
    var t = TABS[tab];
    var box = rootEl.querySelector("#admRows");
    var ordCol = tab === "campaigns" ? "updated_at" : tab === "costs" ? "month" : tab === "moves" ? "sort" : "created_at";
    var r = await sb.from(t.table).select("*").eq("client_id", currentClientId).order(ordCol, { ascending: tab !== "moves" ? false : true }).limit(60);
    var rows = r.data || [];
    if (!rows.length) { box.innerHTML = '<div class="adm-empty">אין עדיין רשומות בלשונית הזו ללקוח הזה.</div>'; return; }
    box.innerHTML = '<div style="overflow-x:auto"><table class="tbl adm-rows"><thead><tr>' +
      t.cols.map(function (c) { return "<th>" + c[1] + "</th>"; }).join("") + "<th></th></tr></thead><tbody>" +
      rows.map(function (row) {
        return "<tr>" + t.cols.map(function (c) { return "<td>" + cellVal(t, c, row) + "</td>"; }).join("") +
          '<td><button class="del" data-id="' + row.id + '" title="מחיקה">✕</button></td></tr>';
      }).join("") + "</tbody></table></div>";
    box.querySelectorAll(".del").forEach(function (b) {
      b.addEventListener("click", async function () {
        var rr = await sb.from(t.table).delete().eq("id", b.dataset.id);
        if (rr.error) showMsg("admMsg", "err", "מחיקה נכשלה: " + rr.error.message);
        else loadRows();
      });
    });
    box.querySelectorAll(".adm-done").forEach(function (c) {
      c.addEventListener("change", async function () {
        await sb.from(t.table).update({ done: c.checked }).eq("id", c.dataset.id);
      });
    });
  }

  async function mount(el, client) {
    rootEl = el; sb = client;
    await loadClients();
    renderTabs(); renderForm();
    if (currentClientId) loadRows();
    rootEl.querySelector("#admClient").addEventListener("change", function (e) {
      currentClientId = e.target.value; loadRows();
    });
    rootEl.querySelector("#admNewBtn").addEventListener("click", function () {
      var n = rootEl.querySelector("#admNew"); n.hidden = !n.hidden;
    });
    rootEl.querySelector("#ncCreate").addEventListener("click", async function () {
      var name = rootEl.querySelector("#ncName").value.trim();
      var email = rootEl.querySelector("#ncEmail").value.trim();
      var display = rootEl.querySelector("#ncDisplay").value.trim();
      var biz = rootEl.querySelector("#ncBiz").value.trim();
      if (!name || !email) { showMsg("ncMsg", "err", "שם עסק ואימייל הם חובה."); return; }
      var btn = rootEl.querySelector("#ncCreate");
      btn.disabled = true; btn.textContent = "...יוצר";
      try {
        var r = await sb.functions.invoke("admin-create-user", { body: { email: email, displayName: display || name, clientName: name, business: biz } });
        if (r.error || (r.data && r.data.error)) {
          showMsg("ncMsg", "err", "יצירה נכשלה: " + ((r.data && r.data.error) || r.error.message));
        } else {
          var rr = await sb.auth.resetPasswordForEmail(email, { redirectTo: "https://hellodna.co.il/dna-os-login.html" });
          showMsg("ncMsg", rr.error ? "err" : "ok", rr.error
            ? "הלקוח נוצר, אבל שליחת מייל הסיסמה נכשלה - אפשר לשלוח שוב מדף הכניסה ('שכחתי סיסמה')."
            : "נוצר. נשלח מייל ל-" + email + " להגדרת סיסמה.");
          rootEl.querySelector("#ncName").value = ""; rootEl.querySelector("#ncEmail").value = "";
          rootEl.querySelector("#ncDisplay").value = ""; rootEl.querySelector("#ncBiz").value = "";
          await loadClients();
        }
      } catch (e) {
        showMsg("ncMsg", "err", "תקלה: " + e.message);
      }
      btn.disabled = false; btn.textContent = "יצירת חשבון + שליחת מייל הגדרת סיסמה";
    });
  }

  return { render: render, mount: mount };
})();
