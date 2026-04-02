# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata

- **Project Name:** eddeyar-2026
- **Date:** 2026-04-01
- **Prepared by:** TestSprite AI Team
- **Server mode:** Development (localhost:3000)
- **Total tests run:** 15
- **Pass rate:** 46.67% (7 passed / 8 failed)

---

## 2️⃣ Requirement Validation Summary

---

### Requirement A — Listings Browse & Search

| Test | Status | Summary |
|------|--------|---------|
| TC001 | ✅ Passed | Browse listing page and open detail |
| TC002 | ❌ Failed | Pagination unavailable — no listings shown |
| TC007 | ❌ Failed | Search filters: category dropdown empty |
| TC012 | ❌ Failed | Detail page: no image carousel, no map widget |

---

#### TC001 — Browse annonces listing and open a listing detail page
- **Test Code:** [TC001_Browse_annonces_listing_and_open_a_listing_detail_page.py](./TC001_Browse_annonces_listing_and_open_a_listing_detail_page.py)
- **Test Visualization:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/cf370ca6-6de8-4eb7-a56e-22ec0ef05e94
- **Status:** ✅ Passed
- **Analysis:** The listings page loads correctly and clicking a listing navigates to its detail page. Core browse flow is functional.

---

#### TC002 — Paginate annonces from page 1 to page 2
- **Test Code:** [TC002_Paginate_annonces_from_page_1_to_page_2.py](./TC002_Paginate_annonces_from_page_1_to_page_2.py)
- **Test Visualization:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/e1a7a60a-26f2-48c3-b8ae-04e3745946cb
- **Status:** ❌ Failed
- **Error:** Pagination could not be tested — listings area shows "لا توجد إعلانات." and no pagination controls are present.
- **Analysis:** The dev database likely lacks enough listings to trigger pagination (requires > 1 page). The test environment needs seeded data (`pnpm run mongo:seed`) or the test should run against the test DB (`pnpm run start:test`).

---

#### TC007 — Apply full set of search filters to narrow results
- **Test Code:** [TC007_Apply_full_set_of_search_filters_to_narrow_results.py](./TC007_Apply_full_set_of_search_filters_to_narrow_results.py)
- **Test Visualization:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/ab01f768-605a-4192-82f9-2e698df5a12d
- **Status:** ❌ Failed
- **Error:** Category dropdown (اختر الفئة) contains only the placeholder — no real options loaded. Subcategory also empty.
- **Analysis:** The `options` collection (categories/subcategories) is either not seeded or the API endpoint that populates the filter dropdowns is failing. Verify `pnpm run mongo:seed` was run and the `/api/annonces/options` route returns data.

---

#### TC012 — View annonce details (carousel, description, map, contact)
- **Test Code:** [TC012_View_annonce_details_including_carousel_description_map_and_contact_section.py](./TC012_View_annonce_details_including_carousel_description_map_and_contact_section.py)
- **Test Visualization:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/e3689ffa-1dda-455f-b892-e6a8f4604eaf
- **Status:** ❌ Failed
- **Error:** Detail page loaded (Appartement F3 — Tevragh-Zeina, 2,800,000 UM) but shows "No Image" and no map widget — only a text location is displayed.
- **Analysis:** Two distinct issues: (1) the demo listing has no images attached, so the carousel shows a placeholder; (2) the `react-leaflet` map component is not rendering, possibly due to SSR/client-only loading issue or missing `dynamic()` import with `ssr: false`.

---

### Requirement B — Authentication: Login

| Test | Status | Summary |
|------|--------|---------|
| TC015 | ❌ Failed | Valid login does not redirect |
| TC016 | ❌ Failed | Invalid login shows no error message |

---

#### TC015 — Login with valid phone and password redirects to home
- **Test Code:** [TC015_Login_with_valid_phone_and_password_redirects_to_home.py](./TC015_Login_with_valid_phone_and_password_redirects_to_home.py)
- **Test Visualization:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/81e07508-0bb0-4bb2-8542-47a20454cdce
- **Status:** ❌ Failed
- **Error:** After submitting phone `36000000` + password, the page stayed on `/ar/p/users/connexion`. No redirect occurred.
- **Analysis:** Critical blocker. The demo account (`demo@eddeyar.mr` / `36000000` / `Demo1234!`) must exist in the running database. If testing against the dev DB, run `pnpm run mongo:seed`. The login API route (`/api/p/users/connexion`) may also be returning an error silently. Check network response in browser devtools.

