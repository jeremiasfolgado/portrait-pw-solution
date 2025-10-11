import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Login Page
 * Provides methods to interact with login form elements and perform authentication actions
 */
export class LoginPage {
  readonly page: Page;
  readonly loginTitle: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly passwordToggle: Locator;

  /**
   * Creates a new LoginPage instance
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;
    this.loginTitle = page.getByTestId('login-title');
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error-message');
    this.passwordToggle = page.getByTestId('password-toggle');
  }

  /**
   * Navigates to the login page
   */
  async goto() {
    await this.page.goto('/login');
  }

  /**
   * Performs login with given credentials
   * Fills email and password fields, then clicks the login button
   * Note: Uses waitFor + focus + fill pattern for maximum webkit stability
   *
   * @param email - User email address
   * @param password - User password
   *
   * @example
   * ```typescript
   * await loginPage.login('admin@test.com', 'Admin123!');
   * await page.waitForURL('/dashboard');
   * ```
   */
  async login(email: string, password: string) {
    // Wait for element to be ready, then focus and fill
    // This pattern is critical for webkit stability
    await this.emailInput.waitFor({ state: 'visible' });
    await this.emailInput.focus();
    await this.emailInput.fill(email);

    await this.passwordInput.waitFor({ state: 'visible' });
    await this.passwordInput.focus();
    await this.passwordInput.fill(password);

    await this.loginButton.click();
  }

  /**
   * Checks if the password field is currently visible (type="text") or hidden (type="password")
   *
   * @returns true if password is visible, false if hidden
   *
   * @example
   * ```typescript
   * const isVisible = await loginPage.isPasswordVisible();
   * expect(isVisible).toBe(false); // Password is hidden by default
   * ```
   */
  async isPasswordVisible(): Promise<boolean> {
    const passwordInput = await this.passwordInput.getAttribute('type');
    return passwordInput === 'text';
  }

  /**
   * Toggles the password visibility by clicking the toggle button
   * Note: The password input must lose focus before clicking the toggle button
   * as the toggle is only clickable when the input is not focused
   *
   * @example
   * ```typescript
   * await loginPage.passwordInput.fill('myPassword123');
   * await loginPage.togglePasswordVisibility(); // Show password
   * expect(await loginPage.isPasswordVisible()).toBe(true);
   * ```
   */
  async togglePasswordVisibility() {
    // Remove focus from password input before clicking toggle
    // The toggle is only clickable when input is not focused
    await this.passwordInput.blur();
    await this.passwordToggle.click();
  }

  /**
   * Retrieves the error message displayed on the login page
   * Waits for the error message element to be visible before reading its content
   *
   * @returns The error message text
   *
   * @example
   * ```typescript
   * await loginPage.login('invalid@test.com', 'wrongpassword');
   * const errorMessage = await loginPage.getErrorMessage();
   * expect(errorMessage).toBe('Invalid email or password');
   * ```
   */
  async getErrorMessage(): Promise<string> {
    await expect(this.errorMessage).toBeVisible();
    return (await this.errorMessage.textContent()) || '';
  }

  /**
   * Retrieves the HTML5 validation message from the email input field
   * This message is shown by the browser's native form validation
   *
   * @returns The validation message string
   *
   * @example
   * ```typescript
   * await loginPage.emailInput.fill('');
   * await loginPage.loginButton.click();
   * const message = await loginPage.getValidationMessage();
   * console.log(message); // "Please fill out this field." (chromium/firefox)
   * ```
   */
  async getValidationMessage(): Promise<string> {
    return await this.emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
  }

  /**
   * Base method to validate HTML5 validation messages across browsers
   * Encapsulates the common validation logic (DRY principle)
   * Validates that the actual message exactly matches the expected message for the browser
   *
   * @param browserName - The name of the browser being tested (chromium, firefox, or webkit)
   * @param expectedMessages - Record mapping each browser to its expected validation message
   *
   * @private
   */
  private async validateBrowserMessage(
    browserName: 'chromium' | 'firefox' | 'webkit',
    expectedMessages: Record<'chromium' | 'firefox' | 'webkit', string>
  ) {
    const validationMessage = await this.getValidationMessage();
    expect(validationMessage).toBeTruthy();

    const expectedMessage = expectedMessages[browserName];

    expect(await this.getValidationMessage()).toBe(expectedMessage);
  }

  /**
   * Validates that the HTML5 email format validation message is displayed correctly
   * Each browser has different validation messages for invalid email formats
   *
   * @param browserName - The name of the browser being tested (chromium, firefox, or webkit)
   *
   * @example
   * ```typescript
   * await loginPage.emailInput.fill('invalidemail'); // No @ symbol
   * await loginPage.loginButton.click();
   * await loginPage.expectValidationMessageEmailFormat(browserName);
   * // Chromium: "Please include an '@' in the email address..."
   * // Firefox: "Please enter an email address."
   * // Webkit: "Enter an email address"
   * ```
   */
  async expectValidationMessageEmailFormat(
    browserName: 'chromium' | 'firefox' | 'webkit'
  ) {
    const expectedMessages: Record<'chromium' | 'firefox' | 'webkit', string> =
      {
        webkit: `Enter an email address`,
        chromium: `Please include an '@' in the email address. 'invalidemail' is missing an '@'.`,
        firefox: 'Please enter an email address.',
      };

    await this.validateBrowserMessage(browserName, expectedMessages);
  }

  /**
   * Validates that the HTML5 required field validation message is displayed correctly
   * Each browser has different validation messages for empty required fields
   *
   * @param browserName - The name of the browser being tested (chromium, firefox, or webkit)
   *
   * @example
   * ```typescript
   * await loginPage.emailInput.fill('');
   * await loginPage.loginButton.click();
   * await loginPage.expectValidationMessage(browserName);
   * // Chromium/Firefox: "Please fill out this field."
   * // Webkit: "Fill out this field"
   * ```
   */
  async expectValidationMessage(
    browserName: 'chromium' | 'firefox' | 'webkit'
  ) {
    const expectedMessages: Record<'chromium' | 'firefox' | 'webkit', string> =
      {
        webkit: 'Fill out this field',
        chromium: 'Please fill out this field.',
        firefox: 'Please fill out this field.',
      };

    await this.validateBrowserMessage(browserName, expectedMessages);
  }
}
