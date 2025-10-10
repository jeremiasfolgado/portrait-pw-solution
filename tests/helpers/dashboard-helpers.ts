/**
 * Dashboard Test Helpers
 *
 * Helper functions to calculate expected dashboard stats based on products.
 * Reads products from localStorage to avoid hardcoding and duplication.
 */

import { Page } from '@playwright/test';

/**
 * Product interface matching the application's Product type
 */
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: 'Electronics' | 'Accessories' | 'Software' | 'Hardware';
  lowStockThreshold: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Storage key used by the application (from app/lib/products.ts)
 */
const STORAGE_KEY = 'qa_challenge_products';

/**
 * Reads products from localStorage in the browser context
 *
 * This reads the actual products state from the application's localStorage,
 * avoiding duplication and ensuring tests validate real application data.
 *
 * @param page - Playwright Page object
 * @returns Array of products from localStorage
 *
 * @example
 * ```typescript
 * const products = await getProductsFromLocalStorage(page);
 * const expectedStats = calculateExpectedStats(products);
 * ```
 */
export async function getProductsFromLocalStorage(
  page: Page
): Promise<Product[]> {
  const productsJson = await page.evaluate((storageKey) => {
    return localStorage.getItem(storageKey);
  }, STORAGE_KEY);

  if (!productsJson) {
    throw new Error(
      `No products found in localStorage with key: ${STORAGE_KEY}`
    );
  }

  return JSON.parse(productsJson);
}

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

  const lowStockItems = products.filter(
    (p) => p.stock <= p.lowStockThreshold
  ).length;

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
