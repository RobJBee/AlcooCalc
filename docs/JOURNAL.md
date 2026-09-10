---
title: Journal du projet
status: actif
last-reviewed: 2026-09-10
sources: []
tags: [journal]
---

# Journal — AlcooCalc

## 2026-09-10
- Fait : transfert complet du dépôt GitHub du compte `RobJBee` vers le nouveau compte
  `gLOrFinDeV` (transfert d'ownership natif GitHub, effectué par l'utilisateur via Settings →
  Danger Zone → Transfer ownership). Historique et commits conservés.
- Fait : remote git local mis à jour (`origin` pointe maintenant vers
  `https://github.com/gLOrFinDeV/AlcooCalc.git`), connectivité vérifiée (`git fetch`). GitHub
  Pages vérifié fonctionnel sous la nouvelle URL **https://glorfindev.github.io/AlcooCalc/**.
- Fait : mise à jour des mentions de l'ancienne URL dans `docs/ROADMAP.md` et
  `docs/decisions/0003-deploiement-github-pages.md`. Les entrées de journal antérieures au
  transfert ne sont pas réécrites (journal append-only) ; elles mentionnent encore `RobJBee` par
  fidélité historique.
- Contexte : en amont, l'utilisateur a cherché à connecter son smartphone à cette session Claude
  Code via Remote Control et a rencontré l'erreur "Remote control session is offline" ; clarifié
  que Remote Control projette la session tournant sur le PC (qui doit rester allumé/connecté) et
  n'est pas une session cloud indépendante — aucune action de code liée à ce point.

## 2026-09-07 (suite 2)
- Fait : uniformisation du champ "Volume final" (ex-"Volume cible") avec les autres paramètres, à
  la demande de l'utilisateur : ajout d'un slider synchronisé (comme V₀/C₀/C_f/S), champ nombre
  réduit et aligné à droite (retour au layout `field__controls` standard au lieu d'un champ pleine
  largeur), libellé simplifié en "Volume final" (FR) / "Final volume" (EN), sans changement de
  logique de calcul.
- Implémentation : `syncPairOptional()` (`js/app.js`) synchronise slider ↔ champ nombre en gérant
  le cas où le champ est vidé (le slider conserve alors sa dernière position, sans forcer de valeur
  invalide). Cache PWA bumpé à `alcoocalc-v11`.
- Testé dans le navigateur : glisser le slider active bien le calcul inverse (V₀ grisé/recalculé),
  vider le champ nombre réactive V₀ ; traduction EN vérifiée.

## 2026-09-07 (suite)
- Fait : ajout du paramètre optionnel "Volume cible (V_f)" dans la section Paramètres, à la
  demande de l'utilisateur ("la prochaine fois nous mettrons en œuvre la roadmap pour la v2 ;
  ajoute une feature à laquelle je viens de penser : ajouter un Paramètre 'Volume cible'").
- Décidé (via AskUserQuestion) : le champ est optionnel et, une fois renseigné, **remplace** V₀
  dans le calcul plutôt que de proposer un mode bascule séparé — option choisie par l'utilisateur
  parmi 3 propositions.
- Implémentation : `compute()` (`js/app.js`) calcule V₀ requis = Vf_cible × C_f / C₀ dès que le
  champ cible est un nombre fini > 0 (et C₀ > 0) ; le champ/slider V₀ est alors désactivé
  (`disabled`, classe `.is-computed`) et affiche cette valeur calculée. Vider le champ cible
  réactive V₀ (dernière valeur calculée conservée comme point de départ éditable). Les étapes de
  calcul détaillées (KaTeX) et l'historique utilisent bien le V₀ effectif (calculé ou saisi).
  i18n FR/EN ajoutée (`labelVfTarget`, `vfTargetHint`). Cache PWA bumpé à `alcoocalc-v10`.
- Testé dans le navigateur : remplissage du volume cible → V₀ recalculé et champ grisé ; effacement
  → V₀ redevient éditable ; résultats, étapes de formule et historique cohérents ; traduction EN
  vérifiée.

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
- Retour utilisateur (travail sur la transition) : (1) privilégier les caractères à droite de
  l'écran lors du tirage des verrouillages (proportionnellement moins nombreux) ; (2) démarrer le
  fondu-enchaîné dès que la pluie commence à ralentir (plutôt qu'après la fin complète), avec une
  transition 50% plus longue, l'app apparaissant en transparence pendant que la pluie (qui continue
  de tourner/ralentir) disparaît aussi en transparence. Implémenté dans `js/splash.js` :
  - Tirage pondéré sans remise (algorithme A-Res, poids = `1 + xRatio*RIGHT_BIAS` avec
    `RIGHT_BIAS=3`) au lieu d'un tirage uniforme, pour favoriser les caractères à x élevé.
  - Timeline restructurée : `PRE_SLOWDOWN_MS` (2500ms, pluie normale) → au-delà, ralentissement
    (`SLOWDOWN_MS`=500ms) ET déclenchement simultané du fondu (`startFade()`, avant seulement
    appelé en toute fin) ; la boucle d'animation continue de tourner (pluie visible à travers le
    fondu) jusqu'à la fin du fondu, pas seulement jusqu'à la fin de la pluie. `FADE_MS` 700→1050ms
    (+50%), durée de transition CSS mise à jour en conséquence dans `css/styles.css`
    (`.app-content`/`.splash`). `LOCK_WINDOW` resserré à `[400, PRE_SLOWDOWN_MS-100]` pour que tous
    les verrouillages soient résolus avant le début du fondu. Cache PWA bump à `alcoocalc-v5`.
  - Testé (durée temporairement allongée à 15s, remise à 2500 avant commit) : répartition des
    verrouillages bien étalée sur toute la largeur ; capture en plein fondu confirmant que l'app
    apparaît bien en transparence par-dessus la pluie encore visible et en mouvement. Testé aussi
    avec les vraies durées : cycle complet sans erreur console.
