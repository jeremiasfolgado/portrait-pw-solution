/**
 * Products List Test Suite
 *
 * Test suite focused on product listing functionality:
 * - Search and filter products
 * - Sort products by different criteria
 * - Product deletion with confirmation
 * - Navigation to product form
 *
 * This suite fulfills Level 1 Required tasks:
 * ✅ Search for products
 * ✅ Delete a product with confirmation
 *
 * ## Validation Strategy
 *
 * Tests validate against actual localStorage data, not hardcoded expectations.
 * This ensures tests validate real application behavior and work with any dataset.
 *
 * ## Data-Driven Approach
 *
 * The productsFixture automatically loads 33 test products from products-test-data.json:
 * - 12 products for filtering tests (3 per category)
 * - 3 products for sorting tests
 * - 5 products for search tests (case-insensitive)
 * - 3 products for low stock tests
 *
 * Products are validated by SKU to prevent duplicates across test runs.
 *
 * Note: Product creation and form validation tests are in product-form.spec.ts
 */

import {
  productsFixture as test,
  expect,
} from '@/fixtures/products/products.fixture';
import { ProductFormPage } from '@/pages/product-form.page';
import { getExpectedFilteredProducts } from '@/tests/helpers/products-helpers';
import { getProductsFromLocalStorage } from '@/tests/helpers/storage-helpers';
import testData from '@/data/products-test-data.json';

