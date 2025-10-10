import { test as base, expect as baseExpect } from '@playwright/test';
import { LoginPage } from '@/pages/login.page';
import { DashboardPage } from '@/pages/dashboard.page';

/**
 * Login fixture that provides both LoginPage and DashboardPage instances.
 *
 * This fixture is useful for tests that involve the login flow and subsequent
 * navigation to the dashboard. By providing both page objects, we avoid
 * repetitive instantiation in tests.
 */
export const loginFixture = base.extend<{
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
}>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    // Provide DashboardPage instance (doesn't navigate, just provides the POM)
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
});

export const expect = baseExpect;
