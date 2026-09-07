---
title: "ADR 0002 — Formule de dilution alcool + sucre"
status: accepted
last-reviewed: 2026-09-07
sources: []
tags: [decision, formule, calcul]
---

# ADR 0002 — Formule de dilution alcool + sucre

## Statut
Accepted — 2026-09-07

## Contexte
Le calculateur doit déterminer l'eau et le sucre à ajouter à un volume d'alcool pour atteindre un
degré et une concentration en sucre cibles, en tenant compte du fait que le sucre dissous augmente
le volume total. L'utilisateur a fourni la documentation complète du modèle physique à utiliser.

## Décision
Modèle retenu, tel que spécifié :

1. **Conservation de l'alcool pur** : `C0 × V0 = Cf × Vf` → `Vf = (C0 × V0) / Cf`
2. **Sucre visé dans le volume final** : `ms = S × Vf`
3. **Expansion due au sucre dissous** (coefficient `k`, en L/g) : `Vexp = k × ms`
4. **Eau à ajouter** (bilan volumétrique `Vf = V0 + Ve + Vexp`) : `Ve = Vf − V0 − Vexp`

Formule combinée : `Ve = V0 × (C0/Cf − 1 − k × S × C0/Cf)`

Validations : `Cf < C0` (impossible d'augmenter le degré en ajoutant de l'eau), toutes les valeurs
strictement positives (sauf `S` qui peut être 0 → pas de sucre, `Vexp = 0`), et rejet si `Ve < 0`
(combinaison physiquement impossible : trop de sucre pour l'écart de dilution demandé).

Valeur par défaut de `k` : `0.00063 L/g` (1 kg de sucre dissous ⇒ +0,63 L), ajustable dans la
section "Avancé" (0.0001 à 0.001 L/g).

Implémenté dans [`js/formulas.js`](../../js/formulas.js).

## Conséquences
- Le calcul est déterministe et ne dépend d'aucune donnée externe.
- Si l'expansion du sucre doit un jour être modélisée plus finement (ex. non-linéaire selon la
  concentration), ce sera un nouvel ADR qui remplacera celui-ci.
