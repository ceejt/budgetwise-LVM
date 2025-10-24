# Transaction Filtering & Sorting - User Guide

## Overview

The BudgetWise app now includes comprehensive filtering and sorting capabilities for both Expenses and Income sections. You can filter transactions by date range, category, amount, wallet, and search query, with the ability to save your favorite filter combinations as presets.

---

## Quick Start

### Basic Search
1. Go to **Dashboard** → **Expenses** or **Income**
2. Type in the **search bar** to filter by description
3. Results update in real-time as you type

### Change Sort Order
1. Click the **Sort dropdown** (defaults to "Date: Newest First")
2. Select your preferred sort option:
   - Date: Newest First / Oldest First
   - Amount: High to Low / Low to High
   - Category: A-Z / Z-A

### Apply Filters
1. Click the **"Filters"** button (shows badge count when filters are active)
2. Select your filter criteria in the popover:
   - **Date Range** - Choose from presets or pick custom dates
   - **Categories** - Check multiple categories
   - **Amount** - Adjust the slider for min/max amounts
   - **Wallets** - Filter by specific e-wallets
3. Click **"Apply Filters"**
4. Filter badges appear below the search bar
5. Result count updates: "Showing X of Y transactions"

---

## Features

### 1. Real-Time Search

**Location:** Search bar at the top of Expenses/Income sections

**How it works:**
- Type any text to search transaction descriptions
- Results update instantly as you type
- Case-insensitive search
- Matches partial words (e.g., "coff" finds "coffee")

**Example:**
- Search "grab" to find all Grab rides
- Search "coffee" to find all coffee purchases
- Search "amazon" to find all Amazon orders

---

### 2. Sort Options

**Location:** Dropdown next to search bar

**Available Options:**

| Sort Option | Description |
|------------|-------------|
| **Date: Newest First** | Most recent transactions first (default) |
| **Date: Oldest First** | Oldest transactions first |
| **Amount: High to Low** | Highest amounts first |
| **Amount: Low to High** | Lowest amounts first |
| **Category: A-Z** | Categories alphabetically A→Z |
| **Category: Z-A** | Categories alphabetically Z→A |

**Use Cases:**
- Find your biggest expenses: **Amount: High to Low**
- Review transactions chronologically: **Date: Oldest First**
- Group by category: **Category: A-Z**

---

### 3. Date Range Filters

**Location:** Filter popover → Date Range section

**Preset Options:**

| Preset | Description | Date Range |
|--------|-------------|------------|
| **Today** | Current day only | Today's date |
| **Last 7 Days** | Past week | 7 days ago → today |
| **This Month** | Current month | 1st of month → today |
| **Last Month** | Previous month | First day → last day of prev month |
| **This Year** | Current year | Jan 1 → today |

**Custom Range:**
- Use **"From"** and **"To"** date pickers for any custom range
- Leave one empty to filter from/to a specific date only

**Examples:**
- **Last 7 Days** - See recent spending patterns
- **Last Month** - Review previous month's budget
- **Custom: Jan 1 - Mar 31** - Q1 expenses for tax prep

---

### 4. Category Filters

**Location:** Filter popover → Categories section

**How it works:**
- Check multiple categories to filter
- Only transactions in selected categories appear
- Unchecked categories are excluded

**Use Cases:**
- Check **Food**, **Transportation** - See daily expenses
- Check **Entertainment** - Review leisure spending
- Check **Utilities**, **Bills** - Track fixed expenses

---

### 5. Amount Range Filter

**Location:** Filter popover → Amount Range section

**How it works:**
- Drag the slider handles to set min/max amounts
- Range: ₱0 to ₱10,000
- Step: ₱100 increments
- Both handles can be adjusted independently

**Use Cases:**
- **₱500 - ₱10,000** - Find large expenses
- **₱0 - ₱100** - Find small, frequent purchases
- **₱1,000 - ₱2,000** - Find mid-range transactions

---

### 6. Wallet Filters

**Location:** Filter popover → E-Wallets section

**How it works:**
- Check one or more wallets to filter
- Only transactions from selected wallets appear
- Shows wallet type, account name, and "Primary" badge

**Use Cases:**
- Check **GCash** - See GCash-only transactions
- Check **Maya** - Review Maya spending
- Check both - Compare wallet usage

---

### 7. Filter Presets

**Location:** Filter popover → Saved Filters section

**How it works:**
- Apply your desired filters and sort options
- Click **"Save Current Filters"**
- Enter a descriptive name (e.g., "Last month's food expenses")
- Click **"Save"**
- Preset appears in "Saved Filters" list

**Loading a Preset:**
1. Open filter popover
2. Click on a saved preset name
3. Filters apply instantly
4. Popover closes automatically

**Deleting a Preset:**
- Click the **X** button next to the preset name
- Confirm deletion

**Use Cases:**
- **"Monthly Food Review"** - Food category, this month
- **"Large Expenses"** - Amount over ₱1,000, all categories
- **"GCash Transactions"** - GCash wallet only
- **"Tax Prep Q1"** - Jan-Mar, all income categories

---

## Understanding the UI

### Filter Button Badge

The **"Filters"** button shows a badge count when filters are active:

```
[Filters 3]  ← 3 filters currently active
```

This helps you quickly see if filters are applied.

### Active Filter Badges

When filters are active, badges appear below the search bar:

