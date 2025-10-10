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
 * Note: Product creation and form validation tests are in product-form.spec.ts
 */

import {
  productsFixture as test,
  expect,
} from '@/fixtures/products/products.fixture';
import { ProductFormPage } from '@/pages/product-form.page';
import {
  getProductsFromLocalStorage,
  getExpectedFilteredProducts,
} from '@/tests/helpers/products-helpers';

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
  });
});
