/**
 * Products Test Helpers
 *
 * Helper functions to read and filter products from localStorage,
 * replicating the application's filtering logic for robust test validations.
 */

import { Page } from '@playwright/test';
import { Product, ProductFilterOptions } from '@/types/product.types';

/**
 * Storage key used by the application
 */
const STORAGE_KEY = 'qa_challenge_products';

/**
 * Reads products from localStorage in the browser context
 *
 * @param page - Playwright Page object
 * @returns Array of products from localStorage
 *
 * @example
 * ```typescript
 * const products = await getProductsFromLocalStorage(page);
 * const filtered = filterProductsByCategory(products, 'Electronics');
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
 * Filters products by search term (name or SKU)
 *
 * Replicates the application's search logic from app/products/page.tsx
 *
 * @param products - Array of products
 * @param searchTerm - Term to search for
 * @returns Filtered products
 *
 * @example
 * ```typescript
 * const products = await getProductsFromLocalStorage(page);
 * const laptops = filterProductsBySearch(products, 'Laptop');
 * ```
 */
export function filterProductsBySearch(
  products: Product[],
  searchTerm: string
): Product[] {
  if (searchTerm === '') return products;

  const lowerSearch = searchTerm.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerSearch) ||
      p.sku.toLowerCase().includes(lowerSearch)
  );
}

/**
 * Filters products by category
 *
 * Replicates the application's category filter logic
 *
 * @param products - Array of products
 * @param category - Category to filter by ('all' or specific category)
 * @returns Filtered products
 *
 * @example
 * ```typescript
 * const products = await getProductsFromLocalStorage(page);
 * const electronics = filterProductsByCategory(products, 'Electronics');
 * ```
 */
export function filterProductsByCategory(
  products: Product[],
  category: string
): Product[] {
  if (category === 'all') return products;

  return products.filter((p) => p.category === category);
}

/**
 * Sorts products by the specified field
 *
 * Replicates the application's sort logic
 *
 * @param products - Array of products
 * @param sortBy - Field to sort by ('name', 'price', 'stock')
 * @returns Sorted products (new array)
 *
 * @example
 * ```typescript
 * const products = await getProductsFromLocalStorage(page);
 * const sorted = sortProducts(products, 'price');
 * ```
 */
export function sortProducts(
  products: Product[],
  sortBy: 'name' | 'price' | 'stock'
): Product[] {
  const sorted = [...products]; // Create a copy

  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return a.price - b.price;
      case 'stock':
        return a.stock - b.stock;
      default:
        return 0;
    }
  });

  return sorted;
}

/**
 * Applies multiple filters and sorting to products
 *
 * Combines search, category filter, and sorting in one operation
 *
 * @param products - Array of products
 * @param options - Filter and sort options
 * @returns Filtered and sorted products
 *
 * @example
 * ```typescript
 * const products = await getProductsFromLocalStorage(page);
 * const filtered = applyFilters(products, {
 *   searchTerm: 'Laptop',
 *   category: 'Electronics',
 *   sortBy: 'price'
 * });
 * ```
 */
export function applyFilters(
  products: Product[],
  options: ProductFilterOptions
): Product[] {
  let result = products;

  // Apply search filter
  if (options.searchTerm) {
    result = filterProductsBySearch(result, options.searchTerm);
  }

  // Apply category filter
  if (options.category) {
    result = filterProductsByCategory(result, options.category);
  }

  // Apply sorting
  if (options.sortBy) {
    result = sortProducts(result, options.sortBy);
  }

  return result;
}

/**
 * Gets expected filtered products from localStorage
 *
 * Convenience function that reads from localStorage and applies filters
 *
 * @param page - Playwright Page object
 * @param options - Filter and sort options
 * @returns Filtered and sorted products
 *
 * @example
 * ```typescript
 * const expected = await getExpectedFilteredProducts(page, {
 *   searchTerm: 'Laptop',
 *   category: 'Electronics',
 *   sortBy: 'price'
 * });
 * expect(actualCount).toBe(expected.length);
 * ```
 */
export async function getExpectedFilteredProducts(
  page: Page,
  options: ProductFilterOptions
): Promise<Product[]> {
  const products = await getProductsFromLocalStorage(page);
  return applyFilters(products, options);
}
