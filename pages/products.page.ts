import { Page, Locator, expect } from '@playwright/test';
import { NavbarPage } from './navbar.page';

/**
 * Page Object Model for the Products List Page
 *
 * This class encapsulates interactions with the products listing page:
 * - Product listing and table
 * - Search, filter, and sort functionality
 * - Navigation to product forms
 * - Deleting products with confirmation modal
 *
 * ## Design Pattern: Composition
 *
 * Uses NavbarPage component for shared navigation functionality.
 *
 * ## Note
 *
 * Product form interactions (create/edit) are handled by ProductFormPage.
 * This keeps responsibilities separated and tests organized.
 *
 * @example
 * ```typescript
 * const productsPage = new ProductsPage(page);
 * await productsPage.goto();
 *
 * // Search products
 * await productsPage.searchProducts('Laptop');
 *
 * // Filter by category
 * await productsPage.filterByCategory('Electronics');
 *
 * // Delete a product
 * await productsPage.deleteProduct('product-id');
 * ```
 */
export class ProductsPage {
  readonly page: Page;

  // Navigation component (shared across all authenticated pages)
  readonly navbar: NavbarPage;

  // Header
  readonly productsTitle: Locator;
  readonly addProductButton: Locator;

  // Filters and Search
  readonly searchInput: Locator;
  readonly categoryFilter: Locator;
  readonly sortSelect: Locator;

  // Products Table
  readonly productsTable: Locator;
  readonly noProductsMessage: Locator;

  // Delete Modal
  readonly deleteModal: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator;

  /**
   * Creates a new ProductsPage instance
   *
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;

    // Initialize navbar component
    this.navbar = new NavbarPage(page);

    // Header
    this.productsTitle = page.getByTestId('products-title');
    this.addProductButton = page.getByTestId('add-product-button');

    // Filters
    this.searchInput = page.getByTestId('search-input');
    this.categoryFilter = page.getByTestId('category-filter');
    this.sortSelect = page.getByTestId('sort-select');

    // Table
    this.productsTable = page.getByTestId('products-table');
    this.noProductsMessage = page.getByTestId('no-products-message');

    // Delete Modal
    this.deleteModal = page.getByTestId('delete-modal');
    this.confirmDeleteButton = page.getByTestId('confirm-delete-button');
    this.cancelDeleteButton = page.getByTestId('cancel-delete-button');
  }

  // === Navigation Methods ===

  /**
   * Navigates directly to the products list page
   *
   * @example
   * ```typescript
   * await productsPage.goto();
   * ```
   */
  async goto() {
    await this.page.goto('/products');
  }

  /**
   * Clicks the "Add Product" button to navigate to the new product form
   *
   * @example
   * ```typescript
   * await productsPage.clickAddProduct();
   * await expect(page).toHaveURL('/products/new');
   * ```
   */
  async clickAddProduct() {
    await this.addProductButton.click();
    await this.page.waitForURL('/products/new');
  }

  // === Search, Filter, and Sort Methods ===

  /**
   * Searches for products by name or SKU
   *
   * Note: Uses focus() before fill() for cross-browser compatibility
   *
   * @param searchTerm - The term to search for
   *
   * @example
   * ```typescript
   * await productsPage.searchProducts('Laptop');
   * ```
   */
  async searchProducts(searchTerm: string) {
    await this.searchInput.focus();
    await this.searchInput.fill(searchTerm);
  }

  /**
   * Filters products by category
   *
   * Note: Uses focus() before selectOption() for cross-browser compatibility
   *
   * @param category - Category to filter by ('all', 'Electronics', 'Accessories', 'Software', 'Hardware')
   *
   * @example
   * ```typescript
   * await productsPage.filterByCategory('Electronics');
   * ```
   */
  async filterByCategory(
    category: 'all' | 'Electronics' | 'Accessories' | 'Software' | 'Hardware'
  ) {
    await this.categoryFilter.focus();
    await this.categoryFilter.selectOption(category);
  }

  /**
   * Sorts products by the specified field
   *
   * Note: Uses focus() before selectOption() for cross-browser compatibility
   *
   * @param sortBy - Field to sort by ('name', 'price', 'stock')
   *
   * @example
   * ```typescript
   * await productsPage.sortBy('price');
   * ```
   */
  async sortBy(sortBy: 'name' | 'price' | 'stock') {
    await this.sortSelect.focus();
    await this.sortSelect.selectOption(sortBy);
  }

  /**
   * Clears the search input
   *
   * @example
   * ```typescript
   * await productsPage.clearSearch();
   * ```
   */
  async clearSearch() {
    await this.searchInput.clear();
  }

  // === Product Table Methods ===

