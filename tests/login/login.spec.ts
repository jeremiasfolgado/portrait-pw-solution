import { loginFixture as test, expect } from '@/fixtures/login.fixture';

test.describe('Login Page', () => {
  test.describe('Login Page Rendering', () => {
    test('should render all login form elements', async ({ loginPage }) => {
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
      await expect(loginPage.passwordToggle).toBeVisible();
    });
  });

  test.describe('Authentication Flow', () => {
    test('should successfully login with valid credentials', async ({
      loginPage,
      page,
    }) => {
      await loginPage.login('admin@test.com', 'Admin123!');
      await page.waitForURL('/dashboard');
      await expect(page.getByTestId('dashboard-title')).toContainText(
        'Dashboard'
      );
    });

    test('should persist session after page reload', async ({
      loginPage,
      page,
    }) => {
      await loginPage.login('admin@test.com', 'Admin123!');
      await page.waitForURL('/dashboard');
      await expect(page.getByTestId('dashboard-title')).toContainText(
        'Dashboard'
      );

      await page.reload();
      await expect(page.getByTestId('dashboard-title')).toContainText(
        'Dashboard'
      );
    });

    test('should successfully logout and return to login page', async ({
      loginPage,
      page,
    }) => {
      await loginPage.login('admin@test.com', 'Admin123!');
      await page.waitForURL('/dashboard');
      await expect(page.getByTestId('dashboard-title')).toContainText(
        'Dashboard'
      );

      await page.getByTestId('logout-button').click();
      await expect(page).toHaveURL('/login');
      await expect(loginPage.loginButton).toBeVisible();
    });

    test('should redirect to login page when accessing protected routes without authentication', async ({
      loginPage,
      page,
    }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/login');
      await expect(loginPage.loginButton).toBeVisible();
    });
  });

  test.describe('Password Visibility Toggle', () => {
    test('should show password as visible text when toggle is clicked before typing', async ({
      loginPage,
    }) => {
      // Click toggle before typing
      await loginPage.togglePasswordVisibility();

      // Password should now be visible
      expect(await loginPage.isPasswordVisible()).toBe(true);

      // Fill password while visible
      await loginPage.passwordInput.focus();
      await loginPage.passwordInput.fill('TestPassword123!');

      // Password should remain visible
      expect(await loginPage.isPasswordVisible()).toBe(true);

      // Verify the value is visible in the input
      await expect(loginPage.passwordInput).toHaveValue('TestPassword123!');
    });

    test('should reveal password content when toggle is clicked after typing', async ({
      loginPage,
    }) => {
      // Fill password while hidden
      await loginPage.passwordInput.focus();
      await loginPage.passwordInput.fill('SecretPassword456!');

      // Password should be hidden
      expect(await loginPage.isPasswordVisible()).toBe(false);

      // Click toggle to show password
      await loginPage.togglePasswordVisibility();

      // Password should now be visible
      expect(await loginPage.isPasswordVisible()).toBe(true);

      // Verify the value is still correct
      await expect(loginPage.passwordInput).toHaveValue('SecretPassword456!');
    });

    test('should toggle password visibility multiple times', async ({
      loginPage,
    }) => {
      // Fill password
      await loginPage.passwordInput.focus();
      await loginPage.passwordInput.fill('MyPassword789!');

      // Initially hidden
      expect(await loginPage.isPasswordVisible()).toBe(false);

      // Toggle to visible
      await loginPage.togglePasswordVisibility();
      expect(await loginPage.isPasswordVisible()).toBe(true);

      // Toggle back to hidden
      await loginPage.togglePasswordVisibility();
      expect(await loginPage.isPasswordVisible()).toBe(false);

      // Toggle to visible again
      await loginPage.togglePasswordVisibility();
      expect(await loginPage.isPasswordVisible()).toBe(true);

      // Verify the value is preserved through all toggles
      await expect(loginPage.passwordInput).toHaveValue('MyPassword789!');
    });

    test('should maintain password value when toggling visibility during login flow', async ({
      loginPage,
      page,
    }) => {
      // Fill email
      await loginPage.emailInput.focus();
      await loginPage.emailInput.fill('admin@test.com');

      // Fill password while hidden
      await loginPage.passwordInput.focus();
      await loginPage.passwordInput.fill('Admin123!');

      // Toggle to verify password
      await loginPage.togglePasswordVisibility();
      expect(await loginPage.isPasswordVisible()).toBe(true);

      // Verify password value is correct
      await expect(loginPage.passwordInput).toHaveValue('Admin123!');

      // Toggle back to hidden before submitting
      await loginPage.togglePasswordVisibility();
      expect(await loginPage.isPasswordVisible()).toBe(false);

      // Submit and verify login works
      await loginPage.loginButton.click();
      await page.waitForURL('/dashboard');
      await expect(page.getByTestId('dashboard-title')).toContainText(
        'Dashboard'
      );
    });
  });
  test.describe('Form Validation', () => {
    test('should show error message with invalid credentials', async ({
      loginPage,
    }) => {
      await loginPage.login('invalid@test.com', 'wrongpassword');
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toBe('Invalid email or password');
    });

    test('should prevent submission with empty credentials using HTML5 validation', async ({
      loginPage,
      browserName,
    }) => {
      await loginPage.emailInput.focus();
      await loginPage.emailInput.fill('');
      await loginPage.passwordInput.focus();
      await loginPage.passwordInput.fill('');
      await loginPage.loginButton.click();

      // Verify HTML5 validation prevents form submission with browser-specific message
      await loginPage.expectValidationMessage(browserName);

      // Verify we're still on the login page (form not submitted)
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
    });
    test('should prevent submission whitn invalid email format using HTML5 validation', async ({
      loginPage,
      browserName,
    }) => {
      await loginPage.emailInput.focus();
      await loginPage.emailInput.fill('invalidemail');
      await loginPage.passwordInput.focus();
      await loginPage.passwordInput.fill('password');
      await loginPage.loginButton.click();
      await loginPage.expectValidationMessageEmailFormat(browserName);
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
    });
  });
});
