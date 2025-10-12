import { Page, Locator, expect } from '@playwright/test';
import { NavbarPage } from './navbar.page';

/**
 * Stock status type matching application logic
 */
export type StockStatus = 'Low Stock' | 'Medium' | 'In Stock';

/**
 * Page Object Model for the Inventory Management Page
 *
 * This class encapsulates all interactions with the Inventory page:
 * - Inventory table and product rows
 * - Stock status indicators
 * - Low stock alerts
 * - Stock adjustment modal
 * - Increase/decrease stock operations
 *
 * ## Design Pattern: Composition
 *
 * Uses NavbarPage component for shared navigation functionality.
 *
 * @example
 * ```typescript
 * const inventoryPage = new InventoryPage(page);
 * await inventoryPage.goto();
 *
 * // Adjust stock
 * await inventoryPage.adjustStock('product-id', 10); // Increase by 10
 * await inventoryPage.adjustStock('product-id', -5); // Decrease by 5
 *
 * // Check low stock alert
 * const hasAlert = await inventoryPage.isLowStockAlertVisible();
 * ```
 */
export class InventoryPage {
  readonly page: Page;

  // Navigation component (shared across all authenticated pages)
  readonly navbar: NavbarPage;

  // Page elements
  readonly inventoryTitle: Locator;
  readonly inventoryTable: Locator;
  readonly lowStockAlert: Locator;

  // Adjust Stock Modal
  readonly adjustStockModal: Locator;
  readonly adjustmentInput: Locator;
  readonly adjustmentError: Locator;
  readonly confirmAdjustButton: Locator;
  readonly cancelAdjustButton: Locator;

  /**
   * Creates a new InventoryPage instance
   *
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;

    // Initialize navbar component
    this.navbar = new NavbarPage(page);

    // Page elements
    this.inventoryTitle = page.getByTestId('inventory-title');
    this.inventoryTable = page.getByTestId('inventory-table');
    this.lowStockAlert = page.getByTestId('low-stock-alert');

    // Adjust Stock Modal
    this.adjustStockModal = page.getByTestId('adjust-stock-modal');
    this.adjustmentInput = page.getByTestId('adjustment-input');
    this.adjustmentError = page.getByTestId('adjustment-error');
    this.confirmAdjustButton = page.getByTestId('confirm-adjust-button');
    this.cancelAdjustButton = page.getByTestId('cancel-adjust-button');
  }

  // === Navigation Methods ===

  /**
   * Navigates directly to the inventory page
   *
   * @example
   * ```typescript
   * await inventoryPage.goto();
   * ```
   */
  async goto() {
    await this.page.goto('/inventory');
  }

  // === Inventory Table Methods ===

  /**
   * Gets an inventory row locator by product ID
   *
   * @param productId - The ID of the product
   * @returns Locator for the inventory row
   *
   * @example
   * ```typescript
   * const row = inventoryPage.getInventoryRow('product-123');
   * await expect(row).toBeVisible();
   * ```
   */
  getInventoryRow(productId: string): Locator {
    return this.page.getByTestId(`inventory-row-${productId}`);
  }

  /**
   * Gets the adjust stock button for a specific product
   *
   * @param productId - The ID of the product
   * @returns Locator for the adjust stock button
   *
   * @example
   * ```typescript
   * await inventoryPage.getAdjustStockButton('product-123').click();
   * ```
   */
  getAdjustStockButton(productId: string): Locator {
    return this.page.getByTestId(`adjust-stock-${productId}`);
  }

  /**
   * Gets the low stock badge for a specific product
   *
   * @param productId - The ID of the product
   * @returns Locator for the low stock badge
   *
   * @example
   * ```typescript
   * const badge = inventoryPage.getLowStockBadge('product-123');
   * await expect(badge).toBeVisible();
   * ```
   */
  getLowStockBadge(productId: string): Locator {
    return this.page.getByTestId(`low-stock-badge-${productId}`);
  }

  /**
   * Gets the count of visible inventory rows
   *
   * @returns Number of visible products in inventory
   *
   * @example
   * ```typescript
   * const count = await inventoryPage.getInventoryCount();
   * expect(count).toBeGreaterThan(0);
   * ```
   */
  async getInventoryCount(): Promise<number> {
    const rows = await this.page
      .locator('[data-testid^="inventory-row-"]')
      .count();
    return rows;
  }

