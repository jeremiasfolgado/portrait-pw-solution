/**
 * Product Form Test Suite
 *
 * Comprehensive test suite covering product form functionality:
 * - Product creation with valid and minimal data
 * - Product editing
 * - Form validation (required fields, invalid values)
 * - Form navigation (save, cancel)
 *
 * This suite fulfills the Level 1 Required validation tasks:
 * ✅ Add a new product with valid data
 * ✅ Validate form field requirements
 * ✅ Test validation errors (negative price, empty required fields)
 */

import {
  productFormFixture as test,
  expect,
} from '@/fixtures/products/product-form.fixture';

test.describe('Product Form', () => {
  test.describe('Product Creation', () => {
    test('should create a new product with valid data', async ({
      productFormPage,
      page,
    }) => {
      // Navigate to new product form
      await productFormPage.gotoNew();
      await expect(page).toHaveURL('/products/new');
      await expect(productFormPage.newProductTitle).toBeVisible();

      // Fill form with valid data
      await productFormPage.fillForm({
        sku: 'TEST-001',
        name: 'Test Laptop',
        description: 'A high-performance test laptop',
        category: 'Electronics',
        price: 999.99,
        stock: 25,
        lowStockThreshold: 5,
      });

      // Save product
      await productFormPage.save();

      // Should redirect to products list
      await expect(page).toHaveURL('/products');
    });

    test('should create product with minimal required fields', async ({
      productFormPage,
      page,
    }) => {
      await productFormPage.gotoNew();

      // Fill only required fields
      await productFormPage.fillForm({
        sku: 'MIN-001',
        name: 'Minimal Product',
        category: 'Software',
        price: 49.99,
        stock: 10,
      });

      await productFormPage.save();

      // Should successfully save
      await expect(page).toHaveURL('/products');
    });

    test('should use high-level createProduct method', async ({
      productFormPage,
      page,
    }) => {
      // Test the convenience method
      await productFormPage.createProduct({
        sku: 'CONV-001',
        name: 'Convenience Method Product',
        category: 'Hardware',
        price: 199.99,
        stock: 15,
      });

      // Should be on products list
      await expect(page).toHaveURL('/products');
    });
  });

  test.describe('Form Validation - Required Fields', () => {
    test('should show error when SKU is empty', async ({ productFormPage }) => {
      await productFormPage.gotoNew();

      // Fill form without SKU
      await productFormPage.fillForm({
        sku: '', // Empty SKU
        name: 'Product Without SKU',
        category: 'Electronics',
        price: 100,
        stock: 10,
      });

      await productFormPage.save();

      // Should show SKU error
      const hasError = await productFormPage.hasFieldError('sku');
      expect(hasError).toBe(true);

      const errorMessage = await productFormPage.getFieldError('sku');
      expect(errorMessage).toBe('SKU is required');
    });

    test('should show error when Name is empty', async ({
      productFormPage,
    }) => {
      await productFormPage.gotoNew();

      // Fill form without name
      await productFormPage.fillForm({
        sku: 'TEST-002',
        name: '', // Empty name
        category: 'Electronics',
        price: 100,
        stock: 10,
      });

      await productFormPage.save();

      // Should show name error
      const hasError = await productFormPage.hasFieldError('name');
      expect(hasError).toBe(true);

      const errorMessage = await productFormPage.getFieldError('name');
      expect(errorMessage).toBe('Name is required');
    });

    test('should show error when Price is empty', async ({
      productFormPage,
    }) => {
      await productFormPage.gotoNew();

      // Fill form without price
      await productFormPage.fillForm({
        sku: 'TEST-003',
        name: 'Product Without Price',
        category: 'Electronics',
        price: 0, // Will be treated as empty
        stock: 10,
      });

      // Clear price field explicitly
      await productFormPage.clearField('price');

      await productFormPage.save();

      // Should show price error
      const hasError = await productFormPage.hasFieldError('price');
      expect(hasError).toBe(true);

      const errorMessage = await productFormPage.getFieldError('price');
      expect(errorMessage).toBe('Price is required');
    });

    test('should show error when Stock is empty', async ({
      productFormPage,
    }) => {
      await productFormPage.gotoNew();

      // Fill form without stock
      await productFormPage.fillForm({
        sku: 'TEST-004',
        name: 'Product Without Stock',
        category: 'Electronics',
        price: 100,
        stock: 0,
      });

      // Clear stock field explicitly
      await productFormPage.clearField('stock');

      await productFormPage.save();

      // Should show stock error
      const hasError = await productFormPage.hasFieldError('stock');
      expect(hasError).toBe(true);

      const errorMessage = await productFormPage.getFieldError('stock');
      expect(errorMessage).toBe('Stock is required');
    });

    test('should show multiple errors when all required fields are empty', async ({
      productFormPage,
    }) => {
      await productFormPage.gotoNew();

      // Try to save empty form
      await productFormPage.save();

      // Should show errors for all required fields
      expect(await productFormPage.hasFieldError('sku')).toBe(true);
      expect(await productFormPage.hasFieldError('name')).toBe(true);
      expect(await productFormPage.hasFieldError('price')).toBe(true);
      expect(await productFormPage.hasFieldError('stock')).toBe(true);
    });
  });

  test.describe('Form Validation - Invalid Values', () => {
    test('should show error when Price is negative', async ({
      productFormPage,
    }) => {
      await productFormPage.gotoNew();

      // Fill form with negative price
      await productFormPage.fillForm({
        sku: 'TEST-005',
        name: 'Product With Negative Price',
        category: 'Electronics',
        price: -50, // Negative price
        stock: 10,
      });

      await productFormPage.save();

      // Should show price error
      const hasError = await productFormPage.hasFieldError('price');
      expect(hasError).toBe(true);

      const errorMessage = await productFormPage.getFieldError('price');
      expect(errorMessage).toBe('Price must be greater than 0');
    });

    test('should show error when Price is zero', async ({
      productFormPage,
    }) => {
      await productFormPage.gotoNew();

      // Fill form with zero price
      await productFormPage.fillForm({
        sku: 'TEST-006',
        name: 'Product With Zero Price',
        category: 'Electronics',
        price: 0, // Zero price
        stock: 10,
      });

      await productFormPage.save();

      // Should show price error
      const hasError = await productFormPage.hasFieldError('price');
      expect(hasError).toBe(true);

      const errorMessage = await productFormPage.getFieldError('price');
      expect(errorMessage).toBe('Price must be greater than 0');
    });

    test('should show error when Stock is negative', async ({
      productFormPage,
    }) => {
      await productFormPage.gotoNew();

      // Fill form with negative stock
      await productFormPage.fillForm({
        sku: 'TEST-007',
        name: 'Product With Negative Stock',
        category: 'Electronics',
        price: 100,
        stock: -5, // Negative stock
      });

      await productFormPage.save();

      // Should show stock error
      const hasError = await productFormPage.hasFieldError('stock');
      expect(hasError).toBe(true);

      const errorMessage = await productFormPage.getFieldError('stock');
      expect(errorMessage).toBe('Stock cannot be negative');
    });
  });

  test.describe('Form Navigation', () => {
    test('should cancel product creation and return to list', async ({
      productFormPage,
      page,
    }) => {
      await productFormPage.gotoNew();

      // Fill some data
      await productFormPage.fillForm({
        sku: 'CANCEL-001',
        name: 'Cancelled Product',
        category: 'Hardware',
        price: 199.99,
        stock: 30,
      });

      // Click cancel
      await productFormPage.cancel();

      // Should return to products list
      await expect(page).toHaveURL('/products');
    });
  });
});
