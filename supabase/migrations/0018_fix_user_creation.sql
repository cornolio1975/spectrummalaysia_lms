-- Add learner to user_role enum if it doesn't exist
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'learner';

-- Fix the trigger function by adding SET search_path = public
-- This prevents "Database error creating new user" which happens when the trigger fails due to schema/RLS issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;
