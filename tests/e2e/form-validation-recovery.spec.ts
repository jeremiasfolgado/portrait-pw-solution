import { e2eFixture as test, expect } from '@/fixtures/e2e/e2e.fixture';
import { ProductCreateInput } from '@/types/product.types';
import e2eData from '@/data/e2e-journeys.json';

/**
 * E2E Journey: Form Validation and Error Recovery
 *
 * Business Scenario:
 * User attempts to create a product with errors, corrects them
 * incrementally, and successfully completes the creation.
 *
 * Validates:
 * - Form validation messages
 * - Progressive error correction
 * - Successful submission after errors
 * - User experience resilience
 */

test.describe('E2E Journey - Form Validation Recovery', () => {
  // Increase timeout for E2E journeys
  test.setTimeout(60000);

  test('Form validation → Error correction → Successful creation', async ({
    productFormPage,
    productsPage,
    page,
  }) => {
    const testProduct = e2eData.errorRecovery as ProductCreateInput;
    let productId = '';

    // Step 1: Try to submit empty form
    await test.step('Submit empty form - should show validation errors', async () => {
      await productFormPage.gotoNew();
      await productFormPage.save();

      // Verify errors appear
      const skuError = await productFormPage.hasFieldError('sku');
      const nameError = await productFormPage.hasFieldError('name');
      const priceError = await productFormPage.hasFieldError('price');
      const stockError = await productFormPage.hasFieldError('stock');

      expect(skuError).toBe(true);
      expect(nameError).toBe(true);
      expect(priceError).toBe(true);
      expect(stockError).toBe(true);

      await expect(page).toHaveURL('/products/new');
    });

    // Step 2: Fill only SKU and Name
    await test.step('Partially complete form - some errors persist', async () => {
      await productFormPage.fillForm({
        sku: testProduct.sku,
        name: testProduct.name,
      });

      await productFormPage.save();

      // SKU and Name errors should be gone
      const skuError = await productFormPage.hasFieldError('sku');
      const nameError = await productFormPage.hasFieldError('name');
      expect(skuError).toBe(false);
      expect(nameError).toBe(false);

      // Price and Stock errors should persist
      const priceError = await productFormPage.hasFieldError('price');
      const stockError = await productFormPage.hasFieldError('stock');
      expect(priceError).toBe(true);
      expect(stockError).toBe(true);
    });

    // Step 3: Complete all fields correctly
    await test.step('Complete form correctly - successful creation', async () => {
      await productFormPage.fillForm({
        price: testProduct.price,
        stock: testProduct.stock,
        category: testProduct.category,
        description: testProduct.description,
        lowStockThreshold: testProduct.lowStockThreshold,
      });

      await productFormPage.save();

      await expect(page).toHaveURL('/products');
    });

    // Step 4: Verify product was created
    await test.step('Verify product in list', async () => {
      await productsPage.goto();
      await productsPage.searchProducts(testProduct.sku);

      const count = await productsPage.getProductCount();
      expect(count).toBe(1);

      productId = await productsPage.getFirstProductId();
    });

    // Step 5: Clean up
    await test.step('Clean up test product', async () => {
      await productsPage.deleteProduct(productId);

      await productsPage.searchProducts(testProduct.sku);
      const count = await productsPage.getProductCount();
      expect(count).toBe(0);
    });
  });
});