---

#### TC016 — Login with invalid credentials shows an error
- **Test Code:** [TC016_Login_with_invalid_credentials_shows_an_error.py](./TC016_Login_with_invalid_credentials_shows_an_error.py)
- **Test Visualization:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/dec79c12-6a98-43ae-a61c-1960ac6a6e5c
- **Status:** ❌ Failed
- **Error:** Submitting invalid credentials (phone `12345`) left the form without any visible error message.
- **Analysis:** The API likely returns an error response, but the UI component does not display it. The error state from the login handler is probably not wired to a visible element, or the error message key is missing from translations.

---

### Requirement C — Authentication: Registration & OTP

| Test | Status | Summary |
|------|--------|---------|
| TC019 | ❌ Failed | Registration does not redirect to OTP page |
| TC021 | ✅ Passed | Validation errors for missing fields shown correctly |
| TC023 | ❌ Failed | OTP page never reached (depends on TC019) |

---

#### TC019 — Registration submits and redirects to OTP page
- **Test Code:** [TC019_Registration_submits_with_required_fields_and_redirects_to_OTP_page.py](./TC019_Registration_submits_with_required_fields_and_redirects_to_OTP_page.py)
- **Test Visualization:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/6143234b-3f67-4b23-a1f2-e2d1b4311686
- **Status:** ❌ Failed
- **Error:** After submitting with phone `30000001`, the form stayed on `/ar/p/users/register` with no redirect to OTP.
- **Analysis:** The SMS OTP provider (Chinguisoft) is likely unavailable in the dev/test environment. The registration API may be blocking on the SMS send. Needs a mock SMS provider for test environments or an env variable to bypass OTP sending.

---

#### TC021 — Registration shows validation errors for missing required fields
- **Test Code:** [TC021_Registration_shows_validation_errors_for_missing_required_fields.py](./TC021_Registration_shows_validation_errors_for_missing_required_fields.py)
- **Test Visualization:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/79de8d4e-2650-4af5-9e65-29de7d590ebc
- **Status:** ✅ Passed
- **Analysis:** Client-side validation correctly blocks form submission and shows appropriate error messages when required fields are empty.

---

#### TC023 — OTP verification page accepts a 4-digit code entry
- **Test Code:** [TC023_OTP_verification_page_accepts_a_4_digit_code_entry_and_allows_submission.py](./TC023_OTP_verification_page_accepts_a_4_digit_code_entry_and_allows_submission.py)
- **Test Visualization:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/6a3c701c-d0a3-43fd-ab39-fbc826e28dfe
- **Status:** ❌ Failed
- **Error:** OTP page never appeared (blocked by TC019 failure). A "تحميل .." (loading) state is visible but no navigation occurs.
- **Analysis:** Cascading failure from TC019. Fix registration OTP redirect first.

---

### Requirement D — Authentication: Forgot / Reset Password

| Test | Status | Summary |
|------|--------|---------|
| TC025 | ✅ Passed | Forgot password page loads and accepts input |
| TC027 | ✅ Passed | Empty submission blocked by validation |
| TC029 | ✅ Passed | Reset password page loads and accepts all inputs |
| TC030 | ✅ Passed | Empty submission blocked by validation |
| TC031 | ❌ Failed | Mismatched passwords show no error |

---

#### TC025 — Forgot Password page loads and accepts phone input
- **Test Code:** [TC025_Forgot_Password_page_loads_and_accepts_phone_input.py](./TC025_Forgot_Password_page_loads_and_accepts_phone_input.py)
- **Test Visualization:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/0a8322b4-052e-4348-b98b-716bd2c9a452
- **Status:** ✅ Passed
- **Analysis:** Page renders correctly and accepts phone number input as expected.

---

#### TC027 — Forgot Password validation blocks empty submission
- **Test Code:** [TC027_Forgot_Password_validation_blocks_empty_submission.py](./TC027_Forgot_Password_validation_blocks_empty_submission.py)
- **Test Visualization:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/9cb0b093-2c30-43ca-a51e-364df18dd014
- **Status:** ✅ Passed
- **Analysis:** Client-side validation correctly prevents empty phone submission.

---

#### TC029 — Reset Password page loads and accepts OTP and password inputs
- **Test Code:** [TC029_Reset_Password_page_loads_and_accepts_OTP_and_password_inputs.py](./TC029_Reset_Password_page_loads_and_accepts_OTP_and_password_inputs.py)
- **Test Visualization:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/b43b2150-5d5a-4670-8012-eb35aad6567d
- **Status:** ✅ Passed
- **Analysis:** Reset password form renders correctly with OTP, new password, and confirm password fields all accepting input.

