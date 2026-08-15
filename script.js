(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const toast = document.querySelector('.toast');
  const year = document.querySelector('#year');

  // Completa os estilos específicos dos componentes que dependem do JS.
  // Mantido aqui para o site continuar portátil em apenas três arquivos.
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

  const setHeaderState = () => {
    header?.classList.toggle('scrolled', window.scrollY > 20);
  };
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

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
  });

  // Animações de entrada acessíveis: desativadas automaticamente quando
  // o sistema solicita redução de movimento.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  // Copiar e-mail.
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

  // Movimento sutil no painel principal em desktops com ponteiro preciso.
  const panel = document.querySelector('.engine-panel');
  const visual = document.querySelector('.hero-visual');
  const precisePointer = window.matchMedia('(pointer:fine)').matches;

  if (panel && visual && precisePointer && !reducedMotion) {
    visual.addEventListener('pointermove', event => {
      const rect = visual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      panel.style.transform = `perspective(1200px) rotateY(${x * 5 - 2}deg) rotateX(${y * -3 + 1}deg) translateY(-2px)`;
    });
    visual.addEventListener('pointerleave', () => {
      panel.style.transform = '';
    });
  }

  // Fundo em canvas: pontos e conexões muito sutis.
  const canvas = document.querySelector('#ambient-canvas');
  if (!canvas || reducedMotion) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let raf = 0;

  const resizeCanvas = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(18, Math.min(48, Math.floor(width / 34)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      r: Math.random() * 1.1 + 0.35
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
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
        if (dist > 125) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(77,163,255,${(1 - dist / 125) * 0.055})`;
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
    resizeTimer = setTimeout(resizeCanvas, 120);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      draw();
    }
  });
})();
