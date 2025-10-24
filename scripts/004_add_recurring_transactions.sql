-- Add recurring transaction fields to transactions table
-- This migration adds support for recurring transactions

-- Add new columns to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_pattern text CHECK (recurrence_pattern IN ('daily', 'weekly', 'biweekly', 'monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS recurrence_end_date date,
ADD COLUMN IF NOT EXISTS parent_transaction_id uuid REFERENCES public.transactions(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS next_occurrence_date date,
ADD COLUMN IF NOT EXISTS recurrence_enabled boolean DEFAULT true;

-- Create index for better query performance on recurring transactions
CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON public.transactions(is_recurring, recurrence_enabled) WHERE is_recurring = true;
CREATE INDEX IF NOT EXISTS idx_transactions_parent ON public.transactions(parent_transaction_id) WHERE parent_transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_next_occurrence ON public.transactions(next_occurrence_date) WHERE next_occurrence_date IS NOT NULL;

-- Create a view for active recurring templates (parent transactions)
CREATE OR REPLACE VIEW recurring_transaction_templates AS
SELECT
  t.*,
  COUNT(child.id) as occurrence_count,
  MAX(child.date) as last_occurrence_date
FROM public.transactions t
LEFT JOIN public.transactions child ON child.parent_transaction_id = t.id
WHERE t.is_recurring = true
  AND t.is_template = true
  AND t.recurrence_enabled = true
GROUP BY t.id;

-- Create a function to calculate next occurrence date
CREATE OR REPLACE FUNCTION calculate_next_occurrence(
  p_current_date date,
  p_pattern text
) RETURNS date AS $$
BEGIN
  CASE p_pattern
    WHEN 'daily' THEN
      RETURN p_current_date + INTERVAL '1 day';
    WHEN 'weekly' THEN
      RETURN p_current_date + INTERVAL '1 week';
    WHEN 'biweekly' THEN
      RETURN p_current_date + INTERVAL '2 weeks';
    WHEN 'monthly' THEN
      RETURN p_current_date + INTERVAL '1 month';
    WHEN 'yearly' THEN
      RETURN p_current_date + INTERVAL '1 year';
    ELSE
      RETURN NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a function to generate next occurrence transaction
CREATE OR REPLACE FUNCTION generate_recurring_transaction(
  p_template_id uuid
) RETURNS uuid AS $$
DECLARE
  v_template RECORD;
  v_new_transaction_id uuid;
  v_next_date date;
BEGIN
  -- Get the template transaction
  SELECT * INTO v_template
  FROM public.transactions
  WHERE id = p_template_id
    AND is_recurring = true
    AND is_template = true
    AND recurrence_enabled = true;

  -- Check if template exists
  IF v_template IS NULL THEN
    RAISE EXCEPTION 'Recurring template not found or disabled: %', p_template_id;
  END IF;

  -- Check if we should create next occurrence
  IF v_template.next_occurrence_date IS NULL OR v_template.next_occurrence_date > CURRENT_DATE THEN
    RETURN NULL;
  END IF;

  -- Check if end date has passed
  IF v_template.recurrence_end_date IS NOT NULL AND v_template.recurrence_end_date < CURRENT_DATE THEN
    -- Disable the recurring transaction
    UPDATE public.transactions
    SET recurrence_enabled = false
    WHERE id = p_template_id;
    RETURN NULL;
  END IF;

  -- Create the new transaction occurrence
  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    category_id,
    category_name,
    description,
    date,
    is_recurring,
    parent_transaction_id
  ) VALUES (
    v_template.user_id,
    v_template.type,
    v_template.amount,
    v_template.category_id,
    v_template.category_name,
    v_template.description,
    v_template.next_occurrence_date,
    false, -- Occurrences are not recurring themselves
    p_template_id
  )
  RETURNING id INTO v_new_transaction_id;

  -- Calculate and update next occurrence date
  v_next_date := calculate_next_occurrence(
    v_template.next_occurrence_date,
    v_template.recurrence_pattern
  );

  UPDATE public.transactions
  SET next_occurrence_date = v_next_date
  WHERE id = p_template_id;

  RETURN v_new_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to process all due recurring transactions
CREATE OR REPLACE FUNCTION process_due_recurring_transactions()
RETURNS TABLE(template_id uuid, new_transaction_id uuid) AS $$
DECLARE
  v_template RECORD;
  v_new_id uuid;
BEGIN
  -- Loop through all templates that are due
  FOR v_template IN
    SELECT id
    FROM public.transactions
    WHERE is_recurring = true
      AND is_template = true
      AND recurrence_enabled = true
      AND next_occurrence_date IS NOT NULL
      AND next_occurrence_date <= CURRENT_DATE
      AND (recurrence_end_date IS NULL OR recurrence_end_date >= CURRENT_DATE)
  LOOP
    -- Generate the recurring transaction
    v_new_id := generate_recurring_transaction(v_template.id);

    IF v_new_id IS NOT NULL THEN
      template_id := v_template.id;
      new_transaction_id := v_new_id;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add comment to explain the schema
COMMENT ON COLUMN public.transactions.is_recurring IS 'Indicates if this transaction is part of a recurring series';
COMMENT ON COLUMN public.transactions.recurrence_pattern IS 'Pattern for recurrence: daily, weekly, biweekly, monthly, yearly';
COMMENT ON COLUMN public.transactions.recurrence_end_date IS 'Date when recurring series should end (NULL for indefinite)';
COMMENT ON COLUMN public.transactions.parent_transaction_id IS 'Reference to the template transaction if this is an occurrence';
COMMENT ON COLUMN public.transactions.is_template IS 'True if this is the template/parent transaction for a recurring series';
COMMENT ON COLUMN public.transactions.next_occurrence_date IS 'Date when the next occurrence should be generated';
COMMENT ON COLUMN public.transactions.recurrence_enabled IS 'Whether the recurring series is active (can be paused)';
