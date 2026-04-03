# Règle 7 — Tout nouveau MCP Server → compiler en binaire natif

Pour éviter le délai de démarrage (`bunx` télécharge le package à chaque cold start), **tout nouveau MCP Server doit être compilé en binaire natif** via Bun.

**Procédure obligatoire à chaque ajout de MCP Server :**

1. **Créer le script de build** `scripts/<nom-mcp>-js-server-to-executable.ts` :
   - Installe le package localement si absent
   - Détecte l'OS (`process.platform`)
   - Compile pour l'OS courant uniquement via `bun build --compile`
   - Windows → `.claude/bin/<nom-mcp>.exe`
   - Linux  → `.claude/bin/<nom-mcp>-linux`

2. **Créer le script runner** `scripts/<nom-mcp>-runner.ts` :
   - Vérifie si le binaire existe → l'exécute directement
   - Sinon → fallback sur `bunx <package>` (dégradé automatique)

3. **Mettre à jour `.mcp.json`** :
   ```json
   {
     "command": "bun",
     "args": ["scripts/<nom-mcp>-runner.ts"],
     "env": { ... }
   }
   ```

4. **Ajouter le script npm** dans `package.json` :
   ```json
   "<nom-mcp>:build": "bun scripts/<nom-mcp>-js-server-to-executable.ts"
   ```

5. **Exécuter le build** : `bun run <nom-mcp>:build`

6. **Vérifier que `.claude/bin/` est dans `.gitignore`** (les binaires ne sont pas versionnés).

> ⚡ Gain de temps : démarrage ~100ms au lieu de 5-30s avec bunx.
