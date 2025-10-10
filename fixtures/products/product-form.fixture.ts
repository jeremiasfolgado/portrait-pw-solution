import { test as base, expect as baseExpect } from '@playwright/test';
import { LoginPage } from '@/pages/login.page';
import { ProductFormPage } from '@/pages/product-form.page';

/**
 * Product Form Fixture - Authenticated User Ready for Product Form
 *
 * This fixture provides an authenticated ProductFormPage instance ready to use.
 * Logs in as admin and provides the form page object without navigating to it.
 *
 * @property {ProductFormPage} productFormPage - An authenticated ProductFormPage instance
 *
 * ## Usage
 *
 * @example
 * ```typescript
 * test('should create a new product', async ({ productFormPage }) => {
 *   await productFormPage.createProduct({
 *     sku: 'TEST-001',
 *     name: 'Test Product',
 *     category: 'Electronics',
 *     price: 99.99,
 *     stock: 50
 *   });
 *   await expect(page).toHaveURL('/products');
 * });
 * ```
 *
 * ## Authentication
 *
 * The fixture automatically logs in as admin user but does NOT
 * navigate to any specific page. Tests can call:
 * - `productFormPage.gotoNew()` for new product form
 * - `productFormPage.gotoEdit(id)` for edit product form
 * - `productFormPage.createProduct(data)` for complete flow
 */
export const productFormFixture = base.extend<{
  productFormPage: ProductFormPage;
}>({
  productFormPage: async ({ page }, use) => {
    // Perform authentication using LoginPage POM
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@test.com', 'Admin123!');

    // Wait for successful navigation to dashboard
    await page.waitForURL('/dashboard');

    // Create and provide ProductFormPage instance
    const productFormPage = new ProductFormPage(page);
    await use(productFormPage);

    // Cleanup happens automatically when test completes
  },
});

export const expect = baseExpect;
