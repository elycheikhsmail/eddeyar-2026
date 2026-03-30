
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** bold-curran
- **Date:** 2026-03-30
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Home page loads and shows listing cards
- **Test Code:** [TC001_Home_page_loads_and_shows_listing_cards.py](./TC001_Home_page_loads_and_shows_listing_cards.py)
- **Test Error:** Listing result cards were not displayed on the home page. The page shows a message indicating there are no listings.

Observations:
- The page header 'بحث متقدم' and the search input field are visible.
- Multiple filter controls (type, category, subcategory, state) and a search button are present.
- The main results area displays the text 'لا توجد إعلانات.' (Arabic: 'No listings').
- No listing/result cards or item cards are visible on the page.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/b3745f7f-a539-461d-998d-5d7ab9c8b4bd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Filter listings by category, type, and location hierarchy
- **Test Code:** [TC002_Filter_listings_by_category_type_and_location_hierarchy.py](./TC002_Filter_listings_by_category_type_and_location_hierarchy.py)
- **Test Error:** The advanced filtering cannot be verified because the filter controls do not provide selectable options and there are no listings to observe filter effects.

Observations:
- The advanced search page displays filter dropdowns, but they only show placeholder text (e.g., 'اختر النوع', 'اختر الولاية') with no selectable options.
- Dropdown components appear to have only the default placeholder option (options count = 1).
- The main listings area shows the message 'لا توجد إعلانات.' (no listings), so filter effects cannot be validated.
- No moughataa (district) options or values are visible on the page.


- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/6bc52208-1619-4226-ac5e-02ed9b2f7e48
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Filter listings by price range
- **Test Code:** [TC003_Filter_listings_by_price_range.py](./TC003_Filter_listings_by_price_range.py)
- **Test Error:** Unable to apply a price range because the advanced search page does not provide both minimum and maximum price controls.

Observations:
- The page displays the Arabic advanced search interface (بحث متقدم).
- A single numeric input labeled 'السعر' (Price) is present, but no separate minimum and maximum price inputs or range slider were found.
- A 'بحث' (Search) button is available on the page.
- The listings area shows 'لا توجد إعلانات.' (No listings), so search results could not be verified.

