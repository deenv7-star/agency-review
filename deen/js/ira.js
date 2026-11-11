/* Ira (אירה): Deen's voice assistant.
   IRA_MODE 'realtime' = ElevenLabs Realtime Max (eleven_realtime_v1_max) through the dna-voice-session edge function (dna-crm).
   IRA_MODE 'agent'    = the older ElevenLabs Agents path (agent below), kept as a fallback: flip the constant to switch back.
   Nothing loads or connects until the first "התחילו שיחה". Nothing runs while the sheet is closed. */
var IRA_MODE = "realtime";
var IRA_SESSION_URL = "https://sqxvjsadnqnnoyfialtg.supabase.co/functions/v1/dna-voice-session";
var IRA_AGENT_ID = "agent_1501m74vfs8ye23rkz8bms17p41x";

/* ---------- IraFace: shared renderer (dialog, #ira-sec, hero button, pill). Ira as a living orb: latitude scanlines of glowing dots, built procedurally ---------- */
(function(){
  'use strict';
  function hash(a,b){ var n=Math.sin(a*127.1+b*311.7)*43758.5453; return n-Math.floor(n); }
  /* 7 brightness buckets, deep electric blue → ice → white. One fill per bucket keeps it to a handful of draw calls */
  var COLS=['rgba(28,70,210,.42)','rgba(40,100,255,.6)','rgba(56,132,255,.78)','rgba(82,160,255,.9)','rgba(128,196,255,.96)','rgba(184,226,255,1)','rgba(242,250,255,1)'];
  var NB=COLS.length, paths=[], TAU=Math.PI*2, GEO={};
  for(var pb0=0;pb0<NB;pb0++) paths[pb0]=[];
  /* the sphere's dots never change per size, so their trig and random seeds are computed once */
  function geo(rows, cols, minN){
    var key=rows+'|'+cols; if(GEO[key]) return GEO[key];
    var L=[], r, k;
    for(r=0;r<rows;r++){ var phi=-Math.PI/2 + Math.PI*(r+0.5)/rows, cp=Math.cos(phi), n=Math.max(minN, Math.round(cols*cp)); for(k=0;k<n;k++) L.push([r,cp,Math.sin(phi),TAU*k/n + (r&1)*Math.PI/n,k]); }
    var N=L.length, g={n:N,row:new Int16Array(N),cp:new Float32Array(N),sp:new Float32Array(N),st:new Float32Array(N),ct:new Float32Array(N),h1:new Float32Array(N),h3:new Float32Array(N),ca:new Float32Array(N),sa:new Float32Array(N)};
    for(var j=0;j<N;j++){ var e=L[j], ang=hash(e[4]+3,e[0])*TAU; g.row[j]=e[0]; g.cp[j]=e[1]; g.sp[j]=e[2]; g.st[j]=Math.sin(e[3]); g.ct[j]=Math.cos(e[3]); g.h1[j]=hash(e[0],e[4])*0.6; g.h3[j]=0.8+hash(e[0]+7,e[4])*1.8; g.ca[j]=Math.cos(ang); g.sa[j]=Math.sin(ang); }
    return (GEO[key]=g);
  }
  /* t seconds, v 0..1 level (mic while listening, her voice while speaking), mode = data-state.
     o: dense (big canvas), mini (button/pill), px/py pointer -1..1, energy 0..1 (ambient wake), calm (reduced motion),
        assemble 0..1 (scroll reveal: dots fly in from scattered particles), ptr {x,y,s} canvas px (lines lean toward the cursor), tap {x,y,age} (ripple) */
  function render(ctx, W, t, v, mode, o){
    o=o||{};
    var mini=!!o.mini, dense=!mini && o.dense!==false;
    var speak=mode==='speaking', listen=mode==='listening', conn=mode==='connecting', done=mode==='ended'||mode==='error';
    var energy=o.energy||0, px=o.px||0, py=o.py||0, asm=o.assemble==null ? 1 : o.assemble, ptr=o.ptr, tap=o.tap;
    var vin = listen ? v : energy*0.55, vout = speak ? v : 0;
    var lite=!!o.lite, rows = mini ? 9 : lite ? 44 : dense ? 56 : 44, cols = Math.round(rows*(mini ? 2.6 : lite ? 3.2 : 3.5));   /* lite: phone during a live call */
    var cx=W/2, cy=W/2, R=W*(mini ? 0.38 : 0.3);
    var rot = t*(done ? 0.06 : 0.15) + Math.sin(t*0.23)*0.14 + px*0.55, tilt = 0.2 + Math.sin(t*0.17+1)*0.025 + py*0.16;   /* never a constant spin: it drifts like something alive */
    var cT=Math.cos(tilt), sT=Math.sin(tilt);
    var breathe = 1 + (Math.sin(t*1.05) + Math.sin(t*0.37+1)*0.6)*(mini ? 0.02 : 0.01) + vout*0.05 + vin*0.025;
    var dotB = Math.max(mini ? 1.4 : 1, W*(mini ? 0.034 : lite ? 0.0048 : dense ? 0.0036 : 0.0044));
    var glitch = !mini && !done && !o.calm && (Math.sin(t*0.71)+Math.sin(t*1.29+2)) > 1.95;   /* very rare, a breath of signal, never a gimmick */
    var gRow = glitch ? (hash(Math.floor(t*9),3)*rows)|0 : -99;
    var scan = conn ? ((t*0.62)%1.5)*2.4-1.4 : -9;   /* screen-space sweep, top to bottom */
    var gain = done ? 0.42 : speak ? 1.1 : 1;
    var i,b,G=geo(rows, cols, mini ? 5 : 8), N=G.n, sR=Math.sin(rot), cR=Math.cos(rot);
    var t62=t*0.62, t47=t*0.47, t38=t*0.38, t9=t*0.9, tB=t*1.25, sweep=t*9.5;
    var limbK = done ? 0.4 : 1, bendA = R*(0.012 + vin*0.03), rB=R*breathe, rad2=R*R*0.25, tapF=tap && tap.age<1.6 ? tap.age*R*2.2 : -1;
    for(b=0;b<NB;b++) paths[b].length=0;
    var lastR=-1, rowK=1, shift=0;
    for(var j=0;j<N;j++){
      var r=G.row[j], cp=G.cp[j], by=G.sp[j], st=G.st[j], ct=G.ct[j];
      var nz0=cp*(ct*cR - st*sR), z2 = by*sT + nz0*cT;                 /* view space, seen a little from above */
      if(z2 < -0.02) continue;                                           /* far side: not drawn, keeps it clean and cheap */
      if(r!==lastR){ lastR=r; rowK=0.82 + 0.18*Math.sin(r*1.9 + t*2.3); shift=(Math.abs(r-gRow)<2) ? (hash(r,Math.floor(t*12))-0.5)*R*0.06 : 0; }
      var bx=cp*st, bz=cp*ct, nx=cp*(st*cR + ct*sR), y2 = by*cT - nz0*sT;
      /* flowing energy across the surface: the pattern rides on the sphere as it turns */
      var f01 = (Math.sin(bx*3.1 + by*2.3 + t62) + Math.sin(by*3.6 - bz*2.5 - t47) + Math.sin(bz*2.8 + bx*1.9 + t38) + 3)/6;
      var d = (f01-0.5)*0.05*limbK, wave=0, u=1-z2;
      if(vin>0.005) d += vin*(Math.sin(bx*9 + t*6.5)*Math.sin(by*8 - t*5.2) + Math.sin(bz*11 - t*7.3)*0.6)*0.05;
      if(vout>0.005){ var a=Math.sqrt(2*u); wave = Math.sin(a*6.5 - sweep); if(wave>0){ d += vout*(0.06 + wave*Math.sqrt(wave)*0.2*(1-a*0.25)); } else { d += vout*0.06; wave=0; } }
      var sd2=0; if(conn){ sd2=(y2-scan); d += Math.exp(-sd2*sd2*16)*0.06; }
      var rr = rB*(1+d), persp = 1/(1 - z2*0.16);
      var sx = cx + nx*rr*persp + shift, sy = cy - y2*rr*persp;
      sy += Math.sin(nx*4.2 + tB + r*0.45)*bendA*(0.7 + 0.5*Math.sin(t*0.31 + r*0.07));                        /* lines bend */
      if(wave>0) sy += (sy-cy)*vout*0.05*wave;                            /* rows part on each pulse */
      var q=1;
      if(asm<1){   /* scroll reveal: each dot arrives from its own scattered spot, staggered */
        q=Math.min(1,Math.max(0,(asm-G.h1[j])/0.4)); q=q*q*(3-2*q); if(q<=0.002) continue;
        var far=G.h3[j]*R*(1-q); sx+=G.ca[j]*far; sy+=G.sa[j]*far*0.8;
      }
      var hs=Math.sin(bx*2.2 - by*3.4 + bz*1.6 + t9), hot = hs>0 ? hs*hs*hs : 0;   /* a bright current sliding over the surface */
      var br = (0.12 + 0.78*f01*f01 + hot*1.25 + u*u*(0.25+0.15*u))*gain*rowK;
      br += vout*wave*wave*1.2 + vin*0.22;
      if(conn) br *= 0.22 + 1.3*Math.exp(-sd2*sd2*10);
      br *= 0.35 + 0.65*Math.min(1, z2*6+0.25);                           /* fade into the limb */
      if(ptr){ var ddx=ptr.x-sx, ddy=ptr.y-sy, dd=ddx*ddx+ddy*ddy; if(dd<rad2*9){ var pf=Math.exp(-dd/rad2)*ptr.s; sx+=ddx*pf*0.2; sy+=ddy*pf*0.2; br+=pf*0.8; } }
      if(tapF>=0){ var tdx=sx-tap.x, tdy=sy-tap.y, tw=(Math.sqrt(tdx*tdx+tdy*tdy)-tapF)/(R*0.13); if(tw>-3 && tw<3){ var wv=Math.exp(-tw*tw)*(1-tap.age/1.6); sy-=wv*R*0.07; br+=wv; } }
      if(q<1) br *= 0.25 + 0.75*q;
      if(br<0.09) continue;
      var bi = Math.min(NB-1, (Math.min(br,1.2)*NB/1.2)|0);
      paths[bi].push(sx, sy, dotB*(0.5 + 0.45*z2 + Math.min(br,1)*0.35));
    }
    /* particles: stateless, born at the surface and drifting out; more of them while she speaks */
    if(!mini){
      var NP = lite ? 60 : dense ? 150 : 90, life;
      for(i=0;i<NP;i++){
        var sd=hash(i,1), ang=sd*TAU + t*0.04*(hash(i,4)-0.5);
        life = 3.5 + hash(i,2)*4;
        var age = ((t/life) + hash(i,3)) % 1;
        var reach = 0.25 + vout*0.9 + vin*0.35 + energy*0.2 + (1-asm)*1.4;
        var dist = R*breathe*(1.02 + age*reach*(0.6+hash(i,5)));
        var pb = Math.sin(age*Math.PI)*(0.25 + vout*1.1 + vin*0.4 + (1-asm)*0.5)*(done?0.3:1)*(conn?0.5:1);
        if(pb<0.08) continue;
        var bj = Math.min(NB-1, (pb*NB*0.8)|0);
        paths[bj].push(cx + Math.cos(ang)*dist, cy + Math.sin(ang)*dist*0.94, dotB*(0.5+hash(i,6)*0.6));
      }
    }
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    /* core light: soft, never a filled ball */
    var g = ctx.createRadialGradient(cx,cy,0,cx,cy,R*(1.5+vout*0.4));
    var ga = ((mini ? 0.32 : 0.16)*(done ? 0.45 : 1) + vout*0.14 + vin*0.06)*(0.2 + 0.8*asm);
    g.addColorStop(0,'rgba(70,120,255,'+ga.toFixed(3)+')'); g.addColorStop(0.45,'rgba(70,80,235,'+(ga*0.45).toFixed(3)+')'); g.addColorStop(1,'rgba(40,50,200,0)');   /* a touch of indigo keeps the light warm */
    ctx.fillStyle=g; ctx.fillRect(0,0,W,W);
    if(glitch){   /* RGB split on the glitch frame */
      ctx.fillStyle='rgba(255,60,120,.14)'; fillFrom(ctx, R*0.008, NB-3, 1);
      ctx.fillStyle='rgba(60,230,255,.12)'; fillFrom(ctx, -R*0.008, NB-3, 1);
    }
    if(!mini && !lite){ ctx.fillStyle='rgba(70,140,255,.08)'; fillFrom(ctx, 0, NB-2, 3.2); }   /* bloom on the bright dots */
    for(b=0;b<NB;b++){ var p=paths[b]; if(!p.length) continue; ctx.fillStyle=COLS[b]; for(i=0;i<p.length;i+=3) ctx.fillRect(p[i]-p[i+2]/2, p[i+1]-p[i+2]/2, p[i+2], p[i+2]); }   /* fillRect beats one big path of tiny rects */
    ctx.restore();
  }
  function fillFrom(ctx, off, from, grow){ for(var b=from;b<NB;b++){ var p=paths[b]; for(var i=0;i<p.length;i+=3){ var s=p[i+2]*grow; ctx.fillRect(p[i]+off-s/2, p[i+1]-s/2, s, s); } } }
  window.IraFace = { render: render, ready: function(f){ f(); } };
})();

