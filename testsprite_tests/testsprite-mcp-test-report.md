
# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** Eddeyar (bold-curran) — Rim-eBay Mauritanian Marketplace
- **Date:** 2026-03-30
- **Prepared by:** TestSprite AI Team
- **Test Scope:** Frontend E2E — full codebase
- **Server Mode:** Development (port 3000)
- **Total Tests Run:** 15
- **Pass Rate:** 26.67% (4 passed / 11 failed)

---

## 2️⃣ Requirement Validation Summary

---

### Requirement: Browse & Search Listings
- **Description:** Users can browse listing cards on the home page and filter by category, type, location, price, and keyword.

#### Test TC001 — Home page loads and shows listing cards
- **Test Code:** [TC001_Home_page_loads_and_shows_listing_cards.py](./TC001_Home_page_loads_and_shows_listing_cards.py)
- **Test Error:** Listing result cards were not displayed on the home page. The page shows `لا توجد إعلانات.` (No listings).
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/b3745f7f-a539-461d-998d-5d7ab9c8b4bd
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The database appears to be empty or disconnected. No annonces are returned from `/api/annonces`. The search UI (header, filters, search button) loads correctly, but the results area is empty. This blocks all listing-dependent tests (TC006, TC009). Seed the database with sample listings or verify MongoDB connectivity.

---

#### Test TC002 — Filter listings by category, type, and location hierarchy
- **Test Code:** [TC002_Filter_listings_by_category_type_and_location_hierarchy.py](./TC002_Filter_listings_by_category_type_and_location_hierarchy.py)
- **Test Error:** Filter dropdowns only show placeholder text (e.g., `اختر النوع`, `اختر الولاية`) with no selectable options. No listings to observe filter effects.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/6bc52208-1619-4226-ac5e-02ed9b2f7e48
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The `/api/wilayas`, `/api/lieux/moughataas`, and category/type option endpoints are returning empty data. Filter dropdowns are not populated. This confirms that reference data collections (`categories`, `type_annonces`, `wilayas`, `moughataas`) are empty or not seeded in the current environment.

---

#### Test TC003 — Filter listings by price range
- **Test Code:** [TC003_Filter_listings_by_price_range.py](./TC003_Filter_listings_by_price_range.py)
- **Test Error:** The UI provides only a single `السعر` (Price) input — no separate min/max price range controls or slider exist.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/e14411bd-0197-41a5-be76-a4a124f33ffc
- **Status:** ❌ Failed
- **Severity:** MEDIUM
- **Analysis / Findings:** The search form currently exposes a single price field. The backend `annoncesService.ts` supports price filtering, but the frontend needs separate `priceMin` / `priceMax` inputs to expose this capability fully to users.

---

