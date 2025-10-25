-- =====================================================
-- Phase 8: Export & Reports - Database Schema
-- =====================================================
-- This migration adds support for export presets and reporting
-- Features:
-- - Export preset storage for quick re-use
-- - Report scheduling capabilities
-- - Export history tracking
-- =====================================================

-- Create export_presets table
CREATE TABLE IF NOT EXISTS export_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,

  -- Export configuration
  report_type VARCHAR(50) NOT NULL CHECK (
    report_type IN ('monthly_summary', 'category_analysis', 'goal_progress', 'tax_report', 'transactions')
  ),
  format VARCHAR(10) NOT NULL CHECK (format IN ('csv', 'xlsx', 'pdf')),
  options JSONB NOT NULL DEFAULT '{}',

  -- Scheduling (future feature)
  is_scheduled BOOLEAN DEFAULT FALSE,
  schedule_frequency VARCHAR(20) CHECK (
    schedule_frequency IN ('daily', 'weekly', 'monthly') OR schedule_frequency IS NULL
  ),
  last_generated_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create export_history table for tracking exports
CREATE TABLE IF NOT EXISTS export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preset_id UUID REFERENCES export_presets(id) ON DELETE SET NULL,

  -- Export details
  report_type VARCHAR(50) NOT NULL,
  format VARCHAR(10) NOT NULL,
  file_size_bytes INTEGER,
  record_count INTEGER,

  -- Date range exported
  date_from DATE,
  date_to DATE,

  -- Status
  status VARCHAR(20) DEFAULT 'completed' CHECK (
    status IN ('completed', 'failed', 'cancelled')
  ),
  error_message TEXT,

  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_export_presets_user_id ON export_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_export_presets_report_type ON export_presets(report_type);
CREATE INDEX IF NOT EXISTS idx_export_presets_scheduled ON export_presets(is_scheduled) WHERE is_scheduled = TRUE;

CREATE INDEX IF NOT EXISTS idx_export_history_user_id ON export_history(user_id);
CREATE INDEX IF NOT EXISTS idx_export_history_generated_at ON export_history(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_export_history_preset_id ON export_history(preset_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_export_presets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_export_presets_updated_at
  BEFORE UPDATE ON export_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_export_presets_updated_at();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE export_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

-- Export Presets Policies
CREATE POLICY "Users can view their own export presets"
  ON export_presets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own export presets"
  ON export_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own export presets"
  ON export_presets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own export presets"
  ON export_presets FOR DELETE
  USING (auth.uid() = user_id);

-- Export History Policies
CREATE POLICY "Users can view their own export history"
  ON export_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own export history"
  ON export_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Helpful Database Views for Reporting
-- =====================================================

-- View: Monthly summary data
CREATE OR REPLACE VIEW monthly_transaction_summary AS
SELECT
  t.user_id,
  DATE_TRUNC('month', t.date::date) AS month,

  -- Income totals
  SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) AS total_income,
  COUNT(CASE WHEN t.type = 'income' THEN 1 END) AS income_count,

  -- Expense totals
  SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS total_expenses,
  COUNT(CASE WHEN t.type = 'expense' THEN 1 END) AS expense_count,

  -- Net calculations
  SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END) AS net_savings,

  -- Transaction count
  COUNT(*) AS total_transactions

FROM transactions t
WHERE t.is_template IS NOT TRUE  -- Exclude recurring templates
GROUP BY t.user_id, DATE_TRUNC('month', t.date::date);

-- View: Category spending breakdown
CREATE OR REPLACE VIEW category_spending_breakdown AS
SELECT
  t.user_id,
  t.category_id,
  c.name AS category_name,
  c.icon AS category_icon,
  c.color AS category_color,
  c.budget_amount,

  -- This month
  SUM(CASE
    WHEN t.date::date >= DATE_TRUNC('month', CURRENT_DATE)::date
    THEN t.amount
    ELSE 0
  END) AS spent_this_month,

  -- Last month
  SUM(CASE
    WHEN t.date::date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::date
    AND t.date::date < DATE_TRUNC('month', CURRENT_DATE)::date
    THEN t.amount
    ELSE 0
  END) AS spent_last_month,

  -- This year
  SUM(CASE
    WHEN t.date::date >= DATE_TRUNC('year', CURRENT_DATE)::date
    THEN t.amount
    ELSE 0
  END) AS spent_this_year,

  -- All time
  SUM(t.amount) AS spent_all_time,
  COUNT(*) AS transaction_count,
  AVG(t.amount) AS average_transaction

FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.type = 'expense'
  AND t.is_template IS NOT TRUE
GROUP BY t.user_id, t.category_id, c.name, c.icon, c.color, c.budget_amount;

-- View: Income sources breakdown
CREATE OR REPLACE VIEW income_sources_breakdown AS
SELECT
  t.user_id,
  t.category_id,
  c.name AS category_name,

  -- This month
  SUM(CASE
    WHEN t.date::date >= DATE_TRUNC('month', CURRENT_DATE)::date
    THEN t.amount
    ELSE 0
  END) AS received_this_month,

  -- Last month
  SUM(CASE
    WHEN t.date::date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::date
    AND t.date::date < DATE_TRUNC('month', CURRENT_DATE)::date
    THEN t.amount
    ELSE 0
  END) AS received_last_month,

  -- This year
  SUM(CASE
    WHEN t.date::date >= DATE_TRUNC('year', CURRENT_DATE)::date
    THEN t.amount
    ELSE 0
  END) AS received_this_year,

  -- All time
  SUM(t.amount) AS received_all_time,
  COUNT(*) AS transaction_count,
  AVG(t.amount) AS average_amount

FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.type = 'income'
  AND t.is_template IS NOT TRUE
GROUP BY t.user_id, t.category_id, c.name;

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to log export history
CREATE OR REPLACE FUNCTION log_export_history(
  p_user_id UUID,
  p_preset_id UUID,
  p_report_type VARCHAR,
  p_format VARCHAR,
  p_record_count INTEGER,
  p_date_from DATE,
  p_date_to DATE
) RETURNS UUID AS $$
DECLARE
  v_history_id UUID;
BEGIN
  INSERT INTO export_history (
    user_id,
    preset_id,
    report_type,
    format,
    record_count,
    date_from,
    date_to,
    status
  ) VALUES (
    p_user_id,
    p_preset_id,
    p_report_type,
    p_format,
    p_record_count,
    p_date_from,
    p_date_to,
    'completed'
  ) RETURNING id INTO v_history_id;

  RETURN v_history_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION log_export_history TO authenticated;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE export_presets IS 'Stores user-defined export configurations for quick re-use';
COMMENT ON TABLE export_history IS 'Tracks export generation history for auditing and analytics';
COMMENT ON VIEW monthly_transaction_summary IS 'Monthly rollup of income, expenses, and savings';
COMMENT ON VIEW category_spending_breakdown IS 'Detailed breakdown of spending by category across time periods';
COMMENT ON VIEW income_sources_breakdown IS 'Detailed breakdown of income by category across time periods';
