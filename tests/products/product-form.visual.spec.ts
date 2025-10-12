/**
 * Visual Regression Test Suite - Product Form Page
 *
 * These tests capture and compare screenshots of the product form
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

import {
  productFormFixture as test,
  expect,
} from '@/fixtures/products/product-form.fixture';

test.describe('Visual Regression - Product Form Page', () => {
  test('should match product form initial state (create)', async ({
    productFormPage,
    page,
  }) => {
    // Navigate to create form
    await productFormPage.gotoNew();

    // Ensure form is fully loaded
    await expect(productFormPage.newProductTitle).toBeVisible();
    await expect(productFormPage.nameInput).toBeVisible();
    await expect(productFormPage.saveButton).toBeVisible();

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('product-form-create.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match product form with filled data', async ({
    productFormPage,
    page,
  }) => {
    // Navigate to create form
    await productFormPage.gotoNew();

    // Fill form with test data
    await productFormPage.nameInput.fill('Test Product Visual');
    await productFormPage.skuInput.fill('TEST-VIS-001');
    await productFormPage.priceInput.fill('99.99');
    await productFormPage.stockInput.fill('50');
    await productFormPage.categoryInput.selectOption('Electronics');
    await productFormPage.descriptionInput.fill(
      'Test product for visual regression'
    );

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('product-form-filled.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match product form with validation errors', async ({
    productFormPage,
    page,
  }) => {
    // Navigate to create form
    await productFormPage.gotoNew();

    // Fill only some fields to trigger validation
    await productFormPage.nameInput.fill('A');
    await productFormPage.skuInput.fill('XX');
    await productFormPage.priceInput.fill('-1');

    // Try to save to show validation errors
    await productFormPage.saveButton.click();

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('product-form-validation-errors.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match product form in edit mode', async ({
    productFormPage,
    productsPage,
    page,
  }) => {
    // Navigate to products list first
    await productsPage.goto();
    await expect(productsPage.productsTable).toBeVisible();

    // Get first product and navigate to edit
    const firstProductId = await productsPage.getFirstProductId();
    await productsPage.clickEditProduct(firstProductId);

    // Wait for form to load
    await expect(productFormPage.editProductTitle).toBeVisible();
    await expect(productFormPage.saveButton).toBeVisible();

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('product-form-edit.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
