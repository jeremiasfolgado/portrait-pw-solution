import { e2eBaseFixture as test, expect } from '@/fixtures/e2e/e2e.fixture';
import { ProductCreateInput } from '@/types/product.types';
import { getExpectedStatsFromStorage } from '@/tests/helpers/dashboard-helpers';
import { getProductsFromLocalStorage } from '@/tests/helpers/storage-helpers';
import e2eData from '@/data/e2e-journeys.json';

/**
 * E2E Journey: Multi-User Collaboration Workflow
 *
 * Business Scenario:
 * Admin creates a product and verifies dashboard. Then logs out.
 * Regular user logs in, finds the product, adjusts inventory,
 * deletes it, and validates changes.
 *
 * Validates:
 * - Data persistence across sessions
 * - Multi-user collaboration
 * - Role-based workflows
 * - Session management (logout/login)
 * - Data consistency between users
 */

test.describe('E2E Journey - Multi-User Collaboration', () => {
  // Increase timeout for complex multi-user journey (2 sessions, 12 steps)
  test.setTimeout(60000);

  test('Multi-user: Admin creates → User adjusts & deletes', async ({
    loginPage,
    productsPage,
    productFormPage,
    inventoryPage,
    dashboardPage,
    page,
  }) => {
    const testProduct = e2eData.multiUser as ProductCreateInput;
    let productId = '';
    let initialStatsAdmin: {
      totalProducts: number;
      lowStockItems: number;
      totalValue: number;
    };

    // ========== ADMIN SESSION ==========

    // Step 1: Admin logs in
    await test.step('Admin user logs in', async () => {
      await loginPage.goto();
      await loginPage.login('admin@test.com', 'Admin123!');
      await page.waitForURL('/dashboard');

      const userName = await dashboardPage.navbar.getUserName();
      expect(userName).toBe('Admin User');
    });

    // Step 2: Admin captures initial stats
    await test.step('Admin captures initial dashboard stats', async () => {
      await dashboardPage.goto();

      await expect
        .poll(async () => await dashboardPage.getTotalProducts(), {
          timeout: 5000,
        })
        .toBeGreaterThanOrEqual(0);

      initialStatsAdmin = await getExpectedStatsFromStorage(page);
    });

    // Step 3: Admin creates product
    await test.step('Admin creates new product', async () => {
      await productFormPage.gotoNew();
      await productFormPage.createProduct(testProduct);
      await expect(page).toHaveURL('/products');
    });

    // Step 4: Admin verifies product in list
    await test.step('Admin verifies product in list', async () => {
      await productsPage.goto();
      await productsPage.searchProducts(testProduct.sku);

      const count = await productsPage.getProductCount();
      expect(count).toBe(1);

      productId = await productsPage.getFirstProductId();
    });

    // Step 5: Admin verifies dashboard updated
    await test.step('Admin verifies dashboard stats increased', async () => {
      await dashboardPage.goto();

      // Wait for stats to reflect the new product
      await expect
        .poll(async () => await dashboardPage.getTotalProducts(), {
          timeout: 5000,
        })
        .toBe(initialStatsAdmin.totalProducts + 1);
    });

    // Step 6: Admin logs out
    await test.step('Admin logs out', async () => {
      await dashboardPage.navbar.logout();
      await expect(page).toHaveURL('/login');
    });

    // ========== REGULAR USER SESSION ==========

    // Step 7: Regular user logs in
    await test.step('Regular user logs in', async () => {
      await loginPage.login('user@test.com', 'User123!');
      await page.waitForURL('/dashboard');

      const userName = await dashboardPage.navbar.getUserName();
      expect(userName).toBe('Regular User');
    });

    // Step 8: User finds product created by admin
    await test.step('User finds product created by admin', async () => {
      await productsPage.goto();
      await productsPage.searchProducts(testProduct.sku);

      const count = await productsPage.getProductCount();
      expect(count).toBe(1);

      // Verify it's the same product (persistence across sessions)
      const foundId = await productsPage.getFirstProductId();
      expect(foundId).toBe(productId);
    });

    // Step 9: User adjusts inventory
    await test.step('User adjusts product stock', async () => {
      await inventoryPage.goto();

      const allProducts = await getProductsFromLocalStorage(page);
      const product = allProducts.find((p) => p.id === productId);
      expect(product).toBeTruthy();

      const initialStock = product!.stock;
      const adjustment = -10; // Decrease stock

      await inventoryPage.adjustStock(productId, adjustment);

      // Verify adjustment
      const updatedProducts = await getProductsFromLocalStorage(page);
      const updatedProduct = updatedProducts.find((p) => p.id === productId);
      expect(updatedProduct!.stock).toBe(initialStock + adjustment);
    });

    // Step 10: User verifies dashboard reflects changes
    await test.step('User verifies dashboard updated after adjustment', async () => {
      await dashboardPage.goto();

      await expect
        .poll(async () => await dashboardPage.getTotalProducts(), {
          timeout: 5000,
        })
        .toBeGreaterThan(0);

      const expectedStats = await getExpectedStatsFromStorage(page);
      const actualValue = await dashboardPage.getTotalValue();

      expect(actualValue).toBe(expectedStats.totalValue);
    });

    // Step 11: User deletes product
    await test.step('User deletes product', async () => {
      await productsPage.goto();
      await productsPage.searchProducts(testProduct.sku);
      await productsPage.deleteProduct(productId);

      // Verify deletion in UI
      await productsPage.searchProducts(testProduct.sku);
      const count = await productsPage.getProductCount();
      expect(count).toBe(0);
    });

    // Step 12: User verifies dashboard returned to initial state
    await test.step('User verifies dashboard returned to initial', async () => {
      await dashboardPage.goto();

      // Wait for stats to return to initial state after deletion
      await expect
        .poll(async () => await dashboardPage.getTotalProducts(), {
          timeout: 5000,
        })
        .toBe(initialStatsAdmin.totalProducts);

      // Verify with localStorage
      const finalStats = await getExpectedStatsFromStorage(page);
      expect(finalStats.totalProducts).toBe(initialStatsAdmin.totalProducts);
    });
  });
});
