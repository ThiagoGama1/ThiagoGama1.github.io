/* =========================================================
   main.js — idioma, tema, animações e microinterações
   Sem dependências externas.
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- idioma ---------- */
  var dict = window.TG_I18N || { pt: {}, en: {} };

  function applyLang(lang) {
    var t = dict[lang] || dict.pt;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = t[el.getAttribute('data-i18n')];
      if (v != null) el.textContent = v;
    });

    // atributos traduzíveis: data-i18n-attr="aria-label:chave"
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':');
        var v = t[(p[1] || '').trim()];
        if (v != null) el.setAttribute(p[0].trim(), v);
      });
    });

    if (t['meta.title']) document.title = t['meta.title'];
    var desc = document.querySelector('meta[name="description"]');
    if (desc && t['meta.desc']) desc.setAttribute('content', t['meta.desc']);

    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang === 'pt' ? 'pt-BR' : 'en');
    localStorage.setItem('tg-lang', lang);

    document.querySelectorAll('[data-lang-set]').forEach(function (b) {
      var on = b.getAttribute('data-lang-set') === lang;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });

    renderCounters();
  }

  document.querySelectorAll('[data-lang-set]').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang-set')); });
  });

  /* ---------- tema ---------- */
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('tg-theme', next);
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', next === 'dark' ? '#0A0B0F' : '#F6F4EF');
    });
  }

  /* ---------- contadores ---------- */
  // O valor final já vem escrito no HTML (sem JS, crawlers, JS lento).
  // A contagem a partir de 0 é só um extra, e não roda com reduced-motion.
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

  function renderCounters() {
    counters.forEach(function (el) {
      if (el.dataset.anim !== '1') paint(el, +el.dataset.count);
    });
  }

  function paint(el, value) {
    var lang = root.getAttribute('data-lang') || 'pt';
    var suffix = el.dataset.suffix || '';
    // "6º" só faz sentido em português; em inglês vira "6th"
    if (suffix === 'º') suffix = lang === 'pt' ? 'º' : 'th';
    el.textContent = (el.dataset.prefix || '') + value.toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US') + suffix;
  }

  function runCounter(el) {
    var target = +el.dataset.count;
    el.dataset.done = '1';
    if (reduce) { paint(el, target); return; }

    var dur = 1200, t0 = null;
    el.dataset.anim = '1';
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      paint(el, Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
      else el.dataset.anim = '0';
    }
    requestAnimationFrame(step);
  }

  /* ---------- reveal ao rolar ---------- */
  var reveals = document.querySelectorAll('.reveal');
  reveals.forEach(function (el) {
    if (el.dataset.d) el.style.setProperty('--d', el.dataset.d);
  });

  // escalona os itens de cada grupo, criando cascata
  ['.tl__item', '.grid .card', '.stack__grp', '.edu .card', '.stat'].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) { el.style.setProperty('--i', i); });
  });

  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        e.target.querySelectorAll('[data-count]').forEach(function (c) {
          if (c.dataset.done !== '1') runCounter(c);
        });
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
    counters.forEach(function (el) { runCounter(el); });
  }

  /* ---------- barra de progresso + nav grudada ---------- */
  var bar = document.getElementById('progress');
  var nav = document.getElementById('nav');
  var ticking = false;

  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? window.scrollY / h : 0;
    if (bar) bar.style.transform = 'scaleX(' + p + ')';
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 8);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- link ativo na navegação ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var links = {};
  document.querySelectorAll('.nav__links a').forEach(function (a) {
    links[a.getAttribute('href').slice(1)] = a;
  });

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = links[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('is-active'); });
          a.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- menu mobile ---------- */
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- holofote nos cards ---------- */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- rodapé ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- inicialização ---------- */
  applyLang(root.getAttribute('data-lang') || 'pt');
})();
