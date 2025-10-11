/**
 * Storage Test Helpers
 *
 * Centralized helper functions for reading and manipulating localStorage data.
 * This is the single source of truth for all localStorage operations in tests.
 *
 * ## Design Pattern: Single Source of Truth
 *
 * All other helpers (dashboard, products, inventory) should import from this file
 * instead of duplicating localStorage reading logic.
 */

import { Page } from '@playwright/test';
import { Product } from '@/types/product.types';

/**
 * Storage key used by the application (from app/lib/products.ts)
 *
 * This constant is the single source of truth for the storage key.
 */
export const STORAGE_KEY = 'qa_challenge_products';

/**
 * Reads products from localStorage in the browser context
 *
 * This is the ONLY function that should directly read from localStorage.
 * All other helpers should use this function.
 *
 * @param page - Playwright Page object
 * @returns Array of products from localStorage
 *
 * @example
 * ```typescript
 * const products = await getProductsFromLocalStorage(page);
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
 * Gets a specific product by ID from the products array
 *
 * @param products - Array of products
 * @param productId - The ID of the product to find
 * @returns The product or undefined if not found
 *
 * @example
 * ```typescript
 * const products = await getProductsFromLocalStorage(page);
 * const product = getProductById(products, 'product-123');
 * ```
 */
export function getProductById(
  products: Product[],
  productId: string
): Product | undefined {
  return products.find((p) => p.id === productId);
}

/**
 * Gets a product from localStorage by ID
 *
 * Convenience function for reading and finding a specific product
 *
 * @param page - Playwright Page object
 * @param productId - The ID of the product
 * @returns The product or undefined if not found
 *
 * @example
 * ```typescript
 * const product = await getProductFromStorage(page, 'product-123');
 * expect(product?.stock).toBe(50);
 * ```
 */
export async function getProductFromStorage(
  page: Page,
  productId: string
): Promise<Product | undefined> {
  const products = await getProductsFromLocalStorage(page);
  return getProductById(products, productId);
}

/**
 * Filters products that are at or below their low stock threshold
 *
 * Replicates the application's logic:
 * lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold)
 *
 * @param products - Array of products
 * @returns Products with low stock
 *
 * @example
 * ```typescript
 * const products = await getProductsFromLocalStorage(page);
 * const lowStock = getLowStockProducts(products);
 * ```
 */
export function getLowStockProducts(products: Product[]): Product[] {
  return products.filter((p) => p.stock <= p.lowStockThreshold);
}

/**
 * Gets expected low stock products from current localStorage state
 *
 * Convenience function that combines reading from localStorage and filtering
 *
 * @param page - Playwright Page object
 * @returns Low stock products from localStorage
 *
 * @example
 * ```typescript
 * const expected = await getExpectedLowStockProducts(page);
 * expect(actualCount).toBe(expected.length);
 * ```
 */
export async function getExpectedLowStockProducts(
  page: Page
): Promise<Product[]> {
  const products = await getProductsFromLocalStorage(page);
  return getLowStockProducts(products);
}
