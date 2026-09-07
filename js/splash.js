'use strict';

/*
 * Animation d'ouverture "pluie Matrix" (canvas plein écran) : ~3s de pluie de
 * caractères, ralentissement progressif sur la dernière demi-seconde ("les
 * caractères se mettent en place"), puis fondu croisé avec l'interface réelle
 * en dessous. Cliquer/toucher l'écran permet de passer l'animation. Sautée
 * instantanément si l'utilisateur a activé "prefers-reduced-motion".
 */
(function initSplash() {
  const RAIN_DURATION_MS = 3000;
  const SLOWDOWN_MS = 500; // derniers ms de la pluie où elle ralentit
  const FADE_MS = 700;

  const splash = document.getElementById('splashScreen');
  const canvas = document.getElementById('matrixCanvas');
  if (!splash || !canvas) return;

  const finishSplash = () => {
    document.body.classList.add('app-ready');
    splash.classList.add('is-hidden');
    setTimeout(() => {
      splash.remove();
    }, FADE_MS);
  };

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    finishSplash();
    return;
  }

  const ctx = canvas.getContext('2d');
  const CHARS = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const FONT_SIZE = 18;

  let columns = 0;
  let drops = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.ceil(canvas.width / FONT_SIZE);
    drops = new Array(columns).fill(0).map(() => Math.random() * -50);
  }

  window.addEventListener('resize', resize);
  resize();

  let rafId = null;
  const startTime = performance.now();
  let finished = false;

  function draw(now) {
    const elapsed = now - startTime;

    // ralentit progressivement la pluie sur les derniers SLOWDOWN_MS pour donner
    // l'impression qu'elle "se met en place" avant de se dissoudre.
    const slowdownStart = RAIN_DURATION_MS - SLOWDOWN_MS;
    let speedFactor = 1;
    if (elapsed > slowdownStart) {
      const t = Math.min(1, (elapsed - slowdownStart) / SLOWDOWN_MS);
      speedFactor = 1 - t * 0.85;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${FONT_SIZE}px 'JetBrains Mono', 'Fira Code', 'Courier New', monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const y = drops[i] * FONT_SIZE;

      // tête de la traînée plus claire, effet de lueur
      ctx.fillStyle = '#c8ffd8';
      ctx.fillText(char, i * FONT_SIZE, y);
      ctx.fillStyle = '#00ff41';
      ctx.fillText(char, i * FONT_SIZE, y - FONT_SIZE);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 0.6 * speedFactor + 0.1;
    }

    if (elapsed < RAIN_DURATION_MS && !finished) {
      rafId = requestAnimationFrame(draw);
    } else {
      finish();
    }
  }

  function finish() {
    if (finished) return;
    finished = true;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
    finishSplash();
  }

  splash.addEventListener('click', finish);
  splash.addEventListener('touchstart', finish, { passive: true });

  rafId = requestAnimationFrame(draw);
})();
