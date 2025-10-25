-- Phase 7: Bill Reminders Implementation
-- This migration adds bill tracking and reminder functionality

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue', 'scheduled')),

    -- Recurrence settings (similar to recurring transactions)
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'biweekly', 'monthly', 'yearly')),
    recurrence_end_date DATE,

    -- Reminder settings
    reminder_days_before INTEGER DEFAULT 3 CHECK (reminder_days_before >= 0 AND reminder_days_before <= 30),
    reminder_enabled BOOLEAN DEFAULT true,

    -- Auto-payment settings
    auto_pay_enabled BOOLEAN DEFAULT false,
    wallet_id UUID REFERENCES e_wallets(id) ON DELETE SET NULL,

    -- Matching and tracking
    linked_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    last_paid_date DATE,
    payment_count INTEGER DEFAULT 0,

    -- Notes and metadata
    notes TEXT,
    merchant_name TEXT, -- For smart matching

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_user_status ON bills(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bills_user_due_date ON bills(user_id, due_date);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_bills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bills_updated_at_trigger
    BEFORE UPDATE ON bills
    FOR EACH ROW
    EXECUTE FUNCTION update_bills_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bills
CREATE POLICY bills_select_policy ON bills
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own bills
CREATE POLICY bills_insert_policy ON bills
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own bills
CREATE POLICY bills_update_policy ON bills
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own bills
CREATE POLICY bills_delete_policy ON bills
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create view for upcoming bills with analytics
CREATE OR REPLACE VIEW upcoming_bills_view AS
SELECT
    b.id,
    b.user_id,
    b.name,
    b.amount,
    b.due_date,
    b.category_id,
    c.name as category_name,
    c.icon as category_icon,
    c.color as category_color,
    b.status,
    b.is_recurring,
    b.recurrence_pattern,
    b.reminder_days_before,
    b.reminder_enabled,
    b.merchant_name,
    b.notes,
    b.wallet_id,
    b.linked_transaction_id,
    b.last_paid_date,
    b.payment_count,
    -- Calculate days until due
    (b.due_date - CURRENT_DATE) as days_until_due,
    -- Calculate reminder date
    (b.due_date - b.reminder_days_before) as reminder_date,
    -- Check if reminder should be shown
    CASE
        WHEN b.reminder_enabled AND CURRENT_DATE >= (b.due_date - b.reminder_days_before) AND b.status = 'unpaid'
        THEN true
        ELSE false
    END as should_show_reminder,
    -- Check if overdue
    CASE
        WHEN b.due_date < CURRENT_DATE AND b.status = 'unpaid'
        THEN true
        ELSE false
    END as is_overdue,
    b.created_at,
    b.updated_at
FROM bills b
LEFT JOIN categories c ON b.category_id = c.id
WHERE b.status IN ('unpaid', 'scheduled');

-- Create view for bill analytics
CREATE OR REPLACE VIEW bill_analytics_view AS
SELECT
    b.user_id,
    -- Monthly totals
    COUNT(CASE WHEN b.is_recurring = true AND b.recurrence_pattern = 'monthly' THEN 1 END) as monthly_bills_count,
    COALESCE(SUM(CASE WHEN b.is_recurring = true AND b.recurrence_pattern = 'monthly' THEN b.amount END), 0) as monthly_bills_total,
    -- Yearly totals
    COUNT(CASE WHEN b.is_recurring = true THEN 1 END) as recurring_bills_count,
    -- Payment statistics
    COUNT(CASE WHEN b.status = 'paid' THEN 1 END) as paid_count,
    COUNT(CASE WHEN b.status = 'unpaid' THEN 1 END) as unpaid_count,
    COUNT(CASE WHEN b.status = 'overdue' THEN 1 END) as overdue_count,
    -- Most expensive bill
    MAX(b.amount) as max_bill_amount,
    (SELECT name FROM bills WHERE user_id = b.user_id AND amount = MAX(b.amount) LIMIT 1) as most_expensive_bill,
    -- On-time payment rate
    CASE
        WHEN COUNT(*) > 0 THEN
            ROUND((COUNT(CASE WHEN b.status = 'paid' AND b.last_paid_date <= b.due_date THEN 1 END)::DECIMAL /
                   NULLIF(COUNT(CASE WHEN b.status = 'paid' THEN 1 END), 0)) * 100, 2)
        ELSE 0
    END as on_time_payment_rate
FROM bills b
GROUP BY b.user_id;

-- Function to automatically update bill status to overdue
CREATE OR REPLACE FUNCTION update_overdue_bills()
RETURNS void AS $$
BEGIN
    UPDATE bills
    SET status = 'overdue'
    WHERE status = 'unpaid'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to mark bill as paid and link to transaction
CREATE OR REPLACE FUNCTION mark_bill_as_paid(
    p_bill_id UUID,
    p_transaction_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    UPDATE bills
    SET
        status = 'paid',
        linked_transaction_id = p_transaction_id,
        last_paid_date = CURRENT_DATE,
        payment_count = payment_count + 1
    WHERE id = p_bill_id;

    -- If recurring, create next occurrence
    IF (SELECT is_recurring FROM bills WHERE id = p_bill_id) = true THEN
        INSERT INTO bills (
            user_id,
            name,
            amount,
            due_date,
            category_id,
            status,
            is_recurring,
            recurrence_pattern,
            recurrence_end_date,
            reminder_days_before,
            reminder_enabled,
            auto_pay_enabled,
            wallet_id,
            notes,
            merchant_name
        )
        SELECT
            user_id,
            name,
            amount,
            -- Calculate next due date based on pattern
            CASE recurrence_pattern
                WHEN 'daily' THEN due_date + INTERVAL '1 day'
                WHEN 'weekly' THEN due_date + INTERVAL '1 week'
                WHEN 'biweekly' THEN due_date + INTERVAL '2 weeks'
                WHEN 'monthly' THEN due_date + INTERVAL '1 month'
                WHEN 'yearly' THEN due_date + INTERVAL '1 year'
            END,
            category_id,
            'unpaid',
            is_recurring,
            recurrence_pattern,
            recurrence_end_date,
            reminder_days_before,
            reminder_enabled,
            auto_pay_enabled,
            wallet_id,
            notes,
            merchant_name
        FROM bills
        WHERE id = p_bill_id
        AND (recurrence_end_date IS NULL OR
             CASE recurrence_pattern
                WHEN 'daily' THEN due_date + INTERVAL '1 day'
                WHEN 'weekly' THEN due_date + INTERVAL '1 week'
                WHEN 'biweekly' THEN due_date + INTERVAL '2 weeks'
                WHEN 'monthly' THEN due_date + INTERVAL '1 month'
                WHEN 'yearly' THEN due_date + INTERVAL '1 year'
             END <= recurrence_end_date);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function for smart bill-transaction matching
-- Returns confidence score (0-100) for matching a transaction to a bill
CREATE OR REPLACE FUNCTION calculate_bill_match_score(
    p_bill_id UUID,
    p_transaction_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER := 0;
    v_bill_amount DECIMAL;
    v_transaction_amount DECIMAL;
    v_bill_category UUID;
    v_transaction_category UUID;
    v_bill_due_date DATE;
    v_transaction_date DATE;
    v_bill_merchant TEXT;
    v_transaction_description TEXT;
    v_amount_diff DECIMAL;
    v_date_diff INTEGER;
BEGIN
    -- Get bill details
    SELECT amount, category_id, due_date, merchant_name
    INTO v_bill_amount, v_bill_category, v_bill_due_date, v_bill_merchant
    FROM bills WHERE id = p_bill_id;

    -- Get transaction details
    SELECT amount, category_id, date::DATE, description
    INTO v_transaction_amount, v_transaction_category, v_transaction_date, v_transaction_description
    FROM transactions WHERE id = p_transaction_id;

    -- Amount matching (max 40 points)
    v_amount_diff := ABS(v_bill_amount - v_transaction_amount);
    IF v_amount_diff = 0 THEN
        v_score := v_score + 40;
    ELSIF v_amount_diff <= 10 THEN
        v_score := v_score + 30;
    ELSIF v_amount_diff <= 50 THEN
        v_score := v_score + 20;
    ELSIF v_amount_diff <= 100 THEN
        v_score := v_score + 10;
    END IF;

    -- Category matching (max 25 points)
    IF v_bill_category IS NOT NULL AND v_transaction_category IS NOT NULL THEN
        IF v_bill_category = v_transaction_category THEN
            v_score := v_score + 25;
        END IF;
    END IF;

    -- Date proximity (max 25 points)
    v_date_diff := ABS(v_bill_due_date - v_transaction_date);
    IF v_date_diff = 0 THEN
        v_score := v_score + 25;
    ELSIF v_date_diff <= 3 THEN
        v_score := v_score + 20;
    ELSIF v_date_diff <= 7 THEN
        v_score := v_score + 15;
    ELSIF v_date_diff <= 14 THEN
        v_score := v_score + 10;
    END IF;

    -- Merchant/description matching (max 10 points)
    IF v_bill_merchant IS NOT NULL AND v_transaction_description IS NOT NULL THEN
        IF LOWER(v_transaction_description) LIKE '%' || LOWER(v_bill_merchant) || '%' THEN
            v_score := v_score + 10;
        ELSIF LOWER(v_bill_merchant) LIKE '%' || LOWER(v_transaction_description) || '%' THEN
            v_score := v_score + 5;
        END IF;
    END IF;

    RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Add comment to table
COMMENT ON TABLE bills IS 'Stores bill reminders and payment tracking information';
COMMENT ON COLUMN bills.reminder_days_before IS 'Number of days before due date to show reminder (0-30)';
COMMENT ON COLUMN bills.payment_count IS 'Total number of times this bill has been paid';
COMMENT ON FUNCTION calculate_bill_match_score IS 'Calculates confidence score (0-100) for matching transaction to bill. >70 = high confidence, 50-70 = medium, <50 = low';
