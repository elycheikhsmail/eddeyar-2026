# AGENT.md — Agents IA pour Eddeyar

Guide d'intégration et d'utilisation des agents IA externes pour accélérer le développement du projet Eddeyar.

---

## Agents IA disponibles

### 1. **Claude** (Anthropic)
Agent principal recommandé pour ce projet.

| Aspect | Détail |
|---|---|
| **Modèles** | Claude Opus 4.6, Claude Sonnet 4.6, Claude Haiku 4.5 |
| **Cas d'usage** | Refactoring, architecture, tests, documentation, debugging complexe |
| **Accès** | Claude Code (CLI), claude.ai/code (web), VS Code extension |
| **Avantages** | Excellente compréhension des patterns, respect des conventions de code |
| **Limitations** | Coûteux pour les gros volumes de refactoring en parallèle |

**Configuration minimale :**
```bash
# Vérifier CLAUDE.md et rules/ pour les conventions de code
# Exécuter avec : claude code
```

---

### 2. **Codex** (OpenAI — Déprécié)
⚠️ **Statut : Retiré par OpenAI en 2022**. Remplacé par GPT-4 / GPT-4o.

Si vous cherchez une alternative OpenAI :
- **GPT-4o** : Meilleur choix actuel (multimodal, reasoning)
- **GPT-4 Turbo** : Alternative rapide et moins coûteuse

---

### 3. **GitHub Copilot**
Autocomplétion et génération de code dans l'IDE.

| Aspect | Détail |
|---|---|
| **Cas d'usage** | Autocomplétion, stub de fonctions, boilerplate, tests unitaires |
| **Accès** | VS Code extension, JetBrains IDE |
| **Avantages** | Contexte local, latence faible, gratuit avec GitHub Pro |
| **Limitations** | Pas de refactoring à grande échelle, pas de compréhension d'architecture globale |

**Utilisation :**
```bash
# 1. Installer l'extension GitHub Copilot
# 2. Se connecter avec compte GitHub
# 3. Utiliser Ctrl+Shift+A (vs code) pour les suggestions
```

**Prompts recommandés :**
```
# Dans un fichier route.ts
// Créer une fonction handleGetAnnonces qui...
// Copilot complète automatiquement

# Dans un composant
export function MyComponent() {
  // Copilot suggère les hooks et patterns connus
}
```

---

### 4. **Grok** (xAI)
Agent multimodal avec accès web (temps réel).

| Aspect | Détail |
|---|---|
| **Cas d'usage** | Recherche API, documentation récente, debugging avec contexte web |
| **Accès** | grok.com, API xAI |
| **Avantages** | Accès internet, connaissance récente des librairies |
| **Limitations** | Moins mature pour l'architecture complexe |

**Quand l'utiliser :**
- Chercher les dernières versions de librairies
- Déboguer des erreurs liées aux dépendances externes
- Valider la syntaxe React/Next.js récente

---

### 5. **Gemini** (Google)
Agent multimodal (texte, images, code).

