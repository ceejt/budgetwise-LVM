# E-Wallet Integration - Quick Start Guide

## ✅ Implementation Complete

Phase 5 e-wallet integration has been successfully implemented. Your BudgetWise app now has full wallet functionality!

---

## 🚀 What's New

### 1. **Link Transactions to Wallets**
- Every transaction can now be associated with a specific wallet (GCash, Maya, etc.)
- Wallet selector appears in the add transaction dialog
- Primary wallet is automatically selected as default

### 2. **Cash In/Out Buttons Now Work**
- Click "Cash In" to add money to your wallet
- Click "Cash Out" to withdraw money from your wallet
- Both create real transactions and update balances automatically

### 3. **Transfer Between Wallets**
- Move money between your GCash and Maya wallets
- Creates linked transactions for complete tracking
- Shows balance preview before confirming

### 4. **Automatic Balance Updates**
- Wallet balances update automatically when you:
  - Add income or expenses
  - Edit transaction amounts
  - Delete transactions
  - Make transfers

---

## 📦 Setup Instructions

### Step 1: Run Database Migration

You need to run the database migration to add wallet support to your transactions table.

**Option A: Via Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `scripts/006_add_wallet_integration.sql`
5. Paste and click "Run"

**Option B: Via Command Line**
```bash
psql -h db.your-project-ref.supabase.co -U postgres -d postgres -f scripts/006_add_wallet_integration.sql
```

### Step 2: Verify Setup

Run this query in Supabase SQL Editor to verify everything is set up:

```sql
-- Check if wallet_id column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'transactions' AND column_name = 'wallet_id';

-- Check if trigger exists
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_wallet_balance';
```

If both queries return results, you're good to go! ✅

### Step 3: Start Using

No code changes needed! The feature is fully backward compatible.

---

## 🎯 How to Use

### Linking Transactions to Wallets

1. Click "Add Items" in Expenses or Income section
2. Fill in amount, category, and description
3. **New:** Select a wallet from the "E-Wallet (Optional)" dropdown
4. Submit - the wallet balance will update automatically

### Using Cash In/Out

1. Go to the **Summary** section
2. Find the **E-Wallet** card
3. Click **"Cash In"** to add money or **"Cash Out"** to withdraw
4. Enter amount and optional description
5. Submit - balance updates instantly

### Transferring Between Wallets

1. Make sure you have at least 2 wallets set up
2. Go to the **Summary** section
3. Click **"Transfer"** button (appears when you have 2+ wallets)
4. Select source wallet (where money comes from)
5. Select destination wallet (where money goes to)
6. Enter amount
7. Review the summary showing both wallet balances after transfer
8. Submit - both wallets update automatically

---

## 📊 New Features Available

### Wallet Operations API

```typescript
import {
  cashIn,
  cashOut,
  transferBetweenWallets,
  getWalletTransactions,
  getWalletBalanceHistory,
  recalculateWalletBalance
} from "@/lib/utils/wallet-operations"

// Add money to wallet
await cashIn({
  userId: user.id,
  walletId: wallet.id,
  amount: 5000,
  description: "Salary"
})

// Transfer between wallets
await transferBetweenWallets({
  userId: user.id,
  fromWalletId: gcash.id,
  toWalletId: maya.id,
  amount: 1000
})

// Get wallet transaction history
const transactions = await getWalletTransactions(user.id, wallet.id)

// Get balance over time
const history = await getWalletBalanceHistory(user.id, wallet.id)
```

### Database Functions

```sql
-- Create a wallet transfer
SELECT create_wallet_transfer(
  'user-id',
  'from-wallet-id',
  'to-wallet-id',
  1000.00,
  'Transfer description',
  '2025-01-15'
);

-- Recalculate wallet balance (if needed)
SELECT recalculate_wallet_balance('wallet-id');
```

### Database Views

```sql
-- View wallet transaction history
SELECT * FROM wallet_transaction_history
WHERE user_id = 'your-user-id' AND wallet_id = 'your-wallet-id';

-- View wallet balance over time
SELECT * FROM wallet_balance_history
WHERE wallet_id = 'your-wallet-id'
ORDER BY date DESC;
```

---

## 🔧 Troubleshooting

### Balance Seems Incorrect?

Use the recalculate function to fix it:

```typescript
import { recalculateWalletBalance } from "@/lib/utils/wallet-operations"

const correctBalance = await recalculateWalletBalance(walletId)
console.log(`Corrected balance: ₱${correctBalance}`)
```

### Wallet Selector Not Showing?

Make sure you have at least one wallet set up:
1. Go to Summary section
2. Look for the E-Wallet card
3. Click "Add Wallet" if you don't have any

### Transfer Button Not Visible?

You need at least 2 wallets to enable transfers:
1. Add a second wallet (GCash and Maya, for example)
2. The Transfer button will appear automatically

---

## 📁 Files Reference

### Created Files
- `scripts/006_add_wallet_integration.sql` - Database migration
- `lib/utils/wallet-operations.ts` - Wallet utility functions
- `components/dashboard/cash-in-out-dialog.tsx` - Cash In/Out UI
- `components/dashboard/wallet-transfer-dialog.tsx` - Transfer UI
- `md/PHASE5_EWALLET_INTEGRATION.md` - Full documentation

### Modified Files
- `lib/types.ts` - Added wallet fields to Transaction type
- `components/dashboard/add-transaction-dialog.tsx` - Added wallet selector
- `components/dashboard/summary-section.tsx` - Integrated dialogs

---

## 🎓 Learn More

For detailed technical documentation, see:
- **Full Documentation:** `md/PHASE5_EWALLET_INTEGRATION.md`
- **API Reference:** Wallet operations utility functions
- **Database Schema:** Migration script with detailed comments
- **Testing Guide:** Manual testing checklist included in docs

---

## ✨ What's Next?

Optional future enhancements you can implement:

1. **Wallet Transaction History Page** - Dedicated view for each wallet
2. **Wallet Goals Integration** - Link savings goals to specific wallets
3. **Transfer Fees Support** - Add fee calculation for transfers
4. **Recurring Transfers** - Schedule automatic wallet-to-wallet transfers
5. **Wallet Reconciliation** - Compare app balance with actual balance
6. **Low Balance Alerts** - Notifications when wallet is running low

---

## 🐛 Issues or Questions?

Check the full documentation in `md/PHASE5_EWALLET_INTEGRATION.md` for:
- Detailed feature descriptions
- Complete API reference
- Testing guide
- Edge cases and how they're handled
- Performance and security considerations

---

**Status:** ✅ Production Ready
**Version:** Phase 5 Complete
**Date:** 2025-10-24

Enjoy your fully functional e-wallet integration! 🎉