(function(){
  'use strict';
  var SDK_URL = 'https://esm.sh/@elevenlabs/client@1.36.0';
  var WA_NUM = '972525979520';
  var root = document.getElementById('ira'); if(!root) return;
  var sheet = root.querySelector('.ira__sheet');
  var $ = function(id){ return document.getElementById(id); };
  var statusEl=$('iraStatus'), capEl=$('iraCap'), noteEl=$('iraNote'), startB=$('iraStart'), muteB=$('iraMute'), muteT=$('iraMuteT'),
      endB=$('iraEnd'), waHot=$('iraWaHot'), wa=$('iraWa'), pill=$('iraPill'), canvas=$('iraOrb');
  var ctx = canvas.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var RT = IRA_MODE==='realtime', ENABLED = RT ? !!IRA_SESSION_URL : !!IRA_AGENT_ID;
  var conv=null, sdk=null, state='idle', muted=false, lastFocus=null, raf=0, t0=0, lvl=0, opened=false, closeT=0;

  /* ---------- state ---------- */
  var LABEL = { idle:'לחצו למטה כדי להתחיל לדבר', connecting:'מתחברת', listening:'מקשיבה', speaking:'מדברת', ended:'השיחה הסתיימה', error:'השיחה לא התחברה', soon:'אירה תעלה בקרוב' };
  function setState(s, label){
    state=s; root.setAttribute('data-state', s); statusEl.textContent = label || LABEL[s] || '';
    var live = s==='connecting'||s==='listening'||s==='speaking';
    startB.hidden = live; muteB.hidden = !(s==='listening'||s==='speaking'); endB.hidden = !live;
    startB.disabled = false;
    if(s==='ended'||s==='error') startB.textContent='שיחה חדשה';
    if(opened) loop(); else drawStatic();
  }

  /* ---------- open / close ---------- */
  function focusables(){ return [].slice.call(sheet.querySelectorAll('button,a[href],[tabindex]:not([tabindex="-1"])')).filter(function(el){ return !el.hidden && el.offsetParent!==null && !el.disabled; }); }
  function open(e){
    if(e) e.preventDefault();
    clearTimeout(closeT);
    lastFocus = document.activeElement; opened = true;
    root.hidden = false; document.documentElement.classList.add('ira-lock');
    if(pill) pill.classList.add('is-off');
    sizeCanvas();
    if(!ENABLED){ root.classList.add('is-soon'); setState('soon'); noteEl.textContent='בינתיים אפשר לשלוח לדין הודעה, והוא עונה בעצמו.'; startB.hidden=true; }
    else if(state==='idle'||state==='ended'||state==='error'){ setState(state); }
    requestAnimationFrame(function(){ root.classList.add('is-open'); var f = ENABLED ? startB : wa; (f && !f.hidden ? f : sheet).focus({preventScroll:true}); });
    warm();
  }
  function close(){
    if(!opened) return; opened=false;
    if(conv) end();
    root.classList.remove('is-open'); document.documentElement.classList.remove('ira-lock');
    if(pill) pill.classList.remove('is-off');
    stopLoop();
    closeT = setTimeout(function(){ root.hidden = true; }, reduce ? 0 : 300);
    if(lastFocus && lastFocus.focus) lastFocus.focus({preventScroll:true});
  }
  document.addEventListener('click', function(e){
    if(e.target.closest('[data-ira-open]')) open(e);
    else if(e.target.closest('[data-ira-close]')) close();
  });
  document.addEventListener('keydown', function(e){   /* document-level: the focused button can disappear when a call starts */
    if(!opened) return;
    if(e.key==='Escape'){ e.preventDefault(); close(); return; }
    if(e.key!=='Tab') return;
    var f = focusables(); if(!f.length){ e.preventDefault(); return; }
    var first=f[0], last=f[f.length-1];
    if(e.shiftKey && (document.activeElement===first || document.activeElement===sheet)){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  });

  /* warm the connection to the SDK host on intent, without downloading it */
  var warmed=false;
  function warm(){ if(warmed||!ENABLED) return; warmed=true; var l=document.createElement('link'); l.rel='preconnect'; l.href = RT ? IRA_SESSION_URL.split('/').slice(0,3).join('/') : 'https://esm.sh'; l.crossOrigin=''; document.head.appendChild(l); }
  if(pill){ pill.addEventListener('pointerenter', warm, {once:true}); pill.addEventListener('focus', warm, {once:true}); }

  /* ---------- WhatsApp ---------- */
  function waLink(text){ return 'https://wa.me/'+WA_NUM+'?text='+encodeURIComponent(text||'היי דין, הגעתי מהאתר שלך ואשמח לדבר על אתר לעסק שלי.'); }
  var waMsg = $('iraWaMsg');
  function showWa(text){
    waHot.href = waLink(text); waHot.hidden = false;
    if(waMsg){ waMsg.textContent = text || ''; waMsg.hidden = !text; }   /* iOS may block the pop-up after an async tool call, so the button is always there */
  }

  /* ---------- captions ---------- */
  function capLine(you, her){
    if(you){ var s=document.createElement('span'); s.className='you'; s.textContent=you; capEl.appendChild(s); }
    if(her){ var h=document.createElement('span'); h.className='her'; h.textContent=her; capEl.appendChild(h); }
    capEl.scrollTop = capEl.scrollHeight;
  }
  function caption(msg){
    if(!msg || !msg.message) return;
    var role = msg.role || msg.source;
    capEl.hidden = false;
    if(role==='user'){ capEl.dataset.you = msg.message; return; }
    var you = capEl.dataset.you; capEl.dataset.you = '';
    capEl.innerHTML = '';
    capLine(you, msg.message);
    capEl.scrollTop = capEl.scrollHeight;
  }

  /* ---------- session ---------- */
  function loadSdk(){ return sdk ? Promise.resolve(sdk) : import(/* webpackIgnore: true */ SDK_URL).then(function(m){ sdk=m; return m; }); }
  function startAgent(){
    if(!IRA_AGENT_ID || conv) return;
    startB.disabled = true; waHot.hidden = true; capEl.hidden = true; capEl.textContent=''; capEl.dataset.you='';
    setState('connecting'); startB.hidden = true;
    noteEl.textContent = 'אם הדפדפן שואל, אשרו גישה למיקרופון.';
    var micOk = navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      ? navigator.mediaDevices.getUserMedia({audio:true}).then(function(s){ s.getTracks().forEach(function(t){t.stop()}); })
      : Promise.reject(new Error('nomic'));
    micOk.then(loadSdk, function(err){ throw Object.assign(new Error('mic'), {mic:true}); })
    .then(function(m){
      return m.Conversation.startSession({
        agentId: IRA_AGENT_ID,
        connectionType: 'websocket',
        clientTools: {
          open_whatsapp: function(params){
            var text = (params && params.message) || '';
            showWa(text);
            try{ window.open(waLink(text), '_blank', 'noopener'); }catch(_){}
            return 'opened';
          }
        },
        onConnect: function(){ noteEl.textContent = 'דברו בחופשיות. אפשר לסיים בכל רגע.'; setState('listening'); },
        onDisconnect: function(){ conv=null; muted=false; muteB.setAttribute('aria-pressed','false'); muteT.textContent='השתקה'; if(state!=='error') setState('ended'); noteEl.textContent='רוצים להמשיך? אפשר לשלוח לדין בוואטסאפ.'; if(opened) startB.focus({preventScroll:true}); },
        onModeChange: function(d){ setState(d.mode==='speaking'?'speaking':'listening'); },
        onMessage: caption,
        onError: function(){ setState('error'); noteEl.textContent='לא הצלחנו לחבר את אירה כרגע. אפשר לשלוח לדין בוואטסאפ.'; }
      });
    })
    .then(function(c){ conv=c; if(!opened){ end(); } })
    .catch(function(err){
      conv=null; setState('error');
      noteEl.textContent = err && err.mic ? 'בלי מיקרופון אירה לא שומעת אתכם. אפשר לאשר גישה בהגדרות הדפדפן, או לשלוח לדין בוואטסאפ.' : 'לא הצלחנו לחבר את אירה כרגע. אפשר לשלוח לדין בוואטסאפ.';
      startB.hidden=false; startB.focus({preventScroll:true});
    });
  }

  /* ---------- realtime (Eleven Realtime Max, OpenAI-Realtime-compatible WebSocket) ---------- */
  /* mic → AudioWorklet → PCM16 mono 24 kHz (~40 ms chunks). Inline as a Blob so no extra file ships. */
  var WORKLET = "class C extends AudioWorkletProcessor{constructor(){super();this.r=sampleRate/24000;this.lp=this.r>1.4;this.x1=0;this.x2=0;this.f=new Float32Array(128);this.p=0;this.o=new Int16Array(960);this.n=0;this.k=0;this.m=false;this.port.onmessage=e=>{if(e.data&&'muted' in e.data)this.m=!!e.data.muted}}process(i){let c=i[0]&&i[0][0];if(!c)return true;for(let j=0;j<c.length;j++){const a=Math.abs(c[j]);if(a>this.k)this.k=a}if(this.lp){if(this.f.length!==c.length)this.f=new Float32Array(c.length);const f=this.f;for(let j=0;j<c.length;j++){const x=c[j];f[j]=(x+2*this.x1+this.x2)*0.25;this.x2=this.x1;this.x1=x}c=f}while(this.p<c.length){const j=Math.floor(this.p),f=this.p-j;const s=j+1<c.length?c[j]*(1-f)+c[j+1]*f:c[j];const v=this.m?0:Math.max(-1,Math.min(1,s));this.o[this.n++]=v<0?v*32768:v*32767;if(this.n===this.o.length){this.port.postMessage({pcm:this.o.buffer,level:this.m?0:Math.min(1,this.k*1.6)},[this.o.buffer]);this.o=new Int16Array(960);this.n=0;this.k=0}this.p+=this.r}this.p-=c.length;return true}}registerProcessor('ira-capture',C);";
  var BARGE_IN = 0.32;   /* mic peak above which the visitor is talking over Ira (echo gate below it while she speaks) */
  /* latency pass (CHANGES-ira-latency.md): jitter lead on (re)start of playback, echo-gate tail + hold, pre-roll, truncate on barge-in, stall watchdog */
  var LEAD = 0.1, GATE_TAIL = 0.15, HOLD = 0.6, PRE_CHUNKS = 2, TRUNCATE = true, STALL_MS = 6000, SECRET_FRESH_MS = 40000;
  var FATAL = { session_expired:1, invalid_api_key:1, authentication_error:1, unauthorized:1, session_not_found:1, invalid_client_secret:1 };
  var KICKOFF = '(הגולש לחץ על "התחילו שיחה". פתחי עכשיו במשפט הפתיחה.)';
  function b64(buf){ var s='', u=new Uint8Array(buf); for(var i=0;i<u.length;i+=0x8000) s+=String.fromCharCode.apply(null, u.subarray(i,i+0x8000)); return btoa(s); }
  function unb64(str){ var bin=atob(str), u=new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); return u.buffer; }
  function clean(t){ return String(t||'').replace(/\[[^\]]{1,24}\]\s*/g,'').replace(/\s{2,}/g,' '); }  /* drop expressive tags like [Warm] */

  function rtCaption(you, ira){
    capEl.hidden = false; capEl.innerHTML = '';
    capLine(you, ira);
  }

  function Realtime(){
    var self=this, AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = null; this.ws=null; this.stream=null; this.node=null; this.sources=[]; this.nextTime=0;
    this.inLvl=0; this.outLvl=0; this.muted=false; this.closed=false; this.active=false; this.pending=0; this.outputs=0;
    this.nudged=false; this.you=''; this.ira=''; this.cb={};
    this.hold=0; this.pre=[]; this.drop=false; this.item=null; this.itemAt=null; this.waitT=0; this.sp=null; this.sAt=0;
    if(!AC) return;
    /* created inside the tap: iOS only starts audio from a user gesture.
       Hardware rate on purpose: a forced 24 kHz context next to the mic breaks Firefox (createMediaStreamSource throws)
       and crackles on some iOS versions. The worklet resamples mic → 24 kHz; 24 kHz playback buffers are resampled by Web Audio. */
    try{ this.ctx = new AC({latencyHint:'interactive'}); }catch(_){ try{ this.ctx = new AC(); }catch(__){ this.ctx=null; } }
    if(!this.ctx) return;
    if(this.ctx.state==='suspended') this.ctx.resume().catch(function(){});
    /* iOS suspends/interrupts the context on calls, Siri, app switch (e.g. after WhatsApp opens): wake it on return */
    this.wake = function(){ if(!self.closed && self.ctx && self.ctx.state!=='running' && self.ctx.state!=='closed' && !document.hidden) self.ctx.resume().catch(function(){}); };
    this.ctx.onstatechange = this.wake;
    document.addEventListener('visibilitychange', this.wake);
  }
  Realtime.prototype.secret = function(){   /* fetched in parallel with the mic prompt; re-fetched if the prompt took long (TTL 60 s) */
    this.sAt = Date.now();
    this.sp = fetch(IRA_SESSION_URL, { method:'POST', headers:{'content-type':'application/json'}, body:'{}' })
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ if(!r.ok || !j.client_secret) throw Object.assign(new Error('session'), {code: j.error || r.status}); return j; }); });
    this.sp.catch(function(){});
    return this.sp;
  };
  Realtime.prototype.mic = function(){
    var self=this;
    if(!this.ctx || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.AudioWorkletNode) return Promise.reject(Object.assign(new Error('mic'),{mic:true}));
    return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true, noiseSuppression:true, autoGainControl:true, channelCount:1}})
      .catch(function(){ throw Object.assign(new Error('mic'),{mic:true}); })
      .then(function(stream){
        self.stream = stream;
        if(self.closed){ self.stop(); throw new Error('closed'); }
        var url = URL.createObjectURL(new Blob([WORKLET],{type:'application/javascript'}));
        return self.ctx.audioWorklet.addModule(url).then(function(){ URL.revokeObjectURL(url); });
      })
      .then(function(){
        var src = self.ctx.createMediaStreamSource(self.stream);
        self.node = new AudioWorkletNode(self.ctx, 'ira-capture');
        self.node.port.onmessage = function(e){
          var lv = e.data.level || 0, pcm = e.data.pcm; self.inLvl = self.inLvl*0.6 + lv*0.4;
          /* the speaker leaks into the mic: while Ira's audio is playing (+ a short tail) send silence unless it's a real barge-in.
             Once a chunk crosses BARGE_IN the gate stays open for HOLD s (speech dips between syllables), and the last
             PRE_CHUNKS gated chunks go first so the server hears the start of the word, not a chopped fragment. */
          var now = self.ctx.currentTime, echo = !self.muted && now < self.nextTime + GATE_TAIL;
          if(echo && lv >= BARGE_IN){
            if(now >= self.hold) self.pre.forEach(function(p){ self.send({ type:'input_audio_buffer.append', audio: b64(p) }); });
            self.pre = []; self.hold = now + HOLD;
          }
          if(echo && now >= self.hold){ self.pre.push(pcm); if(self.pre.length > PRE_CHUNKS) self.pre.shift(); pcm = new Int16Array(pcm.byteLength/2).buffer; }
          else if(!echo && self.pre.length) self.pre = [];
          self.send({ type:'input_audio_buffer.append', audio: b64(pcm) });
        };
        src.connect(self.node);
        self.out = self.ctx.createGain(); self.out.connect(self.ctx.destination);
        self.an = self.ctx.createAnalyser(); self.an.fftSize = 256; self.out.connect(self.an); self.buf = new Uint8Array(256);
      });
  };
  Realtime.prototype.connect = function(){
    var self=this;
    var sp = (this.sp && Date.now() - this.sAt < SECRET_FRESH_MS) ? this.sp : this.secret();
    return sp
      .then(function(s){
        if(self.closed) throw new Error('closed');
        return new Promise(function(resolve, reject){
          var ws = self.ws = new WebSocket(s.ws_url+'?model='+encodeURIComponent(s.model), ['realtime','openai-insecure-api-key.'+s.client_secret]);
          var opened=false;
          ws.onopen = function(){ opened=true; resolve(self); };
          ws.onmessage = function(m){ var ev; try{ ev=JSON.parse(m.data); }catch(_){ return; } self.handle(ev); };
          ws.onerror = function(){ if(!opened) reject(new Error('ws')); };
          ws.onclose = function(){ if(!opened){ reject(new Error('ws')); return; } self.finish(); };
        });
      });
  };
  Realtime.prototype.send = function(o){ if(this.ws && this.ws.readyState===1) this.ws.send(JSON.stringify(o)); };
  Realtime.prototype.respond = function(){ if(this.active){ this.outputs = Math.max(this.outputs,1); return; } this.active=true; this.send({type:'response.create'}); };
  Realtime.prototype.say = function(text){ this.send({type:'conversation.item.create', item:{type:'message', role:'user', content:[{type:'input_text', text:text}]}}); this.respond(); };
  Realtime.prototype.play = function(buf){
    if(!this.ctx || this.closed) return;
    var i16=new Int16Array(buf), ab=this.ctx.createBuffer(1,i16.length,24000), ch=ab.getChannelData(0);
    for(var i=0;i<i16.length;i++) ch[i]=i16[i]/32768;
    var s=this.ctx.createBufferSource(), self=this; s.buffer=ab; s.connect(this.out);
    /* jitter buffer: chunks that arrive in time are chained gap-free; on the first chunk, or after an underrun
       (network hiccup, main thread busy), start LEAD s ahead so the next few chunks can land before they're due */
    var now=this.ctx.currentTime, at = this.nextTime > now+0.01 ? this.nextTime : now+LEAD;
    if(this.itemAt===null) this.itemAt=at;
    s.start(at); this.nextTime=at+ab.duration;
    this.sources.push(s);
    s.onended=function(){ var k=self.sources.indexOf(s); if(k>=0) self.sources.splice(k,1); if(!self.sources.length && !self.active && self.cb.mode) self.cb.mode('listening'); };
  };
  Realtime.prototype.flush = function(){ this.sources.forEach(function(s){ try{ s.stop(); }catch(_){} }); this.sources=[]; this.nextTime=0; };
  /* barge-in: stop what's queued, drop late deltas of the cut response, and tell the server how much was actually heard */
  Realtime.prototype.interrupt = function(){
    var playing = !!this.ctx && this.nextTime > this.ctx.currentTime;
    if(playing && TRUNCATE && this.item && this.itemAt!==null)
      this.send({ type:'conversation.item.truncate', item_id:this.item, content_index:0, audio_end_ms: Math.max(0, Math.round((this.ctx.currentTime-this.itemAt)*1000)) });
    if(playing || this.active) this.drop = true;
    this.flush();
  };
  Realtime.prototype.speaking = function(){ return this.sources.length>0; };
  Realtime.prototype.handle = function(ev){
    var self=this, cb=this.cb;
    switch(ev.type){
      case 'session.created': this.say(KICKOFF); break;   /* Ira speaks first (a bare response.create is ignored by Eleven) */
      case 'input_audio_buffer.speech_started': clearTimeout(this.waitT); this.interrupt(); this.you=''; cb.mode && cb.mode('listening'); break;
      case 'input_audio_buffer.speech_stopped':   /* show "thinking" instead of a silent "listening"; if no reply starts within STALL_MS, ask for one */
        cb.think && cb.think();
        clearTimeout(this.waitT);
        this.waitT = setTimeout(function(){ if(!self.closed && !self.active && !self.speaking()) self.respond(); }, STALL_MS);
        break;
      case 'conversation.item.input_audio_transcription.completed':
        if(ev.transcript){ this.you = clean(ev.transcript).trim(); this.ira=''; rtCaption(this.you, ''); } break;
      case 'response.created': clearTimeout(this.waitT); this.active=true; this.drop=false; this.ira=''; break;
      case 'response.output_audio.delta': case 'response.audio.delta':
        if(this.drop || !ev.delta) break;   /* tail of a response the visitor just talked over */
        if(ev.item_id && ev.item_id!==this.item){ this.item=ev.item_id; this.itemAt=null; }
        cb.mode && cb.mode('speaking'); this.play(unb64(ev.delta)); break;
      case 'response.output_audio_transcript.delta': case 'response.audio_transcript.delta':
        this.ira += ev.delta || ''; rtCaption(this.you, clean(this.ira)); break;
      case 'response.output_audio_transcript.done': case 'response.audio_transcript.done':
        if(ev.transcript) rtCaption(this.you, clean(ev.transcript).trim()); break;
      case 'response.function_call_arguments.done':
        this.pending++;
        var out = { ok:false };
        try{ var a = JSON.parse(ev.arguments||'{}'); out = cb.tool ? cb.tool(ev.name, a) : out; }catch(_){}
        this.send({type:'conversation.item.create', item:{type:'function_call_output', call_id:ev.call_id, output:JSON.stringify(out)}});
        this.pending--; this.outputs++;
        if(!this.pending && !this.active){ this.outputs=0; this.respond(); }
        break;
      case 'response.done':
        this.active=false;
        if(this.outputs && !this.pending){ this.outputs=0; this.respond(); break; }
        var r = ev.response || {}, st = r.status;
        var said = (r.output||[]).some(function(o){ return o.type==='function_call' || (o.content||[]).some(function(c){ return c.transcript || c.text; }); });
        if((st==='failed'||st==='incomplete'||!said) && st!=='cancelled' && !this.nudged){ this.nudged=true; this.respond(); break; }
        setTimeout(function(){ if(!self.speaking() && !self.active && cb.mode) cb.mode('listening'); }, 120);
        break;
      case 'error':
        var code = (ev.error && (ev.error.code || ev.error.type)) || '';
        if(FATAL[code]){ cb.error && cb.error(code); this.endSession(); }
        else if(/active_response|already has an active response/i.test(code+' '+((ev.error&&ev.error.message)||''))) this.active=true;
        break;
    }
  };
  Realtime.prototype.finish = function(){ if(this.done) return; this.done=true; this.stop(); this.cb.close && this.cb.close(); };
  Realtime.prototype.stop = function(){
    this.closed=true; this.flush(); clearTimeout(this.waitT);
    if(this.wake) document.removeEventListener('visibilitychange', this.wake);
    try{ this.node && this.node.disconnect(); }catch(_){}
    if(this.stream) this.stream.getTracks().forEach(function(t){ t.stop(); });
    if(this.ctx && this.ctx.state!=='closed') this.ctx.close().catch(function(){});
    this.node=null; this.stream=null;
  };
  /* the same surface the UI uses for the agent SDK */
  Realtime.prototype.endSession = function(){ this.closed=true; try{ this.ws && this.ws.close(1000); }catch(_){} this.finish(); };
  Realtime.prototype.setMicMuted = function(m){ this.muted=!!m; if(this.node) this.node.port.postMessage({muted:this.muted}); if(m) this.inLvl=0; };
  Realtime.prototype.getInputVolume = function(){ return this.muted ? 0 : this.inLvl; };
  Realtime.prototype.getOutputVolume = function(){
    if(!this.an) return 0; this.an.getByteTimeDomainData(this.buf);
    var pk=0; for(var i=0;i<this.buf.length;i++) pk=Math.max(pk, Math.abs(this.buf[i]-128));
    this.outLvl = this.outLvl*0.7 + Math.min(1, pk/64)*0.3; return this.outLvl;
  };

  function onEnded(){ conv=null; muted=false; muteB.setAttribute('aria-pressed','false'); muteT.textContent='השתקה'; if(state!=='error') setState('ended'); noteEl.textContent='רוצים להמשיך? אפשר לשלוח לדין בוואטסאפ.'; if(opened) startB.focus({preventScroll:true}); }
  function failMsg(err){
    conv=null; setState('error');
    noteEl.textContent = err && err.mic ? 'בלי מיקרופון אירה לא שומעת אתכם. אפשר לאשר גישה בהגדרות הדפדפן, או לשלוח לדין בוואטסאפ.'
      : err && err.code==='rate_limited' ? 'אירה דיברה הרבה בדקות האחרונות. נסו שוב עוד כמה דקות, או שלחו לדין בוואטסאפ.'
      : 'לא הצלחנו לחבר את אירה כרגע. אפשר לשלוח לדין בוואטסאפ.';
    startB.hidden=false; startB.focus({preventScroll:true});
  }
  function startRealtime(){
    if(!IRA_SESSION_URL || conv) return;
    startB.disabled = true; waHot.hidden = true; capEl.hidden = true; capEl.textContent=''; capEl.dataset.you='';
    var rt = new Realtime();          /* synchronous inside the tap (iOS audio unlock) */
    conv = rt;
    setState('connecting'); startB.hidden = true;
    noteEl.textContent = 'אם הדפדפן שואל, אשרו גישה למיקרופון.';
    rt.cb = {
      /* only touch the DOM on a real change: audio deltas arrive ~25×/s and each setState restyles the sheet */
      mode: function(m){ if(conv===rt && (state==='listening'||state==='speaking') && (m!==state || statusEl.textContent!==LABEL[m])) setState(m); },
      think: function(){ if(conv===rt && state==='listening') statusEl.textContent='חושבת'; },
      tool: function(name, a){
        if(name!=='open_whatsapp') return { ok:false, error:'unknown_tool' };
        var text = (a && a.message) || ''; showWa(text);
        try{ window.open(waLink(text), '_blank', 'noopener'); }catch(_){}
        return { ok:true, opened:true };
      },
      error: function(){ if(conv===rt){ setState('error'); noteEl.textContent='לא הצלחנו לחבר את אירה כרגע. אפשר לשלוח לדין בוואטסאפ.'; } },
      close: function(){ if(conv===rt || conv===null) onEnded(); }
    };
    if(rt.ctx) rt.secret();          /* edge function + Eleven mint run while the mic prompt is open */
    rt.mic().then(function(){ return rt.connect(); })
    .then(function(){
      if(conv!==rt || !opened){ rt.endSession(); return; }
      noteEl.textContent = 'דברו בחופשיות. אפשר לסיים בכל רגע.'; setState('listening', 'אירה מתחילה');
    })
    .catch(function(err){ if(conv!==rt) return; rt.cb.close=null; rt.endSession(); failMsg(err); });
  }
  function start(){ return RT ? startRealtime() : startAgent(); }
  function end(){ var c=conv; conv=null; if(c){ try{ c.endSession(); }catch(_){} } if(state!=='error') setState('ended'); }
  startB.addEventListener('click', start);
  endB.addEventListener('click', function(){ end(); startB.focus({preventScroll:true}); });
  muteB.addEventListener('click', function(){
    if(!conv) return; muted=!muted;
    try{ conv.setMicMuted(muted); }catch(_){}
    muteB.setAttribute('aria-pressed', String(muted)); muteT.textContent = muted ? 'מושתק' : 'השתקה';
  });

  /* ---------- face (canvas): Ira as scanlines of light. rAF only while the sheet is open and the tab is visible ---------- */
  var W=560, DPR=1, hasSim=false, lastDraw=0, coarse=matchMedia('(pointer:coarse)').matches;
  function sizeCanvas(){ DPR=Math.min(2, window.devicePixelRatio||1); var css = canvas.getBoundingClientRect().width || 300; W=Math.round(css*DPR); canvas.width=W; canvas.height=W; drawStatic(); }
  function level(s){
    if(!conv){   /* no live session (preview / QA): a believable voice envelope so every state still reads */
      if(s!=='listening' && s!=='speaking') return 0;
      var k=performance.now()/1000; return Math.max(0, (s==='speaking'?0.55:0.35) * (0.55+0.45*Math.sin(k*7.3)*Math.sin(k*2.1+1)) );
    }
    try{ return s==='speaking' ? conv.getOutputVolume() : (muted ? 0 : conv.getInputVolume()); }catch(_){ return 0; }
  }
  function mode(){ return root.getAttribute('data-state') || state; }
  function drawFace(t, v){ var m=mode(); ctx.clearRect(0,0,W,W); if(window.IraFace) IraFace.render(ctx, W, t, v, m, {dense: W/DPR > 300, lite: coarse && (m==='listening'||m==='speaking')}); }
  function drawStatic(){ if(!raf) drawFace(2.2, 0); }
  function loop(){
    if(raf || !opened) return; if(reduce && !(state==='listening'||state==='speaking')){ drawStatic(); return; }
    t0 = t0 || performance.now();
    var tick=function(now){
      if(!opened || document.hidden){ raf=0; return; }
      var s = mode(), live = s==='listening'||s==='speaking';
      if(reduce && !live){ raf=0; drawStatic(); return; }
      var target = s==='connecting' ? 0.15 : live ? Math.min(1, level(s)*1.6) : 0;
      lvl += (target-lvl) * (target>lvl ? 0.35 : 0.12);   /* fast attack, slow release */
      root.style.setProperty('--lvl', lvl.toFixed(3));   /* viewport edge glow follows her */
      if(!live || now-lastDraw>=32){ lastDraw=now; drawFace(reduce ? 2.2 : (now-t0)/1000, lvl); }   /* ~30 fps while a call is live: audio comes first */
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  function stopLoop(){ if(raf){ cancelAnimationFrame(raf); raf=0; } }
  if(window.IraFace) IraFace.ready(function(){ if(opened){ drawStatic(); loop(); } });
  addEventListener('resize', function(){ if(opened) sizeCanvas(); }, {passive:true});
  document.addEventListener('visibilitychange', function(){ if(document.hidden) stopLoop(); else if(opened) loop(); });

  /* ---------- drag the phone sheet down to close ---------- */
  var grab = root.querySelector('.ira__grab'), head = root.querySelector('.ira__head'), dy0=null, dy=0, dT=0;
  function dStart(e){ if(innerWidth>899 || e.target.closest('button')) return; dy0=e.clientY; dy=0; dT=performance.now(); sheet.classList.add('is-drag'); try{ e.target.setPointerCapture(e.pointerId); }catch(_){} }
  function dMove(e){ if(dy0===null) return; dy=Math.max(0, e.clientY-dy0); sheet.style.transform = dy ? 'translateY('+dy+'px)' : ''; }
  function dEnd(){ if(dy0===null) return; var fast = dy/(performance.now()-dT) > 0.6; dy0=null; sheet.classList.remove('is-drag'); sheet.style.transform=''; if(dy>120 || (fast && dy>40)) close(); }
  [grab, head].forEach(function(el){ if(!el) return; el.addEventListener('pointerdown', dStart); el.addEventListener('pointermove', dMove); el.addEventListener('pointerup', dEnd); el.addEventListener('pointercancel', dEnd); });

  window.__iraOpened = function(){ return opened; };
})();