| Aspect | Détail |
|---|---|
| **Cas d'usage** | Analyse d'images d'architecture, review de PR visuels, documentation |
| **Accès** | gemini.google.com, Google Cloud API |
| **Avantages** | Multimodal (captures d'écran), gratuit (limitations) |
| **Limitations** | Moins fiable pour le code TypeScript complexe |

**Utilisation :**
```bash
# Utile pour :
# - Analyser des screenshots d'erreur (console, logs)
# - Vérifier des mockups UI
# - Générer du texte pour la documentation
```

---

### 6. **LLaMA / Ollama** (Open Source)
Modèles open-source exécutables localement.

| Aspect | Détail |
|---|---|
| **Cas d'usage** | Code local, pas d'envoi de données, modèles gratuits |
| **Accès** | ollama.ai (CLI local) |
| **Avantages** | Privacy, gratuit, pas de latence réseau pour API local |
| **Limitations** | Moins puissant que Claude/GPT-4, setup complexe |

**Setup :**
```bash
# 1. Installer Ollama : ollama.ai
# 2. Télécharger un modèle : ollama pull mistral
# 3. Lancer : ollama serve
# 4. Utiliser via API locale :8000
```

---

## Matrice de sélection

### Par type de tâche

| Tâche | Claude | Copilot | Grok | Gemini | LLaMA |
|---|---|---|---|---|---|
| **Refactoring architecture** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| **Autocomplétion code** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ |
| **Tests E2E** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ |
| **Debugging** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| **Documentation** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Recherche API récente** | ⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |

---

## Intégration multi-agent

### Workflow recommandé pour Eddeyar

```
┌─────────────────────────────────────────────────────┐
│ Démarrer une feature / bug fix                      │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │ Chercher doc API ?  │
        └──────┬───────┬──────┘
               │ Oui   │ Non
               │       │
         ┌─────▼──┐  ┌─▼─────────────┐
         │  Grok  │  │ Claude (arch) │
         │(5 min) │  │  (15-30 min)  │
         └─────┬──┘  └─┬─────────────┘
               │       │
        ┌──────▼───────▼──────────┐
        │ Implémenter le code     │
        │ Copilot + Claude Code   │
        └──────┬──────────────────┘
               │
        ┌──────▼───────────────────┐
        │ Tests E2E / Debug        │
        │ Claude Code + Gemini(*) │
        │ (*) si screenshots       │
        └──────┬──────────────────┘
               │
        ┌──────▼──────────────────┐
        │ Documenter              │
        │ Claude (draft) + Grok   │
        │ (vérifier liens récents)│
        └──────────────────────────┘
```

---

## Cas d'usage par agent

### Claude — Refactoring `app/api/`
```bash
# Situation : Refactorer 10 routes avec la règle 08 (handler-de-router)

# 1. Demander à Claude via Claude Code
"Implémenter la règle 08 (handler-de-router) sur
 app/api/annonces/, app/api/my/annonces/, etc."

# 2. Claude comprend les conventions et applique le pattern
# 3. Résultat : Code typé, interfaces cohérentes, mocks et réel

# ⏱️ Temps : 30 min pour 10 routes (vs 4-5h en manuel)
```

### Copilot — Complétion de mock data
```typescript
// Dans route.handlers/handleGetAnnonces.mocked.ts
import type { HandleGetAnnoncesResult } from "./handleGetAnnonces.interface";

export async function handleGetAnnoncesMocked(): Promise<HandleGetAnnoncesResult> {
  // Copilot suggère automatiquement :
  // return {
  //   items: [
  //     { id: "1", titre: "Maison à Nouakchott", ... },
  //     { id: "2", titre: "Appartement à Atar", ... },
  //   ],
  //   total: 2,
  // };
}

// ⏱️ Temps : 2 min vs 10 min en manuel
```

### Grok — Vérifier la dernière version de Vercel Blob
```
"Quelle est la dernière API Vercel Blob pour uploader
 des images ? J'utilise Next.js 16 et Bun."

Réponse → Code example frais, liens vers docs récentes
```

### Gemini — Analyser une erreur complexe
```
1. Copier screenshot de l'erreur dans Gemini
2. Demander : "Pourquoi cette erreur MongoDB ReplicaSet?"
3. Gemini lit le screenshot et suggère des fixes
```

---

## Règles d'utilisation multi-agent

### ✅ À faire

1. **Utiliser l'agent le plus adapté à la tâche**
   - Architecture complexe → Claude
   - Auto-complétion → Copilot
   - API récente → Grok
   - Visuel → Gemini

2. **Documenter le contexte** dans CLAUDE.md
   ```markdown
   # Contexte pour les agents IA
   - Stack : Next.js 16 + MongoDB + Bun
   - Patterns : handler-de-router, server/client separation
   - Conventions : rules/ (8 règles codifiées)
   ```

3. **Valider la sortie** de chaque agent
   - Types TypeScript doivent compiler
   - Mocks doivent matcher le réel interface
   - Tests E2E doivent passer

### ❌ À éviter

1. **Ne pas envoyer du code sensible à des agents cloud**
   - Clés API, tokens → Utiliser LLaMA local si besoin
   - Données utilisateur → Chiffrer ou abstraire

2. **Ne pas mélanger trop d'agents** sur la même tâche
   - 2 agents max par tâche (ex: Claude + Copilot)
   - Sinon = confusion, réécriture répétée

3. **Ne pas ignorer les conventions** du projet
   - Tous les agents doivent suivre `rules/` et `CLAUDE.md`
   - Sinon = dette technique, refactoring futur

---

## Configuration par agent

### Claude Code (CLI)
```bash
# Installation
npm install -g @anthropic-ai/claude-code

# Lancement
claude code

# Utiliser dans Terminal : /help pour les slash commands
/commit    # Committer avec message auto
/check     # Vérifier types TypeScript
/remember  # Sauvegarder du contexte en mémoire
```

### Copilot (VS Code)
```json
// .vscode/settings.json
{
  "github.copilot.enable": {
    "markdown": true,
    "plaintext": true,
    "typescript": true
  },
  "github.copilot.advanced": {
    "length": 500,     // Longueur max des suggestions
    "temperatures": 1  // Variabilité (0-2)
  }
}
```

### Grok (API xAI)
```bash
# 1. Créer compte xAI : api.x.ai
# 2. Générer une clé API
# 3. Configuration :
export XAI_API_KEY="..."
export GROK_MODEL="grok-beta"
```

### LLaMA / Ollama
```bash
# 1. Installer
curl https://ollama.ai/install.sh | sh

# 2. Télécharger un modèle
ollama pull mistral        # Rapide, bon pour le code
ollama pull neural-chat    # Spécialisé conversations

# 3. Lancer le serveur
ollama serve              # http://localhost:11434

# 4. Utiliser
curl http://localhost:11434/api/generate \
  -d '{"model":"mistral","prompt":"function hello() {"}'
```

---

## Coûts et performance

| Agent | Coût mensuel | Latence | Fiabilité (code) |
|---|---|---|---|
| **Claude Opus** | ~$20 (usage) | 3-5s | ⭐⭐⭐⭐⭐ |
| **Claude Sonnet** | ~$5 (usage) | 2-3s | ⭐⭐⭐⭐ |
| **Claude Haiku** | ~$1 (usage) | 1-2s | ⭐⭐⭐⭐ |
| **Copilot** | $10/mois | <1s | ⭐⭐⭐⭐ |
| **Grok** | ~$5 (usage) | 2-4s | ⭐⭐⭐ |
| **Gemini** | Gratuit* | 2-3s | ⭐⭐⭐ |
| **LLaMA (Ollama)** | $0 | 3-10s | ⭐⭐ |

*Gemini gratuit : 60 req/min, sinon Google Cloud pay-per-use

---

## Recommandations pour Eddeyar

### Phase actuelle (pré-production)
```
Agent principal       → Claude Sonnet 4.6 (meilleur rapport coût/perf)
Autocomplétion       → GitHub Copilot (gratuit avec Pro)
Recherche API        → Grok (documentation à jour)
Locale / Private     → Ollama (si data sensible)
```

### Après production
```
Basculer vers Claude Opus pour les tâches critiques (architecture, security).
Garder Copilot pour la vélocité développement.
```

---

## Contacter les agents

### Quand utiliser quoi ?

**J'ai besoin de...**

- **Refactorer une architecture entière** → Claude Opus via claude.ai/code
- **Compléter du code pendant que je code** → Copilot (VS Code shortcut)
- **Chercher une API ou dépendance récente** → Grok (web search)
- **Analyser une erreur avec screenshot** → Gemini (télécharger image)
- **Travailler offline / confidentialité** → Ollama local
- **Vérifier les types TypeScript** → Claude + `/check` command

---

## Ressources

| Ressource | URL |
|---|---|
| CLAUDE.md (conventions) | `./CLAUDE.md` |
| Rules (8 patterns) | `./rules/` |
| Claude Code CLI | https://github.com/anthropics/claude-code |
| GitHub Copilot | https://github.com/features/copilot |
| Grok API | https://api.x.ai |
| Gemini | https://gemini.google.com |
| Ollama | https://ollama.ai |

---

**Dernière mise à jour :** 2026-04-03
