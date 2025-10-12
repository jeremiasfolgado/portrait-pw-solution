import { test as base, expect as baseExpect } from '@playwright/test';
import { LoginPage } from '@/pages/login.page';
import { ProductFormPage } from '@/pages/product-form.page';
import { ProductsPage } from '@/pages/products.page';

/**
 * Product Form Fixture - Authenticated User Ready for Product Form
 *
 * This fixture provides authenticated ProductFormPage and ProductsPage instances ready to use.
 * Logs in as admin and provides both page objects for form operations and table validation.
 *
 * @property {ProductFormPage} productFormPage - An authenticated ProductFormPage instance
 * @property {ProductsPage} productsPage - An authenticated ProductsPage instance for UI validation
 *
 * ## Usage
 *
 * @example
 * ```typescript
 * test('should create a new product', async ({ productFormPage, productsPage }) => {
 *   await productFormPage.createProduct({
 *     sku: 'TEST-001',
 *     name: 'Test Product',
 *     category: 'Electronics',
 *     price: 99.99,
 *     stock: 50
 *   });
 *   await productsPage.goto();
 *   await expect(productsPage.getProductRow('TEST-001')).toBeVisible();
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
 * - `productsPage.goto()` to navigate to products list for validation
 */
export const productFormFixture = base.extend<{
  productFormPage: ProductFormPage;
  productsPage: ProductsPage;
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
  },
  productsPage: async ({ page }, use) => {
    // Create and provide ProductsPage instance (reuses same authenticated page)
    const productsPage = new ProductsPage(page);
    await use(productsPage);
  },
});

export const expect = baseExpect;