#### Test TC004 — Search by keyword query
- **Test Code:** [TC004_Search_by_keyword_query.py](./TC004_Search_by_keyword_query.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/d6ec36ef-74d8-4cc8-86b1-73e24cd74704
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** The keyword search input accepts text and submits the query without errors. The search flow functions correctly at the UI level even when the results set is empty.

---

#### Test TC006 — Navigate from listing card to listing detail page
- **Test Code:** [TC006_Navigate_from_listing_card_to_listing_detail_page.py](./TC006_Navigate_from_listing_card_to_listing_detail_page.py)
- **Test Error:** No listing cards are present to click, because the database is empty.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/17aa33ab-99fa-4d2c-b058-337cfb7333b7
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** Blocked by the empty database issue (same root cause as TC001). Once listings exist, this test should re-run.

---

### Requirement: Listing Details Page
- **Description:** Clicking a listing opens a detail page with images, description, location map, price, and seller contact.

#### Test TC009 — Listing details page shows images, description, location, map, and contact section
- **Test Code:** [TC009_Listing_details_page_shows_images_description_location_map_and_contact_section.py](./TC009_Listing_details_page_shows_images_description_location_map_and_contact_section.py)
- **Test Error:** Could not reach the detail page — no listings present.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/33d9b746-4c4e-417b-b1a1-8925800c60b2
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** Blocked by the empty database. Detail page rendering (carousel, map, contact) cannot be evaluated without at least one listing. Seed data required.

---

### Requirement: User Authentication — Login
- **Description:** Users can log in with email/password or phone, receive a JWT session, and be redirected home. Invalid credentials show an error.

#### Test TC012 — Login with email and password succeeds and redirects to home
- **Test Code:** [TC012_Login_with_email_and_password_succeeds_and_redirects_to_home.py](./TC012_Login_with_email_and_password_succeeds_and_redirects_to_home.py)
- **Test Error:** After submitting credentials the browser remained on `/ar/p/users/connexion`. No redirect occurred.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/62f32699-c608-4a61-b3ab-28ef2cdfade1
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The login page uses a phone number input (`input[type=tel]`) as the primary identifier, not email. The test attempted an email-based login flow that does not exist in the current UI. Additionally, the test credentials may not exist in the database. Two issues: (1) UI only exposes phone login, hiding email login, or the test needs to target the phone tab; (2) test user account must be pre-seeded.

---

#### Test TC013 — Login with invalid email/password shows error
- **Test Code:** [TC013_Login_with_invalid_emailpassword_shows_error.py](./TC013_Login_with_invalid_emailpassword_shows_error.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/30bfc17e-986d-4ece-9311-f66a003d9250
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Error feedback for invalid credentials is correctly displayed. The form does not silently fail on bad input.

---

### Requirement: User Authentication — Registration
- **Description:** Users can register with email or phone. Phone flow redirects to OTP verification. Form shows errors for missing/invalid fields.

#### Test TC016 — Register with email successfully redirects to home
- **Test Code:** [TC016_Register_with_email_successfully_redirects_to_home.py](./TC016_Register_with_email_successfully_redirects_to_home.py)
- **Test Error:** The registration form only has a phone number field — no email field or tab switch was found.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/b0c210b1-1e37-4754-9410-09f1a5c80262
- **Status:** ❌ Failed
- **Severity:** MEDIUM
- **Analysis / Findings:** The registration page at `/ar/p/users/register` exposes only phone-based registration in the current UI, despite the backend supporting email registration (`/api/p/users/register`). Either the email registration tab/toggle was removed from the UI, or it was never implemented on the frontend. The backend route exists but is unreachable via the UI.

---

#### Test TC017 — Register with phone redirects to OTP verification page
- **Test Code:** [TC017_Register_with_phone_redirects_to_OTP_verification_page.py](./TC017_Register_with_phone_redirects_to_OTP_verification_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/0948a76d-23fb-4190-adc8-112088fa70ae
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Phone registration works end-to-end. After submitting a valid phone number the user is correctly redirected to the OTP verification page.

---

#### Test TC018 — Registration shows validation errors for missing required fields
- **Test Code:** [TC018_Registration_shows_validation_errors_for_missing_required_fields.py](./TC018_Registration_shows_validation_errors_for_missing_required_fields.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/25a3540e-bba9-4c02-8039-26081884aee9
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Required-field validation works correctly. The form shows appropriate error messages when fields are left blank.

---

### Requirement: OTP Verification
- **Description:** After registration or phone login, users receive an SMS OTP. Entering the correct code auto-logs in the user; an incorrect code shows an error.

#### Test TC024 — OTP verification success auto-logs in and redirects to home
- **Test Code:** [TC024_OTP_verification_success_auto_logs_in_and_redirects_to_home.py](./TC024_OTP_verification_success_auto_logs_in_and_redirects_to_home.py)
- **Test Error:** The OTP page was unstable — the page repeatedly redirected away to `/ar` before the code could be submitted. The Verify button was intermittently non-interactable.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/e335fe2b-3665-4423-bb5e-f5072f50dbb6
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The OTP page at `/ar/p/verification/otp` lacks stable persistence. When navigated to directly (without going through the registration flow first), it redirects back to the home page. The page requires session/state context (phone number stored in cookie/localStorage) that is lost on direct navigation. Additionally, the hardcoded OTP `"1234"` in development mode could not be reliably submitted due to UI instability. The component needs a guard to keep the user on the page until verification completes.

---

#### Test TC025 — OTP verification shows error for incorrect code
- **Test Code:** [TC025_OTP_verification_shows_error_for_incorrect_code.py](./TC025_OTP_verification_shows_error_for_incorrect_code.py)
- **Test Error:** Submitting an incorrect OTP code (`0000`) showed no error message. The app redirected to the home page instead.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/595e0524-4390-475f-a402-779a50b674ba
- **Status:** ❌ Failed
- **Severity:** MEDIUM
- **Analysis / Findings:** Error handling after a failed OTP submission is missing or silenced. The API call to `/api/otp/verify` likely returns an error, but the frontend does not display it — it redirects to home instead. The component should catch the error response and display an inline error message to the user without navigating away.

---

### Requirement: Password Reset
- **Description:** Users can request a password reset via their phone number. An OTP is sent; entering the correct OTP allows setting a new password. Wrong OTP shows an error.

#### Test TC029 — Forgot password page loads and accepts phone input
- **Test Code:** [TC029_Forgot_password_page_loads_and_accepts_phone_input.py](./TC029_Forgot_password_page_loads_and_accepts_phone_input.py)
- **Test Error:** After submitting the phone number, no confirmation, OTP instructions, or error message appeared. The page stayed idle on the form.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/b4a6b51e-cadf-4e3d-97c6-aef5c06480da
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The forgot-password form submits with no visible feedback. The backend route (`/api/p/users/forgot-password`) may be returning an error silently. The phone number `36000000` does not exist in the database, which could cause a silent failure. Additionally the frontend should display a success or error state after submission regardless of result.

---

#### Test TC033 — Reset password with wrong OTP shows an error
- **Test Code:** [TC033_Reset_password_with_wrong_OTP_shows_an_error.py](./TC033_Reset_password_with_wrong_OTP_shows_an_error.py)
- **Test Error:** Submitting the reset-password form with OTP `0000` produced no error message. The form remained visible with fields intact.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/b9daf723-89a4-42da-958f-cddbacc304ee
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The reset-password endpoint returns 501 Not Implemented (confirmed from code analysis). Even if a correct OTP were provided, the reset would fail. The frontend also does not surface the 501 error to the user. Both the backend implementation and the frontend error display need to be completed.

---

## 3️⃣ Coverage & Matching Metrics

- **26.67% of tests passed** (4 out of 15)

| Requirement                        | Total Tests | ✅ Passed | ❌ Failed |
|------------------------------------|-------------|-----------|----------|
| Browse & Search Listings           | 5           | 1         | 4        |
| Listing Details Page               | 1           | 0         | 1        |
| User Authentication — Login        | 2           | 1         | 1        |
| User Authentication — Registration | 3           | 2         | 1        |
| OTP Verification                   | 2           | 0         | 2        |
| Password Reset                     | 2           | 0         | 2        |
| **Total**                          | **15**      | **4**     | **11**   |

---

## 4️⃣ Key Gaps / Risks

**Overall: 26.67% pass rate. The majority of failures stem from two root causes: an empty database and incomplete frontend error handling.**

### Critical Blockers (fix first)
1. **Empty Database / Missing Seed Data** — 5 tests (TC001, TC002, TC006, TC009, TC002) fail because there are no listings, categories, wilayas, or moughataas in the database. Run `pnpm run mongo:init` and seed reference data + at least a few sample annonces.
2. **Reset Password Not Implemented** — The `/api/p/users/reset-password` endpoint returns `501 Not Implemented`. The entire password-reset flow is broken (TC029, TC033).
3. **OTP Page Instability** — The `/ar/p/verification/otp` page redirects away when navigated to directly (TC024, TC025). It needs a state guard (check for pending phone in session/cookie before allowing access).

### High-Priority Bugs
4. **Login Does Not Redirect** (TC012) — After a successful login the user stays on the login page. JWT cookie may be set correctly but the `router.push()` is not firing, or the login uses phone-only in the UI while the test expects email.
5. **Forgot Password Form Gives No Feedback** (TC029) — Silent failure on form submit. Both success and error states must display UI feedback.
6. **Wrong OTP Shows No Error** (TC025, TC033) — API error responses are swallowed by the frontend without showing a user-visible message.

### Medium-Priority Issues
7. **No Email Registration in UI** (TC016) — The email registration backend route exists but is not exposed in the registration form. Add an email tab/toggle or document this as intentional.
8. **Single Price Field vs Min/Max** (TC003) — The backend supports price range filtering but the UI only has one price input. Add `priceMin` / `priceMax` fields.
9. **Filter Dropdowns Empty** (TC002) — Even when the DB is seeded, the wilaya/moughataa endpoints reportedly return empty arrays. Verify the seed initialises all reference collections.

### Known Technical Risks (from code review)
- Hardcoded OTP `"1234"` in development paths — must not reach production.
- Image deletion does not remove files from Vercel Blob — orphaned storage will accumulate.
- AI-powered search returns empty results on API failure with no standard-search fallback.