```
[Date: 2025-10-01 to 2025-10-25] [Categories: 2 selected] [Amount: ₱0 - ₱500]
```

These show exactly which filters are applied at a glance.

### Result Count

At the bottom of the filter area:

```
Showing 15 of 247 transactions
```

- **15** = Filtered results
- **247** = Total transactions

### Clear All Filters

Click the **"Clear All"** button in the filter popover to reset all filters to default.

---

## Income Section Special Features

The **Income** section has additional smart features:

### Filtered Total vs All-Time Total

When filters are active, the display changes:

**Without Filters:**
```
Total
₱ 25,000
```

**With Filters:**
```
Filtered Total
₱ 5,000
All-time total: ₱ 25,000
```

This helps you understand the difference between filtered results and your actual total income.

---

## Tips & Best Practices

### 1. Combine Multiple Filters

Example: Find large food expenses from GCash last month
- **Date Range:** Last Month
- **Categories:** Food
- **Wallets:** GCash
- **Amount:** ₱500 - ₱10,000

### 2. Use Presets for Common Reviews

Save time by creating presets for routine tasks:
- **"Weekly Budget Check"** - Last 7 days, all categories
- **"Monthly Food Review"** - This month, Food category
- **"Quarterly Expenses"** - Last 3 months, all expenses
- **"Tax Deductibles"** - This year, Business category

### 3. Search Before Filtering

If you know part of the transaction description:
1. Start with **search** (faster)
2. Then apply **filters** if needed to narrow down further

### 4. Sort by Amount for Insights

- **High to Low** - Identify your biggest expenses
- **Low to High** - Find subscription fees and small recurring charges

### 5. Use Date Presets for Speed

Instead of picking dates manually:
- Use **"This Month"** for current month review
- Use **"Last 7 Days"** for weekly budget checks
- Use **"This Year"** for annual summaries

---

## Common Workflows

### Weekly Budget Review

1. Click **Filters**
2. Select **"Last 7 Days"** preset
3. Review spending by category
4. Sort by **Amount: High to Low** to see biggest expenses
5. Save as preset: **"Weekly Review"**

### Monthly Expense Report

1. Click **Filters**
2. Select **"This Month"** preset
3. Check **Food**, **Transportation**, **Entertainment** categories
4. Sort by **Category: A-Z**
5. Save as preset: **"Monthly Report"**

### Find a Specific Transaction

1. Use **search bar** with partial description
2. If too many results, add **date range** filter
3. Optionally filter by **category** or **amount range**

### Compare Wallet Usage

1. Click **Filters**
2. Select **"This Month"** preset
3. Check **GCash** wallet only
4. Note the total and count
5. Clear filters, repeat for **Maya**
6. Compare results

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Click search bar** | Focus search input |
| **Type in search** | Filter results in real-time |
| **Tab** | Navigate between filter inputs |
| **Enter** (in preset name) | Save preset |
| **Esc** (in popover) | Close filter popover |

---

## Troubleshooting

### "No results found"

**Possible causes:**
- Filters are too restrictive
- Date range doesn't include any transactions
- Category selected has no transactions

**Solution:**
- Click **"Clear All"** to reset filters
- Widen date range
- Remove some filters

### Preset not saving

**Possible causes:**
- Empty preset name
- Database connection issue

**Solution:**
- Enter a descriptive name
- Check internet connection
- Try again

### Filtered count seems wrong

**Possible causes:**
- Multiple filters combining with AND logic
- Search query excluding results

**Solution:**
- Check all active filters in badges
- Clear filters one by one to identify issue
- Verify search query spelling

---

## Database Notes (For Developers)

### Filter Preset Storage

Filter presets are stored in the `filter_presets` table:

```sql
CREATE TABLE filter_presets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name VARCHAR(100) NOT NULL,
  filters JSONB NOT NULL,
  sort JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Example Preset JSON

```json
{
  "filters": {
    "dateFrom": "2025-10-01",
    "dateTo": "2025-10-31",
    "categoryIds": ["uuid1", "uuid2"],
    "amountMin": 500,
    "amountMax": 5000,
    "walletIds": ["uuid3"],
    "searchQuery": "coffee"
  },
  "sort": {
    "field": "date",
    "order": "desc"
  }
}
```

---

## FAQ

### Q: Can I filter by multiple categories?
**A:** Yes! Check as many categories as you want. Results will show transactions from any of the selected categories.

### Q: Can I save multiple presets?
**A:** Yes! Save as many presets as you need. They're all stored in your account.

### Q: Do presets sync across devices?
**A:** Yes! Presets are stored in the database, so they're available on any device you log in from.

### Q: Can I edit a saved preset?
**A:** Not directly. Delete the old preset and save a new one with the same name.

### Q: What's the difference between search and filters?
**A:** Search looks only at transaction descriptions. Filters narrow down by date, category, amount, and wallet.

### Q: Can I export filtered results?
**A:** Not yet. This feature will be added in Phase 8 (Export & Reports).

### Q: Why is the amount slider limited to ₱10,000?
**A:** This is a current limitation. Future updates will make the slider dynamic based on your actual transaction amounts.

---

## Support

For issues or feature requests, please visit:
- GitHub Issues: [budgetwise-webapp/issues](https://github.com/yourusername/budgetwise-webapp/issues)
- Documentation: `PHASE6_FILTERING_SORTING.md`

---

**Last Updated:** October 25, 2025
**Version:** Phase 6 Complete
