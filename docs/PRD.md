# Product Requirements Document (PRD) — Rim-eBay (Eddeyar)

## 1. Vision du Produit
**Rim-eBay (Eddeyar)** est une marketplace immobilière et généraliste ciblant le marché mauritanien (et potentiellement régional). Inspiré d'eBay, le projet permet de mettre en relation des vendeurs (particuliers ou professionnels de l'immobilier dits "Samsar") avec des acheteurs ou locataires, facilitant la recherche avancée d'annonces avec une localisation précise, et une communication intégrée.

## 2. Public Cible & Rôles Utilisateurs
*   **Visiteurs (Anonymes) :** Peuvent naviguer sur les annonces, effectuer des recherches avancées et voir les détails publics.
*   **Utilisateurs Inscrits (Clients) :**
    *   **Particulier :** Utilisateur standard cherchant à acheter/louer ou vendant ses propres biens de façon occasionnelle.
    *   **Samsar (Professionnel / Courtier) :** Professionnel de l'immobilier ou intermédiaire gérant de multiples biens.
*   **Administrateurs (Admin) :** Ont accès à la gestion globale de la plateforme, la modération des annonces et des utilisateurs via un back-office (comme mentionné dans les redirections `urlboot`).

## 3. Fonctionnalités Clés (Core Features)

### 3.1 Authentification & Sécurité
*   **Inscription Multicanal :**
    *   Inscription via Numéro de Téléphone (format local : commence par 2, 3 ou 4 avec 8 chiffres).
    *   Inscription via Email (avec vérification de structure standard).
*   **Vérification Multi-Facteurs (MFA/OTP) :**
    *   Validation obligatoire du numéro de téléphone via un code OTP envoyé par SMS (Intégration du fournisseur local **Chinguisoft**).
    *   Gestion de cooldown pour le renvoi d'OTP (1 minute) et protection contre le brute-force (Limitation de tentatives).
*   **Gestion de Session :** Utilisation de JWT avec expiration de 24h stocké dans des cookies HTTP-Only et de collections MongoDB (`user_sessions`).

### 3.2 Gestion des Annonces (Listings)
*   **Publication d'annonces :** Création d'annonces avec description, catégories, sous-catégories, et type d'annonce (Location/Vente).
*   **Gestion des Images :** Téléchargement et attachement d'images multiples aux annonces.
*   **Tableau de bord Utilisateur (`/my`) :**
    *   `my/list` : Voir et gérer ses propres annonces actives.
    *   `my/add` : Interface pour ajouter une nouvelle annonce.
    *   `my/contact` : Messagerie ou historique de contact avec les annonceurs.
*   **Catégorisation & Options Spécifiques :** (Par exemple : Négociation directe, `issmar`, options secondaires).

### 3.3 Moteur de Recherche & Filtrage Avancé
*   L'API de recherche (`/api/annonces`) supporte des filtres complexes :
    *   Par localisation hiérarchique : `wilayaId` (Région), `moughataaId` (Département).
    *   Par hiérarchie de catégories : `categorieId`, `subCategorieId`.
    *   Par prix (`price`) et par type d'transaction (`typeAnnonceId`).
    *   Par caractéristiques booléennes (`directNegotiation`, `issmar`).
  

### 3.4 Localisation (Lieux)
*   Base de données dédiée pour la division géographique mauritanienne : Wilayas (Régions) et Moughataas (Départements), permettant un filtrage local très pertinent.
*   Intégration d'une cartographie interactive sur le frontend (via `react-leaflet`).

### 3.5 Communications
*   Notification et messagerie via l'intégration **Telegram Bot** (`Telegramboot`).
*   Envoi de courriels transactionnels configurés via `Nodemailer` & `Resend` (ex: pour la réinitialisation de mot de passe ou les alertes).
*   Notification SMS via l'intégration locale `Chinguisoft`.

## 4. Architecture Technique

### 4.1 Stack Technologique
*   **Frontend :** Next.js 16 (App Router) & React 19.
*   **Style & UI :** TailwindCSS, Headless UI, Heroicons, Lottie-react (pour les animations).
*   **Internationnalisation :** `next-international` avec support implicite pour l'arabe (`/ar/`) et potentiellement d'autres langues.
*   **Backend / API :** Next.js Serverless Functions / Route Handlers.
*   **Base de Données Principale :** MongoDB (Self-hosted via Docker pendant le dev, migration Atlas gérée). Pilote `mongodb` officiel. Mode ReplicaSet activé.
*   **Mise en Cache / Persistance Locale :** Utilisation de `node-persist` et cache JSON statique (généré via scripts locaux) pour préserver la performance sur des collections peu mutables (ex: listes des Wilayas).
 

### 4.2 Déploiement & DevOps
*   **Développement Local :** Géré par `pnpm dev` utilisant Turbopack. MongoDB géré par un `docker-compose.mongo.yml`.
*   **CI/CD :** Pipeline GitHub Actions (`deploy-nextjs-postgress.yml`) automatisant le build, le typage TypeScript (stricte) et le déploiement sur plateforme cloud.
*   **Tests E2E :** Couverture complète via Microsoft Playwright simulée pour interagir avec des navigateurs automatisés.

## 5. Mesures de Succès (KPIs Suggérés)
*   Taux de conversion à l'inscription (Drop-off entre le formulaire et la validation de l'OTP).
*   Démarrage journalier de sessions et Temps moyen de complétion de création d'une annonce.
*   Nombre et statut des annonces créées via la plateforme chaque mois.
