/**
 * AE EXPERIENCE — main.js
 * Big Tech Level Animations · JavaScript Nativo Puro
 * Sin dependencias externas de animación
 */

'use strict';

/* ============================================================
   UTILIDADES DE ANIMACIÓN NATIVAS
============================================================ */

/**
 * Función easing personalizada — cubic-bezier nativo por JS
 * Equivale a ease-out-expo
 */
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

/**
 * Anima un valor numérico de `from` a `to` en `duration` ms.
 * onUpdate recibe el valor actual. onComplete se llama al finalizar.
 */
function animateValue({ from, to, duration, easing = easeOutExpo, onUpdate, onComplete }) {
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);
    onUpdate(from + (to - from) * easedProgress);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      onComplete && onComplete();
    }
  }
  requestAnimationFrame(tick);
}

/**
 * Ejecuta fn después de `delay` ms (wrapper semántico de setTimeout).
 */
const after = (delay, fn) => setTimeout(fn, delay);

/* ============================================================
   LOADER PREMIUM
============================================================ */
(function initLoader() {
  const loader      = document.getElementById('page-loader');
  const barFill     = document.getElementById('loader-bar');
  const percentEl   = document.getElementById('loader-percent');
  const circleFill  = document.querySelector('.loader-circle-fill');
  const curtains    = document.querySelectorAll('.curtain');

  if (!loader) return;

  /* Bloquear scroll durante carga */
  document.body.classList.add('loading');

  /* Inyectar definición de gradiente SVG para el círculo */
  const svgDefs = `
    <svg style="position:absolute;width:0;height:0" aria-hidden="true">
      <defs>
        <linearGradient id="loader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#7C3AED"/>
          <stop offset="100%" stop-color="#A78BFA"/>
        </linearGradient>
      </defs>
    </svg>`;
  document.body.insertAdjacentHTML('beforeend', svgDefs);

  /* Activar la animación del círculo SVG */
  after(300, () => {
    circleFill && circleFill.classList.add('animating');
  });

  /* Animar barra de progreso de 0 → 100 en ~1.8s */
  let currentPercent = 0;

  animateValue({
    from: 0,
    to: 100,
    duration: 1800,
    easing: easeInOutQuart,
    onUpdate(val) {
      currentPercent = Math.round(val);
      if (barFill)   barFill.style.width = val + '%';
      if (percentEl) percentEl.textContent = currentPercent + '%';
    },
    onComplete: startExit
  });

  /* Salida: cortinas hacia arriba */
  function startExit() {
    after(200, () => {
      /* Levantar las cortinas con stagger */
      curtains.forEach(c => c.classList.add('rise'));

      /* Después de que las cortinas suban, ocultar el loader */
      after(900, () => {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        document.body.classList.remove('loading');

        /* Lanzar animaciones del hero */
        after(200, initHeroAnimations);

        /* Eliminar loader del DOM */
        after(700, () => loader.remove());
      });
    });
  }
})();

/* ============================================================
   ANIMACIONES HERO — ENTRADA SECUENCIAL BIG TECH
============================================================ */
function initHeroAnimations() {

  /* ── BADGE ── */
  after(0, () => {
    const badge = document.getElementById('hero-badge');
    if (badge) badge.classList.add('visible');
  });

  /* ── HEADLINE — cada línea sale desde abajo con stagger ── */
  const hlInners = document.querySelectorAll('.hl-inner');
  hlInners.forEach((el, i) => {
    after(120 + i * 130, () => {
      el.classList.add('visible');
    });
  });

  /* ── SUBTÍTULO ── */
  after(520, () => {
    const sub = document.getElementById('hero-sub');
    if (sub) sub.classList.add('visible');
  });

  /* ── CTAs ── */
  after(680, () => {
    const ctas = document.getElementById('hero-ctas');
    if (ctas) ctas.classList.add('visible');
  });

  /* ── MÉTRICAS ── */
  after(820, () => {
    const metrics = document.getElementById('hero-metrics');
    if (metrics) metrics.classList.add('visible');

    /* Contadores numéricos */
    after(200, animateCounters);
  });

  /* ── VISUAL HERO ── */
  after(200, () => {
    const visual = document.getElementById('hero-visual');
    if (visual) visual.classList.add('visible');
  });

}

