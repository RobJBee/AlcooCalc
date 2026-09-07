---
title: "ADR 0001 — Stack technique"
status: accepted
last-reviewed: 2026-09-07
sources: []
tags: [decision, stack]
---

# ADR 0001 — Stack technique

## Statut
Accepted — 2026-09-07

## Contexte
AlcooCalc doit fonctionner 100% en local (pas de backend), être installable/offline (PWA), afficher des
formules mathématiques lisibles, et rester simple à maintenir.

## Décision
- **HTML5 / CSS3 / JavaScript vanilla** — pas de framework, tout le code s'exécute côté client.
- **KaTeX** — rendu des formules mathématiques (via CDN ou copie locale).
- **PWA** — `manifest.json` + service worker pour le fonctionnement hors-ligne.
- **localStorage** — sauvegarde des entrées, de l'historique et des préférences (langue, thème).
- Interface bilingue FR/EN, design mobile-first, thème "terminal mainframe" (vert Matrix sur fond noir).

## Conséquences
- Aucune dépendance serveur : hébergeable comme site statique (GitHub Pages, etc.).
- Pas de build step nécessaire (sauf éventuellement pour vendorer KaTeX en local pour un offline garanti).
- Pour changer cette décision : écrire un nouvel ADR et marquer celui-ci « superseded ».
