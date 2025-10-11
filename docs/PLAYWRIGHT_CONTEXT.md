# Playwright Testing Framework - Context & Agreements

## 📋 Project Overview

This document establishes the testing framework architecture, coding standards, and best practices for the QA Automation Challenge. All team members and AI assistants should follow these guidelines to ensure consistency and maintainability.

---

## 🏗️ Project Structure (As Implemented)

```
/pages/                     # Page Object Models
  ├── login.page.ts         # Login page POM (217 lines)
  ├── dashboard.page.ts     # Dashboard page POM (153 lines)
  ├── navbar.page.ts        # Navbar component - Composable (166 lines)
  ├── products.page.ts      # Products listing POM (401 lines)
  ├── product-form.page.ts  # Product form POM (336 lines)
  └── inventory.page.ts     # Inventory page POM (404 lines)

/tests/
  ├── login/
  │   └── login.spec.ts         # 12 tests
  ├── dashboard/
  │   └── dashboard.spec.ts     # 6 tests
  ├── products/
  │   ├── products.spec.ts      # 12 tests (listing)
  │   └── product-form.spec.ts  # 12 tests (forms)
  ├── inventory/
  │   └── inventory.spec.ts     # 18 tests
  ├── challenges/               # Original example tests
  └── helpers/                  # Test utilities
      ├── storage-helpers.ts    # ⭐ Single source of truth for localStorage
      ├── dashboard-helpers.ts  # Dashboard stats calculation
      ├── products-helpers.ts   # Product filtering and sorting
      ├── inventory-helpers.ts  # Stock adjustment logic
      └── test-helpers.ts       # General utilities

/fixtures/                  # Fixtures with auto-authentication
  ├── login/
  │   └── login.fixture.ts
  ├── dashboard/
  │   └── dashboard.fixture.ts  # With role detection
  ├── products/
  │   ├── products.fixture.ts
  │   └── product-form.fixture.ts
  └── inventory/
      └── inventory.fixture.ts

/types/                     # Centralized type definitions
  └── product.types.ts      # Product types with utility types (Omit, Partial)

/docs/                      # Documentation
  ├── PLAYWRIGHT_CONTEXT.md # This file
  ├── BITACORA.md          # Detailed work log (2000+ lines)
  └── SELECTORS.md         # Complete selectors catalog

/data/                      # Test data
  └── test-products.json
```

---

## 📦 Import Path Aliases

The project uses TypeScript path aliases for cleaner imports:

```typescript
// ✅ Use path aliases (configured in tsconfig.json)
import { LoginPage } from '@/pages/login.page';
import { NavbarPage } from '@/pages/navbar.page';
import { getProductsFromLocalStorage } from '@/tests/helpers/storage-helpers';
import { loginFixture } from '@/fixtures/login/login.fixture';
import { Product } from '@/types/product.types';

// ❌ Don't use relative paths
import { LoginPage } from '../../../pages/login.page';
import { getProductsFromLocalStorage } from '../../helpers/storage-helpers';
```

**Available aliases:**

- `@/*` - Root directory
- `@/pages/*` - Page Object Models
- `@/tests/*` - Test files and helpers
- `@/fixtures/*` - Test fixtures
- `@/types/*` - TypeScript type definitions

---

## 🎯 Test Organization

### File Naming Convention

- **`*.spec.ts`** - Functional/behavioral tests
- **`*.visual.spec.ts`** - Visual regression tests
- Test files should be in `/tests/challenges/`
- Helper files in `/tests/helpers/`

### Test File Structure

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '@/page-objects/login.page';

test.describe('Feature Name - Test Type', () => {
  test.beforeEach(async ({ page }) => {
    // Setup for each test
  });

  test('should perform specific action', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    await loginPage.goto();
    await loginPage.login('user@test.com', 'password');

    // Assert
    await expect(page).toHaveURL('/dashboard');
  });
});
```

---

## 🎨 Visual Testing Strategy

### File Organization

- Functional tests: `feature-name.spec.ts`
- Visual tests: `feature-name.visual.spec.ts`

### Visual Test Configuration

Each `.visual.spec.ts` file must include:

```typescript
import { test, expect } from '@playwright/test';

// Visual test configuration
test.use({
  viewport: { width: 1280, height: 720 },
  timezoneId: 'America/New_York',
  locale: 'en-US',
});

// Disable animations for stability
test.beforeEach(async ({ page }) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });
});

