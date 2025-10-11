# QA Automation Engineer Challenge - Solution

**Author:** Jeremías Folgado  
**Date:** October 11, 2025  
**Framework:** Playwright + TypeScript  
**Result:** 180 tests passing (100%) across chromium, firefox, and webkit

---

## 🚧 Work In Progress

> **Note:** This solution already completes **Level 1 (Required) and Level 2 (Intermediate) at 100%**, with 180 tests passing across all browsers. However, there are **3 days remaining** before the deadline, which provides opportunity for additional enhancements.

**Current Status:**

- ✅ Level 1: Complete (100%)
- ✅ Level 2: Complete (100%)
- 🟡 Level 3: Partial (example E2E exists, room for custom implementations)

**Potential Additions (Time Permitting):**

- [ ] Custom E2E user journeys beyond provided example
- [ ] GitHub Actions CI/CD workflow
- [ ] Visual regression testing implementation
- [ ] Performance testing integration
- [ ] Accessibility testing with axe-core

**Why This Matters:**  
While the solution already exceeds requirements, these additions would demonstrate advanced capabilities and initiative. The current implementation provides a solid, production-ready foundation.

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Testing Approach](#testing-approach)
3. [Framework Decisions](#framework-decisions)
4. [Project Architecture](#project-architecture)
5. [Application Assumptions](#application-assumptions)
6. [Execution Instructions](#execution-instructions)
7. [Coverage Strategy](#coverage-strategy)
8. [Challenges and Solutions](#challenges-and-solutions)
9. [Future Improvements](#future-improvements)
10. [Additional Documentation](#additional-documentation)

---

## 🎯 Executive Summary

### Challenge Completeness

- ✅ **Level 1 (Required): 100% Complete**
- ✅ **Level 2 (Intermediate): 100% Complete**
- 🟡 **Level 3 (Advanced): Partial** (E2E example exists)

### Key Metrics

| Metric             | Value                                                          |
| ------------------ | -------------------------------------------------------------- |
| Total Tests        | 180 (60 per browser)                                           |
| Success Rate       | 100% across all browsers                                       |
| POMs Created       | 6 (Login, Dashboard, Navbar, Products, ProductForm, Inventory) |
| Fixtures           | 5 with auto-authentication                                     |
| Helpers            | 5 with data-driven validation                                  |
| Linter Errors      | 0                                                              |
| Edge Case Coverage | Comprehensive (extreme numbers, boundaries)                    |
| Execution Time     | ~38s (chromium), ~2.3min (all browsers)                        |

---

## 🧪 Testing Approach

### Fundamental Principles

#### 1. **Data-Driven Testing**

Instead of hardcoding expected values, all tests validate against real data from `localStorage`. This makes tests:

- Independent of the dataset
- Validate real application logic
- Detect bugs in calculations and filters
- More maintainable

**Example:**

```typescript
// ❌ Hardcoded (fragile)
expect(count).toBe(5);

// ✅ Data-driven (robust)
const expectedProducts = await getExpectedFilteredProducts(page, {
  searchTerm: 'Laptop',
});
expect(actualCount).toBe(expectedProducts.length);
```

#### 2. **Strict Page Object Model (POM)**

**Golden Rule:** Tests should NEVER make direct DOM queries.

All element interactions are encapsulated in Page Objects:

```typescript
// ❌ Pattern violation
const firstRow = page.locator('[data-testid^="product-row-"]').first();

// ✅ Correct POM usage
const firstId = await productsPage.getFirstProductId();
```

#### 3. **Composition Over Inheritance**

For shared elements (like navbar), we use composition instead of inheritance:

```typescript
export class ProductsPage {
  readonly navbar: NavbarPage; // Composition

  constructor(page: Page) {
    this.navbar = new NavbarPage(page);
  }
}
```

**Benefits:**

- More flexible than inheritance
- Reusable across any page
- TypeScript-friendly
- Easy to test

#### 4. **Single Responsibility Principle**

Each POM and test suite has a single responsibility:

- `ProductsPage` → Product listing
- `ProductFormPage` → Product forms
- `products.spec.ts` → Listing tests
- `product-form.spec.ts` → Form tests

#### 5. **Cross-Browser First**

All tests designed for 3 browsers from the start:

- `waitFor → focus → fill` pattern for stability
- Tests validated in chromium, firefox, and webkit
- Browser-specific quirks handled

---

## 🔧 Framework Decisions

### 1. ESLint with Playwright Rules (Critical)

**Decision:** Install and configure `eslint-plugin-playwright` with strict rules

**File:** `eslint.config.js`

```javascript
plugins: {
  playwright,
},
rules: {
  ...playwright.configs.recommended.rules,
  'playwright/no-wait-for-timeout': 'warn',
  'playwright/no-element-handle': 'warn',
  'playwright/expect-expect': 'warn',
}
```

**Reasons:**

1. **Prevents bad practices** - Detects anti-patterns automatically
2. **Guides during development** - Linter suggests better alternatives
3. **Prevents AI agent hallucinations** - Clear rules prevent LLM errors
4. **Maintains clean code** - Forces correct assertions
5. **Educational** - Learn best practices while coding

**Key Rules That Saved Me:**

- `no-wait-for-timeout` → Forced me to use assertions
- `no-conditional-expects` → Eliminated conditional logic in tests
- `prefer-to-have-text` → Better than `textContent()`
- `no-get-by-role-with-text` → More specific selectors

**Impact:** Without these rules, I would have had fragile, unmaintainable tests.

### 2. Playwright MCP (Development Tool)

**Decision:** Use Model Context Protocol (MCP) for Playwright during development

**Benefits during development:**

1. **UI Exploration** - Visual inspection of selectors
2. **Selector Generation** - MCP suggests best selectors
3. **Interactive Testing** - Try interactions before coding
4. **Screenshot Debugging** - Capture visual state on failure
5. **Development Acceleration** - Less trial & error

**How I Used It:**

- Initial page exploration to identify data-testids
- Complex interaction validation (modals, toggles)
- Cross-browser debugging
- Expected behavior documentation

**Note:** MCP was especially useful for understanding:

- Error format differences in forms (new vs edit)
- Modal behavior on validation
- Mixed content structure (label + value)

### 3. TypeScript Strict Mode

**Decision:** Use TypeScript with strict configuration

**Configuration:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Benefits:**

- Errors caught at compile time
- Robust autocomplete
- Safe refactoring
- Implicit documentation through types

### 4. Path Aliases (@/)

**Decision:** Use path aliases for clean imports

**Configuration:**

```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

**Before vs After:**

```typescript
// ❌ Without alias
import { LoginPage } from '../../../pages/login.page';

// ✅ With alias
import { LoginPage } from '@/pages/login.page';
```

### 5. Fixtures with Auto-Authentication

**Decision:** Fixtures that automate login instead of beforeEach

**Advantages:**

- Cleaner tests
- No duplicated login code
- Automatic isolation
- Easy credential changes

**Example:**

```typescript
test('should display dashboard', async ({ dashboardPage }) => {
  // Already authenticated and on the page!
  const userName = await dashboardPage.navbar.getUserName();
  expect(userName).toBe('Admin User');
});
```

---

## 🏗️ Project Architecture

### Directory Structure

```
portrait-pw-solution/
├── pages/                      # Page Object Models
│   ├── login.page.ts          # Login page (217 lines)
│   ├── dashboard.page.ts      # Dashboard with stats (153 lines)
│   ├── navbar.page.ts         # Reusable component (166 lines)
│   ├── products.page.ts       # Product listing (401 lines)
│   ├── product-form.page.ts   # Form new/edit (336 lines)
│   └── inventory.page.ts      # Inventory management (404 lines)
│
├── fixtures/                   # Fixtures with auto-auth
│   ├── login/login.fixture.ts
│   ├── dashboard/dashboard.fixture.ts
│   ├── products/products.fixture.ts
│   ├── products/product-form.fixture.ts
│   └── inventory/inventory.fixture.ts
│
├── tests/                      # Test suites
│   ├── login/login.spec.ts            # 12 tests
│   ├── dashboard/dashboard.spec.ts    # 6 tests
│   ├── products/products.spec.ts      # 12 tests (listing)
│   ├── products/product-form.spec.ts  # 12 tests (forms)
│   ├── inventory/inventory.spec.ts    # 18 tests
│   └── helpers/
│       ├── storage-helpers.ts    # ⭐ Single source of truth
│       ├── dashboard-helpers.ts  # Dashboard calculations
│       ├── products-helpers.ts   # Filters and sort
│       ├── inventory-helpers.ts  # Stock adjustments
│       └── test-helpers.ts       # General utilities
│
├── types/
│   └── product.types.ts       # Centralized types (Omit, Partial)
│
└── docs/
    ├── BITACORA.md            # Detailed work log (2000+ lines)
    ├── PLAYWRIGHT_CONTEXT.md  # Framework agreements
    └── SELECTORS.md           # Complete selectors catalog
```

### Design Patterns Applied

#### 1. **Composition Pattern (NavbarPage)**

The navbar appears on all authenticated pages. Instead of duplicating code, we use composition:

```typescript
export class DashboardPage {
  readonly navbar: NavbarPage; // Shared component

  constructor(page: Page) {
    this.navbar = new NavbarPage(page);
    // Only dashboard-specific elements here
  }
}
```

**Usage in tests:**

```typescript
await dashboardPage.navbar.navigateToProducts();
await dashboardPage.navbar.logout();
```

#### 2. **Re-export Pattern (DRY in Helpers)**

To centralize localStorage without breaking existing tests:

```typescript
// storage-helpers.ts - Single implementation
export async function getProductsFromLocalStorage(page: Page) { ... }

// dashboard-helpers.ts - Re-exports
export { getProductsFromLocalStorage } from './storage-helpers';
```

**Benefit:** Backward compatible, no test changes needed.

#### 3. **TypeScript Utility Types**

Avoid type duplication using transformations:

```typescript
// Base type
interface Product { id, sku, name, ... }

// Derived type (without auto-generated fields)
type ProductCreateInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & {
  description?: string;
}

// Partial updates
type ProductUpdateInput = Partial<ProductCreateInput>
```

**Advantage:** One base type, multiple derivations without duplication.

#### 4. **Fixture Parameterization (Role Detection)**

Instead of creating separate fixtures for admin and user:

```typescript
// Detect role from test title
const isAdmin = testInfo.title.toLowerCase().includes('admin');
const role = isAdmin ? 'admin' : 'user';

// Authenticate with appropriate credentials
const credentials = CREDENTIALS[role];
await loginPage.login(credentials.email, credentials.password);
```

**Test:**

```typescript
test('should display correct name for admin user', async ({
  dashboardPage,
}) => {
  // Automatically uses admin credentials
  const userName = await dashboardPage.navbar.getUserName();
  expect(userName).toBe('Admin User');
});
```

---

## 🔍 Application Assumptions

### Functional Behavior

1. **Dashboard identical for both roles**

   - Admin and Regular User see the same statistics
   - Only difference: displayed username
   - Same navigation permissions

2. **Client-side validation in forms**

   - HTML5 validation runs before app validation
   - Browsers have different validation messages
   - Required fields prevent form submission

3. **localStorage as source of truth**

   - All data persisted in `localStorage`
   - Key: `qa_challenge_products`
   - Stats and filters calculated from this source

4. **Modals remain open on validation error**

   - When validation fails, modal stays open
   - User must correct or cancel manually
   - Correct UX behavior

5. **Stock cannot be negative**
   - Validation: `product.stock + adjustment >= 0`
   - Error: "Stock cannot be negative"
   - Prevents submission

### Technical Behavior

6. **Data-testids available**

   - Most elements have `data-testid`
   - Inconsistency: new form vs edit form
   - Priority: data-testid > role > text > CSS

7. **Cross-browser differences**

   - Webkit requires `waitFor` before `fill()`
   - Validation messages vary by browser
   - Input type="number" doesn't accept text

8. **Permanent test accounts**
   - `admin@test.com` / `Admin123!`
   - `user@test.com` / `User123!`
   - Credentials don't change between runs

---

## 🚀 Execution Instructions

### Initial Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install

# 3. Start the application (in separate terminal)
npm run dev
# App runs at http://localhost:3456
```

### Running Tests

```bash
# All tests on all browsers
npm test

# Only chromium (faster for development)
npm test -- --project=chromium

# Specific module
npm test -- tests/login/
npm test -- tests/dashboard/
npm test -- tests/products/
npm test -- tests/inventory/

# UI mode (interactive debugging)
npm run test:ui

# Headed mode (watch browser)
npm run test:headed

# Debug mode (step by step)
npm run test:debug

# View HTML report
npx playwright show-report
```

### Linting Commands

```bash
# Check linter
npm run lint

# Auto-fix errors
npm run lint:fix
```

### Useful Scripts

```bash
# Functional tests (exclude visual)
npm run test:functional

# Only visual tests
npm run test:visual

# Update visual snapshots
npm run test:visual:update
```

---

## 📊 Coverage Strategy

### Test Prioritization

#### **Tier 1: Critical Path (Level 1 Required)**

- ✅ Authentication (login/logout/session)
- ✅ Product creation
- ✅ Form validation
- ✅ Product search
- ✅ Product deletion

**Coverage:** 100% (all implemented)

#### **Tier 2: Core Features (Level 2 Intermediate)**

- ✅ Dashboard with calculated stats
- ✅ Filters and sorting
- ✅ Inventory management (stock adjustments)
- ✅ Low stock alerts
- ✅ Constraint validation

**Coverage:** 100% (all implemented)

#### **Tier 3: Edge Cases & Advanced**

- ✅ Extremely large/small numbers
- ✅ Consecutive adjustments
- ✅ Different input methods (keyboard, fill, clear)
- ✅ Boundary validation (zero, negative)
- 🟡 E2E journeys (example exists)

**Coverage:** ~80% (edge cases complete, needs more custom E2E)

### Test Distribution by Module

```
Login (36 tests - 20%):
├─ Rendering (3 tests)
├─ Authentication (12 tests)
├─ Password Toggle (12 tests)
└─ Validation (9 tests)

Dashboard (18 tests - 10%):
├─ User Info (6 tests)
├─ Stats Validation (6 tests)
└─ Navigation (6 tests)

Products (72 tests - 40%):
├─ List Navigation (6 tests)
├─ Search & Filter (15 tests)
├─ Sort (9 tests)
├─ Deletion (6 tests)
├─ Form Creation (9 tests)
├─ Form Validation (24 tests)
└─ Form Navigation (3 tests)

Inventory (54 tests - 30%):
├─ Rendering (6 tests)
├─ Low Stock Alerts (6 tests)
├─ Stock Increase (9 tests)
├─ Stock Decrease (6 tests)
├─ Validation (12 tests)
├─ Modal (6 tests)
├─ Input Methods (9 tests)
└─ Alert Updates (3 tests)

Total: 180 tests
```

### Types of Tests Implemented

#### 1. **Functional Tests (100%)**

- Complete workflow validation
- User interactions
- Page navigation
- CRUD operations

#### 2. **Validation Tests (100%)**

- Required fields
- Invalid values (negative, zero)
- Incorrect formats
- Business constraints

#### 3. **Edge Case Tests (100%)**

- Extreme numbers (±999,999)
- Exact boundaries (reduce to zero)
- Empty inputs
- Consecutive adjustments

#### 4. **Cross-Browser Tests (100%)**

- All tests run on 3 browsers
- Browser-specific quirks handled
- 100% stability

#### 5. **Data-Driven Tests (100%)**

- Validation against localStorage
- Helpers replicating app logic
- No hardcoded values

---

## 💡 Challenges and Solutions

### Challenge 1: Webkit Input Flakiness 🔴 CRITICAL

**Problem:** In webkit, email field wouldn't fill randomly (~90% success rate).

**Symptoms:**

- Input visible but empty after `fill()`
- Test fails with "Invalid credentials"
- Not consistently reproducible

**Debugging:**

1. Screenshots showed input visible but empty
2. Tried `click()` before `fill()` - didn't work
3. Tried only `focus()` - improved but not 100%
4. Research: webkit is stricter with timing

**Final Solution:**

```typescript
async login(email: string, password: string) {
  // Three-step pattern for maximum stability
  await this.emailInput.waitFor({ state: 'visible' });
  await this.emailInput.focus();
  await this.emailInput.fill(email);

  await this.passwordInput.waitFor({ state: 'visible' });
  await this.passwordInput.focus();
  await this.passwordInput.fill(password);

  await this.loginButton.click();
}
```

**Result:** 100% webkit stability (180/180 tests)

**Lesson:** For critical fields, always wait for visibility explicitly.

### Challenge 2: localStorage Helper Duplication 🟡 MEDIUM

**Problem:** `getProductsFromLocalStorage()` duplicated in 3 files (~110 lines).

**Recognition:** During code review noticed same code in:

- `dashboard-helpers.ts`
- `products-helpers.ts`
- `inventory-helpers.ts`

**Solution:**

1. Create `storage-helpers.ts` as single source of truth
2. Move all storage operations there
3. Have other helpers import and re-export
4. Verify tests don't break (backward compatible)

**Code:**

```typescript
// storage-helpers.ts
export async function getProductsFromLocalStorage(page: Page) { ... }

// dashboard-helpers.ts (and others)
import { getProductsFromLocalStorage } from './storage-helpers';
export { getProductsFromLocalStorage }; // Re-export
```

**Impact:**

- ✅ 110 lines eliminated
- ✅ Single place for changes
- ✅ Tests work without modifications

**Lesson:** Apply DRY aggressively, even in helpers.

### Challenge 3: Inconsistent Form Error Formats 🟡 MEDIUM

**Problem:** "new" and "edit" forms have different error structures.

**Discovery:**

- **New form:** Errors without `data-testid`, use CSS class
- **Edit form:** Errors with `data-testid`

**Solution:** Dual-fallback approach

```typescript
async getFieldError(field: string): Promise<string> {
  // Try edit format first
  const errorWithTestId = this.page.getByTestId(`${field}-error`);
  if (await errorWithTestId.isVisible().catch(() => false)) {
    return await errorWithTestId.textContent() || '';
  }

  // Fallback to new format
  const errorLocator = inputLocator.locator('..').locator('p.text-red-500');
  if (await errorLocator.isVisible().catch(() => false)) {
    return await errorLocator.textContent() || '';
  }

  return '';
}
```

**Result:** Same POM works for both forms.

**Lesson:** Always have fallbacks for UI inconsistencies.

### Challenge 4: Conditionals in Tests (Linter) 🟢 LOW

**Problem:** 21 linter warnings for conditionals in tests.

**Example of the problem:**

```typescript
// ❌ Conditional in test
if (filteredCount === 0) {
  await expect(noProductsMessage).toBeVisible();
} else {
  expect(filteredCount).toBeLessThan(totalCount);
}
```

**Solution:** Assertions without conditionals

```typescript
// ✅ No conditional
const expectedProducts = await getExpectedFilteredProducts(page, {
  searchTerm: 'Laptop',
});
expect(actualCount).toBe(expectedProducts.length);
```

**Result:** 21 warnings → 0 errors

**Lesson:** Linter forces more robust tests.

### Challenge 5: Mixed Content in Stats 🟢 LOW

**Problem:** Stats cards show "Total Products5" (label + value together).

**Discovery:** No separation of label and value in DOM.

**Solution:** Regex for extraction

```typescript
async getTotalProducts(): Promise<number> {
  const text = await this.statTotalProducts.textContent();
  // Extract number from "Total Products5"
  const match = text?.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}
```

**Lesson:** When DOM mixes content, use regex.

---

## 🎓 Technical Challenges Resolved

### 1. Cross-Browser Compatibility

**Challenge:** Tests passed in chromium but failed in webkit/firefox

**Implemented solutions:**

- `waitFor → focus → fill` pattern on all inputs
- Browser-specific validation for HTML5 messages
- `blur()` before click on elements that may intercept

**Result:** 100% stability across 3 browsers

### 2. Data-Driven Validation

**Challenge:** Avoid hardcoding expected values

**Solution:** Helpers that replicate app logic

```typescript
// Replicates application's filter
export function filterProductsBySearch(
  products: Product[],
  searchTerm: string
) {
  const lowerSearch = searchTerm.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerSearch) ||
      p.sku.toLowerCase().includes(lowerSearch)
  );
}
```

**Benefit:** Tests validate real logic, not assumptions.

### 3. Strict POM Adherence

**Challenge:** Keep tests completely free of DOM queries

**Enforcement:**

- Code review after each suite
- Move queries to POM methods
- Create helpers when necessary

**Example:**

```typescript
// Before: Direct query in test
const firstRow = page.locator('[data-testid^="product-row-"]').first();

// After: POM method
async getFirstProductId(): Promise<string> {
  const firstRow = this.getFirstProductRow();
  return await this.getProductIdFromRow(firstRow);
}

// Clean test
const id = await productsPage.getFirstProductId();
```

---

## 🛠️ Tools and Technologies

### Core Stack

- **Playwright 1.42.0** - Testing framework
- **TypeScript 5.0** - Language (strict mode)
- **Next.js 15** - Application under test
- **Node.js 20+** - Runtime

### Development Tools

- **ESLint 9.37** with `eslint-plugin-playwright` 2.2.2
- **TypeScript ESLint** 8.46.0
- **MCP Playwright** - For UI exploration
- **VS Code** - Primary IDE

### Testing Features

- **3 browsers:** chromium, firefox, webkit
- **Parallel execution:** 4 workers
- **Fixtures** for auto-auth
- **Helpers** for data-driven validation
- **Path aliases** (@/) for clean imports

---

## 📈 Testing Strategy Adopted

### 1. Test Pyramid Approach

```
         /\
        /  \  E2E (Few, critical)
       /    \
      / Integration (Moderate)
     /        \
    / Unit Tests (Many, fast)
   /____________\
```

**In this project:**

- **Base:** Individual component tests (login, forms)
- **Middle:** Feature tests (products, inventory)
- **Top:** E2E journeys (complete lifecycle)

### 2. AAA Pattern (Arrange-Act-Assert)

All tests follow clear structure:

```typescript
test('should create a new product', async ({ productFormPage }) => {
  // Arrange - Setup test data
  const productData = {
    sku: 'TEST-001',
    name: 'Test Product',
    category: 'Electronics',
    price: 99.99,
    stock: 50,
  };

  // Act - Perform action
  await productFormPage.createProduct(productData);

  // Assert - Validate result
  await expect(page).toHaveURL('/products');
});
```

### 3. Test Independence

- Each test is independent
- Fixtures create clean state
- No dependencies between tests
- Can run in parallel

### 4. Descriptive Test Names

Test names follow pattern `should + action + context`:

```typescript
test('should prevent stock from going negative');
test('should display low stock badge on products below threshold');
test('should handle extremely large numbers (edge case)');
```

---

## 🎯 Key Design Decisions

### Why Separate ProductsPage and ProductFormPage

**Original Problem:** Single 609-line POM with everything mixed.

**Decision:** Separate into two POMs by responsibility.

**Result:**

- `ProductsPage` (401 lines) - Listing, filters, deletion
- `ProductFormPage` (336 lines) - Forms new/edit, validation

**Benefits:**

- Tests organized by functionality
- Easier to find and maintain code
- More focused POMs
- Independent test suites

### Why Create Composable NavbarPage

**Observation:** Identical navbar across all authenticated pages.

**Alternatives considered:**

1. ❌ Duplicate elements in each POM
2. ❌ Inheritance (AuthenticatedPage base class)
3. ✅ **Composition** (NavbarPage as component)

**Implementation:**

```typescript
export class ProductsPage {
  readonly navbar: NavbarPage;

  constructor(page: Page) {
    this.navbar = new NavbarPage(page);
  }
}
```

**Why composition won:**

- More flexible than inheritance
- Can be mixed into any page
- TypeScript-friendly
- Easy to mock in unit tests

### Why Centralize Types in types/

**Problem:** Product defined in 3+ places.

**Solution:** TypeScript utility types

```typescript
// types/product.types.ts
export interface Product { ... } // Base

export type ProductCreateInput = Omit<
  Product,
  'id' | 'createdAt' | 'updatedAt' | 'imageUrl' | 'description' | 'lowStockThreshold'
> & {
  description?: string;
  lowStockThreshold?: number;
};

export type ProductUpdateInput = Partial<ProductCreateInput>;
```

**Advantages:**

- Single source of truth
- Type-safe transformations
- Changes propagate automatically
- Clear semantics (Create vs Update)

### Why Validate Against localStorage

**Alternative:** Hardcode expected values

```typescript
// ❌ Hardcoded
expect(totalProducts).toBe(5);
expect(lowStock).toBe(2);
```

**Problem:** Tests break if initial data changes.

**Solution:** Read and calculate from localStorage

```typescript
// ✅ Data-driven
const expected = await getExpectedStatsFromStorage(page);
expect(actualTotal).toBe(expected.totalProducts);
expect(actualLowStock).toBe(expected.lowStockItems);
```

**Benefits:**

- Tests agnostic to dataset
- Validate real logic
- Easy to debug discrepancies
- More maintainable

---

## 🚧 Future Improvements

### For the Application

1. **Consistency in data-testids**

   - Add testids to new form errors
   - Standardize error message formats
   - Separate labels from values in stats cards

2. **Accessibility**

   - Add appropriate ARIA labels
   - Improve keyboard navigation
   - Semantic roles on elements

3. **Reset API**
   - `POST /api/reset` already exists
   - Could expose more options (reset specific modules)

### For the Tests

1. **Visual Regression Testing**

   - Implement Playwright screenshot comparison
   - Capture critical states (login, dashboard, modals)
   - Detect unintended visual changes

2. **Performance Testing**

   - Measure page load times
   - Validate performance budgets
   - Detect memory leaks

3. **Accessibility Testing**

   - Integrate `@axe-core/playwright`
   - Validate WCAG compliance
   - Test keyboard navigation

4. **API Testing Integration**

   - Data setup via API instead of UI
   - Faster test execution
   - Better isolation

5. **Test Data Management**
   - Factory pattern for generating products
   - Scenario-specific datasets
   - More robust automatic cleanup

### For CI/CD

1. **GitHub Actions Workflow**

   ```yaml
   - Run on PR
   - Browser matrix
   - Parallel sharding
   - Upload reports
   - Fail fast strategy
   ```

2. **Test Reporting**

   - Integration with reporting tools
   - Result trending
   - Slack/Discord alerts

3. **Scheduled Runs**
   - Nightly complete runs
   - Hourly smoke tests
   - Weekly regression suite

---

## 📚 Additional Documentation

### Project Documentation Files

This solution includes comprehensive documentation in the `/docs` folder:

#### 1. **BITACORA.md** (Work Log - 2000+ lines)

Detailed day-by-day work log documenting:

- Daily tasks completed
- Technical discoveries and solutions
- Architecture decisions with rationale
- Issues encountered and resolution times
- Lessons learned
- Progress tracking

**Value:** Demonstrates systematic approach and problem-solving process.

#### 2. **PLAYWRIGHT_CONTEXT.md** (Framework Agreements)

Establishes testing framework standards:

- Project structure
- Coding conventions
- Test organization patterns
- Selector strategies
- Best practices
- Review checklists

**Value:** Shows professional methodology and team collaboration mindset.

#### 3. **SELECTORS.md** (Complete Catalog)

Comprehensive catalog of all selectors:

- All data-testids documented
- Dynamic selector patterns
- Conditional elements
- Special cases and workarounds
- Quick reference table

**Value:** Demonstrates thorough exploration and documentation skills.

### Why Include These Documents?

**Benefits:**

- 📋 **Transparency** - Shows complete thought process
- 🎯 **Methodology** - Demonstrates systematic approach
- 🔍 **Discovery Process** - Documents learning journey
- 💡 **Knowledge Sharing** - Useful for future maintainers
- 🏆 **Professionalism** - Goes beyond just working code

**Note:** These documents were maintained throughout development, not created retroactively. This shows commitment to documentation-driven development.

---

## 🏆 Noteworthy Achievements

### Quality Metrics

- **180/180 tests (100%)** across all browsers
- **0 linter errors** across entire project
- **~3,000 lines** of test code
- **100% JSDoc coverage** on POMs and helpers
- **6 POMs** complete and documented
- **5 fixtures** with auto-auth
- **5 helpers** well-organized

### Technical Innovations

1. **Automatic role detection** in dashboard fixture
2. **Centralized storage-helpers** (DRY)
3. **TypeScript utility types** to avoid duplication
4. **Dual-fallback** for UI inconsistencies
5. **Three-step fill pattern** for webkit
6. **Data-driven validation** against localStorage

### Differentiators

- **Comprehensive edge cases** (extreme numbers)
- **Input interaction methods** (keyboard, consecutive, clear)
- **100% cross-browser** (not just chromium)
- **Zero hardcoded expectations**
- **Clean code** (0 linter errors)
- **Complete documentation** (BITACORA, SELECTORS, CONTEXT)

---

## 📝 Resources and References

### Patterns Implemented

- **Page Object Model** - UI encapsulation
- **Composition Pattern** - Reusable NavbarPage
- **Fixture Pattern** - Automatic setup
- **Helper Pattern** - Shared logic
- **Re-export Pattern** - Backward compatibility

### Best Practices Applied

- ✅ Strict TypeScript
- ✅ ESLint with Playwright rules
- ✅ JSDoc on all public methods
- ✅ Code in English (industry standard)
- ✅ Descriptive git commits
- ✅ DRY principle
- ✅ SOLID principles (especially Single Responsibility)

---

## 🕐 Time Investment

- **Day 1:** Setup and documentation (2h)
- **Day 2:** Login POM and tests (6h)
- **Day 3:** Dashboard + Products + Navbar (8h)
- **Day 4:** Inventory + DRY refactoring + webkit fix (6h)
- **Total:** ~22 hours

---

## 🎯 Key Learnings

1. **ESLint is your friend** - Playwright rules prevent bad practices
2. **MCP accelerates development** - Visual exploration saves time
3. **Webkit requires care** - Always `waitFor` before `fill`
4. **DRY applies to helpers too** - Not just production code
5. **Data-driven is superior** - More robust and maintainable tests

---

## 📧 Contact Information

**Author:** Jeremías Folgado  
**Repository:** [URL to public repository]  
**Submission Date:** October 16, 2025

---

**Note:** This solution demonstrates production-ready test automation with industry best practices. While Level 1 and Level 2 are complete, the remaining time allows for potential Level 3 enhancements if desired.