/* ---------- #ira-sec: the reveal. The orb assembles from particles as the section scrolls in; lines lean toward the cursor, a tap sends a ripple ---------- */
(function(){
  'use strict';
  var cv = document.getElementById('irafOrb'); if(!cv || !window.IraFace) return;
  var ctx = cv.getContext('2d'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sec = document.getElementById('ira-sec') || cv;
  var W=600, DPR=1, raf=0, vis=false, t0=performance.now(), tx=0, ty=0, px=0, py=0, en=0, asm=reduce?1:0, asmT=asm;
  var ptr={x:-1e4,y:-1e4,s:0}, ptrT=0, tap=null, fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  function size(){ DPR=Math.min(2, devicePixelRatio||1); var css=cv.getBoundingClientRect().width||320; W=Math.round(css*DPR*(innerWidth<600?0.85:1)); cv.width=W; cv.height=W; frame(performance.now()); }
  function progress(){ var r=sec.getBoundingClientRect(), h=innerHeight; return Math.max(0, Math.min(1, (h - r.top)/(h*0.75))); }
  function frame(now){
    ctx.clearRect(0,0,W,W);
    var t = reduce ? 2.2 : (now-t0)/1000;
    if(tap){ tap.age=(now-tap.t)/1000; if(tap.age>1.6) tap=null; }
    IraFace.render(ctx, W, t, 0, 'idle', {px:px, py:py, energy:Math.min(1,en), dense: W/DPR>300, calm: reduce, assemble: asm, ptr: ptr.s>0.01 ? ptr : null, tap: tap});
  }
  function tick(now){
    raf=0;
    if(!vis || document.hidden || (window.__iraOpened && window.__iraOpened())) return;
    px += (tx-px)*0.06; py += (ty-py)*0.06; en *= 0.95;
    asmT = Math.max(asmT, progress()); asm += (asmT-asm)*0.06;   /* only builds up, never falls apart again */
    ptr.s += (ptrT-ptr.s)*0.1;
    frame(now); raf=requestAnimationFrame(tick);
  }
  function run(){ if(!raf && !reduce) raf=requestAnimationFrame(tick); }
  function local(e){ var r=cv.getBoundingClientRect(), k=W/r.width; return {x:(e.clientX-r.left)*k, y:(e.clientY-r.top)*k, r:r}; }
  function aim(x,y){ var r=cv.getBoundingClientRect(); tx=Math.max(-1,Math.min(1,(x-(r.left+r.width/2))/(r.width*0.9))); ty=Math.max(-1,Math.min(1,(y-(r.top+r.height/2))/(r.height*0.9))); }
  addEventListener('pointermove', function(e){
    if(!vis || e.pointerType==='touch') return; aim(e.clientX,e.clientY);
    if(fine){ var p=local(e); ptr.x=p.x; ptr.y=p.y; var inside = e.clientX>p.r.left-40 && e.clientX<p.r.right+40 && e.clientY>p.r.top-40 && e.clientY<p.r.bottom+40; ptrT = inside ? 1 : 0; }
    en=Math.min(1,en+0.02); run();
  }, {passive:true});
  sec.addEventListener('pointerdown', function(e){ var p=local(e); tap={x:p.x,y:p.y,t:performance.now(),age:0}; en=Math.min(1,en+0.4); run(); }, {passive:true});
  addEventListener('scroll', function(){ if(vis) run(); }, {passive:true});
  addEventListener('resize', function(){ if(vis) size(); }, {passive:true});
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) run(); });
  document.addEventListener('click', function(e){ if(e.target.closest('[data-ira-close]')) setTimeout(run, 350); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') setTimeout(run, 350); });
  size();
  if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ vis = es[0].isIntersecting; if(vis){ size(); run(); } }, {rootMargin:'120px'}).observe(cv); }
  else { vis=true; asm=asmT=1; run(); }
  window.__irafSet = function(a){ asm=asmT=a; frame(performance.now()); };   /* QA hook */
})();

