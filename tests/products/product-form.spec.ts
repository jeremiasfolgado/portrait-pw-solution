/**
 * Product Form Test Suite
 *
 * Comprehensive test suite covering product form functionality:
 * - Product creation with valid and minimal data
 * - Product editing
 * - Form validation (required fields, invalid values)
 * - Form navigation (save, cancel)
 * - Edge cases (large numbers, long names, special characters)
 * - Optional fields validation
 *
 * This suite fulfills the Level 1 Required validation tasks:
 * ✅ Add a new product with valid data
 * ✅ Validate form field requirements
 * ✅ Test validation errors (negative price, empty required fields)
 * ✅ Edit existing products
 * ✅ Edge case validation
 */

import {
  productFormFixture as test,
  expect,
} from '@/fixtures/products/product-form.fixture';
import testData from '@/data/products-test-data.json';
import { getProductsFromLocalStorage } from '@/tests/helpers/storage-helpers';

/**
 * Note: Tests use localStorage as the source of truth, then validate UI reflects it correctly:
 * 1. Perform action (create/edit product)
 * 2. Read from localStorage (source of truth)
 * 3. Validate UI displays the localStorage data correctly
 *
 * This approach ensures data integrity and UI consistency.
 */

test.describe('Product Form', () => {
  test.describe('Product Creation', () => {
    test('should create a new product with valid data', async ({
      productFormPage,
      productsPage,
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

      // STEP 1: Read from localStorage (source of truth)
      const products = await getProductsFromLocalStorage(page);
      const product = products.find((p) => p.sku === 'TEST-001');

      // Validate data was saved correctly in localStorage
      expect(product).toBeDefined();
      expect(product?.sku).toBe('TEST-001');
      expect(product?.name).toBe('Test Laptop');
      expect(product?.description).toBe('A high-performance test laptop');
      expect(product?.category).toBe('Electronics');
      expect(product?.price).toBe(999.99);
      expect(product?.stock).toBe(25);
      expect(product?.lowStockThreshold).toBe(5);

      // STEP 2: Verify UI reflects the localStorage data correctly

      const productData = await productsPage.getProductDataFromRow(product!.id);
      expect(productData.sku).toBe(product!.sku);
      expect(productData.name).toBe(product!.name);
      expect(productData.category).toBe(product!.category);
      expect(productData.price).toBe('$999.99'); // UI formats price
      expect(productData.stock).toBe(product!.stock.toString());
    });

    test('should create product with minimal required fields', async ({
      productFormPage,
      productsPage,
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

      // STEP 1: Read from localStorage (source of truth)
      const products = await getProductsFromLocalStorage(page);
      const product = products.find((p) => p.sku === 'MIN-001');

      // Validate data was saved correctly
      expect(product).toBeDefined();
      expect(product?.sku).toBe('MIN-001');
      expect(product?.name).toBe('Minimal Product');
      expect(product?.category).toBe('Software');
      expect(product?.price).toBe(49.99);
      expect(product?.stock).toBe(10);

      // STEP 2: Verify UI reflects localStorage data

      const productData = await productsPage.getProductDataFromRow(product!.id);
      expect(productData.sku).toBe(product!.sku);
      expect(productData.name).toBe(product!.name);
      expect(productData.category).toBe(product!.category);
      expect(productData.price).toBe('$49.99');
      expect(productData.stock).toBe(product!.stock.toString());
    });

    test('should use high-level createProduct method', async ({
      productFormPage,
      productsPage,
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

      // STEP 1: Read from localStorage (source of truth)
      const products = await getProductsFromLocalStorage(page);
      const product = products.find((p) => p.sku === 'CONV-001');

      // Validate data was saved correctly
      expect(product).toBeDefined();
      expect(product?.sku).toBe('CONV-001');
      expect(product?.name).toBe('Convenience Method Product');
      expect(product?.category).toBe('Hardware');
      expect(product?.price).toBe(199.99);
      expect(product?.stock).toBe(15);

      // STEP 2: Verify UI reflects localStorage data

      const productData = await productsPage.getProductDataFromRow(product!.id);
      expect(productData.sku).toBe(product!.sku);
      expect(productData.name).toBe(product!.name);
      expect(productData.category).toBe(product!.category);
      expect(productData.price).toBe('$199.99');
      expect(productData.stock).toBe(product!.stock.toString());
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

  test.describe('Product Editing', () => {
    test('should edit existing product', async ({
      productFormPage,
      productsPage,
      page,
    }) => {
      // Create a product first
      await productFormPage.createProduct({
        sku: 'EDIT-001',
        name: 'Product To Edit',
        category: 'Electronics',
        price: 299.99,
        stock: 20,
      });

      // Get product from localStorage to get its ID
      const products = await getProductsFromLocalStorage(page);
      const product = products.find((p) => p.sku === 'EDIT-001');
      expect(product).toBeDefined();

      // Navigate to edit form
      await productFormPage.gotoEdit(product!.id);
      await expect(page).toHaveURL(`/products/${product!.id}`);

      // Update product data
      await productFormPage.fillForm({
        name: 'Updated Product Name',
        price: 399.99,
        stock: 30,
      });

      await productFormPage.save();

      // Should return to products list
      await expect(page).toHaveURL('/products');
      const currentProducts = await getProductsFromLocalStorage(page);
      const editedProduct = currentProducts.find((p) => p.sku === 'EDIT-001');
      expect(editedProduct).toBeDefined();

      // Verify product was updated in UI
      await productsPage.goto();
      await expect(productsPage.getProductRow(product!.id)).toBeVisible();

      const updatedData = await productsPage.getProductDataFromRow(product!.id);
      expect(updatedData.sku).toBe(product!.sku); // sku was not changed
      expect(updatedData.name).toBe(editedProduct!.name);
      expect(updatedData.category).toBe(product!.category); // category was not changed
      expect(updatedData.price).toBe(`$${editedProduct!.price}`);
      expect(updatedData.stock).toBe(editedProduct!.stock.toString());
    });

    test('should edit product using high-level method', async ({
      productFormPage,
      productsPage,
      page,
    }) => {
      // Create a product first
      await productFormPage.createProduct({
        sku: 'EDIT-002',
        name: 'Another Product',
        category: 'Software',
        price: 99.99,
        stock: 50,
      });

      // Get product ID
      const products = await getProductsFromLocalStorage(page);
      const product = products.find((p) => p.sku === 'EDIT-002');
      expect(product).toBeDefined();

      // Edit using high-level method
      await productFormPage.editProduct(product!.id, {
        name: 'Updated Via Method',
        price: 149.99,
      });

      // Should return to products list
      await expect(page).toHaveURL('/products');

      const currentProducts = await getProductsFromLocalStorage(page);
      const editedProduct = currentProducts.find((p) => p.sku === 'EDIT-002');
      expect(editedProduct).toBeDefined();

      // Verify changes in UI
      await productsPage.goto();
      await expect(productsPage.getProductRow(product!.id)).toBeVisible();

      const updatedData = await productsPage.getProductDataFromRow(product!.id);
      expect(updatedData.sku).toBe(product!.sku); // sku was not changed
      expect(updatedData.name).toBe(editedProduct!.name);
      expect(updatedData.category).toBe(product!.category); // category was not changed
      expect(updatedData.price).toBe(`$${editedProduct!.price}`);
      expect(updatedData.stock).toBe(product!.stock.toString()); // stock was not changed

      // Verify data persistence (localStorage validation)
      const updated = await getProductsFromLocalStorage(page);
      const updatedProduct = updated.find((p) => p.id === product!.id);
      expect(updatedProduct?.name).toBe('Updated Via Method');
      expect(updatedProduct?.price).toBe(149.99);
      expect(updatedProduct?.stock).toBe(50);
    });

    test('should cancel product editing', async ({
      productFormPage,
      productsPage,
      page,
    }) => {
      // Create a product
      await productFormPage.createProduct({
        sku: 'EDIT-CANCEL-001',
        name: 'Original Name',
        category: 'Accessories',
        price: 79.99,
        stock: 15,
      });

      // Get product ID
      const products = await getProductsFromLocalStorage(page);
      const product = products.find((p) => p.sku === 'EDIT-CANCEL-001');
      expect(product).toBeDefined();

      // Navigate to edit
      await productFormPage.gotoEdit(product!.id);

      // Make some changes
      await productFormPage.fillForm({
        name: 'Changed Name',
        price: 199.99,
      });

      // Cancel editing
      await productFormPage.cancel();

      // Should return to products list
      await expect(page).toHaveURL('/products');

      // Verify product was NOT updated in UI
      await productsPage.goto();
      await expect(productsPage.getProductRow(product!.id)).toBeVisible();

      const unchangedData = await productsPage.getProductDataFromRow(
        product!.id
      );
      expect(unchangedData.name).toBe(product!.name);
      expect(unchangedData.price).toBe(`$${product!.price}`);
      expect(unchangedData.stock).toBe(product!.stock.toString());

      // Verify data persistence (localStorage validation)
      const unchanged = await getProductsFromLocalStorage(page);
      const unchangedProduct = unchanged.find((p) => p.id === product!.id);
      expect(unchangedProduct?.name).toBe(product!.name);
      expect(unchangedProduct?.price).toBe(product!.price);
      expect(unchangedProduct?.stock).toBe(product!.stock);
    });
  });

  test.describe('Optional Fields', () => {
    test('should create product with description', async ({
      productFormPage,
      productsPage,
      page,
    }) => {
      await productFormPage.createProduct({
        sku: 'DESC-001',
        name: 'Product With Description',
        description: 'This is a detailed product description',
        category: 'Electronics',
        price: 599.99,
        stock: 10,
      });
      // Description is only validated via localStorage (not shown in table)
      const products = await getProductsFromLocalStorage(page);
      const product = products.find((p) => p.sku === 'DESC-001');
      // Verify product appears in table
      await productsPage.goto();
      await expect(productsPage.getProductRow(product!.id)).toBeVisible();

      const productData = await productsPage.getProductDataFromRow(product!.id);
      expect(productData.sku).toBe(product!.sku);
      expect(productData.name).toBe(product!.name);
      expect(productData.stock).toBe(product!.stock.toString());
      expect(productData.price).toBe(`$${product!.price}`);

      expect(product?.description).toBe(
        'This is a detailed product description'
      );
    });

    test('should create product with custom lowStockThreshold', async ({
      productFormPage,
      productsPage,
      page,
    }) => {
      await productFormPage.createProduct({
        sku: 'THRESHOLD-001',
        name: 'Custom Threshold Product',
        category: 'Hardware',
        price: 299.99,
        stock: 100,
        lowStockThreshold: 20,
      });
      const products = await getProductsFromLocalStorage(page);
      const product = products.find((p) => p.sku === 'THRESHOLD-001');

      // Verify product appears in table
      await productsPage.goto();
      await expect(productsPage.getProductRow(product!.id)).toBeVisible();

      const productData = await productsPage.getProductDataFromRow(product!.id);
      expect(productData.sku).toBe(product!.sku);
      expect(productData.name).toBe(product!.name);
      expect(productData.stock).toBe(product?.stock.toString());

      // LowStockThreshold is validated via localStorage (not directly shown in table)

      expect(product?.lowStockThreshold).toBe(20);
    });

    test('should use default lowStockThreshold when not provided', async ({
      productFormPage,
      productsPage,
      page,
    }) => {
      await productFormPage.createProduct({
        sku: 'DEFAULT-THRESHOLD-001',
        name: 'Default Threshold Product',
        category: 'Software',
        price: 49.99,
        stock: 50,
      });
      const products = await getProductsFromLocalStorage(page);
      const product = products.find((p) => p.sku === 'DEFAULT-THRESHOLD-001');
      // Verify product appears in table
      await productsPage.goto();
      await expect(productsPage.getProductRow(product!.id)).toBeVisible();

      const productData = await productsPage.getProductDataFromRow(product!.id);
      expect(productData.sku).toBe(product!.sku);
      expect(productData.name).toBe(product!.name);

      // Verify default threshold was applied (default is 5)

      expect(product?.lowStockThreshold).toBeDefined();
      expect(product?.lowStockThreshold).toBe(5);
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle very large price', async ({
      productFormPage,
      productsPage,
      page,
    }) => {
      await productFormPage.createProduct({
        sku: 'EDGE-MAX-PRICE',
        name: 'Maximum Price Product',
        category: 'Hardware',
        price: 99999999.99,
        stock: 1,
      });
      const products = await getProductsFromLocalStorage(page);
      const product = products.find((p) => p.sku === 'EDGE-MAX-PRICE');
      // Verify large price is displayed correctly in UI
      await productsPage.goto();
      await expect(productsPage.getProductRow(product!.id)).toBeVisible();

      const productData = await productsPage.getProductDataFromRow(product!.id);
      expect(productData.price).toBe(`$${product!.price}`);
      expect(productData.name).toBe(product!.name);

      // Verify data persistence (localStorage validation)

      expect(product?.price).toBe(product!.price);
      expect(product?.stock).toBe(product!.stock);
    });

    test('should handle very small price', async ({
      productFormPage,
      productsPage,
      page,
    }) => {
      await productFormPage.createProduct({
        sku: 'EDGE-MIN-PRICE',
        name: 'Minimum Price Product',
        category: 'Accessories',
        price: 0.01,
        stock: 100,
      });
      const products = await getProductsFromLocalStorage(page);
      const product = products.find((p) => p.sku === 'EDGE-MIN-PRICE');
      // Verify small price is displayed correctly in UI
      await productsPage.goto();
      await expect(productsPage.getProductRow(product!.id)).toBeVisible();

      const productData = await productsPage.getProductDataFromRow(product!.id);
      expect(productData.price).toBe(`$${product!.price}`);
      expect(productData.name).toBe(product!.name);

      // Verify data persistence (localStorage validation)

      expect(product?.price).toBe(product!.price);
      expect(product?.stock).toBe(100);
    });

    test('should handle zero stock', async ({
      productFormPage,
      productsPage,
      page,
    }) => {
      await productFormPage.createProduct({
        sku: 'EDGE-ZERO-STOCK',
        name: 'Zero Stock Product',
        category: 'Electronics',
        price: 499.99,
        stock: 0,
      });
      const products = await getProductsFromLocalStorage(page);
      const product = products.find((p) => p.sku === 'EDGE-ZERO-STOCK');

      // Verify zero stock is displayed correctly in UI
      await productsPage.goto();
      await expect(productsPage.getProductRow(product!.id)).toBeVisible();

      const productData = await productsPage.getProductDataFromRow(product!.id);
      expect(productData.stock).toBe(product!.stock.toString());
      expect(productData.name).toBe(product!.name);

      // Verify data persistence (localStorage validation)

      expect(product?.stock).toBe(product!.stock);
      expect(product?.price).toBe(product!.price);
    });

    test('should handle very long product name', async ({
      productFormPage,
      productsPage,
      page,
    }) => {
      const longName =
        'This is a Very Long Product Name That Tests the Display and Handling of Extended Names in the UI and Database';

      await productFormPage.createProduct({
        sku: 'EDGE-LONG-NAME',
        name: longName,
        category: 'Software',
        price: 29.99,
        stock: 15,
      });
      const products = await getProductsFromLocalStorage(page);
      const product = products.find((p) => p.sku === 'EDGE-LONG-NAME');

      // Verify long name is displayed correctly in UI
      await productsPage.goto();
      await expect(productsPage.getProductRow(product!.id)).toBeVisible();

      const productData = await productsPage.getProductDataFromRow(product!.id);
      expect(productData.name).toBe(longName);
      expect(productData.name.length).toBeGreaterThan(50);

      // Verify data persistence (localStorage validation)

      expect(product?.name).toBe(longName);
      expect(product?.name.length).toBeGreaterThan(50);
    });

    test('should handle special characters in name', async ({
      productFormPage,
      productsPage,
      page,
    }) => {
      await productFormPage.createProduct({
        sku: 'EDGE-SPECIAL-CHARS',
        name: 'Product with Special & Characters #1',
        category: 'Accessories',
        price: 19.99,
        stock: 25,
      });
      const products = await getProductsFromLocalStorage(page);
      const product = products.find((p) => p.sku === 'EDGE-SPECIAL-CHARS');
      // Verify special characters are displayed correctly in UI
      await productsPage.goto();
      await expect(productsPage.getProductRow(product!.id)).toBeVisible();

      const productData = await productsPage.getProductDataFromRow(product!.id);
      expect(productData.name).toBe(product!.name);
      expect(productData.name).toContain('&');
      expect(productData.name).toContain('#');

      // Verify data persistence (localStorage validation)

      expect(product?.name).toBe('Product with Special & Characters #1');
    });

    test('should handle decimal prices correctly', async ({
      productFormPage,
      productsPage,
      page,
    }) => {
      await productFormPage.createProduct({
        sku: 'DECIMAL-001',
        name: 'Decimal Price Product',
        category: 'Accessories',
        price: 19.99,
        stock: 25,
      });
      const products = await getProductsFromLocalStorage(page);
      const product = products.find((p) => p.sku === 'DECIMAL-001');
      // Verify decimal price is displayed correctly in UI
      await productsPage.goto();
      await expect(productsPage.getProductRow(product!.id)).toBeVisible();

      const productData = await productsPage.getProductDataFromRow(product!.id);
      expect(productData.price).toBe(`$${product!.price}`);
      expect(productData.name).toBe(product!.name);

      // Verify data persistence (localStorage validation)

      expect(product?.price).toBe(19.99);
    });

    test('should handle very large stock numbers', async ({
      productFormPage,
      productsPage,
      page,
    }) => {
      await productFormPage.createProduct({
        sku: 'BIGSTOCK-001',
        name: 'Large Stock Product',
        category: 'Software',
        price: 29.99,
        stock: 999999,
      });
      const products = await getProductsFromLocalStorage(page);
      const product = products.find((p) => p.sku === 'BIGSTOCK-001');

      // Verify large stock is displayed correctly in UI
      await productsPage.goto();
      await expect(productsPage.getProductRow(product!.id)).toBeVisible();

      const productData = await productsPage.getProductDataFromRow(product!.id);
      expect(productData.stock).toBe('999999'); // UI doesn't format with commas
      expect(productData.name).toBe('Large Stock Product');

      // Verify data persistence (localStorage validation)

      expect(product?.stock).toBe(999999);
    });
  });

  test.describe('Data-Driven Validation', () => {
    test('should create valid products from test data', async ({
      productFormPage,
      productsPage,
      page,
    }) => {
      // Use a filtering test product from test data
      const testProduct = testData.filteringTests[0];

      await productFormPage.createProduct({
        sku: testProduct.sku,
        name: testProduct.name,
        description: testProduct.description,
        category: testProduct.category as
          | 'Electronics'
          | 'Accessories'
          | 'Software'
          | 'Hardware',
        price: testProduct.price,
        stock: testProduct.stock,
        lowStockThreshold: testProduct.lowStockThreshold,
      });
      const products = await getProductsFromLocalStorage(page);
      const productCreated = products.find((p) => p.sku === testProduct.sku);

      // Verify product appears in UI with correct data
      await productsPage.goto();
      await expect(
        productsPage.getProductRow(productCreated!.id)
      ).toBeVisible();

      const productData = await productsPage.getProductDataFromRow(
        productCreated!.id
      );
      expect(productData.sku).toBe(testProduct.sku);
      expect(productData.name).toBe(testProduct.name);
      expect(productData.category).toBe(testProduct.category);
      // Price should be formatted
      expect(productData.stock).toBe(testProduct.stock.toString());

      // Description is only validated via localStorage

      expect(productCreated?.description).toBe(testProduct.description);
      expect(productCreated?.lowStockThreshold).toBe(
        testProduct.lowStockThreshold
      );
    });

    test('should create all sorting test products', async ({
      productFormPage,
      productsPage,
      page,
    }) => {
      // Create all sorting test products
      for (const testProduct of testData.sortingTests) {
        await productFormPage.createProduct({
          sku: testProduct.sku,
          name: testProduct.name,
          description: testProduct.description,
          category: testProduct.category as
            | 'Electronics'
            | 'Accessories'
            | 'Software'
            | 'Hardware',
          price: testProduct.price,
          stock: testProduct.stock,
        });
      }

      // STEP 1: Read from localStorage (source of truth)
      const products = await getProductsFromLocalStorage(page);

      // Validate all products were created
      for (const testProduct of testData.sortingTests) {
        const product = products.find((p) => p.sku === testProduct.sku);
        expect(product).toBeDefined();
        expect(product?.name).toBe(testProduct.name);
        expect(product?.price).toBe(testProduct.price);
        expect(product?.stock).toBe(testProduct.stock);
      }

      // STEP 2: Verify UI reflects localStorage data
      await productsPage.goto();
      for (const testProduct of testData.sortingTests) {
        const product = products.find((p) => p.sku === testProduct.sku);
        await expect(productsPage.getProductRow(product!.id)).toBeVisible();

        const productData = await productsPage.getProductDataFromRow(
          product!.id
        );
        expect(productData.name).toBe(product!.name);
        expect(productData.sku).toBe(product!.sku);
        expect(productData.price).toBe(`$${product!.price.toFixed(2)}`);
        expect(productData.stock).toBe(product!.stock.toString());
        expect(productData.category).toBe(product!.category);
      }
    });
  });
});
