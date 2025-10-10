import { test as base, expect as baseExpect } from '@playwright/test';
import { LoginPage } from '@/pages/login.page';
import { ProductsPage } from '@/pages/products.page';

/**
 * Products Fixture - Authenticated User on Products Page
 *
 * This fixture provides an authenticated ProductsPage instance ready to use.
 * By default, it logs in as admin user and navigates to the products page.
 *
 * @property {ProductsPage} productsPage - An authenticated ProductsPage instance
 *
 * ## Usage
 *
 * @example
 * ```typescript
 * test('should create a new product', async ({ productsPage }) => {
 *   await productsPage.createProduct({
 *     sku: 'TEST-001',
 *     name: 'Test Product',
 *     category: 'Electronics',
 *     price: 99.99,
 *     stock: 50
 *   });
 *   await expect(productsPage.getProductRow('...')).toBeVisible();
 * });
 * ```
 *
 * ## Authentication
 *
 * The fixture automatically:
 * 1. Logs in as admin user (admin@test.com / Admin123!)
 * 2. Navigates to /products page
 * 3. Provides ready-to-use ProductsPage instance
 *
 * ## Note
 *
 * Admin credentials are used by default since product management
 * typically requires admin privileges. If you need to test with
 * a regular user, you can modify the credentials or create a
 * separate fixture.
 */
export const productsFixture = base.extend<{
  productsPage: ProductsPage;
}>({
  productsPage: async ({ page }, use) => {
    // Perform authentication using LoginPage POM
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@test.com', 'Admin123!');

    // Wait for successful navigation to dashboard
    await page.waitForURL('/dashboard');

    // Create ProductsPage instance and navigate to products
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    // Provide authenticated ProductsPage instance to the test
    await use(productsPage);

    // Cleanup happens automatically when test completes
  },
});

export const expect = baseExpect;
