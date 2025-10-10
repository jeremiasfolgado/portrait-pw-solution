import { Page, Locator } from '@playwright/test';
import { NavbarPage } from './navbar.page';
import { ProductCreateInput, ProductUpdateInput } from '@/types/product.types';

/**
 * Page Object Model for Product Form (New/Edit)
 *
 * This class encapsulates all interactions with the product form,
 * used for both creating new products and editing existing ones.
 *
 * ## Design Pattern: Composition
 *
 * Uses NavbarPage component for shared navigation functionality.
 *
 * @example
 * ```typescript
 * const productFormPage = new ProductFormPage(page);
 *
 * // Navigate to new product form
 * await productFormPage.gotoNew();
 *
 * // Fill and submit form
 * await productFormPage.fillForm({
 *   sku: 'TEST-001',
 *   name: 'Test Product',
 *   category: 'Electronics',
 *   price: 99.99,
 *   stock: 50
 * });
 * await productFormPage.save();
 *
 * // Check for validation errors
 * const hasError = await productFormPage.hasFieldError('sku');
 * ```
 */
export class ProductFormPage {
  readonly page: Page;

  // Navigation component (shared across all authenticated pages)
  readonly navbar: NavbarPage;

  // Form elements
  readonly productForm: Locator;
  readonly skuInput: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly categoryInput: Locator;
  readonly priceInput: Locator;
  readonly stockInput: Locator;
  readonly thresholdInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // Form titles
  readonly newProductTitle: Locator;
  readonly editProductTitle: Locator;

  /**
   * Creates a new ProductFormPage instance
   *
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;

    // Initialize navbar component
    this.navbar = new NavbarPage(page);

    // Form elements
    this.productForm = page.getByTestId('product-form');
    this.skuInput = page.getByTestId('sku-input');
    this.nameInput = page.getByTestId('name-input');
    this.descriptionInput = page.getByTestId('description-input');
    this.categoryInput = page.getByTestId('category-input');
    this.priceInput = page.getByTestId('price-input');
    this.stockInput = page.getByTestId('stock-input');
    this.thresholdInput = page.getByTestId('threshold-input');
    this.saveButton = page.getByTestId('save-button');
    this.cancelButton = page.getByTestId('cancel-button');

    // Form titles
    this.newProductTitle = page.getByTestId('new-product-title');
    this.editProductTitle = page.getByTestId('edit-product-title');
  }

  // === Navigation Methods ===

  /**
   * Navigates to the new product form page
   *
   * @example
   * ```typescript
   * await productFormPage.gotoNew();
   * await expect(productFormPage.newProductTitle).toBeVisible();
   * ```
   */
  async gotoNew() {
    await this.page.goto('/products/new');
  }

  /**
   * Navigates to the edit product form page for a specific product
   *
   * @param productId - The ID of the product to edit
   *
   * @example
   * ```typescript
   * await productFormPage.gotoEdit('product-123');
   * await expect(productFormPage.editProductTitle).toBeVisible();
   * ```
   */
  async gotoEdit(productId: string) {
    await this.page.goto(`/products/${productId}`);
  }

  // === Form Interaction Methods ===

  /**
   * Fills the product form with the provided data
   *
   * Note: Uses focus() before fill() for webkit compatibility
   *
   * @param data - Product form data (for create or partial update)
   *
   * @example
   * ```typescript
   * await productFormPage.fillForm({
   *   sku: 'TEST-001',
   *   name: 'Test Product',
   *   description: 'Test description',
   *   category: 'Electronics',
   *   price: 99.99,
   *   stock: 50,
   *   lowStockThreshold: 5
   * });
   * ```
   */
  async fillForm(data: Partial<ProductCreateInput>) {
    if (data.sku) {
      await this.skuInput.focus();
      await this.skuInput.fill(data.sku);
    }
    if (data.name) {
      await this.nameInput.focus();
      await this.nameInput.fill(data.name);
    }
    if (data.description !== undefined) {
      await this.descriptionInput.focus();
      await this.descriptionInput.fill(data.description);
    }
    if (data.category) {
      await this.categoryInput.focus();
      await this.categoryInput.selectOption(data.category);
    }
    if (data.price !== undefined) {
      await this.priceInput.focus();
      await this.priceInput.fill(data.price.toString());
    }
    if (data.stock !== undefined) {
      await this.stockInput.focus();
      await this.stockInput.fill(data.stock.toString());
    }
    if (data.lowStockThreshold !== undefined) {
      await this.thresholdInput.focus();
      await this.thresholdInput.fill(data.lowStockThreshold.toString());
    }
  }

