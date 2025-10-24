-- Phase 5: E-Wallet Integration
-- This migration adds wallet linking to transactions and automatic balance updates

-- Step 1: Add wallet_id to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS wallet_id uuid REFERENCES public.e_wallets(id) ON DELETE SET NULL;

-- Step 2: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_wallet ON public.transactions(user_id, wallet_id);

-- Step 3: Create a function to update wallet balance when transaction is added/updated/deleted
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
DECLARE
  wallet_record RECORD;
BEGIN
  -- Handle INSERT
  IF (TG_OP = 'INSERT') THEN
    IF NEW.wallet_id IS NOT NULL THEN
      -- Update wallet balance based on transaction type
      IF NEW.type = 'income' THEN
        UPDATE public.e_wallets
        SET balance = balance + NEW.amount
        WHERE id = NEW.wallet_id;
      ELSIF NEW.type = 'expense' THEN
        UPDATE public.e_wallets
        SET balance = balance - NEW.amount
        WHERE id = NEW.wallet_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF (TG_OP = 'UPDATE') THEN
    -- If wallet changed or amount changed, recalculate
    IF OLD.wallet_id IS DISTINCT FROM NEW.wallet_id OR OLD.amount != NEW.amount OR OLD.type != NEW.type THEN

      -- Revert old wallet balance
      IF OLD.wallet_id IS NOT NULL THEN
        IF OLD.type = 'income' THEN
          UPDATE public.e_wallets
          SET balance = balance - OLD.amount
          WHERE id = OLD.wallet_id;
        ELSIF OLD.type = 'expense' THEN
          UPDATE public.e_wallets
          SET balance = balance + OLD.amount
          WHERE id = OLD.wallet_id;
        END IF;
      END IF;

      -- Apply new wallet balance
      IF NEW.wallet_id IS NOT NULL THEN
        IF NEW.type = 'income' THEN
          UPDATE public.e_wallets
          SET balance = balance + NEW.amount
          WHERE id = NEW.wallet_id;
        ELSIF NEW.type = 'expense' THEN
          UPDATE public.e_wallets
          SET balance = balance - NEW.amount
          WHERE id = NEW.wallet_id;
        END IF;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF (TG_OP = 'DELETE') THEN
    IF OLD.wallet_id IS NOT NULL THEN
      -- Revert the transaction from wallet balance
      IF OLD.type = 'income' THEN
        UPDATE public.e_wallets
        SET balance = balance - OLD.amount
        WHERE id = OLD.wallet_id;
      ELSIF OLD.type = 'expense' THEN
        UPDATE public.e_wallets
        SET balance = balance + OLD.amount
        WHERE id = OLD.wallet_id;
      END IF;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to automatically update wallet balance
DROP TRIGGER IF EXISTS trigger_update_wallet_balance ON public.transactions;
CREATE TRIGGER trigger_update_wallet_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_balance();

-- Step 5: Add a special transaction type for wallet transfers
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS is_transfer boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS linked_transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_linked ON public.transactions(linked_transaction_id);

-- Step 6: Create a view for wallet transaction history
CREATE OR REPLACE VIEW wallet_transaction_history AS
SELECT
  t.id,
  t.user_id,
  t.wallet_id,
  t.type,
  t.amount,
  t.category_id,
  t.category_name,
  t.description,
  t.date,
  t.is_transfer,
  t.linked_transaction_id,
  t.created_at,
  ew.wallet_type,
  ew.account_name,
  -- Calculate running balance (this is an approximation - actual balance should be tracked in e_wallets table)
  ew.balance as current_wallet_balance
FROM
  public.transactions t
  LEFT JOIN public.e_wallets ew ON t.wallet_id = ew.id
ORDER BY
  t.date DESC, t.created_at DESC;

-- Step 7: Grant necessary permissions for the view
GRANT SELECT ON wallet_transaction_history TO authenticated;

-- Step 8: Add RLS policy for the view (inherits from base tables)
-- Views inherit RLS from base tables, so no additional policy needed

-- Step 9: Create a helper function to create wallet transfers
CREATE OR REPLACE FUNCTION create_wallet_transfer(
  p_user_id uuid,
  p_from_wallet_id uuid,
  p_to_wallet_id uuid,
  p_amount decimal,
  p_description text,
  p_date date
)
RETURNS TABLE(from_transaction_id uuid, to_transaction_id uuid) AS $$
DECLARE
  v_from_tx_id uuid;
  v_to_tx_id uuid;
BEGIN
  -- Create the "from" transaction (expense from source wallet)
  INSERT INTO public.transactions (
    user_id, wallet_id, type, amount, description, date, is_transfer
  ) VALUES (
    p_user_id, p_from_wallet_id, 'expense', p_amount,
    COALESCE(p_description, 'Transfer to wallet'), p_date, true
  ) RETURNING id INTO v_from_tx_id;

  -- Create the "to" transaction (income to destination wallet)
  INSERT INTO public.transactions (
    user_id, wallet_id, type, amount, description, date, is_transfer, linked_transaction_id
  ) VALUES (
    p_user_id, p_to_wallet_id, 'income', p_amount,
    COALESCE(p_description, 'Transfer from wallet'), p_date, true, v_from_tx_id
  ) RETURNING id INTO v_to_tx_id;

  -- Link the first transaction to the second
  UPDATE public.transactions
  SET linked_transaction_id = v_to_tx_id
  WHERE id = v_from_tx_id;

  RETURN QUERY SELECT v_from_tx_id, v_to_tx_id;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Create a function to recalculate wallet balance from all transactions
-- Useful for fixing any discrepancies
CREATE OR REPLACE FUNCTION recalculate_wallet_balance(p_wallet_id uuid)
RETURNS decimal AS $$
DECLARE
  v_total_income decimal;
  v_total_expense decimal;
  v_new_balance decimal;
BEGIN
  -- Calculate total income for this wallet
  SELECT COALESCE(SUM(amount), 0) INTO v_total_income
  FROM public.transactions
  WHERE wallet_id = p_wallet_id AND type = 'income';

  -- Calculate total expenses for this wallet
  SELECT COALESCE(SUM(amount), 0) INTO v_total_expense
  FROM public.transactions
  WHERE wallet_id = p_wallet_id AND type = 'expense';

  -- Calculate new balance
  v_new_balance := v_total_income - v_total_expense;

  -- Update wallet balance
  UPDATE public.e_wallets
  SET balance = v_new_balance
  WHERE id = p_wallet_id;

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create a view for wallet balance over time
CREATE OR REPLACE VIEW wallet_balance_history AS
SELECT
  t.wallet_id,
  t.date,
  t.user_id,
  SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END)
    OVER (PARTITION BY t.wallet_id ORDER BY t.date, t.created_at) as balance_at_date,
  t.type,
  t.amount,
  t.description,
  t.created_at
FROM
  public.transactions t
WHERE
  t.wallet_id IS NOT NULL
ORDER BY
  t.wallet_id, t.date DESC, t.created_at DESC;

GRANT SELECT ON wallet_balance_history TO authenticated;

-- Migration complete!
-- To use:
-- 1. Run this script on your Supabase database
-- 2. Update TypeScript types to include wallet_id
-- 3. Update UI components to select wallet for transactions
-- 4. Implement Cash In/Out and Transfer features in the UI
