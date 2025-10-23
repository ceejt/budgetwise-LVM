-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Create profile
  insert into public.profiles (id, email, full_name, user_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'user_type', 'general')
  );

  -- Create default preferences
  insert into public.user_preferences (user_id)
  values (new.id);

  -- Create default categories for students
  if (new.raw_user_meta_data ->> 'user_type' = 'student') then
    insert into public.categories (user_id, name, icon, budget_amount, color)
    values
      (new.id, 'Food', '🍔', 0, '#72ADFD'),
      (new.id, 'Transportation', '🚗', 0, '#293F55'),
      (new.id, 'School Supplies', '📚', 0, '#72ADFD'),
      (new.id, 'Entertainment', '🎮', 0, '#293F55');
  else
    insert into public.categories (user_id, name, icon, budget_amount, color)
    values
      (new.id, 'Food', '🍔', 0, '#72ADFD'),
      (new.id, 'Transportation', '🚗', 0, '#293F55'),
      (new.id, 'Bills', '💡', 0, '#72ADFD'),
      (new.id, 'Entertainment', '🎮', 0, '#293F55');
  end if;

  return new;
end;
$$;

-- Create trigger
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
