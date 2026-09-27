/* גוון GAVON - preview interactions (no real checkout) */
(function(){
  var PRODUCTS = {
    'foundation': {title:'מייקאפ משנה גוון', img:'images/bottle.webp', once:119, sub:95, was:159},
    'lipstain':   {title:'ליפ סטיין מתקלף',  img:'images/lipstain.webp', once:89,  sub:71, was:119},
    'bundle':     {title:'מארז הזוהר',        img:'images/bundle.webp', once:169, sub:135, was:238}
  };
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem('gavon_cart')||'[]'); } catch(e){ cart=[]; }

  function save(){ try{ localStorage.setItem('gavon_cart', JSON.stringify(cart)); }catch(e){} }
  function count(){ return cart.reduce(function(n,i){return n+i.qty;},0); }
  function total(){ return cart.reduce(function(n,i){return n+i.price*i.qty;},0); }

  function renderCart(){
    document.querySelectorAll('[data-cart-count]').forEach(function(el){ el.textContent = count(); });
    var box = document.querySelector('[data-cart-items]');
    var foot = document.querySelector('[data-cart-footer]');
    if(!box) return;
    if(!cart.length){
      box.innerHTML = '<div class="empty">הסל ריק כרגע.<br>המייקאפ שמשנה גוון מחכה לך.</div>';
      if(foot) foot.hidden = true;
      return;
    }
    box.innerHTML = cart.map(function(i,ix){
      var subline = i.mode==='sub' ? '<div class="sub">מנוי חודשי · חיוב מחדש כל חודש · ביטול בכל עת</div>' : '<div class="sub" style="color:var(--grey)">רכישה חד־פעמית</div>';
      return '<div class="citem">'
        + '<img src="'+i.img+'" alt="">'
        + '<div><div class="t">'+i.title+'</div>'+subline
        + '<div class="p">₪'+i.price+' × '+i.qty+'</div>'
        + '<button type="button" class="rm" data-rm="'+ix+'">הסרה</button></div></div>';
    }).join('');
    if(foot){
      foot.hidden = false;
      var t = foot.querySelector('[data-cart-total]');
      if(t) t.textContent = '₪'+total();
    }
  }

  function openCart(){
    var d = document.querySelector('[data-cart-drawer]');
    var o = document.querySelector('[data-cart-overlay]');
    if(d) d.classList.add('open');
    if(o) o.classList.add('open');
  }
  function closeCart(){
    var d = document.querySelector('[data-cart-drawer]');
    var o = document.querySelector('[data-cart-overlay]');
    if(d) d.classList.remove('open');
    if(o) o.classList.remove('open');
  }

  document.addEventListener('click', function(e){
    if(e.target.closest('[data-open-cart]')) openCart();
    if(e.target.closest('[data-close-cart]') || e.target.matches('[data-cart-overlay]')) closeCart();
    var rm = e.target.closest('[data-rm]');
    if(rm){ cart.splice(+rm.getAttribute('data-rm'),1); save(); renderCart(); }
  });

  /* product page: purchase option toggle */
  var mode = 'once';
  var priceBtn = document.querySelector('[data-btn-price]');
  document.querySelectorAll('[data-buyopt]').forEach(function(opt){
    opt.addEventListener('click', function(){
      document.querySelectorAll('[data-buyopt]').forEach(function(o){ o.classList.remove('on'); });
      opt.classList.add('on');
      mode = opt.getAttribute('data-buyopt');
      if(priceBtn) priceBtn.textContent = '₪' + PRODUCTS.foundation[mode] * qty();
    });
  });

  /* quantity */
  function qty(){
    var el = document.querySelector('[data-qty]');
    return el ? parseInt(el.textContent,10) : 1;
  }
  function setQty(n){
    n = Math.max(1, Math.min(9, n));
    var el = document.querySelector('[data-qty]');
    if(el) el.textContent = n;
    if(priceBtn) priceBtn.textContent = '₪' + PRODUCTS.foundation[mode] * n;
  }
  var minus = document.querySelector('[data-qty-minus]');
  var plus = document.querySelector('[data-qty-plus]');
  if(minus) minus.addEventListener('click', function(){ setQty(qty()-1); });
  if(plus)  plus.addEventListener('click', function(){ setQty(qty()+1); });

  /* add to cart */
  var add = document.querySelector('[data-add-cart]');
  if(add) add.addEventListener('click', function(){
    var p = PRODUCTS.foundation;
    var key = 'foundation-' + mode;
    var existing = cart.filter(function(i){return i.key===key;})[0];
    if(existing) existing.qty += qty();
    else cart.push({key:key, title:p.title + (mode==='sub'?' (מנוי)':''), img:p.img, price:p[mode], mode:mode, qty:qty()});
    save(); renderCart(); openCart();
  });

  /* gallery thumbs */
  document.querySelectorAll('[data-thumb]').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('[data-thumb]').forEach(function(b){ b.classList.remove('on'); });
      btn.classList.add('on');
      var main = document.querySelector('[data-gallery-main]');
      if(main) main.src = btn.getAttribute('data-thumb');
    });
  });

  renderCart();
})();
