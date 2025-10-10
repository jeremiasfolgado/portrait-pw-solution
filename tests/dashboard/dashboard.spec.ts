/**
 * Dashboard Test Suite
 *
 * Optimized test suite eliminating redundant tests while maintaining full coverage.
 *
 * ## Refactoring Rationale
 *
 * Original suite had 11 tests with several redundancies:
 * 1. Dashboard Rendering tests (2) - Removed: Stats tests implicitly validate visibility
 * 2. Stats validation with type checks (1) - Removed: Stats comparison validates types implicitly
 * 3. Navigation links visibility (1) - Removed: Successful navigation validates visibility
 * 4. Logout (1) - Removed: Already covered in login.spec.ts
 *
 * Result: 6 focused tests covering all critical functionality.
 *
 * ## Test Strategy
 *
 * - **User Information**: Validates the ONLY visual difference between roles
 * - **Stats Validation**: Validates calculations against localStorage (both roles)
 * - **Navigation**: Validates functional navigation (not just visibility)
 * - **Logout**: Covered in login.spec.ts (no duplication)
 */
import {
  dashboardFixture as test,
  expect,
} from '@/fixtures/dashboard/dashboard.fixture';
import { getExpectedStatsFromStorage } from '@/tests/helpers/dashboard-helpers';

test.describe('Dashboard', () => {
  test.describe('User Information', () => {
    test('should display correct name for admin user', async ({
      dashboardPage,
    }) => {
      const userName = await dashboardPage.getUserName();
      expect(userName).toBe('Admin User');
    });

    test('should display correct name for regular user', async ({
      dashboardPage,
    }) => {
      const userName = await dashboardPage.getUserName();
      expect(userName).toBe('Regular User');
    });
  });

  test.describe('Stats Validation', () => {
    /**
     * Validates stats calculation for admin user.
     * Implicitly validates that dashboard loaded and stats cards are visible.
     */
    test('admin user should see correct stats from localStorage', async ({
      dashboardPage,
      page,
    }) => {
      // Wait for stats to load
      await expect
        .poll(async () => await dashboardPage.getTotalProducts(), {
          timeout: 5000,
        })
        .toBeGreaterThan(0);

      // Calculate expected from localStorage
      const expectedStats = await getExpectedStatsFromStorage(page);

      // Validate stats match expected
      expect(await dashboardPage.getTotalProducts()).toBe(
        expectedStats.totalProducts
      );
      expect(await dashboardPage.getLowStockCount()).toBe(
        expectedStats.lowStockItems
      );
      expect(await dashboardPage.getTotalValue()).toBeCloseTo(
        expectedStats.totalValue,
        2
      );
    });

    /**
     * Validates stats calculation for regular user.
     * Since both tests use same localStorage, passing both confirms role equality.
     */
    test('regular user should see correct stats from localStorage', async ({
      dashboardPage,
      page,
    }) => {
      // Wait for stats to load
      await expect
        .poll(async () => await dashboardPage.getTotalProducts(), {
          timeout: 5000,
        })
        .toBeGreaterThan(0);

      // Calculate expected from localStorage
      const expectedStats = await getExpectedStatsFromStorage(page);

      // Validate stats match expected
      expect(await dashboardPage.getTotalProducts()).toBe(
        expectedStats.totalProducts
      );
      expect(await dashboardPage.getLowStockCount()).toBe(
        expectedStats.lowStockItems
      );
      expect(await dashboardPage.getTotalValue()).toBeCloseTo(
        expectedStats.totalValue,
        2
      );
    });
  });

  test.describe('Navigation', () => {
    /**
     * Navigation tests validate functional behavior.
     * Successful navigation implicitly validates link visibility.
     */
    test('should navigate to products page', async ({
      dashboardPage,
      page,
    }) => {
      await dashboardPage.navigateToProducts();
      await expect(page).toHaveURL('/products');
    });

    test('should navigate to inventory page', async ({
      dashboardPage,
      page,
    }) => {
      await dashboardPage.navigateToInventory();
      await expect(page).toHaveURL('/inventory');
    });
  });
});
