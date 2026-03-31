import { test, expect } from '@playwright/test';

/**
 * Tests E2E — Inscription via Numéro de Téléphone
 * 
 * Couvre le flux complet :
 *  - Navigation vers la page d'inscription
 *  - Inscription réussie (Particulier & Samsar)
 *  - Vérification OTP + auto-login
 *  - Validations (champs vides, mots de passe, numéro invalide)
 *  - Cas d'erreur (doublon, OTP invalide, brute force)
 *  - Fonctionnalités annexes (renvoi OTP, toggle mot de passe)
 */

const REGISTER_URL = '/ar/p/users/register';
const OTP_URL = '/ar/p/verification/otp';

// Génère un numéro unique pour éviter les doublons entre exécutions
function uniquePhone(prefix: string = '3') {
  const rand = Math.floor(1000000 + Math.random() * 8999999);
  return `${prefix}${String(rand).slice(0, 7)}`;
}

// ─────────────────────────────────────────────────
// Phase 1 : Navigation
// ─────────────────────────────────────────────────

test.describe('Phase 1 — Navigation', () => {

  test('TC-01: Naviguer vers la page d\'inscription', async ({ page }) => {
    await page.goto('/');

    const registerLink = page.locator('[data-cy="register"]');

    if (await registerLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await registerLink.click();
    } else {
      await page.goto(REGISTER_URL);
    }

    // Vérifier l'URL
    await expect(page).toHaveURL(/\/p\/users\/register/);

    // Vérifier le titre
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible();

    // Vérifier le champ téléphone
    const phoneInput = page.locator('input[type="tel"], input#contact');
    await expect(phoneInput).toBeVisible();

    // Vérifier le champ mot de passe
    const passwordInput = page.locator('input#password');
    await expect(passwordInput).toBeVisible();

    // Vérifier le champ confirmation
    const confirmInput = page.locator('input#confirmPassword');
    await expect(confirmInput).toBeVisible();

    // Vérifier le bouton submit
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
  });
});

// ─────────────────────────────────────────────────
// Phase 2 : Cas positifs
// ─────────────────────────────────────────────────

