# QA Automation Engineer Challenge - Solution

**Author:** Jeremías Folgado  
**Date:** October 13, 2025  
**Framework:** Playwright + TypeScript  
**Result:** 119 test cases × 3 browsers = 357 total executions (100% passing)

---

## 📋 Summary

This solution implements all three challenge levels with 119 test cases running across 3 browsers (357 total executions). It includes CI/CD pipeline, 4 E2E journeys, data-driven architecture with dual validation (localStorage + UI), and visual regression testing with Docker.

### Implementation Status

- ✅ Level 1 (Required): Complete
- ✅ Level 2 (Intermediate): Complete
- ✅ Level 3 (Advanced): Substantially Complete

### Key Metrics

| Metric           | Value                                                          |
| ---------------- | -------------------------------------------------------------- |
| Test Cases       | 119 (102 functional + 17 visual)                               |
| Total Executions | 357 (119 tests × 3 browsers)                                   |
| Browsers         | chromium, firefox, webkit                                      |
| POMs             | 6 (Login, Dashboard, Navbar, Products, ProductForm, Inventory) |
| Fixtures         | 7 (5 core + 2 E2E)                                             |
| E2E Journeys     | 4 business scenarios                                           |
| Linter Errors    | 0                                                              |
| Execution Time   | ~4min local, ~7min CI (2 workers per browser)                  |

---

## 📋 Table of Contents

