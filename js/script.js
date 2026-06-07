/* ============================================================
   ROCKSTAR PERFORMANCE REDESIGN — script.js
   All Phases: Loader + Navbar + Hero Carousel + Reveal +
               Game Cards + Video Modal
============================================================ */

'use strict';

/* ── Utility ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. LOADER
============================================================ */
const Loader = (() => {
  const loader = $('#loader');
  const bar    = $('#loaderBar');
  const status = $('#loaderStatus');

  const steps = [
    { pct: 15,  text: 'LOADING ASSETS...' },
    { pct: 35,  text: 'INITIALIZING ENGINE...' },
    { pct: 55,  text: 'RENDERING WORLD...' },
    { pct: 75,  text: 'ALMOST THERE...' },
    { pct: 95,  text: 'ENTERING GAME...' },
    { pct: 100, text: 'WELCOME BACK' },
  ];

  let stepIndex = 0;

  function runStep() {
    if (stepIndex >= steps.length) { finish(); return; }
    const step  = steps[stepIndex++];
    const delay = stepIndex === 1 ? 300 : 380 + Math.random() * 220;
    setTimeout(() => {
      if (bar)    bar.style.width    = step.pct + '%';
      if (status) status.textContent = step.text;
      runStep();
    }, delay);
  }

  function hideLoader() {
    if (!loader) return;
    const music = $('#loaderMusic');
    if (music) {
      music.pause();
      music.currentTime = 0;
    }
    loader.style.opacity = '0';
    loader.style.pointerEvents = 'none';
    setTimeout(() => { loader.style.display = 'none'; }, 400);
  }

  function finish() {
    setTimeout(() => {
      if (!loader) return;

      loader.classList.add('loader-exit');

      // Primary: CSS animationend
      loader.addEventListener('animationend', hideLoader, { once: true });

      // Fallback: always hide after 1.2s regardless
      setTimeout(hideLoader, 1200);

    }, 450);
  }

  function init() {
    if (!loader) return;
    const music = $('#loaderMusic');
    if (music) {
      music.volume = 0.5;
      music.play().catch(() => {});
    }
    runStep();
  }

  return { init };
})();


/* ============================================================
   2. NAVBAR
============================================================ */
const Navbar = (() => {
  const navbar     = $('#navbar');
  const hamburger  = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  let menuOpen   = false;
  let lastScroll = 0;

  function onScroll() {
    const y = window.scrollY;

    if (y > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    if (y > lastScroll && y > 120 && !menuOpen) {
      navbar.style.transform = 'translateY(-100%)';
    } else {
      navbar.style.transform = 'translateY(0)';
    }

    lastScroll = y;
  }

  function toggleMenu() {
    menuOpen = !menuOpen;
    hamburger.classList.toggle('open', menuOpen);
    mobileMenu.classList.toggle('hidden', !menuOpen);
  }

  function init() {
    if (!navbar || !hamburger || !mobileMenu) return;
    window.addEventListener('scroll', onScroll, { passive: true });
    hamburger.addEventListener('click', toggleMenu);

    $$('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menuOpen = false;
        hamburger.classList.remove('open');
        mobileMenu.classList.add('hidden');
      });
    });
  }

  return { init };
})();


/* ============================================================
   3. HERO CAROUSEL
============================================================ */
const HeroCarousel = (() => {
  const slides       = $$('.hero-slide');
  const dots         = $$('.hero-dot');
  const progress     = $('#heroProgress');
  const counter      = $('#slideCounter');
  const playPauseBtn = $('#playPauseBtn');
  const playIcon     = $('#playIcon');
  const pauseIcon    = $('#pauseIcon');
  const prevBtn      = $('#heroPrev');
  const nextBtn      = $('#heroNext');
  const heroSection  = $('#hero');

  const SLIDE_DURATION = 6000;
  const TICK = 50;

  let current   = 0;
  let isPlaying = true;
  let elapsed   = 0;
  let ticker    = null;
  const total   = slides.length;

  function goTo(index) {
    if (!total) return;
    slides[current].classList.remove('active');
    dots[current] && dots[current].classList.remove('active');

    current = (index + total) % total;

    slides[current].classList.add('active');
    dots[current] && dots[current].classList.add('active');

    if (counter) {
      counter.textContent =
        String(current + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
    }

    elapsed = 0;
    if (progress) progress.style.width = '0%';
  }

  function startTicker() {
    clearInterval(ticker);
    ticker = setInterval(() => {
      if (!isPlaying) return;
      elapsed += TICK;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      if (progress) progress.style.width = pct + '%';
      if (elapsed >= SLIDE_DURATION) goTo(current + 1);
    }, TICK);
  }

  function togglePlay() {
    isPlaying = !isPlaying;
    if (playIcon)  playIcon.classList.toggle('hidden', isPlaying);
    if (pauseIcon) pauseIcon.classList.toggle('hidden', !isPlaying);
  }

  let touchStartX = 0;
  let touchStartY = 0;

  function onTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  function onTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? goTo(current + 1) : goTo(current - 1);
    }
  }

  function init() {
    if (!slides.length || !heroSection) return;

    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);

    heroSection.addEventListener('touchstart', onTouchStart, { passive: true });
    heroSection.addEventListener('touchend', onTouchEnd, { passive: true });

    heroSection.addEventListener('mouseenter', () => { isPlaying = false; });
    heroSection.addEventListener('mouseleave', () => {
      if (playPauseBtn && !playPauseBtn.classList.contains('paused')) isPlaying = true;
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft')  goTo(current - 1);
    });

    startTicker();
  }

  return { init };
})();


/* ============================================================
   4. SECTION REVEAL
============================================================ */
const RevealObserver = (() => {
  function init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: reveal all immediately for old browsers
      $$('.reveal').forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10 });

    $$('.reveal').forEach(el => observer.observe(el));
  }

  return { init };
})();


/* ============================================================
   5. GAME CARDS — Mobile scroll dot tracker
============================================================ */
const GameCards = (() => {
  function init() {
    const track = $('#gamesTrack');
    const dots  = $$('.shd');
    if (!track || !dots.length) return;

    track.addEventListener('scroll', () => {
      const scrollLeft = track.scrollLeft;
      const maxScroll  = track.scrollWidth - track.clientWidth;
      const pct        = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      const activeDot  = Math.round(pct * (dots.length - 1));
      dots.forEach((d, i) => d.classList.toggle('active', i === activeDot));
    }, { passive: true });
  }

  return { init };
})();


/* ============================================================
   6. VIDEO MODAL
============================================================ */
const VideoModal = (() => {
  let modal    = null;
  let closeBtn = null;
  let backdrop = null;
  let isOpen   = false;

  function open() {
    if (!modal || isOpen) return;
    isOpen = true;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtn && closeBtn.focus(), 100);
  }

  function close() {
    if (!modal || !isOpen) return;
    isOpen = false;
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  function init() {
    modal    = $('#videoModal');
    closeBtn = $('#modalClose');
    backdrop = $('#modalBackdrop');

    // Phase 3 HTML not pasted yet — skip silently
    if (!modal) return;

    const openBtn = $('#trailerPlayBtn');
    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);

    $$('.mini-trailer-card').forEach(card => {
      card.addEventListener('click', open);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) close();
    });

    window.addEventListener('popstate', () => {
      if (isOpen) close();
    });
  }

  return { init };
})();


/* ============================================================
   BOOT — DOMContentLoaded
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  Loader.init();
  Navbar.init();
  HeroCarousel.init();
  RevealObserver.init();
  GameCards.init();
  VideoModal.init();
});