- Déploiement : l'utilisateur a activé GitHub Pages (Settings → Pages → Deploy from branch `main`,
  dossier `/`). Site en ligne et vérifié fonctionnel sur `https://robjbee.github.io/AlcooCalc/`
  (service worker bien enregistré, HTTPS oblige — contrairement aux tests locaux sur `file://` ou
  IP LAN, le mode hors-ligne/PWA est donc pleinement testable en conditions réelles, y compris
  depuis un smartphone). Le dépôt GitHub a aussi été rendu public par l'utilisateur (Pages n'exige
  pas la visibilité publique du dépôt, mais c'est son choix).
- Retour utilisateur (desktop ≥1024px) : (1) les champs numériques affichaient les flèches natives
  du navigateur sous forme d'un bloc gris disgracieux ("ascenseurs") ; (2) déséquilibre visuel entre
  les colonnes "Paramètres"/"Résultats" ; (3) déplacer "Alcool de base" sous "Paramètres", aligné
  avec "Historique". Corrigé :
  - `css/styles.css` : flèches natives des `input[type=number]` masquées (`appearance: textfield` +
    reset des pseudo-éléments WebKit `::-webkit-inner/outer-spin-button`) — redondantes avec le
    slider, et rendues de façon incohérente selon navigateur/OS.
  - Grille desktop remplacée par un `grid-template-areas` explicite (2×2 : Paramètres/Résultats en
    haut, Alcool de base/Historique en bas), avec des classes dédiées (`card--params`,
    `card--presets`, `card--results`, `card--history`) au lieu des sélecteurs `nth-child` fragiles
    utilisés avant (qui comptaient mal les enfants à cause du `<p id="errorBox">` intercalé). Comme
    les deux colonnes partagent les mêmes pistes de ligne (row tracks) en CSS Grid, "Alcool de base"
    et "Historique" s'alignent automatiquement sans hack supplémentaire — l'ordre du DOM (donc le
    flux mobile) reste inchangé, seul l'ordre visuel change en desktop.
  - Cache PWA bump à `alcoocalc-v6`. Testé en 1200×900 (desktop) et 375×812 (mobile) : mise en page
    correcte dans les deux cas, aucune flèche native visible, aucune erreur console.
- Retour utilisateur : les cartes ne remplissaient pas la hauteur de leur ligne (Résultats restait
  plus petit que Paramètres, Alcool de base plus petit qu'Historique, malgré le partage de la même
  piste de ligne CSS Grid) — cause : `align-items: start` sur `.app-main` empêchait les cartes de
  s'étirer. Passé à `align-items: stretch` (comportement par défaut de CSS Grid) : les cartes
  remplissent maintenant toute la hauteur de leur ligne. Vérifié par mesure directe des hauteurs
  (`getBoundingClientRect`) : Paramètres/Résultats = 397px chacun, Alcool de base/Historique = 108px
  chacun, parfaitement alignés. Titre "Alcool de base" aligné visuellement sur le style des autres
  titres de section (nouvelle classe partagée `.card-title`, appliquée au `<label>` en plus des
  règles existantes sur `.card h2/h3`). Cache PWA bump à `alcoocalc-v7`. Testé desktop (1200×900) et
  mobile (375×812) : rendu correct, aucune régression, aucune erreur console.
- Retour utilisateur (capture à l'appui) : le titre "Alcool de base" n'apparaissait pas en gras
  malgré la classe `.card-title`. Cause : le gras de `h2`/`h3` vient du style par défaut du
  navigateur (jamais déclaré explicitement dans la règle CSS partagée), donc le `<label>` n'en
  hérite pas — de même pour la marge basse (headings ont une marge par défaut, pas les labels),
  ce qui écrasait aussi la lisibilité de la ligne pointillée. Ajout explicite de `font-weight: bold`
  et `margin-bottom: 0.6rem` à la règle `.card h2, .card h3, .card-title`. Cache PWA bump à
  `alcoocalc-v8`. Vérifié dans le navigateur : titre "ALCOOL DE BASE" désormais identique en gras
  aux autres titres de section.
- Retour utilisateur : passer le texte des options du menu "Alcool de base" en blanc, et le
  surlignage (actuellement bleu, natif du navigateur) en vert. Ajout de règles `.terminal-select
  option` (texte blanc) et `option:checked`/`:hover` (fond vert) dans `css/styles.css`. Testé dans
  le navigateur : le texte blanc s'applique bien, mais le surlignage reste bleu — limitation connue
  des navigateurs Chromium (Chrome/Edge, y compris Chrome Android) : la couleur de l'option
  survolée/en cours de sélection dans la liste déroulante native est dessinée par le navigateur et
  ignore `background-color` en CSS, quel que soit le sélecteur utilisé. Vraie solution : remplacer
  le `<select>` natif par un menu déroulant personnalisé (bouton + liste stylée). Proposé à
  l'utilisateur, qui a choisi de garder le natif tel quel (texte blanc conservé, surlignage bleu
  accepté). Cache PWA bump à `alcoocalc-v9`.