test.describe('Products List', () => {
  test.describe('Page Navigation', () => {
    test('should display products page with table', async ({
      productsPage,
    }) => {
      await expect(productsPage.productsTitle).toBeVisible();
      await expect(productsPage.productsTable).toBeVisible();
      await expect(productsPage.addProductButton).toBeVisible();
    });

    test('should navigate to new product form', async ({
      productsPage,
      page,
    }) => {
      await productsPage.clickAddProduct();
      await expect(page).toHaveURL('/products/new');
    });

    test('should navigate to edit product form', async ({
      productsPage,
      page,
    }) => {
      // Get the first product ID
      const id = await productsPage.getFirstProductId();

      // Navigate to edit form
      await productsPage.clickEditProduct(id);

      // Should be on the edit page
      await expect(page).toHaveURL(`/products/${id}`);
    });
  });

  test.describe('Search and Filter', () => {
    test('should search products by name', async ({ productsPage, page }) => {
      // Get expected results from localStorage
      const expectedProducts = await getExpectedFilteredProducts(page, {
        searchTerm: 'Laptop',
      });

      // Search for a specific term
      await productsPage.searchProducts('Laptop');

      // Verify search input has the value
      await expect(productsPage.searchInput).toHaveValue('Laptop');

      // Validate count matches expected filtered results
      const actualCount = await productsPage.getProductCount();
      expect(actualCount).toBe(expectedProducts.length);
    });

    test('should search products by SKU', async ({ productsPage, page }) => {
      // Get expected results from localStorage
      const expectedProducts = await getExpectedFilteredProducts(page, {
        searchTerm: 'SOFT',
      });

      // Search by SKU prefix
      await productsPage.searchProducts('SOFT');

      // Verify search input has the value
      await expect(productsPage.searchInput).toHaveValue('SOFT');

      // Validate count matches expected
      const actualCount = await productsPage.getProductCount();
      expect(actualCount).toBe(expectedProducts.length);
    });

    test('should show "No products found" when search has no results', async ({
      productsPage,
    }) => {
      // Search for something that doesn't exist
      await productsPage.searchProducts('NONEXISTENT_PRODUCT_XYZ123');

      // Should show no products message
      await expect(productsPage.noProductsMessage).toBeVisible();
      await expect(productsPage.noProductsMessage).toHaveText(
        'No products found'
      );
    });

    test('should clear search and show all products', async ({
      productsPage,
      page,
    }) => {
      // Get total from localStorage
      const allProducts = await getProductsFromLocalStorage(page);

      // Apply search
      await productsPage.searchProducts('Laptop');
      await expect(productsPage.searchInput).toHaveValue('Laptop');

      // Clear search
      await productsPage.clearSearch();
      await expect(productsPage.searchInput).toHaveValue('');

      // Should show all products again
      const clearedCount = await productsPage.getProductCount();
      expect(clearedCount).toBe(allProducts.length);
    });

    test('should filter products by category', async ({
      productsPage,
      page,
    }) => {
      // Get all products from localStorage
      const allProducts = await getProductsFromLocalStorage(page);

      // Get expected Electronics products
      const expectedElectronics = await getExpectedFilteredProducts(page, {
        category: 'Electronics',
      });

      // Filter by Electronics
      await productsPage.filterByCategory('Electronics');
      await expect(productsPage.categoryFilter).toHaveValue('Electronics');

      // Validate count matches expected
      const filteredCount = await productsPage.getProductCount();
      expect(filteredCount).toBe(expectedElectronics.length);

      // Reset to all
      await productsPage.filterByCategory('all');
      await expect(productsPage.categoryFilter).toHaveValue('all');

      // Should show all products
      const resetCount = await productsPage.getProductCount();
      expect(resetCount).toBe(allProducts.length);
    });

    test('should filter products by Accessories category', async ({
      productsPage,
      page,
    }) => {
      // Get expected Accessories products
      const expectedProducts = await getExpectedFilteredProducts(page, {
        category: 'Accessories',
      });

      // Filter by Accessories
      await productsPage.filterByCategory('Accessories');
      await expect(productsPage.categoryFilter).toHaveValue('Accessories');

      // Validate count matches expected
      const count = await productsPage.getProductCount();
      expect(count).toBe(expectedProducts.length);
    });

    test('should filter products by Software category', async ({
      productsPage,
      page,
    }) => {
      // Get expected Software products
      const expectedProducts = await getExpectedFilteredProducts(page, {
        category: 'Software',
      });

      // Filter by Software
      await productsPage.filterByCategory('Software');
      await expect(productsPage.categoryFilter).toHaveValue('Software');

      // Validate count matches expected
      const count = await productsPage.getProductCount();
      expect(count).toBe(expectedProducts.length);
    });

    test('should filter products by Hardware category', async ({
      productsPage,
      page,
    }) => {
      // Get expected Hardware products
      const expectedProducts = await getExpectedFilteredProducts(page, {
        category: 'Hardware',
      });

      // Filter by Hardware
      await productsPage.filterByCategory('Hardware');
      await expect(productsPage.categoryFilter).toHaveValue('Hardware');

      // Validate count matches expected
      const count = await productsPage.getProductCount();
      expect(count).toBe(expectedProducts.length);
    });

    test('should combine search and category filter', async ({
      productsPage,
      page,
    }) => {
      // Get expected results with both filters
      const expectedProducts = await getExpectedFilteredProducts(page, {
        searchTerm: 'Pro',
        category: 'Electronics',
      });

      // Apply both filters
      await productsPage.searchProducts('Pro');
      await productsPage.filterByCategory('Electronics');

      // Verify both filters are applied
      await expect(productsPage.searchInput).toHaveValue('Pro');
      await expect(productsPage.categoryFilter).toHaveValue('Electronics');

      // Validate count matches expected
      const count = await productsPage.getProductCount();
      expect(count).toBe(expectedProducts.length);
    });

    test('should search case-insensitively', async ({ productsPage, page }) => {
      // Get expected results for uppercase search
      const expectedUppercase = await getExpectedFilteredProducts(page, {
        searchTerm: 'LAPTOP',
      });

      // Search with uppercase
      await productsPage.searchProducts('LAPTOP');
      const uppercaseCount = await productsPage.getProductCount();

      // Clear and search with lowercase
      await productsPage.clearSearch();
      const expectedLowercase = await getExpectedFilteredProducts(page, {
        searchTerm: 'laptop',
      });
      await productsPage.searchProducts('laptop');
      const lowercaseCount = await productsPage.getProductCount();

      // Both should match expected counts
      expect(uppercaseCount).toBe(expectedUppercase.length);
      expect(lowercaseCount).toBe(expectedLowercase.length);

      // Both counts should be equal
      expect(uppercaseCount).toBe(lowercaseCount);
    });

    test('should reset all filters simultaneously', async ({
      productsPage,
      page,
    }) => {
      // Apply multiple filters
      await productsPage.searchProducts('Laptop');
      await productsPage.filterByCategory('Electronics');
      await productsPage.sortBy('price');

      // Verify filters are applied
      await expect(productsPage.searchInput).toHaveValue('Laptop');
      await expect(productsPage.categoryFilter).toHaveValue('Electronics');
      await expect(productsPage.sortSelect).toHaveValue('price');

      // Reset all filters
      await productsPage.clearSearch();
      await productsPage.filterByCategory('all');

      // Verify filters are reset
      await expect(productsPage.searchInput).toHaveValue('');
      await expect(productsPage.categoryFilter).toHaveValue('all');

      // Should show all products
      const allProducts = await getProductsFromLocalStorage(page);
      const count = await productsPage.getProductCount();
      expect(count).toBe(allProducts.length);
    });
  });

  test.describe('Sort Products', () => {
    test('should sort products by name', async ({ productsPage, page }) => {
      // Get expected count from localStorage
      const allProducts = await getProductsFromLocalStorage(page);

      // Sort by name
      await productsPage.sortBy('name');
      await expect(productsPage.sortSelect).toHaveValue('name');

      // Verify count remains the same (all products still visible)
      const count = await productsPage.getProductCount();
      expect(count).toBe(allProducts.length);
    });

    test('should sort products by price', async ({ productsPage, page }) => {
      // Get expected count from localStorage
      const allProducts = await getProductsFromLocalStorage(page);

      // Sort by price
      await productsPage.sortBy('price');
      await expect(productsPage.sortSelect).toHaveValue('price');

      // Verify count remains the same
      const count = await productsPage.getProductCount();
      expect(count).toBe(allProducts.length);
    });

    test('should sort products by stock', async ({ productsPage, page }) => {
      // Get expected count from localStorage
      const allProducts = await getProductsFromLocalStorage(page);

      // Sort by stock
      await productsPage.sortBy('stock');
      await expect(productsPage.sortSelect).toHaveValue('stock');

      // Verify count remains the same
      const count = await productsPage.getProductCount();
      expect(count).toBe(allProducts.length);
    });

    test('should sort products by name in correct order', async ({
      productsPage,
      page,
    }) => {
      // Get expected sorted products
      const expectedProducts = await getExpectedFilteredProducts(page, {
        sortBy: 'name',
      });

      // Sort by name
      await productsPage.sortBy('name');

      // Verify the first product matches expected
      const firstProductName = await productsPage.getFirstProductName();
      expect(firstProductName).toBe(expectedProducts[0].name);
    });

    test('should sort products by price in correct order', async ({
      productsPage,
      page,
    }) => {
      // Get expected sorted products
      const expectedProducts = await getExpectedFilteredProducts(page, {
        sortBy: 'price',
      });

      // Sort by price
      await productsPage.sortBy('price');

      // Verify the first product price matches expected
      const firstProductPrice = await productsPage.getFirstProductPrice();
      const expectedPrice = `$${expectedProducts[0].price.toFixed(2)}`;
      expect(firstProductPrice).toBe(expectedPrice);
    });

    test('should sort products by stock in correct order', async ({
      productsPage,
      page,
    }) => {
      // Get expected sorted products
      const expectedProducts = await getExpectedFilteredProducts(page, {
        sortBy: 'stock',
      });

      // Sort by stock
      await productsPage.sortBy('stock');

      // Verify the first product stock matches expected
      const firstProductStock = await productsPage.getFirstProductStock();
      expect(firstProductStock).toBe(expectedProducts[0].stock.toString());
    });
  });

  test.describe('Product Deletion', () => {
    test('should delete a product with confirmation', async ({
      productsPage,
      page,
    }) => {
      // First, create a product to delete using ProductFormPage
      const productFormPage = new ProductFormPage(page);
      await productFormPage.createProduct({
        sku: 'DEL-001',
        name: 'Product To Delete',
        category: 'Software',
        price: 29.99,
        stock: 5,
      });

      await expect(page).toHaveURL('/products');

      // Search for the product
      await productsPage.searchProducts('Product To Delete');
      await expect(productsPage.searchInput).toHaveValue('Product To Delete');

      const initialCount = await productsPage.getProductCount();
      expect(initialCount).toBeGreaterThan(0);

      // Get the product ID from the first row
      const id = await productsPage.getFirstProductId();

      // Click delete button
      await productsPage.clickDeleteProduct(id);

      // Modal should be visible
      await expect(productsPage.deleteModal).toBeVisible();

      // Confirm deletion
      await productsPage.confirmDelete();

      // Modal should be hidden
      await expect(productsPage.deleteModal).toBeHidden();

      // Product should be removed
      const finalCount = await productsPage.getProductCount();
      expect(finalCount).toBe(initialCount - 1);
    });

    test('should cancel product deletion', async ({ productsPage, page }) => {
      // Create a product using ProductFormPage
      const productFormPage = new ProductFormPage(page);
      await productFormPage.createProduct({
        sku: 'KEEP-001',
        name: 'Product To Keep',
        category: 'Accessories',
        price: 19.99,
        stock: 15,
      });

      await expect(page).toHaveURL('/products');

      // Search for it
      await productsPage.searchProducts('Product To Keep');
      await expect(productsPage.searchInput).toHaveValue('Product To Keep');

      const initialCount = await productsPage.getProductCount();
      expect(initialCount).toBeGreaterThan(0);

      // Get product ID
      const id = await productsPage.getFirstProductId();

      // Click delete
      await productsPage.clickDeleteProduct(id);
      await expect(productsPage.deleteModal).toBeVisible();

      // Cancel deletion
      await productsPage.cancelDelete();

      // Modal should close
      await expect(productsPage.deleteModal).toBeHidden();

      // Product should still exist
      const finalCount = await productsPage.getProductCount();
      expect(finalCount).toBe(initialCount);
    });

    test('should remove product from localStorage after deletion', async ({
      productsPage,
      page,
    }) => {
      // Create a product
      const productFormPage = new ProductFormPage(page);
      await productFormPage.createProduct({
        sku: 'TEMP-001',
        name: 'Temporary Product',
        category: 'Software',
        price: 9.99,
        stock: 3,
      });

      await expect(page).toHaveURL('/products');

      // Search for the product
      await productsPage.searchProducts('Temporary Product');
      const id = await productsPage.getFirstProductId();

      // Delete the product
      await productsPage.deleteProduct(id);

      // Verify it's not in localStorage
      const productsAfter = await getProductsFromLocalStorage(page);
      const exists = productsAfter.some((p) => p.id === id);
      expect(exists).toBe(false);
    });
  });

  test.describe('Product Data Display', () => {
    test('should display correct product data in table', async ({
      productsPage,
      page,
    }) => {
      // Use first filtering test product (loaded via fixture)
      const testProduct = testData.filteringTests[0];

      // Verify products loaded correctly
      const allProducts = await getProductsFromLocalStorage(page);
      const productExists = allProducts.some((p) => p.sku === testProduct.sku);
      expect(productExists).toBe(true);

      // Search for the product by SKU (more specific)
      await productsPage.searchProducts(testProduct.sku);

      // Verify we found at least one product
      const count = await productsPage.getProductCount();
      expect(count).toBeGreaterThanOrEqual(1);

      const id = await productsPage.getFirstProductId();

      // Get product data from table
      const data = await productsPage.getProductDataFromRow(id);

      // Verify all fields match test data
      expect(data.sku).toBe(testProduct.sku);
      expect(data.name).toBe(testProduct.name);
      expect(data.category).toBe(testProduct.category);
      expect(data.price).toBe(`$${testProduct.price.toFixed(2)}`);
      expect(data.stock).toBe(testProduct.stock.toString());
    });

    test('should show low stock warning badge', async ({
      productsPage,
      page,
    }) => {
      // Use first low stock test product (loaded via fixture)
      const lowStockProduct = testData.lowStockTests[0];

      // Verify product loaded correctly
      const allProducts = await getProductsFromLocalStorage(page);
      const productExists = allProducts.some(
        (p) => p.sku === lowStockProduct.sku
      );
      expect(productExists).toBe(true);

      // Search for the product by SKU
      await productsPage.searchProducts(lowStockProduct.sku);

      // Verify we found the product
      const count = await productsPage.getProductCount();
      expect(count).toBe(1);

      const id = await productsPage.getFirstProductId();

      // Verify low stock badge is visible
      const hasLowStockBadge = await productsPage.hasLowStockBadge(id);
      expect(hasLowStockBadge).toBe(true);

      // Verify it's actually low stock in our test data
      expect(lowStockProduct.stock).toBeLessThanOrEqual(
        lowStockProduct.lowStockThreshold
      );
    });

    test('should not show low stock warning for adequate stock', async ({
      productsPage,
      page,
    }) => {
      // Use good stock test product (loaded via fixture)
      const goodStockProduct = testData.lowStockTests[2]; // Third item is "Good Stock Item"

      // Verify product loaded correctly
      const allProducts = await getProductsFromLocalStorage(page);
      const productExists = allProducts.some(
        (p) => p.sku === goodStockProduct.sku
      );
      expect(productExists).toBe(true);

      // Search for the product by SKU
      await productsPage.searchProducts(goodStockProduct.sku);

      // Verify we found the product
      const count = await productsPage.getProductCount();
      expect(count).toBe(1);

      const id = await productsPage.getFirstProductId();

      // Verify low stock badge is NOT visible
      const hasLowStockBadge = await productsPage.hasLowStockBadge(id);
      expect(hasLowStockBadge).toBe(false);

      // Verify it's actually good stock in our test data
      expect(goodStockProduct.stock).toBeGreaterThan(
        goodStockProduct.lowStockThreshold
      );
    });
  });
});
