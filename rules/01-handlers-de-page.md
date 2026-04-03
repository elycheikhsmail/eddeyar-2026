# Règle 1 — Handlers de page

Chaque handler dans `page.handlers/` suit cette structure :

```
handleXxx.interface.ts   # Types / interfaces
handleXxx.mocked.ts      # Version mockée (à compléter en premier)
handleXxx.real.ts        # Version production
handleXxx.ts             # Export principal (switch mock/real)
data.json                # Données simulées
```
