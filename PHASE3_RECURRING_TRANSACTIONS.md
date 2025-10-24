# Phase 3: Recurring Transactions Implementation

## Overview

This document details the complete implementation of recurring transactions feature in BudgetWise, allowing users to create, manage, and automatically process recurring income and expenses.

## Features Implemented

### 1. Database Schema Enhancement

**File:** `scripts/004_add_recurring_transactions.sql`

Added the following fields to the `transactions` table:
- `is_recurring` (boolean) - Indicates if transaction is part of a recurring series
- `recurrence_pattern` (text) - Pattern for recurrence: daily, weekly, biweekly, monthly, yearly
- `recurrence_end_date` (date) - Optional end date for the recurring series
- `parent_transaction_id` (uuid) - Links child occurrences to parent template
- `is_template` (boolean) - Marks the template transaction (parent)
- `next_occurrence_date` (date) - Date when next occurrence should be generated
- `recurrence_enabled` (boolean) - Whether the recurring series is active (can be paused)

**Database Functions Created:**
- `calculate_next_occurrence()` - Calculates next occurrence date based on pattern
- `generate_recurring_transaction()` - Creates the next occurrence of a recurring transaction
- `process_due_recurring_transactions()` - Processes all due recurring transactions

**Views Created:**
- `recurring_transaction_templates` - View for active recurring templates with occurrence counts

### 2. TypeScript Types

**File:** `lib/types.ts`

Added `RecurrencePattern` type and extended `Transaction` interface:
```typescript
export type RecurrencePattern = "daily" | "weekly" | "biweekly" | "monthly" | "yearly"

export interface Transaction {
  // ... existing fields
  is_recurring?: boolean
  recurrence_pattern?: RecurrencePattern | null
  recurrence_end_date?: string | null
  parent_transaction_id?: string | null
  is_template?: boolean
  next_occurrence_date?: string | null
  recurrence_enabled?: boolean
}
```

### 3. User Interface Components

#### A. Enhanced Add Transaction Dialog

**File:** `components/dashboard/add-transaction-dialog.tsx`

**Features:**
- Checkbox to enable recurring transaction
- Frequency selector (daily, weekly, biweekly, monthly, yearly)
- Optional end date setting
- Visual feedback showing recurrence summary
- Automatic calculation of next occurrence date

**Usage:**
```tsx
<AddTransactionDialog userId={userId} type="expense" onSuccess={fetchExpenses} />
```

#### B. Recurring Transactions Management Dialog

**File:** `components/dashboard/recurring-transactions-dialog.tsx`

**Features:**
- List all active recurring transactions
- Pause/Resume recurring series
- Delete recurring transactions (with confirmation)
- View occurrence details (next date, frequency, category)
- Visual status indicators (active/paused)
- Display occurrence count and history

**Usage:**
```tsx
<RecurringTransactionsDialog userId={userId} onSuccess={fetchTransactions} />
```

### 4. Recurring Transaction Detector

**File:** `lib/utils/recurring-detector.ts`

**Features:**
- Analyzes transaction history to detect patterns
- Identifies transactions with similar amounts, categories, and intervals
- Calculates confidence scores (0-100%)
- Suggests recurring patterns to users

**Algorithm:**
- Groups similar transactions (same amount ±5%, same category, same type)
- Calculates intervals between transactions
- Matches intervals against known patterns (daily, weekly, biweekly, monthly, yearly)
- Requires minimum 3 occurrences for pattern detection
- Provides 70% consistency threshold for pattern matching

**Usage:**
```typescript
import { RecurringDetector, getRecurringSuggestions } from "@/lib/utils/recurring-detector"

// Get suggestions for a user
const suggestions = await getRecurringSuggestions(userId, supabase)

// Format suggestion message
const message = RecurringDetector.formatSuggestion(suggestions[0])
// "We noticed ₱500.00 every month for "Netflix". Make this recurring? (85% confidence)"
```

### 5. Supabase Edge Function

**File:** `supabase/functions/process-recurring/index.ts`

**Features:**
- Processes all due recurring transactions
- Creates new transaction occurrences
- Updates next occurrence dates
- Handles expired recurring series
- Provides detailed processing results

**Endpoint:** `POST /functions/v1/process-recurring`

**Response Format:**
```json
{
  "processed": 10,
  "created": 8,
  "errors": 2,
  "details": [
    {
      "templateId": "uuid",
      "newTransactionId": "uuid"
    }
  ]
}
```

### 6. Automated Processing

**File:** `.github/workflows/process-recurring.yml`

**Schedule:** Daily at 1:00 AM UTC (9:00 AM PHT)

GitHub Actions workflow that:
- Runs automatically every day
- Calls the Edge Function to process recurring transactions
- Can be manually triggered via workflow_dispatch

## Setup Instructions

### 1. Database Migration

Run the migration script in Supabase SQL Editor:

```bash
# Using Supabase CLI
supabase db push

# Or manually execute
psql -f scripts/004_add_recurring_transactions.sql
```