  /**
   * Clicks the save button on the product form
   *
   * @example
   * ```typescript
   * await productFormPage.fillForm({...});
   * await productFormPage.save();
   * await expect(page).toHaveURL('/products');
   * ```
   */
  async save() {
    await this.saveButton.click();
  }

  /**
   * Clicks the cancel button on the product form
   *
   * @example
   * ```typescript
   * await productFormPage.cancel();
   * await expect(page).toHaveURL('/products');
   * ```
   */
  async cancel() {
    await this.cancelButton.click();
  }

  /**
   * Creates a new product (navigates to form, fills it, and saves)
   *
   * High-level convenience method that combines multiple steps.
   *
   * @param data - Product creation data (required fields must be provided)
   *
   * @example
   * ```typescript
   * await productFormPage.createProduct({
   *   sku: 'TEST-001',
   *   name: 'Test Product',
   *   category: 'Electronics',
   *   price: 99.99,
   *   stock: 50
   * });
   * await expect(page).toHaveURL('/products');
   * ```
   */
  async createProduct(data: ProductCreateInput) {
    await this.gotoNew();
    await this.fillForm(data);
    await this.save();
    await this.page.waitForURL('/products');
  }

  /**
   * Edits an existing product (navigates to edit form, fills it, and saves)
   *
   * High-level convenience method that combines multiple steps.
   *
   * @param productId - The ID of the product to edit
   * @param data - Product update data (partial updates allowed)
   *
   * @example
   * ```typescript
   * await productFormPage.editProduct('product-123', {
   *   name: 'Updated Product Name',
   *   price: 149.99
   * });
   * await expect(page).toHaveURL('/products');
   * ```
   */
  async editProduct(productId: string, data: ProductUpdateInput) {
    await this.gotoEdit(productId);
    await this.fillForm(data);
    await this.save();
    await this.page.waitForURL('/products');
  }

  // === Validation Methods ===

  /**
   * Gets the error message for a specific field
   *
   * Works with both new product form (no testids on errors) and
   * edit product form (has testids on errors).
   *
   * @param field - The field name ('sku', 'name', 'price', 'stock')
   * @returns The error message text, or empty string if no error
   *
   * @example
   * ```typescript
   * await productFormPage.save(); // Submit empty form
   * const error = await productFormPage.getFieldError('name');
   * expect(error).toBe('Name is required');
   * ```
   */
  async getFieldError(
    field: 'sku' | 'name' | 'price' | 'stock'
  ): Promise<string> {
    // Try edit form format first (has testid)
    const errorWithTestId = this.page.getByTestId(`${field}-error`);
    if (await errorWithTestId.isVisible().catch(() => false)) {
      return (await errorWithTestId.textContent()) || '';
    }

    // Try new product form format (no testid, uses italic class after input)
    const inputLocator = this.page.getByTestId(`${field}-input`);
    const errorLocator = inputLocator.locator('..').locator('p.text-red-500');
    if (await errorLocator.isVisible().catch(() => false)) {
      return (await errorLocator.textContent()) || '';
    }

    return '';
  }

  /**
   * Checks if a validation error is displayed for a field
   *
   * Works with both new product form and edit product form.
   *
   * @param field - The field name
   * @returns True if error is visible, false otherwise
   *
   * @example
   * ```typescript
   * const hasError = await productFormPage.hasFieldError('price');
   * expect(hasError).toBe(true);
   * ```
   */
  async hasFieldError(
    field: 'sku' | 'name' | 'price' | 'stock'
  ): Promise<boolean> {
    // Try edit form format first (has testid)
    const errorWithTestId = this.page.getByTestId(`${field}-error`);
    if (await errorWithTestId.isVisible().catch(() => false)) {
      return true;
    }

    // Try new product form format (no testid, uses italic class after input)
    const inputLocator = this.page.getByTestId(`${field}-input`);
    const errorLocator = inputLocator.locator('..').locator('p.text-red-500');
    if (await errorLocator.isVisible().catch(() => false)) {
      return true;
    }

    return false;
  }

  /**
   * Clears a specific input field
   *
   * @param field - The field to clear
   *
   * @example
   * ```typescript
   * await productFormPage.clearField('price');
   * ```
   */
  async clearField(field: 'sku' | 'name' | 'price' | 'stock') {
    const fieldMap = {
      sku: this.skuInput,
      name: this.nameInput,
      price: this.priceInput,
      stock: this.stockInput,
    };
    await fieldMap[field].clear();
  }
}
