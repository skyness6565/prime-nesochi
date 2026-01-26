-- Add new columns to profiles table for user registration details
ALTER TABLE public.profiles
ADD COLUMN username text UNIQUE,
ADD COLUMN full_name text,
ADD COLUMN country text;

-- Create index on username for faster lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);