---
title: "ADR 0003 — Déploiement sur GitHub Pages"
status: accepted
last-reviewed: 2026-09-07
sources: []
tags: [decision, deploiement]
---

# ADR 0003 — Déploiement sur GitHub Pages

## Statut
Accepted — 2026-09-07

## Contexte
L'utilisateur voulait tester l'application sur son smartphone via une URL, avec un vrai contexte
HTTPS pour pouvoir tester l'installation PWA et le mode hors-ligne (non testables sur `file://` ni
sur une IP locale en `http://`).

## Décision
- Hébergement sur **GitHub Pages**, déploiement depuis la branche `main`, dossier `/` (racine) —
  aucune étape de build nécessaire, l'app étant 100% statique (HTML/CSS/JS vanilla).
- URL : **https://robjbee.github.io/AlcooCalc/**
- Le dépôt GitHub, initialement privé, a été rendu **public** par l'utilisateur. Ce n'était pas
  strictement nécessaire (GitHub Pages publie le site construit sur une URL publique même depuis un
  dépôt privé, sauf sur GitHub Enterprise), mais c'est le choix fait.
- Chaque `git push` sur `main` redéploie automatiquement le site.

## Conséquences
- Le site (et donc l'app) est accessible publiquement par quiconque a le lien.
- Le code source, l'historique des commits et la documentation (JOURNAL, ROADMAP, ADR) sont
  également publics puisque le dépôt lui-même est public.
- Aucune donnée utilisateur n'est concernée (l'app ne stocke rien côté serveur, tout reste en
  `localStorage` du navigateur du visiteur) — le risque de cette publicité est jugé faible.
