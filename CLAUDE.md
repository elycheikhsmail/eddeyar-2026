# CLAUDE.md — Eddeyar (Rim-eBay)

Marketplace immobilière et généraliste ciblant le marché mauritanien.
Stack : **Next.js 16 App Router + MongoDB + TypeScript + TailwindCSS + Bun**.

---

## Commandes essentielles

```bash
bun install              # Installer les dépendances
bun run dev              # Serveur de développement (Turbopack, port 3000)
bun run build            # Build de production (~42s — TS check désactivé dans next.config.mjs)
bun run start            # Serveur de production (port 3000)
bun run start:test       # Serveur de production avec NODE_ENV=test (.env.test)
bun run check-types      # Vérification TypeScript stricte (sans emit — obligatoire avant deploy)

# MongoDB (Docker)
docker compose -f docker-compose.mongo.yml up -d   # Démarrer MongoDB
bun run mongo:init       # Créer collections + index (première fois)
bun run mongo:seed       # Insérer données de référence + démo (à faire après init)
bun run mongo:delete     # Vider toutes les collections (données uniquement)
bun run mongo:migrate    # Migrations

# Base de test séparée (rim-ebay-test) — copier .env.test.exemple vers .env.test
bun run test:e2e:setup   # init + seed la base de test (raccourci)
bun run mongo:init:test  # init collections dans rim-ebay-test
bun run mongo:seed:test  # seed données dans rim-ebay-test
bun run mongo:delete:test # vider toutes les collections dans rim-ebay-test

# Pipeline tests avec données fraîches (delete → seed → build → start:test)
bun run testwithdata
# Pipeline tests sans rebuild (delete → seed → start:test) — si le code n'a pas changé
bun run testwithdata:norebuild

# Tests E2E
bun run test:e2e         # Playwright headless
bun run test:e2e:ui      # Playwright mode interactif

# Backup
bun run backup:db
bun run restore:temp
```

---

## Architecture

```
app/
  [locale]/          # Pages localisées (App Router, /ar par défaut)
    layout.tsx       # Layout racine — sessions JWT, police, RTL
    page.tsx         # Page d'accueil (listings + recherche)
    my/              # Dashboard utilisateur connecté
    p/               # Routes publiques (auth, profil)
    ui/              # Composants UI spécifiques à la page
  api/               # Route Handlers Next.js (serverless)
    annonces/        # CRUD annonces
    p/users/         # Authentification (email + téléphone)
    otp/             # Vérification OTP
    sms/             # Intégration Chinguisoft
    mail/            # Email transactionnel (Resend + Nodemailer)
    telegram/        # Bot Telegram

lib/
  mongodb.ts         # Connexion MongoDB avec cache client (serverless)
  mailer.ts          # Service email
  services/
    annoncesService.ts  # Logique métier principale des annonces

packages/
  ui/                # Composants réutilisables (monorepo)
  mytypes/           # Types TypeScript partagés
  eslint-config/     # ESLint partagé
  typescript-config/ # tsconfig partagé

locales/
  translations/      # Fichiers JSON de traduction (arabe + fr)
```

---

## Conventions de code

### Règle 1 — Handlers de page
Chaque handler dans `page.handlers/` suit cette structure :

```
handleXxx.interface.ts   # Types / interfaces
handleXxx.mocked.ts      # Version mockée (à compléter en premier)
handleXxx.real.ts        # Version production
handleXxx.ts             # Export principal (switch mock/real)
data.json                # Données simulées
```

### Règle 2 — Séparation server / client
- `page.tsx` → **Server Components uniquement**
- `ui.tsx` → **Client Components** (`"use client"`)

### Règle 3 — Lecture vs écriture
- **Lire** les données dans les pages (Server Components) pour la performance
- **Écrire** les données via les Route Handlers (`route.ts`) pour la sécurité

### Règle 4 — Mock avant prod
Toujours compléter la **version mockée** avant d'implémenter la version réelle.

### Règle 5 — Mettre à jour CLAUDE.md
Après chaque changement significatif (nouveaux scripts, nouvelles collections, nouvelles conventions), **mettre à jour ce fichier** pour qu'il reste la source de vérité du projet.

### Règle 6 — Tout nouveau MCP Server → compiler en binaire natif
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

---

## Variables d'environnement

Copier `.env.exemple` vers `.env` et renseigner :

