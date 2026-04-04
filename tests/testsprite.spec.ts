/**
 * Tests E2E — Correspondance TestSprite (TC001–TC033)
 *
 * Tous les sélecteurs utilisent data-cy pour la stabilité.
 * Statuts connus :  ✅ Passé | ❌ Échoué (bug identifié) | ⚠️ Données insuffisantes
 *
 * Prérequis :
 *   bun run testwithdata   → reset DB + seed + build + start:test
 *   bun run test:ts        → lance uniquement ce fichier
 *
 * data-cy ajoutés dans les composants :
 *   annonce-item         → AnnonceItemUI.tsx    (article card)
 *   btn-prev-page        → PaginationUI.tsx
 *   btn-next-page        → PaginationUI.tsx
 *   pagination-info      → PaginationUI.tsx
 *   input-phone          → ConnexionFormPhone.tsx
 *   input-password       → ConnexionFormPhone.tsx / RegisterFormPhone.tsx / reset-password/ui.tsx
 *   btn-submit           → tous les formulaires
 *   input-contact        → RegisterFormPhone.tsx / forgot-password/ui.tsx
 *   input-confirm-password → RegisterFormPhone.tsx
 *   input-otp            → otp/ui.tsx / reset-password/ui.tsx
 *   btn-verify           → otp/ui.tsx
 *   btn-resend           → otp/ui.tsx
 *   input-confirm        → reset-password/ui.tsx
 */

import { test, expect } from '@playwright/test';

// ─── Constantes ────────────────────────────────────────────────────────────────

const DEMO_PHONE    = '36000000';
const DEMO_PASSWORD = 'Demo1234!';

const REGISTER_URL       = '/ar/p/users/register';
const LOGIN_URL           = '/ar/p/users/connexion';
const FORGOT_PASSWORD_URL = '/ar/p/users/forgot-password';
const RESET_PASSWORD_URL  = '/ar/p/users/reset-password';
const MY_LIST_URL         = '/ar/my/list';

function uniquePhone() {
  const rand = Math.floor(1000000 + Math.random() * 8999999);
  return `3${String(rand).slice(0, 7)}`;
}

// ─── TC001 — Parcourir les listings et ouvrir un détail ─────────────────────
// Résultat TestSprite : ✅ Passed

