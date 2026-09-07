---
title: Roadmap du projet
status: actif
last-reviewed: 2026-09-07
sources: []
tags: [roadmap]
---

# Roadmap — AlcooCalc (calculateur de dilution alcool + sucre)

## ✅ Fait
- Dossier de projet créé, dépôt git local initialisé.
- Mémoire de projet mise en place (AGENTS.md, JOURNAL/ROADMAP/DECISIONS).
- Cadrage initial reçu : stack (HTML/CSS/JS vanilla, KaTeX, PWA, localStorage), thème visuel
  (terminal mainframe, vert Matrix sur fond noir), bilingue FR/EN, mobile-first.

## 🔜 À faire
- Recevoir la suite du cahier des charges : formules exactes de dilution alcool (titre alcoométrique
  cible) et de sucre (Brix / g/L / sirop), champs d'entrée et de sortie attendus, éventuelle maquette UI.
- Créer le dépôt GitHub privé `RobJBee/AlcooCalc` et pousser le premier commit.
- Scaffolding de l'application (structure HTML/CSS/JS, manifest.json + service worker PWA, intégration
  KaTeX, i18n FR/EN, thème terminal mainframe).
- Implémenter le calculateur (formules) une fois le cahier des charges complet.
- Tester en conditions réelles (mobile + desktop, mode offline).

## 💬 À trancher
- Formules exactes de dilution + sucre : en attente de la suite du cahier des charges.
- Portée exacte de l'historique en localStorage (juste les derniers calculs ? préférences de langue/thème ?).
