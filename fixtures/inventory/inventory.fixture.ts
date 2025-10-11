import { test as base, expect as baseExpect } from '@playwright/test';
import { LoginPage } from '@/pages/login.page';
import { InventoryPage } from '@/pages/inventory.page';

/**
 * Inventory Fixture - Authenticated User on Inventory Page
 *
 * This fixture provides an authenticated InventoryPage instance ready to use.
 * By default, it logs in as admin user and navigates to the inventory page.
 *
 * @property {InventoryPage} inventoryPage - An authenticated InventoryPage instance
 *
 * ## Usage
 *
 * @example
 * ```typescript
 * test('should adjust stock', async ({ inventoryPage }) => {
 *   await inventoryPage.adjustStock('product-id', 10);
 *   // Validate stock increased
 * });
 * ```
 *
 * ## Authentication
 *
 * The fixture automatically:
 * 1. Logs in as admin user (admin@test.com / Admin123!)
 * 2. Navigates to /inventory page
 * 3. Provides ready-to-use InventoryPage instance
 */
export const inventoryFixture = base.extend<{
  inventoryPage: InventoryPage;
}>({
  inventoryPage: async ({ page }, use) => {
    // Perform authentication using LoginPage POM
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@test.com', 'Admin123!');

    // Wait for successful navigation to dashboard
    await page.waitForURL('/dashboard');

    // Create InventoryPage instance and navigate to inventory
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    // Provide authenticated InventoryPage instance to the test
    await use(inventoryPage);

    // Cleanup happens automatically when test completes
  },
});

export const expect = baseExpect;
