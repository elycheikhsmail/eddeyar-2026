# CLAUDE.md — Eddeyar (Rim-eBay)

Marketplace immobilière et généraliste ciblant le marché mauritanien.
Stack : **Next.js 16 App Router + MongoDB + TypeScript + TailwindCSS + pnpm monorepo**.

---

## Commandes essentielles

```bash
pnpm install              # Installer les dépendances
pnpm run dev              # Serveur de développement (Turbopack, port 3000)
pnpm run build            # Build de production
pnpm run check-types      # Vérification TypeScript stricte (sans emit)

# MongoDB (Docker)
docker compose -f docker-compose.mongo.yml up -d   # Démarrer MongoDB
pnpm run mongo:init       # Créer collections + index (première fois)
pnpm run mongo:seed       # Insérer données de référence + démo (à faire après init)
pnpm run mongo:migrate    # Migrations

# Base de test séparée (rim-ebay-test) — copier .env.test.exemple vers .env.test
pnpm run test:e2e:setup   # init + seed la base de test (raccourci)
pnpm run mongo:init:test  # init collections dans rim-ebay-test
pnpm run mongo:seed:test  # seed données dans rim-ebay-test

# Tests E2E
pnpm run test:e2e         # Playwright headless
pnpm run test:e2e:ui      # Playwright mode interactif

# Backup
pnpm run backup:db
pnpm run restore:temp
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
| `user_sessions` | Tokens JWT (expiration 24h) |
| `annonces` | Annonces avec images, prix, localisation |
| `categories` | Catégories / sous-catégories |
| `type_annonces` | Types : Vente / Location / Service |
| `wilayas` | Régions mauritaniennes |
| `moughataas` | Départements (rattachés à une wilaya) |
| `lieux` | Jointure wilaya → moughataa → GPS |
| `images` | Métadonnées images |

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

### Branches
```
main          # Production — merge uniquement depuis dev, via PR revue
dev           # Intégration — toutes les features passent par ici avant main
claude/<nom>  # Branche de travail Claude par feature (ex: claude/auth-fix)
```

### Cycle de vie d'une feature
```
1. Créer la branche depuis dev
   git checkout dev && git pull origin dev
   git checkout -b claude/<nom-feature>

2. Développer + committer sur claude/<nom-feature>

3. Ouvrir une PR : claude/<nom-feature> → dev
   gh pr create --base dev

4. Review + merge dans dev

5. Quand dev est stable → ouvrir une PR : dev → main
   gh pr create --base main
```

### Règles
- Ne jamais committer directement sur `main` ou `dev`
- Toute PR doit passer `pnpm run check-types` et `pnpm run build` avant merge
- Les branches `claude/*` sont supprimées après merge

---

## Déploiement

- **Dev local** : `pnpm dev` + Docker MongoDB
- **Preview** : ngrok pour partage local
- **Staging** : branche `dev` → Netlify / Firebase / Fly.io / Render
- **Production** : branche `main` → VPS (Contabo / Hostinger)
- **CI/CD** : GitHub Actions → build + check-types + deploy
