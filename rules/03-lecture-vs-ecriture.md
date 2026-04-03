# Règle 3 — Lecture vs écriture

## Principe général

Toutes les lectures et écritures passent par les **Route Handlers** (`route.ts`).

**Pourquoi :**
- Consistance entre le site web et l'application mobile (même API)
- Découplage : le frontend ne connaît que des URLs HTTP → séparation future frontend/backend possible
- Une seule source de vérité pour la logique métier

## Exception — Données publiques statiques (SSR / SEO)

Pour les données publiques qui ne changent pas selon l'utilisateur (ex : catégories, wilayas, options de formulaire), un accès direct au service depuis un Server Component est acceptable :

```ts
// ✅ Acceptable en Server Component — donnée statique publique
import { getOptions } from "@/lib/services/optionsService";
const options = await getOptions();
```

**Conditions :** donnée publique + ne dépend pas de la session + sert le rendu SSR/SEO.

## API de lecture pour l'application mobile

Toutes les routes de lecture exposées au site web **doivent aussi être consommables par l'app mobile**.
Concevoir les Route Handlers comme une API générique dès le départ :

```
GET  /api/annonces          → liste (web + mobile)
GET  /api/annonces/[id]     → détail (web + mobile)
POST /api/annonces          → création (web + mobile)
```

Pas de logique de rendu ou de redirect dans les Route Handlers — retourner du JSON pur.
