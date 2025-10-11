import { e2eFixture as test, expect } from '@/fixtures/e2e/e2e.fixture';
import { ProductCreateInput } from '@/types/product.types';
import { getProductsFromLocalStorage } from '@/tests/helpers/storage-helpers';
import e2eData from '@/data/e2e-journeys.json';

/**
 * E2E Journey: Search and Filter Discovery Workflow
 *
 * Business Scenario:
 * User needs to find specific products using search and filters
 * to locate items across different categories.
 *
 * Validates:
 * - Search functionality
 * - Category filtering
 * - Filter combinations
 * - Data-driven result validation
 * - Complete deletion validation (UI + localStorage)
 */

test.describe('E2E Journey - Search and Filter', () => {
  // Increase timeout for E2E journeys
  test.setTimeout(60000);

  test('Create products → Search by keyword → Filter by category', async ({
    productFormPage,
    productsPage,
    page,
  }) => {
    const testProducts = e2eData.searchAndFilter as ProductCreateInput[];
    const createdIds: string[] = [];

    // Step 1: Create multiple test products
    await test.step('Create diverse test products', async () => {
      for (const product of testProducts) {
        await productFormPage.gotoNew();
        await productFormPage.createProduct(product);
        await expect(page).toHaveURL('/products');
      }

      // Verify all created
      await productsPage.goto();
      const totalCount = await productsPage.getProductCount();
      expect(totalCount).toBeGreaterThanOrEqual(testProducts.length);
    });

    // Step 2: Search by keyword "Laptop"
    await test.step('Search for "Laptop" keyword', async () => {
      await productsPage.goto();
      await productsPage.searchProducts('Laptop');

      // Get expected count from localStorage
      const allProducts = await getProductsFromLocalStorage(page);
      const expectedLaptops = allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes('laptop') ||
          p.sku.toLowerCase().includes('laptop')
      );

      const actualCount = await productsPage.getProductCount();
      expect(actualCount).toBe(expectedLaptops.length);
      // Should have at least our 2 test laptops
      expect(actualCount).toBeGreaterThanOrEqual(2);
    });

    // Step 3: Clear search and filter by Electronics
    await test.step('Filter by Electronics category', async () => {
      await productsPage.searchProducts(''); // Clear search
      await productsPage.filterByCategory('Electronics');

      const allProducts = await getProductsFromLocalStorage(page);
      const expectedElectronics = allProducts.filter(
        (p) => p.category === 'Electronics'
      );

      const actualCount = await productsPage.getProductCount();
      expect(actualCount).toBe(expectedElectronics.length);
      expect(actualCount).toBeGreaterThanOrEqual(2);
    });

    // Step 4: Combine search and filter
    await test.step('Search "Premium" + Filter "Accessories"', async () => {
      await productsPage.searchProducts('Premium');
      await productsPage.filterByCategory('Accessories');

      const allProducts = await getProductsFromLocalStorage(page);
      const expected = allProducts.filter(
        (p) =>
          p.category === 'Accessories' &&
          (p.name.toLowerCase().includes('premium') ||
            p.sku.toLowerCase().includes('premium'))
      );

      const actualCount = await productsPage.getProductCount();
      expect(actualCount).toBe(expected.length);
    });

    // Step 5: Reset filters
    await test.step('Reset to show all products', async () => {
      await productsPage.searchProducts('');
      await productsPage.filterByCategory('all');

      const allProducts = await getProductsFromLocalStorage(page);
      const actualCount = await productsPage.getProductCount();
      expect(actualCount).toBe(allProducts.length);
    });

    // Step 6: Delete test products
    await test.step('Delete all test products', async () => {
      for (const product of testProducts) {
        await productsPage.searchProducts(product.sku);
        const count = await productsPage.getProductCount();
        // eslint-disable-next-line playwright/no-conditional-in-test
        if (count > 0) {
          const productId = await productsPage.getFirstProductId();
          createdIds.push(productId);
          await productsPage.deleteProduct(productId);
        }
      }
    });

    // Step 7: Verify all test products were deleted
    await test.step('Verify all test products deleted', async () => {
      // Check each product SKU is no longer in the system
      for (const product of testProducts) {
        await productsPage.searchProducts(product.sku);
        const count = await productsPage.getProductCount();
        expect(count).toBe(0);
      }

      // Clear search and verify created IDs are not in localStorage
      await productsPage.searchProducts('');
      const allProducts = await getProductsFromLocalStorage(page);

      for (const deletedId of createdIds) {
        const stillExists = allProducts.some((p) => p.id === deletedId);
        expect(stillExists).toBe(false);
      }
    });
  });
});
