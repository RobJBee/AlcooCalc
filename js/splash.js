'use strict';

/*
 * Animation d'ouverture "pluie Matrix" (canvas plein écran), ~3s :
 * - la pluie tombe normalement (caractères aléatoires, traînée qui s'efface) ;
 * - environ 20% des caractères réellement affichés à l'écran (titre, titres de
 *   section, labels, boutons — récupérés depuis le vrai DOM, encore invisible
 *   à opacity:0 mais déjà mis en page) se "verrouillent" à leur vraie position,
 *   dans leur vraie couleur, à un moment aléatoire pendant la pluie, et restent
 *   figés : l'interface se construit visiblement sous les yeux de l'utilisateur ;
 * - ralentissement progressif sur la dernière demi-seconde, puis fondu croisé
 *   vers l'interface réelle en dessous.
 * Cliquer/toucher l'écran permet de passer l'animation. Sautée instantanément
 * si l'utilisateur a activé "prefers-reduced-motion".
 */
(function initSplash() {
  const RAIN_DURATION_MS = 3000;
  const SLOWDOWN_MS = 500; // derniers ms de la pluie où elle ralentit
  const FADE_MS = 700;
  const LOCK_RATIO = 0.4; // proportion des caractères réels qui se verrouillent tôt
  const LOCK_WINDOW = [400, 2700]; // ms : fenêtre où les verrouillages se répartissent

  const splash = document.getElementById('splashScreen');
  const canvas = document.getElementById('matrixCanvas');
  const appContent = document.getElementById('appContent');
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

  // Récupère les caractères réellement visibles à l'écran (texte + position +
  // taille + couleur) depuis le vrai DOM, pour pouvoir en "verrouiller" une
  // partie au bon endroit pendant la pluie.
  function harvestRealChars() {
    if (!appContent) return [];
    const results = [];
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const walker = document.createTreeWalker(appContent, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });

    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent) continue;

      const range = document.createRange();
      range.selectNodeContents(node);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (rect.bottom < 0 || rect.top > viewportH || rect.right < 0 || rect.left > viewportW) continue;

      const style = getComputedStyle(parent);
      const fontSize = parseFloat(style.fontSize) || FONT_SIZE;
      let text = node.textContent;
      if (style.textTransform === 'uppercase') text = text.toUpperCase();

      ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
      let x = rect.left;
      for (const char of text) {
        const width = ctx.measureText(char).width;
        if (char.trim()) {
          results.push({
            char,
            x,
            y: rect.top + fontSize * 0.85,
            fontSize,
            fontWeight: style.fontWeight,
            fontFamily: style.fontFamily,
            color: style.color,
          });
        }
        x += width;
      }
    }
    return results;
  }

  function pickLockTargets() {
    const all = harvestRealChars();
    const shuffled = all.sort(() => Math.random() - 0.5);
    const count = Math.round(all.length * LOCK_RATIO);
    return shuffled.slice(0, count).map((c) => ({
      ...c,
      lockAt: LOCK_WINDOW[0] + Math.random() * (LOCK_WINDOW[1] - LOCK_WINDOW[0]),
    }));
  }

  const lockTargets = pickLockTargets();

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

  function drawLockedChars(elapsed) {
    for (const t of lockTargets) {
      if (elapsed < t.lockAt) continue;
      const sinceLock = elapsed - t.lockAt;
      ctx.font = `${t.fontWeight} ${t.fontSize}px ${t.fontFamily}`;
      ctx.fillStyle = sinceLock < 150 ? '#ffffff' : t.color;
      ctx.fillText(t.char, t.x, t.y);
    }
  }

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
      drops[i] += 0.3 * speedFactor + 0.05;
    }

    drawLockedChars(elapsed);

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
