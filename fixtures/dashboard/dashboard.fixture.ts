import { test as base, expect as baseExpect } from '@playwright/test';
import { LoginPage } from '@/pages/login.page';
import { DashboardPage } from '@/pages/dashboard.page';

type UserRole = 'admin' | 'user';

/**
 * Dashboard Fixture - Authenticated User with Role-Based Login
 *
 * This fixture provides an authenticated DashboardPage instance with automatic role detection
 * based on the test title. It implements implicit parameterization to reduce test boilerplate
 * while maintaining clear test intent.
 *
 * @property {DashboardPage} dashboardPage - An authenticated DashboardPage instance ready to use
 * @property {UserRole} role - The user role ('admin' or 'user') determined from test title
 *
 * ## How It Works
 *
 * The fixture uses Playwright's testInfo.title to automatically determine which user to log in as:
 *
 * 1. **Role Detection**: Examines the test title for the word "admin" (case-insensitive)
 * 2. **Automatic Login**: Logs in with appropriate credentials based on detected role
 * 3. **Page Provision**: Returns an authenticated DashboardPage instance ready for testing
 *
 * ## Role Detection Logic
 *
 * - If test title contains "admin" → logs in as Admin User (admin@test.com)
 * - If test title does NOT contain "admin" → logs in as Regular User (user@test.com)
 *
 * ## Usage Examples
 *
 * @example
 * // This test will automatically login as ADMIN (title contains 'admin')
 * test('should display dashboard for admin user', async ({ dashboardPage }) => {
 *   const userName = await dashboardPage.getUserName();
 *   expect(userName).toBe('Admin User'); // ✅ Logged in as admin
 * });
 *
 * @example
 * // This test will automatically login as REGULAR USER (title doesn't contain 'admin')
 * test('should display dashboard for regular user', async ({ dashboardPage }) => {
 *   const userName = await dashboardPage.getUserName();
 *   expect(userName).toBe('Regular User'); // ✅ Logged in as regular user
 * });
 *
 * @example
 * // Accessing the role explicitly if needed
 * test('my custom test with admin', async ({ dashboardPage, role }) => {
 *   console.log(`Testing with role: ${role}`); // Outputs: "Testing with role: admin"
 *
 *   if (role === 'admin') {
 *     // Perform admin-specific validations
 *   }
 * });
 *
 * ## Benefits of This Approach
 *
 * 1. **Reduced Boilerplate**: No need to manually login in each test
 * 2. **Clear Intent**: Test titles clearly indicate which user is being tested
 * 3. **Maintainability**: Single fixture manages authentication for both roles
 * 4. **Flexibility**: Can still access the role explicitly if needed for conditional logic
 *
 * ## Design Rationale
 *
 * After exploring the application with both roles, we discovered that the Dashboard page
 * is identical for both Admin and Regular users. The only difference is the displayed username.
 * This makes a single parameterized fixture more maintainable than separate fixtures for each role.
 *
 * ## Alternative Approaches Considered
 *
 * If you prefer explicit fixtures over title-based detection, you could create:
 * - `adminDashboardFixture` - Always logs in as admin
 * - `userDashboardFixture` - Always logs in as regular user
 *
 * However, the current approach was chosen for its simplicity and reduced code duplication.
 */
export const dashboardFixture = base.extend<{
  dashboardPage: DashboardPage;
  role: UserRole;
}>({
  /**
   * Role fixture - Automatically determines user role from test title
   *
   * This fixture analyzes the test title to determine which user role should be used.
   * It's the first step in the authentication flow.
   *
   * @param testInfo - Playwright's test information object containing test metadata
   * @returns {UserRole} - Either 'admin' or 'user' based on test title
   */
  role: async ({}, use, testInfo) => {
    // Extract role from test title
    // testInfo.title contains the full test name as written in test('...')
    const isAdmin = testInfo.title.toLowerCase().includes('admin');
    const detectedRole: UserRole = isAdmin ? 'admin' : 'user';

    // Provide the detected role to dependent fixtures and tests
    await use(detectedRole);
  },

  /**
   * DashboardPage fixture - Provides an authenticated DashboardPage instance
   *
   * This fixture depends on the 'role' fixture above. It performs the following:
   * 1. Receives the detected role from the role fixture
   * 2. Selects appropriate credentials based on role
   * 3. Performs login using LoginPage POM
   * 4. Waits for dashboard to load
   * 5. Provides DashboardPage instance to the test
   *
   * @param page - Playwright Page object
   * @param role - User role detected from test title
   * @returns {DashboardPage} - Authenticated DashboardPage instance
   */
  dashboardPage: async ({ page, role }, use) => {
    // Define credentials for each role
    const credentials = {
      admin: {
        email: 'admin@test.com',
        password: 'Admin123!',
      },
      user: {
        email: 'user@test.com',
        password: 'User123!',
      },
    };

    // Select credentials based on detected role
    const selectedCredentials = credentials[role];

    // Perform authentication using LoginPage POM
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      selectedCredentials.email,
      selectedCredentials.password
    );

    // Wait for successful navigation to dashboard
    await page.waitForURL('/dashboard');

    // Create and provide authenticated DashboardPage instance
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);

    // Cleanup happens automatically when test completes
  },
});

export const expect = baseExpect;