---

#### TC030 — Reset Password validation blocks empty submission
- **Test Code:** [TC030_Reset_Password_validation_blocks_empty_submission.py](./TC030_Reset_Password_validation_blocks_empty_submission.py)
- **Test Visualization:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/0cb4a86d-c1f6-4cc1-9ed4-8aee8126d955
- **Status:** ✅ Passed
- **Analysis:** Validation correctly blocks empty submission on reset password form.

---

#### TC031 — Reset Password rejects mismatched passwords
- **Test Code:** [TC031_Reset_Password_rejects_mismatched_passwords.py](./TC031_Reset_Password_rejects_mismatched_passwords.py)
- **Test Visualization:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/6bffd7f8-e23c-403a-80bb-a5169b215f30
- **Status:** ❌ Failed
- **Error:** Submitting `Password123!` vs `Password1234!` showed no mismatch error — form remained without feedback.
- **Analysis:** Password confirmation validation is missing on the reset password form. Need to add a client-side check comparing the two password fields before submission.

---

### Requirement E — Protected Routes

| Test | Status | Summary |
|------|--------|---------|
| TC033 | ✅ Passed | Unauthenticated user redirected to login |

---

#### TC033 — My Annonces List redirects unauthenticated user to login
- **Test Code:** [TC033_My_Annonces_List_redirects_unauthenticated_user_to_login.py](./TC033_My_Annonces_List_redirects_unauthenticated_user_to_login.py)
- **Test Visualization:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/e4c243cb-24a6-4941-af6f-11c512025f5c
- **Status:** ✅ Passed
- **Analysis:** Route protection is correctly implemented. Accessing `/my/annonces` without a session redirects to the login page.

---

## 3️⃣ Coverage & Matching Metrics

- **Pass rate: 46.67%** (7 / 15 tests passed)

| Requirement | Total | ✅ Passed | ❌ Failed |
|---|---|---|---|
| A — Listings Browse & Search | 4 | 1 | 3 |
| B — Authentication: Login | 2 | 0 | 2 |
| C — Authentication: Registration & OTP | 3 | 1 | 2 |
| D — Authentication: Forgot/Reset Password | 5 | 4 | 1 |
| E — Protected Routes | 1 | 1 | 0 |
| **Total** | **15** | **7** | **8** |

---

## 4️⃣ Key Gaps / Risks

### 🔴 Critical (blocks core flows)

1. **Login non-fonctionnel (TC015, TC016)** — Le formulaire de connexion ne redirige pas et n'affiche pas d'erreur. Risque élevé : bloque toutes les fonctionnalités authentifiées (dashboard, création d'annonce, favoris). Vérifier que la base dev est seedée et que l'API `/api/p/users/connexion` retourne bien le JWT + cookie.

2. **Inscription / OTP non-fonctionnel (TC019, TC023)** — L'inscription reste bloquée après soumission, probablement parce que Chinguisoft SMS est inaccessible en dev. Prévoir un mock SMS provider pour les environnements non-prod.

### 🟠 Majeur (fonctionnalité dégradée)

3. **Catégories manquantes dans les filtres (TC007)** — Le dropdown de catégorie est vide. La collection `options` n'est probablement pas seedée. Lancer `pnpm run mongo:seed` et vérifier l'endpoint qui alimente les filtres.

4. **Carte (Leaflet) non affichée sur la page détail (TC012)** — `react-leaflet` requiert `dynamic(() => import(...), { ssr: false })`. Vérifier que le composant map est bien importé en client-only.

5. **Pas de message d'erreur sur login invalide (TC016)** — L'état d'erreur de l'API n'est pas affiché dans l'UI. Connecter la réponse d'erreur au composant de feedback visuel.

### 🟡 Mineur (polish / UX)

6. **Validation "mots de passe différents" manquante sur reset password (TC031)** — Ajouter une comparaison côté client entre les deux champs avant soumission.

7. **Pagination non testable sans données (TC002)** — La base dev doit contenir suffisamment d'annonces pour dépasser une page. Utiliser `pnpm run mongo:seed` ou `pnpm run start:test` avec la base de test.

8. **Pas d'images sur la démo (TC012)** — L'annonce de démo n'a pas d'images, le carrousel affiche "No Image". Ajouter des images de test dans `mongo:seed`.
