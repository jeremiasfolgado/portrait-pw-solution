/**
 * Inventory Test Suite
 *
 * Comprehensive test suite covering inventory management functionality:
 * - Stock adjustments (increase/decrease)
 * - Validation (prevent negative stock)
 * - Low stock alerts and badges
 * - Modal interactions
 *
 * This suite fulfills the Level 2 Intermediate tasks:
 * ✅ Adjust stock levels (increase/decrease)
 * ✅ Validate stock cannot go below zero
 * ✅ Verify low stock alerts appear correctly
 *
 * ## Validation Strategy
 *
 * Tests validate against actual localStorage data to ensure accurate
 * stock calculations and low stock threshold checks.
 */

import {
  inventoryFixture as test,
  expect,
} from '@/fixtures/inventory/inventory.fixture';
import {
  getProductsFromLocalStorage,
  getExpectedLowStockProducts,
  getProductFromStorage,
  calculateExpectedStock,
  isValidAdjustment,
} from '@/tests/helpers/inventory-helpers';

test.describe('Inventory Management', () => {
  test.describe('Page Rendering', () => {
    test('should display inventory page with table', async ({
      inventoryPage,
    }) => {
      await expect(inventoryPage.inventoryTitle).toBeVisible();
      await expect(inventoryPage.inventoryTable).toBeVisible();
    });

    test('should display all products in inventory table', async ({
      inventoryPage,
      page,
    }) => {
      const expectedProducts = await getProductsFromLocalStorage(page);
      const actualCount = await inventoryPage.getInventoryCount();

      expect(actualCount).toBe(expectedProducts.length);
    });
  });

  test.describe('Low Stock Alerts', () => {
    test('should show low stock alert with correct count', async ({
      inventoryPage,
      page,
    }) => {
      const expectedLowStock = await getExpectedLowStockProducts(page);

      // Only run assertion if there are low stock products
      // This is validated by checking the expected count first
      expect(expectedLowStock.length).toBeGreaterThanOrEqual(0);

      // Alert visibility should match expected state
      const hasAlert = await inventoryPage.isLowStockAlertVisible();
      const shouldHaveAlert = expectedLowStock.length > 0;
      expect(hasAlert).toBe(shouldHaveAlert);

      // If alert is visible, validate count
      const alertCount = await inventoryPage.getLowStockCount();
      expect(alertCount).toBe(expectedLowStock.length);
    });

    test('should display low stock badge on products below threshold', async ({
      inventoryPage,
      page,
    }) => {
      const expectedLowStock = await getExpectedLowStockProducts(page);

      // Ensure we have at least one low stock product for this test
      expect(expectedLowStock.length).toBeGreaterThan(0);

      // Check first low stock product has badge
      const firstLowStock = expectedLowStock[0];
      const hasBadge = await inventoryPage.hasLowStockBadge(firstLowStock.id);
      expect(hasBadge).toBe(true);

      // Badge should have correct text
      const badge = inventoryPage.getLowStockBadge(firstLowStock.id);
      await expect(badge).toHaveText('Low Stock');
    });
  });

  test.describe('Stock Adjustment - Increase', () => {
    test('should increase stock by positive value', async ({
      inventoryPage,
      page,
    }) => {
      // Get first product
      const firstId = await inventoryPage.getFirstProductId();
      const productBefore = await getProductFromStorage(page, firstId);
      expect(productBefore).toBeTruthy();

      const initialStock = productBefore!.stock;
      const adjustment = 10;

      // Adjust stock
      await inventoryPage.adjustStock(firstId, adjustment);

      // Verify stock increased in localStorage (source of truth)
      const productAfter = await getProductFromStorage(page, firstId);
      const expectedStock = calculateExpectedStock(initialStock, adjustment);
      expect(productAfter!.stock).toBe(expectedStock);

      // Verify UI reflects localStorage value
      const stockInUI = await inventoryPage.getStockFromUI(firstId);
      expect(stockInUI).toBe(productAfter!.stock.toString());
    });

    test('should handle large stock increase', async ({
      inventoryPage,
      page,
    }) => {
      const firstId = await inventoryPage.getFirstProductId();
      const productBefore = await getProductFromStorage(page, firstId);
      expect(productBefore).toBeTruthy();

      const initialStock = productBefore!.stock;
      const adjustment = 1000;

      await inventoryPage.adjustStock(firstId, adjustment);

      // Verify localStorage (source of truth)
      const productAfter = await getProductFromStorage(page, firstId);
      expect(productAfter!.stock).toBe(initialStock + adjustment);

      // Verify UI reflects localStorage value
      const stockInUI = await inventoryPage.getStockFromUI(firstId);
      expect(stockInUI).toBe(productAfter!.stock.toString());
    });

    test('should handle extremely large numbers (edge case)', async ({
      inventoryPage,
      page,
    }) => {
      const firstId = await inventoryPage.getFirstProductId();
      const productBefore = await getProductFromStorage(page, firstId);
      expect(productBefore).toBeTruthy();

      const initialStock = productBefore!.stock;
      const adjustment = 999999; // Extremely large number

      await inventoryPage.adjustStock(firstId, adjustment);

      // Verify localStorage (source of truth)
      const productAfter = await getProductFromStorage(page, firstId);
      const expectedStock = calculateExpectedStock(initialStock, adjustment);
      expect(productAfter!.stock).toBe(expectedStock);

      // Verify UI reflects localStorage value
      const stockInUI = await inventoryPage.getStockFromUI(firstId);
      expect(stockInUI).toBe(productAfter!.stock.toString());
    });
  });

  test.describe('Stock Adjustment - Decrease', () => {
    test('should decrease stock by negative value', async ({
      inventoryPage,
      page,
    }) => {
      // Get first product
      const firstId = await inventoryPage.getFirstProductId();
      const productBefore = await getProductFromStorage(page, firstId);
      expect(productBefore).toBeTruthy();

      const initialStock = productBefore!.stock;
      const adjustment = -5;

      // Ensure adjustment is valid
      expect(isValidAdjustment(initialStock, adjustment)).toBe(true);

      // Adjust stock
      await inventoryPage.adjustStock(firstId, adjustment);

      // Verify stock decreased in localStorage (source of truth)
      const productAfter = await getProductFromStorage(page, firstId);
      const expectedStock = calculateExpectedStock(initialStock, adjustment);
      expect(productAfter!.stock).toBe(expectedStock);

      // Verify UI reflects localStorage value
      const stockInUI = await inventoryPage.getStockFromUI(firstId);
      expect(stockInUI).toBe(productAfter!.stock.toString());
    });

    test('should decrease stock to exactly zero', async ({
      inventoryPage,
      page,
    }) => {
      const firstId = await inventoryPage.getFirstProductId();
      const productBefore = await getProductFromStorage(page, firstId);
      expect(productBefore).toBeTruthy();

      const initialStock = productBefore!.stock;
      const adjustment = -initialStock; // Decrease to zero

      await inventoryPage.adjustStock(firstId, adjustment);

      // Verify localStorage (source of truth)
      const productAfter = await getProductFromStorage(page, firstId);
      expect(productAfter!.stock).toBe(0);

      // Verify UI reflects localStorage value
      const stockInUI = await inventoryPage.getStockFromUI(firstId);
      expect(stockInUI).toBe('0');
    });
  });

  test.describe('Stock Adjustment Validation', () => {
    test('should prevent stock from going negative', async ({
      inventoryPage,
      page,
    }) => {
      const firstId = await inventoryPage.getFirstProductId();
      const productBefore = await getProductFromStorage(page, firstId);
      expect(productBefore).toBeTruthy();

      const initialStock = productBefore!.stock;
      const adjustment = -(initialStock + 10); // Would result in -10

      // Verify this is invalid
      expect(isValidAdjustment(initialStock, adjustment)).toBe(false);

      // Open modal and fill invalid adjustment
      await inventoryPage.clickAdjustStock(firstId);
      await inventoryPage.fillAdjustment(adjustment);
      await inventoryPage.confirmAdjustButton.click();

      // Should show error (modal stays open when there's validation error)
      const hasError = await inventoryPage.hasAdjustmentError();
      expect(hasError).toBe(true);

      const errorText = await inventoryPage.getAdjustmentError();
      expect(errorText).toBe('Stock cannot be negative');

      // Stock should remain unchanged
      await inventoryPage.cancelAdjustment();
      const productAfter = await getProductFromStorage(page, firstId);
      expect(productAfter!.stock).toBe(initialStock);
    });

    test('should show error for empty adjustment input', async ({
      inventoryPage,
      page,
    }) => {
      const firstId = await inventoryPage.getFirstProductId();
      const productBefore = await getProductFromStorage(page, firstId);

      // Open modal
      await inventoryPage.clickAdjustStock(firstId);

      // Leave input empty and try to confirm
      await inventoryPage.confirmAdjustButton.click();

      // Should show error
      const hasError = await inventoryPage.hasAdjustmentError();
      expect(hasError).toBe(true);

      const errorText = await inventoryPage.getAdjustmentError();
      expect(errorText).toBe('Please enter a valid number');

      // Cancel and verify stock unchanged
      await inventoryPage.cancelAdjustment();
      const productAfter = await getProductFromStorage(page, firstId);
      expect(productAfter!.stock).toBe(productBefore!.stock);
    });

    test('should prevent extremely large negative adjustment (edge case)', async ({
      inventoryPage,
      page,
    }) => {
      const firstId = await inventoryPage.getFirstProductId();
      const productBefore = await getProductFromStorage(page, firstId);
      expect(productBefore).toBeTruthy();

      const initialStock = productBefore!.stock;
      const adjustment = -999999; // Extremely large negative number

      // Verify this is invalid
      expect(isValidAdjustment(initialStock, adjustment)).toBe(false);

      // Open modal and fill invalid adjustment
      await inventoryPage.clickAdjustStock(firstId);
      await inventoryPage.fillAdjustment(adjustment);
      await inventoryPage.confirmAdjustButton.click();

      // Should show error
      const hasError = await inventoryPage.hasAdjustmentError();
      expect(hasError).toBe(true);

      const errorText = await inventoryPage.getAdjustmentError();
      expect(errorText).toBe('Stock cannot be negative');

      // Stock should remain unchanged
      await inventoryPage.cancelAdjustment();
      const productAfter = await getProductFromStorage(page, firstId);
      expect(productAfter!.stock).toBe(initialStock);
    });
  });

  test.describe('Modal Interactions', () => {
    test('should open adjust stock modal', async ({ inventoryPage }) => {
      const firstId = await inventoryPage.getFirstProductId();

      await inventoryPage.clickAdjustStock(firstId);

      await expect(inventoryPage.adjustStockModal).toBeVisible();
      await expect(inventoryPage.adjustmentInput).toBeVisible();
      await expect(inventoryPage.confirmAdjustButton).toBeVisible();
      await expect(inventoryPage.cancelAdjustButton).toBeVisible();
    });

    test('should cancel stock adjustment', async ({ inventoryPage, page }) => {
      const firstId = await inventoryPage.getFirstProductId();
      const productBefore = await getProductFromStorage(page, firstId);
      expect(productBefore).toBeTruthy();

      const initialStock = productBefore!.stock;

      // Open modal and fill adjustment
      await inventoryPage.clickAdjustStock(firstId);
      await inventoryPage.fillAdjustment(20);

      // Cancel instead of confirming
      await inventoryPage.cancelAdjustment();

      // Modal should be hidden
      await expect(inventoryPage.adjustStockModal).toBeHidden();

      // Stock should remain unchanged
      const productAfter = await getProductFromStorage(page, firstId);
      expect(productAfter!.stock).toBe(initialStock);
    });
  });

  test.describe('Input Interaction Methods', () => {
    test('should adjust stock using keyboard input', async ({
      inventoryPage,
      page,
    }) => {
      const firstId = await inventoryPage.getFirstProductId();
      const productBefore = await getProductFromStorage(page, firstId);
      expect(productBefore).toBeTruthy();

      const initialStock = productBefore!.stock;

      // Open modal
      await inventoryPage.clickAdjustStock(firstId);

      // Type adjustment using keyboard
      await inventoryPage.adjustmentInput.focus();
      await inventoryPage.adjustmentInput.pressSequentially('15');
      await expect(inventoryPage.adjustmentInput).toHaveValue('15');

      await inventoryPage.confirmAdjustButton.click();
      await inventoryPage.adjustStockModal.waitFor({ state: 'hidden' });

      // Verify localStorage (source of truth)
      const productAfter = await getProductFromStorage(page, firstId);
      expect(productAfter!.stock).toBe(initialStock + 15);

      // Verify UI reflects localStorage value
      const stockInUI = await inventoryPage.getStockFromUI(firstId);
      expect(stockInUI).toBe(productAfter!.stock.toString());
    });

    test('should handle multiple consecutive adjustments', async ({
      inventoryPage,
      page,
    }) => {
      const firstId = await inventoryPage.getFirstProductId();
      const productBefore = await getProductFromStorage(page, firstId);
      expect(productBefore).toBeTruthy();

      let currentStock = productBefore!.stock;

      // First adjustment: increase
      await inventoryPage.adjustStock(firstId, 10);
      currentStock += 10;

      let product = await getProductFromStorage(page, firstId);
      expect(product!.stock).toBe(currentStock);
      let stockInUI = await inventoryPage.getStockFromUI(firstId);
      expect(stockInUI).toBe(product!.stock.toString());

      // Second adjustment: decrease
      await inventoryPage.adjustStock(firstId, -5);
      currentStock -= 5;

      product = await getProductFromStorage(page, firstId);
      expect(product!.stock).toBe(currentStock);
      stockInUI = await inventoryPage.getStockFromUI(firstId);
      expect(stockInUI).toBe(product!.stock.toString());

      // Third adjustment: increase again
      await inventoryPage.adjustStock(firstId, 20);
      currentStock += 20;

      product = await getProductFromStorage(page, firstId);
      expect(product!.stock).toBe(currentStock);
      stockInUI = await inventoryPage.getStockFromUI(firstId);
      expect(stockInUI).toBe(product!.stock.toString());
    });

    test('should clear and update adjustment input value', async ({
      inventoryPage,
      page,
    }) => {
      const firstId = await inventoryPage.getFirstProductId();
      const productBefore = await getProductFromStorage(page, firstId);

      // Open modal
      await inventoryPage.clickAdjustStock(firstId);

      // Fill with first value
      await inventoryPage.fillAdjustment(10);
      await expect(inventoryPage.adjustmentInput).toHaveValue('10');

      // Clear and fill with different value
      await inventoryPage.adjustmentInput.clear();
      await inventoryPage.fillAdjustment(25);
      await expect(inventoryPage.adjustmentInput).toHaveValue('25');

      // Confirm with final value
      await inventoryPage.confirmAdjustButton.click();
      await inventoryPage.adjustStockModal.waitFor({ state: 'hidden' });

      // Verify localStorage (source of truth)
      const productAfter = await getProductFromStorage(page, firstId);
      expect(productAfter!.stock).toBe(productBefore!.stock + 25);

      // Verify UI reflects localStorage value
      const stockInUI = await inventoryPage.getStockFromUI(firstId);
      expect(stockInUI).toBe(productAfter!.stock.toString());
    });
  });

  test.describe('Low Stock Alert Updates', () => {
    test('should update low stock alert when stock increases above threshold', async ({
      inventoryPage,
      page,
    }) => {
      // Get current low stock products
      const lowStockBefore = await getExpectedLowStockProducts(page);

      // Ensure we have at least one low stock product
      expect(lowStockBefore.length).toBeGreaterThan(0);

      const lowStockProduct = lowStockBefore[0];
      const increaseNeeded =
        lowStockProduct.lowStockThreshold - lowStockProduct.stock + 5;

      // Increase stock above threshold
      await inventoryPage.adjustStock(lowStockProduct.id, increaseNeeded);

      // Check updated low stock count
      const lowStockAfter = await getExpectedLowStockProducts(page);
      expect(lowStockAfter.length).toBe(lowStockBefore.length - 1);

      // Alert should update with new count
      const hasAlert = await inventoryPage.isLowStockAlertVisible();
      const shouldHaveAlert = lowStockAfter.length > 0;
      expect(hasAlert).toBe(shouldHaveAlert);

      const alertCount = await inventoryPage.getLowStockCount();
      expect(alertCount).toBe(lowStockAfter.length);
    });
  });

  test.describe('Stock Threshold Boundary Cases', () => {
    test('should adjust stock to exactly the threshold', async ({
      inventoryPage,
      page,
    }) => {
      const firstId = await inventoryPage.getFirstProductId();
      const productBefore = await getProductFromStorage(page, firstId);
      expect(productBefore).toBeTruthy();

      const threshold = productBefore!.lowStockThreshold;
      const adjustment = threshold - productBefore!.stock;

      // Adjust to exact threshold
      await inventoryPage.adjustStock(firstId, adjustment);

      // Verify localStorage (source of truth)
      const productAfter = await getProductFromStorage(page, firstId);
      expect(productAfter!.stock).toBe(threshold);

      // Verify UI reflects localStorage value
      const stockInUI = await inventoryPage.getStockFromUI(firstId);
      expect(stockInUI).toBe(threshold.toString());

      // Status should be "Low Stock" (stock <= threshold)
      const status = await inventoryPage.getStatusFromUI(firstId);
      expect(status).toBe('Low Stock');
    });

    test('should show Low Stock badge when stock decreases below threshold', async ({
      inventoryPage,
      page,
    }) => {
      // Find a product with good stock
      const allProducts = await getProductsFromLocalStorage(page);
      const goodStockProduct = allProducts.find(
        (p) => p.stock > p.lowStockThreshold * 2
      );
      expect(goodStockProduct).toBeTruthy();

      const productId = goodStockProduct!.id;
      const threshold = goodStockProduct!.lowStockThreshold;

      // Verify initially has "In Stock" status
      const statusBefore = await inventoryPage.getStatusFromUI(productId);
      expect(statusBefore).toBe('In Stock');

      // Badge should not be visible initially
      const hasBadgeBefore = await inventoryPage.hasLowStockBadge(productId);
      expect(hasBadgeBefore).toBe(false);

      // Decrease stock below threshold
      const adjustment = -(goodStockProduct!.stock - threshold + 1);
      await inventoryPage.adjustStock(productId, adjustment);

      // Verify localStorage (source of truth)
      const productAfter = await getProductFromStorage(page, productId);
      expect(productAfter!.stock).toBeLessThanOrEqual(threshold);

      // Verify UI reflects localStorage
      const stockInUI = await inventoryPage.getStockFromUI(productId);
      expect(stockInUI).toBe(productAfter!.stock.toString());

      // Status should change to "Low Stock"
      const statusAfter = await inventoryPage.getStatusFromUI(productId);
      expect(statusAfter).toBe('Low Stock');

      // Badge should now be visible
      const hasBadgeAfter = await inventoryPage.hasLowStockBadge(productId);
      expect(hasBadgeAfter).toBe(true);
    });

    test('should remove Low Stock badge when stock increases above threshold', async ({
      inventoryPage,
      page,
    }) => {
      // Get a low stock product
      const lowStockProducts = await getExpectedLowStockProducts(page);
      expect(lowStockProducts.length).toBeGreaterThan(0);

      const lowStockProduct = lowStockProducts[0];
      const productId = lowStockProduct.id;
      const threshold = lowStockProduct.lowStockThreshold;

      // Verify initially has "Low Stock" status
      const statusBefore = await inventoryPage.getStatusFromUI(productId);
      expect(statusBefore).toBe('Low Stock');

      // Badge should be visible initially
      const hasBadgeBefore = await inventoryPage.hasLowStockBadge(productId);
      expect(hasBadgeBefore).toBe(true);

      // Increase stock above threshold (to "In Stock" range)
      const adjustment = threshold * 2 - lowStockProduct.stock + 5;
      await inventoryPage.adjustStock(productId, adjustment);

      // Verify localStorage (source of truth)
      const productAfter = await getProductFromStorage(page, productId);
      expect(productAfter!.stock).toBeGreaterThan(threshold * 2);

      // Verify UI reflects localStorage
      const stockInUI = await inventoryPage.getStockFromUI(productId);
      expect(stockInUI).toBe(productAfter!.stock.toString());

      // Status should change to "In Stock"
      const statusAfter = await inventoryPage.getStatusFromUI(productId);
      expect(statusAfter).toBe('In Stock');

      // Badge should no longer be visible
      const hasBadgeAfter = await inventoryPage.hasLowStockBadge(productId);
      expect(hasBadgeAfter).toBe(false);
    });

    test('should show Medium status for stock between threshold and 2x threshold', async ({
      inventoryPage,
      page,
    }) => {
      const firstId = await inventoryPage.getFirstProductId();
      const productBefore = await getProductFromStorage(page, firstId);
      expect(productBefore).toBeTruthy();

      const threshold = productBefore!.lowStockThreshold;
      // Set stock to threshold * 1.5 (middle of Medium range)
      const targetStock = Math.floor(threshold * 1.5);
      const adjustment = targetStock - productBefore!.stock;

      // Adjust to medium range
      await inventoryPage.adjustStock(firstId, adjustment);

      // Verify localStorage (source of truth)
      const productAfter = await getProductFromStorage(page, firstId);
      expect(productAfter!.stock).toBe(targetStock);
      expect(productAfter!.stock).toBeGreaterThan(threshold);
      expect(productAfter!.stock).toBeLessThanOrEqual(threshold * 2);

      // Verify UI reflects localStorage
      const stockInUI = await inventoryPage.getStockFromUI(firstId);
      expect(stockInUI).toBe(productAfter!.stock.toString());

      // Status should be "Medium"
      const status = await inventoryPage.getStatusFromUI(firstId);
      expect(status).toBe('Medium');
    });
  });
});