  /**
   * Gets a product row locator by product ID
   *
   * @param productId - The ID of the product
   * @returns Locator for the product row
   *
   * @example
   * ```typescript
   * const row = productsPage.getProductRow('product-123');
   * await expect(row).toBeVisible();
   * ```
   */
  getProductRow(productId: string): Locator {
    return this.page.getByTestId(`product-row-${productId}`);
  }

  /**
   * Gets the edit button locator for a specific product
   *
   * @param productId - The ID of the product
   * @returns Locator for the edit button
   *
   * @example
   * ```typescript
   * await productsPage.getEditButton('product-123').click();
   * ```
   */
  getEditButton(productId: string): Locator {
    return this.page.getByTestId(`edit-product-${productId}`);
  }

  /**
   * Gets the delete button locator for a specific product
   *
   * @param productId - The ID of the product
   * @returns Locator for the delete button
   *
   * @example
   * ```typescript
   * await productsPage.getDeleteButton('product-123').click();
   * ```
   */
  getDeleteButton(productId: string): Locator {
    return this.page.getByTestId(`delete-product-${productId}`);
  }

  /**
   * Clicks the edit button for a specific product
   *
   * @param productId - The ID of the product to edit
   *
   * @example
   * ```typescript
   * await productsPage.clickEditProduct('product-123');
   * await expect(page).toHaveURL('/products/product-123');
   * ```
   */
  async clickEditProduct(productId: string) {
    await this.getEditButton(productId).click();
    await this.page.waitForURL(`/products/${productId}`);
  }

  /**
   * Clicks the delete button for a specific product (opens modal)
   *
   * @param productId - The ID of the product to delete
   *
   * @example
   * ```typescript
   * await productsPage.clickDeleteProduct('product-123');
   * await expect(productsPage.deleteModal).toBeVisible();
   * ```
   */
  async clickDeleteProduct(productId: string) {
    await this.getDeleteButton(productId).click();
    await this.deleteModal.waitFor({ state: 'visible' });
  }

  /**
   * Gets the count of visible product rows in the table
   *
   * @returns Number of visible products
   *
   * @example
   * ```typescript
   * const count = await productsPage.getProductCount();
   * expect(count).toBeGreaterThan(0);
   * ```
   */
  async getProductCount(): Promise<number> {
    const rows = await this.page
      .locator('[data-testid^="product-row-"]')
      .count();
    return rows;
  }

  /**
   * Checks if a product with the given ID is visible in the table
   *
   * @param productId - The ID of the product
   * @returns True if product is visible, false otherwise
   *
   * @example
   * ```typescript
   * const isVisible = await productsPage.isProductVisible('product-123');
   * expect(isVisible).toBe(true);
   * ```
   */
  async isProductVisible(productId: string): Promise<boolean> {
    return await this.getProductRow(productId).isVisible();
  }

  /**
   * Gets product data from a table row
   *
   * Extracts SKU, name, category, price, and stock from the product row
   *
   * @param productId - The ID of the product
   * @returns Object with product data from the table
   *
   * @example
   * ```typescript
   * const data = await productsPage.getProductDataFromRow('product-123');
   * expect(data.name).toBe('Expected Name');
   * ```
   */
  async getProductDataFromRow(productId: string): Promise<{
    sku: string;
    name: string;
    category: string;
    price: string;
    stock: string;
  }> {
    const row = this.getProductRow(productId);
    await expect(row).toBeVisible();

    const cells = row.locator('td');
    const sku = await cells.nth(0).textContent();
    const name = await cells.nth(1).textContent();
    const category = await cells.nth(2).textContent();
    const price = await cells.nth(3).textContent();
    const stock = await cells.nth(4).textContent();

    return {
      sku: sku?.trim() || '',
      name: name?.trim() || '',
      category: category?.trim() || '',
      price: price?.trim() || '',
      stock: stock?.trim() || '',
    };
  }

  /**
   * Checks if a product has a low stock badge (red background)
   *
   * @param productId - The ID of the product
   * @returns True if product has low stock badge, false otherwise
   *
   * @example
   * ```typescript
   * const hasWarning = await productsPage.hasLowStockBadge('product-123');
   * expect(hasWarning).toBe(true);
   * ```
   */
  async hasLowStockBadge(productId: string): Promise<boolean> {
    const row = this.getProductRow(productId);
    await expect(row).toBeVisible();

    const stockCell = row.locator('td').nth(4);
    const badge = stockCell.locator('span.bg-red-100');
    return await badge.isVisible();
  }

