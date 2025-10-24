-- ================================================
-- PHASE 4: Budget Tracking Enhancement
-- ================================================
-- This migration adds budget period tracking and spending comparison features
-- to the categories table, enabling budget vs actual analysis
--
-- Author: Claude Code
-- Date: 2025-10-24
-- ================================================

-- Add budget_period field to categories table
-- This allows users to set weekly, monthly, or yearly budgets per category
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS budget_period text DEFAULT 'monthly' CHECK (budget_period IN ('weekly', 'monthly', 'yearly'));

-- Add updated_at timestamp for tracking budget changes
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add description field for category notes
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS description text;

-- Add is_active field to allow soft-deletion of categories
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Create index on user_id and budget_period for faster budget queries
CREATE INDEX IF NOT EXISTS idx_categories_user_budget_period
ON public.categories(user_id, budget_period)
WHERE is_active = true;

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_categories_created_at
ON public.categories(created_at DESC);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;

CREATE TRIGGER set_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION update_categories_updated_at();

-- ================================================
-- Budget Insights View
-- ================================================
-- Create a materialized view for efficient budget vs actual calculations
-- This can be refreshed periodically to show spending insights

CREATE OR REPLACE VIEW budget_spending_summary AS
SELECT
  c.id AS category_id,
  c.user_id,
  c.name AS category_name,
  c.icon,
  c.color,
  c.budget_amount,
  c.budget_period,
  c.is_active,

  -- Weekly spending
  COALESCE(SUM(CASE
    WHEN t.type = 'expense'
    AND t.date >= CURRENT_DATE - INTERVAL '7 days'
    THEN t.amount
    ELSE 0
  END), 0) AS spent_last_7_days,

  -- Monthly spending (current month)
  COALESCE(SUM(CASE
    WHEN t.type = 'expense'
    AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
    THEN t.amount
    ELSE 0
  END), 0) AS spent_this_month,

  -- Yearly spending (current year)
  COALESCE(SUM(CASE
    WHEN t.type = 'expense'
    AND DATE_TRUNC('year', t.date) = DATE_TRUNC('year', CURRENT_DATE)
    THEN t.amount
    ELSE 0
  END), 0) AS spent_this_year,

  -- Previous period spending for comparison
  COALESCE(SUM(CASE
    WHEN t.type = 'expense'
    AND t.date >= CURRENT_DATE - INTERVAL '14 days'
    AND t.date < CURRENT_DATE - INTERVAL '7 days'
    THEN t.amount
    ELSE 0
  END), 0) AS spent_previous_7_days,

  COALESCE(SUM(CASE
    WHEN t.type = 'expense'
    AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    THEN t.amount
    ELSE 0
  END), 0) AS spent_last_month,

  -- Transaction count
  COUNT(CASE WHEN t.type = 'expense' THEN 1 END) AS total_transactions

FROM public.categories c
LEFT JOIN public.transactions t ON t.category_id = c.id
WHERE c.is_active = true
GROUP BY c.id, c.user_id, c.name, c.icon, c.color, c.budget_amount, c.budget_period, c.is_active;

-- Grant access to the view
GRANT SELECT ON budget_spending_summary TO authenticated;

-- Add RLS policy for the view (users can only see their own budget data)
ALTER VIEW budget_spending_summary SET (security_invoker = on);

-- ================================================
-- Helper Functions
-- ================================================

-- Function to calculate budget utilization percentage
CREATE OR REPLACE FUNCTION get_budget_utilization(
  p_category_id uuid,
  p_period text DEFAULT 'monthly'
)
RETURNS decimal AS $$
DECLARE
  v_budget decimal;
  v_spent decimal;
  v_utilization decimal;
BEGIN
  -- Get budget amount
  SELECT budget_amount INTO v_budget
  FROM categories
  WHERE id = p_category_id AND is_active = true;

  -- Return 0 if no budget set
  IF v_budget IS NULL OR v_budget = 0 THEN
    RETURN 0;
  END IF;

  -- Get spent amount based on period
  IF p_period = 'weekly' THEN
    SELECT spent_last_7_days INTO v_spent
    FROM budget_spending_summary
    WHERE category_id = p_category_id;
  ELSIF p_period = 'monthly' THEN
    SELECT spent_this_month INTO v_spent
    FROM budget_spending_summary
    WHERE category_id = p_category_id;
  ELSIF p_period = 'yearly' THEN
    SELECT spent_this_year INTO v_spent
    FROM budget_spending_summary
    WHERE category_id = p_category_id;
  ELSE
    RETURN 0;
  END IF;

  -- Calculate utilization percentage
  v_utilization := (COALESCE(v_spent, 0) / v_budget) * 100;

  RETURN ROUND(v_utilization, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get budget status (ok, warning, exceeded)
CREATE OR REPLACE FUNCTION get_budget_status(
  p_category_id uuid,
  p_period text DEFAULT 'monthly'
)
RETURNS text AS $$
DECLARE
  v_utilization decimal;
BEGIN
  v_utilization := get_budget_utilization(p_category_id, p_period);

  IF v_utilization >= 100 THEN
    RETURN 'exceeded';
  ELSIF v_utilization >= 90 THEN
    RETURN 'critical';
  ELSIF v_utilization >= 70 THEN
    RETURN 'warning';
  ELSE
    RETURN 'ok';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- Sample Data Update (Optional - only for existing users)
-- ================================================
-- Update existing categories to have default budget_period if needed
-- This is safe to run multiple times

COMMENT ON TABLE public.categories IS 'Expense categories with budget tracking. Each category can have weekly, monthly, or yearly budgets with spending comparison.';
COMMENT ON COLUMN public.categories.budget_period IS 'Budget period: weekly (7 days), monthly (calendar month), or yearly (calendar year)';
COMMENT ON COLUMN public.categories.budget_amount IS 'Budget limit for the selected period';
COMMENT ON COLUMN public.categories.is_active IS 'Soft delete flag - inactive categories are hidden but data is preserved';
COMMENT ON VIEW budget_spending_summary IS 'Real-time view of budget vs actual spending across all periods with comparison to previous periods';

-- ================================================
-- Completion Message
-- ================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Budget tracking migration completed successfully!';
  RAISE NOTICE '📊 New features added:';
  RAISE NOTICE '   - budget_period field (weekly/monthly/yearly)';
  RAISE NOTICE '   - budget_spending_summary view for real-time calculations';
  RAISE NOTICE '   - get_budget_utilization() function';
  RAISE NOTICE '   - get_budget_status() function';
  RAISE NOTICE '   - Indexes for performance optimization';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next steps:';
  RAISE NOTICE '   1. Update TypeScript types to include budget_period';
  RAISE NOTICE '   2. Create budget-calculator.ts utility';
  RAISE NOTICE '   3. Build budget progress bar UI component';
  RAISE NOTICE '   4. Implement budget overview dialog';
END $$;
