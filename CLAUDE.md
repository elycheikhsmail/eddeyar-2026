# CLAUDE.md — Eddeyar (Rim-eBay)

Marketplace immobilière et généraliste ciblant le marché mauritanien.
Stack : **Next.js 16 App Router + PostgreSQL + Drizzle ORM + TypeScript + TailwindCSS + Bun**.

---

## Commandes essentielles

```bash
bun install              # Installer les dépendances
bun run dev              # Serveur de développement (Turbopack, port 3000)
bun run build            # Build de production (~42s — TS check désactivé dans next.config.mjs)
bun run start            # Serveur de production (port 3000)
bun run start:test       # Serveur de production avec NODE_ENV=test (.env.test)
bun run check-types      # Vérification TypeScript stricte (sans emit — obligatoire avant deploy)

# PostgreSQL (installé sur Windows, service postgresql-x64-18)
bun run db:generate      # Générer les migrations Drizzle (après modif schema)
bun run db:migrate       # Appliquer les migrations (.env)
bun run db:seed          # Insérer données de référence + démo (.env)
bun run db:delete        # Vider toutes les tables (.env)
bun run db:studio        # Drizzle Studio (UI base de données)

# Base de test séparée — copier .env.test.exemple vers .env.test
bun run test:e2e:setup   # migrate + seed la base de test (raccourci)
bun run db:migrate:test  # appliquer migrations dans la base de test
bun run db:seed:test     # seed données dans la base de test
bun run db:delete:test   # vider toutes les tables dans la base de test

# Pipeline tests avec données fraîches (delete → migrate → seed → build → start:test)
bun run testwithdata
# Pipeline tests sans rebuild (delete → migrate → seed → start:test)
bun run testwithdata:norebuild

# Tests E2E
bun run test:e2e         # Playwright headless
bun run test:e2e:ui      # Playwright mode interactif
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
    images/          # Upload / suppression images (Vercel Blob)
    my/              # Routes authentifiées (annonces, favoris, statut)
    p/users/         # Authentification (email + téléphone)
    otp/             # Vérification OTP
    sms/             # Intégration Chinguisoft
    mail/            # Email transactionnel (Resend + Nodemailer)
    telegram/        # Bot Telegram
    # Chaque route suit la règle 08 :
    #   route.ts (slim) + route.handlers/{handler}.interface.ts
    #                    + route.handlers/{handler}.mocked.ts
    #                    + route.handlers/{handler}.real.ts
    #                    + route.handlers/{handler}.ts (switch mock/real)

lib/
  db.ts              # Connexion PostgreSQL via Pool (pg) + Drizzle ORM
  schema.ts          # Schéma Drizzle (12 tables PostgreSQL)
  mailer.ts          # Service email
  services/
    annoncesService.ts  # Logique métier principale des annonces

drizzle/
  migrations/        # Fichiers SQL générés par drizzle-kit

script/
  migratePostgres.ts # Applique les migrations SQL
  seedPostgres.ts    # Insère données de référence + démo
  deletePostgres.ts  # TRUNCATE ... RESTART IDENTITY CASCADE

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

Les règles sont dans le dossier [`rules/`](./rules/) :

| # | Règle | Fichier |
|---|---|---|
| 1 | Handlers de page | [01-handlers-de-page.md](./rules/01-handlers-de-page.md) |
| 2 | Séparation server / client | [02-separation-server-client.md](./rules/02-separation-server-client.md) |
| 3 | Lecture vs écriture | [03-lecture-vs-ecriture.md](./rules/03-lecture-vs-ecriture.md) |
| 4 | Mock avant prod | [04-mock-avant-prod.md](./rules/04-mock-avant-prod.md) |
| 5 | Attributs `data-cy` pour les tests E2E | [05-data-cy-tests-e2e.md](./rules/05-data-cy-tests-e2e.md) |
| 6 | Mettre à jour CLAUDE.md | [06-mettre-a-jour-claude-md.md](./rules/06-mettre-a-jour-claude-md.md) |
| 7 | MCP Server → binaire natif | [07-mcp-server-binaire-natif.md](./rules/07-mcp-server-binaire-natif.md) |
| 8 | Handlers de route (API) | [08-handler-de-router.md](./rules/08-handler-de-router.md) |

---

## Variables d'environnement

Copier `.env.exemple` vers `.env` et renseigner :

```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/eddeyar"
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
SITE_BASE_URL=http://localhost:3000
JWT_SECRET="secret-key"
RESEND_API_KEY=...
EMAIL_FROM=...

