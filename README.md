# AlcooCalc

Calculateur local de dilution alcool + sucre — pensé pour la macération/liquoristerie maison
(ex. limoncello, liqueurs infusées) : à partir d'un volume d'alcool à un degré donné, calcule
l'eau et le sucre à ajouter pour atteindre un degré et une concentration en sucre cibles, en
tenant compte de l'expansion de volume causée par le sucre dissous.

## Fonctionnalités

- Calcul en temps réel (eau à ajouter, sucre à ajouter, volume final, expansion due au sucre)
- Presets pour 11 alcools courants (gin, vodka, rhum, whisky, absinthe, limoncello, amaretto,
  cognac, tequila, eau-de-vie, liqueur) ou saisie personnalisée
- Formule détaillée (rendu KaTeX) avec étapes de calcul substituées
- Historique des 10 derniers calculs, inputs et préférences sauvegardés (localStorage)
- Bilingue FR/EN
- Thème "terminal mainframe" (vert Matrix sur fond noir), responsive mobile-first
- PWA installable, fonctionne hors-ligne (service worker)

## Stack technique

- HTML5 / CSS3 / JavaScript vanilla (aucun framework, aucune dépendance de build)
- [KaTeX](https://katex.org/) 0.16.9 (fourni en local dans `js/katex/`, aucun CDN requis)
- PWA : `manifest.json` + `sw.js`
- `localStorage` pour la persistance (inputs, historique, langue)

## Utiliser l'application

L'app est un site 100% statique — aucune installation ni build nécessaire.

**Le plus simple : ouvrir `index.html` directement dans un navigateur** (double-clic). Les
calculs, l'historique et le changement de langue fonctionnent normalement.

**Pour tester le mode hors-ligne (PWA)**, un service worker ne s'enregistre pas sur `file://` :
il faut servir les fichiers via un petit serveur local, par exemple :

```bash
npx serve .
# ou
python -m http.server 8080
```

Si ni Node ni Python ne sont installés, un petit serveur statique en PowerShell est fourni :

```powershell
powershell -File scripts\serve.ps1 -Port 8123
```

puis ouvrir `http://localhost:<port>/` dans le navigateur.

## Formules

Voir [`js/formulas.js`](js/formulas.js) et [`docs/decisions/0002-formule-dilution-sucre.md`](docs/decisions/0002-formule-dilution-sucre.md)
pour le détail du modèle physique retenu (conservation de l'alcool pur + expansion volumique du sucre).

## Licence

MIT
