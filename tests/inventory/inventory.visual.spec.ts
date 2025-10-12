/**
 * Visual Regression Test Suite - Inventory Page
 *
 * These tests capture and compare screenshots of the inventory page
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
  inventoryFixture as test,
  expect,
} from '@/fixtures/inventory/inventory.fixture';

test.describe('Visual Regression - Inventory Page', () => {
  test('should match inventory page initial state', async ({
    inventoryPage,
    page,
  }) => {
    // Ensure page is fully loaded
    await expect(inventoryPage.inventoryTitle).toBeVisible();
    await expect(inventoryPage.inventoryTable).toBeVisible();

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('inventory-initial-state.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match stock adjustment modal opened', async ({
    inventoryPage,
    page,
  }) => {
    // Ensure page is loaded
    await expect(inventoryPage.inventoryTable).toBeVisible();

    // Get first product row and open modal
    const firstProductId = await inventoryPage.getFirstProductId();
    await inventoryPage.clickAdjustStock(firstProductId);

    // Wait for modal to be visible
    await expect(inventoryPage.adjustStockModal).toBeVisible();
    await expect(inventoryPage.adjustmentInput).toBeVisible();

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('inventory-modal-opened.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