# Chinguisoft (SMS OTP)
SMS_OTP_PROVIDER_BASE_URL=https://chinguisoft.com/api/sms/validation
SMS_OTP_URL=https://chinguisoft.com/api/sms/validation
CHINGUISOFT_VALIDATION_KEY=...
CHINGUISOFT_VALIDATION_TOKEN=...

# Vercel Blob (stockage images)
BLOB_READ_WRITE_TOKEN=...

# Telegram (notifications)
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

---

## Base de données (PostgreSQL)

PostgreSQL installé directement sur Windows (service `postgresql-x64-18`).
ORM : **Drizzle ORM** (`lib/schema.ts` → `drizzle/migrations/`).
Tables principales :

| Table | Description |
|---|---|
| `users` | Comptes utilisateurs (email, password, roleName) |
| `contacts` | Téléphones/emails liés aux utilisateurs + OTP |
| `user_sessions` | Tokens JWT (expiration 24h) |
| `annonces` | Annonces avec images, prix, localisation |
| `annonce_publication_checklist` | Statut de publication par annonce |
| `options` | Catégories, sous-catégories, type_annonces (tag discriminant) |
| `lieux` | Wilayas + moughataas (depth=1 wilaya, depth=2 moughataa) |
| `images` | Métadonnées images (URL Vercel Blob) |
| `annonce_images` | Liens annonce ↔ image (many-to-many) |
| `favorites` | Favoris utilisateur (userId + annonceId) |
| `password_resets` | Tokens OTP reset mot de passe |
| `search_logs` | Analytics des recherches utilisateur |

### Scripts base de données

| Script npm | Fichier | Description |
|---|---|---|
| `db:generate` | drizzle-kit | Génère les fichiers SQL de migration |
| `db:migrate` | `script/migratePostgres.ts` | Applique les migrations |
| `db:seed` | `script/seedPostgres.ts` | Insère données de référence + démo |
| `db:delete` | `script/deletePostgres.ts` | Vide toutes les tables (RESTART IDENTITY) |
| `db:*:test` | — | Même scripts sur la base de test via `.env.test` |

**Compte démo** (créé par `db:seed`) :
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
Ces worktrees ont des noms aléatoires (`practical-snyder`, `zealous-babbage`, etc.) et apparaissent dans VS Code Source Control.

#### Règle obligatoire — nettoyage des worktrees

**À la fin de chaque tâche validée par l'utilisateur et avant le `git push`**, Claude doit supprimer tous les worktrees dans `.claude/worktrees/` **sauf celui dans lequel il s'exécute actuellement**.

```bash
# Commandes à exécuter depuis le repo principal (pas depuis le worktree)
git worktree remove --force .claude/worktrees/<nom>   # répéter pour chaque worktree à supprimer
git worktree prune                                     # nettoyer les références git orphelines
```

Pour lister les worktrees existants avant nettoyage :
```bash
git worktree list
```

> **Pourquoi :** Les worktrees s'accumulent et polluent VS Code Source Control, qui les affiche comme des dépôts séparés via `git worktree list` (contournant `git.repositoryScanIgnore`).

> **Règle pour Claude :** Ne jamais ajouter manuellement un chemin de worktree dans `git.ignoredRepositories`.

---

## Déploiement

- **Dev local** : `bun dev` + PostgreSQL Windows
- **Preview** : ngrok pour partage local
- **Staging** : Netlify / Firebase / Fly.io / Render
- **Production** : VPS (Contabo / Hostinger)
- **CI/CD** : GitHub Actions → build + check-types + deploy
