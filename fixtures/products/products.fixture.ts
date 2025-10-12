import { test as base, expect as baseExpect } from '@playwright/test';
import { LoginPage } from '@/pages/login.page';
import { ProductsPage } from '@/pages/products.page';
import {
  clearAllProducts,
  ensureProductsExist,
} from '@/tests/helpers/storage-helpers';
import { type TestProductData } from '@/types/product.types';
import testData from '@/data/products-test-data.json';

/**
 * Products Fixture - Authenticated User on Products Page with Test Data
 *
 * This fixture provides an authenticated ProductsPage instance ready to use.
 * By default, it logs in as admin user, clears localStorage, loads test data products,
 * and navigates to the products page.
 *
 * @property {ProductsPage} productsPage - An authenticated ProductsPage instance
 *
 * ## Usage
 *
 * @example
 * ```typescript
 * test('should filter products', async ({ productsPage }) => {
 *   await productsPage.filterByCategory('Electronics');
 *   const count = await productsPage.getProductCount();
 *   expect(count).toBeGreaterThan(0);
 * });
 * ```
 *
 * ## Authentication & Test Data
 *
 * The fixture automatically:
 * 1. Logs in as admin user (admin@test.com / Admin123!)
 * 2. Navigates to /products page
 * 3. Loads 23 test data products from products-test-data.json (validates by SKU)
 * 4. Provides ready-to-use ProductsPage instance
 * 5. Cleans up products after test completes
 *
 * ## Test Data Loaded
 *
 * The fixture loads the following products (23 total):
 * - 12 filteringTests products (3 per category: Electronics, Accessories, Software, Hardware)
 * - 3 sortingTests products (Alpha, Zeta, Middle - for order validation)
 * - 5 searchTests products (LAPTOP, laptop, LaPtOp - for case-insensitive search)
 * - 3 lowStockTests products (2 with low stock, 1 with adequate stock)
 *
 * Products are validated by SKU to prevent duplicates, and cleaned up after each test.
 *
 * ## Note
 *
 * Admin credentials are used by default since product management
 * typically requires admin privileges.
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

    // Load robust test data products
    await ensureProductsExist(page, [
      ...(testData.filteringTests as TestProductData[]),
      ...(testData.sortingTests as TestProductData[]),
      ...(testData.searchTests as TestProductData[]),
      ...(testData.lowStockTests as TestProductData[]),
    ]);

    // Create ProductsPage instance and navigate again after data is loaded
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    // Provide authenticated ProductsPage instance to the test
    await use(productsPage);

    // Cleanup: Clear products after test completes
    await clearAllProducts(page);
  },
});

export const expect = baseExpect;
