# Règle 8 — Handlers de route (API)

Chaque Route Handler dans `app/api/` délègue sa logique à un dossier `route.handlers/` :

```
route.ts                         # Slim : parse req → appelle handler → retourne NextResponse
route.handlers/
  handleXxx.interface.ts         # Types / interfaces (payload entrant + réponse)
  handleXxx.mocked.ts            # Version mockée (à compléter en premier)
  handleXxx.real.ts              # Version production (logique métier, DB)
  handleXxx.ts                   # Export principal (switch mock/real)
  data.json                      # Données simulées pour le mock
```

## Responsabilité de chaque fichier

| Fichier | Rôle |
|---|---|
| `route.ts` | Parse la requête, appelle le handler, sérialise en `NextResponse` |
| `handleXxx.interface.ts` | Contrat TypeScript : types du payload et du résultat |
| `handleXxx.mocked.ts` | Implémentation mockée — même signature que le réel |
| `handleXxx.real.ts` | Implémentation production — accès DB, services externes |
| `handleXxx.ts` | Switch `development → mocked / production → real` |

## Exemple — `GET /api/annonces`

### `route.ts` (slim)
```ts
import { NextRequest, NextResponse } from "next/server";
import { handleGetAnnonces } from "./route.handlers/handleGetAnnonces";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await handleGetAnnonces({
    page: searchParams.get("page") ?? undefined,
    categorieId: searchParams.get("categorieId") ?? undefined,
  });
  return NextResponse.json(result);
}
```

### `route.handlers/handleGetAnnonces.interface.ts`
```ts
export interface HandleGetAnnoncesInput {
  page?: string;
  categorieId?: string;
}

export interface HandleGetAnnoncesResult {
  items: Annonce[];
  total: number;
}
```

### `route.handlers/handleGetAnnonces.mocked.ts`
```ts
import type { HandleGetAnnoncesInput, HandleGetAnnoncesResult } from "./handleGetAnnonces.interface";
import data from "./data.json";

export async function handleGetAnnoncesMocked(
  _input: HandleGetAnnoncesInput
): Promise<HandleGetAnnoncesResult> {
  return { items: data.annonces, total: data.annonces.length };
}
```

### `route.handlers/handleGetAnnonces.real.ts`
```ts
import type { HandleGetAnnoncesInput, HandleGetAnnoncesResult } from "./handleGetAnnonces.interface";
import { getAnnonces } from "@/lib/services/annoncesService";

export async function handleGetAnnoncesReal(
  input: HandleGetAnnoncesInput
): Promise<HandleGetAnnoncesResult> {
  return getAnnonces(input);
}
```

### `route.handlers/handleGetAnnonces.ts`
```ts
import { handleGetAnnoncesMocked } from "./handleGetAnnonces.mocked";
import { handleGetAnnoncesReal } from "./handleGetAnnonces.real";

export const handleGetAnnonces =
  process.env.NODE_ENV === "development"
    ? handleGetAnnoncesMocked
    : handleGetAnnoncesReal;
```

## Règles strictes

- `route.ts` ne contient **pas** de logique métier ni d'accès DB.
- `route.ts` ne retourne que du JSON (`NextResponse.json`) — jamais de redirect.
- Le mock implémente **exactement** le même type que le réel (défini dans `.interface.ts`).
- Compléter le **mock en premier**, le réel ensuite (voir Règle 4).

## Règles liées

- **Règle 1** — même structure (interface / mocked / real) appliquée aux handlers de page
- **Règle 3** — toutes les lectures/écritures passent par les Route Handlers
- **Règle 4** — mock avant prod ; le `.interface.ts` est le contrat commun
