import { Page, Locator } from '@playwright/test';
import { NavbarPage } from './navbar.page';

/**
 * Page Object Model for the Dashboard Page
 *
 * This class encapsulates all interactions with the Dashboard page, providing a clean API
 * for tests to interact with dashboard elements without directly querying the DOM.
 *
 * ## Features
 * - Access to all dashboard statistics (Total Products, Low Stock, Total Value)
 * - Navigation through composed NavbarPage component
 *
 * ## Design Pattern: Composition
 *
 * This class uses composition to include NavbarPage functionality.
 * All navigation, user info, and logout methods are accessed through the navbar property.
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
 * // Get user information from navbar
 * const userName = await dashboardPage.navbar.getUserName();
 *
 * // Navigate to other pages using navbar
 * await dashboardPage.navbar.navigateToProducts();
 *
 * // Logout using navbar
 * await dashboardPage.navbar.logout();
 * ```
 */
export class DashboardPage {
  readonly page: Page;

  // Navigation component (shared across all authenticated pages)
  readonly navbar: NavbarPage;

  // Main dashboard elements
  readonly dashboardTitle: Locator;

  // Stats cards
  readonly statTotalProducts: Locator;
  readonly statLowStock: Locator;
  readonly statTotalValue: Locator;

  // Recent activity
  readonly recentActivityTitle: Locator;
  readonly activityList: Locator;

  /**
   * Creates a new DashboardPage instance
   * Initializes all locators using data-testid attributes for stability
   *
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;

    // Initialize navbar component
    this.navbar = new NavbarPage(page);

    // Main dashboard elements
    this.dashboardTitle = page.getByTestId('dashboard-title');

    // Stats cards - Display key metrics
    this.statTotalProducts = page.getByTestId('stat-total-products');
    this.statLowStock = page.getByTestId('stat-low-stock');
    this.statTotalValue = page.getByTestId('stat-total-value');

    // Recent activity section
    this.recentActivityTitle = page.getByTestId('recent-activity-title');
    this.activityList = page.getByTestId('activity-list');
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
}