### 2. Deploy Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy process-recurring

# Set environment variables
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Configure GitHub Actions

Add the following secrets to your GitHub repository:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key

Navigate to: Repository Settings → Secrets and variables → Actions

### 4. Manual Processing (Optional)

For testing or manual execution:

```bash
# Call the Edge Function directly
curl -X POST "https://your-project.supabase.co/functions/v1/process-recurring" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

## User Workflow

### Creating a Recurring Transaction

1. Click "Add Items" in Expenses or Income section
2. Fill in transaction details (amount, category, description, date)
3. Check "This is a recurring transaction"
4. Select frequency (daily, weekly, biweekly, monthly, yearly)
5. Optionally set an end date
6. Click "Add" to create the recurring transaction

### Managing Recurring Transactions

1. Click "Manage Recurring" button in Expenses section
2. View all active recurring transactions
3. Pause a recurring series (stops generating new occurrences)
4. Resume a paused series
5. Delete a recurring series (removes template and future occurrences)

### Auto-Detection (Future Enhancement)

The detector utility is implemented but not yet integrated into the UI. To integrate:

1. Add a "Detect Patterns" button to the dashboard
2. Call `getRecurringSuggestions()` to analyze transactions
3. Display suggestions to user in a dialog
4. Allow user to convert suggested patterns to recurring transactions

## Technical Details

### Recurrence Calculation Logic

```typescript
// Daily: Add 1 day
date.setDate(date.getDate() + 1)

// Weekly: Add 7 days
date.setDate(date.getDate() + 7)

// Biweekly: Add 14 days
date.setDate(date.getDate() + 14)

// Monthly: Add 1 month (handles month-end correctly)
date.setMonth(date.getMonth() + 1)

// Yearly: Add 1 year
date.setFullYear(date.getFullYear() + 1)
```

### Template vs Occurrence

- **Template (Parent)**: The original recurring transaction with `is_template=true`
- **Occurrence (Child)**: Generated transaction with `parent_transaction_id` pointing to template

Only templates have:
- `recurrence_pattern`
- `recurrence_end_date`
- `next_occurrence_date`
- `recurrence_enabled`

### Pausing vs Deleting

- **Pause**: Sets `recurrence_enabled=false`, keeps template and past occurrences
- **Delete**: Removes template and all future occurrences (CASCADE delete)

## Testing Checklist

- [ ] Create a daily recurring expense
- [ ] Create a monthly recurring income
- [ ] Set an end date for a recurring transaction
- [ ] Pause and resume a recurring transaction
- [ ] Delete a recurring transaction
- [ ] Verify Edge Function processes transactions correctly
- [ ] Check GitHub Actions runs successfully
- [ ] Verify occurrences link to parent templates
- [ ] Test expired recurring transactions (auto-disable)
- [ ] Verify RLS policies work correctly

## Performance Considerations

1. **Indexes Created:**
   - `idx_transactions_recurring` - Fast lookup of active recurring templates
   - `idx_transactions_parent` - Efficient parent-child queries
   - `idx_transactions_next_occurrence` - Quick filtering of due transactions

2. **Query Optimization:**
   - Edge Function only fetches due templates (filtered by `next_occurrence_date`)
   - View `recurring_transaction_templates` pre-aggregates occurrence counts

3. **Batch Processing:**
   - Edge Function processes all due transactions in a single run
   - GitHub Actions runs once daily (not per-user)

## Future Enhancements

1. **Auto-Detection UI:**
   - Add "Smart Suggestions" section to dashboard
   - Display detected patterns with confidence scores
   - One-click conversion to recurring transactions

2. **Occurrence Management:**
   - Skip a single occurrence
   - Edit a single occurrence (without affecting series)
   - View full occurrence history

3. **Advanced Patterns:**
   - Last day of month
   - Specific weekday (e.g., every Monday)
   - Custom intervals (e.g., every 3 months)

4. **Notifications:**
   - Email reminders before recurring charges
   - Push notifications for created occurrences
   - Warnings when recurring expenses exceed budget

5. **Analytics:**
   - Show total recurring expenses per month
   - Compare recurring vs one-time expenses
   - Predict future spending based on recurring patterns

## Troubleshooting

### Edge Function Not Creating Transactions

1. Check function logs: `supabase functions logs process-recurring`
2. Verify environment variables are set
3. Check RLS policies allow service role to insert

### GitHub Actions Failing

1. Verify secrets are set correctly
2. Check workflow logs in Actions tab
3. Ensure Supabase URL and API key are valid

### Next Occurrence Not Updating

1. Check if `next_occurrence_date` is in the past
2. Verify Edge Function ran successfully
3. Manually call `generate_recurring_transaction()` function

## Support

For issues or questions:
1. Check Supabase logs
2. Review GitHub Actions workflow runs
3. Check database function execution: `SELECT * FROM process_due_recurring_transactions()`

## License

This feature is part of BudgetWise, an open-source budget tracking application.
