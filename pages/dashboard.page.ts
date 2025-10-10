import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Dashboard Page
 *
 * This class encapsulates all interactions with the Dashboard page, providing a clean API
 * for tests to interact with dashboard elements without directly querying the DOM.
 *
 * ## Features
 * - Access to all dashboard statistics (Total Products, Low Stock, Total Value)
 * - Navigation methods for moving between pages
 * - User information retrieval
 * - Logout functionality
 *
 * ## Design Notes
 * The Dashboard page is identical for both Admin and Regular users. The only visible
 * difference is the displayed username in the navbar. All stats, navigation links,
 * and functionality are the same across both roles.
 *
 * @example
 * ```typescript
 * const dashboardPage = new DashboardPage(page);
 * await dashboardPage.goto();
 *
 * // Get user information
 * const userName = await dashboardPage.getUserName();
 *
 * // Navigate to other pages
 * await dashboardPage.navigateToProducts();
 *
 * // Logout
 * await dashboardPage.logout();
 * ```
 */
export class DashboardPage {
  readonly page: Page;

  // Main dashboard elements
  readonly dashboardTitle: Locator;

  // Stats cards
  readonly statTotalProducts: Locator;
  readonly statLowStock: Locator;
  readonly statTotalValue: Locator;

  // Recent activity
  readonly recentActivityTitle: Locator;
  readonly activityList: Locator;

  // Navbar elements
  readonly navbar: Locator;
  readonly navLogo: Locator;
  readonly navDashboard: Locator;
  readonly navProducts: Locator;
  readonly navInventory: Locator;
  readonly userName: Locator;
  readonly logoutButton: Locator;

  /**
   * Creates a new DashboardPage instance
   * Initializes all locators using data-testid attributes for stability
   *
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;

    // Main dashboard elements
    this.dashboardTitle = page.getByTestId('dashboard-title');

    // Stats cards - Display key metrics
    this.statTotalProducts = page.getByTestId('stat-total-products');
    this.statLowStock = page.getByTestId('stat-low-stock');
    this.statTotalValue = page.getByTestId('stat-total-value');

    // Recent activity section
    this.recentActivityTitle = page.getByTestId('recent-activity-title');
    this.activityList = page.getByTestId('activity-list');

    // Navbar elements - Available for all authenticated users
    this.navbar = page.getByTestId('navbar');
    this.navLogo = page.getByTestId('nav-logo');
    this.navDashboard = page.getByTestId('nav-dashboard');
    this.navProducts = page.getByTestId('nav-products');
    this.navInventory = page.getByTestId('nav-inventory');
    this.userName = page.getByTestId('user-name');
    this.logoutButton = page.getByTestId('logout-button');
  }

  /**
   * Navigates directly to the dashboard page
   *
   * @example
   * ```typescript
   * await dashboardPage.goto();
   * ```
   */
  async goto() {
    await this.page.goto('/dashboard');
  }

  /**
   * Gets the displayed user name from the navbar
   *
   * This is the primary difference between Admin and Regular users:
   * - Admin user shows: "Admin User"
   * - Regular user shows: "Regular User"
   *
   * @returns The user name as displayed in the navbar
   *
   * @example
   * ```typescript
   * const userName = await dashboardPage.getUserName();
   * expect(userName).toBe('Admin User'); // or 'Regular User'
   * ```
   */
  async getUserName(): Promise<string> {
    return (await this.userName.textContent()) || '';
  }

  /**
   * Gets the total products count from the stats card
   * Extracts the numeric value from the card text
   *
   * @returns The total products count as a number
   *
   * @example
   * ```typescript
   * const total = await dashboardPage.getTotalProducts();
   * expect(total).toBe(5); // With default products
   * ```
   */
  async getTotalProducts(): Promise<number> {
    const text = await this.statTotalProducts.textContent();
    // Extract number from text like "Total Products5"
    const match = text?.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  /**
   * Gets the low stock items count from the stats card
   * Extracts the numeric value from the card text
   *
   * @returns The low stock items count as a number
   *
   * @example
   * ```typescript
   * const lowStock = await dashboardPage.getLowStockCount();
   * expect(lowStock).toBe(2); // With default products
   * ```
   */
  async getLowStockCount(): Promise<number> {
    const text = await this.statLowStock.textContent();
    // Extract number from text like "Low Stock Items2"
    const match = text?.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  /**
   * Gets the total value from the stats card
   * Extracts and parses the monetary value
   *
   * @returns The total value as a number (without $ sign or commas)
   *
   * @example
   * ```typescript
   * const value = await dashboardPage.getTotalValue();
   * expect(value).toBeCloseTo(24759.27, 2); // With default products
   * ```
   */
  async getTotalValue(): Promise<number> {
    const text = await this.statTotalValue.textContent();
    // Extract number from text like "Total Value$24,759.27"
    const match = text?.match(/\$([0-9,]+\.?\d*)/);
    if (!match) return 0;
    // Remove commas and parse as float
    return parseFloat(match[1].replace(/,/g, ''));
  }

  /**
   * Logs out the current user by clicking the logout button
   * Automatically waits for navigation to the login page
   *
   * @example
   * ```typescript
   * await dashboardPage.logout();
   * await expect(page).toHaveURL('/login');
   * ```
   */
  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL('/login');
  }

  /**
   * Navigates to the Products page using the navbar link
   * Automatically waits for navigation to complete
   *
   * @example
   * ```typescript
   * await dashboardPage.navigateToProducts();
   * await expect(page).toHaveURL('/products');
   * ```
   */
  async navigateToProducts() {
    await this.navProducts.click();
    await this.page.waitForURL('/products');
  }

  /**
   * Navigates to the Inventory page using the navbar link
   * Automatically waits for navigation to complete
   *
   * @example
   * ```typescript
   * await dashboardPage.navigateToInventory();
   * await expect(page).toHaveURL('/inventory');
   * ```
   */
  async navigateToInventory() {
    await this.navInventory.click();
    await this.page.waitForURL('/inventory');
  }
}
