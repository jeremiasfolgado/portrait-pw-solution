# Selectors Catalog

This document catalogs all available selectors (data-testid, roles, labels) found in the application. Use this as a reference when writing tests.

**Last Updated:** October 11, 2025 - Day 4  
**Status:** Complete - All pages documented ✅

---

## 🔍 Selector Priority

1. **data-testid** ⭐ (Most stable)
2. **getByRole**
3. **getByText**
4. **getByLabel**
5. **CSS Selectors** (Last resort)

---

## 📄 Login Page (`/login`)

### Main Elements

| Element         | data-testid       | Type   | Description                     |
| --------------- | ----------------- | ------ | ------------------------------- |
| Email Input     | `email-input`     | Input  | Email address field             |
| Password Input  | `password-input`  | Input  | Password field (type toggles)   |
| Login Button    | `login-button`    | Button | Submit login form               |
| Error Message   | `error-message`   | Text   | Displays validation/auth errors |
| Password Toggle | `password-toggle` | Button | Show/hide password visibility   |

### Alternative Selectors

```typescript
// Roles
page.getByRole('textbox', { name: /email/i });
page.getByRole('button', { name: /login/i });

// Labels
page.getByLabel('Email');
page.getByLabel('Password');
```

### Notes

- ✅ All main elements have stable data-testid
- ⚠️ Error message appears conditionally (only on error)
- ℹ️ Password input type changes: `password` ↔ `text`
- ℹ️ HTML5 validation messages vary by browser

---

## 🏠 Dashboard Page (`/dashboard`)

### Main Elements

| Element           | data-testid             | Type | Description               |
| ----------------- | ----------------------- | ---- | ------------------------- |
| Dashboard Title   | `dashboard-title`       | Text | Page title                |
| Stats - Total     | `stat-total-products`   | Card | Total products count      |
| Stats - Low Stock | `stat-low-stock`        | Card | Low stock items count     |
| Stats - Value     | `stat-total-value`      | Card | Total inventory value     |
| Recent Activity   | `recent-activity-title` | Text | Recent activity section   |
| Activity List     | `activity-list`         | List | List of recent activities |

### Navbar Elements (shared)

