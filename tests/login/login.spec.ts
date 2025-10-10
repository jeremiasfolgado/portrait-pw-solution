import { loginFixture as test, expect } from '@/fixtures/login.fixture';

test.describe('Login', () => {
  test.describe('positive cases', () => {
    test('should render all login form elements', async ({ loginPage }) => {
      // verify all elements are visible
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
      await expect(loginPage.passwordToggle).toBeVisible();
    });

    test('should successfully login as Admin with valid credentials', async ({
      loginPage,
      page,
    }) => {
      await loginPage.login('admin@test.com', 'Admin123!');
      await page.waitForURL('/dashboard');
      await expect(page.getByTestId('dashboard-title')).toContainText(
        'Dashboard'
      );
    });
    test('should successfully login as User with valid credentials', async ({
      loginPage,
      page,
    }) => {
      await loginPage.login('user@test.com', 'User123!');
      await page.waitForURL('/dashboard');
      await expect(page.getByTestId('dashboard-title')).toContainText(
        'Dashboard'
      );
    });
  });
  test.describe('negative cases', () => {
    test('should show error message when login with invalid credentials', async ({
      loginPage,
    }) => {
      await loginPage.login('invalid@test.com', 'wrongpassword');
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toBe('Invalid email or password');
    });
    test('should prevent login with empty credentials using HTML5 validation', async ({
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
    test('should redirect to login page when accessing protected routes without authentication', async ({
      loginPage,
      page,
    }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/login');
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
      await expect(loginPage.passwordToggle).toBeVisible();
    });
  });
});
