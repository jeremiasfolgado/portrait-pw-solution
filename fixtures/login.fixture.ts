import { test as base, expect as baseExpect } from '@playwright/test';
import { LoginPage } from '@/pages/login.page';

export const loginFixture = base.extend<{
  loginPage: LoginPage;
}>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },
});

export const expect = baseExpect;