/* ============================================================
   CONTADORES ANIMADOS
============================================================ */
function animateCounters() {
  const metricNums = document.querySelectorAll('.metric-num');

  metricNums.forEach(el => {
    const text   = el.textContent.trim();
    const prefix = text.startsWith('+') ? '+' : '';
    const suffix = text.endsWith('+')   ? '+' : '';
    const raw    = parseInt(text.replace(/\D/g, ''), 10);
    if (isNaN(raw)) return;

    animateValue({
      from: 0,
      to: raw,
      duration: 1800,
      easing: easeOutExpo,
      onUpdate(val) {
        el.textContent = prefix + Math.round(val) + suffix;
      }
    });
  });
}

/* ============================================================
   PARTÍCULAS — CANVAS NATIVO
============================================================ */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], mouse = { x: -999, y: -999 };
  const COUNT = window.innerWidth < 768 ? 28 : 55;
  const MAX_DIST = 120;
  const MOUSE_DIST = 100;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  /* Observar cambios de tamaño */
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  /* Seguir el mouse para interactividad */
  document.getElementById('inicio')?.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });
  document.getElementById('inicio')?.addEventListener('mouseleave', () => {
    mouse.x = -999; mouse.y = -999;
  });

  class Particle {
    constructor() { this.init(); }
    init() {
      this.x    = Math.random() * (W || 800);
      this.y    = Math.random() * (H || 600);
      this.vx   = (Math.random() - 0.5) * 0.3;
      this.vy   = (Math.random() - 0.5) * 0.3;
      this.r    = Math.random() * 1.8 + 0.4;
      this.base = this.r;
      this.alpha = Math.random() * 0.45 + 0.08;
      this.color = Math.random() > 0.6 ? '167,139,250' : '139,92,246';
    }
    update() {
      /* Repulsión suave al mouse */
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < MOUSE_DIST) {
        const force = (MOUSE_DIST - d) / MOUSE_DIST * 0.8;
        this.x += (dx / d) * force;
        this.y += (dy / d) * force;
        this.r = this.base + force * 2;
      } else {
        this.r += (this.base - this.r) * 0.08;
      }

      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) { this.x = 0; this.vx *= -1; }
      if (this.x > W) { this.x = W; this.vx *= -1; }
      if (this.y < 0) { this.y = 0; this.vy *= -1; }
      if (this.y > H) { this.y = H; this.vy *= -1; }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  let animFrameId;
  function loop() {
    ctx.clearRect(0, 0, W, H);

    /* Dibujar partículas */
    particles.forEach(p => { p.update(); p.draw(); });

    /* Dibujar conexiones */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    animFrameId = requestAnimationFrame(loop);
  }
  loop();

  /* Pausar cuando el canvas sale del viewport para ahorrar CPU */
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!animFrameId) loop();
    } else {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  });
  io.observe(canvas);
})();

/* ============================================================
   PARALLAX CON MOUSE — Orbs y tarjetas responden al cursor
============================================================ */
(function initMouseParallax() {
  const section  = document.getElementById('inicio');
  if (!section) return;

  const parallaxEls = section.querySelectorAll('[data-parallax]');
  let   rafId;
  let   targetX = 0, targetY = 0;
  let   currentX = 0, currentY = 0;

  section.addEventListener('mousemove', e => {
    const rect = section.getBoundingClientRect();
    /* Normalizar: -1 a 1 desde el centro */
    targetX = ((e.clientX - rect.left)  / rect.width  - 0.5) * 2;
    targetY = ((e.clientY - rect.top)   / rect.height - 0.5) * 2;
  }, { passive: true });

  section.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0;
  });

  function tickParallax() {
    /* Smooth lerp para evitar movimientos bruscos */
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    parallaxEls.forEach(el => {
      const strength = parseFloat(el.dataset.parallax || 0.03);
      const moveX = currentX * strength * 80;
      const moveY = currentY * strength * 60;
      el.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    rafId = requestAnimationFrame(tickParallax);
  }
  tickParallax();
})();

/* ============================================================
   TILT 3D EN EL MARCO DE IMAGEN (efecto Apple-style)
============================================================ */
(function initImageTilt() {
  const frame = document.getElementById('hero-tilt');
  if (!frame) return;

  const MAX_TILT = 8; /* grados máximos */
  let rafId, target = { rx: 0, ry: 0 }, current = { rx: 0, ry: 0 };

  frame.addEventListener('mousemove', e => {
    const rect = frame.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width  - 0.5;  /* -0.5 a 0.5 */
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;

    target.ry =  cx * MAX_TILT * 2;
    target.rx = -cy * MAX_TILT * 2;
  }, { passive: true });

  frame.addEventListener('mouseleave', () => {
    target.rx = 0; target.ry = 0;
  });

  function tickTilt() {
    current.rx += (target.rx - current.rx) * 0.1;
    current.ry += (target.ry - current.ry) * 0.1;

    frame.style.transform =
      `perspective(1000px) rotateX(${current.rx}deg) rotateY(${current.ry}deg) scale3d(1.01,1.01,1.01)`;

    /* El glow sigue al mouse */
    const glowRing = frame.parentElement?.querySelector('.hero-glow-ring');
    if (glowRing) {
      glowRing.style.transform =
        `translate(${current.ry * 1.5}px, ${-current.rx * 1}px)`;
    }

    rafId = requestAnimationFrame(tickTilt);
  }
  tickTilt();
})();