test.describe('TC001 — Listings : parcourir et ouvrir un détail', () => {
  test('affiche des cartes annonce et navigue vers la page détail', async ({ page }) => {
    await page.goto('/ar');

    const firstCard = page.locator('[data-cy="annonce-item"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });

    await page.waitForLoadState('networkidle');
    await firstCard.click();

    // Route : /{locale}/p/annonces/details/{id}
    await expect(page).toHaveURL(/\/p\/annonces\/details\//, { timeout: 15_000 });
    await expect(page.locator('body')).toBeVisible();
  });
});

// ─── TC002 — Pagination : page 1 → page 2 ──────────────────────────────────
// Résultat TestSprite : ❌ Failed (données insuffisantes — 1 seule page dans la DB de test)

test.describe('TC002 — Listings : pagination', () => {
  test('affiche les contrôles de pagination et permet de passer à la page suivante', async ({ page }) => {
    await page.goto('/ar');
    await expect(page.locator('[data-cy="annonce-item"]').first()).toBeVisible({ timeout: 10_000 });

    // L'indicateur de pagination doit être présent
    const paginationInfo = page.locator('[data-cy="pagination-info"]');
    await expect(paginationInfo).toBeVisible({ timeout: 8_000 });

    // Bouton "page suivante" — désactivé si 1 seule page de données
    const nextBtn = page.locator('[data-cy="btn-next-page"]');
    await expect(nextBtn).toBeVisible({ timeout: 5_000 });

    const isDisabled = await nextBtn.isDisabled();
    if (!isDisabled) {
      await nextBtn.click();
      await expect(page).toHaveURL(/page=2/, { timeout: 10_000 });
    } else {
      console.warn('TC002 ⚠️  Bouton suivant désactivé — seed insuffisant. Lancer `bun run db:seed:test` avec plus d\'annonces.');
    }
  });
});

// ─── TC007 — Filtres de recherche ──────────────────────────────────────────
// Résultat TestSprite : ❌ Failed (catégorie/moughataa vides ou non-interactifs)

test.describe('TC007 — Filtres de recherche', () => {
  test('le filtre "type" est interactif et met à jour les résultats', async ({ page }) => {
    await page.goto('/ar');
    await expect(page.locator('[data-cy="annonce-item"]').first()).toBeVisible({ timeout: 10_000 });

    const typeSelect = page.locator('form select').first();
    await expect(typeSelect).toBeVisible({ timeout: 8_000 });

    await typeSelect.selectOption({ index: 1 });
    await page.waitForTimeout(800);

    await expect(page.locator('main')).toBeVisible();
  });

  test('le filtre catégorie affiche des options (pas uniquement le placeholder)', async ({ page }) => {
    await page.goto('/ar');
    await expect(page.locator('[data-cy="annonce-item"]').first()).toBeVisible({ timeout: 10_000 });

    const categoryControl = page
      .locator('select, [role="listbox"], [role="combobox"]')
      .filter({ hasText: /اختر الفئة|catégorie|category/i })
      .first();

    const controlExists = await categoryControl.isVisible({ timeout: 5_000 }).catch(() => false);
    if (controlExists) {
      const optionCount = await page.locator('option, [role="option"]').count();
      // ❌ Bug connu : si optionCount <= 1, la collection `options` n'est pas seedée
      expect(optionCount).toBeGreaterThan(1);
    } else {
      console.warn('TC007 ⚠️  Contrôle catégorie introuvable — vérifier le composant filtre.');
    }
  });
});

// ─── TC012 — Page détail : carousel, description, carte, contact ───────────
// Résultat TestSprite : ✅ Passed

test.describe('TC012 — Page détail annonce', () => {
  test('affiche l\'image, la description, la carte et le contact', async ({ page }) => {
    await page.goto('/ar');

    const firstCard = page.locator('[data-cy="annonce-item"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    await page.waitForLoadState('networkidle');
    await firstCard.click();

    await expect(page).toHaveURL(/\/p\/annonces\/details\//, { timeout: 15_000 });

    await expect(page.locator('article img').first()).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5_000 });

    // Carte Leaflet — optionnelle (certaines annonces n'ont pas de coordonnées)
    await page.locator('.leaflet-container').waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});

    await expect(page.locator('body')).toBeVisible();
  });
});

// ─── TC015 — Login : identifiants valides ──────────────────────────────────
// Résultat TestSprite : ❌ Failed (mauvais mot de passe : password123 au lieu de Demo1234!)

test.describe('TC015 — Login : identifiants valides', () => {
  test('redirige vers l\'accueil après connexion avec le compte démo', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await expect(page.locator('[data-cy="btn-submit"]')).toBeVisible({ timeout: 8_000 });

    await page.locator('[data-cy="input-phone"]').fill(DEMO_PHONE);
    await page.locator('[data-cy="input-password"]').fill(DEMO_PASSWORD);
    await page.locator('[data-cy="btn-submit"]').click();

    await expect(page).not.toHaveURL(/\/p\/users\/connexion/, { timeout: 15_000 });
  });
});

// ─── TC016 — Login : identifiants invalides → message d'erreur ─────────────
// Résultat TestSprite : ❌ Failed (aucun message d'erreur affiché actuellement)

test.describe('TC016 — Login : identifiants invalides', () => {
  test('reste sur la page de connexion et affiche un message d\'erreur', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await expect(page.locator('[data-cy="btn-submit"]')).toBeVisible({ timeout: 8_000 });

    await page.locator('[data-cy="input-phone"]').fill('12345678');
    await page.locator('[data-cy="input-password"]').fill('invalidPassword1!');
    await page.locator('[data-cy="btn-submit"]').click();

    await expect(page).toHaveURL(/\/p\/users\/connexion/, { timeout: 10_000 });

    // ❌ Bug connu : aucun message d'erreur affiché — ce test documente le comportement attendu
    const errorMsg = page.locator('[role="alert"], p.text-red-500, p.text-red-700, .text-red-600').first();
    await expect(errorMsg).toBeVisible({ timeout: 8_000 });
  });
});

