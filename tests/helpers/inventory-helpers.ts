/**
 * Inventory Test Helpers
 *
 * Helper functions to calculate expected inventory states and validate
 * stock adjustments. Uses centralized storage-helpers for localStorage operations.
 */

import {
  getProductsFromLocalStorage,
  getProductById,
  getProductFromStorage,
  getLowStockProducts,
  getExpectedLowStockProducts,
} from './storage-helpers';

// Re-export commonly used functions for convenience
export {
  getProductsFromLocalStorage,
  getProductById,
  getProductFromStorage,
  getLowStockProducts,
  getExpectedLowStockProducts,
};

/**
 * Calculates the expected stock after an adjustment
 *
 * @param currentStock - Current stock value
 * @param adjustment - Adjustment value (positive or negative)
 * @returns Expected stock after adjustment
 *
 * @example
 * ```typescript
 * const newStock = calculateExpectedStock(50, 10); // 60
 * const newStock = calculateExpectedStock(50, -5); // 45
 * ```
 */
export function calculateExpectedStock(
  currentStock: number,
  adjustment: number
): number {
  return currentStock + adjustment;
}

/**
 * Validates if a stock adjustment would be valid (not negative)
 *
 * Replicates validation logic from app/inventory/page.tsx:
 * if (product.stock + adjustment < 0) { error }
 *
 * @param currentStock - Current stock value
 * @param adjustment - Adjustment value
 * @returns True if adjustment is valid, false if would result in negative stock
 *
 * @example
 * ```typescript
 * const isValid = isValidAdjustment(10, -5); // true (10 - 5 = 5)
 * const isValid = isValidAdjustment(10, -15); // false (10 - 15 = -5)
 * ```
 */
export function isValidAdjustment(
  currentStock: number,
  adjustment: number
): boolean {
  return currentStock + adjustment >= 0;
}
