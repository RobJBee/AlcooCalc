---
title: Journal du projet
status: actif
last-reviewed: 2026-09-07
sources: []
tags: [journal]
---

# Journal — AlcooCalc

## 2026-09-07
- Fait : création du dossier de projet (`C:\Users\Robert\Documents\Apps\AlcooCalc`), dépôt git local
  initialisé (branche `main`), structure de mémoire mise en place (`AGENTS.md`, `docs/JOURNAL.md`,
  `docs/ROADMAP.md`, `docs/DECISIONS.md`).
- Décidé : projet indépendant du dépôt "favoris" (AIBS-1), pour ne pas mélanger les journaux des deux
  applications. Dépôt GitHub dédié `RobJBee/AlcooCalc` (privé) à créer.
- Cadrage reçu de l'utilisateur : AlcooCalc est un calculateur de dilution alcool + sucre (pas un
  calculateur d'alcoolémie), en HTML/CSS/JS vanilla, thème "terminal mainframe" (vert Matrix sur fond
  noir), bilingue FR/EN, mobile-first, PWA (offline), KaTeX pour les formules, localStorage pour les
  préférences/historique.
- Dépôt GitHub `RobJBee/AlcooCalc` (privé) créé par l'utilisateur puis relié en remote ; premier
  commit poussé sur `main`.
- Cahier des charges complet reçu (structure de fichiers, fonctionnalités, design, et documentation
  détaillée des formules mathématiques). Le modèle de calcul fourni par l'utilisateur est identique
  à celui déjà anticipé et implémenté : conservation de l'alcool pur, sucre visé dans le volume
  final, expansion volumique du sucre (coefficient k), eau par bilan volumétrique. Voir ADR
  [0002](decisions/0002-formule-dilution-sucre.md).
- Scaffolding complet réalisé : `index.html`, `css/styles.css` (thème terminal mainframe, responsive
  320px→1920px), `js/translations.js` (i18n FR/EN persistant), `js/presets.js` (11 alcools),
  `js/formulas.js` (calcul + rendu KaTeX + étapes substituées), `js/app.js` (sliders synchronisés,
  calcul temps réel, validation, historique 10 dernières entrées, copier dans le presse-papiers,
  sauvegarde localStorage), `manifest.json` + `sw.js` (PWA, cache-first avec mise en cache
  opportuniste des polices KaTeX), icônes PWA 192/512 générées, `README.md`.
- KaTeX 0.16.9 (JS + CSS + les 60 fichiers de polices) téléchargé et vendored en local dans
  `js/katex/` — aucune dépendance CDN, conforme à l'exigence "100% local".
- Testé dans le navigateur (serveur de test PowerShell `scripts/serve.ps1`, créé faute de Node/Python
  disponibles sur la machine) : calcul en temps réel conforme à l'exemple du cahier des charges
  (V0=1L, C0=50%, Cf=30%, S=150g/L → Ve=0.509L, ms=250g, Vf=1.667L, expansion=157.5mL), presets
  fonctionnels, formule KaTeX + étapes affichées correctement, validation Cf≥C0 bloque bien le
  calcul avec message d'erreur, changement de langue FR/EN traduit toute l'interface (y compris la
  formule et l'historique déjà affichés), historique enregistré correctement, reset fonctionnel,
  responsive mobile (375px) vérifié. Mode hors-ligne (service worker) non testé en profondeur : son
  enregistrement nécessite un contexte sécurisé (http/https), non vérifiable sur `file://`.
- Prochaine étape : tester le mode hors-ligne réel (installer la PWA, couper le réseau, vérifier le
  cache) ; valider visuellement sur mobile réel ; envisager le déploiement (GitHub Pages ?) une fois
  le feu vert donné par l'utilisateur.
- Retour utilisateur : le champ "Coefficient d'expansion (k)" affichait 0.00063 L/g, illisible
  (trois zéros après la virgule). Champ converti en mL/g pour l'affichage (0.63 mL/g), conversion
  en L/g faite dans `js/app.js` juste avant l'appel à `calculateDilution`/`renderFormula` — la
  formule interne (et son affichage KaTeX) reste inchangée, en L/g, conformément à l'ADR 0002.
  Vérifié : mêmes résultats qu'avant (Ve=0.509L, ms=250g, Vf=1.667L, expansion=157.5mL) pour les
  valeurs par défaut.
- Retour utilisateur : de petites barres de défilement grises apparaissaient sur chaque ligne des
  "Étapes du calcul". Cause : `overflow-x: auto` sur `.formula-step` force la spec CSS à calculer
  `overflow-y: auto` aussi ; dès que la fraction KaTeX dépassait de peu la hauteur de la ligne, un
  ascenseur vertical apparaissait. Corrigé dans `css/styles.css` : `overflow-y: hidden` explicite,
  hauteur de ligne augmentée (`min-height`, `padding`, `line-height`), `align-items: center`.
  Vérifié dans le navigateur (SW + cache vidés au préalable pour écarter le CSS déjà en cache).
- Retour utilisateur : "Voir la formule détaillée" devait avoir le même style (gras/majuscules) que
  les titres de section ("Résultats") et un chevron d'expansion. Bouton restylé en `.formula-toggle`
  (même apparence que `.card h2/h3`) avec un chevron `▸` qui pivote à 90° (`aria-expanded='true'`)
  quand la section est ouverte. Vérifié dans le navigateur : style cohérent, rotation et changement
  de texte ("Masquer la formule") au clic.
- L'utilisateur est revenu sur ce choix : la formule déplacée dans le widget "Résultats" (après les
  boutons Réinitialiser/Copier), avec le même format que "Avancé" (élément `<details>/<summary>`
  natif, triangle de disclosure natif, texte statique). Le bouton personnalisé + chevron CSS créés à
  l'étape précédente sont retirés (code mort). `js/app.js` adapté : `els.formulaSection` (un
  `<details>`) remplace `els.formulaToggle`/`formulaWrapper` ; l'événement natif `toggle` déclenche
  le calcul/rendu de la formule à l'ouverture. Clé de traduction `formulaToggleHide` supprimée
  (devenue inutile, le texte ne change plus). Vérifié dans le navigateur.