/* ---------- small orbs (hero button, floating pill, about button): the same light signature, 30 fps, only while on screen ---------- */
(function(){
  'use strict';
  if(!window.IraFace) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = [].slice.call(document.querySelectorAll('canvas[data-ira-mini]')).map(function(cv){ return {cv:cv, ctx:cv.getContext('2d'), vis:false, en:0, host:cv.closest('button,a')}; });
  if(!items.length) return;
  var raf=0, last=0, t0=performance.now();
  function size(it){ var css=it.cv.getBoundingClientRect().width||28; var w=Math.round(css*Math.min(2,devicePixelRatio||1)); if(w>0 && it.cv.width!==w){ it.cv.width=w; it.cv.height=w; } }
  function draw(it, t){ var w=it.cv.width; it.ctx.clearRect(0,0,w,w); IraFace.render(it.ctx, w, t, 0, 'idle', {mini:true, energy:it.en, calm:reduce}); }
  function tick(now){
    raf=0;
    if(document.hidden || (window.__iraOpened && window.__iraOpened())) return;
    var any=false;
    if(now-last>=32){ last=now; var t=(now-t0)/1000; items.forEach(function(it){ if(!it.vis) return; any=true; it.en += ((it.hot?1:0)-it.en)*0.12; draw(it, t); }); }
    else any = items.some(function(it){ return it.vis; });
    if(any) raf=requestAnimationFrame(tick);
  }
  function run(){ if(reduce){ items.forEach(function(it){ size(it); draw(it, 2.2); }); return; } if(!raf) raf=requestAnimationFrame(tick); }
  items.forEach(function(it){
    size(it);
    if(it.host){ it.host.addEventListener('pointerenter', function(){ it.hot=true; }); it.host.addEventListener('pointerleave', function(){ it.hot=false; }); it.host.addEventListener('focus', function(){ it.hot=true; }); it.host.addEventListener('blur', function(){ it.hot=false; }); }
  });
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ var it=items.filter(function(x){ return x.cv===e.target; })[0]; if(it){ it.vis=e.isIntersecting; if(it.vis) size(it); } }); run(); });
    items.forEach(function(it){ io.observe(it.cv); });
  } else { items.forEach(function(it){ it.vis=true; }); run(); }
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) run(); });
  document.addEventListener('click', function(e){ if(e.target.closest('[data-ira-close]')) setTimeout(run, 350); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') setTimeout(run, 350); });
  addEventListener('resize', function(){ items.forEach(size); }, {passive:true});
  draw(items[0], 2.2); run();
  /* restraint: the floating pill steps aside while Ira's own stage is on screen */
  var stage=document.getElementById('ira-sec');
  if(stage && 'IntersectionObserver' in window) new IntersectionObserver(function(es){ document.documentElement.classList.toggle('ira-stage-on', es[0].isIntersecting); }, {threshold:0.25}).observe(stage);
})();

