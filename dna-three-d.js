(()=>{
  function sprite(src,canvas,cols,size){
    const sheet=new Image();sheet.src=src;
    const ctx=canvas.getContext('2d');
    function draw(n){if(!sheet.complete||!sheet.naturalWidth)return;ctx.clearRect(0,0,size,size);ctx.drawImage(sheet,(n%cols)*size,Math.floor(n/cols)*size,size,size,0,0,size,size)}
    sheet.onload=()=>draw(0);if(sheet.complete)draw(0);
    return draw;
  }
  const ex=document.querySelector('[data-dna-explode]');
  if(ex){
    const draw=sprite('dna-explode-sprite.webp',ex,9,75);
    let played=false;
    const observer=new IntersectionObserver(entries=>{
      if(!entries.some(e=>e.isIntersecting)||played)return;
      played=true;observer.disconnect();
      if(matchMedia('(prefers-reduced-motion: reduce)').matches){draw(71);return}
      const start=performance.now(),duration=1900;
      function frame(now){const progress=Math.min(1,(now-start)/duration);draw(Math.round(progress*71));if(progress<1)requestAnimationFrame(frame)}
      requestAnimationFrame(frame);
    },{threshold:.35});observer.observe(ex);
  }
  const stage=document.querySelector('.dna-three-d-turn'),turn=stage?.querySelector('[data-dna-turn]');
  if(!turn)return;
  const draw=sprite('dna-turn-sprite.webp',turn,10,75);let angle=0,down=null;
  const render=()=>draw(((Math.round(angle/360*60)%60)+60)%60);
  stage.addEventListener('pointerdown',e=>{down={x:e.clientX,angle};stage.setPointerCapture(e.pointerId)});
  stage.addEventListener('pointermove',e=>{if(!down)return;angle=down.angle+(e.clientX-down.x)/stage.clientWidth*360;render()});
  stage.addEventListener('pointerup',()=>down=null);stage.addEventListener('pointercancel',()=>down=null);
  stage.addEventListener('keydown',e=>{if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;e.preventDefault();angle+=e.key==='ArrowRight'?15:-15;render()});
})();
