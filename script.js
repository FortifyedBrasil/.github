(() => {
  'use strict';

  /* Progressive motion layer. The base layout keeps working if this file fails. */
  const motionStyles = document.createElement('link');
  motionStyles.rel = 'stylesheet';
  motionStyles.href = 'modern.css';
  document.head.appendChild(motionStyles);

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const toast = document.querySelector('.toast');
  const year = document.querySelector('#year');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const precisePointer = window.matchMedia('(pointer:fine)').matches;

  // Component styles that existed in the initial version and are intentionally
  // kept runtime-local so the page still ships as a small static bundle.
  const runtimeStyles = document.createElement('style');
  runtimeStyles.textContent = `
    .contact-actions{position:relative;z-index:2;display:grid;gap:12px}
    .email-card{position:relative;display:grid;grid-template-columns:1fr auto;gap:4px 16px;align-items:center;padding:24px;border:1px solid rgba(124,198,255,.2);border-radius:18px;background:rgba(255,255,255,.03);transition:transform .18s ease,border-color .18s ease,background .18s ease}
    .email-card:hover{transform:translateY(-3px);border-color:rgba(124,198,255,.42);background:rgba(77,163,255,.07)}
    .email-card>span{grid-column:1;color:#6e839b;font-size:9px;font-weight:800;letter-spacing:.14em}
    .email-card>strong{grid-column:1;color:#f1f7ff;font-family:Manrope,sans-serif;font-size:clamp(16px,2vw,24px);word-break:break-word}
    .email-card>svg{grid-column:2;grid-row:1/3;width:22px;height:22px;fill:none;stroke:#7cc6ff;stroke-width:1.8}
    .copy-email{display:flex;align-items:center;justify-content:center;gap:10px}
    .copy-email svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6}
    .contact-glow{position:absolute;width:420px;height:420px;right:-120px;top:-180px;border-radius:50%;background:radial-gradient(circle,rgba(77,163,255,.18),transparent 66%);filter:blur(20px);pointer-events:none}
    .footer-grid{display:grid;grid-template-columns:1.2fr 1fr auto;gap:40px;align-items:end}
    .footer-brand{margin-bottom:12px}.footer-grid>div:first-child>p{margin:0;color:#6f8399;font-size:12px}
    .footer-meta{display:grid;gap:5px;text-align:right;color:#63778d;font-size:11px}
    .toast{position:fixed;left:50%;bottom:28px;z-index:200;transform:translate(-50%,18px);padding:11px 16px;border:1px solid rgba(124,198,255,.25);border-radius:12px;background:rgba(8,18,31,.94);box-shadow:0 18px 44px rgba(0,0,0,.32);color:#e9f4ff;font-size:13px;opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;backdrop-filter:blur(14px)}
    .toast.show{opacity:1;transform:translate(-50%,0)}
    @media(max-width:880px){.footer-grid{grid-template-columns:1fr 1fr}.footer-meta{grid-column:1/-1;text-align:left;display:flex;justify-content:space-between}.capability-orbit span{transform:rotate(calc(var(--i)*60deg)) translateX(145px) rotate(calc(var(--i)*-60deg))}}
    @media(max-width:620px){.footer-grid{grid-template-columns:1fr}.footer-meta{grid-column:auto;flex-direction:column}.footer-links{flex-wrap:wrap}.contact-actions{width:100%}.email-card{padding:20px}.capability-orbit span{transform:rotate(calc(var(--i)*60deg)) translateX(132px) rotate(calc(var(--i)*-60deg))}}
  `;
  document.head.appendChild(runtimeStyles);

  if (year) year.textContent = new Date().getFullYear();

  // Scroll progress.
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.setAttribute('aria-hidden', 'true');
  body.appendChild(progressBar);

  const setHeaderState = () => {
    header?.classList.toggle('scrolled', window.scrollY > 20);
  };

  const updateScrollEffects = () => {
    setHeaderState();

    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
    root.style.setProperty('--scroll-progress', progress.toFixed(3));

    const method = document.querySelector('.method-track');
    if (method) {
      const rect = method.getBoundingClientRect();
      const start = window.innerHeight * 0.78;
      const end = window.innerHeight * 0.25;
      const local = Math.min(1, Math.max(0, (start - rect.top) / Math.max(1, start - end + rect.height * .45)));
      const methodPercent = local * 100;
      method.style.setProperty('--track-progress', `${methodPercent}%`);

      const steps = [...method.querySelectorAll('article')];
      steps.forEach((step, index) => {
        const threshold = (index / Math.max(1, steps.length - 1)) * 100;
        step.classList.toggle('method-active', methodPercent >= threshold - 4);
      });
    }

    if (!reducedMotion && window.innerWidth > 880) {
      const hero = document.querySelector('.hero');
      const heroCopy = document.querySelector('.hero-copy');
      const heroVisual = document.querySelector('.hero-visual');
      if (hero && heroCopy && heroVisual) {
        const rect = hero.getBoundingClientRect();
        const distance = Math.min(window.innerHeight, Math.max(0, -rect.top));
        heroCopy.style.transform = `translate3d(0, ${distance * .045}px, 0)`;
        heroVisual.style.transform = `translate3d(0, ${distance * .075}px, 0)`;
      }
    }
  };

  let scrollQueued = false;
  const onScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      updateScrollEffects();
      scrollQueued = false;
    });
  };
  updateScrollEffects();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile navigation.
  const closeMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    body.classList.remove('menu-open');
  };

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    mobileMenu?.classList.toggle('open', !open);
    mobileMenu?.setAttribute('aria-hidden', String(open));
    body.classList.toggle('menu-open', !open);
  });

  mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 880) closeMenu();
    updateScrollEffects();
  }, { passive: true });

  // Reveal on scroll.
  const revealEls = [...document.querySelectorAll('.reveal')];
  revealEls.forEach(el => {
    const delay = Number(el.dataset.delay || 0);
    el.style.setProperty('--delay', `${delay}ms`);
  });

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px' });
    revealEls.forEach(el => observer.observe(el));
  }

  // Active navigation section.
  const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
  const sectionMap = navLinks
    .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter(item => item.section);

  if ('IntersectionObserver' in window && sectionMap.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach(link => link.classList.remove('active'));
      sectionMap.find(item => item.section === visible.target)?.link.classList.add('active');
    }, { rootMargin: '-28% 0px -55% 0px', threshold: [0, .15, .35, .6] });
    sectionMap.forEach(item => sectionObserver.observe(item.section));
  }

  // Copy e-mail.
  document.querySelectorAll('.copy-email').forEach(button => {
    button.addEventListener('click', async () => {
      const email = button.dataset.email || 'fortifyedbrasil@gmail.com';
      const label = button.querySelector('.copy-label');
      const original = label?.textContent || 'Copiar e-mail';

      try {
        await navigator.clipboard.writeText(email);
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }

      if (label) label.textContent = 'E-mail copiado';
      toast?.classList.add('show');
      window.setTimeout(() => {
        if (label) label.textContent = original;
        toast?.classList.remove('show');
      }, 1800);
    });
  });

  // Index the capability words for staggered floating motion.
  document.querySelectorAll('.trust-grid span').forEach((item, index) => {
    item.style.setProperty('--trust-i', index);
  });

  if (precisePointer && !reducedMotion) {
    // Pointer glow coordinates used by the page background.
    let pointerX = window.innerWidth * .5;
    let pointerY = window.innerHeight * .25;
    let targetX = pointerX;
    let targetY = pointerY;

    // Soft follower, intentionally not replacing the native cursor.
    const orb = document.createElement('div');
    orb.className = 'pointer-orb';
    orb.setAttribute('aria-hidden', 'true');
    body.appendChild(orb);

    let orbX = pointerX;
    let orbY = pointerY;
    let orbRaf = 0;

    const animatePointer = () => {
      pointerX += (targetX - pointerX) * .12;
      pointerY += (targetY - pointerY) * .12;
      orbX += (targetX - orbX) * .2;
      orbY += (targetY - orbY) * .2;

      root.style.setProperty('--pointer-x', `${pointerX}px`);
      root.style.setProperty('--pointer-y', `${pointerY}px`);
      orb.style.transform = `translate3d(${orbX}px, ${orbY}px, 0) translate(-50%, -50%)`;
      orbRaf = requestAnimationFrame(animatePointer);
    };
    animatePointer();

    window.addEventListener('pointermove', event => {
      targetX = event.clientX;
      targetY = event.clientY;
      orb.classList.add('visible');
    }, { passive: true });

    document.addEventListener('pointerleave', () => orb.classList.remove('visible'));
    document.querySelectorAll('a, button, .product-card').forEach(el => {
      el.addEventListener('pointerenter', () => orb.classList.add('interactive'));
      el.addEventListener('pointerleave', () => orb.classList.remove('interactive'));
    });

    // Local spotlight follows the pointer inside interactive surfaces.
    document.querySelectorAll('.product-card, .principle-card, .capability-card, .contact-card, .engine-panel').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
      });
    });

    // Premium 3D tilt on cards — small angles keep text comfortable to read.
    const addTilt = (element, maxX = 3.2, maxY = 4.2) => {
      element.addEventListener('pointermove', event => {
        const rect = element.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - .5;
        const py = (event.clientY - rect.top) / rect.height - .5;
        const rx = py * -maxX;
        const ry = px * maxY;
        element.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
      element.addEventListener('pointerleave', () => {
        element.style.transform = '';
      });
    };

    document.querySelectorAll('.product-card').forEach(card => addTilt(card, 3, 4));
    document.querySelectorAll('.principle-card').forEach(card => addTilt(card, 2.4, 3));

    const panel = document.querySelector('.engine-panel');
    const visual = document.querySelector('.hero-visual');
    if (panel && visual) {
      visual.addEventListener('pointermove', event => {
        const rect = visual.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        panel.style.transform = `perspective(1200px) rotateY(${x * 6 - 2}deg) rotateX(${y * -4 + 1}deg) translateY(-3px)`;
      });
      visual.addEventListener('pointerleave', () => { panel.style.transform = ''; });
    }

    // Magnetic microinteraction on the primary actions.
    document.querySelectorAll('.button-primary, .nav-cta').forEach(button => {
      button.addEventListener('pointermove', event => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate3d(${x * .09}px, ${y * .12}px, 0) translateY(-2px)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });

    window.addEventListener('pagehide', () => cancelAnimationFrame(orbRaf), { once: true });
  }

  // Ambient canvas: quiet moving network with a mild pointer response.
  const canvas = document.querySelector('#ambient-canvas');
  if (!canvas || reducedMotion) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let raf = 0;
  let mouse = { x: -9999, y: -9999 };

  window.addEventListener('pointermove', event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { mouse = { x: -9999, y: -9999 }; });

  const resizeCanvas = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(18, Math.min(54, Math.floor(width / 32)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .13,
      vy: (Math.random() - .5) * .13,
      r: Math.random() * 1.15 + .32
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      const mdx = p.x - mouse.x;
      const mdy = p.y - mouse.y;
      const md = Math.hypot(mdx, mdy);
      if (md < 135 && md > 0) {
        const force = (1 - md / 135) * .012;
        p.vx += (mdx / md) * force;
        p.vy += (mdy / md) * force;
      }

      p.vx *= .997;
      p.vy *= .997;
      p.vx = Math.max(-.23, Math.min(.23, p.vx));
      p.vy = Math.max(-.23, Math.min(.23, p.vy));
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(124,198,255,.24)';
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 128) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(77,163,255,${(1 - dist / 128) * .06})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    raf = requestAnimationFrame(draw);
  };

  resizeCanvas();
  draw();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeCanvas, 120);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      cancelAnimationFrame(raf);
      draw();
    }
  });
})();
