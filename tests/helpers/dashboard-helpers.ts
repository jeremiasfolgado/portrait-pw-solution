/**
 * Dashboard Test Helpers
 *
 * Helper functions to calculate expected dashboard stats based on products.
 * Uses centralized storage-helpers for localStorage operations.
 */

import { Page } from '@playwright/test';
import { Product } from '@/types/product.types';
import {
  getProductsFromLocalStorage,
  getLowStockProducts,
} from './storage-helpers';

// Re-export for convenience
export { getProductsFromLocalStorage };

/**
 * Calculates expected dashboard stats based on a product list
 *
 * Replicates the exact logic from app/dashboard/page.tsx:
 * - Total Products: products.length
 * - Low Stock Items: products.filter(p => p.stock <= p.lowStockThreshold).length
 * - Total Value: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
 *
 * @param products - Array of products to calculate stats from
 * @returns Object containing expected stats
 *
 * @example
 * ```typescript
 * const products = await getProductsFromLocalStorage(page);
 * const expectedStats = calculateExpectedStats(products);
 * expect(actualStats.totalProducts).toBe(expectedStats.totalProducts);
 * ```
 */
export function calculateExpectedStats(products: Product[]) {
  const totalProducts = products.length;

  // Use centralized low stock calculation
  const lowStockItems = getLowStockProducts(products).length;

  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  return {
    totalProducts,
    lowStockItems,
    totalValue,
  };
}

/**
 * Gets expected dashboard stats from current localStorage state
 *
 * Convenience function that combines reading from localStorage and calculating stats.
 * This ensures tests validate against the actual application state.
 *
 * @param page - Playwright Page object
 * @returns Expected stats calculated from localStorage products
 *
 * @example
 * ```typescript
 * const expected = await getExpectedStatsFromStorage(page);
 * expect(actualTotalProducts).toBe(expected.totalProducts);
 * expect(actualLowStock).toBe(expected.lowStockItems);
 * expect(actualTotalValue).toBeCloseTo(expected.totalValue, 2);
 * ```
 */
export async function getExpectedStatsFromStorage(page: Page) {
  const products = await getProductsFromLocalStorage(page);
  return calculateExpectedStats(products);
}
