
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** inspiring-goodall (Eddeyar / Rim-eBay)
- **Date:** 2026-04-02
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

### Requirement: Listings / Annonces Browsing
- **Description:** Users can browse annonce listings, view details (carousel, description, map, contact), and navigate between pages.

#### Test TC001 Browse annonces listing and open a listing detail page
- **Test Code:** [TC001_Browse_annonces_listing_and_open_a_listing_detail_page.py](./TC001_Browse_annonces_listing_and_open_a_listing_detail_page.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3236fd3c-10a2-4171-9605-ae4249bacafa/0d0fef4f-c3c2-4eeb-bcc3-f6982d0fc478
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Listing cards load correctly and navigating to a detail page works as expected.
---

#### Test TC002 Paginate annonces from page 1 to page 2
- **Test Code:** [TC002_Paginate_annonces_from_page_1_to_page_2.py](./TC002_Paginate_annonces_from_page_1_to_page_2.py)
- **Test Error:** No next page could be loaded because a second page does not exist. Page indicator reads 'الصفحة 1 من 1'.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3236fd3c-10a2-4171-9605-ae4249bacafa/82cfce5b-bdd1-40e3-9a9c-4c0e6b0172cc
- **Status:** ❌ Failed
- **Severity:** LOW
- **Analysis / Findings:** The test database (rim-ebay-test) has insufficient seed data to produce more than one page of results. Pagination UI is present and functional; the failure reflects missing test data, not a code defect. Seed more annonces to cover this scenario.
---

#### Test TC012 View annonce details including carousel, description, map and contact section
- **Test Code:** [TC012_View_annonce_details_including_carousel_description_map_and_contact_section.py](./TC012_View_annonce_details_including_carousel_description_map_and_contact_section.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3236fd3c-10a2-4171-9605-ae4249bacafa/3095f082-3d90-4b6f-ad9b-f3c62cea7895
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Detail page correctly renders image carousel, description, interactive map (react-leaflet), and contact section.
---

### Requirement: Search & Filters
- **Description:** Users can filter annonces by type, category, subcategory, price range, and location (wilaya / moughataa).

#### Test TC007 Apply full set of search filters to narrow results
- **Test Code:** [TC007_Apply_full_set_of_search_filters_to_narrow_results.py](./TC007_Apply_full_set_of_search_filters_to_narrow_results.py)
- **Test Error:** Category dropdown shows only placeholder 'اختر الفئة' with no options. Subcategory and moughataa controls are non-interactive divs.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3236fd3c-10a2-4171-9605-ae4249bacafa/cbb1f767-856c-4d34-baba-a398fcbc279d
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** Filter dropdowns for category, subcategory, and moughataa are either empty or non-interactive. This is likely a data-loading issue (options collection not seeded / API not returning data) or a client-side rendering bug. The type filter works. Investigate the `options` and `lieux` collections in the test database and the corresponding API routes (`/api/annonces`, `/app/[locale]/ui.tsx` filter components).
---

### Requirement: User Authentication — Login
- **Description:** Users can log in with phone+password or email+password; invalid credentials show an error.

#### Test TC015 Login with valid phone and password redirects to home
- **Test Code:** [TC015_Login_with_valid_phone_and_password_redirects_to_home.py](./TC015_Login_with_valid_phone_and_password_redirects_to_home.py)
- **Test Error:** After submitting phone=36000000 and password=password123, the page remained on `/ar/p/users/connexion` with no redirect.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3236fd3c-10a2-4171-9605-ae4249bacafa/1629388c-f8d2-488f-ab6b-0af91ea03d7c
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The demo account password seeded by `mongo:seed` is `Demo1234!`, not `password123`. The test used the wrong credential. Either update the test to use the correct password, or document the correct demo credentials clearly. The login flow itself may be functional.
---

#### Test TC016 Login with invalid credentials shows an error
- **Test Code:** [TC016_Login_with_invalid_credentials_shows_an_error.py](./TC016_Login_with_invalid_credentials_shows_an_error.py)
- **Test Error:** Submitting incorrect credentials showed no error message; the page stayed on the login screen silently.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3236fd3c-10a2-4171-9605-ae4249bacafa/cbf60dc6-b429-4ba0-b013-5790a495d0d5
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The login API does not appear to surface a visible error message (toast or inline) when credentials are invalid. The UI should display an Arabic error such as 'بيانات الدخول غير صحيحة' on a failed authentication response. Investigate the login route handler and the client-side error state rendering.
---

### Requirement: User Authentication — Registration
- **Description:** New users can register with phone or email; required-field validation is enforced; successful submission navigates to OTP page.

#### Test TC019 Registration submits with required fields and redirects to OTP page
- **Test Code:** [TC019_Registration_submits_with_required_fields_and_redirects_to_OTP_page.py](./TC019_Registration_submits_with_required_fields_and_redirects_to_OTP_page.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3236fd3c-10a2-4171-9605-ae4249bacafa/e0fade0d-731a-434b-841e-1415353f8c46
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Registration with required fields correctly redirects to the OTP verification page.
---

#### Test TC021 Registration shows validation errors for missing required fields
- **Test Code:** [TC021_Registration_shows_validation_errors_for_missing_required_fields.py](./TC021_Registration_shows_validation_errors_for_missing_required_fields.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3236fd3c-10a2-4171-9605-ae4249bacafa/27ea5639-9b04-4218-b179-f51eeb0cff54
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Client-side validation correctly blocks submission and displays errors for empty required fields.
---

### Requirement: OTP Verification
- **Description:** After registration or phone login, users enter an OTP code to verify their phone number.

#### Test TC023 OTP verification page accepts a 4-digit code entry and allows submission
- **Test Code:** [TC023_OTP_verification_page_accepts_a_4_digit_code_entry_and_allows_submission.py](./TC023_OTP_verification_page_accepts_a_4_digit_code_entry_and_allows_submission.py)
- **Test Error:** The OTP input placeholder reads 'digit code-6' — the form expects a 6-digit code, not 4-digit.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3236fd3c-10a2-4171-9605-ae4249bacafa/5901fa14-ddd0-4057-8b09-31d470fad2f0
- **Status:** ❌ Failed
- **Severity:** MEDIUM
- **Analysis / Findings:** Test expectation (4-digit OTP) does not match the implemented code length (6-digit). If the spec requires 4 digits, update the OTP input component and the Chinguisoft integration. If 6 digits is correct, update the test plan to reflect the actual requirement.
---

### Requirement: Password Reset
- **Description:** Users can reset their password via phone OTP; form validates empty fields and password mismatch.

#### Test TC025 Forgot Password page loads and accepts phone input
- **Test Code:** [TC025_Forgot_Password_page_loads_and_accepts_phone_input.py](./TC025_Forgot_Password_page_loads_and_accepts_phone_input.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3236fd3c-10a2-4171-9605-ae4249bacafa/e493ff1d-7755-4436-ae9f-221ad00d12e9
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Forgot-password page renders correctly and accepts phone input.
---

#### Test TC027 Forgot Password validation blocks empty submission
- **Test Code:** [TC027_Forgot_Password_validation_blocks_empty_submission.py](./TC027_Forgot_Password_validation_blocks_empty_submission.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3236fd3c-10a2-4171-9605-ae4249bacafa/eb7fc84e-bdd9-4235-ae4b-81724c0084e7
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Empty submission is correctly blocked with a validation error.
---

#### Test TC029 Reset Password page loads and accepts OTP and password inputs
- **Test Code:** [TC029_Reset_Password_page_loads_and_accepts_OTP_and_password_inputs.py](./TC029_Reset_Password_page_loads_and_accepts_OTP_and_password_inputs.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3236fd3c-10a2-4171-9605-ae4249bacafa/213139df-6572-4e01-bf8c-994077161707
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Reset password page renders OTP, new password, and confirm password inputs correctly.
---

#### Test TC030 Reset Password validation blocks empty submission
- **Test Code:** [TC030_Reset_Password_validation_blocks_empty_submission.py](./TC030_Reset_Password_validation_blocks_empty_submission.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3236fd3c-10a2-4171-9605-ae4249bacafa/0f5bd5fe-1fb1-4a90-9f3e-964b047fc596
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Empty form submission is correctly blocked.
---

#### Test TC031 Reset Password rejects mismatched passwords
- **Test Code:** [TC031_Reset_Password_rejects_mismatched_passwords.py](./TC031_Reset_Password_rejects_mismatched_passwords.py)
- **Test Error:** Submitting mismatched passwords showed a toast 'يرجى إدخال رقم هاتفك.' (unrelated) instead of a password-mismatch error.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3236fd3c-10a2-4171-9605-ae4249bacafa/3cc5e394-092c-4fce-ba91-33625221197b
- **Status:** ❌ Failed
- **Severity:** MEDIUM
- **Analysis / Findings:** The reset-password form lacks client-side validation for password confirmation mismatch. The toast shown ('يرجى إدخال رقم هاتفك.') suggests the form may require phone context passed from the forgot-password flow, which is missing when navigating directly. Add explicit password-match validation in the form and ensure the phone context is propagated correctly.
---

### Requirement: Protected Routes
- **Description:** Authenticated-only pages redirect unauthenticated users to the login page.

#### Test TC033 My Annonces List redirects unauthenticated user to login
- **Test Code:** [TC033_My_Annonces_List_redirects_unauthenticated_user_to_login.py](./TC033_My_Annonces_List_redirects_unauthenticated_user_to_login.py)
- **Test Error:**
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3236fd3c-10a2-4171-9605-ae4249bacafa/1eaaf962-f84c-497a-ad1c-473ae5e96077
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Unauthenticated access to `/my/annonces` correctly redirects to the login page.
---

## 3️⃣ Coverage & Matching Metrics

- **60% of tests passed** (9 / 15)

| Requirement                          | Total Tests | ✅ Passed | ❌ Failed |
|--------------------------------------|-------------|-----------|----------|
| Listings / Annonces Browsing         | 3           | 2         | 1        |
| Search & Filters                     | 1           | 0         | 1        |
| User Authentication — Login          | 2           | 0         | 2        |
| User Authentication — Registration   | 2           | 2         | 0        |
| OTP Verification                     | 1           | 0         | 1        |
| Password Reset                       | 5           | 4         | 1        |
| Protected Routes                     | 1           | 1         | 0        |
| **Total**                            | **15**      | **9**     | **6**    |

---

## 4️⃣ Key Gaps / Risks

> **60% of tests passed fully (9/15).**

**Critical issues to fix:**

1. **Login error feedback missing (TC016) — HIGH**: Invalid credentials silently fail with no user-facing error message. This is a UX and security-perception risk. Add error state rendering in the login form client component.

2. **Search filters non-functional (TC007) — HIGH**: Category, subcategory, and moughataa dropdowns render empty or as static divs. This blocks a core discovery feature. Investigate whether `options` and `lieux` collections are seeded in the test database and whether the filter API endpoints return data correctly.

3. **Login credential mismatch in test data (TC015) — MEDIUM**: The demo account password is `Demo1234!` but the test used `password123`. Standardize demo credentials across test plans and documentation.

4. **Password mismatch validation absent (TC031) — MEDIUM**: The reset-password form does not validate that the two password fields match before submitting. Add client-side `confirmPassword` validation. Also investigate why the form shows a "phone required" toast when accessed without forgot-password flow context.

5. **OTP code length discrepancy (TC023) — MEDIUM**: The implemented OTP input expects 6 digits; the test plan specified 4. Clarify the correct length with the Chinguisoft SMS provider spec and align the UI and test plan accordingly.

6. **Insufficient seed data for pagination (TC002) — LOW**: Only 1 page of annonces exists in the test database. Add more seed entries to `rim-ebay-test` so that pagination logic can be exercised end-to-end.
