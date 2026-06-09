# Métabo

Prototype local React/Vite pour visualiser les phases métaboliques d’un jeûne à partir de l’heure du dernier repas.

## Ce que fait l’app

- démarre un jeûne "maintenant" ou depuis une date/heure personnalisée
- calcule le temps écoulé en continu
- affiche la phase métabolique estimée
- propose trois vues : `Accueil`, `Timeline`, `Apprendre`
- persiste localement l’heure de départ via `localStorage` (`metabo.startTime`)

## Stack

- React 19
- Vite 8
- ESLint
- tests Node natifs pour la logique métier

## Lancer le projet

Version Node attendue pour ce projet : `24.11.1`.

```bash
nvm use
npm install
npm run dev
```

Puis ouvrir l’URL affichée par Vite.

## Scripts utiles

```bash
npm run dev      # développement local
npm run test     # tests de logique métier
npm run lint     # lint JS/React
npm run build    # build de production
npm run preview  # prévisualiser la build
```

## Structure actuelle

```text
src/
  components/metabo/
    HomeScreen.jsx
    TimelineScreen.jsx
    LearnScreen.jsx
    styles.js
  data/
    metaboPhases.js
  lib/
    metaboState.js
  metabo_2.jsx
  main.jsx

tests/
  metabo-state.test.mjs
```

## Notes

- `src/main.jsx` pointe actuellement vers `src/metabo_2.jsx`.
- L’app est un prototype local, sans backend.
- Ce projet ne fournit pas de conseil médical.
- Le projet fournit `.nvmrc` et `.node-version` pour pinner Node `24.11.1`.
- La contrainte minimale déclarée dans `package.json` est `>= 22.12.0`.
