-- Create user profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  user_type text not null check (user_type in ('student', 'general')),
  university_email text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text,
  budget_amount decimal(10, 2) default 0,
  color text,
  created_at timestamp with time zone default now()
);

-- Create transactions table (for income and expenses)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount decimal(10, 2) not null,
  category_id uuid references public.categories(id) on delete set null,
  category_name text,
  description text,
  date date not null,
  created_at timestamp with time zone default now()
);

-- Create goals table
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('weekly', 'monthly', 'custom')),
  target_amount decimal(10, 2) not null,
  current_amount decimal(10, 2) default 0,
  start_date date not null,
  end_date date not null,
  status text default 'active' check (status in ('active', 'completed', 'failed')),
  created_at timestamp with time zone default now()
);

-- Create financial tips table
create table if not exists public.financial_tips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tip_text text not null,
  tip_type text not null check (tip_type in ('saving', 'spending', 'income', 'general')),
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- Create e-wallets table
create table if not exists public.e_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_type text not null check (wallet_type in ('gcash', 'maya', 'other')),
  account_number text not null,
  account_name text,
  balance decimal(10, 2) default 0,
  is_primary boolean default false,
  created_at timestamp with time zone default now()
);

-- Create user preferences table
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  theme text default 'light' check (theme in ('light', 'dark')),
  currency text default 'PHP',
  tip_frequency text default 'daily' check (tip_frequency in ('daily', 'weekly', 'never')),
  notifications_enabled boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.financial_tips enable row level security;
alter table public.e_wallets enable row level security;
alter table public.user_preferences enable row level security;

-- Create RLS policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create RLS policies for categories
create policy "Users can view own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Create RLS policies for transactions
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Create RLS policies for goals
create policy "Users can view own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- Create RLS policies for financial tips
create policy "Users can view own tips"
  on public.financial_tips for select
  using (auth.uid() = user_id);

create policy "Users can insert own tips"
  on public.financial_tips for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tips"
  on public.financial_tips for update
  using (auth.uid() = user_id);

create policy "Users can delete own tips"
  on public.financial_tips for delete
  using (auth.uid() = user_id);

-- Create RLS policies for e-wallets
create policy "Users can view own wallets"
  on public.e_wallets for select
  using (auth.uid() = user_id);

create policy "Users can insert own wallets"
  on public.e_wallets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own wallets"
  on public.e_wallets for update
  using (auth.uid() = user_id);

create policy "Users can delete own wallets"
  on public.e_wallets for delete
  using (auth.uid() = user_id);

-- Create RLS policies for user preferences
create policy "Users can view own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);