test.describe('Feature - Visual Tests', () => {
  test('should match snapshot', async ({ page }) => {
    await page.goto('/path');
    await expect(page).toHaveScreenshot('descriptive-name.png');
  });
});
```

### When to Create Visual Tests

✅ **DO create visual tests for:**

- Initial page states
- Error/validation states
- Modal/dialog appearances
- Complex UI states (filters, sorts applied)
- Responsive layouts
- Loading states
- Empty states
- Alert/notification appearances

❌ **DON'T create visual tests for:**

- Dynamic content (dates, IDs, timestamps)
- Tests focused only on behavior
- Rapidly changing content
- Third-party integrations

### Snapshot Naming Convention

**Format:** `[page]-[state]-[variant].png`

**Examples:**

- `login-initial-state.png`
- `login-error-empty-fields.png`
- `login-error-invalid-credentials.png`
- `products-list-empty-state.png`
- `products-list-sorted-by-price-asc.png`
- `inventory-alert-low-stock.png`
- `dashboard-overview-with-data.png`

### Snapshot Configuration

Default configuration in `playwright.config.ts`:

- **Viewport:** 1280x720
- **maxDiffPixels:** 100
- **threshold:** 0.2 (20%)

Override in specific tests if needed:

```typescript
await expect(page).toHaveScreenshot('name.png', {
  maxDiffPixels: 50,
  threshold: 0.1,
});
```

---

## 🎯 Selector Strategy

### Priority Order

1. **`data-testid`** (Highest priority) - Stable, semantic
2. **`getByRole`** - Accessible, semantic
3. **`getByText`** - For unique text content
4. **`getByLabel`** - For form elements
5. **CSS selectors** (Last resort) - Fragile, avoid

### Examples

```typescript
// ✅ GOOD - Stable selectors
await page.getByTestId('email-input').fill('test@example.com');
await page.getByRole('button', { name: 'Login' }).click();
await page.getByText('Welcome to Dashboard').waitFor();

// ❌ BAD - Fragile selectors
await page.locator('div.container > form > input:nth-child(1)').fill('...');
await page.locator('#submit-btn-123').click();
```

### data-testid Naming Convention

- Use kebab-case: `data-testid="product-name-input"`
- Be descriptive: Include element type
- Examples:
  - `login-button`
  - `email-input`
  - `error-message`
  - `product-card`
  - `delete-confirm-modal`

---

## 💻 Coding Agreements

### TypeScript Conventions

```typescript
// ✅ Use explicit types
async function login(email: string, password: string): Promise<void> {
  // ...
}

// ❌ Avoid 'any' type
async function doSomething(data: any) { // Don't do this
  // ...
}

// ✅ Use interfaces for complex types
interface Product {
  name: string;
  price: number;
  stock: number;
  category: string;
}

// ✅ Use readonly for POM properties
readonly emailInput: Locator;
```

### Naming Conventions

**Variables & Functions:**

- camelCase: `loginButton`, `getUserData()`

**Classes:**

- PascalCase: `LoginPage`, `ProductsPage`

**Constants:**

- UPPER_SNAKE_CASE: `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`

**Test Names:**

- Descriptive sentences: `should login successfully with valid credentials`
- Use "should" prefix for test descriptions

### Comment Style

```typescript
/**
 * Logs in a user with provided credentials
 * @param email - User email address
 * @param password - User password
 * @throws Error if login fails
 */
async login(email: string, password: string): Promise<void> {
  // Fill email input
  await this.emailInput.fill(email);

  // Fill password input
  await this.passwordInput.fill(password);

  // Submit form
  await this.loginButton.click();

  // Wait for navigation to dashboard
  await this.page.waitForURL('/dashboard');
}
```

### Error Handling

```typescript
// ✅ Handle errors explicitly
async getErrorMessage(): Promise<string> {
  try {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    return await this.errorMessage.textContent() || '';
  } catch (error) {
    return '';
  }
}

// ✅ Provide meaningful error messages
if (!productName) {
  throw new Error('Product name is required for search operation');
}
```

---

## ✨ Test Writing Best Practices

### Test Structure (AAA Pattern)

```typescript
test('should add product to cart', async ({ page }) => {
  // Arrange - Setup test data and state
  const productsPage = new ProductsPage(page);
  const product = generateTestProduct();
  await productsPage.goto();
  await productsPage.searchProduct(product.name);

  // Act - Perform the action
  await productsPage.addToCart(product.name);

  // Assert - Verify the outcome
  await expect(productsPage.cartCount).toHaveText('1');
});
```

### Wait Strategies

```typescript
// ✅ Use Playwright's auto-waiting (preferred)
await page.getByTestId('button').click();

// ✅ Wait for specific state when needed
await page.getByTestId('modal').waitFor({ state: 'visible' });

// ✅ Wait for URL changes
await page.waitForURL('/dashboard');

// ❌ Avoid arbitrary timeouts
await page.waitForTimeout(3000); // Don't use unless absolutely necessary
```

### Assertions

```typescript
// ✅ Use specific assertions
await expect(page.getByTestId('title')).toHaveText('Dashboard');
await expect(page).toHaveURL('/products');
await expect(element).toBeVisible();