/* ============================================================
   EFECTO MAGNÉTICO EN BOTONES CTA
============================================================ */
(function initMagneticButtons() {
  const btns = document.querySelectorAll('.btn-magnetic');
  const STRENGTH = 0.35; /* qué tan fuerte es la atracción */
  const RADIUS   = 70;   /* distancia en px de activación */

  btns.forEach(btn => {
    let rafId;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let inside = false;

    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      targetX = (e.clientX - cx) * STRENGTH;
      targetY = (e.clientY - cy) * STRENGTH;
      inside = true;
    }, { passive: true });

    btn.addEventListener('mouseleave', () => {
      targetX = 0; targetY = 0;
      inside  = false;
    });

    function tick() {
      currentX += (targetX - currentX) * 0.2;
      currentY += (targetY - currentY) * 0.2;

      if (Math.abs(currentX) > 0.01 || Math.abs(currentY) > 0.01 || inside) {
        btn.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
      rafId = requestAnimationFrame(tick);
    }
    tick();
  });
})();

/* ============================================================
   NAVBAR — scroll y menú mobile
============================================================ */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const menuBtn  = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!navbar) return;

  /* Scroll behavior */
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 40);
    lastY = y;
  }, { passive: true });

  /* Mobile menu toggle */
  menuBtn?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    menuBtn.classList.toggle('open', isOpen);
  });
})();

function closeMobileMenu() {
  document.getElementById('mobile-menu')?.classList.remove('open');
  document.getElementById('menu-btn')?.classList.remove('open');
}

/* ============================================================
   SCROLL REVEAL LIGERO (IntersectionObserver)
============================================================ */
(function initScrollReveal() {

  /* Secciones genéricas con data-aos */
  const aosEls = document.querySelectorAll('[data-aos]');
  const aosObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('aos-visible');
        aosObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  aosEls.forEach(el => aosObs.observe(el));

  /* Tarjetas de servicios con stagger */
  const svcCards = document.querySelectorAll('.svc-card');
  const svcObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.dataset.index || 0, 10);
        setTimeout(() => {
          entry.target.classList.add('card-visible');
        }, idx * 90);
        svcObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  svcCards.forEach(c => svcObs.observe(c));

  /* Pasos del proceso con stagger */
  const steps = document.querySelectorAll('.process-step');
  const stepsObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.dataset.index || 0, 10);
        setTimeout(() => {
          entry.target.classList.add('step-visible');
        }, idx * 110);
        stepsObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  steps.forEach(s => stepsObs.observe(s));

})();

/* ============================================================
   PARALLAX SUAVE AL SCROLL en el visual del hero
============================================================ */
(function initScrollParallax() {
  const visual = document.getElementById('hero-visual');
  const bg     = document.querySelector('.hero-bg');
  if (!visual) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        visual.style.transform = `translateY(${y * 0.07}px)`;
        if (bg) bg.style.transform = `translateY(${y * 0.04}px)`;
      }
      ticking = false;
    });
  }, { passive: true });
})();

