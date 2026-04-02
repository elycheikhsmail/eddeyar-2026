
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** eddeyar-2026
- **Date:** 2026-04-01
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Browse annonces listing and open a listing detail page
- **Test Code:** [TC001_Browse_annonces_listing_and_open_a_listing_detail_page.py](./TC001_Browse_annonces_listing_and_open_a_listing_detail_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/cf370ca6-6de8-4eb7-a56e-22ec0ef05e94
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Paginate annonces from page 1 to page 2
- **Test Code:** [TC002_Paginate_annonces_from_page_1_to_page_2.py](./TC002_Paginate_annonces_from_page_1_to_page_2.py)
- **Test Error:** Pagination could not be tested because the listings area contains no results and there is no pagination control to interact with.

Observations:
- The page displays the message 'لا توجد إعلانات.' (No listings) in the listings area.
- No pagination controls (e.g., 'التالي' / Next or page numbers) are present among the visible interactive elements.
- A previous attempt to click the 'التالي' control failed due to the element index not being available.
- The current tab URL shows /ar?page=2, but the listings did not change and pagination UI is absent.
- Search and filter controls are present on the page, indicating the page loaded but lacks paginated results to test.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/e1a7a60a-26f2-48c3-b8ae-04e3745946cb
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Apply full set of search filters to narrow results
- **Test Code:** [TC007_Apply_full_set_of_search_filters_to_narrow_results.py](./TC007_Apply_full_set_of_search_filters_to_narrow_results.py)
- **Test Error:** Cannot complete the filter submission because the category options are missing.

Observations:
- The advanced search form is visible and some fields were filled: Type = 'بيع', Keyword = 'عقار', Price = '1000000'.
- The category dropdown (اختر الفئة) only contains the placeholder option 'اختر الفئة' and no selectable categories.
- The subcategory dropdown also shows only its placeholder and has no real options.
- Because category/subcategory options are not available, a category cannot be selected and the filter cannot be meaningfully submitted.
- The listing grid remains visible with unfiltered results on the right side of the page (no indication that filters were applied).
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/ab01f768-605a-4192-82f9-2e698df5a12d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 View annonce details including carousel, description, map and contact section
- **Test Code:** [TC012_View_annonce_details_including_carousel_description_map_and_contact_section.py](./TC012_View_annonce_details_including_carousel_description_map_and_contact_section.py)
- **Test Error:** The annonce detail page opened, but the embedded location map is not displayed.

Observations:
- The page loaded with title: "Appartement F3 — Tevragh-Zeina".
- Price shown: 2,800,000 UM.
- Description and category are present (Appartement 3 pièces, 80 m², ...).
- Seller contact phone is visible: 36000000.
- The large media area shows "No Image" (no image gallery/carousel with photos) and no interactive map widget is displayed — only the textual location "نواكشوط الغربية - تفرغ زينة" is shown.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/e3689ffa-1dda-455f-b892-e6a8f4604eaf
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Login with valid phone and password redirects to home
- **Test Code:** [TC015_Login_with_valid_phone_and_password_redirects_to_home.py](./TC015_Login_with_valid_phone_and_password_redirects_to_home.py)
- **Test Error:** Login did not complete — the app remained on the login page and did not redirect to the home page.

Observations:
- After submitting the login form the page stayed on the login screen (/ar/p/users/connexion).
- The phone field contains "36000000".
- The password field was filled (masked).
- The "الدخول للاعلانات الآن" submit button is visible on the page.
- No success message or homepage content was displayed after submission.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/81e07508-0bb0-4bb2-8542-47a20454cdce
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Login with invalid credentials shows an error
- **Test Code:** [TC016_Login_with_invalid_credentials_shows_an_error.py](./TC016_Login_with_invalid_credentials_shows_an_error.py)
- **Test Error:** Submitting incorrect login credentials did not show an error message and the page stayed on the login form. The invalid-credentials error message expected after submitting wrong phone/password was not visible.

Observations:
- The page remained on the login screen (http://localhost:3000/ar/p/users/connexion) after the submit action.
- The phone field shows the entered value '12345' and the password field is populated.
- No visible error text was found (no Arabic or English messages such as 'خطأ', 'غير صحيح', 'فشل', 'invalid', 'login failed', or similar).
- The visible page text only contains UI labels for the login form (phone, password, submit) and links (create account, forgot password).
- The expected invalid-credentials feedback does not appear in the viewport or page content.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/dec79c12-6a98-43ae-a61c-1960ac6a6e5c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Registration submits with required fields and redirects to OTP page
- **Test Code:** [TC019_Registration_submits_with_required_fields_and_redirects_to_OTP_page.py](./TC019_Registration_submits_with_required_fields_and_redirects_to_OTP_page.py)
- **Test Error:** Registration did not redirect to the OTP verification page after submitting the form.

Observations:
- The page remained on the registration URL (/ar/p/users/register) after the submit action.
- The registration form is still visible with the phone field containing '30000001' and password fields filled.
- No OTP input field, verification prompt, or text indicating an OTP step was found on the page.
- The submit button was clicked but no navigation or page change to an OTP screen occurred.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/6143234b-3f67-4b23-a1f2-e2d1b4311686
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021 Registration shows validation errors for missing required fields
- **Test Code:** [TC021_Registration_shows_validation_errors_for_missing_required_fields.py](./TC021_Registration_shows_validation_errors_for_missing_required_fields.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/79de8d4e-2650-4af5-9e65-29de7d590ebc
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC023 OTP verification page accepts a 4-digit code entry and allows submission
- **Test Code:** [TC023_OTP_verification_page_accepts_a_4_digit_code_entry_and_allows_submission.py](./TC023_OTP_verification_page_accepts_a_4_digit_code_entry_and_allows_submission.py)
- **Test Error:** The OTP verification page did not appear after submitting the registration form, so entering a 4-digit code could not be tested.

Observations:
- After clicking the registration submit button, the registration form remained visible (no redirect to an OTP page).
- No 4-digit OTP input fields or OTP entry area are present on the page.
- The phone field contains '30000001' and both password fields were filled before submission.
- A message/box reading 'تحميل ..' is visible below the submit button (suggesting loading or an error state).
- The submit button 'انشاء حساب و اضافة اعلان الآن' is still present on the form.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/6a3c701c-d0a3-43fd-ab39-fbc826e28dfe
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC025 Forgot Password page loads and accepts phone input
- **Test Code:** [TC025_Forgot_Password_page_loads_and_accepts_phone_input.py](./TC025_Forgot_Password_page_loads_and_accepts_phone_input.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/0a8322b4-052e-4348-b98b-716bd2c9a452
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC027 Forgot Password validation blocks empty submission
- **Test Code:** [TC027_Forgot_Password_validation_blocks_empty_submission.py](./TC027_Forgot_Password_validation_blocks_empty_submission.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/9cb0b093-2c30-43ca-a51e-364df18dd014
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC029 Reset Password page loads and accepts OTP and password inputs
- **Test Code:** [TC029_Reset_Password_page_loads_and_accepts_OTP_and_password_inputs.py](./TC029_Reset_Password_page_loads_and_accepts_OTP_and_password_inputs.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/b43b2150-5d5a-4670-8012-eb35aad6567d
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC030 Reset Password validation blocks empty submission
- **Test Code:** [TC030_Reset_Password_validation_blocks_empty_submission.py](./TC030_Reset_Password_validation_blocks_empty_submission.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/0cb4a86d-c1f6-4cc1-9ed4-8aee8126d955
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC031 Reset Password rejects mismatched passwords
- **Test Code:** [TC031_Reset_Password_rejects_mismatched_passwords.py](./TC031_Reset_Password_rejects_mismatched_passwords.py)
- **Test Error:** The password mismatch validation did not appear when submitting the reset form with non-matching new password and confirmation.

Observations:
- The page is /ar/p/users/reset-password and the reset form is visible.
- OTP field contains '123456'.
- New password field contains 'Password123!'; Confirm password field contains 'Password1234!'.
- The 'إعادة تعيين' (Reset) button was clicked (multiple attempts) and the form remained on the page.
- No visible validation error message (Arabic or English) indicating the passwords do not match was found on the page.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/6bffd7f8-e23c-403a-80bb-a5169b215f30
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC033 My Annonces List redirects unauthenticated user to login
- **Test Code:** [TC033_My_Annonces_List_redirects_unauthenticated_user_to_login.py](./TC033_My_Annonces_List_redirects_unauthenticated_user_to_login.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/cedbe8b3-21a3-42be-8a15-06ed203d6124/e4c243cb-24a6-4941-af6f-11c512025f5c
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **46.67** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---