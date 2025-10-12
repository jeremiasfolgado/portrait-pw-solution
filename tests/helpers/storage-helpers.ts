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
 *
 * ## Data-Driven Testing Support
 *
 * This file also provides `ensureProductsExist()` for bulk creating test data
 * products directly in localStorage, enabling fast and maintainable data-driven tests.
 */

import { Page } from '@playwright/test';
import { Product, type TestProductData } from '@/types/product.types';

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

/**
 * Clears all products from localStorage
 *
 * Useful for resetting test state before loading test data
 *
 * @param page - Playwright Page object
 *
 * @example
 * ```typescript
 * await clearAllProducts(page);
 * ```
 */
export async function clearAllProducts(page: Page): Promise<void> {
  await page.evaluate((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify([]));
  }, STORAGE_KEY);
}

/**
 * Ensures products exist in localStorage by adding only those that don't exist
 *
 * Validates existing products by SKU to avoid duplicates. This is much faster
 * than creating products one by one through the UI.
 *
 * Automatically adds createdAt and updatedAt timestamps if not provided.
 *
 * @param page - Playwright Page object
 * @param products - Array of product data to ensure exist
 * @returns Array of IDs for products that were added (not existing ones)
 *
 * @example
 * ```typescript
 * import testData from '@/data/products-test-data.json';
 *
 * // Ensure specific products exist
 * await ensureProductsExist(page, testData.filteringTests as TestProductData[]);
 *
 * // Combine multiple datasets
 * const products = [...testData.sortingTests, ...testData.searchTests];
 * await ensureProductsExist(page, products as TestProductData[]);
 * ```
 */
export async function ensureProductsExist(
  page: Page,
  products: TestProductData[]
): Promise<string[]> {
  const addedIds = await page.evaluate(
    ({ productsToEnsure, storageKey }) => {
      // Get existing products or initialize empty array
      const existingProducts = JSON.parse(
        localStorage.getItem(storageKey) || '[]'
      );

      // Create a Set of existing SKUs for fast lookup
      const existingSKUs = new Set(
        existingProducts.map((p: { sku: string }) => p.sku)
      );

      // Filter out products that already exist
      const productsToAdd = productsToEnsure.filter(
        (product) => !existingSKUs.has(product.sku)
      );

      // Generate new products with IDs and timestamps
      // Using same ID format as the app: Date.now().toString()
      const newProductsWithIds: string[] = [];
      const now = new Date().toISOString();
      let timestamp = Date.now();

      const newProducts = productsToAdd.map((product) => {
        const id = (timestamp++).toString(); // Increment to avoid duplicate IDs
        newProductsWithIds.push(id);
        return {
          ...product,
          id,
          createdAt: now,
          updatedAt: now,
        };
      });

      // Merge with existing products
      const allProducts = [...existingProducts, ...newProducts];

      // Save back to localStorage using correct key
      localStorage.setItem(storageKey, JSON.stringify(allProducts));

      return newProductsWithIds;
    },
    { productsToEnsure: products, storageKey: STORAGE_KEY }
  );

  return addedIds;
}
