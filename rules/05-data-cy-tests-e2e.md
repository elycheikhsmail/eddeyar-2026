# Règle 5 — Attributs `data-cy` pour les tests E2E

Tout élément jouant un rôle dans un test E2E (bouton, lien, input, carte cliquable…) doit porter un attribut `data-cy` unique et descriptif.

```tsx
// ✅ correct
<button data-cy="btn-submit">Envoyer</button>
<input  data-cy="input-phone" />
<article data-cy="annonce-item">...</article>

// ❌ incorrect — sélecteur fragile, cassé dès qu'on change le texte ou la classe
<button className="btn-primary">Envoyer</button>
```

**Règles :**
- Utiliser `data-cy` (et non `id` ou `data-testid`) — convention du projet
- Nommer en kebab-case : `btn-submit`, `input-phone`, `annonce-item`
- N'ajouter `data-cy` **que** sur les éléments utiles aux tests — pas sur tout le DOM
- Les sélecteurs `data-cy` existants sont listés en tête de `tests/testsprite.spec.ts`
