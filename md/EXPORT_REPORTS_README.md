# Export & Reports - Quick Start Guide

## Overview

BudgetWise now supports exporting your financial data in multiple formats with professional formatting and comprehensive reporting options.

---

## Quick Export (From UI)

### Export Transactions

1. Navigate to **Expenses** or **Income** section
2. (Optional) Apply filters to narrow down data
3. Click the **Export** button
4. Select your preferred format:
   - **CSV** - Universal compatibility
   - **Excel** - Multi-sheet workbook
   - **PDF** - Professional report
5. Choose options:
   - ☑ Apply current filters
   - ☑ Include metadata
6. Click **Export**

**Result:** File downloads automatically to your browser's download folder.

---

## Export Formats Explained

### 📄 CSV (Comma-Separated Values)

**Best for:**
- Opening in Excel, Google Sheets, or Numbers
- Importing into other applications
- Data analysis and manipulation
- Sharing with accountants

**Includes:**
- All transaction fields
- Formatted dates
- Calculated metrics
- UTF-8 encoding (supports special characters)

**File size:** ~1KB per 10 transactions

---

### 📊 Excel (.xlsx)

**Best for:**
- Professional reports
- Multiple data categories in one file
- Creating charts and pivot tables
- Advanced data analysis

**Includes:**
- **Summary Sheet** - Overview statistics
- **Transactions Sheet** - All transactions
- **Categories Sheet** - Budget information
- **Goals Sheet** - Progress tracking
- **Bills Sheet** - Payment history
- Auto-sized columns
- Formatted headers

**File size:** ~5KB per 100 transactions

---

### 📑 PDF (Portable Document Format)

**Best for:**
- Professional presentations
- Printing
- Sharing with non-technical users
- Official records

**Includes:**
- Color-coded tables
- Summary statistics boxes
- Headers and footers
- Page numbers
- Professional formatting
- Currency symbols (₱)

**File size:** ~50KB per 100 transactions

---

## Report Types

### 1. Transaction Report
Complete list of income or expenses with all details.

**Fields included:**
- Date, Type, Amount, Category, Description
- Wallet, Transfer status, Recurrence info

### 2. Monthly Summary Report
Comprehensive overview of your financial health.

**Includes:**
- Total Income, Total Expenses, Net Savings
- Savings Rate percentage
- Top expense categories
- Income sources breakdown
- Goals progress

### 3. Category Analysis Report
Deep dive into spending by category.

**Includes:**
- Total spent per category
- Transaction count
- Average transaction amount
- Budget utilization percentage
- Spending trends (increasing/decreasing/stable)
- Monthly breakdown

### 4. Goal Progress Report
Track all your financial goals.

**Includes:**
- Current vs Target amounts
- Progress percentage
- Amount remaining
- Days until deadline
- Projected completion date
- Status (active/completed/paused)

### 5. Tax Report (Structure Ready)
Organize data for tax preparation.

**Will include:**
- Income sources categorized
- Deductible expenses
- Non-deductible expenses
- Summary totals

---

## Using Filters with Exports

Filters allow you to export specific subsets of data.

### Available Filters:

1. **Date Range** - Export transactions from specific period
2. **Categories** - Include only selected categories
3. **Amount Range** - Filter by transaction amount
4. **Wallets** - Export from specific e-wallets only
5. **Search** - Filter by description keywords

### Example Use Cases:

**Food expenses for January:**
1. Set date range: Jan 1 - Jan 31
2. Select category: Food
3. Export → Apply filters ✓

**Large transactions over ₱5,000:**
1. Set amount minimum: 5000
2. Export → Apply filters ✓

**All GCash transactions:**
1. Select wallet: GCash
2. Export → Apply filters ✓

---

## Time Periods

### Pre-set Periods:
- **Today** - Current day only
- **This Week** - Last 7 days
- **This Month** - Current month to date
- **Last Month** - Full previous month
- **This Year** - Year to date
- **Last Year** - Full previous year

### Custom Range:
Pick any start and end date using the calendar picker.

---

## Export Options Explained

### Apply Current Filters
- ✅ **Checked** - Export only filtered data
- ❌ **Unchecked** - Export all data (ignore filters)

**Use when:** You want to export a specific subset of transactions

### Include Metadata
- ✅ **Checked** - Add summary statistics, totals, generation date
- ❌ **Unchecked** - Raw data only