/* ============================================================
   EFECTO HOVER EN TARJETAS FLOTANTES — tilt micro 3D
============================================================ */
(function initFloatCardHover() {
  document.querySelectorAll('.float-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width  - 0.5;
      const cy = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `
        perspective(400px)
        rotateY(${cx * 10}deg)
        rotateX(${-cy * 10}deg)
        scale(1.04)
      `;
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ============================================================
   SMOOTH SCROLL para navegación
============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   FORMULARIO DE CONTACTO
============================================================ */
function handleFormSubmit(e) {
  e.preventDefault();
  const btn     = e.target.querySelector('.form-submit');
  const success = document.getElementById('form-success');
  if (!btn) return;

  /* Estado loading en el botón */
  btn.disabled = true;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         style="animation:spin-slow 0.8s linear infinite">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
    Enviando...
  `;

  setTimeout(() => {
    btn.style.display = 'none';
    success.classList.add('show');
    e.target.reset();
  }, 1400);
}

/* ============================================================
   GRADIENTE ANIMADO EN EL HERO — refuerzo via JS
============================================================ */
(function initAuroraEnhance() {
  const section = document.getElementById('inicio');
  if (!section) return;

  let t = 0;
  function tick() {
    t += 0.003;
    section.style.setProperty('--aurora-t', t);
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ============================================================
   CARRUSEL PREMIUM — JS NATIVO
   Drag · Touch · Auto-play · Dots · Arrows
============================================================ */
(function initCarousel() {
  const wrap    = document.getElementById('carouselWrap');
  const track   = document.getElementById('carouselTrack');
  const btnPrev = document.getElementById('carouselPrev');
  const btnNext = document.getElementById('carouselNext');
  const dotsEl  = document.getElementById('carouselDots');

  if (!wrap || !track) return;

  const slides   = Array.from(track.querySelectorAll('.carousel-slide'));
  const total    = slides.length;
  const GAP      = 16;
  let   current  = 0;
  let   autoTimer;
  let   isDragging = false;
  let   startX = 0, startScrollLeft = 0;

  /* ── Calcular cuántas slides caben ── */
  function visibleCount() {
    const w = wrap.offsetWidth;
    if (w >= 1100) return 3.4;
    if (w >= 768)  return 2.4;
    if (w >= 480)  return 1.7;
    return 1.2;
  }

  function slideWidth() {
    return slides[0]?.offsetWidth + GAP || 356;
  }

  /* ── Ir a un índice ── */
  function goTo(idx) {
    /* Clamp: no pasar del último slide visible */
    const maxIdx = Math.max(0, total - Math.floor(visibleCount()));
    current = Math.max(0, Math.min(idx, maxIdx));

    const offset = current * slideWidth();
    track.style.transform = `translateX(-${offset}px)`;

    /* Actualizar dots */
    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });

    /* Actualizar botones */
    if (btnPrev) btnPrev.disabled = current === 0;
    if (btnNext) btnNext.disabled = current >= maxIdx;
  }

  /* ── Crear dots ── */
  function buildDots() {
    dotsEl.innerHTML = '';
    const maxIdx = Math.max(0, total - Math.floor(visibleCount()));
    for (let i = 0; i <= maxIdx; i++) {
      const btn = document.createElement('button');
      btn.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', `Slide ${i + 1}`);
      btn.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsEl.appendChild(btn);
    }
  }

  /* ── Auto-play ── */
  function startAuto() {
    autoTimer = setInterval(() => {
      const maxIdx = Math.max(0, total - Math.floor(visibleCount()));
      goTo(current >= maxIdx ? 0 : current + 1);
    }, 4000);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  /* ── Navegación ── */
  btnPrev?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  btnNext?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  /* ── Drag con mouse ── */
  wrap.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.pageX;
    startScrollLeft = current * slideWidth();
    track.style.transition = 'none';
    wrap.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const delta = startX - e.pageX;
    track.style.transform = `translateX(-${startScrollLeft + delta}px)`;
  });

  window.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    wrap.style.cursor = 'grab';
    track.style.transition = '';

    const delta = startX - e.pageX;
    const threshold = slideWidth() * 0.25;
    if      (delta >  threshold) goTo(current + 1);
    else if (delta < -threshold) goTo(current - 1);
    else                          goTo(current);
    resetAuto();
  });

  /* ── Touch / swipe ── */
  let touchStartX = 0;
  wrap.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    track.style.transition = 'none';
  }, { passive: true });

  wrap.addEventListener('touchend', e => {
    track.style.transition = '';
    const delta = touchStartX - e.changedTouches[0].clientX;
    const threshold = slideWidth() * 0.2;
    if      (delta >  threshold) goTo(current + 1);
    else if (delta < -threshold) goTo(current - 1);
    else                          goTo(current);
    resetAuto();
  }, { passive: true });

  /* ── Pausar al hacer hover ── */
  wrap.addEventListener('mouseenter', () => clearInterval(autoTimer));
  wrap.addEventListener('mouseleave', startAuto);

  /* ── Init y resize ── */
  function init() {
    buildDots();
    goTo(0);
  }

  init();
  startAuto();

  /* Rebuild en resize para recalcular los dots */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(Math.min(current, Math.max(0, total - Math.floor(visibleCount()))));
    }, 200);
  }, { passive: true });
})();
