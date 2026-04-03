# Règle 4 — Mock avant prod

## Principe

Toujours compléter la **version mockée** avant d'implémenter la version réelle.

**Pourquoi :**
- L'AI (et le développeur) peut construire et valider l'UI sans dépendre d'une DB prête
- Le switch mock/real dans `handleXxx.ts` est simple et prévisible
- Permet de travailler en parallèle sur le frontend et le backend

## Discipline obligatoire — le mock doit typer comme le réel

Le mock doit toujours implémenter **exactement** le même type que la version réelle, défini dans `.interface.ts`.

```ts
// handleXxx.interface.ts
export interface HandleXxxResult {
  items: Annonce[];
  total: number;
}

// handleXxx.mocked.ts  ✅ — respecte l'interface
import type { HandleXxxResult } from "./handleXxx.interface";
export async function handleXxxMocked(): Promise<HandleXxxResult> {
  return { items: [...], total: 2 };
}

// handleXxx.real.ts  ✅ — même interface
import type { HandleXxxResult } from "./handleXxx.interface";
export async function handleXxxReal(): Promise<HandleXxxResult> {
  // appel API / DB
}
```

**Si le type change dans `.interface.ts`, mettre à jour mock ET réel immédiatement.**
Un mock qui diverge du réel est une dette silencieuse — le TypeScript doit casser si le mock est désynchronisé.

## Switch mock / réel

```ts
// handleXxx.ts
import { handleXxxMocked } from "./handleXxx.mocked";
import { handleXxxReal } from "./handleXxx.real";

export const handleXxx =
  process.env.NODE_ENV === "development" ? handleXxxMocked : handleXxxReal;
```

## Règles liées

- **Règle 1** — la structure des fichiers (`interface.ts`, `mocked.ts`, `real.ts`) est définie dans la règle 1
- `.interface.ts` est le contrat entre mock et réel — c'est lui qui garantit la cohérence
