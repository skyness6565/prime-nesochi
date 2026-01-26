-- Add currency and language preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';