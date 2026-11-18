(() => {
  const entries = Array.from(document.querySelectorAll('.project-entry'));
  const plates = document.querySelectorAll('.stage-plate');
  if (entries.length) {
    let current = 0;
    let queued = false;
    const desktop = matchMedia('(min-width:801px)');
    function select(index) {
      if (index === current) return;
      plates[current].classList.remove('selected');
      plates[index].classList.add('selected');
      current = index;
    }
    function update() {
      queued = false;
      if (!desktop.matches) return;
      const line = innerHeight * .48;
      const next = entries.findIndex(item => item.getBoundingClientRect().bottom > line);
      select(next < 0 ? entries.length - 1 : next);
    }
    function schedule() {
      if (queued || !desktop.matches) return;
      queued = true;
      requestAnimationFrame(update);
    }
    entries.forEach((item, index) => {
      item.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') select(index); });
      item.addEventListener('focusin', () => select(index));
    });
    addEventListener('scroll', schedule, {passive:true});
    addEventListener('resize', schedule);
    update();
  }

  const choices = document.querySelector('.brief-options');
  if (choices) {
    const contact = document.querySelector('#contact a[href*="wa.me"]');
    const setMessage = () => {
      const topic = choices.querySelector('input:checked').value;
      const url = new URL(contact.href);
      url.searchParams.set('text', 'היי דין, ראיתי את העבודות שלך. אשמח לדבר על ' + topic + '.');
      contact.href = url.href;
    };
    choices.hidden = false;
    choices.addEventListener('change', setMessage);
    setMessage();
  }

  const figures = document.querySelectorAll('.case .cfig');
  if (!figures.length || typeof HTMLDialogElement === 'undefined') return;
  const viewer = document.createElement('dialog');
  viewer.className = 'screen-view';
  viewer.setAttribute('aria-labelledby','screen-heading');
  viewer.innerHTML = '<div class="screen-bar"><h2 id="screen-heading"></h2><button type="button">סגירה</button></div><img alt="">';
  document.body.append(viewer);
  const dismiss = viewer.querySelector('button');
  dismiss.addEventListener('click',() => viewer.close());
  figures.forEach(figure => {
    const frame = figure.querySelector('.cfig__img');
    const title = figure.querySelector('h3')?.textContent;
    const photo = frame?.querySelector('img');
    if (!photo || !title) return;
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'screen-open';
    open.textContent = 'הגדלת המסך';
    open.setAttribute('aria-label','הגדלת המסך — ' + title);
    open.setAttribute('aria-haspopup','dialog');
    frame.append(open);
    open.addEventListener('click',() => {
      viewer.querySelector('h2').textContent = title;
      const full = viewer.querySelector('img');
      full.src = photo.currentSrc || photo.src;
      full.alt = photo.alt;
      viewer.showModal();
      viewer.scrollTop = 0;
      dismiss.focus();
    });
  });
})();
