import { e2eFixture as test, expect } from '@/fixtures/e2e/e2e.fixture';
import { ProductCreateInput } from '@/types/product.types';
import { getExpectedStatsFromStorage } from '@/tests/helpers/dashboard-helpers';
import { getProductsFromLocalStorage } from '@/tests/helpers/storage-helpers';
import e2eData from '@/data/e2e-journeys.json';

/**
 * E2E Journey: Complete Product Lifecycle with Full Circle Validation
 *
 * Business Scenario:
 * Manager creates a new product, adjusts inventory, validates dashboard
 * stats, deletes the product, and verifies system returns to initial state.
 *
 * Validates:
 * - Complete product lifecycle (Create → Adjust → Delete)
 * - Inventory management integration
 * - Dashboard stats accuracy throughout lifecycle
 * - Data consistency across modules
 * - Full circle validation (initial state === final state)
 *
 * Note: E2E journeys are designed to be isolated and handle their own cleanup.
 * Each journey creates and deletes its own test data.
 */

test.describe('E2E Journey - Product Lifecycle', () => {
  // Increase timeout for E2E journeys
  test.setTimeout(60000);

  test('Complete lifecycle: Create → Adjust → Validate → Delete → Verify initial state', async ({
    productFormPage,
    productsPage,
    inventoryPage,
    dashboardPage,
    page,
  }) => {
    const testProduct = e2eData.inventoryManagement[0] as ProductCreateInput;
    let productId = '';

    // Capture initial dashboard stats before creating product
    let initialStats: {
      totalProducts: number;
      lowStockItems: number;
      totalValue: number;
    };

    await test.step('Capture initial dashboard stats', async () => {
      await dashboardPage.goto();

      // Wait for dashboard to load
      await expect
        .poll(async () => await dashboardPage.getTotalProducts(), {
          timeout: 5000,
        })
        .toBeGreaterThanOrEqual(0);

      initialStats = await getExpectedStatsFromStorage(page);
    });

    // Step 1: Create new product
    await test.step('Create new product via form', async () => {
      await productFormPage.gotoNew();
      await productFormPage.createProduct(testProduct);

      await expect(page).toHaveURL('/products');
    });

    // Step 2: Verify product appears in products list
    await test.step('Verify product in products list', async () => {
      await productsPage.goto();
      await productsPage.searchProducts(testProduct.sku);

      const count = await productsPage.getProductCount();
      expect(count).toBe(1);

      // Get product ID for later use
      productId = await productsPage.getFirstProductId();
    });

    // Step 3: Navigate to inventory and adjust stock
    await test.step('Adjust inventory stock level', async () => {
      await inventoryPage.goto();

      const allProducts = await getProductsFromLocalStorage(page);
      const product = allProducts.find((p) => p.id === productId);
      expect(product).toBeTruthy();

      const initialStock = product!.stock;
      const adjustment = 25;

      await inventoryPage.adjustStock(productId, adjustment);

      // Verify stock updated in localStorage
      const updatedProducts = await getProductsFromLocalStorage(page);
      const updatedProduct = updatedProducts.find((p) => p.id === productId);
      expect(updatedProduct!.stock).toBe(initialStock + adjustment);
    });

    // Step 4: Verify dashboard reflects changes
    await test.step('Verify dashboard stats updated', async () => {
      await dashboardPage.goto();

      // Wait for dashboard to load
      await expect
        .poll(async () => await dashboardPage.getTotalProducts(), {
          timeout: 5000,
        })
        .toBeGreaterThan(0);

      // Get expected stats from localStorage
      const expectedStats = await getExpectedStatsFromStorage(page);

      const actualTotal = await dashboardPage.getTotalProducts();
      const actualValue = await dashboardPage.getTotalValue();

      expect(actualTotal).toBe(expectedStats.totalProducts);
      expect(actualValue).toBe(expectedStats.totalValue);
    });

    // Step 5: Delete test product
    await test.step('Delete test product', async () => {
      await productsPage.goto();
      await productsPage.searchProducts(testProduct.sku);
      await productsPage.deleteProduct(productId);

      // Verify product no longer visible in list
      await productsPage.searchProducts(testProduct.sku);
      const count = await productsPage.getProductCount();
      expect(count).toBe(0);
    });

    // Step 6: Verify dashboard stats returned to initial state
    await test.step('Verify dashboard stats returned to initial', async () => {
      await dashboardPage.goto();

      // Wait for dashboard to recalculate after deletion (poll for initial value)
      await expect
        .poll(async () => await dashboardPage.getTotalProducts(), {
          timeout: 5000,
        })
        .toBe(initialStats.totalProducts);

      const finalStats = await getExpectedStatsFromStorage(page);
      const actualTotal = await dashboardPage.getTotalProducts();
      const actualValue = await dashboardPage.getTotalValue();

      // Full circle validation: Stats returned to initial state after complete lifecycle
      expect(actualTotal).toBe(initialStats.totalProducts);
      expect(finalStats.totalProducts).toBe(initialStats.totalProducts);
      expect(actualValue).toBe(finalStats.totalValue);
    });
  });
});