Because the UI lacks explicit min/max price controls, a price-range filter cannot be applied for verification.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/e14411bd-0197-41a5-be76-a4a124f33ffc
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Search by keyword query
- **Test Code:** [TC004_Search_by_keyword_query.py](./TC004_Search_by_keyword_query.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/d6ec36ef-74d8-4cc8-86b1-73e24cd74704
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Navigate from listing card to listing detail page
- **Test Code:** [TC006_Navigate_from_listing_card_to_listing_detail_page.py](./TC006_Navigate_from_listing_card_to_listing_detail_page.py)
- **Test Error:** No listing detail could be opened because there are no listings in the search results.

Observations:
- The /ar advanced search page loaded successfully (header shows 'بحث متقدم').
- The results area displays the message 'لا توجد إعلانات.' indicating there are no listings.
- There are no listing cards or clickable result items present on the page to open a detail view.
- Search inputs and filter controls are available, but they do not produce any listings in the current state.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/17aa33ab-99fa-4d2c-b058-337cfb7333b7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Listing details page shows images, description, location, map, and contact section
- **Test Code:** [TC009_Listing_details_page_shows_images_description_location_map_and_contact_section.py](./TC009_Listing_details_page_shows_images_description_location_map_and_contact_section.py)
- **Test Error:** Could not verify the listing details page because no listings are present on the page.

Observations:
- The advanced search page (/ar) loaded successfully and is visible.
- The page displays the search input and filter widgets (type, category, state, price, etc.).
- The central listings area shows the message 'لا توجد إعلانات.' (No listings).
- There are no listing cards or links available to click and open a listing details page.
- A right-side 'بحث متقدم' panel with dropdown filters is visible.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/33d9b746-4c4e-417b-b1a1-8925800c60b2
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Login with email and password succeeds and redirects to home
- **Test Code:** [TC012_Login_with_email_and_password_succeeds_and_redirects_to_home.py](./TC012_Login_with_email_and_password_succeeds_and_redirects_to_home.py)
- **Test Error:** Login did not redirect to the home page after submitting the credentials.

Observations:
- After submitting the form the browser remained on /ar/p/users/connexion (login page).
- The login card with phone and password inputs is still visible and populated.
- The URL did not change to /ar or the site home page.
- A loading spinner was shown on the submit button briefly, but no redirect occurred.
- No success message or logged-in UI was observed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/62f32699-c608-4a61-b3ab-28ef2cdfade1
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Login with invalid email/password shows error
- **Test Code:** [TC013_Login_with_invalid_emailpassword_shows_error.py](./TC013_Login_with_invalid_emailpassword_shows_error.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/30bfc17e-986d-4ece-9311-f66a003d9250
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Register with email successfully redirects to home
- **Test Code:** [TC016_Register_with_email_successfully_redirects_to_home.py](./TC016_Register_with_email_successfully_redirects_to_home.py)
- **Test Error:** Email registration could not be completed because the registration form only accepts a phone number and no option to register with an email was found.

Observations:
- The registration page (/ar/p/users/register) contains an input for phone number (placeholder: 30000000) instead of an email field.
- No "register with email" option, tab, or toggle was visible on the page.
- The form shows password and confirm password fields, user type radio buttons, and a submit button labeled 'انشاء حساب و اضافة اعلان الآن'.
- Interactive elements include input[type=tel] id=contact and no input[type=email] or email-labeled field was present.
- The page loaded successfully after clicking 'إنشاء حساب', but the requested email registration flow is not supported by the UI.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/b0c210b1-1e37-4754-9410-09f1a5c80262
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 Register with phone redirects to OTP verification page
- **Test Code:** [TC017_Register_with_phone_redirects_to_OTP_verification_page.py](./TC017_Register_with_phone_redirects_to_OTP_verification_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/0948a76d-23fb-4190-adc8-112088fa70ae
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Registration shows validation errors for missing required fields
- **Test Code:** [TC018_Registration_shows_validation_errors_for_missing_required_fields.py](./TC018_Registration_shows_validation_errors_for_missing_required_fields.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/25a3540e-bba9-4c02-8039-26081884aee9
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC024 OTP verification success auto-logs in and redirects to home
- **Test Code:** [TC024_OTP_verification_success_auto_logs_in_and_redirects_to_home.py](./TC024_OTP_verification_success_auto_logs_in_and_redirects_to_home.py)
- **Test Error:** OTP verification could not be completed. Submitting the 4-digit code did not result in a login and the site often returned to the home page instead of a stable verification state.

Observations:
- The OTP input field appeared and the code '1234' was entered (attempted 2 times).
- Clicking the 'Verify' button failed on multiple attempts; the button was reported as not interactable or its element index became stale.
- Navigations to /ar/p/verification/otp were attempted several times (~6-7), and the page sometimes returned to the home page (/ar) instead of staying on a stable verification UI.
- The login form/UI was visible at times, but no successful redirect to a logged-in home state was observed.
- Current visible page is the home page (/ar) and the user is not logged in.

Because the verification submission could not be completed due to UI instability, the test could not be validated as passing.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/e335fe2b-3665-4423-bb5e-f5072f50dbb6
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC025 OTP verification shows error for incorrect code
- **Test Code:** [TC025_OTP_verification_shows_error_for_incorrect_code.py](./TC025_OTP_verification_shows_error_for_incorrect_code.py)
- **Test Error:** Submitting an incorrect OTP did not show an error message. The app returned to the main page or cleared the OTP UI instead of displaying a visible validation error.

Observations:
- The OTP verification page loads and shows an OTP input and Verify button at times.
- The OTP '0000' was entered and Verify was clicked multiple times, but no error/validation message appeared.
- After submission the app often returned to the main /ar page and OTP elements became unavailable or stale.
- On the current page the main search UI is visible with the 'تسجيل الدخول' (login) link present.
- Because no visible error state could be observed after several submits, the incorrect-OTP error behavior could not be confirmed.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/595e0524-4390-475f-a402-779a50b674ba
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC029 Forgot password page loads and accepts phone input
- **Test Code:** [TC029_Forgot_password_page_loads_and_accepts_phone_input.py](./TC029_Forgot_password_page_loads_and_accepts_phone_input.py)
- **Test Error:** Submitting the forgot-password form did not produce any confirmation, OTP instructions, success message, or error text.

Observations:
- The forgot-password page loaded and shows the title "نسيت كلمة المرور" above the form.
- The phone input labeled "الهاتف" is present and contains the value "36000000".
- The submit button "إرسال الرمز" is visible below the phone input.
- After submitting the form, no confirmation, OTP instructions, success message, or error message appeared; the page remained on the forgot-password form.
- The link "العودة إلى تسجيل الدخول" is visible below the form.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/b4a6b51e-cadf-4e3d-97c6-aef5c06480da
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC033 Reset password with wrong OTP shows an error
- **Test Code:** [TC033_Reset_password_with_wrong_OTP_shows_an_error.py](./TC033_Reset_password_with_wrong_OTP_shows_an_error.py)
- **Test Error:** Submitting the reset-password form with an invalid OTP did not produce any visible error message on the page.

Observations:
- The reset password form stayed visible after submission with the entered OTP and passwords still present.
- The OTP input contained '0000' when the form was submitted.
- No visible error or alert text was shown near the OTP field or the reset button (no occurrences of Arabic words like 'خطأ', 'غير صحيح', 'رمز' or mentions of 'OTP').
- The page shows the reset form labels and the 'إعادة تعيين' button, but no indication of an invalid OTP.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dfe83071-953b-41f9-a6ee-8d3fd4511a51/b9daf723-89a4-42da-958f-cddbacc304ee
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **26.67** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---