- Ajout du splash screen demandé (roadmap v2) : animation d'ouverture "pluie Matrix" (canvas plein
  écran, `js/splash.js`), ~3s puis ralentissement progressif sur les derniers 500ms ("les caractères
  se mettent en place"), fondu croisé de 700ms vers l'interface réelle (classe `app-ready` sur
  `<body>`, contenu enveloppé dans `#appContent`). Clic/tap pour passer l'animation ; sautée
  instantanément si `prefers-reduced-motion` est actif. `sw.js` mis à jour (nouveau fichier
  précaché, cache renommé `alcoocalc-v2` pour forcer la mise à jour chez les utilisateurs existants).
  Testé dans le navigateur (desktop + mobile 375px) : rendu correct, clic-pour-passer fonctionnel,
  transition vers l'app sans erreur console. Non vérifié directement : le chemin
  `prefers-reduced-motion` (pas d'outil d'émulation disponible pour ce test) — la logique est
  simple (un `matchMedia` + retour anticipé) donc risque jugé faible.
- Amélioration du splash (demande utilisateur) : "que certaines lettres de la pluie s'arrêtent au
  bon endroit et que l'écran se construise sous les yeux de l'utilisateur". Implémenté dans
  `js/splash.js` : au démarrage, un `TreeWalker` parcourt le vrai DOM (`#appContent`, encore à
  opacity:0 mais déjà mis en page) et récupère tous les caractères de texte visibles à l'écran avec
  leur position exacte (`Range.getBoundingClientRect`), taille, casse (CSS `text-transform`) et
  couleur réelles. ~20% d'entre eux (`LOCK_RATIO`) sont tirés au sort et se "verrouillent" à un
  instant aléatoire réparti sur les 400-2700ms de la pluie (`LOCK_WINDOW`), dans un flash blanc bref
  puis leur vraie couleur ; une fois verrouillés ils sont redessinés chaque frame donc restent nets,
  contrairement aux caractères de pluie ordinaires qui continuent de s'effacer. Résultat : des
  fragments reconnaissables de l'interface (titre, "PARAMÈTRES", labels, boutons) apparaissent et se
  stabilisent au bon endroit pendant la pluie, avant le fondu final vers l'interface complète.
  Test réalisé en allongeant temporairement `RAIN_DURATION_MS` à 15s (la latence entre mes appels
  d'outils dépassait les 3s réelles, rendant l'observation impossible sinon) : capture d'écran en
  cours d'animation confirmant des fragments lisibles ("PARAMÈTRES", "Volume initial", "Effacer
  l'historique"...) bien positionnés et colorés correctement ; valeur remise à 3000 avant de committer.
- Retour utilisateur : ralentir la pluie et passer le taux de verrouillage à 40%. `LOCK_RATIO`
  0.2→0.4 et vitesse de chute réduite de moitié (`0.6*speedFactor+0.1` → `0.3*speedFactor+0.05`)
  dans `js/splash.js`. Cache PWA bump à `alcoocalc-v4`. Testé (même méthode : durée temporairement
  allongée à 15s pour observer, remise à 3000 avant commit) : rendu bien plus dense et lisible, le
  titre "AlcooCalc" apparaît presque en entier ; testé aussi avec la vraie durée de 3s pour confirmer
  que le cycle complet (pluie → app-ready) fonctionne toujours correctement.