/* ---------- opening is a moment: the orb grows from the exact spot that was tapped into the dialog ---------- */
(function(){
  'use strict';
  var root=document.getElementById('ira'); if(!root || !root.animate) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var wrap=root.querySelector('.ira__orbwrap'), from=null, clearT=0;
  document.addEventListener('click', function(e){
    var el=e.target.closest('[data-ira-open]'); if(!el || !root.hidden) return;
    var src=el.querySelector('canvas') || el, r=src.getBoundingClientRect(); if(!r.width) return;
    var mini=src.hasAttribute && src.hasAttribute('data-ira-mini');
    from={x:r.left+r.width/2, y:r.top+r.height/2, d:r.width*(mini?0.76:0.6)};
    clearTimeout(clearT); root.classList.add('is-flip');
  }, true);
  new MutationObserver(function(){
    if(root.classList.contains('is-open')){
      if(!from) return; var f=from; from=null;
      var r=wrap.getBoundingClientRect(), d=r.width*0.6, s=Math.max(0.05, f.d/d);
      var dx=f.x-(r.left+r.width/2), dy=f.y-(r.top+r.height/2);
      wrap.animate([{transform:'translate('+dx+'px,'+dy+'px) scale('+s+')', filter:'brightness(2.2)'},{transform:'none', filter:'brightness(1)'}], {duration:760, easing:'cubic-bezier(.2,.9,.25,1)'});
      clearT=setTimeout(function(){ root.classList.remove('is-flip'); }, 760);
    } else { from=null; clearTimeout(clearT); clearT=setTimeout(function(){ root.classList.remove('is-flip'); }, 320); }
  }).observe(root, {attributes:true, attributeFilter:['class']});
})();