1. [Testing Approach](#-testing-approach)
2. [Technical Decisions](#-technical-decisions)
3. [Project Architecture](#-project-architecture)
4. [Assumptions](#-assumptions)
5. [Execution Instructions](#-execution-instructions)
6. [E2E Journeys (BDD Format)](#-e2e-journeys-bdd-format)
7. [Challenges and Solutions](#-challenges-and-solutions)
8. [Technical Stack](#-technical-stack)
9. [Testing Strategy](#-testing-strategy)
10. [Test Coverage](#-test-coverage)
11. [Future Improvements](#-future-improvements)
12. [Additional Documentation](#-additional-documentation)
13. [Implementation Summary](#-implementation-summary)
14. [Key Learnings](#-key-learnings)
15. [Contact Information](#-contact-information)

---

## 🧪 Testing Approach

### Applied Principles

**1. Data-Driven Testing**

Tests validate against real data from `localStorage` as source of truth instead of hardcoded values:

```typescript
// ❌ Fragile
expect(count).toBe(5);

// ✅ Robust
const expectedProducts = await getExpectedFilteredProducts(page, {
  searchTerm: 'Laptop',
});
expect(actualCount).toBe(expectedProducts.length);
```

**2. Strict Page Object Model**

All element interactions are encapsulated in Page Objects. Tests never make direct DOM queries.

**3. Composition over Inheritance**

For shared elements like navbar, composition is used:

```typescript
export class ProductsPage {
  readonly navbar: NavbarPage; // Composition
  constructor(page: Page) {
    this.navbar = new NavbarPage(page);
  }
}
```

**4. Cross-Browser from Day One**

All tests designed for 3 browsers with `waitFor → focus → fill` pattern for webkit stability.

**5. Visual Regression with Docker**

A Docker container was created with a Dockerfile and docker-compose that runs from a script in package.json. The purpose of this approach is to update screenshots in the same Operating System environment where tests run when executed by GitHub Actions.

---

## 🔧 Technical Decisions

### ESLint with Playwright Rules

Configuration of `eslint-plugin-playwright` with strict rules to automatically detect anti-patterns and maintain clean code. It also generates good context and prevents hallucinations from LLMs.

### TypeScript Strict Mode

Use of TypeScript with `strict: true` for compile-time errors and safe refactoring.

### Path Aliases (@/)

Configuration of aliases for cleaner and more maintainable imports.

### Fixtures with Auto-Authentication

Fixtures that automate login, eliminating duplicate code in tests.

---

## 🏗️ Project Architecture

### Directory Structure

```
portrait-pw-solution/
├── pages/                      # Page Object Models (6 POMs)
│   ├── login.page.ts          # 217 lines
│   ├── dashboard.page.ts      # 153 lines
│   ├── navbar.page.ts         # 166 lines (reusable component)
│   ├── products.page.ts       # 401 lines
│   ├── product-form.page.ts   # 336 lines
│   └── inventory.page.ts      # 404 lines
│
├── fixtures/                   # 7 fixtures with auto-auth
├── tests/                      # Test suites
│   ├── login/                 # 12 tests
│   ├── dashboard/             # 6 tests
│   ├── products/              # 78 + 81 = 159 tests
│   ├── inventory/             # 22 tests
│   ├── e2e/                   # 4 journeys
│   └── helpers/               # 5 centralized helpers
│
├── types/                      # Centralized types with utility types
└── docs/                       # Documentation (BITACORA, SELECTORS, CONTEXT)
```

### Applied Patterns

**Composition (NavbarPage):** Reusable navbar component across all authenticated pages.

**DRY in Helpers:** `storage-helpers.ts` as single source of truth, generating necessary methods to write and read the KEY where products are stored, then each helper has its own responsibility.

**TypeScript Utility Types:** Derived types using `Omit` and `Partial` to avoid duplication.

**Parameterized Fixture:** Automatic role detection (admin/user) based on test title.

---

## 🔍 Assumptions

### Functional Behavior

1. Identical dashboard for admin and regular user (only displayed name changes)
2. Client-side validation in forms (HTML5 + app)
3. localStorage as source of truth (`qa_challenge_products`)
4. Modals remain open on validation error
5. Stock cannot be negative

### Technical Behavior

6. Data-testids available (with inconsistencies between new/edit form)
7. Webkit requires `waitFor` before `fill()`
8. Permanent test accounts (`admin@test.com` / `user@test.com`)

---

## 🚀 Execution Instructions

### Initial Setup

```bash
npm install
npx playwright install
npm run dev  # In separate terminal, runs on http://localhost:3456
```

### Running Tests

```bash
# All tests
npm test

# Chromium only
npm test -- --project=chromium

# Specific module
npm test -- tests/login/
npm test -- tests/products/

# UI mode (interactive)
npm run test:ui

# Visual tests
npm run test:visual # Runs visual tests using screenshots for local OS
npm run test:visual:update # Updates screenshots for local OS
npm run docker:update-snapshots  # Update snapshots (Ubuntu)
```

### CI/CD Pipeline

GitHub Actions runs automatically on push/PR:

- Parallel 3-browser matrix
- 2 workers per browser for optimal performance
- Time: ~7 minutes (optimized from ~15 minutes)
- Artifacts: HTML reports, traces, visual diffs

View results: **Actions tab → Download artifacts → `npx playwright show-report`**

Reference: [Official Playwright CI Documentation](https://playwright.dev/docs/ci-intro#setting-up-github-actions)

---

## 🌐 E2E Journeys (BDD Format)

### Journey 1: Complete Product Lifecycle with Full Circle Validation

**Scenario:** As a user, I want to create a product, adjust its inventory, then delete it verifying the system returns to its initial state.

**Given** the dashboard shows initial system statistics  
**When** I create a new product with valid data  
**And** I adjust the product stock in the inventory module  
**And** I verify that dashboard statistics reflect the changes  
**And** I delete the product from the listing  
**Then** the product is not visible in the listing  
**And** the dashboard statistics return to the initial state (full circle validation)

**Key validation:** Data integrity, multi-module consistency, initial state === final state

---

### Journey 2: Form Error Recovery

**Scenario:** As a user, I want to attempt creating a product with invalid data and progressively correct errors until successful creation.

**Given** I am on the new product form  
**When** I attempt to submit the empty form  
**Then** I see all validation messages for required fields  
**When** I fill only SKU and name  
**Then** some error messages disappear but others persist  
**When** I enter invalid values (negative price/stock)  
**Then** validation prevents form submission  
**When** I correct all fields with valid values  
**And** I submit the form  
**Then** the product is created successfully  
**And** I can verify its existence in the listing

**Key validation:** Error recovery UX, precise validations, form resilience

---

### Journey 3: Search, Filter and Dual Deletion Validation

**Scenario:** As a user, I want to create diverse products, use filters to find them, and delete them with complete verification.

**Given** the system has existing products  
**When** I create 3 products with different categories (Electronics, Accessories)  
**Then** the products appear in the listing  
**When** I search by keyword "Laptop"  
**Then** I only see products matching the search  
**When** I filter by category "Electronics"  
**Then** I only see products from that category  
**When** I combine search "Premium" + filter "Accessories"  
**Then** I see only products meeting both conditions  
**When** I delete all test products  
**Then** they don't appear in the listing (UI validation)  
**And** they don't exist in localStorage (data validation)

**Key validation:** Functional search, precise filtering, filter combination, dual validation (UI + localStorage)

---

### Journey 4: Multi-User Collaboration

**Scenario:** As a multi-user system, I want changes from one user to persist for another user in different sessions.

**Given** an admin is authenticated in the system  
**And** the dashboard shows initial statistics  
**When** the admin creates a new product  
**Then** the product appears in the listing  
**And** the dashboard statistics increase  
**When** the admin logs out  
**And** a regular user logs in  
**Then** they can see the product created by the admin (persistence)  
**When** the user adjusts the product stock  
**Then** the dashboard reflects the update  
**When** the user deletes the product  
**Then** the product disappears from the system  
**And** the statistics return to the admin's initial state

**Key validation:** Data persistence across sessions, session management, multi-user collaboration, different roles

### Dual-Fixture Architecture

**e2eBaseFixture:** Without auto-auth, for multi-user scenarios with manual login/logout control.

**e2eFixture:** With auto-auth as admin, for standard journeys.

### Organization in Separate Files

Each journey in its own file for:

- Better isolation (separate workers)
- Avoid race conditions
- Simpler debugging

### Extended Timeouts (60s)

E2E journeys require 60s timeout due to:

- Multiple page navigations
- 6-12 steps per journey
- Asynchronous dashboard recalculation
- Multi-user scenarios

---

## 💡 Challenges and Solutions

### 1. Webkit Input Flakiness

**Problem:** Email field didn't fill consistently in webkit (~90% success rate).

**Solution:** Three-step pattern:

```typescript
await this.emailInput.waitFor({ state: 'visible' });
await this.emailInput.focus();
await this.emailInput.fill(email);
```

**Result:** 100% webkit stability.

### 2. localStorage Helper Duplication

**Problem:** `getProductsFromLocalStorage()` duplicated in 3 files (~110 lines).

**Solution:** Create centralized `storage-helpers.ts` with re-exports in other helpers for backward compatibility.

### 3. Inconsistent Error Formats

**Problem:** New/edit forms have different error structures.

**Solution:** Implement dual-fallback that tries both formats.

### 4. Conditionals in Tests

**Problem:** 21 linter warnings for conditionals in tests.

**Solution:** Remove conditionals using data-driven helpers that calculate expected values.

---

## 🛠️ Technical Stack

**Core:**

- Playwright 1.42.0
- TypeScript 5.0 (strict mode)
- Node.js 20+

**Tools:**

- ESLint 9.37 + eslint-plugin-playwright
- Docker (for visual regression)
- GitHub Actions (CI/CD)

**Testing:**

- 3 browsers (chromium, firefox, webkit)
- 4 parallel workers
- Path aliases (@/)
- Fixtures for auto-auth

---

## 📊 Testing Strategy

### Test Pyramid

```
     /\
    /  \  E2E (4 journeys)
   /    \
  / Integration (Features)
 /        \
/ Unit Tests (Components)
```

### AAA Pattern (Arrange-Act-Assert)

All tests follow clear structure of setup, action, and validation.

### Test Independence

Each test is independent thanks to fixtures that create clean state.

### Descriptive Names

Pattern: `should + action + context`

---

## 📈 Test Coverage

### Distribution by Module

- Login: 12 tests (auth, toggle, validation)
- Dashboard: 6 tests (stats, navigation, roles)
- Products: 159 tests (listing, forms, CRUD, validation)
- Inventory: 22 tests (stock, alerts, boundaries)
- E2E: 4 journeys
- Visual: 17 tests (51 snapshots)

### Test Types

- ✅ Functional (100%)
- ✅ Validation (100%)
- ✅ Edge cases (100%)
- ✅ Cross-browser (100%)
- ✅ Data-driven (100%)
- ✅ Visual regression (17 tests)

---

## 🚧 Future Improvements

### For the Application

1. Consistency in data-testids (add to new form errors)
2. Accessibility improvements (ARIA labels, keyboard navigation)
3. Separate labels from values in stats cards
4. Filters should impact the URL so they can be shared between users and persist on reload
5. A product detail screen should be added. Currently, the only way to view a product description is to enter edit mode.

### Bugs Found

1. Email and password fields accept leading and trailing spaces
2. Search fields have the same behavior as point 1
3. It's a good practice in product management software for SKUs to be unique; in this case, the system lacks this validation and allows duplicates.

### For the Tests

1. Performance testing (load times, budgets)
2. Accessibility testing (`@axe-core/playwright`)
3. API testing for faster data setup

### For CI/CD

1. Parallel sharding for faster execution
2. Test result comments on PRs
3. Notifications (Slack/Discord)

---

## 📚 Additional Documentation

### Files in /docs

**BITACORA.md (438 lines):** Day-by-day work log with technical decisions, discoveries, and progress.

**PLAYWRIGHT_CONTEXT.md:** Framework standards, conventions, and best practices.

**SELECTORS.md (574 lines):** Complete selector catalog with dynamic patterns and special cases.

---

## 📝 Implementation Summary

### Coverage

- 119 test cases (102 functional + 17 visual)
- 357 total executions (119 tests × 3 browsers)
- 0 linter errors
- ~3,500 lines of test code
- 100% JSDoc on POMs and helpers
- 6 complete POMs
- 7 fixtures
- 4 E2E journeys

### Applied Technical Patterns

1. Automatic role detection in fixtures
2. Centralized storage helpers (DRY)
3. TypeScript utility types
4. Dual-fallback for UI inconsistencies
5. Three-step pattern for webkit
6. Data-driven validation against localStorage
7. Dual-fixture architecture for E2E
8. Full circle validation in journeys
9. Multi-user testing
10. Visual regression with Docker

### Technical Approach

- Comprehensive edge cases
- Different input interaction methods
- 100% cross-browser
- No hardcoded values
- Exhaustive documentation
- E2E with realistic scenarios
- Operational CI/CD

---

## 🎯 Key Learnings

1. ESLint with Playwright rules detects anti-patterns and improves LLM interaction
2. MCP accelerates UI exploration
3. Webkit requires explicit waits before fill
4. DRY also applies to test helpers
5. Data-driven tests are more robust and maintainable
6. CI/CD from early on facilitates continuous integration
7. Appropriate fixtures simplify complex E2E tests
8. Full circle validation proves system integrity
9. Separate files prevent race conditions in E2E
10. expect.poll() is preferable to waitForTimeout for async validations

---

**Note:** This solution implements test automation following industry best practices, with integrated CI/CD, E2E coverage, data-driven architecture using locally stored data as the source of truth and validated in the UI, and visual regression testing. The three levels of difficulty are completed with 119 test cases executed across 3 browsers (357 total executions), 4 business journeys, and one operational CI/CD process.
