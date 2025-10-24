# Budget Tracking Feature - Quick Start Guide

## 🚀 Quick Setup (3 Steps)

### 1. Run Database Migration

Open Supabase SQL Editor and run:
```bash
scripts/005_add_budget_tracking.sql
```

**OR** using Supabase CLI:
```bash
supabase db push
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test the Feature

1. Navigate to dashboard
2. Look for "Budget Tracking" card in Goals section
3. Add some expenses to categories with budgets
4. Watch the progress bars update in real-time
5. Click "View All" to see the Budget Overview dialog

---

## ✨ What You Get

### Visual Budget Tracking
- **Color-coded progress bars**: Green → Yellow → Orange → Red
- **Real-time calculations**: Updates as you add transactions
- **Three time periods**: Weekly, Monthly, Yearly budgets

### Smart Alerts
- **Dashboard warnings** when approaching limits (70%, 90%)
- **Critical alerts** when exceeding budgets
- **Dismissible** with localStorage persistence

### Intelligent Insights
- **Spending trends**: "↑15% vs last month"
- **Actionable tips**: "You can spend ₱150/day for the rest of this month"
- **Positive reinforcement**: "Great job! You're spending 30% less on Transport"

### Comprehensive Overview
- **Budget health dashboard** with summary cards
- **Per-category breakdown** with progress bars
- **Period filtering** (weekly/monthly/yearly)
- **Trend comparisons** vs previous periods

---

## 📊 How It Works

```
User adds transaction →
  Budget calculator runs →
    Compares spent vs budget →
      Updates progress bars →
        Shows alerts if needed
```

**Example:**
1. You set a monthly Food budget of ₱2,000
2. You add ₱500 in food expenses
3. Progress bar shows 25% (green)
4. Insight: "You can spend ₱68/day for the rest of this month"
5. You add more expenses...
6. At ₱1,400 (70%), status turns yellow with warning
7. At ₱1,800 (90%), status turns orange and alert shows
8. At ₱2,100 (105%), status turns red with "EXCEEDED" alert

---

## 🎨 UI Components

### Budget Progress Bar
```tsx
import { BudgetProgressBar } from "@/components/ui/budget-progress-bar"

<BudgetProgressBar
  spent={1500}
  budget={2000}
  utilization={75}
  status="warning"
  categoryName="Food"
  showLabels={true}
  showPercentage={true}
  showAmounts={true}
  comparisonText="↑10% vs last month"
/>
```

### Budget Overview Dialog
```tsx
import { BudgetOverviewDialog } from "@/components/dashboard/budget-overview-dialog"

<BudgetOverviewDialog userId={user.id} />
```

### Budget Alerts
```tsx
import { BudgetAlerts } from "@/components/dashboard/budget-alerts"

<BudgetAlerts userId={user.id} />
```

---

## 🔧 Customization

### Change Color Thresholds

Edit `lib/utils/budget-calculator.ts`:

```typescript
export function getBudgetStatus(utilization: number): BudgetStatus {
  if (utilization >= 100) return "exceeded"
  if (utilization >= 90) return "critical"  // Change this
  if (utilization >= 70) return "warning"   // Change this
  return "ok"
}
```

### Modify Suggestions

Edit `generateSuggestion()` in `budget-calculator.ts`:

```typescript
export function generateSuggestion(
  categoryName: string,
  utilization: number,
  amountRemaining: number,
  period: BudgetPeriod,
  change: number
): string | undefined {
  // Add your custom logic here
  if (utilization >= 100) {
    return `Custom message for ${categoryName}`
  }
  // ...
}
```

### Add New Insight Types

1. Update `BudgetInsight` type in `lib/types.ts`
2. Add calculation in `calculateBudgetInsight()`
3. Update UI components to display new data

---

## 📈 Advanced Usage

### Programmatic Budget Calculations

```typescript
import { calculateBudgetInsight } from "@/lib/utils/budget-calculator"

const insight = calculateBudgetInsight(category, transactions)
console.log(insight)
// {
//   category_id: "...",
//   category_name: "Food",
//   status: "warning",
//   utilization_percentage: 75.5,
//   amount_spent: 1510,
//   amount_remaining: 490,
//   budget_amount: 2000,
//   period: "monthly",
//   comparison_text: "↑10% vs last month",
//   suggestion: "Only ₱490 left in your Food budget..."
// }
```

### Batch Insights

```typescript
import { calculateAllBudgetInsights } from "@/lib/utils/budget-calculator"

const insights = calculateAllBudgetInsights(categories, transactions)
// Returns array sorted by priority (exceeded first)
```

### Budget Health Summary

```typescript
import { calculateBudgetHealth } from "@/lib/utils/budget-calculator"

const health = calculateBudgetHealth(insights)
console.log(health)
// {
//   total_budget: 5000,
//   total_spent: 4200,
//   total_remaining: 800,
//   overall_utilization: 84,
//   categories_on_track: 3,
//   categories_warning: 2,
//   categories_critical: 1,
//   categories_exceeded: 1
// }
```

---

## 🐛 Troubleshooting

### "Column does not exist" error
**Solution:** Run the database migration `scripts/005_add_budget_tracking.sql`

### Progress bars show 0% but I have transactions
**Solution:** Make sure:
1. Category has `budget_amount > 0`
2. Transactions have matching `category_id`
3. Transactions are type `expense`
4. Check browser console for errors

### Alerts not showing
**Solution:**
1. Clear localStorage: `localStorage.removeItem('dismissedBudgetAlerts')`
2. Make sure at least one category is ≥70% utilized
3. Check that `BudgetAlerts` component is rendered in dashboard

### TypeScript errors
**Solution:**
```bash
# Run type check
npx tsc --noEmit

# Common fix: ensure demo data has new fields
budget_period: "monthly",
is_active: true,
```

---

## 📚 Documentation

- **Full Implementation Guide**: See `PHASE4_BUDGET_TRACKING.md`
- **API Reference**: Check JSDoc comments in `lib/utils/budget-calculator.ts`
- **Component Props**: See TypeScript interfaces in component files

---

## 🤝 Contributing

When adding features:

1. Follow existing patterns in `budget-calculator.ts`
2. Add TypeScript types to `lib/types.ts`
3. Update documentation
4. Test with demo data
5. Check TypeScript compilation: `npx tsc --noEmit`

---

## 📞 Support

- **Implementation Details**: Read `PHASE4_BUDGET_TRACKING.md`
- **Known Issues**: Check `issuesToFix.md`
- **Code Examples**: Look at existing components

---

**Built with [Claude Code](https://claude.com/claude-code)** ✨
