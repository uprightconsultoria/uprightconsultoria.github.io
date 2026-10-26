/* Consentimento de cookies — Upright
   Carregado no <head>, antes de qualquer medição.
   Google: Consent Mode v2, tudo negado por padrão.
   Meta Pixel e Microsoft Clarity: só são carregados depois do aceite. */
(function () {
  var GA = 'G-LG43W42N90';
  var PIXEL = '1358876479055288';
  var CLARITY = 'z3k67nat03';
  var CHAVE = 'upright_consent';
  var VALIDADE = 180 * 864e5; // 6 meses

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });
  gtag('js', new Date());
  gtag('config', GA);

  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
  document.head.appendChild(tag);

  function ler() {
    try {
      var v = JSON.parse(localStorage.getItem(CHAVE));
      if (!v || !v.data) return null;
      if (Date.now() - v.data > VALIDADE) return null;
      return v.estado;
    } catch (e) { return null; }
  }
  function gravar(estado) {
    try { localStorage.setItem(CHAVE, JSON.stringify({ estado: estado, data: Date.now() })); } catch (e) {}
  }

  var pixelPronto = false;
  function carregarPixel() {
    if (pixelPronto) return;
    pixelPronto = true;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL);
    fbq('track', 'PageView');
  }

  // Microsoft Clarity: gravação de sessão e mapa de calor, também só depois do aceite
  var clarityPronto = false;
  function carregarClarity() {
    if (clarityPronto) return;
    clarityPronto = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY);
    clarity('consent');
  }

  function carregarMedicao() {
    carregarPixel();
    carregarClarity();
  }

  if (ler() === 'granted') carregarMedicao();

  var banner = null;

  function fechar() {
    if (!banner) return;
    banner.classList.remove('on');
    setTimeout(function () { if (banner && banner.parentNode) banner.parentNode.removeChild(banner); banner = null; }, 400);
  }

  function aceitar() {
    gravar('granted');
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
    carregarMedicao();
    fechar();
  }

  function recusar() {
    gravar('denied');
    gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied'
    });
    fechar();
  }

  function mostrar() {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'ckb';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML =
      '<div class="ckb-txt">' +
        '<strong>A gente usa cookies.</strong> ' +
        'Os necessários fazem o site funcionar. Os de medição e publicidade (Google e Meta) só entram se você aceitar — ' +
        'eles nos mostram quais páginas funcionam e o resultado dos anúncios. ' +
        '<a href="privacidade.html">Ler a política de privacidade</a>' +
      '</div>' +
      '<div class="ckb-btns">' +
        '<button type="button" class="ckb-no">Recusar</button>' +
        '<button type="button" class="ckb-sim">Aceitar</button>' +
      '</div>';
    document.body.appendChild(banner);
    banner.querySelector('.ckb-sim').addEventListener('click', aceitar);
    banner.querySelector('.ckb-no').addEventListener('click', recusar);
    requestAnimationFrame(function () { requestAnimationFrame(function () { banner.classList.add('on'); }); });
  }

  window.uprightCookies = { abrir: mostrar, estado: ler };

  function iniciar() {
    if (ler() === null) mostrar();
    document.addEventListener('click', function (ev) {
      var alvo = ev.target.closest('[data-cookies]');
      if (alvo) { ev.preventDefault(); mostrar(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
