/* Ira (אירה): Deen's voice assistant.
   IRA_MODE 'realtime' = ElevenLabs Realtime Max (eleven_realtime_v1_max) through the dna-voice-session edge function (dna-crm).
   IRA_MODE 'agent'    = the older ElevenLabs Agents path (agent below), kept as a fallback: flip the constant to switch back.
   Nothing loads or connects until the first "התחילו שיחה". Nothing runs while the sheet is closed. */
var IRA_MODE = "realtime";
var IRA_SESSION_URL = "https://sqxvjsadnqnnoyfialtg.supabase.co/functions/v1/dna-voice-session";
var IRA_AGENT_ID = "agent_1501m74vfs8ye23rkz8bms17p41x";

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
    if(live) loop(); else drawStatic();
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
  root.addEventListener('keydown', function(e){
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
  function showWa(text){
    waHot.href = waLink(text); waHot.hidden = false;   /* iOS may block the pop-up after an async tool call, so the button is always there */
  }

  /* ---------- captions ---------- */
  function caption(msg){
    if(!msg || !msg.message) return;
    var role = msg.role || msg.source;
    capEl.hidden = false;
    if(role==='user'){ capEl.dataset.you = msg.message; return; }
    var you = capEl.dataset.you; capEl.dataset.you = '';
    capEl.innerHTML = '';
    if(you){ var s=document.createElement('span'); s.className='you'; s.textContent='אתם: '+you; capEl.appendChild(s); }
    capEl.appendChild(document.createTextNode(msg.message));
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
    if(you){ var s=document.createElement('span'); s.className='you'; s.textContent='אתם: '+you; capEl.appendChild(s); }
    if(ira) capEl.appendChild(document.createTextNode(ira));
    capEl.scrollTop = capEl.scrollHeight;
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

  /* ---------- orb (canvas, rAF only while a call is live and the sheet is open) ---------- */
  var W=560, DPR=1;
  function sizeCanvas(){ DPR=Math.min(2, window.devicePixelRatio||1); var css = canvas.getBoundingClientRect().width || 280; W=Math.round(css*DPR); canvas.width=W; canvas.height=W; drawStatic(); }
  function level(){
    if(!conv) return 0;
    try{ return state==='speaking' ? conv.getOutputVolume() : (muted ? 0 : conv.getInputVolume()); }catch(_){ return 0; }
  }
  function draw(t, v){
    var c=W/2, R=W*0.3;
    ctx.clearRect(0,0,W,W);
    /* halo */
    var halo = ctx.createRadialGradient(c,c,R*0.6,c,c,R*1.65);
    halo.addColorStop(0,'rgba(143,208,228,'+(0.22+v*0.35)+')'); halo.addColorStop(1,'rgba(143,208,228,0)');
    ctx.fillStyle=halo; ctx.beginPath(); ctx.arc(c,c,R*1.65,0,Math.PI*2); ctx.fill();
    /* body: a soft blob whose edge moves with the voice */
    var amp = reduce ? 0 : R*(0.015 + v*0.12), n=96, sc = 1 + (reduce ? v*0.06 : v*0.08);
    ctx.save(); ctx.translate(c,c); ctx.scale(sc,sc);
    ctx.beginPath();
    for(var i=0;i<=n;i++){
      var a=i/n*Math.PI*2;
      var r=R + amp*(Math.sin(a*3+t*1.9)*0.55 + Math.sin(a*5-t*2.6)*0.3 + Math.sin(a*2+t*1.1)*0.4);
      var x=Math.cos(a)*r, y=Math.sin(a)*r; if(i) ctx.lineTo(x,y); else ctx.moveTo(x,y);
    }
    ctx.closePath();
    var g = ctx.createRadialGradient(-R*0.35,-R*0.45,R*0.05,0,0,R*1.15);
    g.addColorStop(0,'#FFFFFF'); g.addColorStop(0.18,'#D6EEF5'); g.addColorStop(0.52,'#8FD0E4'); g.addColorStop(0.82,'#2C6A80'); g.addColorStop(1,'#123543');
    ctx.fillStyle=g; ctx.fill();
    /* inner light that drifts */
    ctx.globalCompositeOperation='lighter';
    var ix=Math.cos(t*0.7)*R*0.28, iy=Math.sin(t*0.9)*R*0.22;
    var ig=ctx.createRadialGradient(ix,iy,0,ix,iy,R*0.75);
    ig.addColorStop(0,'rgba(255,255,255,'+(0.18+v*0.4)+')'); ig.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=ig; ctx.fill();
    ctx.globalCompositeOperation='source-over';
    /* rim */
    ctx.lineWidth=W*0.004; ctx.strokeStyle='rgba(228,245,250,.55)'; ctx.stroke();
    ctx.restore();
  }
  function drawStatic(){ if(!raf) draw(0.6, state==='soon'?0:0.04); }
  function loop(){
    if(raf || !opened) return; t0 = performance.now();
    var tick=function(now){
      if(!opened || !(state==='connecting'||state==='listening'||state==='speaking')){ raf=0; drawStatic(); return; }
      var target = state==='connecting' ? 0.08+0.06*Math.sin((now-t0)/260) : Math.min(1, level()*1.6);
      lvl += (target-lvl) * (target>lvl ? 0.35 : 0.12);   /* fast attack, slow release */
      draw((now-t0)/1000, lvl);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  function stopLoop(){ if(raf){ cancelAnimationFrame(raf); raf=0; } }
  addEventListener('resize', function(){ if(opened) sizeCanvas(); }, {passive:true});
  document.addEventListener('visibilitychange', function(){ if(document.hidden) stopLoop(); else if(opened) loop(); });
})();