  /**
   * Gets the product name at a specific index in the table
   *
   * @param index - Zero-based index of the product row
   * @returns The product name
   *
   * @example
   * ```typescript
   * const firstProductName = await productsPage.getProductNameAtIndex(0);
   * expect(firstProductName).toBe('Expected First Product');
   * ```
   */
  async getProductNameAtIndex(index: number): Promise<string> {
    const rows = this.page.locator('[data-testid^="product-row-"]');
    const row = rows.nth(index);
    await expect(row).toBeVisible();

    const nameCell = row.locator('td').nth(1);
    const name = await nameCell.textContent();
    return name?.trim() || '';
  }

  /**
   * Gets the name of the first visible product
   *
   * @returns The product name
   *
   * @example
   * ```typescript
   * const firstProductName = await productsPage.getFirstProductName();
   * expect(firstProductName).toBe('Expected Name');
   * ```
   */
  async getFirstProductName(): Promise<string> {
    return await this.getProductNameAtIndex(0);
  }

  /**
   * Gets the price of the first visible product
   *
   * @returns The product price as string
   *
   * @example
   * ```typescript
   * const firstProductPrice = await productsPage.getFirstProductPrice();
   * expect(firstProductPrice).toBe('$99.99');
   * ```
   */
  async getFirstProductPrice(): Promise<string> {
    const firstRow = this.getFirstProductRow();
    await expect(firstRow).toBeVisible();

    const priceCell = firstRow.locator('td').nth(3);
    const price = await priceCell.textContent();
    return price?.trim() || '';
  }

  /**
   * Gets the stock of the first visible product
   *
   * @returns The product stock as string
   *
   * @example
   * ```typescript
   * const firstProductStock = await productsPage.getFirstProductStock();
   * expect(firstProductStock).toBe('10');
   * ```
   */
  async getFirstProductStock(): Promise<string> {
    const firstRow = this.getFirstProductRow();
    await expect(firstRow).toBeVisible();

    const stockCell = firstRow.locator('td').nth(4);
    const stockBadge = stockCell.locator('span');
    const stock = await stockBadge.textContent();
    return stock?.trim() || '';
  }

  // === Delete Modal Methods ===

  /**
   * Confirms product deletion in the modal
   *
   * @example
   * ```typescript
   * await productsPage.clickDeleteProduct('product-123');
   * await productsPage.confirmDelete();
   * ```
   */
  async confirmDelete() {
    await this.confirmDeleteButton.click();
    await this.deleteModal.waitFor({ state: 'hidden' });
  }

  /**
   * Cancels product deletion in the modal
   *
   * @example
   * ```typescript
   * await productsPage.clickDeleteProduct('product-123');
   * await productsPage.cancelDelete();
   * ```
   */
  async cancelDelete() {
    await this.cancelDeleteButton.click();
    await this.deleteModal.waitFor({ state: 'hidden' });
  }

  /**
   * Deletes a product (clicks delete button and confirms)
   *
   * @param productId - The ID of the product to delete
   *
   * @example
   * ```typescript
   * await productsPage.deleteProduct('product-123');
   * await expect(productsPage.getProductRow('product-123')).not.toBeVisible();
   * ```
   */
  async deleteProduct(productId: string) {
    await this.clickDeleteProduct(productId);
    await this.confirmDelete();
  }

  /**
   * Gets the first visible product row
   *
   * @returns Locator for the first product row
   *
   * @example
   * ```typescript
   * const firstRow = await productsPage.getFirstProductRow();
   * await expect(firstRow).toBeVisible();
   * ```
   */
  getFirstProductRow(): Locator {
    return this.page.locator('[data-testid^="product-row-"]').first();
  }

  /**
   * Gets the product ID from a product row
   *
   * Extracts the ID from the data-testid attribute (format: "product-row-{id}")
   *
   * @param row - The product row locator
   * @returns The product ID
   *
   * @example
   * ```typescript
   * const firstRow = productsPage.getFirstProductRow();
   * const id = await productsPage.getProductIdFromRow(firstRow);
   * ```
   */
  async getProductIdFromRow(row: Locator): Promise<string> {
    await expect(row).toBeVisible();
    await expect(row).toHaveAttribute('data-testid', /^product-row-/);

    const productId = await row.getAttribute('data-testid');
    return productId!.replace('product-row-', '');
  }

  /**
   * Gets the ID of the first visible product
   *
   * Convenience method that combines getFirstProductRow and getProductIdFromRow
   *
   * @returns The ID of the first visible product
   *
   * @example
   * ```typescript
   * const firstId = await productsPage.getFirstProductId();
   * await productsPage.deleteProduct(firstId);
   * ```
   */
  async getFirstProductId(): Promise<string> {
    const firstRow = this.getFirstProductRow();
    return await this.getProductIdFromRow(firstRow);
  }
}
