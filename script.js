'use strict';
(() => {
  const $ = (selector) => document.querySelector(selector);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = $('#header');
  const progress = $('#progress');
  const menu = $('#menuToggle');
  const nav = $('#mainNav');
  const intro = $('#intro');
  const skip = $('#introSkip');
  let scrollPending = false;

  function updateScroll() {
    const y = window.scrollY;
    const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    header.classList.toggle('is-scrolled', y > 24);
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, y / available))})`;
    scrollPending = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  function closeMenu(returnFocus = false) {
    nav.classList.remove('is-open');
    menu.classList.remove('is-active');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Открыть меню');
    document.body.classList.remove('menu-open');
    if (returnFocus) menu.focus();
  }
  menu.addEventListener('click', () => {
    const willOpen = !nav.classList.contains('is-open');
    if (!willOpen) { closeMenu(); return; }
    nav.classList.add('is-open');
    menu.classList.add('is-active');
    menu.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-label', 'Закрыть меню');
    document.body.classList.add('menu-open');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu(nav.classList.contains('is-open'));
  });
  document.addEventListener('click', (event) => {
    if (nav.classList.contains('is-open') && !nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

  const reveal = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveal.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -35px 0px', threshold: .07 });
    reveal.forEach(el => io.observe(el));
  }

  function finishIntro() {
    if (!intro || intro.classList.contains('is-hidden')) return;
    intro.classList.add('is-hidden');
    window.setTimeout(() => { intro.hidden = true; }, reducedMotion ? 0 : 620);
    try { sessionStorage.setItem('kiss-intro-seen', '1'); } catch (_) { /* private browsing */ }
  }
  if (intro) {
    let seen = false;
    try { seen = sessionStorage.getItem('kiss-intro-seen') === '1'; } catch (_) { /* private browsing */ }
    if (reducedMotion || seen) { intro.hidden = true; }
    else {
      skip.addEventListener('click', finishIntro);
      window.setTimeout(finishIntro, 1550);
    }
  }
  $('#year').textContent = String(new Date().getFullYear());
})();