-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text check (role in ('Student', 'Instructor', 'Administrator')) default 'Student',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Secure the profiles table
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Trigger to handle new user signup
create function public.handle_new_user()
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- CASES (Clinical Cases)
create table public.cases (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  specialty text not null,
  difficulty text not null,
  description text not null,
  chief_complaint text,
  vitals jsonb,
  patient_avatar text,
  tags text[],
  system_instruction text, -- The AI prompt
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Secure the cases table
alter table public.cases enable row level security;

create policy "Cases are viewable by everyone."
  on cases for select
  using ( true );

-- SESSIONS (User Practice Sessions)
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  case_id uuid references public.cases(id) not null,
  start_time timestamp with time zone default timezone('utc'::text, now()) not null,
  end_time timestamp with time zone,
  score int,
  feedback text,
  transcript jsonb, -- Store chat history
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Secure the sessions table
alter table public.sessions enable row level security;

create policy "Users can view their own sessions."
  on sessions for select
  using ( auth.uid() = user_id );

create policy "Users can create their own sessions."
  on sessions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own sessions."
  on sessions for update
  using ( auth.uid() = user_id );
