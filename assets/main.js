// TINO — shared behavior
const bg = document.getElementById('bg'), nl = document.getElementById('nl');
if (bg && nl) {
  const setMenu = open => {
    nl.classList.toggle('show', open);
    document.body.classList.toggle('nav-open', open);
    bg.setAttribute('aria-expanded', open);
    bg.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  bg.setAttribute('aria-expanded', 'false');
  bg.addEventListener('click', () => setMenu(!nl.classList.contains('show')));
  nl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
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


/* ===== medição de conversão (GA4) ===== */
(function () {
  const ga = (nome, dados) => {
    if (typeof gtag === 'function') gtag('event', nome, dados || {});
  };

  // clique em qualquer CTA de WhatsApp — é o lead de verdade
  document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
    a.addEventListener('click', () => {
      const ondeEstou = document.body.dataset.pagina || location.pathname;
      ga('generate_lead', {
        method: 'whatsapp',
        link_text: (a.innerText || '').trim().slice(0, 60),
        page_location: ondeEstou
      });
    });
  });

  // envio do formulário de contato
  const form = document.getElementById('cform');
  if (form) form.addEventListener('submit', () => ga('generate_lead', { method: 'formulario' }));

  // interesse em preço: chegou até o bloco de planos ou de certificações
  const alvos = [
    ['planos', 'view_pricing'],
    ['certificacoes', 'view_certificacoes']
  ];
  alvos.forEach(([id, evento]) => {
    const el = document.getElementById(id);
    if (!el || !('IntersectionObserver' in window)) return;
    // threshold 0: as seções de preço são mais altas que a tela do celular,
    // então exigir uma fração delas visível nunca dispararia
    const obs = new IntersectionObserver(entradas => {
      entradas.forEach(e => {
        if (e.isIntersecting) { ga(evento); obs.disconnect(); }
      });
    }, { threshold: 0, rootMargin: '-80px 0px -80px 0px' });
    obs.observe(el);
  });
})();