test.describe('Phase 2 — Inscription réussie', () => {

  test('TC-02: Inscription Particulier', async ({ page }) => {
    const phone = uniquePhone('3');

    await page.goto(REGISTER_URL);
    await expect(page.locator('input#contact')).toBeVisible();

    // Remplir le formulaire
    await page.fill('input#contact', phone);
    await page.fill('input#password', 'TestPass123');
    await page.fill('input#confirmPassword', 'TestPass123');

    // Vérifier que "Particulier" est sélectionné par défaut
    const particulierRadio = page.locator('input[name="userType"][value="individual"]');
    await expect(particulierRadio).toBeChecked();

    // Soumettre
    await page.click('button[type="submit"]');

    // Attendre la redirection vers la page OTP
    await expect(page).toHaveURL(/\/verification\/otp/, { timeout: 15000 });

    // Vérifier la page OTP
    const otpInput = page.locator('input[type="text"]');
    await expect(otpInput).toBeVisible();
  });

  test('TC-03: Inscription Samsar (Professionnel)', async ({ page }) => {
    const phone = uniquePhone('4');

    await page.goto(REGISTER_URL);
    await expect(page.locator('input#contact')).toBeVisible();

    // Remplir
    await page.fill('input#contact', phone);
    await page.fill('input#password', 'Pass456');
    await page.fill('input#confirmPassword', 'Pass456');

    // Sélectionner Samsar
    const samsarRadio = page.locator('input[name="userType"][value="samsar"]');
    await samsarRadio.check({ force: true });
    await expect(samsarRadio).toBeChecked();

    // Soumettre
    await page.click('button[type="submit"]');

    // Redirection OTP
    await expect(page).toHaveURL(/\/verification\/otp/, { timeout: 15000 });
  });

  test('TC-04: Vérification OTP + Auto-login', async ({ page }) => {
    const phone = uniquePhone('2');

    // Inscription d'abord
    await page.goto(REGISTER_URL);
    await page.fill('input#contact', phone);
    await page.fill('input#password', 'OtpTest123');
    await page.fill('input#confirmPassword', 'OtpTest123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/verification\/otp/, { timeout: 15000 });

    // Saisir le code OTP (hardcodé "1234" en dev)
    const otpInput = page.locator('input[type="text"]');
    await expect(otpInput).toBeVisible();
    await otpInput.fill('1234');

    // Cliquer vérifier — bouton "تحقق من الرمز"
    const verifyBtn = page.locator('button', { hasText: /تحقق/ });
    await verifyBtn.click();

    // Redirection vers /my/list après vérification réussie
    await expect(page).toHaveURL(/\/my\/list/, { timeout: 15000 });

    // Vérifier les cookies d'auto-login
    const cookies = await page.context().cookies();
    const jwtCookie = cookies.find(c => c.name === 'jwt');
    const userCookie = cookies.find(c => c.name === 'user');
    expect(jwtCookie).toBeDefined();
    expect(userCookie).toBeDefined();
  });
});

// ─────────────────────────────────────────────────
// Phase 3 : Validations
// ─────────────────────────────────────────────────

test.describe('Phase 3 — Validations', () => {

  test('TC-05: Champs vides — validation HTML5', async ({ page }) => {
    await page.goto(REGISTER_URL);

    // Le champ contact a l'attribut required
    const contactInput = page.locator('input#contact');
    await expect(contactInput).toHaveAttribute('required', '');

    // Soumettre sans remplir
    await page.click('button[type="submit"]');

    // On doit rester sur la même page (validation HTML5 bloque la soumission)
    await expect(page).toHaveURL(/\/p\/users\/register/);
  });

  test('TC-06: Mots de passe non identiques', async ({ page }) => {
    await page.goto(REGISTER_URL);

    await page.fill('input#contact', '30000099');
    await page.fill('input#password', 'Pass123');
    await page.fill('input#confirmPassword', 'DifferentPass');
    await page.click('button[type="submit"]');

    // Rester sur la page et afficher erreur
    await expect(page).toHaveURL(/\/p\/users\/register/);

    // Message d'erreur sur la confirmation
    const errorMsg = page.locator('p.text-red-500');
    await expect(errorMsg.first()).toBeVisible();
  });

  test('TC-07: Numéro de téléphone invalide (commence par 1)', async ({ page }) => {
    await page.goto(REGISTER_URL);

    await page.fill('input#contact', '10000000'); // invalide : doit commencer par 2, 3 ou 4
    await page.fill('input#password', 'Pass123');
    await page.fill('input#confirmPassword', 'Pass123');
    await page.click('button[type="submit"]');

    // Doit rester sur la page avec un message d'erreur API
    await expect(page).toHaveURL(/\/p\/users\/register/);

    // Le message d'erreur doit apparaître (submitStatus)
    const statusMsg = page.locator('p.text-red-700, p.text-red-500');
    await expect(statusMsg.first()).toBeVisible({ timeout: 10000 });
  });
});

// ─────────────────────────────────────────────────
// Phase 4 : Cas d'erreur
// ─────────────────────────────────────────────────

test.describe('Phase 4 — Erreurs', () => {

  test('TC-08: Numéro déjà vérifié (doublon)', async ({ page }) => {
    const phone = uniquePhone('3');

    // 1. Inscription + vérification OTP pour créer un compte vérifié
    await page.goto(REGISTER_URL);
    await page.fill('input#contact', phone);
    await page.fill('input#password', 'Dup123');
    await page.fill('input#confirmPassword', 'Dup123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/verification\/otp/, { timeout: 15000 });

    const otpInput = page.locator('input[type="text"]');
    await otpInput.fill('1234');
    await page.locator('button', { hasText: /تحقق/ }).click();
    await expect(page).toHaveURL(/\/my\/list/, { timeout: 15000 });

    // 2. Tenter de s'inscrire avec le même numéro
    await page.goto(REGISTER_URL);
    await page.fill('input#contact', phone);
    await page.fill('input#password', 'Dup456');
    await page.fill('input#confirmPassword', 'Dup456');
    await page.click('button[type="submit"]');

    // Erreur : numéro déjà existant
    await expect(page).toHaveURL(/\/p\/users\/register/);
    const errorMsg = page.locator('p.text-red-700');
    await expect(errorMsg.first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-09: Code OTP invalide', async ({ page }) => {
    const phone = uniquePhone('4');

    await page.goto(REGISTER_URL);
    await page.fill('input#contact', phone);
    await page.fill('input#password', 'Otp999');
    await page.fill('input#confirmPassword', 'Otp999');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/verification\/otp/, { timeout: 15000 });

    // Saisir un mauvais code
    const otpInput = page.locator('input[type="text"]');
    await otpInput.fill('9999');
    await page.locator('button', { hasText: /تحقق/ }).click();

    // Message d'erreur
    const errorMsg = page.locator('p.text-red-600, p.text-center');
    await expect(errorMsg.first()).toBeVisible({ timeout: 10000 });

    // Rester sur la page OTP
    await expect(page).toHaveURL(/\/verification\/otp/);
  });

  test('TC-10: Brute force OTP — 5+ tentatives', async ({ page }) => {
    const phone = uniquePhone('2');

    await page.goto(REGISTER_URL);
    await page.fill('input#contact', phone);
    await page.fill('input#password', 'Brute123');
    await page.fill('input#confirmPassword', 'Brute123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/verification\/otp/, { timeout: 15000 });

    const otpInput = page.locator('input[type="text"]');
    const verifyBtn = page.locator('button', { hasText: /تحقق/ });

    // 5 tentatives incorrectes
    for (let i = 0; i < 5; i++) {
      await otpInput.fill('0000');
      await verifyBtn.click();
      // Attendre brièvement pour la réponse API
      await page.waitForTimeout(500);
    }

    // 6ème tentative — doit être bloquée (429)
    await otpInput.fill('0000');
    await verifyBtn.click();

    const errorMsg = page.locator('p.text-red-600, p.text-center');
    await expect(errorMsg.first()).toContainText(/too many|تحقق|failed/i, { timeout: 10000 });
  });
});

// ─────────────────────────────────────────────────
// Phase 5 : Fonctionnalités annexes
// ─────────────────────────────────────────────────

test.describe('Phase 5 — Annexes', () => {

  test('TC-11: Renvoi OTP avec cooldown', async ({ page }) => {
    const phone = uniquePhone('3');

    await page.goto(REGISTER_URL);
    await page.fill('input#contact', phone);
    await page.fill('input#password', 'Resend123');
    await page.fill('input#confirmPassword', 'Resend123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/verification\/otp/, { timeout: 15000 });

    // Cliquer "إعادة إرسال الرمز" (Renvoyer le code)
    const resendBtn = page.locator('button', { hasText: /إعادة إرسال/ });
    await expect(resendBtn).toBeVisible();
    await resendBtn.click();

    // Après clic : le bouton affiche un compteur et est désactivé
    await expect(resendBtn).toBeDisabled({ timeout: 5000 });
    await expect(resendBtn).toContainText(/\d+/); // contient un nombre (secondes)
  });

  test('TC-12: Toggle visibilité mot de passe', async ({ page }) => {
    await page.goto(REGISTER_URL);

    // Saisir un mot de passe
    const passwordInput = page.locator('input#password');
    await passwordInput.fill('Visible123');

    // Vérifier que le champ est masqué par défaut
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Cliquer l'icône œil (bouton adjacent)
    const toggleBtn = page.locator('input#password + button, input#password ~ button').first();
    // Fallback: le bouton est dans le même parent div
    const eyeBtn = page.locator('#password').locator('..').locator('button');
    await eyeBtn.click();

    // Le champ doit être visible
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Re-cliquer pour masquer
    await eyeBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Même test pour confirmPassword
    const confirmInput = page.locator('input#confirmPassword');
    await confirmInput.fill('Visible456');
    await expect(confirmInput).toHaveAttribute('type', 'password');

    const eyeBtnConfirm = page.locator('#confirmPassword').locator('..').locator('button');
    await eyeBtnConfirm.click();
    await expect(confirmInput).toHaveAttribute('type', 'text');

    await eyeBtnConfirm.click();
    await expect(confirmInput).toHaveAttribute('type', 'password');
  });
});