  /**
   * Gets the first visible inventory row
   *
   * @returns Locator for the first inventory row
   *
   * @example
   * ```typescript
   * const firstRow = inventoryPage.getFirstInventoryRow();
   * await expect(firstRow).toBeVisible();
   * ```
   */
  getFirstInventoryRow(): Locator {
    return this.page.locator('[data-testid^="inventory-row-"]').first();
  }

  /**
   * Gets the product ID from an inventory row
   *
   * Extracts the ID from the data-testid attribute (format: "inventory-row-{id}")
   *
   * @param row - The inventory row locator
   * @returns The product ID
   *
   * @example
   * ```typescript
   * const firstRow = inventoryPage.getFirstInventoryRow();
   * const id = await inventoryPage.getProductIdFromRow(firstRow);
   * ```
   */
  async getProductIdFromRow(row: Locator): Promise<string> {
    await expect(row).toBeVisible();
    await expect(row).toHaveAttribute('data-testid', /^inventory-row-/);

    const rowId = await row.getAttribute('data-testid');
    return rowId!.replace('inventory-row-', '');
  }

  /**
   * Gets the ID of the first visible product in inventory
   *
   * Convenience method that combines getFirstInventoryRow and getProductIdFromRow
   *
   * @returns The ID of the first visible product
   *
   * @example
   * ```typescript
   * const firstId = await inventoryPage.getFirstProductId();
   * await inventoryPage.clickAdjustStock(firstId);
   * ```
   */
  async getFirstProductId(): Promise<string> {
    const firstRow = this.getFirstInventoryRow();
    return await this.getProductIdFromRow(firstRow);
  }

  // === Low Stock Alert Methods ===

  /**
   * Checks if the low stock alert is visible
   *
   * @returns True if alert is visible, false otherwise
   *
   * @example
   * ```typescript
   * const hasAlert = await inventoryPage.isLowStockAlertVisible();
   * expect(hasAlert).toBe(true);
   * ```
   */
  async isLowStockAlertVisible(): Promise<boolean> {
    return await this.lowStockAlert.isVisible().catch(() => false);
  }

  /**
   * Gets the text from the low stock alert
   *
   * @returns Alert text or empty string if not visible
   *
   * @example
   * ```typescript
   * const alertText = await inventoryPage.getLowStockAlertText();
   * expect(alertText).toContain('products are running low');
   * ```
   */
  async getLowStockAlertText(): Promise<string> {
    if (await this.isLowStockAlertVisible()) {
      return (await this.lowStockAlert.textContent()) || '';
    }
    return '';
  }

