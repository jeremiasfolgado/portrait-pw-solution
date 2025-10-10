import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly loginTitle: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly passwordToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginTitle = page.getByTestId('login-title');
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error-message');
    this.passwordToggle = page.getByTestId('password-toggle');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    // Focus first to ensure field is ready (especially important for webkit)
    await this.emailInput.focus();
    await this.emailInput.fill(email);

    await this.passwordInput.focus();
    await this.passwordInput.fill(password);

    await this.loginButton.click();
  }

  // TODO: Candidates should implement these methods
  async isPasswordVisible(): Promise<boolean> {
    // Implementation needed
    throw new Error('Method not implemented');
  }

  async togglePasswordVisibility() {
    await this.passwordToggle.click();
  }

  async getErrorMessage(): Promise<string> {
    await expect(this.errorMessage).toBeVisible();
    return (await this.errorMessage.textContent()) || '';
  }

  async getValidationMessage(): Promise<string> {
    return await this.emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
  }

  async expectValidationMessage(browserName: string) {
    const validationMessage = await this.getValidationMessage();
    expect(validationMessage).toBeTruthy();

    const expectedMessages: Record<string, string> = {
      webkit: 'Fill out this field',
      chromium: 'Please fill out this field.',
      firefox: 'Please fill out this field.',
    };

    expect(validationMessage).toBe(expectedMessages[browserName]);
  }
}