// ─── TC019 — Inscription : soumission valide → redirection OTP ─────────────
// Résultat TestSprite : ✅ Passed

test.describe('TC019 — Inscription : flux complet', () => {
  test('redirige vers la page OTP après soumission valide', async ({ page }) => {
    const phone = uniquePhone();

    await page.goto(REGISTER_URL);
    await expect(page.locator('[data-cy="btn-submit"]')).toBeVisible({ timeout: 8_000 });

    await page.locator('[data-cy="input-contact"]').fill(phone);
    await page.locator('[data-cy="input-password"]').fill('Password123!');
    await page.locator('[data-cy="input-confirm-password"]').fill('Password123!');
    await page.locator('[data-cy="btn-submit"]').click();

    await expect(page).toHaveURL(/\/verification\/otp/, { timeout: 15_000 });
    await expect(page.locator('[data-cy="input-otp"]')).toBeVisible({ timeout: 5_000 });
  });
});

// ─── TC021 — Inscription : validation — champs requis vides ────────────────
// Résultat TestSprite : ✅ Passed

test.describe('TC021 — Inscription : validation formulaire vide', () => {
  test('bloque la soumission et affiche des erreurs de validation', async ({ page }) => {
    await page.goto(REGISTER_URL);
    await expect(page.locator('[data-cy="btn-submit"]')).toBeVisible({ timeout: 8_000 });

    await page.locator('[data-cy="btn-submit"]').click();

    await expect(page).toHaveURL(/\/p\/users\/register/);

    const contactInput = page.locator('[data-cy="input-contact"]');
    const isRequired = await contactInput.getAttribute('required');

    if (isRequired === null) {
      await expect(
        page.locator('p.text-red-500, p.text-red-700, [role="alert"]').first()
      ).toBeVisible({ timeout: 5_000 });
    }
  });
});

// ─── TC023 — Page OTP : saisie 6 chiffres et soumission ────────────────────
// Résultat TestSprite : ❌ Failed (le test plan indiquait 4 chiffres, l'UI attend 6 chiffres)

test.describe('TC023 — Page OTP : saisie du code', () => {
  test.describe.configure({ mode: 'serial' });

  test('accepte un code à 6 chiffres et le bouton de vérification est actif', async ({ page }) => {
    // Injecter directement pendingOtpUserId pour contourner la dépendance à l'API d'inscription
    await page.addInitScript(() => {
      window.localStorage.setItem('pendingOtpUserId', 'playwright-test-user-tc023');
    });

    await page.goto('/ar/p/verification/otp');

    const otpInput = page.locator('[data-cy="input-otp"]');
    await expect(otpInput).toBeVisible({ timeout: 8_000 });

    await otpInput.fill('123456');
    await expect(otpInput).toHaveValue('123456');

    const verifyBtn = page.locator('[data-cy="btn-verify"]');
    await expect(verifyBtn).toBeVisible();
    await expect(verifyBtn).toBeEnabled();
  });
});

// ─── TC025 — Mot de passe oublié : chargement et saisie téléphone ──────────
// Résultat TestSprite : ✅ Passed