```env
DATABASE_URL="mongodb://localhost:27017/rim-ebay"
MONGODB_DB_NAME="rim-ebay"
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
SITE_BASE_URL=http://localhost:3000
JWT_SECRET="secret-key"
RESEND_API_KEY=...
EMAIL_FROM=...

# Chinguisoft (SMS OTP)
SMS_OTP_PROVIDER_BASE_URL=https://chinguisoft.com/api/sms/validation
CHINGUISOFT_VALIDATION_KEY=...
CHINGUISOFT_VALIDATION_TOKEN=...
```

---

## Base de données (MongoDB)

MongoDB tourne en mode **ReplicaSet** (requis pour les transactions).
Collections principales :

| Collection | Description |
|---|---|
| `users` | Comptes utilisateurs |
| `contacts` | Téléphones/emails liés aux utilisateurs |
| `user_sessions` | Tokens JWT (expiration 24h) |
| `annonces` | Annonces avec images, prix, localisation |
| `annonce_publication_checklist` | Statut de publication par annonce |
| `options` | Catégories, sous-catégories, type_annonces (tag discriminant) |
| `lieux` | Wilayas + moughataas (depth=1 wilaya, depth=2 moughataa) |
| `counters` | Auto-incrément ids (options:id, lieux:id) |
| `images` | Métadonnées images |

### Scripts base de données

| Script | Fichier | Description |
|---|---|---|
| `mongo:init` | `script/initMongo.ts` | Crée collections + index |
| `mongo:seed` | `script/seedMongo.ts` | Insère données de référence + démo |
| `mongo:delete` | `script/deleteMongo.ts` | Vide toutes les collections |
| `mongo:*:test` | — | Même scripts sur la base `rim-ebay-test` via `.env.test` |

**Compte démo** (créé par `mongo:seed`) :
- email : `demo@eddeyar.mr` / téléphone : `36000000` / mot de passe : `Demo1234!`

---

## Internationalisation (i18n)

- Route de base : `/ar/` (arabe, RTL)
- Police : **Almarai** pour RTL, **Inter** pour LTR
- Bibliothèque : `next-international`
- Traductions : `locales/translations/`

---

## Authentification

Flux JWT + Cookies HTTP-Only :
1. Inscription via téléphone (OTP SMS Chinguisoft) ou email
2. Connexion → génération JWT → cookie HTTP-Only
3. Session stockée dans `user_sessions` (TTL 24h)
4. Protection brute-force : cooldown 1 min sur renvoi OTP

---

## Services externes

| Service | Usage |
|---|---|
| **Chinguisoft** | SMS OTP (provider mauritanien local) |
| **Resend** | Emails transactionnels |
| **Telegram Bot** | Notifications / messagerie |
| **react-leaflet** | Carte interactive |

---

## Tests

- Framework : **Playwright** (E2E) + **TestSprite** (AI E2E)
- Rapports HTML générés automatiquement
- Dossiers : `tests/` (actif), `e2e/` (exemples legacy), `testsprite_tests/` (TestSprite)
- Config : `playwright.config.ts` — Chromium, Firefox, WebKit

---

## Workflow Git

### Phase pré-production (actuelle)
Le projet n'est pas encore en production. **Travailler directement sur `main`** est la stratégie retenue pour aller vite et économiser des tokens Claude.

```bash
git pull origin main          # Toujours puller avant de commencer
# ... faire les modifications ...
git add <fichiers>
git commit -m "feat/fix: ..."
git push origin main
```

### Règles minimales
- Toujours `git pull` avant de commencer
- Committer souvent avec des messages clairs
- Ne jamais `git push --force` sur main

### Quand repasser aux branches (plus tard)
Dès qu'il y a : plusieurs développeurs, CI/CD actif, ou utilisateurs réels en production.

### Worktrees Claude Code (important pour les contributeurs)
Claude Code crée automatiquement des **git worktrees** dans `.claude/worktrees/` lors de certaines tâches.
Ces worktrees ont des noms aléatoires (`practical-snyder`, `zealous-babbage`, etc.) et apparaissent dans VS Code Source Control — **c'est normal, ne pas les commiter manuellement**.

Le dossier `.claude` est déjà exclu du scan git dans `.vscode/settings.json` :
```json
"git.repositoryScanIgnore": [".claude"]
```
Cela couvre **tous** les worktrees présents et futurs, peu importe leur nom.

> **Règle pour Claude :** Ne jamais ajouter manuellement un chemin de worktree dans `git.ignoredRepositories`. Le `git.repositoryScanIgnore` gère tout automatiquement.

---

## Déploiement

- **Dev local** : `bun dev` + Docker MongoDB
- **Preview** : ngrok pour partage local
- **Staging** : Netlify / Firebase / Fly.io / Render
- **Production** : VPS (Contabo / Hostinger)
- **CI/CD** : GitHub Actions → build + check-types + deploy
