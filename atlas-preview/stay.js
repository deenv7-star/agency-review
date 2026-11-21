const voiceSteps = [
 ['״תוסיף הזמנה ליוסי לסוף השבוע״','באפליקציה מדברים בעברית, כמו שמבקשים ממישהו לידכם.','say','הראו לי את ההזמנה ←'],
 ['הכול נכון לפני ששומרים?','הזית, חמישי עד שבת, 3,500 ₪. כאן בודקים את הפרטים ש־atlas הכין.','card','אישור ההזמנה לדוגמה ←'],
 ['יוסי מופיע בלוח.','זה המסך שרואים אחרי האישור. אפשר להמשיך לאורח הבא.','saved','להתחלה ↻']
];
const screens=[['today','כניסות, יציאות וניקיונות'],['cal','היומן מכל הערוצים'],['next','הודעה שמחכה לשליחה'],['money','מקדמות ויתרות']];
const get=id=>document.getElementById(id);
const motion=matchMedia('(prefers-reduced-motion:no-preference)');
function swap(img,url,alt){
 img.src=url;img.alt=alt;
 if(motion.matches && img.animate) img.animate([{opacity:.55,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:300});
}
function selection(attr,index){
 document.querySelectorAll('['+attr+']').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.getAttribute(attr))===index)));
}
let step=0;
function showStep(index){
 step=index;
 const [title,copy,image,action]=voiceSteps[index];
 selection('data-step',index);get('voice-title').textContent=title;get('voice-copy').textContent=copy;get('advance').textContent=action;
 swap(get('voice-img'),'https://atlas-il.com/landing-voice/vs-'+image+'-600.webp',title);
}
document.querySelectorAll('[data-step]').forEach(el=>el.onclick=()=>showStep(Number(el.dataset.step)));
get('advance').onclick=()=>showStep((step+1)%voiceSteps.length);
document.querySelectorAll('[data-topic]').forEach(el=>el.onclick=()=>{
 const index=Number(el.dataset.topic),[asset,title]=screens[index];
 selection('data-topic',index);get('caption').textContent=title+' · נתוני דוגמה';
 swap(get('day-img'),'https://atlas-il.com/landing-v8/ui/y3-'+asset+'.webp',title);
});
const plans={starter:['מתחיל',399,319,3828],pro:['מקצועי',699,559,6708],business:['עסקי',999,799,9588]};
function quote(){
 const key=document.querySelector('[name=size]:checked').value;
 const yearly=document.querySelector('[name=period]:checked').value==='annual';
 const [title,monthly,discount,annual]=plans[key];
 get('plan-name').textContent='חבילת '+title;
 get('amount').textContent=(yearly?discount:monthly)+' ₪';
 get('billing').textContent=yearly?'בחיוב שנתי אחד של '+annual.toLocaleString('he-IL')+' ₪ מראש':'בחיוב חודשי';
 get('trial').href='https://atlas-il.com/register?plan='+key;
}
document.querySelectorAll('.quote input').forEach(input=>input.addEventListener('change',quote));quote();
let queued=false;
function draw(){
 queued=false;
 const length=document.documentElement.scrollHeight-innerHeight;
 document.documentElement.style.setProperty('--read',length>0?Math.min(1,Math.max(0,scrollY/length)):0);
 document.documentElement.style.setProperty('--pan',(motion.matches?Math.min(2,Math.max(0,scrollY/200)):0)+'%');
}
function refresh(){if(!queued){queued=true;requestAnimationFrame(draw)}}
addEventListener('scroll',refresh,{passive:true});addEventListener('resize',refresh);motion.addEventListener('change',refresh);draw();