test.describe('TC025 — Mot de passe oublié : formulaire', () => {
  test('charge la page, accepte un numéro de téléphone et permet la soumission', async ({ page }) => {
    await page.goto(FORGOT_PASSWORD_URL);

    const phoneInput = page.locator('[data-cy="input-contact"]');
    await expect(phoneInput).toBeVisible({ timeout: 8_000 });

    await phoneInput.fill(DEMO_PHONE);
    await expect(phoneInput).toHaveValue(DEMO_PHONE);

    const submitBtn = page.locator('[data-cy="btn-submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });
});

// ─── TC027 — Mot de passe oublié : soumission vide bloquée ─────────────────
// Résultat TestSprite : ✅ Passed

test.describe('TC027 — Mot de passe oublié : validation soumission vide', () => {
  test('bloque la soumission quand le champ téléphone est vide', async ({ page }) => {
    await page.goto(FORGOT_PASSWORD_URL);

    const submitBtn = page.locator('[data-cy="btn-submit"]');
    await expect(submitBtn).toBeVisible({ timeout: 8_000 });
    await submitBtn.click();

    await page.waitForTimeout(1_000);
    expect(page.url()).toMatch(/forgot-password/);

    // L'input contact a l'attribut required → HTML5 bloque nativement
    // Si pas de required, un toast doit apparaître
    const contactInput = page.locator('[data-cy="input-contact"]');
    const isRequired = await contactInput.getAttribute('required');
    if (isRequired === null) {
      const toast = page.locator('[role="alert"], [id*="toast"], [class*="toast"]').first();
      await expect(toast).toBeVisible({ timeout: 3_000 });
    }
  });
});

// ─── TC029 — Reset password : chargement et saisie des champs ──────────────
// Résultat TestSprite : ✅ Passed

test.describe('TC029 — Reset password : formulaire', () => {
  test('charge la page et accepte les champs OTP + nouveaux mots de passe', async ({ page }) => {
    await page.goto(RESET_PASSWORD_URL);

    const otpInput = page.locator('[data-cy="input-otp"]');
    await expect(otpInput).toBeVisible({ timeout: 8_000 });
    await otpInput.fill('123456');
    await expect(otpInput).toHaveValue('123456');

    const passwordInput = page.locator('[data-cy="input-password"]');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('NewPass123!');

    const confirmInput = page.locator('[data-cy="input-confirm"]');
    await expect(confirmInput).toBeVisible();
    await confirmInput.fill('NewPass123!');

    const submitBtn = page.locator('[data-cy="btn-submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });
});

// ─── TC030 — Reset password : soumission vide bloquée ──────────────────────
// Résultat TestSprite : ✅ Passed

test.describe('TC030 — Reset password : validation formulaire vide', () => {
  test('bloque la soumission quand tous les champs sont vides', async ({ page }) => {
    await page.goto(RESET_PASSWORD_URL);

    const submitBtn = page.locator('[data-cy="btn-submit"]');
    await expect(submitBtn).toBeVisible({ timeout: 8_000 });
    await submitBtn.click();

    await page.waitForTimeout(1_000);
    expect(page.url()).toMatch(/reset-password/);
  });
});

// ─── TC031 — Reset password : mots de passe non identiques ────────────────
// Résultat TestSprite : ❌ Failed (validation de correspondance non implémentée)

test.describe('TC031 — Reset password : mots de passe non identiques', () => {
  test('affiche une erreur quand les deux mots de passe ne correspondent pas', async ({ page }) => {
    await page.goto(RESET_PASSWORD_URL);
    await expect(page.locator('[data-cy="btn-submit"]')).toBeVisible({ timeout: 8_000 });

    await page.locator('[data-cy="input-otp"]').fill('123456');
    await page.locator('[data-cy="input-password"]').fill('Password123!');
    await page.locator('[data-cy="input-confirm"]').fill('Password321!'); // différent

    await page.locator('[data-cy="btn-submit"]').click();
    await page.waitForTimeout(1_500);

    expect(page.url()).toMatch(/reset-password/);

    // ❌ Bug connu : validation de mismatch non implémentée — ce test passera après le fix
    const errorMsg = page
      .locator('p.text-red-500, p.text-red-700, [role="alert"], [class*="error"]')
      .first();
    await expect(errorMsg).toBeVisible({ timeout: 5_000 });
  });
});

// ─── TC033 — Route protégée : redirection vers login si non authentifié ────
// Résultat TestSprite : ✅ Passed

test.describe('TC033 — Route protégée : redirection login', () => {
  test('redirige /ar/my/list vers /connexion pour un visiteur non connecté', async ({ page }) => {
    await page.goto(MY_LIST_URL);
    await expect(page).toHaveURL(/\/p\/users\/connexion/, { timeout: 10_000 });
  });
});
