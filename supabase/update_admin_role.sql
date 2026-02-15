-- Run this to update the trigger function to recognize the admin email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    case 
      when new.email = 'admin@oscemaster.com' then 'Administrator'
      else coalesce(new.raw_user_meta_data->>'role', 'Student')
    end,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;
