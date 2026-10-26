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

// abas de serviços — só ligam se o JS rodar; sem JS a página continua rolando inteira
document.querySelectorAll('.svwrap').forEach(w => {
  const tabs = [...w.querySelectorAll('.svtab')];
  const pans = [...w.querySelectorAll('.svpanel')];
  if (!tabs.length || !pans.length) return;
  w.classList.add('js');

  const abrir = (i, focar) => {
    tabs.forEach((t, n) => {
      t.classList.toggle('active', n === i);
      t.setAttribute('aria-selected', n === i);
      t.tabIndex = n === i ? 0 : -1;
    });
    pans.forEach((p, n) => p.classList.toggle('active', n === i));
    // o painel estava escondido: o IntersectionObserver nunca revelaria o conteúdo
    pans[i].querySelectorAll('.r').forEach(el => el.classList.add('in'));
    if (focar) tabs[i].focus();
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => {
      abrir(i);
      history.replaceState(null, '', '#' + pans[i].id);
    });
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      abrir((i + d + tabs.length) % tabs.length, true);
    });
  });

  // link externo com âncora (ex.: servicos.html#ferramentas) abre a aba certa
  const alvo = pans.findIndex(p => '#' + p.id === location.hash);
  abrir(alvo > -1 ? alvo : 0);
  if (alvo > 0) w.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

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
  const msg = `Olá! Sou ${d.get('nome')}, ${d.get('cargo')} na ${d.get('empresa')}. `
            + `Isso acontece há: ${d.get('tempo')}. `
            + `${d.get('mensagem') || 'Quero agendar os 45 minutos.'}`;
  window.open('https://wa.me/15126216866?text=' + encodeURIComponent(msg), '_blank', 'noopener');
});


/* ===== medição de conversão (GA4) ===== */
(function () {
  // dispara no GA4 e no Pixel da Meta com um só chamado
  const META = { generate_lead: 'Lead', view_pricing: 'ViewContent', view_certificacoes: 'ViewContent' };
  const ga = (nome, dados) => {
    if (typeof gtag === 'function') gtag('event', nome, dados || {});
    if (typeof fbq === 'function' && META[nome]) {
      fbq('track', META[nome], Object.assign({ content_name: nome }, dados || {}));
    }
    // marca o momento na gravação do Clarity, para filtrar sessões por evento
    if (typeof clarity === 'function') clarity('event', nome);
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

  /* ===== onde o visitante parou ===== */

  // nome legível de cada seção: id, senão o primeiro título, senão a posição
  const secoes = Array.from(document.querySelectorAll('main section, body > section'));
  const nomeDa = (s, i) => {
    if (s.id) return s.id;
    const t = s.querySelector('h1, h2, h3');
    const txt = t ? t.innerText.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 40) : '';
    return txt || 'secao-' + (i + 1);
  };
  let ultimaSecao = secoes.length ? nomeDa(secoes[0], 0) : '';
  const vistas = new Set();
  // a seção que ocupa mais espaço na tela é a que a pessoa está lendo
  const medirSecao = () => {
    let i = -1, maior = 0;
    secoes.forEach((s, j) => {
      const r = s.getBoundingClientRect();
      const px = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
      if (px > maior) { maior = px; i = j; }
    });
    if (i < 0) return;
    ultimaSecao = nomeDa(secoes[i], i);
    if (vistas.has(i)) return;
    vistas.add(i);
    ga('section_view', { section_name: ultimaSecao, section_index: i + 1 });
  };

  // profundidade de rolagem em 25/50/75/90% (o GA4 sozinho só mede 90%)
  const marcos = [25, 50, 75, 90];
  let rolagemMax = 0;
  const medirRolagem = () => {
    medirSecao();
    const alto = document.documentElement.scrollHeight - innerHeight;
    if (alto <= 0) return;
    const pct = Math.round(scrollY / alto * 100);
    if (pct <= rolagemMax) return;
    marcos.filter(m => m > rolagemMax && m <= pct).forEach(m => ga('scroll_depth', { percent_scrolled: m }));
    rolagemMax = pct;
  };
  addEventListener('scroll', medirRolagem, { passive: true });
  medirSecao();

  // cliques em CTAs que não são WhatsApp (ver planos, serviços, diagnóstico...)
  document.querySelectorAll('a.btn:not([href*="wa.me"])').forEach(a => {
    a.addEventListener('click', () => ga('cta_click', {
      link_text: (a.innerText || '').trim().slice(0, 60),
      link_url: a.getAttribute('href')
    }));
  });

  // formulário: começou, em qual campo parou, e se abandonou
  let formIniciado = false, formEnviado = false, ultimoCampo = '';
  if (form) {
    form.addEventListener('focusin', ev => {
      const campo = ev.target.name;
      if (!campo) return;
      ultimoCampo = campo;
      if (!formIniciado) { formIniciado = true; ga('form_start', { form_id: form.id }); }
    });
    form.addEventListener('submit', () => { formEnviado = true; });
  }

  // ao sair da página: registra até onde chegou (dispara uma vez só)
  let saiu = false;
  const aoSair = () => {
    if (saiu) return;
    saiu = true;
    if (typeof gtag === 'function') {
      gtag('event', 'page_exit', {
        last_section: ultimaSecao,
        sections_viewed: vistas.size,
        max_scroll: Math.min(rolagemMax, 100),
        transport_type: 'beacon'
      });
      if (formIniciado && !formEnviado) {
        gtag('event', 'form_abandon', { form_id: form.id, last_field: ultimoCampo, transport_type: 'beacon' });
      }
    }
  };
  addEventListener('pagehide', aoSair);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') aoSair(); });
})();
