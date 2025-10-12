/**
 * Visual Regression Test Suite - Login Page
 *
 * These tests capture and compare screenshots of the login page
 * to detect unintended visual changes.
 *
 * Coverage: 4 tests × 3 browsers = 12 snapshots
 *
 * IMPORTANT: Snapshots must be generated on Ubuntu (Linux) to match CI environment.
 * Use Docker to update snapshots:
 *   npm run docker:update-snapshots
 *
 * @requires Docker (for snapshot generation)
 */

import { loginFixture as test, expect } from '@/fixtures/login/login.fixture';

test.describe('Visual Regression - Login Page', () => {
  test('should match login page initial state', async ({ loginPage, page }) => {
    // Ensure page is fully loaded
    await loginPage.goto();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('login-initial-state.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match login page with password visible', async ({
    loginPage,
    page,
  }) => {
    await loginPage.goto();

    // Fill password
    await loginPage.passwordInput.waitFor({ state: 'visible' });
    await loginPage.passwordInput.fill('TestPassword123!');

    // Toggle password visibility
    await loginPage.togglePasswordVisibility();

    // Ensure password is visible
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('login-password-visible.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match login page with filled form', async ({
    loginPage,
    page,
  }) => {
    await loginPage.goto();

    // Fill form with valid data
    await loginPage.emailInput.waitFor({ state: 'visible' });
    await loginPage.emailInput.fill('admin@test.com');
    await loginPage.passwordInput.fill('Admin123!');

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('login-filled-form.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match login page with invalid credentials error', async ({
    loginPage,
    page,
  }) => {
    await loginPage.goto();

    // Attempt login with invalid credentials
    await loginPage.login('wrong@email.com', 'WrongPassword123!');

    // Wait for error message
    await expect(loginPage.errorMessage).toBeVisible();

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('login-invalid-credentials.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
