/**
 * E2E Fixtures
 *
 * Provides two fixture variants for E2E testing:
 *
 * 1. e2eBaseFixture - Pages WITHOUT auto-authentication
 *    Use when you need manual login/logout control (multi-user scenarios)
 *
 * 2. e2eFixture - Pages WITH auto-authentication as admin
 *    Use for standard journeys that don't need session switching
 */

import { test as base } from '@playwright/test';
import { LoginPage } from '@/pages/login.page';
import { DashboardPage } from '@/pages/dashboard.page';
import { ProductsPage } from '@/pages/products.page';
import { ProductFormPage } from '@/pages/product-form.page';
import { InventoryPage } from '@/pages/inventory.page';

type E2EBaseFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  productFormPage: ProductFormPage;
  inventoryPage: InventoryPage;
  dashboardPage: DashboardPage;
};

type E2EAuthenticatedFixtures = E2EBaseFixtures & {
  authenticatedDashboard: DashboardPage;
};

/**
 * Base E2E Fixture - NO auto-authentication
 *
 * Provides all pages pre-instantiated but does NOT automatically authenticate.
 * Use this when you need manual control over login/logout (multi-user scenarios).
 */
export const e2eBaseFixture = base.extend<E2EBaseFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  productFormPage: async ({ page }, use) => {
    await use(new ProductFormPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
});

/**
 * Authenticated E2E Fixture - WITH auto-authentication
 *
 * Extends base fixture and automatically authenticates as admin.
 * Use this for standard journeys that don't need session switching.
 */
export const e2eFixture = e2eBaseFixture.extend<E2EAuthenticatedFixtures>({
  authenticatedDashboard: async ({ loginPage, page }, use) => {
    // Authenticate as admin
    await loginPage.goto();
    await loginPage.login('admin@test.com', 'Admin123!');
    await page.waitForURL('/dashboard');

    await use(new DashboardPage(page));
  },

  // Override pages to depend on authentication
  dashboardPage: async ({ authenticatedDashboard }, use) => {
    await use(authenticatedDashboard);
  },

  productsPage: async ({ authenticatedDashboard: _auth, page }, use) => {
    await use(new ProductsPage(page));
  },

  productFormPage: async ({ authenticatedDashboard: _auth, page }, use) => {
    await use(new ProductFormPage(page));
  },

  inventoryPage: async ({ authenticatedDashboard: _auth, page }, use) => {
    await use(new InventoryPage(page));
  },
});

export { expect } from '@playwright/test';
