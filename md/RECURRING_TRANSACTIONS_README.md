# Recurring Transactions - Quick Start Guide

## What's Been Implemented

Phase 3 of the BudgetWise implementation plan is now complete! Users can now:

- ✅ Create recurring income and expenses
- ✅ Choose from 5 frequency patterns (daily, weekly, biweekly, monthly, yearly)
- ✅ Set optional end dates or run indefinitely
- ✅ Pause and resume recurring series
- ✅ Delete recurring transactions
- ✅ Automatic processing via Supabase Edge Functions
- ✅ Smart pattern detection algorithm (ready to integrate)

## Quick Setup (3 Steps)

### 1. Run Database Migration

```bash
# Copy the SQL from scripts/004_add_recurring_transactions.sql
# Paste and run in Supabase SQL Editor
# OR use Supabase CLI:
supabase db push
```

### 2. Deploy Edge Function

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login and link to your project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
cd supabase/functions/process-recurring
supabase functions deploy process-recurring

# Set environment variables
supabase secrets set SUPABASE_URL=your_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
```

### 3. Configure GitHub Actions (Optional)

Add these secrets to your GitHub repository:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

The workflow will automatically run daily at 9 AM PHT.

## Files Created/Modified

### New Files
```
scripts/004_add_recurring_transactions.sql
components/dashboard/recurring-transactions-dialog.tsx
lib/utils/recurring-detector.ts
supabase/functions/process-recurring/index.ts
.github/workflows/process-recurring.yml
PHASE3_RECURRING_TRANSACTIONS.md
```

### Modified Files
```
lib/types.ts (added RecurrencePattern and recurring fields)
components/dashboard/add-transaction-dialog.tsx (added recurring UI)
components/dashboard/expenses-section.tsx (added management button)
```

## User Guide

### Creating a Recurring Transaction

1. Go to Dashboard → Expenses or Income section
2. Click "Add Items"
3. Fill in the transaction details
4. Check ☑️ "This is a recurring transaction"
5. Select frequency: Daily, Weekly, Biweekly, Monthly, or Yearly
6. (Optional) Check "Set end date" and choose when to stop
7. Click "Add"

### Managing Recurring Transactions

1. Go to Dashboard → Expenses section
2. Click "Manage Recurring" button
3. View all your recurring transactions
4. Use the buttons to:
   - **Pause**: Temporarily stop creating new occurrences
   - **Resume**: Restart a paused recurring transaction
   - **Delete**: Permanently remove the recurring series

## How It Works

### Architecture

```
User creates recurring transaction
        ↓
Saved as "template" with is_template=true
        ↓
GitHub Actions runs daily (9 AM PHT)
        ↓
Calls Supabase Edge Function
        ↓
Function checks all templates with next_occurrence_date <= today
        ↓
Creates new transaction "occurrence" for each due template
        ↓
Updates next_occurrence_date for next run
```

### Key Concepts

**Template Transaction:**
- The original recurring transaction
- Has `is_template=true` and `is_recurring=true`
- Stores the recurrence pattern and settings
- Never shows up in regular transaction lists

**Occurrence Transaction:**
- Auto-generated transaction from template
- Has `parent_transaction_id` pointing to template
- Shows up in regular expenses/income
- Can be edited/deleted independently

## Testing

### Manual Test (Without Waiting for Scheduler)

```bash
# Test the Edge Function immediately
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/process-recurring" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Test Checklist

- [ ] Create a recurring expense with monthly frequency
- [ ] Verify template is saved in database
- [ ] Wait for scheduled run (or trigger manually)
- [ ] Check that new occurrence was created
- [ ] Verify next_occurrence_date was updated
- [ ] Pause the recurring transaction
- [ ] Verify no new occurrences are created while paused
- [ ] Resume and verify occurrences resume
- [ ] Delete recurring transaction
- [ ] Verify template and future occurrences are removed

## Advanced Features

### Pattern Detection (Not Yet in UI)

The detector utility can analyze existing transactions and suggest recurring patterns:

```typescript
import { getRecurringSuggestions } from "@/lib/utils/recurring-detector"

const suggestions = await getRecurringSuggestions(userId, supabase)
// Returns patterns like:
// "We noticed ₱500.00 every month for 'Netflix'. Make this recurring? (85% confidence)"
```

To integrate into UI:
1. Add a "Detect Patterns" button to dashboard
2. Show suggestions in a dialog
3. Allow one-click conversion to recurring transactions

### Database Functions

You can also call database functions directly:

```sql
-- Process a single template
SELECT generate_recurring_transaction('template-uuid');

-- Process all due templates
SELECT * FROM process_due_recurring_transactions();

-- View all active templates
SELECT * FROM recurring_transaction_templates;
```

## Troubleshooting

### Occurrences Not Being Created

1. **Check Edge Function logs:**
   ```bash
   supabase functions logs process-recurring
   ```

2. **Verify next_occurrence_date:**
   ```sql
   SELECT id, description, next_occurrence_date, recurrence_enabled
   FROM transactions
   WHERE is_recurring = true AND is_template = true;
   ```

3. **Manually trigger function:**
   ```bash
   curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/process-recurring" \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

### GitHub Actions Not Running

1. Check workflow file is in `.github/workflows/process-recurring.yml`
2. Verify repository secrets are set (Settings → Secrets and variables → Actions)
3. Check Actions tab for error logs
4. Manually trigger: Actions → Process Recurring Transactions → Run workflow

### Database Issues

```sql
-- Check if columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'transactions'
  AND column_name IN ('is_recurring', 'recurrence_pattern', 'next_occurrence_date');

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'transactions';
```

## Performance Notes

- Indexes added for fast lookups: `idx_transactions_recurring`, `idx_transactions_parent`, `idx_transactions_next_occurrence`
- Edge Function only processes due templates (filtered query)
- View `recurring_transaction_templates` pre-aggregates counts
- One daily run processes all users (efficient batch processing)

## Next Steps

1. ✅ Deploy database migration
2. ✅ Deploy Edge Function
3. ✅ Configure GitHub Actions
4. 🔜 Integrate pattern detection UI
5. 🔜 Add occurrence editing (skip/modify single occurrence)
6. 🔜 Add email notifications
7. 🔜 Add recurring transaction analytics

## Full Documentation

See `PHASE3_RECURRING_TRANSACTIONS.md` for complete technical documentation.

## Support

- Database issues: Check Supabase Dashboard → SQL Editor
- Function issues: Check Supabase Dashboard → Edge Functions → Logs
- GitHub Actions: Check repository Actions tab
- RLS issues: Verify user permissions in Supabase Dashboard → Authentication

---

**Status:** ✅ Phase 3 Implementation Complete

All core recurring transaction functionality is implemented and ready to use!
