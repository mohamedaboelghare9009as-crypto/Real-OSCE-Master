-- Run this in your Supabase SQL Editor to manually confirm the admin email
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'admin@oscemaster.com';
