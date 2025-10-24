-- Add new fields to goals table for enhanced functionality
alter table public.goals
  add column if not exists category text,
  add column if not exists auto_contribution_amount decimal(10, 2),
  add column if not exists auto_contribution_frequency text check (auto_contribution_frequency in ('daily', 'weekly', 'monthly')),
  add column if not exists paused boolean default false,
  add column if not exists archived boolean default false,
  add column if not exists completed_at timestamp with time zone,
  add column if not exists updated_at timestamp with time zone default now();

-- Add index for better query performance
create index if not exists idx_goals_user_status on public.goals(user_id, status);
create index if not exists idx_goals_archived on public.goals(user_id, archived);

-- Update the status check constraint to include 'paused'
alter table public.goals drop constraint if exists goals_status_check;
alter table public.goals add constraint goals_status_check check (status in ('active', 'completed', 'failed', 'paused'));

-- Create a function to update the updated_at timestamp
create or replace function update_goals_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
drop trigger if exists set_goals_updated_at on public.goals;
create trigger set_goals_updated_at
  before update on public.goals
  for each row
  execute function update_goals_updated_at();