  /**
   * Gets the count of low stock products from the alert message
   *
   * Extracts the number from text like "5 products are running low on stock"
   *
   * @returns Number of low stock products
   *
   * @example
   * ```typescript
   * const count = await inventoryPage.getLowStockCount();
   * expect(count).toBe(3);
   * ```
   */
  async getLowStockCount(): Promise<number> {
    const alertText = await this.getLowStockAlertText();
    const match = alertText.match(/(\d+)\s+products/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Checks if a product has a low stock badge
   *
   * @param productId - The ID of the product
   * @returns True if low stock badge is visible
   *
   * @example
   * ```typescript
   * const isLowStock = await inventoryPage.hasLowStockBadge('product-123');
   * expect(isLowStock).toBe(true);
   * ```
   */
  async hasLowStockBadge(productId: string): Promise<boolean> {
    const badge = this.getLowStockBadge(productId);
    return await badge.isVisible().catch(() => false);
  }

  // === UI Data Reading Methods ===

  /**
   * Gets the current stock value displayed in the UI for a specific product
   *
   * Reads the stock value from the "Current Stock" column (column index 2)
   *
   * @param productId - The ID of the product
   * @returns The stock value as displayed in the UI
   *
   * @example
   * ```typescript
   * const stock = await inventoryPage.getStockFromUI('product-123');
   * expect(stock).toBe('50');
   * ```
   */
  async getStockFromUI(productId: string): Promise<string> {
    const row = this.getInventoryRow(productId);
    await expect(row).toBeVisible();

    const cells = row.locator('td');
    const stock = await cells.nth(2).textContent(); // Current Stock column
    return stock?.trim() || '';
  }

  /**
   * Gets the status displayed in the UI for a specific product
   *
   * Reads the status from the "Status" column (column index 3)
   * Possible values: "Low Stock", "Medium", "In Stock"
   *
   * @param productId - The ID of the product
   * @returns The status as displayed in the UI
   *
   * @example
   * ```typescript
   * const status = await inventoryPage.getStatusFromUI('product-123');
   * expect(status).toBe('Low Stock');
   * ```
   */
  async getStatusFromUI(productId: string): Promise<string> {
    const row = this.getInventoryRow(productId);
    await expect(row).toBeVisible();

    const cells = row.locator('td');
    const status = await cells.nth(3).textContent(); // Status column
    return status?.trim() || '';
  }

  // === Stock Adjustment Methods ===

  /**
   * Clicks the adjust stock button for a specific product (opens modal)
   *
   * @param productId - The ID of the product
   *
   * @example
   * ```typescript
   * await inventoryPage.clickAdjustStock('product-123');
   * await expect(inventoryPage.adjustStockModal).toBeVisible();
   * ```
   */
  async clickAdjustStock(productId: string) {
    await this.getAdjustStockButton(productId).click();
    await this.adjustStockModal.waitFor({ state: 'visible' });
  }

  /**
   * Fills the adjustment input with a value
   *
   * Note: Uses focus() before fill() for cross-browser compatibility
   *
   * @param adjustment - The adjustment value (positive for increase, negative for decrease)
   *
   * @example
   * ```typescript
   * await inventoryPage.fillAdjustment(10); // Increase by 10
   * await inventoryPage.fillAdjustment(-5); // Decrease by 5
   * ```
   */
  async fillAdjustment(adjustment: number) {
    await this.adjustmentInput.focus();
    await this.adjustmentInput.fill(adjustment.toString());
  }

  /**
   * Confirms the stock adjustment
   *
   * @example
   * ```typescript
   * await inventoryPage.fillAdjustment(10);
   * await inventoryPage.confirmAdjustment();
   * ```
   */
  async confirmAdjustment() {
    await this.confirmAdjustButton.click();
    await this.adjustStockModal.waitFor({ state: 'hidden' });
  }

  /**
   * Cancels the stock adjustment
   *
   * @example
   * ```typescript
   * await inventoryPage.fillAdjustment(10);
   * await inventoryPage.cancelAdjustment();
   * ```
   */
  async cancelAdjustment() {
    await this.cancelAdjustButton.click();
    await this.adjustStockModal.waitFor({ state: 'hidden' });
  }

  /**
   * Adjusts stock for a product (complete flow: open modal, fill, confirm)
   *
   * High-level convenience method that combines multiple steps.
   *
   * @param productId - The ID of the product
   * @param adjustment - The adjustment value (positive/negative)
   *
   * @example
   * ```typescript
   * await inventoryPage.adjustStock('product-123', 10); // Increase by 10
   * await inventoryPage.adjustStock('product-123', -5); // Decrease by 5
   * ```
   */
  async adjustStock(productId: string, adjustment: number) {
    await this.clickAdjustStock(productId);
    await this.fillAdjustment(adjustment);
    await this.confirmAdjustment();
  }

  // === Validation Methods ===

  /**
   * Gets the adjustment error message
   *
   * @returns Error message text or empty string if no error
   *
   * @example
   * ```typescript
   * const error = await inventoryPage.getAdjustmentError();
   * expect(error).toBe('Stock cannot be negative');
   * ```
   */
  async getAdjustmentError(): Promise<string> {
    if (await this.adjustmentError.isVisible().catch(() => false)) {
      return (await this.adjustmentError.textContent()) || '';
    }
    return '';
  }

  /**
   * Checks if an adjustment error is displayed
   *
   * @returns True if error is visible
   *
   * @example
   * ```typescript
   * const hasError = await inventoryPage.hasAdjustmentError();
   * expect(hasError).toBe(true);
   * ```
   */
  async hasAdjustmentError(): Promise<boolean> {
    return await this.adjustmentError.isVisible().catch(() => false);
  }
}
