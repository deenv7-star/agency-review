/* Ira (אירה): Deen's voice assistant.
   IRA_MODE 'realtime' = ElevenLabs Realtime Max (eleven_realtime_v1_max) through the dna-voice-session edge function (dna-crm).
   IRA_MODE 'agent'    = the older ElevenLabs Agents path (agent below), kept as a fallback: flip the constant to switch back.
   Nothing loads or connects until the first "התחילו שיחה". Nothing runs while the sheet is closed. */
var IRA_MODE = "realtime";
var IRA_SESSION_URL = "https://sqxvjsadnqnnoyfialtg.supabase.co/functions/v1/dna-voice-session";
var IRA_AGENT_ID = "agent_1501m74vfs8ye23rkz8bms17p41x";

/* ---------- IraFace: shared renderer (dialog + #ira-sec). A depth image of an original face, sampled into horizontal dotted scanlines ---------- */
(function(){
  'use strict';
  var HW=192, HH=240, H=null, waits=[];
  var base = (document.currentScript && document.currentScript.src) || location.href;
  var img = new Image();
  img.onload = function(){
    var c=document.createElement('canvas'); c.width=HW; c.height=HH; var x=c.getContext('2d');
    x.drawImage(img,0,0,HW,HH); var d=x.getImageData(0,0,HW,HH).data; H=new Float32Array(HW*HH);
    for(var i=0;i<HW*HH;i++) H[i]=d[i*4]/255;
    waits.splice(0).forEach(function(f){ try{ f(); }catch(_){} });
  };
  img.src = new URL('../img/ira-face.png', base).href;
  function hs(u,v){
    if(u<0||u>1||v<0||v>1) return 0;
    var x=u*(HW-1), y=v*(HH-1), x0=x|0, y0=y|0, x1=Math.min(HW-1,x0+1), y1=Math.min(HH-1,y0+1), fx=x-x0, fy=y-y0;
    var a=H[y0*HW+x0], b=H[y0*HW+x1], c=H[y1*HW+x0], d=H[y1*HW+x1];
    return (a*(1-fx)+b*fx)*(1-fy) + (c*(1-fx)+d*fx)*fy;
  }
  function hash(a,b){ var n=Math.sin(a*127.1+b*311.7)*43758.5453; return n-Math.floor(n); }
  /* 7 brightness buckets, electric blue → ice → white. One fill per bucket keeps it to a handful of draw calls */
  var COLS=['rgba(30,78,220,.5)','rgba(45,110,255,.66)','rgba(59,139,255,.8)','rgba(84,162,255,.9)','rgba(125,192,255,.95)','rgba(175,222,255,1)','rgba(236,248,255,1)'];
  var NB=COLS.length, paths=[];
  function render(ctx, W, t, v, mode, o){
    if(!H) return;
    o=o||{};
    var dense=o.dense!==false, rows = dense ? 118 : 96, cols = dense ? 112 : 92;
    var S=W*0.98, FW=S*0.8, ox=(W-FW)/2, oy=W*0.03;
    var px=o.px||0, py=o.py||0, energy=o.energy||0;
    var speak = mode==='speaking', listen = mode==='listening', conn = mode==='connecting', done = mode==='ended'||mode==='error';
    var vin = listen ? v : energy, vout = speak ? v : 0;
    var lift = S*(done ? 0.01 : 0.018);
    var breathe = 1 + Math.sin(t*0.9)*0.006;
    var dot = Math.max(1, W*(dense ? 0.0030 : 0.0036));
    var glitch = !done && !o.calm && (Math.sin(t*0.73)+Math.sin(t*1.31+2)) > 1.86;   /* brief and rare */
    var gRow = glitch ? (hash(Math.floor(t*9),3)*rows)|0 : -99;
    var scan = conn ? ((t*0.55)%1.2)-0.1 : -9;
    var gain = done ? 0.5 : speak ? 1.18 : listen ? 1.06 : 1;
    for(var b=0;b<NB;b++) paths[b]=[];
    for(var r=0;r<rows;r++){
      var vv=r/(rows-1);
      var shift = (Math.abs(r-gRow)<2) ? (hash(r,Math.floor(t*12))-0.5)*S*0.06 : 0;
      for(var c=0;c<cols;c++){
        var u=c/(cols-1);
        var su = 0.5+(u-0.5)/breathe - px*0.02, sv = 0.5+(vv-0.5)/breathe - py*0.015;
        var h = hs(su, sv);
        var falling = 0;
        if(vv>0.84 && h>0.02){   /* neck and shoulders dissolve into drifting particles */
          var k=hash(r,c), cut=(vv-0.84)*5.5;
          if(k<cut){ falling = ((t*0.12 + k*7) % 1); if(o.calm) falling=k*0.5; }
        }
        if(h<0.035 && !falling) continue;
        var x = ox + u*FW + shift + px*S*0.035*h;
        var y = oy + vv*S*0.92;
        var dy = -h*lift;
        dy += Math.sin(u*7 + t*1.3 + r*0.33) * S*0.0035*(0.3+h) * (done?0.4:1);
        if(vin>0.01) dy += Math.sin(u*16 - t*7 + vv*3) * vin*S*0.012*h + Math.sin(vv*20 + t*5)*vin*S*0.004;
        if(vout>0.01){
          var mu=u-0.5, mv=vv-0.668, m=Math.exp(-(mu*mu/0.012 + mv*mv/0.0022));
          dy += m*vout*S*0.022*(mv>0?1:-0.45);
          var dist=Math.sqrt(mu*mu+mv*mv*1.6);
          dy += Math.sin(dist*46 - t*11) * vout*S*0.008*Math.exp(-dist*2.6)*(0.3+h);
        }
        if(scan>-1){ var sd=Math.abs(vv-scan); if(sd<0.08) dy -= (0.08-sd)*S*0.12*h; }
        var br = h*gain;
        if(scan>-1) br *= 0.55 + Math.max(0,1-Math.abs(vv-scan)*8)*0.9;
        if(falling){ y += falling*S*0.16; br = Math.max(br,0.35)*(1-falling); }
        if(br<0.1) continue;
        var bi = Math.min(NB-1, (Math.pow(br,1.45)*NB)|0);
        paths[bi].push(x, y+dy, dot*(0.35+h*0.95));
      }
    }
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    if(glitch){   /* RGB split on the glitch frame */
      ctx.fillStyle='rgba(255,40,90,.28)'; fillAll(ctx, paths, S*0.006, NB-3);
      ctx.fillStyle='rgba(40,255,200,.22)'; fillAll(ctx, paths, -S*0.006, NB-3);
    }
    for(var bb=0;bb<NB;bb++){ var p=paths[bb]; if(!p.length) continue; ctx.fillStyle=COLS[bb]; ctx.beginPath(); for(var i=0;i<p.length;i+=3){ ctx.rect(p[i]-p[i+2]/2, p[i+1]-p[i+2]/2, p[i+2], p[i+2]); } ctx.fill(); }
    ctx.restore();
  }
  function fillAll(ctx, paths, off, from){ ctx.beginPath(); for(var b=from;b<paths.length;b++){ var p=paths[b]; for(var i=0;i<p.length;i+=6){ ctx.rect(p[i]+off-p[i+2]/2, p[i+1]-p[i+2]/2, p[i+2], p[i+2]); } } ctx.fill(); }
  window.IraFace = { render: render, ready: function(f){ if(H) f(); else waits.push(f); } };
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
  var WORKLET = "class C extends AudioWorkletProcessor{constructor(){super();this.r=sampleRate/24000;this.p=0;this.o=new Int16Array(960);this.n=0;this.k=0;this.m=false;this.port.onmessage=e=>{if(e.data&&'muted' in e.data)this.m=!!e.data.muted}}process(i){const c=i[0]&&i[0][0];if(!c)return true;for(let j=0;j<c.length;j++){const a=Math.abs(c[j]);if(a>this.k)this.k=a}while(this.p<c.length){const j=Math.floor(this.p),f=this.p-j;const s=j+1<c.length?c[j]*(1-f)+c[j+1]*f:c[j];const v=this.m?0:Math.max(-1,Math.min(1,s));this.o[this.n++]=v<0?v*32768:v*32767;if(this.n===this.o.length){this.port.postMessage({pcm:this.o.buffer,level:this.m?0:Math.min(1,this.k*1.6)},[this.o.buffer]);this.o=new Int16Array(960);this.n=0;this.k=0}this.p+=this.r}this.p-=c.length;return true}}registerProcessor('ira-capture',C);";
  var BARGE_IN = 0.32;   /* mic peak above which the visitor is talking over Ira (echo gate below it while she speaks) */
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
    if(!AC) return;
    /* created inside the tap: iOS only starts audio from a user gesture */
    try{ this.ctx = new AC({sampleRate:24000}); }catch(_){ try{ this.ctx = new AC(); }catch(__){ this.ctx=null; } }
    if(this.ctx && this.ctx.state==='suspended') this.ctx.resume().catch(function(){});
  }
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
          var lv = e.data.level || 0; self.inLvl = self.inLvl*0.6 + lv*0.4;
          var gate = self.speaking() && lv < BARGE_IN;   /* the speaker leaks into the mic: send silence unless it's a real barge-in */
          self.send({ type:'input_audio_buffer.append', audio: b64(gate ? new Int16Array(e.data.pcm.byteLength/2).buffer : e.data.pcm) });
        };
        src.connect(self.node);
        self.out = self.ctx.createGain(); self.out.connect(self.ctx.destination);
        self.an = self.ctx.createAnalyser(); self.an.fftSize = 256; self.out.connect(self.an); self.buf = new Uint8Array(256);
      });
  };
  Realtime.prototype.connect = function(){
    var self=this;
    return fetch(IRA_SESSION_URL, { method:'POST', headers:{'content-type':'application/json'}, body:'{}' })
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ if(!r.ok || !j.client_secret) throw Object.assign(new Error('session'), {code: j.error || r.status}); return j; }); })
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
    var at=Math.max(this.ctx.currentTime+0.03, this.nextTime); s.start(at); this.nextTime=at+ab.duration;
    this.sources.push(s);
    s.onended=function(){ var k=self.sources.indexOf(s); if(k>=0) self.sources.splice(k,1); if(!self.sources.length && !self.active && self.cb.mode) self.cb.mode('listening'); };
  };
  Realtime.prototype.flush = function(){ this.sources.forEach(function(s){ try{ s.stop(); }catch(_){} }); this.sources=[]; this.nextTime=0; };
  Realtime.prototype.speaking = function(){ return this.sources.length>0; };
  Realtime.prototype.handle = function(ev){
    var self=this, cb=this.cb;
    switch(ev.type){
      case 'session.created': this.say(KICKOFF); break;   /* Ira speaks first (a bare response.create is ignored by Eleven) */
      case 'input_audio_buffer.speech_started': this.flush(); this.you=''; cb.mode && cb.mode('listening'); break;
      case 'conversation.item.input_audio_transcription.completed':
        if(ev.transcript){ this.you = clean(ev.transcript).trim(); this.ira=''; rtCaption(this.you, ''); } break;
      case 'response.created': this.active=true; this.ira=''; break;
      case 'response.output_audio.delta': case 'response.audio.delta':
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
    this.closed=true; this.flush();
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
      mode: function(m){ if(conv===rt && (state==='listening'||state==='speaking')) setState(m); },
      tool: function(name, a){
        if(name!=='open_whatsapp') return { ok:false, error:'unknown_tool' };
        var text = (a && a.message) || ''; showWa(text);
        try{ window.open(waLink(text), '_blank', 'noopener'); }catch(_){}
        return { ok:true, opened:true };
      },
      error: function(){ if(conv===rt){ setState('error'); noteEl.textContent='לא הצלחנו לחבר את אירה כרגע. אפשר לשלוח לדין בוואטסאפ.'; } },
      close: function(){ if(conv===rt || conv===null) onEnded(); }
    };
    rt.mic().then(function(){ return rt.connect(); })
    .then(function(){
      if(conv!==rt || !opened){ rt.endSession(); return; }
      noteEl.textContent = 'דברו בחופשיות. אפשר לסיים בכל רגע.'; setState('listening');
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
  var W=560, DPR=1, hasSim=false;
  function sizeCanvas(){ DPR=Math.min(2, window.devicePixelRatio||1); var css = canvas.getBoundingClientRect().width || 300; W=Math.round(css*DPR); canvas.width=W; canvas.height=W; drawStatic(); }
  function level(s){
    if(!conv){   /* no live session (preview / QA): a believable voice envelope so every state still reads */
      if(s!=='listening' && s!=='speaking') return 0;
      var k=performance.now()/1000; return Math.max(0, (s==='speaking'?0.55:0.35) * (0.55+0.45*Math.sin(k*7.3)*Math.sin(k*2.1+1)) );
    }
    try{ return s==='speaking' ? conv.getOutputVolume() : (muted ? 0 : conv.getInputVolume()); }catch(_){ return 0; }
  }
  function mode(){ return root.getAttribute('data-state') || state; }
  function drawFace(t, v){ ctx.clearRect(0,0,W,W); if(window.IraFace) IraFace.render(ctx, W, t, v, mode(), {dense: W/DPR > 300}); }
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
      drawFace(reduce ? 2.2 : (now-t0)/1000, lvl);
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

/* ---------- #ira-sec: the same face, ambient. Follows the pointer, wakes up on scroll and touch ---------- */
(function(){
  'use strict';
  var cv = document.getElementById('irafOrb'); if(!cv || !window.IraFace) return;
  var ctx = cv.getContext('2d'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W=600, DPR=1, raf=0, vis=false, t0=performance.now(), tx=0, ty=0, px=0, py=0, en=0, lastY=scrollY;
  function size(){ DPR=Math.min(2, devicePixelRatio||1); var css=cv.getBoundingClientRect().width||320; W=Math.round(css*DPR); cv.width=W; cv.height=W; frame(performance.now()); }
  function frame(now){
    ctx.clearRect(0,0,W,W);
    IraFace.render(ctx, W, reduce ? 2.2 : (now-t0)/1000, 0, 'idle', {px:px, py:py, energy:Math.min(1,en), dense: W/DPR>300, calm: reduce});
  }
  function tick(now){
    raf=0;
    if(!vis || document.hidden || (window.__iraOpened && window.__iraOpened())) return;
    px += (tx-px)*0.08; py += (ty-py)*0.08; en *= 0.94;
    frame(now); raf=requestAnimationFrame(tick);
  }
  function run(){ if(!raf && !reduce) raf=requestAnimationFrame(tick); }
  function aim(x,y){ var r=cv.getBoundingClientRect(); tx=Math.max(-1,Math.min(1,(x-(r.left+r.width/2))/(r.width*0.8))); ty=Math.max(-1,Math.min(1,(y-(r.top+r.height/2))/(r.height*0.8))); }
  addEventListener('pointermove', function(e){ if(!vis) return; aim(e.clientX,e.clientY); en=Math.min(1,en+0.04); run(); }, {passive:true});
  addEventListener('pointerdown', function(e){ if(!vis) return; aim(e.clientX,e.clientY); en=Math.min(1,en+0.5); run(); }, {passive:true});
  addEventListener('scroll', function(){ var d=Math.abs(scrollY-lastY); lastY=scrollY; if(!vis) return; en=Math.min(1,en+d*0.006); ty=Math.max(-1,Math.min(1,(scrollY%400)/400-0.5)); run(); }, {passive:true});
  addEventListener('resize', function(){ if(vis) size(); }, {passive:true});
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) run(); });
  document.addEventListener('click', function(e){ if(e.target.closest('[data-ira-close]')) setTimeout(run, 350); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') setTimeout(run, 350); });
  IraFace.ready(function(){
    size();
    if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ vis = es[0].isIntersecting; if(vis){ size(); run(); } }, {rootMargin:'120px'}).observe(cv); }
    else { vis=true; run(); }
  });
})();
