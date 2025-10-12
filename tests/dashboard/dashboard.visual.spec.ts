/**
 * Visual Regression Test Suite - Dashboard Page
 *
 * These tests capture and compare screenshots of the dashboard page
 * to detect unintended visual changes.
 *
 * Coverage: 3 tests × 3 browsers = 9 snapshots
 *
 * IMPORTANT: Snapshots must be generated on Ubuntu (Linux) to match CI environment.
 * Use Docker to update snapshots:
 *   npm run docker:update-snapshots
 *
 * @requires Docker (for snapshot generation)
 */

import {
  dashboardFixture as test,
  expect,
} from '@/fixtures/dashboard/dashboard.fixture';

test.describe('Visual Regression - Dashboard Page', () => {
  test('should match dashboard layout for admin user', async ({
    dashboardPage,
    page,
  }) => {
    // Ensure page is fully loaded with all stats visible
    await expect(dashboardPage.statTotalProducts).toBeVisible();
    await expect(dashboardPage.statLowStock).toBeVisible();
    await expect(dashboardPage.statTotalValue).toBeVisible();

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('dashboard-admin.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match dashboard layout for regular user', async ({
    dashboardPage,
    page,
  }) => {
    // Ensure page is fully loaded with all stats visible
    await expect(dashboardPage.statTotalProducts).toBeVisible();
    await expect(dashboardPage.statLowStock).toBeVisible();
    await expect(dashboardPage.statTotalValue).toBeVisible();

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('dashboard-regular-user.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