// ✅ Use soft assertions for multiple checks
await expect.soft(element1).toBeVisible();
await expect.soft(element2).toHaveText('Expected');

// ✅ Custom error messages
await expect(price, 'Price should be positive').toBeGreaterThan(0);
```

### Test Independence

```typescript
// ✅ Each test should be independent
test('test 1', async ({ page }) => {
  const product = generateTestProduct();
  // Create and cleanup in same test
});

test('test 2', async ({ page }) => {
  const product = generateTestProduct();
  // Independent of test 1
});

// ❌ Don't share state between tests
let sharedData; // Don't do this
test('test 1', async () => {
  sharedData = await createData();
});
test('test 2', async () => {
  useData(sharedData); // Depends on test 1!
});
```

---

## 🚀 Running Tests

### Available Scripts

```bash
# Run all tests
npm test

# Run functional tests only
npm run test:functional

# Run visual tests only
npm run test:visual

# Update visual snapshots
npm run test:visual:update

# Run tests in headed mode
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Debug mode
npm run test:debug
```

### Test Execution Strategies

**Local Development:**

```bash
# Run specific file
npx playwright test authentication.spec.ts

# Run specific test
npx playwright test -g "should login successfully"

# Run in specific browser
npx playwright test --project=chromium
```

**CI/CD:**

- Tests run in parallel
- Retry failed tests 2 times
- Generate HTML report
- Upload artifacts (traces, screenshots)

---

## 📊 Test Data Management

### Test Data Sources

1. **Static Data:** `data/test-products.json`
2. **Generated Data:** `helpers/data-factory.ts` (to be created)
3. **Test Helpers:** `helpers/test-helpers.ts`

### Data Generation Pattern

```typescript
// @/tests/helpers/data-factory.ts
export function createProduct(overrides?: Partial<Product>): Product {
  const timestamp = Date.now();
  return {
    name: `Product ${timestamp}`,
    price: 99.99,
    stock: 50,
    category: 'Electronics',
    ...overrides,
  };
}
```

### Using Test Data

```typescript
import { generateTestProduct } from '@/tests/helpers/test-helpers';

test('create product', async ({ page }) => {
  const product = generateTestProduct();
  // Use product data
});
```

---

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)

- **baseURL:** `http://localhost:3456`
- **Browsers:** Chromium, Firefox, WebKit
- **Parallel:** Yes (in CI)
- **Retries:** 2 (in CI), 0 (local)
- **Viewport:** 1280x720
- **Screenshot:** Only on failure
- **Trace:** On first retry

### Environment Variables

```bash
# CI environment
CI=true npm test

# Custom port
PORT=3456 npm run dev
```

---

## 📝 Documentation Requirements

### Code Comments

- Document complex logic
- Explain "why" not "what"
- Use JSDoc for functions
- Keep comments updated

### Test Descriptions

```typescript
// ✅ Clear and descriptive
test('should display error message when login with invalid credentials', ...);

// ❌ Vague
test('login test', ...);
```

### Commit Messages

```bash
# ✅ Good commit messages
git commit -m "feat: add authentication tests for login page"
git commit -m "test: add visual regression tests for login states"
git commit -m "fix: handle timeout error in product search"

# ❌ Bad commit messages
git commit -m "updates"
git commit -m "fix bug"
```

---

## 🎓 Learning Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Fixtures](https://playwright.dev/docs/test-fixtures)

---

## 📋 Review Checklist

Before submitting code, ensure:

- [ ] All tests pass
- [ ] Using path aliases (`@/` imports)
- [ ] Following naming conventions
- [ ] Proper TypeScript types (no `any`)
- [ ] Tests are independent
- [ ] Visual tests have animations disabled
- [ ] Selectors follow priority order
- [ ] Code is commented where complex
- [ ] BITACORA.md is updated
- [ ] No console.log() statements left
- [ ] Error handling implemented

---

## 📝 Implementation Notes

### Key Patterns Applied

1. **Composition Pattern** - NavbarPage is composable, not inherited
2. **Single Responsibility** - Separate POMs for list vs form
3. **DRY Principle** - storage-helpers.ts centralizes localStorage
4. **TypeScript Utility Types** - Omit, Partial for type derivation
5. **Fixtures with Auto-Auth** - No beforeEach needed
6. **Data-Driven Testing** - Validation against localStorage

### Cross-Browser Compatibility

**Pattern for webkit stability:**

```typescript
await element.waitFor({ state: 'visible' });
await element.focus();
await element.fill(value);
```

This three-step pattern ensures 100% stability across all browsers.

---

**Last Updated:** October 11, 2025 - Day 4  
**Version:** 2.0.0 - Reflects implemented architecture  
**Status:** Complete - All patterns documented ✅