**Use when:** You want context and summaries in your export

---

## File Naming Convention

Exports are automatically named based on content and date:

```
Format: [type]_[date].extension

Examples:
- expenses_2025-01-25.csv
- income_2025-01-25.xlsx
- monthly_summary_2025-01-25.pdf
- transactions_2025-01-25.csv
```

**Pro tip:** Rename files after download for better organization!

---

## Common Questions

### Q: Can I export all my data at once?
**A:** Yes! Use the **Complete Report** option in the Report Builder. This creates an Excel file with multiple sheets containing all your financial data.

### Q: How do I open CSV files properly in Excel?
**A:**
1. Open Excel
2. Go to Data → Get Data → From File → From Text/CSV
3. Select your CSV file
4. Choose "UTF-8" encoding
5. Click Load

### Q: Why is my PDF export taking a long time?
**A:** PDF generation is done in your browser and can be slow for large datasets (>5,000 transactions). Consider using CSV or Excel for large exports, or apply filters to reduce data size.

### Q: Can I schedule automatic exports?
**A:** Not yet! This feature is planned for a future update. You can manually export as often as needed.

### Q: Are my exports secure?
**A:** Yes! Exports are generated entirely in your browser. No data is sent to external servers. However, the exported files contain sensitive financial information, so store them securely.

### Q: Can I customize the export format?
**A:** The export formats are standardized for consistency. However, once exported, you can open the files in Excel/Google Sheets and customize as needed.

---

## Tips & Best Practices

### 💡 Monthly Routine
Export a monthly summary PDF at the end of each month for your records.

### 💡 Tax Preparation
Export transactions for the tax year in Excel format. Use filters to separate deductible vs non-deductible expenses.

### 💡 Budget Review
Export category analysis quarterly to review spending patterns and adjust budgets.

### 💡 Sharing with Advisors
Use PDF format when sharing with financial advisors - it's professional and can't be accidentally modified.

### 💡 Backup Your Data
Export a complete Excel report monthly as a backup of your financial data.

### 💡 Goal Tracking
Export goal progress reports when reviewing your financial goals (monthly or quarterly).

---

## Troubleshooting

### Export button not visible
- Ensure you're logged in
- Refresh the page
- Check browser console for errors

### Download doesn't start
- Check browser pop-up blocker settings
- Ensure JavaScript is enabled
- Try a different browser

### PDF looks wrong when printed
- Use "Fit to page" in print settings
- Select "Portrait" orientation
- Ensure margins are set to "Default"

### Excel file shows "#####" in cells
- Column is too narrow
- Double-click column border to auto-fit
- Or manually drag column wider

### CSV shows garbled characters
- Open using "Import from Text/CSV" in Excel
- Select "UTF-8" encoding
- Or use Google Sheets which auto-detects encoding

---

## Keyboard Shortcuts

Currently, exports are triggered via button clicks. Keyboard shortcuts may be added in future updates.

---

## What's Next?

### Planned Features:
- 📧 Email export delivery
- 📅 Scheduled automatic exports
- ☁️ Cloud storage integration (Google Drive, Dropbox)
- 📊 Charts in PDF reports
- 🎨 Custom report templates
- 🔄 Batch export multiple reports

---

## Support

If you encounter issues with exports:
1. Check the troubleshooting section above
2. Ensure your browser is up to date
3. Try the export in an incognito/private window
4. Check browser console for error messages

For additional help, refer to `PHASE8_EXPORT_REPORTS.md` for technical details.

---

## Example Workflows

### Workflow 1: Monthly Financial Review
```
1. Set filter: Last Month
2. Generate → Monthly Summary Report → PDF
3. Review income vs expenses
4. Export → Category Analysis → Excel
5. Analyze spending trends
6. Adjust budgets as needed
```

### Workflow 2: Tax Preparation
```
1. Set filter: Last Year (Jan 1 - Dec 31)
2. Export all transactions → Excel
3. In Excel, filter by category
4. Separate deductible expenses
5. Calculate totals
6. Share with accountant
```

### Workflow 3: Goal Progress Check
```
1. Navigate to Goals section (when available)
2. Export → Goal Progress Report → PDF
3. Review each goal's status
4. Celebrate completed goals!
5. Adjust contribution amounts
```

---

**Happy Exporting! 📊**
