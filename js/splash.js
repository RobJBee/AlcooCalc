'use strict';

/*
 * Animation d'ouverture "pluie Matrix" (canvas plein écran) :
 * - la pluie tombe normalement (caractères aléatoires, traînée qui s'efface) ;
 * - ~40% des caractères réellement affichés à l'écran (titre, titres de
 *   section, labels, boutons — récupérés depuis le vrai DOM, encore invisible
 *   à opacity:0 mais déjà mis en page) se "verrouillent" à leur vraie position,
 *   dans leur vraie couleur, à un moment aléatoire pendant la pluie, et restent
 *   figés : l'interface se construit visiblement sous les yeux de l'utilisateur.
 *   Le tirage favorise les caractères à droite de l'écran (il y en a
 *   proportionnellement moins, la plupart des textes commençant à gauche) ;
 * - au moment où la pluie commence à ralentir, le fondu-enchaîné démarre :
 *   l'app apparaît en transparence pendant que la pluie (qui continue de
 *   ralentir/tourner) disparaît en transparence, sur une transition longue.
 * Cliquer/toucher l'écran permet de passer l'animation. Sautée instantanément
 * si l'utilisateur a activé "prefers-reduced-motion".
 */
(function initSplash() {
  const PRE_SLOWDOWN_MS = 2500; // durée de pluie à vitesse normale
  const SLOWDOWN_MS = 500; // ralentissement progressif, en parallèle du début du fondu
  const FADE_MS = 1050; // durée du fondu-enchaîné (700ms *1.5), démarre avec le ralentissement
  const LOCK_RATIO = 0.4; // proportion des caractères réels qui se verrouillent tôt
  const LOCK_WINDOW = [400, PRE_SLOWDOWN_MS - 100]; // ms : fenêtre où les verrouillages se répartissent
  const RIGHT_BIAS = 3; // poids relatif donné aux caractères les plus à droite lors du tirage

  const splash = document.getElementById('splashScreen');
  const canvas = document.getElementById('matrixCanvas');
  const appContent = document.getElementById('appContent');
  if (!splash || !canvas) return;

  let fadeStarted = false;
  let stopped = false;

  const startFade = () => {
    if (fadeStarted) return;
    fadeStarted = true;
    document.body.classList.add('app-ready');
    splash.classList.add('is-hidden');
    setTimeout(() => {
      splash.remove();
    }, FADE_MS);
  };

  const stopLoop = () => {
    if (stopped) return;
    stopped = true;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
  };

  const skip = () => {
    stopLoop();
    startFade();
  };

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    startFade();
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

  // Tirage pondéré sans remise (algorithme A-Res) : les caractères les plus à
  // droite ont plus de chances d'être choisis, pour compenser le fait qu'il y
  // en a proportionnellement moins (la plupart des textes commencent à gauche).
  function pickLockTargets() {
    const all = harvestRealChars();
    const viewportW = window.innerWidth || 1;

    const weighted = all.map((c) => {
      const xRatio = Math.min(1, Math.max(0, c.x / viewportW));
      const weight = 1 + xRatio * RIGHT_BIAS;
      return { c, key: Math.pow(Math.random(), 1 / weight) };
    });
    weighted.sort((a, b) => b.key - a.key);

    const count = Math.round(all.length * LOCK_RATIO);
    return weighted.slice(0, count).map(({ c }) => ({
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

    // ralentit progressivement la pluie une fois PRE_SLOWDOWN_MS écoulé, en
    // même temps que démarre le fondu-enchaîné vers l'interface réelle.
    let speedFactor = 1;
    if (elapsed > PRE_SLOWDOWN_MS) {
      const t = Math.min(1, (elapsed - PRE_SLOWDOWN_MS) / SLOWDOWN_MS);
      speedFactor = 1 - t * 0.85;
      startFade();
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

    const totalDuration = PRE_SLOWDOWN_MS + FADE_MS;
    if (elapsed < totalDuration && !stopped) {
      rafId = requestAnimationFrame(draw);
    } else {
      stopLoop();
    }
  }

  splash.addEventListener('click', skip);
  splash.addEventListener('touchstart', skip, { passive: true });

  rafId = requestAnimationFrame(draw);
})();
