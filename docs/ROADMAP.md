---
title: Roadmap du projet
status: actif
last-reviewed: 2026-09-07
sources: []
tags: [roadmap]
---

# Roadmap — AlcooCalc (calculateur de dilution alcool + sucre)

## ✅ Fait
- Dossier de projet créé, dépôt git local initialisé, relié à `RobJBee/AlcooCalc` (privé) et premier
  commit poussé.
- Mémoire de projet mise en place (AGENTS.md, JOURNAL/ROADMAP/DECISIONS + ADR 0001 et 0002).
- Cahier des charges complet reçu et implémenté : calculateur de dilution alcool + sucre (conservation
  de l'alcool pur, sucre cible, expansion volumique du sucre), 11 presets d'alcools, formule détaillée
  avec rendu KaTeX et étapes substituées, historique des 10 derniers calculs, copier dans le
  presse-papiers, i18n FR/EN persistant, thème "terminal mainframe" responsive (320px→1920px), PWA
  (manifest + service worker, KaTeX vendored en local pour un usage 100% hors-ligne).
- Testé dans le navigateur (via un petit serveur local `scripts/serve.ps1`) : calculs conformes à
  l'exemple de référence du cahier des charges, presets, validation, i18n, historique, reset et
  responsive mobile tous fonctionnels.

## 🔜 À faire
- Vérifier le mode hors-ligne réel (installation PWA, coupure réseau) — nécessite un contexte
  sécurisé (https ou localhost), pas testable sur simple `file://`.
- Test visuel sur un téléphone réel (au-delà de l'émulation mobile du navigateur).
- Décider d'un éventuel déploiement (ex. GitHub Pages) — à faire seulement sur feu vert explicite.

## 💬 À trancher
- Portée exacte de l'historique en localStorage (actuellement : 10 derniers calculs, sans limite de
  durée) — suffisant ou faut-il purger après un certain temps ?
- Faut-il des icônes PWA soignées (actuellement des placeholders générés "AC" sur fond noir/vert) ?

## 🔮 v2 — Pistes UX (validées par l'utilisateur le 2026-09-07)
- **Résultat "collant" sur mobile** : un résumé compact (eau/sucre) reste visible en bas d'écran
  pendant qu'on ajuste les sliders, pour éviter l'aller-retour de scroll entre paramètres et résultats.
- **Historique cliquable** : cliquer sur une entrée recharge ces valeurs dans les champs ; ajouter
  aussi la suppression d'une entrée individuelle (pas seulement "Effacer tout").
- **Aide contextuelle (?)** : petites infobulles expliquant les champs moins évidents ("Sucre visé",
  "Coefficient d'expansion").
- **Accessibilité + erreurs visibles** : `aria-live` pour que les lecteurs d'écran annoncent le
  résultat après un changement ; surligner en rouge le champ fautif (ex. "Alcool cible") en cas
  d'erreur, en plus du message déjà affiché.
- ✅ **Splash screen au lancement** : implémenté — pluie Matrix (canvas) ~3s, ralentissement puis
  fondu vers l'interface, clic pour passer, sauté si `prefers-reduced-motion`. Voir
  [`js/splash.js`](../js/splash.js).
