import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Navigation Bar
 *
 * This class encapsulates all interactions with the navigation bar that appears
 * on all authenticated pages (Dashboard, Products, Inventory).
 *
 * ## Design Pattern: Composition
 *
 * This class is designed to be composed into other Page Objects rather than
 * being used standalone. This follows the DRY principle and ensures consistent
 * navigation behavior across all pages.
 *
 * @example
 * ```typescript
 * // Used as a component in other Page Objects
 * export class DashboardPage {
 *   readonly navbar: NavbarPage;
 *
 *   constructor(page: Page) {
 *     this.page = page;
 *     this.navbar = new NavbarPage(page);
 *   }
 * }
 *
 * // In tests
 * await dashboardPage.navbar.navigateToProducts();
 * await dashboardPage.navbar.logout();
 * const userName = await dashboardPage.navbar.getUserName();
 * ```
 */
export class NavbarPage {
  readonly page: Page;

  // Navbar structure elements
  readonly navbar: Locator;
  readonly navLogo: Locator;

  // Navigation links
  readonly navDashboard: Locator;
  readonly navProducts: Locator;
  readonly navInventory: Locator;

  // User information and actions
  readonly userName: Locator;
  readonly logoutButton: Locator;

  /**
   * Creates a new NavbarPage instance
   *
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;

    // Navbar structure
    this.navbar = page.getByTestId('navbar');
    this.navLogo = page.getByTestId('nav-logo');

    // Navigation links
    this.navDashboard = page.getByTestId('nav-dashboard');
    this.navProducts = page.getByTestId('nav-products');
    this.navInventory = page.getByTestId('nav-inventory');

    // User information
    this.userName = page.getByTestId('user-name');
    this.logoutButton = page.getByTestId('logout-button');
  }

  /**
   * Gets the displayed user name from the navbar
   *
   * The user name varies by role:
   * - Admin user: "Admin User"
   * - Regular user: "Regular User"
   *
   * @returns The user name as displayed in the navbar
   *
   * @example
   * ```typescript
   * const userName = await navbarPage.getUserName();
   * expect(userName).toBe('Admin User');
   * ```
   */
  async getUserName(): Promise<string> {
    return (await this.userName.textContent()) || '';
  }

  /**
   * Navigates to the Dashboard page using the navbar link
   * Automatically waits for navigation to complete
   *
   * @example
   * ```typescript
   * await navbarPage.navigateToDashboard();
   * await expect(page).toHaveURL('/dashboard');
   * ```
   */
  async navigateToDashboard() {
    await this.navDashboard.click();
    await this.page.waitForURL('/dashboard');
  }

  /**
   * Navigates to the Products page using the navbar link
   * Automatically waits for navigation to complete
   *
   * @example
   * ```typescript
   * await navbarPage.navigateToProducts();
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
   * await navbarPage.navigateToInventory();
   * await expect(page).toHaveURL('/inventory');
   * ```
   */
  async navigateToInventory() {
    await this.navInventory.click();
    await this.page.waitForURL('/inventory');
  }

  /**
   * Logs out the current user by clicking the logout button
   * Automatically waits for navigation to the login page
   *
   * @example
   * ```typescript
   * await navbarPage.logout();
   * await expect(page).toHaveURL('/login');
   * ```
   */
  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL('/login');
  }

  /**
   * Checks if the navbar is visible
   * Useful for verifying authentication state
   *
   * @returns True if navbar is visible, false otherwise
   *
   * @example
   * ```typescript
   * const isAuthenticated = await navbarPage.isVisible();
   * expect(isAuthenticated).toBe(true);
   * ```
   */
  async isVisible(): Promise<boolean> {
    return await this.navbar.isVisible();
  }
}