See [Navigation / Navbar](#-navigation--navbar) section below.

### Notes

- ℹ️ Stats display format: "Total Products5" (label + value concatenated)
- ℹ️ Values need regex extraction: `/\d+/` for numbers
- ℹ️ Total Value format: "Total Value$24,759.27" with $ and commas
- ✅ Dashboard identical for admin and regular users

---

## 📦 Products Page (`/products`)

### Page Elements

| Element         | data-testid           | Type   | Description                  |
| --------------- | --------------------- | ------ | ---------------------------- |
| Page Title      | `products-title`      | Text   | "Products" heading           |
| Add Button      | `add-product-button`  | Button | Navigate to new product form |
| Search Input    | `search-input`        | Input  | Search by name or SKU        |
| Category Filter | `category-filter`     | Select | Filter by category           |
| Sort Select     | `sort-select`         | Select | Sort by name/price/stock     |
| Products Table  | `products-table`      | Table  | Products listing table       |
| No Products Msg | `no-products-message` | Text   | Empty state message          |

### Dynamic Selectors (Product Rows)

| Element       | Pattern               | Description                    |
| ------------- | --------------------- | ------------------------------ |
| Product Row   | `product-row-{id}`    | Table row for specific product |
| Edit Button   | `edit-product-{id}`   | Edit button for product        |
| Delete Button | `delete-product-{id}` | Delete button for product      |

### Delete Modal

| Element         | data-testid             | Type   | Description         |
| --------------- | ----------------------- | ------ | ------------------- |
| Modal Container | `delete-modal`          | Modal  | Delete confirmation |
| Confirm Button  | `confirm-delete-button` | Button | Confirm deletion    |
| Cancel Button   | `cancel-delete-button`  | Button | Cancel deletion     |

### Category Options

- `all` - All Categories
- `Electronics`
- `Accessories`
- `Software`
- `Hardware`

### Sort Options

- `name` - Sort by Name
- `price` - Sort by Price
- `stock` - Sort by Stock

### Notes

- ✅ Dynamic selectors use consistent pattern: `{element}-{id}`
- ℹ️ Search filters by name OR SKU (case-insensitive)
- ℹ️ Filters are reactive (no submit button needed)

---

## ➕ Product Form Pages (`/products/new`, `/products/[id]`)

### Form Elements (Common to both New & Edit)

| Element           | data-testid         | Type     | Description               |
| ----------------- | ------------------- | -------- | ------------------------- |
| Form Container    | `product-form`      | Form     | Main form element         |
| SKU Input         | `sku-input`         | Input    | Product SKU               |
| Name Input        | `name-input`        | Input    | Product name              |
| Description Input | `description-input` | Textarea | Product description       |
| Category Select   | `category-input`    | Select   | Product category          |
| Price Input       | `price-input`       | Input    | Product price (number)    |
| Stock Input       | `stock-input`       | Input    | Stock quantity (number)   |
| Threshold Input   | `threshold-input`   | Input    | Low stock threshold       |
| Save Button       | `save-button`       | Button   | Submit form               |
| Cancel Button     | `cancel-button`     | Button   | Cancel and return to list |

### Page-Specific Elements

| Element            | data-testid          | Page | Description       |
| ------------------ | -------------------- | ---- | ----------------- |
| New Product Title  | `new-product-title`  | New  | "Add New Product" |
| Edit Product Title | `edit-product-title` | Edit | "Edit Product"    |

### Error Messages

**New Product Form:**

- ⚠️ Errors have NO data-testid
- Uses CSS class: `p.text-red-500.text-xs.italic`
- Located as sibling of input

**Edit Product Form:**

- ✅ Errors have data-testid
- Pattern: `{field}-error` (e.g., `sku-error`, `name-error`)

### Validation Error Messages

| Field | Error Message                  |
| ----- | ------------------------------ |
| SKU   | "SKU is required"              |
| Name  | "Name is required"             |
| Price | "Price is required"            |
| Price | "Price must be greater than 0" |
| Stock | "Stock is required"            |
| Stock | "Stock cannot be negative"     |

### Notes

- ⚠️ **Inconsistencia:** New form vs Edit form tienen diferente estructura de errores
- ✅ Solución: Dual-fallback approach en POM
- ℹ️ Category dropdown tiene 4 opciones
- ℹ️ Description es opcional

---

## 📊 Inventory Page (`/inventory`)

### Page Elements

| Element         | data-testid       | Type  | Description            |
| --------------- | ----------------- | ----- | ---------------------- |
| Page Title      | `inventory-title` | Text  | "Inventory Management" |
| Inventory Table | `inventory-table` | Table | Inventory listing      |
| Low Stock Alert | `low-stock-alert` | Alert | Yellow warning banner  |

### Dynamic Selectors (Inventory Rows)

| Element         | Pattern                | Description                     |
| --------------- | ---------------------- | ------------------------------- |
| Inventory Row   | `inventory-row-{id}`   | Table row for product           |
| Adjust Button   | `adjust-stock-{id}`    | Adjust stock button             |
| Low Stock Badge | `low-stock-badge-{id}` | "Low Stock" badge (conditional) |

### Adjust Stock Modal

| Element          | data-testid             | Type   | Description               |
| ---------------- | ----------------------- | ------ | ------------------------- |
| Modal Container  | `adjust-stock-modal`    | Modal  | Stock adjustment dialog   |
| Adjustment Input | `adjustment-input`      | Input  | Adjustment value (number) |
| Adjustment Error | `adjustment-error`      | Text   | Validation error message  |
| Confirm Button   | `confirm-adjust-button` | Button | Apply adjustment          |
| Cancel Button    | `cancel-adjust-button`  | Button | Cancel adjustment         |

### Stock Status Badges

| Status    | CSS Class       | Color  | Condition                        |
| --------- | --------------- | ------ | -------------------------------- |
| Low Stock | `bg-red-100`    | Red    | `stock <= lowStockThreshold`     |
| Medium    | `bg-yellow-100` | Yellow | `stock <= lowStockThreshold * 2` |
| In Stock  | `bg-green-100`  | Green  | `stock > lowStockThreshold * 2`  |

### Validation Error Messages

| Condition       | Error Message                 |
| --------------- | ----------------------------- |
| Empty input     | "Please enter a valid number" |
| Negative result | "Stock cannot be negative"    |

### Notes

- ✅ All main elements have data-testid
- ℹ️ Low stock alert shows count: "5 products are running low on stock"
- ℹ️ Adjustment can be positive (increase) or negative (decrease)
- ⚠️ Modal stays open on validation error (correct UX)

---

## 🧭 Navigation / Navbar

### Navbar Elements (Present on all authenticated pages)

| Element        | data-testid     | Type   | Description                 |
| -------------- | --------------- | ------ | --------------------------- |
| Navbar         | `navbar`        | Nav    | Main navigation container   |
| Logo           | `nav-logo`      | Link   | App logo/home link          |
| Dashboard Link | `nav-dashboard` | Link   | Navigate to dashboard       |
| Products Link  | `nav-products`  | Link   | Navigate to products        |
| Inventory Link | `nav-inventory` | Link   | Navigate to inventory       |
| User Name      | `user-name`     | Text   | Logged-in user display name |
| Logout Button  | `logout-button` | Button | Logout current user         |

### User Display Names

| Role         | Display Text   |
| ------------ | -------------- |
| Admin        | "Admin User"   |
| Regular User | "Regular User" |

### Notes

- ✅ Navbar identical on all authenticated pages
- ✅ Implemented as composable NavbarPage component
- ℹ️ User name is the ONLY visual difference between roles

---

## 🔔 Common Components

### Modals / Dialogs

All modals follow consistent pattern:

- Container: `{action}-modal` (e.g., `delete-modal`, `adjust-stock-modal`)
- Confirm: `confirm-{action}-button`
- Cancel: `cancel-{action}-button`

**Examples:**

```typescript
// Delete product modal
page.getByTestId('delete-modal');
page.getByTestId('confirm-delete-button');
page.getByTestId('cancel-delete-button');

// Adjust stock modal
page.getByTestId('adjust-stock-modal');
page.getByTestId('confirm-adjust-button');
page.getByTestId('cancel-adjust-button');
```

### Empty States

| Page     | data-testid           | Message             |
| -------- | --------------------- | ------------------- |
| Products | `no-products-message` | "No products found" |

---

## 📝 Selector Conventions Found

### Naming Pattern

**Format:** `{element-purpose}-{element-type}`

**Examples:**

- `email-input`
- `login-button`
- `error-message`
- `password-toggle`
- `products-title`
- `stat-total-products`

### Common Suffixes by Type

| Suffix    | Element Type   | Examples                                            |
| --------- | -------------- | --------------------------------------------------- |
| `-input`  | Input fields   | `email-input`, `sku-input`, `price-input`           |
| `-button` | Buttons        | `login-button`, `save-button`, `add-product-button` |
| `-select` | Dropdowns      | `sort-select`, `category-select`                    |
| `-modal`  | Modal dialogs  | `delete-modal`, `adjust-stock-modal`                |
| `-title`  | Headings       | `dashboard-title`, `products-title`                 |
| `-error`  | Error messages | `sku-error`, `price-error` (edit form only)         |
| `-alert`  | Alert banners  | `low-stock-alert`                                   |
| `-badge`  | Status badges  | `low-stock-badge-{id}`                              |
| `-table`  | Tables         | `products-table`, `inventory-table`                 |

### Dynamic Selector Patterns

**Products:**

- Row: `product-row-{id}`
- Edit: `edit-product-{id}`
- Delete: `delete-product-{id}`

**Inventory:**

- Row: `inventory-row-{id}`
- Adjust: `adjust-stock-{id}`
- Badge: `low-stock-badge-{id}` (only if stock is low)

---

## 🔄 Conditional Elements

### Elements that appear/disappear based on state

| Element             | data-testid            | Condition                         |
| ------------------- | ---------------------- | --------------------------------- |
| Error Message       | `error-message`        | On invalid login                  |
| Low Stock Alert     | `low-stock-alert`      | When products below threshold     |
| Low Stock Badge     | `low-stock-badge-{id}` | When product stock <= threshold   |
| No Products Message | `no-products-message`  | When search/filter has no results |
| Adjustment Error    | `adjustment-error`     | On invalid stock adjustment       |

---

## 📊 Data Formats

### Stats Cards (Dashboard)

Format: Label and value concatenated without separator

**Examples:**

- `"Total Products5"` → Extract: `5`
- `"Low Stock Items2"` → Extract: `2`
- `"Total Value$24,759.27"` → Extract: `24759.27`

**Extraction Pattern:**

```typescript
// For simple numbers
const match = text?.match(/\d+/);
const value = match ? parseInt(match[0], 10) : 0;

// For currency
const match = text?.match(/\$([0-9,]+\.?\d*)/);
const value = match ? parseFloat(match[1].replace(/,/g, '')) : 0;
```

### Date Formats

- Last Updated (Inventory): Locale date string
- Format: `MM/DD/YYYY` (US locale)

---

## ✅ Best Practices Applied

### DO:

- ✅ Use data-testid as primary selector
- ✅ Document selectors immediately when discovered
- ✅ Use helper methods in POMs for dynamic selectors
- ✅ Handle conditional elements with `isVisible()` checks
- ✅ Extract data from mixed content with regex

### DON'T:

- ❌ Rely on CSS classes that might change
- ❌ Use complex XPath expressions
- ❌ Depend on element positioning (nth-child)
- ❌ Hardcode index numbers without context
- ❌ Query DOM directly in tests (use POM methods)

---

## 🎯 Selector Stability Ranking

### Tier 1: Excellent Stability ⭐⭐⭐

- All navbar elements
- All form inputs (login, products, inventory)
- All buttons with data-testid
- All modals

### Tier 2: Good Stability ⭐⭐

- Dynamic product rows (consistent pattern)
- Dynamic inventory rows (consistent pattern)
- Stats cards (need regex extraction)

### Tier 3: Needs Caution ⭐

- Error messages in new product form (no testid)
- Conditional badges (low stock)
- Empty state messages

---

## 🔧 Special Cases & Workarounds

### 1. Error Messages in New Product Form

**Problem:** No data-testid on error elements

**Workaround:**

```typescript
// Try edit form format first
const errorWithTestId = page.getByTestId(`${field}-error`);

// Fallback to new form format
const errorLocator = inputLocator.locator('..').locator('p.text-red-500');
```

### 2. Mixed Content in Stats Cards

**Problem:** Label and value concatenated

**Solution:** Use regex extraction in POM methods

```typescript
async getTotalProducts(): Promise<number> {
  const text = await this.statTotalProducts.textContent();
  const match = text?.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}
```

### 3. Conditional Low Stock Badge

**Problem:** Badge only exists when stock is low

**Solution:** Use safe visibility check

```typescript
async hasLowStockBadge(productId: string): Promise<boolean> {
  const badge = this.getLowStockBadge(productId);
  return await badge.isVisible().catch(() => false);
}
```

---

## 📚 Reference Examples

### Complete Selector Usage Examples

**Login:**

```typescript
await page.getByTestId('email-input').fill('admin@test.com');
await page.getByTestId('password-input').fill('Admin123!');
await page.getByTestId('login-button').click();
```

**Products List:**

```typescript
await page.getByTestId('search-input').fill('Laptop');
await page.getByTestId('category-filter').selectOption('Electronics');
await page.getByTestId('sort-select').selectOption('price');
await page.getByTestId('delete-product-123').click();
await page.getByTestId('confirm-delete-button').click();
```

**Inventory:**

```typescript
await page.getByTestId('adjust-stock-456').click();
await page.getByTestId('adjustment-input').fill('10');
await page.getByTestId('confirm-adjust-button').click();
```

---

## 🚀 Quick Reference Table

### All data-testids (Alphabetical)

```
add-product-button
adjust-stock-{id}
adjust-stock-modal
adjustment-error
adjustment-input
cancel-adjust-button
cancel-button
cancel-delete-button
category-filter
category-input
confirm-adjust-button
confirm-delete-button
dashboard-title
delete-modal
delete-product-{id}
description-input
edit-product-{id}
edit-product-title
email-input
error-message
inventory-row-{id}
inventory-table
inventory-title
login-button
logout-button
low-stock-alert
low-stock-badge-{id}
name-input
nav-dashboard
nav-inventory
nav-logo
nav-products
navbar
new-product-title
no-products-message
password-input
password-toggle
price-input
product-form
product-row-{id}
products-table
products-title
save-button
search-input
sku-input
sort-select
stat-low-stock
stat-total-products
stat-total-value
stock-input
threshold-input
user-name
```

---

**Total Selectors Documented:** 50+ (including dynamic patterns)  
**Coverage:** 100% of implemented pages ✅
