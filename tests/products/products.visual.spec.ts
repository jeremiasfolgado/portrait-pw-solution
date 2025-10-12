/**
 * Visual Regression Test Suite - Products Listing Page
 *
 * These tests capture and compare screenshots of the products listing page
 * to detect unintended visual changes.
 *
 * Coverage: 5 tests × 3 browsers = 15 snapshots
 *
 * IMPORTANT: Snapshots must be generated on Ubuntu (Linux) to match CI environment.
 * Use Docker to update snapshots:
 *   npm run docker:update-snapshots
 *
 * @requires Docker (for snapshot generation)
 */

import {
  productsFixture as test,
  expect,
} from '@/fixtures/products/products.fixture';

test.describe('Visual Regression - Products Listing Page', () => {
  test('should match products page initial state', async ({
    productsPage,
    page,
  }) => {
    // Ensure page is fully loaded
    await expect(productsPage.productsTitle).toBeVisible();
    await expect(productsPage.productsTable).toBeVisible();
    await expect(productsPage.addProductButton).toBeVisible();

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('products-initial-state.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match products page with search results', async ({
    productsPage,
    page,
  }) => {
    // Ensure page is loaded
    await expect(productsPage.productsTable).toBeVisible();

    // Perform search
    await productsPage.searchProducts('Laptop');

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('products-search-results.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match products page with category filter', async ({
    productsPage,
    page,
  }) => {
    // Ensure page is loaded
    await expect(productsPage.productsTable).toBeVisible();

    // Apply category filter
    await productsPage.filterByCategory('Electronics');

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('products-category-filter.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match products page sorted by price', async ({
    productsPage,
    page,
  }) => {
    // Ensure page is loaded
    await expect(productsPage.productsTable).toBeVisible();

    // Sort by price
    await productsPage.sortBy('price');

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('products-sorted-by-price.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match delete confirmation modal', async ({
    productsPage,
    page,
  }) => {
    // Ensure page is loaded
    await expect(productsPage.productsTable).toBeVisible();

    // Get first product and open delete modal
    const firstProductId = await productsPage.getFirstProductId();
    await productsPage.clickDeleteProduct(firstProductId);

    // Wait for modal to be visible
    await expect(productsPage.deleteModal).toBeVisible();

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('products-delete-modal.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
