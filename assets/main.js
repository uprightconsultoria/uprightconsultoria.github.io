// TINO — shared behavior
const bg = document.getElementById('bg'), nl = document.getElementById('nl');
if (bg && nl) {
  bg.addEventListener('click', () => {
    const open = nl.classList.toggle('show');
    bg.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  nl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nl.classList.remove('show')));
}

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// scroll reveals
if (reduce) {
  document.querySelectorAll('.r').forEach(el => el.classList.add('in'));
} else {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .13 });
  document.querySelectorAll('.r').forEach(el => io.observe(el));
}

// counters (data-c="120" data-s="+")
const seen = new WeakSet();
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting || seen.has(e.target)) return;
  seen.add(e.target);
  const el = e.target, end = +el.dataset.c, suf = el.dataset.s || '';
  if (reduce) { el.textContent = end + suf; return; }
  let t0 = null;
  const step = t => {
    if (!t0) t0 = t;
    const p = Math.min((t - t0) / 1200, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * end) + suf;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}), { threshold: .6 });
document.querySelectorAll('[data-c]').forEach(el => cio.observe(el));

// FAQ accordion
document.querySelectorAll('.fq').forEach(q => q.addEventListener('click', () => {
  const it = q.parentElement, fa = it.querySelector('.fa'), open = it.classList.contains('open');
  document.querySelectorAll('.fi.open').forEach(o => { o.classList.remove('open'); o.querySelector('.fa').style.maxHeight = null; });
  if (!open) { it.classList.add('open'); fa.style.maxHeight = fa.scrollHeight + 'px'; }
}));

// rotating proof card (hero)
const rot = document.querySelector('.proofrot');
if (rot) {
  const stats = [...rot.querySelectorAll('.pstat')];
  const dots = [...document.querySelectorAll('.pdots i')];
  let ri = 0;
  if (!reduce && stats.length > 1) {
    setInterval(() => {
      stats[ri].classList.remove('active');
      if (dots[ri]) dots[ri].classList.remove('on');
      ri = (ri + 1) % stats.length;
      stats[ri].classList.add('active');
      if (dots[ri]) dots[ri].classList.add('on');
    }, 3200);
  }
}

// contact form -> WhatsApp
const cf = document.getElementById('cform');
if (cf) cf.addEventListener('submit', ev => {
  ev.preventDefault();
  const d = new FormData(cf);
  const msg = `Olá! Sou ${d.get('nome')} (${d.get('empresa')}). ${d.get('mensagem') || 'Quero agendar uma reunião diagnóstica.'}`;
  window.open('https://wa.me/5571996921513?text=' + encodeURIComponent(msg), '_blank', 'noopener');
});
