-- Migration: Add Filter Presets Table
-- Description: Create table to store user-defined filter presets for transactions
-- Date: 2025-10-25

-- Create filter_presets table
CREATE TABLE IF NOT EXISTS filter_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_filter_presets_user_id ON filter_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_filter_presets_created_at ON filter_presets(created_at DESC);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_filter_presets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_filter_presets_updated_at
  BEFORE UPDATE ON filter_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_filter_presets_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE filter_presets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own filter presets
CREATE POLICY "Users can view own filter presets"
  ON filter_presets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own filter presets
CREATE POLICY "Users can insert own filter presets"
  ON filter_presets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own filter presets
CREATE POLICY "Users can update own filter presets"
  ON filter_presets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own filter presets
CREATE POLICY "Users can delete own filter presets"
  ON filter_presets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE filter_presets IS 'Stores user-defined filter presets for transaction filtering and sorting';
COMMENT ON COLUMN filter_presets.filters IS 'JSONB object containing filter criteria (dateFrom, dateTo, categoryIds, amountMin, amountMax, walletIds, searchQuery)';
COMMENT ON COLUMN filter_presets.sort IS 'JSONB object containing sort configuration (field, order)';

-- Example filter preset structure:
-- {
--   "dateFrom": "2025-01-01",
--   "dateTo": "2025-01-31",
--   "categoryIds": ["uuid1", "uuid2"],
--   "amountMin": 100,
--   "amountMax": 1000,
--   "walletIds": ["uuid3"],
--   "searchQuery": "coffee"
-- }

-- Example sort structure:
-- {
--   "field": "date",
--   "order": "desc"
-- }
